
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
  }, [translationService, speechSynthesis, logger, setStatus, setTranscriptionEntries, setError, stopSpeechRecognition, startSpeechRecognition]);

  return { processTranscript, logger };
};
