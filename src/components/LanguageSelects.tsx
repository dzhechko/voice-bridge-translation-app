
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSelectsProps {
  sourceLanguage: string;
  targetLanguage: string;
  availableLanguages: { code: string; name: string }[];
  onSourceLanguageChange: (value: string) => void;
  onTargetLanguageChange: (value: string) => void;
}

const LanguageSelects: React.FC<LanguageSelectsProps> = ({
  sourceLanguage,
  targetLanguage,
  availableLanguages,
  onSourceLanguageChange,
  onTargetLanguageChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="source-language">{t('settings.source')}</Label>
        <Select value={sourceLanguage} onValueChange={onSourceLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-language">{t('settings.target')}</Label>
        <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSelects;
