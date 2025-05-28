
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
      setStatus('idle');
      
      toast({
        title: "Speech Recognition Error",
        description: speechRecognition.error,
        variant: "destructive",
      });
    }
  }, [speechRecognition.error, toast, setError, setStatus]);

  // Improved status synchronization with speech recognition state
  useEffect(() => {
    console.log('Status sync check:', {
      status,
      isListening: speechRecognition.isListening,
      hasError: !!speechRecognition.error,
      shouldSync: status === 'recording' && !speechRecognition.isListening
    });

    // If status is recording but speech recognition stopped unexpectedly (and no error)
    if (status === 'recording' && !speechRecognition.isListening && !speechRecognition.error) {
      console.log('Detected status desync: status is recording but not listening, correcting to idle');
      setStatus('idle');
    }
    
    // If speech recognition is listening but status is not recording (and no processing states)
    if (speechRecognition.isListening && !['recording', 'processing', 'translating', 'playing'].includes(status)) {
      console.log('Detected status desync: listening but status not recording, correcting to recording');
      setStatus('recording');
    }
  }, [status, speechRecognition.isListening, speechRecognition.error, setStatus]);
};
