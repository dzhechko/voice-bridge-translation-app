
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

  const getLanguageName = (languageCode: string): string => {
    const languageMap: { [key: string]: string } = {
      'ru-RU': 'Russian',
      'en-US': 'English',
      'en-GB': 'English',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'pt-PT': 'Portuguese',
      'zh-CN': 'Chinese',
      'ja-JP': 'Japanese',
      'ko-KR': 'Korean',
    };
    return languageMap[languageCode] || 'English';
  };

  const translateText = useCallback(async (text: string): Promise<TranslationResult> => {
    if (!text.trim()) {
      throw new Error('Text is empty');
    }

    if (!settings.openaiApiKey) {
      throw new Error('OpenAI API key is not configured. Please set it in settings.');
    }

    setIsTranslating(true);
    setError(null);

    try {
      const sourceLanguage = getLanguageName(settings.sourceLanguage);
      const targetLanguage = getLanguageName(settings.targetLanguage);

      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translation without any additional text or explanation:

${text}`;

      console.log('Sending translation request to OpenAI', {
        model: settings.openaiModel,
        sourceLanguage,
        targetLanguage,
        textLength: text.length
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.openaiModel,
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate text accurately from ${sourceLanguage} to ${targetLanguage}. Return only the translation without any additional text.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key in settings.');
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('OpenAI API access denied. Please check your API key permissions.');
        } else {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid response structure from OpenAI:', data);
        throw new Error('Invalid response from OpenAI API');
      }

      const translatedText = data.choices[0].message.content.trim();

      if (!translatedText) {
        throw new Error('Empty translation received from OpenAI');
      }

      console.log('Translation completed successfully', {
        originalText: text,
        translatedText,
        model: settings.openaiModel,
        usage: data.usage
      });

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
  }, [settings.sourceLanguage, settings.targetLanguage, settings.openaiApiKey, settings.openaiModel]);

  return {
    translateText,
    isTranslating,
    error,
  };
};
