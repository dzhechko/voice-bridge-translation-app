
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TranslationSettings {
  sourceLanguage: string;
  targetLanguage: string;
  voice: string;
  openaiModel: string;
  openaiApiKey: string;
}

interface SettingsContextType {
  settings: TranslationSettings;
  updateSettings: (newSettings: Partial<TranslationSettings>) => void;
  availableLanguages: { code: string; name: string }[];
  availableVoices: SpeechSynthesisVoice[];
  availableModels: { id: string; name: string }[];
}

const defaultSettings: TranslationSettings = {
  sourceLanguage: 'ru-RU',
  targetLanguage: 'en-US',
  voice: '',
  openaiModel: 'gpt-4o-mini',
  openaiApiKey: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<TranslationSettings>(defaultSettings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const availableLanguages = [
    { code: 'ru-RU', name: 'Русский (Россия)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'fr-FR', name: 'Français (France)' },
    { code: 'de-DE', name: 'Deutsch (Deutschland)' },
    { code: 'it-IT', name: 'Italiano (Italia)' },
    { code: 'pt-PT', name: 'Português (Portugal)' },
    { code: 'zh-CN', name: '中文 (中国)' },
    { code: 'ja-JP', name: '日本語 (日本)' },
    { code: 'ko-KR', name: '한국어 (대한민국)' },
  ];

  const availableModels = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Recommended)' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ];

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('translation-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }

    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice if none selected
      if (!settings.voice && voices.length > 0) {
        const defaultVoice = voices.find(v => v.lang.includes('en')) || voices[0];
        updateSettings({ voice: defaultVoice.name });
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const updateSettings = (newSettings: Partial<TranslationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('translation-settings', JSON.stringify(updatedSettings));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        availableLanguages,
        availableVoices,
        availableModels,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
