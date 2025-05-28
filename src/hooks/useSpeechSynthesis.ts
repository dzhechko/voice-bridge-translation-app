
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
    console.log('Speech synthesis called with:', {
      text: text.substring(0, 50) + '...',
      textLength: text.length,
      selectedVoice: settings.voice,
      speechSynthesisSupported: 'speechSynthesis' in window
    });

    if (!text.trim()) {
      console.log('Skipping speech synthesis - empty text');
      return;
    }

    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis is not supported in this browser');
    }

    try {
      setIsSpeaking(true);
      setError(null);

      // Wait for voices to be loaded
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.log('No voices available yet, waiting...');
        await new Promise(resolve => {
          const checkVoices = () => {
            const newVoices = speechSynthesis.getVoices();
            if (newVoices.length > 0) {
              resolve(newVoices);
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          checkVoices();
        });
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find the selected voice
      const availableVoices = speechSynthesis.getVoices();
      console.log('Available voices:', availableVoices.map(v => ({ name: v.name, lang: v.lang })));
      
      const selectedVoice = availableVoices.find(voice => voice.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using selected voice:', selectedVoice.name);
      } else {
        // Fallback to a voice that matches target language
        const fallbackVoice = availableVoices.find(voice => 
          voice.lang.startsWith(settings.targetLanguage.substring(0, 2))
        );
        if (fallbackVoice) {
          utterance.voice = fallbackVoice;
          console.log('Using fallback voice:', fallbackVoice.name);
        } else {
          console.log('Using default voice');
        }
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      return new Promise((resolve, reject) => {
        utterance.onstart = () => {
          console.log('Speech synthesis started');
        };

        utterance.onend = () => {
          console.log('Speech synthesis completed');
          setIsSpeaking(false);
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          setIsSpeaking(false);
          setError(`Speech synthesis error: ${event.error}`);
          reject(new Error(event.error));
        };

        console.log('Starting speech synthesis...');
        speechSynthesis.speak(utterance);
      });
    } catch (err) {
      setIsSpeaking(false);
      const errorMessage = err instanceof Error ? err.message : 'Speech synthesis failed';
      console.error('Speech synthesis failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [settings.voice, settings.targetLanguage]);

  const stop = useCallback(() => {
    console.log('Stopping speech synthesis');
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
