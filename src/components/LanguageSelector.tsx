import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { getAvailableLanguages, getCurrentLanguage, setLanguage, getTranslation } from '../utils/translations';
import type { Language } from '../utils/translations';

interface LanguageSelectorProps {
  onClose: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onClose }) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const currentLanguage = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleLanguageChange = (languageCode: Language) => {
    setLanguage(languageCode);
    onClose();
    // Force re-render by triggering a custom event
    window.dispatchEvent(new CustomEvent('languageChanged'));
  };

  return (
    <div 
      ref={selectorRef}
      className="w-full"
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{getTranslation('language')}</h3>
      </div>
      
      <div className="py-1">
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-between rounded-lg mx-1"
          >
            <span className="text-gray-900">{language.name}</span>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};