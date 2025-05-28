
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import PrivacyModal from '@/components/PrivacyModal';
import SettingsPanel from '@/components/SettingsPanel';
import ErrorHandler from '@/components/ErrorHandler';
import MainContent from '@/components/MainContent';
import { RecordingStatus } from '@/components/RecordingControls';
import { TranscriptionEntry } from '@/components/TranscriptionDisplay';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useTranscriptProcessor } from '@/components/TranscriptProcessor';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

const MainApp: React.FC = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcriptionEntries, setTranscriptionEntries] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');

  const { settings } = useSettings();
  const { toast } = useToast();
  const speechRecognition = useSpeechRecognition();
  const speechSynthesis = useSpeechSynthesis();

  const { logger } = useTranscriptProcessor({
    transcript: speechRecognition.transcript,
    isListening: speechRecognition.isListening,
    status,
    lastProcessedTranscript,
    setLastProcessedTranscript,
    setStatus,
    setTranscriptionEntries,
    setError,
    stopSpeechRecognition: speechRecognition.stopListening,
    startSpeechRecognition: speechRecognition.startListening,
  });

  useEffect(() => {
    const hasAcceptedPrivacy = localStorage.getItem('privacy-accepted');
    if (hasAcceptedPrivacy) {
      setShowPrivacyModal(false);
    }
  }, []);

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

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacy-accepted', 'true');
    setShowPrivacyModal(false);
    logger.log('info', 'Privacy policy accepted');
  };

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
      setStatus('recording');
      setLastProcessedTranscript('');
      
      logger.log('info', 'Recording started');
      await speechRecognition.startListening();
      
      console.log('Speech recognition started successfully');
      toast({
        title: "Recording Started",
        description: "Speak into your microphone. Your speech will be translated in real-time.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('Recording start failed:', errorMessage);
      setError(errorMessage);
      setStatus('idle');
      logger.log('error', 'Recording failed', { error: errorMessage });
      
      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [speechRecognition, logger, settings.openaiApiKey, toast]);

  const handleStopRecording = useCallback(() => {
    console.log('=== STOP RECORDING INITIATED ===');
    console.log('Current status:', status);
    console.log('Is listening:', speechRecognition.isListening);
    
    try {
      speechRecognition.stopListening();
      speechSynthesis.stop();
      setStatus('idle');
      setLastProcessedTranscript('');
      
      console.log('Recording stopped successfully');
      logger.log('info', 'Recording stopped');
      
      toast({
        title: "Recording Stopped",
        description: "Speech recognition has been stopped.",
      });
    } catch (err) {
      console.error('Error stopping recording:', err);
      setStatus('idle'); // Force reset to idle
    }
  }, [speechRecognition, speechSynthesis, logger, status, toast]);

  // Handle speech recognition errors
  useEffect(() => {
    if (speechRecognition.error) {
      console.error('Speech recognition error:', speechRecognition.error);
      setError(speechRecognition.error);
      setStatus('idle');
      
      toast({
        title: "Speech Recognition Error",
        description: speechRecognition.error,
        variant: "destructive",
      });
    }
  }, [speechRecognition.error, toast]);

  const retryLastAction = () => {
    setError(null);
    if (status === 'idle') {
      handleStartRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <Header onSettingsClick={() => setShowSettings(true)} />

      <main className="container mx-auto px-4 py-8">
        <ErrorHandler error={error} onRetry={retryLastAction} />

        <MainContent
          status={status}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          showPrivacyModal={showPrivacyModal}
          transcriptionEntries={transcriptionEntries}
          isRecording={speechRecognition.isListening}
          currentText={speechRecognition.transcript}
          logs={logger.logs}
        />
      </main>

      <PrivacyModal
        isOpen={showPrivacyModal}
        onAccept={handlePrivacyAccept}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default MainApp;
