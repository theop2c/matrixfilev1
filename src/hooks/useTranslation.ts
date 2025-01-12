import { useLanguageStore } from '@/store/language';
import { translations } from '@/lib/i18n/translations';

export function useTranslation() {
  const { language } = useLanguageStore();
  
  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (!value || typeof value !== 'object') return key;
      value = value[k as keyof typeof value];
    }
    
    return value as string || key;
  };

  return { t, language };
}