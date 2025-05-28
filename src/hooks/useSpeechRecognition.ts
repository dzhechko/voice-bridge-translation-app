
import { useState, useRef, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  error: string | null;
}

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  const SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  const startListening = useCallback(async () => {
    console.log('=== SPEECH RECOGNITION START ===');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const errorMsg = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      // Clean up any existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
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

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError(null);
        setTranscript('');
        finalTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
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
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event.message);
        
        let errorMessage = `Speech recognition error: ${event.error}`;
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
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
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // Auto-restart if we're still supposed to be listening
        // This handles cases where recognition stops unexpectedly
        if (recognitionRef.current && !error) {
          console.log('Auto-restarting speech recognition...');
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Failed to restart recognition:', err);
              }
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      
      console.log('Speech recognition start initiated');
    } catch (err) {
      const errorMsg = 'Failed to start speech recognition';
      console.error(errorMsg, err);
      setError(errorMsg);
      setIsListening(false);
    }
  }, [settings.sourceLanguage, error]);

  const stopListening = useCallback(() => {
    console.log('=== SPEECH RECOGNITION STOP ===');
    
    if (recognitionRef.current) {
      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    console.log('Speech recognition stopped');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
  };
};
