
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download } from 'lucide-react';
import { TranscriptionEntry } from './TranscriptionDisplay';

interface ExportPanelProps {
  entries: TranscriptionEntry[];
  logs: any[];
}

const ExportPanel: React.FC<ExportPanelProps> = ({ entries, logs }) => {
  const { t } = useLanguage();

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportTranscriptTxt = () => {
    const content = entries
      .map((entry) => `[${entry.timestamp.toLocaleTimeString()}]\nОригинал: ${entry.original}\nПеревод: ${entry.translated}\n`)
      .join('\n');
    downloadFile(content, `transcript_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
  };

  const exportTranscriptJson = () => {
    const content = JSON.stringify(entries, null, 2);
    downloadFile(content, `transcript_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const exportTranscriptCsv = () => {
    const headers = 'Timestamp,Original,Translation\n';
    const rows = entries
      .map((entry) => `"${entry.timestamp.toISOString()}","${entry.original.replace(/"/g, '""')}","${entry.translated.replace(/"/g, '""')}"`)
      .join('\n');
    const content = headers + rows;
    downloadFile(content, `transcript_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportLogsTxt = () => {
    const content = logs.map((log) => `[${log.timestamp}] ${log.level}: ${log.message}`).join('\n');
    downloadFile(content, `logs_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
  };

  const exportLogsJson = () => {
    const content = JSON.stringify(logs, null, 2);
    downloadFile(content, `logs_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('export.transcript')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportTranscriptTxt}
            disabled={entries.length === 0}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export.txt')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportTranscriptJson}
            disabled={entries.length === 0}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export.json')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportTranscriptCsv}
            disabled={entries.length === 0}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export.csv')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('export.logs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogsTxt}
            disabled={logs.length === 0}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export.txt')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogsJson}
            disabled={logs.length === 0}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('export.json')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPanel;
