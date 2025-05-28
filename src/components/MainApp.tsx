
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

const MainApp: React.FC = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcriptionEntries, setTranscriptionEntries] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');

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
  });

  useEffect(() => {
    const hasAcceptedPrivacy = localStorage.getItem('privacy-accepted');
    if (hasAcceptedPrivacy) {
      setShowPrivacyModal(false);
    }
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacy-accepted', 'true');
    setShowPrivacyModal(false);
    logger.log('info', 'Privacy policy accepted');
  };

  const handleStartRecording = useCallback(async () => {
    try {
      setError(null);
      setStatus('recording');
      setLastProcessedTranscript('');
      logger.log('info', 'Recording started');
      await speechRecognition.startListening();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setStatus('idle');
      logger.log('error', 'Recording failed', { error: errorMessage });
    }
  }, [speechRecognition, logger]);

  const handleStopRecording = useCallback(() => {
    console.log('Stopping recording...');
    speechRecognition.stopListening();
    speechSynthesis.stop();
    setStatus('idle');
    setLastProcessedTranscript('');
    logger.log('info', 'Recording stopped');
  }, [speechRecognition, speechSynthesis, logger]);

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
