
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mic, MicOff, Square } from 'lucide-react';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'translating' | 'playing';

interface RecordingControlsProps {
  status: RecordingStatus;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  status,
  onStart,
  onStop,
  disabled = false,
}) => {
  const { t } = useLanguage();

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return t('status.idle');
      case 'recording':
        return t('status.recording');
      case 'processing':
        return t('status.processing');
      case 'translating':
        return t('status.translating');
      case 'playing':
        return t('status.playing');
      default:
        return t('status.idle');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'secondary';
      case 'recording':
        return 'destructive';
      case 'processing':
      case 'translating':
        return 'default';
      case 'playing':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const isRecording = status === 'recording';

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Button
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={isRecording ? onStop : onStart}
          disabled={disabled || status === 'processing' || status === 'translating'}
          className={`h-16 w-16 rounded-full p-0 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        {isRecording && (
          <div className="absolute -inset-2 border-2 border-red-500 rounded-full animate-ping opacity-75" />
        )}
      </div>

      <Badge variant={getStatusColor() as any} className="text-sm px-3 py-1">
        {getStatusText()}
      </Badge>

      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {isRecording
          ? 'Говорите в микрофон. Нажмите кнопку чтобы остановить запись.'
          : 'Нажмите кнопку чтобы начать запись и перевод речи в реальном времени.'}
      </p>
    </div>
  );
};

export default RecordingControls;
export type { RecordingStatus };
