
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
}: TranscriptProcessingProps) => {
  const { processTranscript, logger } = useProcessingWorkflow({
    setStatus,
    setTranscriptionEntries,
    setError,
    stopSpeechRecognition,
    startSpeechRecognition,
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
      currentLength: currentTranscript.length
    });

    const handleProcessing = async () => {
      setLastProcessedTranscript(currentTranscript);
      await processTranscript(currentTranscript);
    };

    // Increased debounce time for more stable processing
    const timeoutId = setTimeout(handleProcessing, 2000);
    return () => {
      console.log('Clearing translation timeout');
      clearTimeout(timeoutId);
    };
  }, [transcript, status, lastProcessedTranscript, setLastProcessedTranscript, processTranscript]);

  return { logger };
};
