
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceSelectProps {
  voice: string;
  filteredVoices: SpeechSynthesisVoice[];
  totalVoicesCount: number;
  onVoiceChange: (value: string) => void;
}

const VoiceSelect: React.FC<VoiceSelectProps> = ({
  voice,
  filteredVoices,
  totalVoicesCount,
  onVoiceChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label htmlFor="voice">{t('settings.voice')}</Label>
      <Select value={voice} onValueChange={onVoiceChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filteredVoices.map((voice) => (
            <SelectItem key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {filteredVoices.length < totalVoicesCount && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredVoices.length} voice(s) compatible with selected language
        </p>
      )}
    </div>
  );
};

export default VoiceSelect;
