
import { useState, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface SpeechSynthesisHook {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  stop: () => void;
  error: string | null;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;

    try {
      setIsSpeaking(true);
      setError(null);

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find the selected voice
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      return new Promise((resolve, reject) => {
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          setError(`Speech synthesis error: ${event.error}`);
          reject(new Error(event.error));
        };

        speechSynthesis.speak(utterance);
      });
    } catch (err) {
      setIsSpeaking(false);
      const errorMessage = err instanceof Error ? err.message : 'Speech synthesis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [settings.voice]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    isSpeaking,
    stop,
    error,
  };
};
