import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Monitor, Eye, Globe } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fade-in">
      <div 
        ref={panelRef}
        className="w-full max-w-md h-full shadow-xl overflow-y-auto animate-slide-in-right"
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
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b sticky top-0"
          style={{ 
            backgroundColor: interfaceStyles.backgroundColor,
            borderColor: interfaceStyles.borderColor 
          }}
        >
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6" style={{ color: '#007BFF' }} />
            <h2 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
              {getTranslation('homePageSettings')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
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
                  <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
              style={{ color: interfaceStyles.color }}
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-4 space-y-6">
          {/* Interface Theme Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5" style={{ color: '#007BFF' }} />
              <h3 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
                {getTranslation('interfaceTheme')}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {INTERFACE_THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    (previewTheme || preferences.selectedInterfaceTheme) === theme.id
                      ? 'transform scale-105'
                      : 'hover:transform hover:scale-102'
                  }`}
                  style={{
                    borderColor: (previewTheme || preferences.selectedInterfaceTheme) === theme.id 
                      ? '#007BFF' 
                      : interfaceStyles.borderColor,
                    backgroundColor: (previewTheme || preferences.selectedInterfaceTheme) === theme.id 
                      ? '#007BFF10' 
                      : 'transparent'
                  }}
                  onClick={() => handleInterfaceThemeChange(theme.id)}
                  onMouseEnter={() => handleThemePreview(theme.id)}
                  onMouseLeave={handleThemePreviewEnd}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium" style={{ color: interfaceStyles.color }}>
                      {theme.name}
                    </h4>
                    {(previewTheme || preferences.selectedInterfaceTheme) === theme.id && (
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: '#007BFF' }}
                      />
                    )}
                  </div>
                  
                  <p className="text-sm mb-3" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {theme.description}
                  </p>

                  {/* Theme Preview Colors */}
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ 
                        backgroundColor: theme.colors.headerBackground,
                        borderColor: interfaceStyles.borderColor
                      }}
                      title="Header"
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ 
                        backgroundColor: theme.colors.panelBackground,
                        borderColor: interfaceStyles.borderColor
                      }}
                      title="Panel"
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ 
                        backgroundColor: theme.colors.buttonPrimary,
                        borderColor: interfaceStyles.borderColor
                      }}
                      title="Accent"
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ 
                        backgroundColor: theme.colors.textPrimary,
                        borderColor: interfaceStyles.borderColor
                      }}
                      title="Text"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Settings */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              borderColor: interfaceStyles.borderColor,
              backgroundColor: interfaceStyles.backgroundColor,
              opacity: 0.95
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" style={{ color: '#007BFF' }} />
                <span className="font-medium" style={{ color: interfaceStyles.color }}>
                  {getTranslation('syncInterfaceWithReading')}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.syncInterfaceWithReading || false}
                  onChange={(e) => handleSyncToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
              {getTranslation('syncInterfaceDescription')}
            </p>
            {preferences.syncInterfaceWithReading && (
              <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#007BFF10' }}>
                <p className="text-xs" style={{ color: '#007BFF' }}>
                  ✓ {getTranslation('syncEnabled')} - {getTranslation('themeChangesWillSync')}
                </p>
              </div>
            )}
          </div>

          {/* Global Font Application */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              borderColor: interfaceStyles.borderColor,
              backgroundColor: interfaceStyles.backgroundColor,
              opacity: 0.95
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium" style={{ color: interfaceStyles.color }}>
                {getTranslation('applyFontGlobally')}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.applyFontGlobally || false}
                  onChange={(e) => handleGlobalFontToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
              {getTranslation('applyFontGloballyDescription')}
            </p>
          </div>

          {/* Current Theme Info */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              borderColor: interfaceStyles.borderColor,
              backgroundColor: '#007BFF10'
            }}
          >
            <h4 className="font-medium mb-2" style={{ color: interfaceStyles.color }}>
              {getTranslation('currentTheme')}
            </h4>
            <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.8 }}>
              {getInterfaceTheme(preferences.selectedInterfaceTheme || 'light').name}
            </p>
            <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
              {getInterfaceTheme(preferences.selectedInterfaceTheme || 'light').description}
            </p>
            {preferences.syncInterfaceWithReading && (
              <p className="text-xs mt-2" style={{ color: '#007BFF' }}>
                {getTranslation('readingThemeWillMatch')}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t"
          style={{ 
            borderColor: interfaceStyles.borderColor,
            backgroundColor: interfaceStyles.backgroundColor,
            opacity: 0.8
          }}
        >
          <p className="text-sm text-center" style={{ color: interfaceStyles.color }}>
            {getTranslation('homePageThemeNote')}
          </p>
        </div>
      </div>
    </div>
  );
};