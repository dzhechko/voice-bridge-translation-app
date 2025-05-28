
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'ru' | 'en';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ru: {
    // Header
    'app.title': 'Синхронный переводчик речи',
    'header.language': 'English',
    'header.theme.light': 'Светлая тема',
    'header.theme.dark': 'Тёмная тема',
    
    // Privacy Modal
    'privacy.title': 'Уведомление о конфиденциальности и использовании микрофона',
    'privacy.content': 'Это приложение использует ваш микрофон для записи речи и её перевода в реальном времени. Все данные передаются по защищённому соединению и не сохраняются на сервере. Для работы с виртуальными микрофонами (VB-Cable, Blackhole) убедитесь, что они правильно настроены в системе.',
    'privacy.agree': 'Я согласен',
    
    // Main Interface
    'main.start': 'Начать запись',
    'main.stop': 'Остановить',
    'main.settings': 'Настройки',
    'main.export': 'Экспорт',
    
    // Settings
    'settings.title': 'Настройки перевода',
    'settings.source': 'Исходный язык',
    'settings.target': 'Целевой язык',
    'settings.voice': 'Голос',
    'settings.model': 'OpenAI модель',
    'settings.apikey': 'OpenAI API ключ',
    'settings.save': 'Сохранить',
    'settings.cancel': 'Отмена',
    
    // Status
    'status.idle': 'Готов к записи',
    'status.recording': 'Запись...',
    'status.processing': 'Обработка...',
    'status.translating': 'Перевод...',
    'status.playing': 'Воспроизведение...',
    
    // Transcription
    'transcript.original': 'Оригинальный текст',
    'transcript.translated': 'Перевод',
    
    // Export
    'export.transcript': 'Экспорт транскрипта',
    'export.logs': 'Экспорт логов',
    'export.txt': 'Скачать TXT',
    'export.json': 'Скачать JSON',
    'export.csv': 'Скачать CSV',
    
    // Errors
    'error.mic': 'Ошибка доступа к микрофону',
    'error.translation': 'Ошибка перевода',
    'error.network': 'Ошибка сети',
    'error.retry': 'Повторить',
  },
  en: {
    // Header
    'app.title': 'Synchronous Speech Translator',
    'header.language': 'Русский',
    'header.theme.light': 'Light theme',
    'header.theme.dark': 'Dark theme',
    
    // Privacy Modal
    'privacy.title': 'Privacy and Microphone Usage Notice',
    'privacy.content': 'This application uses your microphone to record speech and translate it in real-time. All data is transmitted over secure connections and is not stored on the server. For virtual microphones (VB-Cable, Blackhole), ensure they are properly configured in your system.',
    'privacy.agree': 'I Agree',
    
    // Main Interface
    'main.start': 'Start Recording',
    'main.stop': 'Stop',
    'main.settings': 'Settings',
    'main.export': 'Export',
    
    // Settings
    'settings.title': 'Translation Settings',
    'settings.source': 'Source Language',
    'settings.target': 'Target Language',
    'settings.voice': 'Voice',
    'settings.model': 'OpenAI Model',
    'settings.apikey': 'OpenAI API Key',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    
    // Status
    'status.idle': 'Ready to record',
    'status.recording': 'Recording...',
    'status.processing': 'Processing...',
    'status.translating': 'Translating...',
    'status.playing': 'Playing...',
    
    // Transcription
    'transcript.original': 'Original Text',
    'transcript.translated': 'Translation',
    
    // Export
    'export.transcript': 'Export Transcript',
    'export.logs': 'Export Logs',
    'export.txt': 'Download TXT',
    'export.json': 'Download JSON',
    'export.csv': 'Download CSV',
    
    // Errors
    'error.mic': 'Microphone access error',
    'error.translation': 'Translation error',
    'error.network': 'Network error',
    'error.retry': 'Retry',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as 'ru' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'ru' ? 'en' : 'ru';
    setLanguage(newLanguage);
    localStorage.setItem('app-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
