
import { useState, useEffect } from 'react';
import { TranslationSettings } from '@/contexts/SettingsContext';
import { getVoicesForLanguage, findBestVoiceForLanguage } from '@/utils/voiceUtils';

interface UseSettingsFormProps {
  settings: TranslationSettings;
  availableVoices: SpeechSynthesisVoice[];
  updateSettings: (newSettings: Partial<TranslationSettings>) => void;
  onClose: () => void;
}

export const useSettingsForm = ({
  settings,
  availableVoices,
  updateSettings,
  onClose,
}: UseSettingsFormProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handle target language change
  const handleTargetLanguageChange = (newTargetLanguage: string) => {
    const updatedSettings = { ...localSettings, targetLanguage: newTargetLanguage };
    
    // Check if current voice is compatible with new language
    const compatibleVoices = getVoicesForLanguage(newTargetLanguage, availableVoices);
    const currentVoiceCompatible = compatibleVoices.some(voice => voice.name === localSettings.voice);
    
    // If current voice is not compatible, select the best voice for the new language
    if (!currentVoiceCompatible) {
      const bestVoice = findBestVoiceForLanguage(newTargetLanguage, availableVoices);
      updatedSettings.voice = bestVoice;
    }
    
    setLocalSettings(updatedSettings);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  const updateLocalSetting = (field: keyof TranslationSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  return {
    localSettings,
    handleTargetLanguageChange,
    handleSave,
    handleCancel,
    updateLocalSetting,
  };
};
