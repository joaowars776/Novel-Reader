// Main translations index file
import { readerSettingsTranslations } from './reader-settings';
import { readerHistoryTranslations } from './reader-history';
import { homePageTranslations } from './home-page';
import { readerInterfaceTranslations } from './reader-interface';

export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ru' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi';

export interface LanguageInfo {
  code: Language;
  name: string;
}

export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' }
];

// Combine all translations by language
const translations: Record<Language, Record<string, string>> = {} as Record<Language, Record<string, string>>;

// Initialize each language
AVAILABLE_LANGUAGES.forEach(({ code }) => {
  translations[code] = {
    // Combine all translation modules for each language
    ...readerSettingsTranslations[code],
    ...readerHistoryTranslations[code],
    ...homePageTranslations[code],
    ...readerInterfaceTranslations[code]
  };
});

let currentLanguage: Language = 'en';

export const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
  if (savedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === savedLanguage)) {
    currentLanguage = savedLanguage;
  } else {
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (AVAILABLE_LANGUAGES.some(lang => lang.code === browserLang)) {
      currentLanguage = browserLang;
    }
  }
};

export const setLanguage = (language: Language) => {
  currentLanguage = language;
  localStorage.setItem('selectedLanguage', language);
  
  // Trigger a custom event to notify components of language change
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
};

export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

export const getAvailableLanguages = (): LanguageInfo[] => {
  return AVAILABLE_LANGUAGES;
};

export const getTranslation = (key: string): string => {
  const languageTranslations = translations[currentLanguage];
  if (languageTranslations && languageTranslations[key]) {
    return languageTranslations[key];
  }
  
  // Fallback to English
  const englishTranslations = translations['en'];
  if (englishTranslations && englishTranslations[key]) {
    return englishTranslations[key];
  }
  
  // Return key if translation not found
  console.warn(`Translation not found for key: ${key} in language: ${currentLanguage}`);
  return key;
};