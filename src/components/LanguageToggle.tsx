import { useLanguageStore } from '@/store/language';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
      className="flex items-center"
    >
      <Globe className="w-4 h-4 mr-2" />
      {language.toUpperCase()}
    </Button>
  );
}