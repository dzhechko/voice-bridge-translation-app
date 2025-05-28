
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { settings, updateSettings, availableLanguages, availableVoices, availableModels } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Function to get language-compatible voices
  const getVoicesForLanguage = (targetLanguage: string) => {
    if (!targetLanguage || availableVoices.length === 0) return availableVoices;
    
    const primaryLang = targetLanguage.substring(0, 2).toLowerCase();
    
    // First, get voices that match the exact language code
    const exactMatches = availableVoices.filter(voice => 
      voice.lang.toLowerCase() === targetLanguage.toLowerCase()
    );
    
    // Then, get voices that match the primary language
    const primaryMatches = availableVoices.filter(voice => {
      const voiceLang = voice.lang.substring(0, 2).toLowerCase();
      return voiceLang === primaryLang && 
             voice.lang.toLowerCase() !== targetLanguage.toLowerCase();
    });
    
    // Handle special cases for Chinese
    const chineseMatches = primaryLang === 'zh' ? 
      availableVoices.filter(voice => 
        voice.lang.toLowerCase().includes('cmn') || 
        voice.lang.toLowerCase().includes('chinese')
      ) : [];
    
    // Combine and deduplicate
    const compatibleVoices = [...exactMatches, ...primaryMatches, ...chineseMatches];
    const uniqueVoices = compatibleVoices.filter((voice, index, self) => 
      index === self.findIndex(v => v.name === voice.name)
    );
    
    return uniqueVoices.length > 0 ? uniqueVoices : availableVoices;
  };

  // Function to find the best voice for a language
  const findBestVoiceForLanguage = (targetLanguage: string) => {
    const compatibleVoices = getVoicesForLanguage(targetLanguage);
    if (compatibleVoices.length === 0) return '';
    
    const primaryLang = targetLanguage.substring(0, 2).toLowerCase();
    
    // Prefer exact language match
    const exactMatch = compatibleVoices.find(voice => 
      voice.lang.toLowerCase() === targetLanguage.toLowerCase()
    );
    if (exactMatch) return exactMatch.name;
    
    // Then prefer primary language match
    const primaryMatch = compatibleVoices.find(voice => 
      voice.lang.substring(0, 2).toLowerCase() === primaryLang
    );
    if (primaryMatch) return primaryMatch.name;
    
    // Return first available voice
    return compatibleVoices[0].name;
  };

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handle target language change
  const handleTargetLanguageChange = (newTargetLanguage: string) => {
    const updatedSettings = { ...localSettings, targetLanguage: newTargetLanguage };
    
    // Check if current voice is compatible with new language
    const compatibleVoices = getVoicesForLanguage(newTargetLanguage);
    const currentVoiceCompatible = compatibleVoices.some(voice => voice.name === localSettings.voice);
    
    // If current voice is not compatible, select the best voice for the new language
    if (!currentVoiceCompatible) {
      const bestVoice = findBestVoiceForLanguage(newTargetLanguage);
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

  // Get filtered voices for current target language
  const filteredVoices = getVoicesForLanguage(localSettings.targetLanguage);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-language">{t('settings.source')}</Label>
              <Select
                value={localSettings.sourceLanguage}
                onValueChange={(value) => setLocalSettings({ ...localSettings, sourceLanguage: value })}
              >
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
              <Select
                value={localSettings.targetLanguage}
                onValueChange={handleTargetLanguageChange}
              >
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

          <div className="space-y-2">
            <Label htmlFor="voice">{t('settings.voice')}</Label>
            <Select
              value={localSettings.voice}
              onValueChange={(value) => setLocalSettings({ ...localSettings, voice: value })}
            >
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
            {filteredVoices.length < availableVoices.length && (
              <p className="text-xs text-muted-foreground">
                Showing {filteredVoices.length} voice(s) compatible with selected language
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">{t('settings.model')}</Label>
            <Select
              value={localSettings.openaiModel}
              onValueChange={(value) => setLocalSettings({ ...localSettings, openaiModel: value })}
            >
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

          <div className="space-y-2">
            <Label htmlFor="api-key">{t('settings.apikey')}</Label>
            <Input
              id="api-key"
              type="password"
              value={localSettings.openaiApiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, openaiApiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>

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
