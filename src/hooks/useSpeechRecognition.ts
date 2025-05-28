
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
  });

  const startListening = useCallback(async () => {
    console.log('=== SPEECH RECOGNITION START ===');
    
    try {
      // Clean up any existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      shouldBeListeningRef.current = true;

      const recognition = createRecognition();

      recognition.onstart = handleStart;
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;

      recognitionRef.current = recognition;
      recognition.start();
      
      console.log('Speech recognition start initiated');
    } catch (err) {
      const errorMsg = 'Failed to start speech recognition';
      console.error(errorMsg, err);
      setError(errorMsg);
      setIsListening(false);
      shouldBeListeningRef.current = false;
    }
  }, [createRecognition, handleStart, handleResult, handleError, handleEnd, recognitionRef, shouldBeListeningRef, setError, setIsListening]);

  const stopListening = useCallback(() => {
    console.log('=== SPEECH RECOGNITION STOP ===');
    
    shouldBeListeningRef.current = false;
    
    if (recognitionRef.current) {
      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    console.log('Speech recognition stopped');
  }, [recognitionRef, shouldBeListeningRef, setIsListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
  };
};
