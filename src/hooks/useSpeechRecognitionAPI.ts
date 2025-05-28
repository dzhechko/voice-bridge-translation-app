
import { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface UseSpeechRecognitionAPIProps {
  setIsListening: (listening: boolean) => void;
  setError: (error: string | null) => void;
  setTranscript: (transcript: string) => void;
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  finalTranscriptRef: React.MutableRefObject<string>;
  shouldBeListeningRef: React.MutableRefObject<boolean>;
}

export const useSpeechRecognitionAPI = ({
  setIsListening,
  setError,
  setTranscript,
  recognitionRef,
  finalTranscriptRef,
  shouldBeListeningRef,
}: UseSpeechRecognitionAPIProps) => {
  const { settings } = useSettings();

  const createRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings.sourceLanguage;

    console.log('Speech recognition configured:', {
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      lang: recognition.lang
    });

    return recognition;
  }, [settings.sourceLanguage]);

  const handleStart = useCallback(() => {
    console.log('Speech recognition started');
    setIsListening(true);
    setError(null);
    setTranscript('');
    finalTranscriptRef.current = '';
  }, [setIsListening, setError, setTranscript, finalTranscriptRef]);

  const handleResult = useCallback((event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Update the final transcript accumulator
    if (finalTranscript) {
      finalTranscriptRef.current += finalTranscript;
    }

    // Set the current transcript (final + interim)
    const currentTranscript = finalTranscriptRef.current + interimTranscript;
    setTranscript(currentTranscript);

    console.log('Speech result:', {
      final: finalTranscript,
      interim: interimTranscript,
      accumulated: finalTranscriptRef.current,
      current: currentTranscript
    });
  }, [setTranscript, finalTranscriptRef]);

  const handleError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error, event.message);
    
    let errorMessage = `Speech recognition error: ${event.error}`;
    
    switch (event.error) {
      case 'no-speech':
        // Don't treat no-speech as a fatal error, just continue listening
        console.log('No speech detected, continuing to listen');
        return;
      case 'audio-capture':
        errorMessage = 'Microphone not found or not working. Please check your microphone.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow microphone access.';
        break;
      case 'network':
        errorMessage = 'Network error occurred during speech recognition.';
        break;
      case 'aborted':
        errorMessage = 'Speech recognition was aborted.';
        break;
    }
    
    setError(errorMessage);
    setIsListening(false);
    shouldBeListeningRef.current = false;
  }, [setError, setIsListening, shouldBeListeningRef]);

  const handleEnd = useCallback(() => {
    console.log('Speech recognition ended, shouldBeListening:', shouldBeListeningRef.current);
    setIsListening(false);
    
    // Only auto-restart if we should still be listening
    if (shouldBeListeningRef.current) {
      console.log('Auto-restarting speech recognition...');
      setTimeout(() => {
        if (shouldBeListeningRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            console.log('Speech recognition auto-restarted successfully');
          } catch (err) {
            console.error('Failed to restart recognition:', err);
            setError('Failed to restart speech recognition');
            shouldBeListeningRef.current = false;
          }
        }
      }, 100);
    }
  }, [setIsListening, shouldBeListeningRef, recognitionRef, setError]);

  return {
    createRecognition,
    handleStart,
    handleResult,
    handleError,
    handleEnd,
  };
};
