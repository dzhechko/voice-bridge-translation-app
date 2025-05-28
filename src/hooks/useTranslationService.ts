
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
    if (!settings.openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }

    setIsTranslating(true);
    setError(null);

    try {
      // For now, we'll simulate the translation since we don't have a backend yet
      // In the real implementation, this would call the backend API
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLanguage: settings.sourceLanguage,
          targetLanguage: settings.targetLanguage,
          model: settings.openaiModel,
          apiKey: settings.openaiApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        originalText: text,
        translatedText: result.translatedText,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [settings]);

  return {
    translateText,
    isTranslating,
    error,
  };
};
