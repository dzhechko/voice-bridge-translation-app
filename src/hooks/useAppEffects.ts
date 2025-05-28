
import { useEffect } from 'react';
import { RecordingStatus } from '@/components/RecordingControls';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

interface UseAppEffectsProps {
  showPrivacyModal: boolean;
  setShowPrivacyModal: (show: boolean) => void;
  status: RecordingStatus;
  setStatus: (status: RecordingStatus) => void;
  setError: (error: string | null) => void;
  speechRecognition: ReturnType<typeof useSpeechRecognition>;
}

export const useAppEffects = ({
  showPrivacyModal,
  setShowPrivacyModal,
  status,
  setStatus,
  setError,
  speechRecognition,
}: UseAppEffectsProps) => {
  const { settings } = useSettings();
  const { toast } = useToast();

  // Check privacy modal on mount
  useEffect(() => {
    const hasAcceptedPrivacy = localStorage.getItem('privacy-accepted');
    if (hasAcceptedPrivacy) {
      setShowPrivacyModal(false);
    }
  }, [setShowPrivacyModal]);

  // Check for API key configuration
  useEffect(() => {
    if (!showPrivacyModal && !settings.openaiApiKey) {
      toast({
        title: "Configuration Required",
        description: "Please configure your OpenAI API key in settings to use translation features.",
        variant: "destructive",
      });
    }
  }, [showPrivacyModal, settings.openaiApiKey, toast]);

  // Handle speech recognition errors
  useEffect(() => {
    if (speechRecognition.error) {
      console.error('Speech recognition error detected:', speechRecognition.error);
      setError(speechRecognition.error);
      
      // Only stop if we're currently recording
      if (status === 'recording') {
        setStatus('idle');
      }
      
      toast({
        title: "Speech Recognition Error",
        description: speechRecognition.error,
        variant: "destructive",
      });
    }
  }, [speechRecognition.error, toast, setError, setStatus, status]);

  // Improved status synchronization with speech recognition state
  useEffect(() => {
    console.log('Status sync check:', {
      status,
      isListening: speechRecognition.isListening,
      hasError: !!speechRecognition.error,
      shouldSync: status === 'recording' && !speechRecognition.isListening
    });

    // Don't sync if there's an error - let error handling take care of it
    if (speechRecognition.error) {
      return;
    }

    // If we're in recording state but not listening and no error occurred
    if (status === 'recording' && !speechRecognition.isListening) {
      console.log('Recording state but not listening - may be temporary during restart');
      // Give a brief moment for potential restart before correcting
      const timeoutId = setTimeout(() => {
        if (status === 'recording' && !speechRecognition.isListening && !speechRecognition.error) {
          console.log('Correcting status: recording but not listening');
          setStatus('idle');
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
    
    // If we're listening but not in an active state
    if (speechRecognition.isListening && status === 'idle') {
      console.log('Listening but status is idle - correcting to recording');
      setStatus('recording');
    }
  }, [status, speechRecognition.isListening, speechRecognition.error, setStatus]);
};
