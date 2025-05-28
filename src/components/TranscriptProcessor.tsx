
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
}: TranscriptProcessorProps) => {
  const translationService = useTranslationService();
  const speechSynthesis = useSpeechSynthesis();
  const logger = useLogger();

  // Handle transcript changes and trigger translation
  useEffect(() => {
    if (!transcript || status !== 'recording') {
      return;
    }

    const currentTranscript = transcript.trim();
    
    // Избегаем обработки одного и того же текста несколько раз
    if (currentTranscript === lastProcessedTranscript || currentTranscript.length < 3) {
      return;
    }

    const processTranscript = async () => {
      try {
        setStatus('translating');
        setLastProcessedTranscript(currentTranscript);
        logger.log('info', 'Starting translation', { text: currentTranscript });

        const result = await translationService.translateText(currentTranscript);
        
        const entry: TranscriptionEntry = {
          id: Date.now().toString(),
          original: result.originalText,
          translated: result.translatedText,
          timestamp: new Date(),
        };

        setTranscriptionEntries(prev => [...prev, entry]);

        setStatus('playing');
        logger.log('info', 'Playing translation', { translation: result.translatedText });
        await speechSynthesis.speak(result.translatedText);
        
        // Возвращаемся к записи только если мы все еще слушаем
        if (isListening) {
          setStatus('recording');
        } else {
          setStatus('idle');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Translation failed';
        setError(errorMessage);
        logger.log('error', 'Translation failed', { error: errorMessage });
        
        // Возвращаемся к записи или idle в зависимости от состояния
        if (isListening) {
          setStatus('recording');
        } else {
          setStatus('idle');
        }
      }
    };

    // Debounce the translation to avoid too many requests
    const timeoutId = setTimeout(processTranscript, 2000);
    return () => clearTimeout(timeoutId);
  }, [transcript, isListening, status, translationService, speechSynthesis, logger, lastProcessedTranscript, setLastProcessedTranscript, setStatus, setTranscriptionEntries, setError]);

  // Синхронизируем статус с состоянием распознавания речи
  useEffect(() => {
    if (!isListening && status === 'recording') {
      setStatus('idle');
    }
  }, [isListening, status, setStatus]);

  return { logger };
};
