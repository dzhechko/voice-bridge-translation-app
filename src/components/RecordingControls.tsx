
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
        return 'Готов к записи';
      case 'recording':
        return 'Остановка записи';
      case 'processing':
        return t('status.processing');
      case 'translating':
        return t('status.translating');
      case 'playing':
        return t('status.playing');
      default:
        return 'Готов к записи';
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
  const isActive = status !== 'idle';

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Button
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={isRecording ? onStop : onStart}
          disabled={disabled || status === 'processing' || status === 'translating'}
          className={`h-20 w-20 rounded-full p-0 transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
              : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/50'
          }`}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white" fill="white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>

        {isRecording && (
          <>
            <div className="absolute -inset-4 border-4 border-red-400 rounded-full animate-ping opacity-75" />
            <div className="absolute -inset-2 border-2 border-red-300 rounded-full animate-pulse opacity-50" />
          </>
        )}
      </div>

      <Badge variant={getStatusColor() as any} className={`text-sm px-4 py-2 font-semibold ${
        isRecording ? 'animate-pulse' : ''
      }`}>
        {getStatusText()}
      </Badge>

      <div className={`text-center max-w-sm transition-colors duration-300 ${
        isRecording ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
      }`}>
        <p className="text-sm font-medium">
          {isRecording
            ? 'Идет запись... Говорите в микрофон'
            : 'Нажмите чтобы начать запись'}
        </p>
        <p className="text-xs mt-1 opacity-75">
          {isRecording
            ? 'Нажмите квадрат чтобы остановить'
            : 'Речь будет переведена в реальном времени'}
        </p>
      </div>
    </div>
  );
};

export default RecordingControls;
export type { RecordingStatus };
