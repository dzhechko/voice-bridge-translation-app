
import { useState, useRef } from 'react';

export const useSpeechRecognitionState = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const shouldBeListeningRef = useRef(false);

  return {
    isListening,
    setIsListening,
    transcript,
    setTranscript,
    error,
    setError,
    recognitionRef,
    finalTranscriptRef,
    shouldBeListeningRef,
  };
};
