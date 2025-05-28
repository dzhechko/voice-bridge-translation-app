
import { useCallback } from 'react';
import { RecordingStatus } from '@/components/RecordingControls';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

interface UseRecordingActionsProps {
  status: RecordingStatus;
  setStatus: (status: RecordingStatus) => void;
  setError: (error: string | null) => void;
  setLastProcessedTranscript: (text: string) => void;
}

export const useRecordingActions = ({
  status,
  setStatus,
  setError,
  setLastProcessedTranscript,
}: UseRecordingActionsProps) => {
  const { settings } = useSettings();
  const { toast } = useToast();
  const speechRecognition = useSpeechRecognition();
  const speechSynthesis = useSpeechSynthesis();

  const handleStartRecording = useCallback(async () => {
    console.log('=== START RECORDING INITIATED ===');
    
    // Check API key
    if (!settings.openaiApiKey) {
      const errorMessage = 'OpenAI API key is required. Please configure it in settings.';
      setError(errorMessage);
      toast({
        title: "Configuration Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Check microphone permissions
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
    } catch (permissionError) {
      const errorMessage = 'Microphone access denied. Please grant permission to use speech recognition.';
      setError(errorMessage);
      toast({
        title: "Permission Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting recording process...');
      setError(null);
      // Reset transcript tracking on start
      setLastProcessedTranscript('');
      
      // Start speech recognition first
      await speechRecognition.startListening();
      console.log('Speech recognition started, setting status to recording');
      
      // Set status to recording after speech recognition starts successfully
      setStatus('recording');
      
      console.log('Recording started successfully');
      toast({
        title: "Recording Started",
        description: "Speak into your microphone. Your speech will be translated in real-time.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('Recording start failed:', errorMessage);
      setError(errorMessage);
      setStatus('idle');
      
      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [speechRecognition, settings.openaiApiKey, toast, setError, setStatus, setLastProcessedTranscript]);

  const handleStopRecording = useCallback(() => {
    console.log('=== STOP RECORDING INITIATED ===');
    console.log('Current status:', status);
    console.log('Is listening:', speechRecognition.isListening);
    
    try {
      // Stop speech synthesis first
      speechSynthesis.stop();
      console.log('Speech synthesis stopped');
      
      // Stop speech recognition
      speechRecognition.stopListening();
      console.log('Speech recognition stop called');
      
      // Reset all state immediately
      setStatus('idle');
      setLastProcessedTranscript('');
      setError(null);
      
      console.log('Recording stopped successfully - state reset complete');
      
      toast({
        title: "Recording Stopped",
        description: "Speech recognition has been stopped.",
      });
    } catch (err) {
      console.error('Error stopping recording:', err);
      // Force reset to idle even if there's an error
      setStatus('idle');
      setLastProcessedTranscript('');
      setError(null);
    }
  }, [speechRecognition, speechSynthesis, status, toast, setStatus, setLastProcessedTranscript, setError]);

  return {
    handleStartRecording,
    handleStopRecording,
    speechRecognition,
    speechSynthesis,
  };
};
