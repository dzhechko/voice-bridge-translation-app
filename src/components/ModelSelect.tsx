
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface ModelSelectProps {
  model: string;
  availableModels: { id: string; name: string }[];
  onModelChange: (value: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  model,
  availableModels,
  onModelChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label htmlFor="model">{t('settings.model')}</Label>
      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelect;
