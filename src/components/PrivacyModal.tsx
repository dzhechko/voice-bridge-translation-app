
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onAccept }) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <DialogTitle className="text-lg font-semibold">
              {t('privacy.title')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('privacy.content')}
          </p>

          <div className="flex justify-end">
            <Button onClick={onAccept} className="bg-blue-600 hover:bg-blue-700">
              {t('privacy.agree')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
