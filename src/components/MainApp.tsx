
import React from 'react';
import Header from '@/components/Header';
import PrivacyModal from '@/components/PrivacyModal';
import SettingsPanel from '@/components/SettingsPanel';
import ErrorHandler from '@/components/ErrorHandler';
import MainContent from '@/components/MainContent';
import { useTranscriptProcessing } from '@/hooks/useTranscriptProcessing';
import { useMainAppState } from '@/hooks/useMainAppState';
import { useRecordingActions } from '@/hooks/useRecordingActions';
import { useAppEffects } from '@/hooks/useAppEffects';

const MainApp: React.FC = () => {
  const {
    showPrivacyModal,
    setShowPrivacyModal,
    showSettings,
    setShowSettings,
    status,
    setStatus,
    transcriptionEntries,
    setTranscriptionEntries,
    error,
    setError,
    lastProcessedTranscript,
    setLastProcessedTranscript,
  } = useMainAppState();

  const {
    handleStartRecording,
    handleStopRecording,
    speechRecognition,
  } = useRecordingActions({
    status,
    setStatus,
    setError,
    setLastProcessedTranscript,
  });

  useAppEffects({
    showPrivacyModal,
    setShowPrivacyModal,
    status,
    setStatus,
    setError,
    speechRecognition,
  });

  const { logger } = useTranscriptProcessing({
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

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacy-accepted', 'true');
    setShowPrivacyModal(false);
    logger.log('info', 'Privacy policy accepted');
  };

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
