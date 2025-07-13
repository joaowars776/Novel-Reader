import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Monitor, Eye, EyeOff, Maximize, Heart, Volume2, Globe, RotateCcw } from 'lucide-react';
import { INTERFACE_THEMES, COLOR_THEMES, getInterfaceTheme, getColorTheme, applyInterfaceTheme } from '../utils/themes';
import { LanguageSelector } from './LanguageSelector';
import { getTranslation } from '../utils/translations';
import type { ReadingPreferences, InterfaceTheme } from '../types';

interface HomePageSettingsProps {
  preferences: ReadingPreferences;
  onPreferencesChange: (preferences: ReadingPreferences) => void;
  onClose: () => void;
}

export const HomePageSettings: React.FC<HomePageSettingsProps> = ({
  preferences,
  onPreferencesChange,
  onClose
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Get interface theme styles
  const getInterfaceStyles = () => {
    if (!preferences?.interfaceColors) {
      return {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        borderColor: '#e5e7eb'
      };
    }

    return {
      backgroundColor: preferences.interfaceColors.panelBackground || '#ffffff',
      color: preferences.interfaceColors.panelText || '#1f2937',
      borderColor: preferences.interfaceColors.borderColor || '#e5e7eb'
    };
  };

  const interfaceStyles = getInterfaceStyles();

  const handleInterfaceThemeChange = (themeId: string) => {
    const theme = getInterfaceTheme(themeId);
    const updatedPreferences = {
      ...preferences,
      selectedInterfaceTheme: themeId,
      interfaceTheme: themeId,
      interfaceColors: theme.colors
    };

    // If sync is enabled, also update reading colors
    if (preferences.syncInterfaceWithReading) {
      const matchingColorTheme = COLOR_THEMES.find(colorTheme => colorTheme.id === themeId);
      if (matchingColorTheme) {
        updatedPreferences.selectedColorTheme = themeId;
        updatedPreferences.colors = matchingColorTheme.colors;
        updatedPreferences.useThemeBasedColors = true;
      }
    }

    // Apply theme immediately for preview
    applyInterfaceTheme(theme);
    onPreferencesChange(updatedPreferences);
  };

  const handleThemePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    const theme = getInterfaceTheme(themeId);
    applyInterfaceTheme(theme);
  };

  const handleThemePreviewEnd = () => {
    setPreviewTheme(null);
    // Restore current theme
    const currentTheme = getInterfaceTheme(preferences.selectedInterfaceTheme || 'light');
    applyInterfaceTheme(currentTheme);
  };

  const handleSyncToggle = (enabled: boolean) => {
    const updatedPreferences = {
      ...preferences,
      syncInterfaceWithReading: enabled
    };

    if (enabled && preferences.selectedInterfaceTheme) {
      // Sync reading theme with interface theme
      const matchingColorTheme = COLOR_THEMES.find(
        theme => theme.id === preferences.selectedInterfaceTheme
      );
      
      if (matchingColorTheme) {
        updatedPreferences.selectedColorTheme = matchingColorTheme.id;
        updatedPreferences.colors = matchingColorTheme.colors;
        updatedPreferences.useThemeBasedColors = true;
      }
    }

    onPreferencesChange(updatedPreferences);
  };

  const handleGlobalFontToggle = (enabled: boolean) => {
    onPreferencesChange({
      ...preferences,
      applyFontGlobally: enabled
    });
  };

  const handleResetToDefaults = () => {
    if (window.confirm(getTranslation('confirmResetToDefaults'))) {
      // Reset to default light theme
      const defaultTheme = getInterfaceTheme('light');
      const defaultPreferences = {
        ...preferences,
        selectedInterfaceTheme: 'light',
        interfaceTheme: 'light',
        interfaceColors: defaultTheme.colors,
        syncInterfaceWithReading: true,
        applyFontGlobally: false
      };
      
      applyInterfaceTheme(defaultTheme);
      onPreferencesChange(defaultPreferences);
    }
  };

  // Theme Preview Component
  const ThemePreview: React.FC<{ theme: InterfaceTheme; isSelected: boolean }> = ({ theme, isSelected }) => (
    <div
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
        isSelected ? 'transform scale-105 shadow-xl' : 'hover:transform hover:scale-102 hover:shadow-lg'
      }`}
      style={{
        borderColor: isSelected ? '#007BFF' : interfaceStyles.borderColor,
        backgroundColor: isSelected ? '#007BFF08' : 'transparent'
      }}
      onClick={() => handleInterfaceThemeChange(theme.id)}
      onMouseEnter={() => handleThemePreview(theme.id)}
      onMouseLeave={handleThemePreviewEnd}
    >
      {/* Theme Preview Panel */}
      <div 
        className="w-full h-24 rounded-lg mb-3 border overflow-hidden relative"
        style={{ 
          backgroundColor: theme.colors.panelBackground,
          borderColor: theme.colors.panelBorder
        }}
      >
        {/* Header Bar */}
        <div 
          className="h-6 w-full flex items-center px-2 border-b"
          style={{ 
            backgroundColor: theme.colors.headerBackground,
            borderColor: theme.colors.headerBorder
          }}
        >
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
          <div 
            className="ml-2 text-xs font-medium"
            style={{ color: theme.colors.headerText }}
          >
            {getTranslation('homePagePreview')}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-2 h-full">
          <div 
            className="text-xs font-semibold mb-1"
            style={{ color: theme.colors.textPrimary }}
          >
            {getTranslation('sampleTitle')}
          </div>
          <div 
            className="text-xs leading-relaxed"
            style={{ color: theme.colors.textSecondary }}
          >
            {getTranslation('sampleContent')}
          </div>
          
          {/* Sample Button */}
          <div 
            className="mt-2 px-2 py-1 rounded text-xs font-medium inline-block"
            style={{ 
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonPrimaryText
            }}
          >
            {getTranslation('sampleButton')}
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-semibold text-sm" style={{ color: interfaceStyles.color }}>
            {getTranslation(`theme${theme.id.charAt(0).toUpperCase() + theme.id.slice(1)}`)}
            {theme.id === 'light' && (
              <span className="text-xs text-gray-500 ml-1">({getTranslation('default')})</span>
            )}
          </h4>
          <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
            {getTranslation(`theme${theme.id.charAt(0).toUpperCase() + theme.id.slice(1)}Description`)}
          </p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#007BFF' }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Color Palette */}
      <div className="flex gap-1 mb-2">
        <div 
          className="w-4 h-4 rounded border"
          style={{ 
            backgroundColor: theme.colors.headerBackground,
            borderColor: interfaceStyles.borderColor
          }}
          title={getTranslation('headerColor')}
        />
        <div 
          className="w-4 h-4 rounded border"
          style={{ 
            backgroundColor: theme.colors.panelBackground,
            borderColor: interfaceStyles.borderColor
          }}
          title={getTranslation('panelColor')}
        />
        <div 
          className="w-4 h-4 rounded border"
          style={{ 
            backgroundColor: theme.colors.buttonPrimary,
            borderColor: interfaceStyles.borderColor
          }}
          title={getTranslation('accentColor')}
        />
        <div 
          className="w-4 h-4 rounded border"
          style={{ 
            backgroundColor: theme.colors.textPrimary,
            borderColor: interfaceStyles.borderColor
          }}
          title={getTranslation('textColor')}
        />
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#007BFF' }}
          >
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fade-in">
      <div 
        ref={panelRef}
        className="w-full max-w-2xl h-full shadow-xl overflow-hidden animate-slide-in-right flex flex-col"
        style={{
          backgroundColor: interfaceStyles.backgroundColor,
          fontFamily: preferences?.applyFontGlobally ? 
            (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
             preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
             preferences.fontFamily === 'Crimson Text' ? 'Crimson Text, serif' :
             preferences.fontFamily === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
             'Georgia, serif') : undefined
        }}
        data-settings-panel
      >
        {/* Header - Fixed at top with higher z-index */}
        <div 
          className="flex items-center justify-between p-6 border-b flex-shrink-0 relative z-10"
          style={{ 
            backgroundColor: interfaceStyles.backgroundColor,
            borderColor: interfaceStyles.borderColor 
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: '#007BFF20' }}
            >
              <Monitor className="w-6 h-6" style={{ color: '#007BFF' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: interfaceStyles.color }}>
                {getTranslation('homePageSettings')}
              </h2>
              <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                {getTranslation('customizeHomePageAppearance')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Reset to Defaults */}
            <button
              onClick={handleResetToDefaults}
              className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300 group"
              style={{ color: '#ef4444' }}
              aria-label={getTranslation('resetToDefaults')}
              title={getTranslation('resetToDefaults')}
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                style={{ color: interfaceStyles.color }}
                aria-label={getTranslation('language')}
              >
                <Globe className="w-5 h-5" />
              </button>
              
              {showLanguageSelector && (
                <div className="absolute top-full right-0 mt-2 z-50">
                  <div 
                    className="rounded-lg shadow-xl border-2 py-2 min-w-48 animate-fade-in"
                    style={{
                      backgroundColor: interfaceStyles.backgroundColor,
                      borderColor: interfaceStyles.borderColor,
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
              style={{ color: interfaceStyles.color }}
              aria-label={getTranslation('closeSettings')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Interface Theme Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6" style={{ color: '#007BFF' }} />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
                    {getTranslation('interfaceTheme')}
                  </h3>
                  <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {getTranslation('chooseInterfaceTheme')}
                  </p>
                </div>
              </div>
              
              {/* Themes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERFACE_THEMES.map((theme) => (
                  <ThemePreview
                    key={theme.id}
                    theme={theme}
                    isSelected={(previewTheme || preferences.selectedInterfaceTheme) === theme.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Footer - Fixed at bottom */}
        <div 
          className="p-6 border-t flex-shrink-0"
          style={{ 
            borderColor: interfaceStyles.borderColor,
            backgroundColor: interfaceStyles.backgroundColor,
            opacity: 0.95
          }}
        >
          <p className="text-sm text-center" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
            {getTranslation('homePageThemeNote')}
          </p>
        </div>
      </div>
    </div>
  );
};