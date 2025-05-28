
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
    console.log('=== SPEECH SYNTHESIS START ===');
    console.log('Speech synthesis request:', {
      text: text.substring(0, 100) + '...',
      textLength: text.length,
      selectedVoice: settings.voice,
      targetLanguage: settings.targetLanguage
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
      let voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.log('Waiting for voices to load...');
        await new Promise(resolve => {
          const checkVoices = () => {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve(voices);
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          checkVoices();
        });
      }

      console.log('Available voices:', voices.length);

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find the best voice
      let selectedVoice = null;
      
      // First try to find the exact voice that was selected
      if (settings.voice) {
        selectedVoice = voices.find(voice => voice.name === settings.voice);
        if (selectedVoice) {
          console.log('Using selected voice:', selectedVoice.name);
        }
      }
      
      // If no exact match, find a voice that matches the target language
      if (!selectedVoice) {
        const targetLangCode = settings.targetLanguage.substring(0, 2);
        selectedVoice = voices.find(voice => 
          voice.lang.toLowerCase().startsWith(targetLangCode.toLowerCase())
        );
        if (selectedVoice) {
          console.log('Using language-matched voice:', selectedVoice.name, selectedVoice.lang);
        }
      }
      
      // Fallback to first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
        console.log('Using fallback voice:', selectedVoice.name, selectedVoice.lang);
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Configure speech parameters
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;

      console.log('Starting speech synthesis...');

      return new Promise((resolve, reject) => {
        utterance.onstart = () => {
          console.log('Speech synthesis started');
        };

        utterance.onend = () => {
          console.log('=== SPEECH SYNTHESIS COMPLETED ===');
          setIsSpeaking(false);
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          setIsSpeaking(false);
          setError(`Speech synthesis error: ${event.error}`);
          reject(new Error(event.error));
        };

        // Cancel any ongoing speech first
        speechSynthesis.cancel();
        
        // Small delay to ensure cancellation is processed
        setTimeout(() => {
          speechSynthesis.speak(utterance);
        }, 100);
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
    console.log('=== STOPPING SPEECH SYNTHESIS ===');
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
