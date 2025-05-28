
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
    console.log('Transcript processor effect triggered:', {
      transcript: transcript?.substring(0, 50) + '...',
      transcriptLength: transcript?.length || 0,
      status,
      isListening,
      lastProcessedLength: lastProcessedTranscript?.length || 0
    });

    // Теперь обрабатываем только если статус 'recording' И isListening = true
    if (!transcript || status !== 'recording' || !isListening) {
      console.log('Skipping processing:', { 
        hasTranscript: !!transcript, 
        status, 
        isListening,
        reason: !transcript ? 'no transcript' : 
                status !== 'recording' ? 'status not recording' : 
                !isListening ? 'not listening' : 'unknown'
      });
      return;
    }

    const currentTranscript = transcript.trim();
    
    // Избегаем обработки одного и того же текста или слишком коротких фраз
    if (currentTranscript === lastProcessedTranscript || 
        currentTranscript.length < 5 ||
        currentTranscript.startsWith(lastProcessedTranscript)) {
      console.log('Skipping duplicate or short transcript:', {
        current: currentTranscript.substring(0, 30),
        last: lastProcessedTranscript.substring(0, 30),
        currentLength: currentTranscript.length
      });
      return;
    }

    const processTranscript = async () => {
      try {
        console.log('Starting translation process for:', currentTranscript);
        setStatus('translating');
        setLastProcessedTranscript(currentTranscript);
        logger.log('info', 'Starting translation', { text: currentTranscript });

        const result = await translationService.translateText(currentTranscript);
        console.log('Translation completed:', result);
        
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

        console.log('Starting speech synthesis for:', result.translatedText);
        setStatus('playing');
        logger.log('info', 'Playing translation', { translation: result.translatedText });
        
        await speechSynthesis.speak(result.translatedText);
        console.log('Speech synthesis completed');
        
        // Возвращаемся к записи только если мы все еще слушаем
        if (isListening) {
          setStatus('recording');
          console.log('Returned to recording state');
        } else {
          setStatus('idle');
          console.log('Returned to idle state');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Translation failed';
        console.error('Translation/speech error:', errorMessage);
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
    const timeoutId = setTimeout(processTranscript, 1500);
    return () => {
      console.log('Clearing translation timeout');
      clearTimeout(timeoutId);
    };
  }, [transcript, isListening, status, translationService, speechSynthesis, logger, lastProcessedTranscript, setLastProcessedTranscript, setStatus, setTranscriptionEntries, setError]);

  return { logger };
};
