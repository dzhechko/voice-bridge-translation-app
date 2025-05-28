
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordingControls, { RecordingStatus } from '@/components/RecordingControls';
import TranscriptionDisplay, { TranscriptionEntry } from '@/components/TranscriptionDisplay';
import ExportPanel from '@/components/ExportPanel';
import { LogEntry } from '@/hooks/useLogger';

interface MainContentProps {
  status: RecordingStatus;
  onStartRecording: () => void;
  onStopRecording: () => void;
  showPrivacyModal: boolean;
  transcriptionEntries: TranscriptionEntry[];
  isRecording: boolean;
  currentText: string;
  logs: LogEntry[];
}

const MainContent: React.FC<MainContentProps> = ({
  status,
  onStartRecording,
  onStopRecording,
  showPrivacyModal,
  transcriptionEntries,
  isRecording,
  currentText,
  logs,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <RecordingControls
          status={status}
          onStart={onStartRecording}
          onStop={onStopRecording}
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
            isRecording={isRecording}
            currentText={currentText}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportPanel
            entries={transcriptionEntries}
            logs={logs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MainContent;
