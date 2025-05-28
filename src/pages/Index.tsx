
import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import MainApp from '@/components/MainApp';

const Index: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <LanguageProvider>
        <SettingsProvider>
          <MainApp />
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Index;
