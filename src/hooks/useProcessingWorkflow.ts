
import { useCallback } from 'react';
import { RecordingStatus } from '@/components/RecordingControls';
import { TranscriptionEntry } from '@/components/TranscriptionDisplay';
import { useTranslationService } from '@/hooks/useTranslationService';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLogger } from '@/hooks/useLogger';

interface ProcessingWorkflowProps {
  setStatus: (status: RecordingStatus) => void;
  setTranscriptionEntries: React.Dispatch<React.SetStateAction<TranscriptionEntry[]>>;
  setError: (error: string | null) => void;
  stopSpeechRecognition: () => void;
  startSpeechRecognition: () => Promise<void>;
}

export const useProcessingWorkflow = ({
  setStatus,
  setTranscriptionEntries,
  setError,
  stopSpeechRecognition,
  startSpeechRecognition,
}: ProcessingWorkflowProps) => {
  const translationService = useTranslationService();
  const speechSynthesis = useSpeechSynthesis();
  const logger = useLogger();

  const processTranscript = useCallback(async (currentTranscript: string) => {
    try {
      console.log('=== STARTING TRANSLATION PROCESS ===');
      console.log('Text to translate:', currentTranscript);
      
      setStatus('translating');
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
      
      // Check current status to decide if we should restart
      // Use a more reliable method to check if we should continue
      const shouldContinue = document.querySelector('[data-recording-status]')?.getAttribute('data-recording-status') !== 'idle';
      console.log('Should continue recording after synthesis:', shouldContinue);
      
      if (shouldContinue) {
        // Restart speech recognition after speech synthesis
        console.log('Restarting speech recognition...');
        try {
          // Give a brief pause before restarting
          await new Promise(resolve => setTimeout(resolve, 300));
          await startSpeechRecognition();
          setStatus('recording');
          console.log('Speech recognition restarted successfully');
        } catch (restartError) {
          console.error('Failed to restart speech recognition:', restartError);
          setStatus('idle');
          setError('Failed to restart speech recognition after translation');
        }
      } else {
        console.log('Not restarting speech recognition - recording has been stopped');
        setStatus('idle');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      console.error('Translation/speech error:', errorMessage);
      setError(errorMessage);
      logger.log('error', 'Translation failed', { error: errorMessage });
      
      // Check if we should return to recording state or stay idle
      const currentStatus = document.querySelector('[data-recording-status]')?.getAttribute('data-recording-status');
      if (currentStatus !== 'idle') {
        console.log('Returning to recording state after error');
        setStatus('recording');
      } else {
        console.log('Staying in idle state after error');
        setStatus('idle');
      }
    }
  }, [translationService, speechSynthesis, logger, setStatus, setTranscriptionEntries, setError, stopSpeechRecognition, startSpeechRecognition]);

  return { processTranscript, logger };
};
