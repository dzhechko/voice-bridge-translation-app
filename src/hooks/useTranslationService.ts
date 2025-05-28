
import { useState, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface TranslationResult {
  originalText: string;
  translatedText: string;
}

interface TranslationHook {
  translateText: (text: string) => Promise<TranslationResult>;
  isTranslating: boolean;
  error: string | null;
}

export const useTranslationService = (): TranslationHook => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const translateText = useCallback(async (text: string): Promise<TranslationResult> => {
    if (!text.trim()) {
      throw new Error('Text is empty');
    }

    setIsTranslating(true);
    setError(null);

    try {
      // Временная mock-реализация перевода для демонстрации
      // В реальном приложении здесь должен быть вызов к OpenAI API через бэкенд
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки API

      // Простой mock-перевод для демонстрации
      let translatedText = '';
      const sourceIsRussian = settings.sourceLanguage.includes('ru');
      const targetIsEnglish = settings.targetLanguage.includes('en');

      if (sourceIsRussian && targetIsEnglish) {
        // Простой словарь для демонстрации
        const translations: { [key: string]: string } = {
          'привет': 'hello',
          'как дела': 'how are you',
          'да': 'yes',
          'нет': 'no',
          'спасибо': 'thank you',
          'пожалуйста': 'please',
          'хорошо': 'good',
          'плохо': 'bad',
          'транскрибация': 'transcription',
          'работает': 'works',
          'нормально': 'normally',
          'перевод': 'translation',
          'не работает': 'does not work',
          'здесь': 'here',
          'надо': 'need',
          'нравится': 'like',
          'давайте': 'let\'s',
          'нажмём': 'press',
          'кнопку': 'button',
          'целом': 'general'
        };

        const words = text.toLowerCase().split(/\s+/);
        const translatedWords = words.map(word => {
          // Убираем знаки препинания для поиска
          const cleanWord = word.replace(/[.,!?;:]/g, '');
          return translations[cleanWord] || cleanWord;
        });
        
        translatedText = translatedWords.join(' ');
        // Делаем первую букву заглавной
        translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
      } else {
        // Для других языковых пар просто добавляем префикс
        translatedText = `[Translated] ${text}`;
      }

      console.log('Translation completed successfully', { originalText: text, translatedText });

      return {
        originalText: text,
        translatedText,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [settings.sourceLanguage, settings.targetLanguage]);

  return {
    translateText,
    isTranslating,
    error,
  };
};
