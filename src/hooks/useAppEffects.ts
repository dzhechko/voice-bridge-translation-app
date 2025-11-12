
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

  // Improved status synchronization with automatic restart
  useEffect(() => {
    console.log('[AppEffects] Status sync check:', {
      status,
      isListening: speechRecognition.isListening,
      hasError: !!speechRecognition.error,
      shouldSync: status === 'recording' && !speechRecognition.isListening
    });

    // Don't sync if there's an error - let error handling take care of it
    if (speechRecognition.error) {
      return;
    }

    // If we're in recording state but not listening (desync detected)
    if (status === 'recording' && !speechRecognition.isListening) {
      console.log('[AppEffects] Detected status desync: status is recording but not listening');
      
      // Wait a moment to see if it's just a temporary state during natural end
      const timeoutId = setTimeout(() => {
        // Double-check the state hasn't changed
        if (status === 'recording' && !speechRecognition.isListening && !speechRecognition.error) {
          console.log('[AppEffects] Desync confirmed after timeout - attempting auto-restart');
          
          // Attempt to restart speech recognition
          speechRecognition.startListening().catch((err) => {
            console.error('[AppEffects] Auto-restart failed:', err);
            setStatus('idle');
          });
        }
      }, 1500); // Give more time for natural restart cycles
      
      return () => clearTimeout(timeoutId);
    }
    
    // If we're listening but not in an active state
    if (speechRecognition.isListening && status === 'idle') {
      console.log('[AppEffects] Listening but status is idle - correcting to recording');
      setStatus('recording');
    }
  }, [status, speechRecognition.isListening, speechRecognition.error, speechRecognition.startListening, setStatus]);
};
