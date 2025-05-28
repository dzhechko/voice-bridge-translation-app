
import React from 'react';
import { Moon, Sun, Settings, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Languages className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="hover:bg-accent"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('main.settings')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="hover:bg-accent"
          >
            <Languages className="w-4 h-4 mr-2" />
            {t('header.language')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-accent"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 mr-2" />
                {t('header.theme.dark')}
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 mr-2" />
                {t('header.theme.light')}
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
