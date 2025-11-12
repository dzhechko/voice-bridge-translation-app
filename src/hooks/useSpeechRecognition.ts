
import { useCallback } from 'react';
import { SpeechRecognitionHook } from '@/types/speechRecognition';
import { useSpeechRecognitionState } from '@/hooks/useSpeechRecognitionState';
import { useSpeechRecognitionAPI } from '@/hooks/useSpeechRecognitionAPI';

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const {
    isListening,
    setIsListening,
    transcript,
    setTranscript,
    error,
    setError,
    recognitionRef,
    finalTranscriptRef,
    shouldBeListeningRef,
    isRestartingRef,
  } = useSpeechRecognitionState();

  const {
    createRecognition,
    handleStart,
    handleResult,
    handleError,
    handleEnd,
  } = useSpeechRecognitionAPI({
    setIsListening,
    setError,
    setTranscript,
    recognitionRef,
    finalTranscriptRef,
    shouldBeListeningRef,
    isRestartingRef,
  });

  const startListening = useCallback(async () => {
    console.log('[SR] === SPEECH RECOGNITION START ===');
    
    // Prevent concurrent start attempts
    if (isRestartingRef.current) {
      console.log('[SR] Already in restart process, skipping...');
      return;
    }

    try {
      isRestartingRef.current = true;

      // Clean up any existing recognition
      if (recognitionRef.current) {
        console.log('[SR] Cleaning up existing recognition...');
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('[SR] Error stopping existing recognition (ignored):', e);
        }
        recognitionRef.current = null;
      }

      shouldBeListeningRef.current = true;

      const recognition = createRecognition();

      recognition.onstart = handleStart;
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;

      recognitionRef.current = recognition;
      
      // Protected start with InvalidStateError handling
      try {
        recognition.start();
        console.log('[SR] Speech recognition start initiated successfully');
      } catch (startError: any) {
        if (startError.name === 'InvalidStateError') {
          console.error('[SR] InvalidStateError caught - recognition already started, cleaning up...');
          recognitionRef.current = null;
          isRestartingRef.current = false;
          shouldBeListeningRef.current = false;
          return;
        }
        throw startError;
      }
      
    } catch (err) {
      const errorMsg = 'Failed to start speech recognition';
      console.error('[SR]', errorMsg, err);
      setError(errorMsg);
      setIsListening(false);
      shouldBeListeningRef.current = false;
      isRestartingRef.current = false;
      recognitionRef.current = null;
    }
  }, [createRecognition, handleStart, handleResult, handleError, handleEnd, recognitionRef, shouldBeListeningRef, isRestartingRef, setError, setIsListening]);

  const stopListening = useCallback(() => {
    console.log('[SR] === SPEECH RECOGNITION STOP ===');
    
    shouldBeListeningRef.current = false;
    isRestartingRef.current = false;
    
    if (recognitionRef.current) {
      console.log('[SR] Stopping speech recognition...');
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('[SR] Error stopping recognition (ignored):', e);
      }
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    console.log('[SR] Speech recognition stopped');
  }, [recognitionRef, shouldBeListeningRef, isRestartingRef, setIsListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
  };
};
