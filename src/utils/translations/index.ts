// Main translations index file
    import { readerSettingsTranslations } from './reader-settings';
    import { readerHistoryTranslations } from './reader-history';
    import { homePageTranslations } from './home-page';
    import { readerInterfaceTranslations } from './reader-interface';

    export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ru' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi' | 'tr' | 'sw';

    export interface LanguageInfo {
      code: Language;
      name: string;
    }

    const unsortedLanguages: LanguageInfo[] = [
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
      { code: 'hi', name: 'हिन्दी' },
      { code: 'tr', name: 'Türkçe' },
      { code: 'sw', name: 'Kiswahili' }
    ];

    // Function to check if a character is a Latin alphabet character
    const isLatinAlphabet = (char: string) => {
      return (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z');
    };

    // Separate languages into three groups: English, other Latin-based, and non-Latin-based
    const englishLanguage = unsortedLanguages.find(lang => lang.code === 'en');
    const otherLanguages = unsortedLanguages.filter(lang => lang.code !== 'en');

    const latinLanguages = otherLanguages.filter(lang => isLatinAlphabet(lang.name.charAt(0)));
    const nonLatinLanguages = otherLanguages.filter(lang => !isLatinAlphabet(lang.name.charAt(0)));

    // Sort Latin-based languages alphabetically by name
    latinLanguages.sort((a, b) => a.name.localeCompare(b.name));

    // Sort non-Latin-based languages alphabetically by name
    nonLatinLanguages.sort((a, b) => a.name.localeCompare(b.name));

    // Combine the sorted lists with English at the top
    export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
      ...(englishLanguage ? [englishLanguage] : []),
      ...latinLanguages,
      ...nonLatinLanguages
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
    let defaultBrowserLanguage: Language = 'en';

    export const initializeLanguage = () => {
      // Detect browser language first
      const browserLang = navigator.language.split('-')[0] as Language;
      if (AVAILABLE_LANGUAGES.some(lang => lang.code === browserLang)) {
        defaultBrowserLanguage = browserLang;
      } else {
        defaultBrowserLanguage = 'en'; // Fallback to English if browser language not supported
      }

      const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
      if (savedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === savedLanguage)) {
        currentLanguage = savedLanguage;
      } else {
        currentLanguage = defaultBrowserLanguage;
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

    export const getTranslation = (key: string, fallbackLang: Language = 'en'): string => {
      const languageTranslations = translations[currentLanguage];
      if (languageTranslations && languageTranslations[key]) {
        return languageTranslations[key];
      }
      
      // Fallback to the specified fallback language (defaulting to English)
      const fallbackTranslations = translations[fallbackLang];
      if (fallbackTranslations && fallbackTranslations[key]) {
        return fallbackTranslations[key];
      }
      
      // Return key if translation not found
      console.warn(`Translation not found for key: ${key} in language: ${currentLanguage}. Fallback to ${fallbackLang} also failed.`);
      return key;
    };

    export const isDefaultBrowserLanguage = (): boolean => {
      return currentLanguage === defaultBrowserLanguage;
    };

    export const getDefaultBrowserLanguageName = (): string => {
      const langInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === defaultBrowserLanguage);
      return langInfo ? langInfo.name : 'English'; // Fallback name
    };

    export const getDefaultBrowserLanguageCode = (): Language => {
      return defaultBrowserLanguage;
    };
