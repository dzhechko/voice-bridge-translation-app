
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import PrivacyModal from '@/components/PrivacyModal';
import SettingsPanel from '@/components/SettingsPanel';
import RecordingControls, { RecordingStatus } from '@/components/RecordingControls';
import TranscriptionDisplay, { TranscriptionEntry } from '@/components/TranscriptionDisplay';
import ExportPanel from '@/components/ExportPanel';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTranslationService } from '@/hooks/useTranslationService';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLogger } from '@/hooks/useLogger';
import { AlertTriangle } from 'lucide-react';

const IndexContent: React.FC = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [transcriptionEntries, setTranscriptionEntries] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const speechRecognition = useSpeechRecognition();
  const translationService = useTranslationService();
  const speechSynthesis = useSpeechSynthesis();
  const logger = useLogger();

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
    speechRecognition.stopListening();
    setStatus('idle');
    logger.log('info', 'Recording stopped');
  }, [speechRecognition, logger]);

  // Handle transcript changes and trigger translation
  useEffect(() => {
    if (speechRecognition.transcript && status === 'recording') {
      const processTranscript = async () => {
        try {
          setStatus('translating');
          logger.log('info', 'Starting translation', { text: speechRecognition.transcript });

          const result = await translationService.translateText(speechRecognition.transcript);
          
          const entry: TranscriptionEntry = {
            id: Date.now().toString(),
            original: result.originalText,
            translated: result.translatedText,
            timestamp: new Date(),
          };

          setTranscriptionEntries(prev => [...prev, entry]);

          setStatus('playing');
          logger.log('info', 'Playing translation', { translation: result.translatedText });
          await speechSynthesis.speak(result.translatedText);
          
          setStatus('recording');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Translation failed';
          setError(errorMessage);
          logger.log('error', 'Translation failed', { error: errorMessage });
          setStatus('recording');
        }
      };

      // Debounce the translation to avoid too many requests
      const timeoutId = setTimeout(processTranscript, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [speechRecognition.transcript, status, translationService, speechSynthesis, logger]);

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
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={retryLastAction}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <RecordingControls
              status={status}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              disabled={showPrivacyModal}
            />
          </div>

          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transcript">Transcription</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="space-y-4">
              <TranscriptionDisplay
                entries={transcriptionEntries}
                isRecording={speechRecognition.isListening}
                currentText={speechRecognition.transcript}
              />
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <ExportPanel
                entries={transcriptionEntries}
                logs={logger.logs}
              />
            </TabsContent>
          </Tabs>
        </div>
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

const Index: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <LanguageProvider>
        <SettingsProvider>
          <IndexContent />
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Index;
