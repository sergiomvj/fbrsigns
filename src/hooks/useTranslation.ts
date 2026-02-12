import { useState, useEffect, useCallback } from 'react';
import { translations, Locale, Translations } from '@/lib/i18n';

const STORAGE_KEY = 'fbrsigns-locale';

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale;
      if (saved && ['pt', 'en', 'es'].includes(saved)) {
        return saved;
      }
    }
    
    // Try to detect from browser
    const browserLang = typeof navigator !== 'undefined' 
      ? navigator.language.split('-')[0] 
      : 'pt';
    
    if (browserLang === 'en') return 'en';
    if (browserLang === 'es') return 'es';
    return 'pt';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      let value: any = translations[locale];
      
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return key; // Return key if translation not found
        }
      }
      
      return typeof value === 'string' ? value : key;
    },
    [locale]
  );

  return {
    t,
    locale,
    setLocale,
    availableLocales: [
      { code: 'pt', label: 'Português', flag: '🇧🇷' },
      { code: 'en', label: 'English', flag: '🇺🇸' },
      { code: 'es', label: 'Español', flag: '🇪🇸' },
    ] as { code: Locale; label: string; flag: string }[],
  };
}
