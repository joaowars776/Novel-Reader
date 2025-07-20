import React, { useRef, useEffect } from 'react';
    import { Check } from 'lucide-react';
    import { 
      getAvailableLanguages, 
      getCurrentLanguage, 
      setLanguage, 
      getTranslation,
      isDefaultBrowserLanguage,
      getDefaultBrowserLanguageName, // Keep this for potential future use or if the warning is re-added elsewhere
      getDefaultBrowserLanguageCode // New function to get the code
    } from '../utils/translations';
    import type { Language } from '../utils/translations';

    interface LanguageSelectorProps {
      onClose: () => void;
    }

    export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onClose }) => {
      const selectorRef = useRef<HTMLDivElement>(null);
      const currentLanguage = getCurrentLanguage();
      const availableLanguages = getAvailableLanguages();
      const defaultBrowserLanguageCode = getDefaultBrowserLanguageCode(); // Get the code for comparison

      // Close when clicking outside
      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
            onClose();
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside); // Corrected: use handleClickOutside
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
          className="w-full rounded-lg shadow-xl overflow-hidden transition-colors duration-300"
          style={{
            backgroundColor: 'var(--interface-panelBackground)',
            color: 'var(--interface-panelText)',
            border: '1px solid var(--interface-panelBorder)'
          }}
        >
          <div 
            className="px-4 py-3 border-b transition-colors duration-300"
            style={{ borderColor: 'var(--interface-panelBorder)' }}
          >
            <h3 
              className="text-base font-semibold"
              style={{ color: 'var(--interface-textPrimary)' }}
            >
              {getTranslation('language')}
            </h3>
          </div>
          
          <div className="py-1">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="w-full text-left px-4 py-2 text-sm flex items-center justify-between rounded-lg mx-1 transition-colors duration-200"
                style={{
                  color: 'var(--interface-textPrimary)',
                  backgroundColor: 'transparent',
                  // Use a custom style for hover to ensure theme compatibility
                  // This will be overridden by the inline style on hover
                  '--tw-bg-opacity': '0', // Reset Tailwind's default opacity
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interface-panelSecondaryBackground)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="font-medium flex items-center">
                  {language.name}
                  {language.code === defaultBrowserLanguageCode && (
                    <span 
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: 'var(--interface-accent)', 
                        color: 'var(--interface-buttonPrimaryText)' 
                      }}
                    >
                      {getTranslation('default')}
                    </span>
                  )}
                </span>
                {currentLanguage === language.code && (
                  <Check 
                    className="w-4 h-4" 
                    style={{ color: 'var(--interface-accent)' }} 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      );
    };
