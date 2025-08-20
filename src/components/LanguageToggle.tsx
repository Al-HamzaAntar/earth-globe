import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLanguage);
    
    // Update document direction for RTL/LTR support
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
    >
      <Languages className="h-4 w-4 mr-2" />
      {i18n.language === 'ar' ? 'English' : 'العربية'}
    </Button>
  );
};

export default LanguageToggle;