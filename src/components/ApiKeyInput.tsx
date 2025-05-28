
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  onApiKeyChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label htmlFor="api-key">{t('settings.apikey')}</Label>
      <Input
        id="api-key"
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="sk-..."
      />
    </div>
  );
};

export default ApiKeyInput;
