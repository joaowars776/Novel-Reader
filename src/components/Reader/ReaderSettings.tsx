import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Palette, Type, Layout, Settings as SettingsIcon, Download, Upload, Eye, EyeOff, BookOpen, Zap, Moon, Sun, Volume2, Globe } from 'lucide-react';
import { INTERFACE_THEMES, COLOR_THEMES, getInterfaceTheme, applyInterfaceTheme } from '../../utils/themes';
import { resetToDefaults, exportUserData, importUserData } from '../../utils/storage';
import { LanguageSelector } from '../LanguageSelector';
import { getTranslation } from '../../utils/translations';
import type { ReadingPreferences, InterfaceTheme } from '../../types';

interface ReaderSettingsProps {
  preferences: ReadingPreferences;
  onPreferencesChange: (preferences: ReadingPreferences) => void;
  onClose: () => void;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  defaultColor: string;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label, defaultColor, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
    setCustomColor(newColor);
    onChange(newColor);
  };

  const isDefault = color === defaultColor;

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-12 rounded-lg border-2 flex items-center justify-between px-3 transition-all duration-300 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-100' 
            : 'hover:border-gray-400 cursor-pointer'
        }`}
        style={{ 
          backgroundColor: disabled ? '#f3f4f6' : color,
          borderColor: isDefault ? '#007BFF' : '#d1d5db'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium" style={{ color: disabled ? '#6b7280' : '#1f2937' }}>
            {isDefault && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                {getTranslation('default')}
              </span>
            )}
            {color.toUpperCase()}
          </span>
        </div>
        {!disabled && <Palette className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-fade-in">
          <div className="space-y-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#000000"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleColorChange(defaultColor)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                {getTranslation('resetToDefault')}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                {getTranslation('done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  preferences,
  onPreferencesChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'interface' | 'controls' | 'backup'>('reading');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fastFavoriteName, setFastFavoriteName] = useState(preferences.fastFavoriteName || 'Quick Bookmark');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showScrollButtonOptions, setShowScrollButtonOptions] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply interface theme when preferences change
  useEffect(() => {
    if (preferences.selectedInterfaceTheme) {
      const theme = getInterfaceTheme(preferences.selectedInterfaceTheme);
      applyInterfaceTheme(theme);
    }
  }, [preferences.selectedInterfaceTheme]);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render by updating state
      setActiveTab(prev => prev);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleInterfaceThemeChange = (themeId: string) => {
    const selectedTheme = getInterfaceTheme(themeId);
    
    const updatedPreferences = {
      ...preferences,
      selectedInterfaceTheme: themeId,
      interfaceTheme: themeId,
      interfaceColors: selectedTheme.colors
    };

    // If sync is enabled, also update reading theme
    if (preferences.syncInterfaceWithReading) {
      const readingTheme = COLOR_THEMES.find(theme => theme.id === themeId);
      if (readingTheme) {
        updatedPreferences.selectedColorTheme = themeId;
        updatedPreferences.colors = readingTheme.colors;
      }
    }

    // Apply theme immediately
    applyInterfaceTheme(selectedTheme);
    
    onPreferencesChange(updatedPreferences);
  };

  const handleColorThemeChange = (themeId: string) => {
    const selectedTheme = COLOR_THEMES.find(theme => theme.id === themeId);
    if (!selectedTheme) return;

    const updatedPreferences = {
      ...preferences,
      selectedColorTheme: themeId,
      colors: selectedTheme.colors,
      useThemeBasedColors: true
    };

    // If sync is enabled, also update interface theme
    if (preferences.syncInterfaceWithReading) {
      const interfaceTheme = getInterfaceTheme(themeId);
      updatedPreferences.selectedInterfaceTheme = interfaceTheme.id;
      updatedPreferences.interfaceColors = interfaceTheme.colors;
      applyInterfaceTheme(interfaceTheme);
    }

    onPreferencesChange(updatedPreferences);
  };

  const handleSyncToggle = (enabled: boolean) => {
    const updatedPreferences = {
      ...preferences,
      syncInterfaceWithReading: enabled
    };

    if (enabled && preferences.selectedColorTheme) {
      // Sync interface theme with reading theme
      const interfaceTheme = getInterfaceTheme(preferences.selectedColorTheme);
      updatedPreferences.selectedInterfaceTheme = interfaceTheme.id;
      updatedPreferences.interfaceColors = interfaceTheme.colors;
      applyInterfaceTheme(interfaceTheme);
    }

    onPreferencesChange(updatedPreferences);
  };

  const handleResetToDefaults = async () => {
    if (window.confirm(getTranslation('confirmResetSettings'))) {
      try {
        await resetToDefaults();
        window.location.reload();
      } catch (error) {
        console.error('Error resetting to defaults:', error);
        alert(getTranslation('failedToResetSettings'));
      }
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ebook-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert(getTranslation('exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);
      
      await importUserData(data);
      alert(getTranslation('importSuccess'));
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert(getTranslation('importFailed'));
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get current interface theme styles
  const currentInterfaceTheme = getInterfaceTheme(preferences.selectedInterfaceTheme || 'light');
  const interfaceStyles = {
    backgroundColor: currentInterfaceTheme.colors.panelBackground,
    color: currentInterfaceTheme.colors.textPrimary,
    borderColor: currentInterfaceTheme.colors.panelBorder
  };

  const tabs = [
    { id: 'reading' as const, label: getTranslation('reading'), icon: Type },
    { id: 'interface' as const, label: getTranslation('interface'), icon: Palette },
    { id: 'controls' as const, label: getTranslation('controls'), icon: Layout },
    { id: 'backup' as const, label: getTranslation('backup'), icon: SettingsIcon }
  ];

  // Font preview styles
  const getFontPreviewStyle = (fontFamily: string) => {
    const fonts = {
      'Inter': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      'Georgia': 'Georgia, serif',
      'JetBrains Mono': 'JetBrains Mono, monospace'
    };
    return { fontFamily: fonts[fontFamily as keyof typeof fonts] || fonts.Inter };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fade-in">
      <div 
        ref={settingsRef}
        className="w-full max-w-md h-full shadow-xl overflow-hidden flex flex-col animate-slide-in-right"
        style={{
          backgroundColor: interfaceStyles.backgroundColor,
          fontFamily: preferences?.applyFontGlobally ? 
            (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
             preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
             preferences.fontFamily === 'Georgia' ? 'Georgia, serif' :
             'Inter, sans-serif') : undefined
        }}
        data-settings-panel="true"
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          <h2 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
            {getTranslation('readingSettings')}
          </h2>
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

        {/* Tabs */}
        <div 
          className="flex border-b"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'border-b-2' 
                    : 'hover:bg-gray-100 hover:bg-opacity-20'
                }`}
                style={{
                  color: activeTab === tab.id ? '#007BFF' : interfaceStyles.color,
                  borderColor: activeTab === tab.id ? '#007BFF' : 'transparent'
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'reading' && (
            <>
              {/* Typography Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: interfaceStyles.color }}>
                  {getTranslation('typography')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: interfaceStyles.color }}>
                      {getTranslation('fontFamily')}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { value: 'Inter', label: 'Inter (Sans-Serif)', isDefault: true },
                        { value: 'Georgia', label: 'Georgia (Serif)', isDefault: false },
                        { value: 'JetBrains Mono', label: 'JetBrains Mono (Monospace)', isDefault: false }
                      ].map((font) => (
                        <button
                          key={font.value}
                          onClick={() => onPreferencesChange({
                            ...preferences,
                            fontFamily: font.value as any
                          })}
                          className={`p-3 text-left rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                            preferences.fontFamily === font.value
                              ? 'border-blue-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: preferences.fontFamily === font.value 
                              ? `${currentInterfaceTheme.colors.accent}20` 
                              : 'transparent',
                            borderColor: preferences.fontFamily === font.value 
                              ? currentInterfaceTheme.colors.accent 
                              : interfaceStyles.borderColor,
                            color: interfaceStyles.color,
                            ...getFontPreviewStyle(font.value)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {font.label}
                              {font.isDefault && (
                                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                  {getTranslation('default')}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="text-sm mt-1 opacity-70" style={getFontPreviewStyle(font.value)}>
                            {getTranslation('fontPreviewText')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: interfaceStyles.color }}>
                      {getTranslation('fontSize')}: {preferences.fontSize}px
                      {preferences.fontSize === 38 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {getTranslation('default')}: 38px
                        </span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="64"
                      value={preferences.fontSize}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        fontSize: parseInt(e.target.value)
                      })}
                      className="slider w-full"
                      style={{
                        background: `linear-gradient(to right, #007BFF 0%, #007BFF ${((preferences.fontSize - 12) / (64 - 12)) * 100}%, #e5e7eb ${((preferences.fontSize - 12) / (64 - 12)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <span>12px</span>
                      <span>64px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: interfaceStyles.color }}>
                      {getTranslation('lineHeight')}: {preferences.lineHeight}
                      {preferences.lineHeight === 1.6 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {getTranslation('default')}: 1.6
                        </span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="1.2"
                      max="2.5"
                      step="0.1"
                      value={preferences.lineHeight}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        lineHeight: parseFloat(e.target.value)
                      })}
                      className="slider w-full"
                      style={{
                        background: `linear-gradient(to right, #007BFF 0%, #007BFF ${((preferences.lineHeight - 1.2) / (2.5 - 1.2)) * 100}%, #e5e7eb ${((preferences.lineHeight - 1.2) / (2.5 - 1.2)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <span>1.2</span>
                      <span>2.5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: interfaceStyles.color }}>
                      {getTranslation('letterSpacing')}: {preferences.marginSize}em
                      {preferences.marginSize === 0.5 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {getTranslation('default')}: 0.5em
                        </span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={preferences.marginSize}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        marginSize: parseFloat(e.target.value)
                      })}
                      className="slider w-full"
                      style={{
                        background: `linear-gradient(to right, #007BFF 0%, #007BFF ${(preferences.marginSize / 3) * 100}%, #e5e7eb ${(preferences.marginSize / 3) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <span>0em</span>
                      <span>3em</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: interfaceStyles.color }}>
                      {getTranslation('contentWidth')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'phone', label: getTranslation('phone') },
                        { value: 'normal', label: getTranslation('normal') },
                        { value: 'full', label: getTranslation('full') }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onPreferencesChange({
                            ...preferences,
                            maxWidth: option.value as any
                          })}
                          className={`p-4 text-sm rounded-lg border transition-all duration-300 ${
                            preferences.maxWidth === option.value
                              ? 'border-blue-500 bg-blue-50 bg-opacity-20'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{
                            backgroundColor: preferences.maxWidth === option.value 
                              ? `${currentInterfaceTheme.colors.accent}20` 
                              : 'transparent',
                            borderColor: preferences.maxWidth === option.value 
                              ? currentInterfaceTheme.colors.accent 
                              : interfaceStyles.borderColor,
                            color: interfaceStyles.color,
                            minHeight: '64px'
                          }}
                        >
                          {option.label}
                          {option.value === 'full' && (
                            <span className="block mt-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                              {getTranslation('default')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reading Color Themes */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: interfaceStyles.color }}>
                  {getTranslation('colors')}
                </h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-3" style={{ color: interfaceStyles.color }}>
                    {getTranslation('readingColors')}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {COLOR_THEMES.filter(theme => theme.id !== 'custom').map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleColorThemeChange(theme.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                          preferences.selectedColorTheme === theme.id
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: preferences.selectedColorTheme === theme.id 
                            ? `${currentInterfaceTheme.colors.accent}20` 
                            : theme.colors.backgroundColor,
                          borderColor: preferences.selectedColorTheme === theme.id 
                            ? currentInterfaceTheme.colors.accent 
                            : theme.colors.textColor,
                          color: theme.colors.textColor
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {getTranslation(theme.id)}
                            {theme.id === 'light' && (
                              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                {getTranslation('default')}
                              </span>
                            )}
                          </span>
                          <div className="flex gap-1">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: theme.colors.backgroundColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: theme.colors.textColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: theme.colors.chapterTitleColor }}
                            />
                          </div>
                        </div>
                        <p className="text-sm opacity-80 mb-1">{getTranslation(`${theme.id}Description`)}</p>
                        <p className="text-xs opacity-60">{getTranslation(`${theme.id}Usage`)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-4 p-4 bg-gray-50 bg-opacity-20 rounded-lg">
                  <h4 className="font-medium" style={{ color: interfaceStyles.color }}>
                    {getTranslation('custom')}
                  </h4>
                  <ColorPicker
                    color={preferences.colors.backgroundColor}
                    onChange={(color) => onPreferencesChange({
                      ...preferences,
                      selectedColorTheme: 'custom',
                      colors: { ...preferences.colors, backgroundColor: color }
                    })}
                    label={getTranslation('backgroundColor')}
                    defaultColor="#ffffff"
                  />
                  <ColorPicker
                    color={preferences.colors.textColor}
                    onChange={(color) => onPreferencesChange({
                      ...preferences,
                      selectedColorTheme: 'custom',
                      colors: { ...preferences.colors, textColor: color }
                    })}
                    label={getTranslation('textColor')}
                    defaultColor="#000000"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'interface' && (
            <>
              {/* Interface Themes */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: interfaceStyles.color }}>
                  {getTranslation('interfaceColors')}
                </h3>
                
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {INTERFACE_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleInterfaceThemeChange(theme.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                        preferences.selectedInterfaceTheme === theme.id
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: preferences.selectedInterfaceTheme === theme.id 
                          ? `${theme.colors.accent}20` 
                          : theme.colors.panelBackground,
                        borderColor: preferences.selectedInterfaceTheme === theme.id 
                          ? theme.colors.accent 
                          : theme.colors.panelBorder,
                        color: theme.colors.textPrimary
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {getTranslation(theme.id)}
                          {theme.isDefault && (
                            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                              {getTranslation('default')}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: theme.colors.headerBackground }}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: theme.colors.panelBackground }}
                          />
                        </div>
                      </div>
                      <p className="text-sm opacity-80">{theme.description}</p>
                    </button>
                  ))}
                </div>

                {/* Synchronization Options */}
                <div className="space-y-4 p-4 bg-gray-50 bg-opacity-20 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.syncInterfaceWithReading || false}
                      onChange={(e) => handleSyncToggle(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium" style={{ color: interfaceStyles.color }}>
                        {getTranslation('syncInterfaceAndReadingColors')}
                      </span>
                      <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        {getTranslation('syncDescription')}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.applyFontGlobally || false}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        applyFontGlobally: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium" style={{ color: interfaceStyles.color }}>
                        {getTranslation('applyFontGlobally')}
                      </span>
                      <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        {getTranslation('applyFontGloballyDescription')}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}

          {activeTab === 'controls' && (
            <>
              {/* Interface Controls */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: interfaceStyles.color }}>
                  {getTranslation('interface')}
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.hideMenuWhileReading}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        hideMenuWhileReading: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium" style={{ color: interfaceStyles.color }}>
                        {getTranslation('autoHideMenu')}
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {getTranslation('default')}: {getTranslation('checked')}
                        </span>
                      </span>
                      <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        {getTranslation('autoHideMenuDescription')}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.scrollButtons.visible}
                      onChange={(e) => {
                        onPreferencesChange({
                          ...preferences,
                          scrollButtons: { ...preferences.scrollButtons, visible: e.target.checked }
                        });
                        setShowScrollButtonOptions(e.target.checked);
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium" style={{ color: interfaceStyles.color }}>
                        {getTranslation('showScrollButtons')}
                        <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
                          {getTranslation('default')}: {getTranslation('unchecked')}
                        </span>
                      </span>
                      <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        {getTranslation('showScrollButtonsDescription')}
                      </p>
                    </div>
                  </label>

                  {/* Scroll Button Options */}
                  {(preferences.scrollButtons.visible || showScrollButtonOptions) && (
                    <div className="ml-7 space-y-3 animate-fade-in">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: interfaceStyles.color }}>
                          {getTranslation('buttonSize')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'small', label: getTranslation('small'), size: '40px' },
                            { value: 'medium', label: getTranslation('medium'), size: '48px' },
                            { value: 'large', label: getTranslation('large'), size: '64px' },
                            { value: 'custom', label: getTranslation('custom'), size: 'Custom' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => onPreferencesChange({
                                ...preferences,
                                scrollButtons: { 
                                  ...preferences.scrollButtons, 
                                  size: option.value as any 
                                }
                              })}
                              className={`p-2 text-sm rounded border transition-all duration-300 ${
                                preferences.scrollButtons.size === option.value
                                  ? 'border-blue-500 bg-blue-50 bg-opacity-20'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{
                                backgroundColor: preferences.scrollButtons.size === option.value 
                                  ? `${currentInterfaceTheme.colors.accent}20` 
                                  : 'transparent',
                                borderColor: preferences.scrollButtons.size === option.value 
                                  ? currentInterfaceTheme.colors.accent 
                                  : interfaceStyles.borderColor,
                                color: interfaceStyles.color
                              }}
                            >
                              <div>{option.label}</div>
                              <div className="text-xs opacity-60">
                                {option.value === 'medium' && (
                                  <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                    {getTranslation('default')}
                                  </span>
                                )}
                                {option.value !== 'custom' && ` (${option.size})`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {preferences.scrollButtons.size === 'custom' && (
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: interfaceStyles.color }}>
                            {getTranslation('customSize')}: {preferences.scrollButtons.customSize || 48}px
                          </label>
                          <input
                            type="range"
                            min="24"
                            max="80"
                            value={preferences.scrollButtons.customSize || 48}
                            onChange={(e) => onPreferencesChange({
                              ...preferences,
                              scrollButtons: {
                                ...preferences.scrollButtons,
                                customSize: parseInt(e.target.value) || 48
                              }
                            })}
                            className="slider w-full"
                            style={{
                              background: `linear-gradient(to right, #007BFF 0%, #007BFF ${((preferences.scrollButtons.customSize || 48) - 24) / (80 - 24) * 100}%, #e5e7eb ${((preferences.scrollButtons.customSize || 48) - 24) / (80 - 24) * 100}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                            <span>24px</span>
                            <span>80px</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reading Experience */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: interfaceStyles.color }}>
                  {getTranslation('readingExperience')}
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.enableTextToSpeech || false}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        enableTextToSpeech: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium flex items-center gap-2" style={{ color: interfaceStyles.color }}>
                        <Volume2 className="w-4 h-4" />
                        {getTranslation('textToSpeechSupport')}
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                          {getTranslation('experimental')}
                        </span>
                      </span>
                      <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        {getTranslation('textToSpeechDescription')}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.enableFastFavorite || false}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        enableFastFavorite: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium" style={{ color: interfaceStyles.color }}>
                        {getTranslation('fastFavorite')}
                      </span>
                      <p className="text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        {getTranslation('fastFavoriteDescription')}
                      </p>
                    </div>
                  </label>

                  {preferences.enableFastFavorite && (
                    <div className="ml-7 animate-fade-in">
                      <label className="block text-sm font-medium mb-2" style={{ color: interfaceStyles.color }}>
                        {getTranslation('defaultBookmarkName')}:
                      </label>
                      <input
                        type="text"
                        value={fastFavoriteName}
                        onChange={(e) => {
                          setFastFavoriteName(e.target.value);
                          onPreferencesChange({
                            ...preferences,
                            fastFavoriteName: e.target.value
                          });
                        }}
                        placeholder="Quick Bookmark"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        style={{
                          backgroundColor: currentInterfaceTheme.colors.inputBackground,
                          color: currentInterfaceTheme.colors.inputText,
                          borderColor: currentInterfaceTheme.colors.inputBorder
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'backup' && (
            <>
              {/* Backup & Reset */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: interfaceStyles.color }}>
                  {getTranslation('backupAndReset')}
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${currentInterfaceTheme.colors.accent}15` }}>
                    <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: interfaceStyles.color }}>
                      <Download className="w-4 h-4" style={{ color: currentInterfaceTheme.colors.accent }} />
                      {getTranslation('exportSettings')}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: interfaceStyles.color, opacity: 0.8 }}>
                      {getTranslation('exportDescription')}
                    </p>
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 text-sm"
                      style={{
                        backgroundColor: currentInterfaceTheme.colors.buttonPrimary,
                        color: currentInterfaceTheme.colors.buttonPrimaryText
                      }}
                    >
                      <Download className="w-4 h-4" />
                      {isExporting ? getTranslation('exporting') : getTranslation('exportData')}
                    </button>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${currentInterfaceTheme.colors.success}15` }}>
                    <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: interfaceStyles.color }}>
                      <Upload className="w-4 h-4" style={{ color: currentInterfaceTheme.colors.success }} />
                      {getTranslation('importSettings')}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: interfaceStyles.color, opacity: 0.8 }}>
                      {getTranslation('importDescription')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 text-sm"
                      style={{
                        backgroundColor: currentInterfaceTheme.colors.success,
                        color: '#ffffff'
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      {isImporting ? getTranslation('importing') : getTranslation('importData')}
                    </button>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${currentInterfaceTheme.colors.error}15` }}>
                    <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: interfaceStyles.color }}>
                      <RotateCcw className="w-4 h-4" style={{ color: currentInterfaceTheme.colors.error }} />
                      {getTranslation('resetToDefault')}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: interfaceStyles.color, opacity: 0.8 }}>
                      {getTranslation('resetDescription')}
                    </p>
                    <button
                      onClick={handleResetToDefaults}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-sm"
                      style={{
                        backgroundColor: currentInterfaceTheme.colors.error,
                        color: '#ffffff'
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {getTranslation('resetToDefault')}
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-4 p-4 rounded-lg border-l-4" style={{ 
                  backgroundColor: `${currentInterfaceTheme.colors.warning}15`,
                  borderColor: currentInterfaceTheme.colors.warning
                }}>
                  <p className="text-sm" style={{ color: interfaceStyles.color }}>
                    <strong>⚠️ {getTranslation('important')}:</strong> {getTranslation('backupWarning')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};