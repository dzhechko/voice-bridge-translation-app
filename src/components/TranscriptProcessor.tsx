
import { useEffect, useCallback } from 'react';
import { RecordingStatus } from '@/components/RecordingControls';
import { TranscriptionEntry } from '@/components/TranscriptionDisplay';
import { useTranslationService } from '@/hooks/useTranslationService';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLogger } from '@/hooks/useLogger';

interface TranscriptProcessorProps {
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

export const useTranscriptProcessor = ({
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
}: TranscriptProcessorProps) => {
  const translationService = useTranslationService();
  const speechSynthesis = useSpeechSynthesis();
  const logger = useLogger();

  // Handle transcript changes and trigger translation
  useEffect(() => {
    console.log('=== TRANSCRIPT PROCESSOR EFFECT ===', {
      transcript: transcript?.substring(0, 50) + '...',
      transcriptLength: transcript?.length || 0,
      status,
      isListening,
      lastProcessedLength: lastProcessedTranscript?.length || 0
    });

    // Only process if we have a transcript and we're in recording mode
    if (!transcript || status !== 'recording') {
      console.log('Skipping processing:', { 
        hasTranscript: !!transcript, 
        status, 
        isListening,
        reason: !transcript ? 'no transcript' : 
                status !== 'recording' ? 'status not recording' : 'unknown'
      });
      return;
    }

    const currentTranscript = transcript.trim();
    
    // More sophisticated duplicate detection
    if (currentTranscript === lastProcessedTranscript || 
        currentTranscript.length < 10 ||
        (currentTranscript.startsWith(lastProcessedTranscript) &&
        currentTranscript.length - lastProcessedTranscript.length < 5)) {
      console.log('Skipping duplicate or insufficient transcript:', {
        current: currentTranscript.substring(0, 30),
        last: lastProcessedTranscript.substring(0, 30),
        currentLength: currentTranscript.length,
        difference: currentTranscript.length - lastProcessedTranscript.length
      });
      return;
    }

    const processTranscript = async () => {
      try {
        console.log('=== STARTING TRANSLATION PROCESS ===');
        console.log('Text to translate:', currentTranscript);
        
        setStatus('translating');
        setLastProcessedTranscript(currentTranscript);
        logger.log('info', 'Starting translation', { text: currentTranscript });

        const result = await translationService.translateText(currentTranscript);
        console.log('Translation completed:', {
          original: result.originalText.substring(0, 50),
          translated: result.translatedText.substring(0, 50)
        });
        
        const entry: TranscriptionEntry = {
          id: Date.now().toString(),
          original: result.originalText,
          translated: result.translatedText,
          timestamp: new Date(),
        };

        setTranscriptionEntries(prev => {
          console.log('Adding new transcription entry');
          return [...prev, entry];
        });

        console.log('=== STARTING SPEECH SYNTHESIS ===');
        console.log('Text to speak:', result.translatedText);
        setStatus('playing');
        logger.log('info', 'Playing translation', { translation: result.translatedText });
        
        // Stop speech recognition before speaking
        console.log('Stopping speech recognition for synthesis...');
        stopSpeechRecognition();
        
        await speechSynthesis.speak(
          result.translatedText,
          () => {
            console.log('Speech synthesis started callback');
          },
          () => {
            console.log('Speech synthesis ended callback');
          }
        );
        
        console.log('Speech synthesis completed');
        
        // Restart speech recognition after speech synthesis
        console.log('Restarting speech recognition...');
        try {
          await startSpeechRecognition();
          setStatus('recording');
          console.log('Speech recognition restarted successfully');
        } catch (restartError) {
          console.error('Failed to restart speech recognition:', restartError);
          setStatus('idle');
          setError('Failed to restart speech recognition');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Translation failed';
        console.error('Translation/speech error:', errorMessage);
        setError(errorMessage);
        logger.log('error', 'Translation failed', { error: errorMessage });
        
        // Return to recording state if still supposed to be listening
        setStatus('recording');
      }
    };

    // Increased debounce time for more stable processing
    const timeoutId = setTimeout(processTranscript, 2000);
    return () => {
      console.log('Clearing translation timeout');
      clearTimeout(timeoutId);
    };
  }, [transcript, status, translationService, speechSynthesis, logger, lastProcessedTranscript, setLastProcessedTranscript, setStatus, setTranscriptionEntries, setError, stopSpeechRecognition, startSpeechRecognition]);

  return { logger };
};
