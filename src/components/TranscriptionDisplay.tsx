
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptionEntry {
  id: string;
  original: string;
  translated: string;
  timestamp: Date;
}

interface TranscriptionDisplayProps {
  entries: TranscriptionEntry[];
  isRecording: boolean;
  currentText?: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  entries,
  isRecording,
  currentText,
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('transcript.original')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-60">
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="p-2 bg-muted/50 rounded text-sm">
                  {entry.original}
                </div>
              ))}
              {isRecording && currentText && (
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded text-sm animate-pulse">
                  {currentText}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('transcript.translated')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-60">
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="p-2 bg-muted/50 rounded text-sm">
                  {entry.translated}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptionDisplay;
export type { TranscriptionEntry };
