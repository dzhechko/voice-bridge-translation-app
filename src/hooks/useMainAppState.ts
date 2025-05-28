
import { useState } from 'react';
import { RecordingStatus } from '@/components/RecordingControls';
import { TranscriptionEntry } from '@/components/TranscriptionDisplay';

export const useMainAppState = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcriptionEntries, setTranscriptionEntries] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');

  return {
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
  };
};
