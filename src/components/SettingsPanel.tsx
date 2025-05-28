
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { getVoicesForLanguage } from '@/utils/voiceUtils';
import LanguageSelects from '@/components/LanguageSelects';
import VoiceSelect from '@/components/VoiceSelect';
import ModelSelect from '@/components/ModelSelect';
import ApiKeyInput from '@/components/ApiKeyInput';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { settings, updateSettings, availableLanguages, availableVoices, availableModels } = useSettings();
  
  const {
    localSettings,
    handleTargetLanguageChange,
    handleSave,
    handleCancel,
    updateLocalSetting,
  } = useSettingsForm({
    settings,
    availableVoices,
    updateSettings,
    onClose,
  });

  // Get filtered voices for current target language
  const filteredVoices = getVoicesForLanguage(localSettings.targetLanguage, availableVoices);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <LanguageSelects
            sourceLanguage={localSettings.sourceLanguage}
            targetLanguage={localSettings.targetLanguage}
            availableLanguages={availableLanguages}
            onSourceLanguageChange={(value) => updateLocalSetting('sourceLanguage', value)}
            onTargetLanguageChange={handleTargetLanguageChange}
          />

          <VoiceSelect
            voice={localSettings.voice}
            filteredVoices={filteredVoices}
            totalVoicesCount={availableVoices.length}
            onVoiceChange={(value) => updateLocalSetting('voice', value)}
          />

          <ModelSelect
            model={localSettings.openaiModel}
            availableModels={availableModels}
            onModelChange={(value) => updateLocalSetting('openaiModel', value)}
          />

          <ApiKeyInput
            apiKey={localSettings.openaiApiKey}
            onApiKeyChange={(value) => updateLocalSetting('openaiApiKey', value)}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              {t('settings.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {t('settings.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
