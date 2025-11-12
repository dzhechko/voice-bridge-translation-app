
import { useEffect } from 'react';
import { RecordingStatus } from '@/components/RecordingControls';
import { TranscriptionEntry } from '@/components/TranscriptionDisplay';
import { validateTranscript } from '@/utils/transcriptValidation';
import { useProcessingWorkflow } from '@/hooks/useProcessingWorkflow';

interface TranscriptProcessingProps {
  transcript: string;
  isListening: boolean;
  status: RecordingStatus;
  lastProcessedTranscript: string;
  setLastProcessedTranscript: (text: string) => void;
  setStatus: (status: RecordingStatus) => void;
  setTranscriptionEntries: React.Dispatch<React.SetStateAction<TranscriptionEntry[]>>;
  setError: (error: string | null) => void;
  stopSpeechRecognition: () => void;
  startSpeechRecognition: () => Promise<void>;
  shouldStopRef: React.MutableRefObject<boolean>;
}

export const useTranscriptProcessing = ({
  transcript,
  isListening,
  status,
  lastProcessedTranscript,
  setLastProcessedTranscript,
  setStatus,
  setTranscriptionEntries,
  setError,
  stopSpeechRecognition,
  startSpeechRecognition,
  shouldStopRef,
}: TranscriptProcessingProps) => {
  const { processTranscript, logger } = useProcessingWorkflow({
    setStatus,
    setTranscriptionEntries,
    setError,
    stopSpeechRecognition,
    startSpeechRecognition,
    shouldStopRef,
  });

  // Handle transcript changes and trigger translation
  useEffect(() => {
    console.log('=== TRANSCRIPT PROCESSOR EFFECT ===', {
      transcript: transcript?.substring(0, 50) + '...',
      transcriptLength: transcript?.length || 0,
      status,
      isListening,
      lastProcessedLength: lastProcessedTranscript?.length || 0
    });

    const validation = validateTranscript(transcript, lastProcessedTranscript, status);
    
    if (!validation.isValid) {
      console.log('Skipping processing:', { 
        hasTranscript: !!transcript, 
        status, 
        isListening,
        reason: validation.reason,
        ...(validation.currentLength && { 
          currentLength: validation.currentLength,
          difference: validation.difference 
        })
      });
      return;
    }

    const currentTranscript = transcript.trim();
    
    console.log('Processing transcript:', {
      current: currentTranscript.substring(0, 30),
      last: lastProcessedTranscript.substring(0, 30),
      currentLength: currentTranscript.length,
      difference: validation.difference
    });

    const handleProcessing = async () => {
      // Update the last processed transcript before processing
      setLastProcessedTranscript(currentTranscript);
      
      try {
        await processTranscript(currentTranscript);
      } catch (error) {
        console.error('Error processing transcript:', error);
        // Don't reset lastProcessedTranscript on error to avoid reprocessing
      }
    };

    // Shorter debounce for better responsiveness, but still prevent spam
    const timeoutId = setTimeout(handleProcessing, 1500);
    return () => {
      console.log('Clearing translation timeout');
      clearTimeout(timeoutId);
    };
  }, [transcript, status, lastProcessedTranscript, setLastProcessedTranscript, processTranscript]);

  return { logger };
};
