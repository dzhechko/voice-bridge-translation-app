
import { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface UseSpeechRecognitionAPIProps {
  setIsListening: (listening: boolean) => void;
  setError: (error: string | null) => void;
  setTranscript: (transcript: string) => void;
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  finalTranscriptRef: React.MutableRefObject<string>;
  shouldBeListeningRef: React.MutableRefObject<boolean>;
  isRestartingRef: React.MutableRefObject<boolean>;
}

export const useSpeechRecognitionAPI = ({
  setIsListening,
  setError,
  setTranscript,
  recognitionRef,
  finalTranscriptRef,
  shouldBeListeningRef,
  isRestartingRef,
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
    console.error('[SR API] Speech recognition error:', event.error, event.message);
    
    // Handle no-speech error more gracefully - just log it
    if (event.error === 'no-speech') {
      console.log('[SR API] No speech detected, will continue listening...');
      return;
    }
    
    let errorMessage = `Speech recognition error: ${event.error}`;
    
    switch (event.error) {
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
        console.log('[SR API] Speech recognition was aborted');
        // Don't treat aborted as an error if we're intentionally stopping
        if (!shouldBeListeningRef.current) {
          return;
        }
        errorMessage = 'Speech recognition was aborted unexpectedly.';
        break;
    }
    
    console.error('[SR API] Fatal error:', errorMessage);
    setError(errorMessage);
    setIsListening(false);
    shouldBeListeningRef.current = false;
    isRestartingRef.current = false;
  }, [setError, setIsListening, shouldBeListeningRef, isRestartingRef]);

  const handleEnd = useCallback(() => {
    console.log('[SR API] Speech recognition ended, shouldBeListening:', shouldBeListeningRef.current);
    setIsListening(false);
    isRestartingRef.current = false;
    
    // Auto-restart will be handled by useAppEffects for better control
    if (!shouldBeListeningRef.current) {
      console.log('[SR API] Not restarting - shouldBeListening is false');
    }
  }, [setIsListening, shouldBeListeningRef, isRestartingRef]);

  return {
    createRecognition,
    handleStart,
    handleResult,
    handleError,
    handleEnd,
  };
};
