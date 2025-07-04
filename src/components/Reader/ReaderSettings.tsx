import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Type, Monitor, Eye, EyeOff, RotateCcw, Globe, Layers, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { COLOR_THEMES, INTERFACE_THEMES, getColorTheme, getInterfaceTheme } from '../../utils/themes';
import { LanguageSelector } from '../LanguageSelector';
import { getTranslation } from '../../utils/translations';
import { resetToDefaults } from '../../utils/storage';
import type { ReadingPreferences, ColorTheme, InterfaceTheme } from '../../types';

interface ReaderSettingsProps {
  preferences: ReadingPreferences;
  onPreferencesChange: (preferences: ReadingPreferences) => void;
  onClose: () => void;
}

// Default values for comparison
const DEFAULT_VALUES = {
  fontSize: 38,
  lineHeight: 1.6,
  marginSize: 0.5,
  fontFamily: 'Inter',
  maxWidth: 'full',
  hideMenuWhileReading: true,
  scrollButtons: { visible: false, size: 'medium', customSize: 48 },
  cornerNavigation: { visible: false },
  syncInterfaceWithReading: true,
  selectedColorTheme: 'light',
  selectedInterfaceTheme: 'light',
  themeApplyMode: 'both',
  iconVisibility: {
    showSearchIcon: true,
    showBookmarkIcon: true,
    showFavoriteIcon: true,
    showShareIcon: true,
    showFullscreenIcon: true
  }
};

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  preferences,
  onPreferencesChange,
  onClose
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [themeApplyMode, setThemeApplyMode] = useState<'both' | 'interface' | 'reader'>('both');
  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'advanced'>('appearance');

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

  // Check if value is default
  const isDefault = (key: string, value: any) => {
    if (key === 'scrollButtons') {
      return JSON.stringify(value) === JSON.stringify(DEFAULT_VALUES.scrollButtons);
    }
    if (key === 'cornerNavigation') {
      return JSON.stringify(value) === JSON.stringify(DEFAULT_VALUES.cornerNavigation);
    }
    if (key === 'themeApplyMode') {
      return value === DEFAULT_VALUES.themeApplyMode;
    }
    if (key === 'iconVisibility') {
      return JSON.stringify(value) === JSON.stringify(DEFAULT_VALUES.iconVisibility);
    }
    return DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES] === value;
  };

  // Slider functionality
  const handleSliderChange = (key: keyof ReadingPreferences, value: number) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const handleNestedSliderChange = (parentKey: keyof ReadingPreferences, childKey: string, value: number) => {
    const parentObject = preferences[parentKey] as any;
    onPreferencesChange({
      ...preferences,
      [parentKey]: {
        ...parentObject,
        [childKey]: value
      }
    });
  };

  const handleColorThemeChange = (themeId: string) => {
    const theme = getColorTheme(themeId);
    let updatedPreferences = {
      ...preferences,
      selectedColorTheme: themeId,
      useThemeBasedColors: themeId !== 'custom'
    };

    // Apply based on mode
    if (themeApplyMode === 'both' || themeApplyMode === 'reader') {
      updatedPreferences.colors = theme.colors;
    }

    if (themeApplyMode === 'both' || themeApplyMode === 'interface') {
      const matchingInterfaceTheme = INTERFACE_THEMES.find(interfaceTheme => interfaceTheme.id === themeId);
      if (matchingInterfaceTheme) {
        updatedPreferences.selectedInterfaceTheme = themeId;
        updatedPreferences.interfaceColors = matchingInterfaceTheme.colors;
      }
    }

    onPreferencesChange(updatedPreferences);
  };

  const handleInterfaceThemeChange = (themeId: string) => {
    const theme = getInterfaceTheme(themeId);
    let updatedPreferences = {
      ...preferences,
      selectedInterfaceTheme: themeId
    };

    // Apply based on mode
    if (themeApplyMode === 'both' || themeApplyMode === 'interface') {
      updatedPreferences.interfaceColors = theme.colors;
    }

    if (themeApplyMode === 'both' || themeApplyMode === 'reader') {
      const matchingColorTheme = COLOR_THEMES.find(colorTheme => colorTheme.id === themeId);
      if (matchingColorTheme) {
        updatedPreferences.selectedColorTheme = themeId;
        updatedPreferences.colors = matchingColorTheme.colors;
        updatedPreferences.useThemeBasedColors = true;
      }
    }

    onPreferencesChange(updatedPreferences);
  };

  const handleCustomColorChange = (colorKey: string, value: string) => {
    onPreferencesChange({
      ...preferences,
      colors: {
        ...preferences.colors,
        [colorKey]: value
      },
      selectedColorTheme: 'custom',
      useThemeBasedColors: false
    });
  };

  const handleIconVisibilityChange = (iconKey: string, visible: boolean) => {
    const currentIconVisibility = preferences.iconVisibility || DEFAULT_VALUES.iconVisibility;
    
    onPreferencesChange({
      ...preferences,
      iconVisibility: {
        ...currentIconVisibility,
        [iconKey]: visible
      }
    });
  };

  const handleResetToDefaults = async () => {
    try {
      await resetToDefaults();
      setShowResetConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error resetting to defaults:', error);
    }
  };

  // Font preview text
  const previewText = getTranslation('fontPreviewText');

  // Get font style for preview
  const getFontStyle = (fontFamily: string) => {
    const fontMap = {
      'Inter': 'Inter, sans-serif',
      'Georgia': 'Georgia, serif',
      'JetBrains Mono': 'JetBrains Mono, monospace'
    };
    return fontMap[fontFamily as keyof typeof fontMap] || fontMap.Inter;
  };

  // Theme preview component
  const ThemePreview: React.FC<{ theme: ColorTheme | InterfaceTheme; isSelected: boolean; type: 'color' | 'interface' }> = ({ theme, isSelected, type }) => (
    <div
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
        isSelected ? 'transform scale-105 shadow-lg' : 'hover:transform hover:scale-102'
      }`}
      style={{
        borderColor: isSelected ? '#007BFF' : interfaceStyles.borderColor,
        backgroundColor: isSelected ? '#007BFF10' : 'transparent'
      }}
      onClick={() => type === 'color' ? handleColorThemeChange(theme.id) : handleInterfaceThemeChange(theme.id)}
    >
      {/* Theme Preview Panel */}
      <div 
        className="w-full h-16 rounded-lg mb-3 border overflow-hidden"
        style={{ 
          backgroundColor: type === 'color' ? (theme as ColorTheme).colors.backgroundColor : (theme as InterfaceTheme).colors.panelBackground,
          borderColor: interfaceStyles.borderColor
        }}
      >
        <div className="p-2 h-full flex flex-col justify-between">
          <div 
            className="text-xs font-medium"
            style={{ 
              color: type === 'color' ? (theme as ColorTheme).colors.chapterTitleColor : (theme as InterfaceTheme).colors.textPrimary
            }}
          >
            {getTranslation('sampleTitle')}
          </div>
          <div 
            className="text-xs"
            style={{ 
              color: type === 'color' ? (theme as ColorTheme).colors.textColor : (theme as InterfaceTheme).colors.textSecondary
            }}
          >
            {getTranslation('sampleTextContent')}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm" style={{ color: interfaceStyles.color }}>
          {getTranslation(theme.id)}
          {theme.id === 'light' && <span className="text-xs text-gray-500 ml-1">({getTranslation('default')})</span>}
        </h4>
        {isSelected && (
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: '#007BFF' }}
          />
        )}
      </div>
      
      <p className="text-xs mb-3" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
        {getTranslation(`${theme.id}Description`)}
      </p>

      {/* Color Swatches */}
      <div className="flex gap-1">
        {type === 'color' ? (
          <>
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: (theme as ColorTheme).colors.backgroundColor,
                borderColor: interfaceStyles.borderColor
              }}
              title="Background"
            />
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: (theme as ColorTheme).colors.textColor,
                borderColor: interfaceStyles.borderColor
              }}
              title="Text"
            />
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: (theme as ColorTheme).colors.chapterTitleColor,
                borderColor: interfaceStyles.borderColor
              }}
              title="Title"
            />
          </>
        ) : (
          <>
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: (theme as InterfaceTheme).colors.headerBackground,
                borderColor: interfaceStyles.borderColor
              }}
              title="Header"
            />
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: (theme as InterfaceTheme).colors.panelBackground,
                borderColor: interfaceStyles.borderColor
              }}
              title="Panel"
            />
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: (theme as InterfaceTheme).colors.accent,
                borderColor: interfaceStyles.borderColor
              }}
              title="Accent"
            />
          </>
        )}
      </div>
    </div>
  );

  // Default indicator component
  const DefaultIndicator: React.FC<{ isDefault: boolean }> = ({ isDefault }) => (
    isDefault ? (
      <span className="text-xs text-gray-500 ml-2">({getTranslation('default')})</span>
    ) : null
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fade-in">
      <div 
        ref={panelRef}
        className="w-full max-w-lg h-full shadow-xl overflow-hidden animate-slide-in-right flex flex-col"
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
          className="flex items-center justify-between p-4 border-b flex-shrink-0"
          style={{ 
            backgroundColor: interfaceStyles.backgroundColor,
            borderColor: interfaceStyles.borderColor 
          }}
        >
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6" style={{ color: '#007BFF' }} />
            <h2 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
              {getTranslation('readerSettings')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Reset to Defaults */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
              style={{ color: '#ef4444' }}
              aria-label={getTranslation('resetToDefaults')}
              title={getTranslation('resetToDefaults')}
            >
              <RotateCcw className="w-5 h-5" />
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
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div 
          className="flex border-b"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          {[
            { id: 'appearance', label: getTranslation('appearance'), icon: Palette },
            { id: 'behavior', label: getTranslation('behavior'), icon: Eye },
            { id: 'advanced', label: getTranslation('advanced'), icon: SettingsIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'hover:bg-gray-100 hover:bg-opacity-20'
                }`}
                style={{
                  color: activeTab === tab.id ? '#007BFF' : interfaceStyles.color,
                  backgroundColor: activeTab === tab.id ? '#007BFF10' : 'transparent'
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <>
                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Font Size Slider */}
                  <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center" style={{ color: interfaceStyles.color }}>
                        {getTranslation('fontSize')}
                        <DefaultIndicator isDefault={isDefault('fontSize', preferences.fontSize)} />
                      </label>
                      <span className="text-sm font-mono px-2 py-1 rounded" style={{ 
                        color: interfaceStyles.color, 
                        backgroundColor: interfaceStyles.borderColor + '40'
                      }}>
                        {preferences.fontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="64"
                      step="2"
                      value={preferences.fontSize}
                      onChange={(e) => handleSliderChange('fontSize', parseInt(e.target.value))}
                      className="slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #007BFF 0%, #007BFF ${((preferences.fontSize - 12) / (64 - 12)) * 100}%, #e5e7eb ${((preferences.fontSize - 12) / (64 - 12)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <span>12px</span>
                      <span>64px</span>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                    <label className="block text-sm font-medium mb-3 flex items-center" style={{ color: interfaceStyles.color }}>
                      {getTranslation('fontFamily')}
                      <DefaultIndicator isDefault={isDefault('fontFamily', preferences.fontFamily)} />
                    </label>
                    
                    <div className="space-y-3">
                      {['Inter', 'Georgia', 'JetBrains Mono'].map((font) => (
                        <div
                          key={font}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                            preferences.fontFamily === font ? 'transform scale-105' : 'hover:transform hover:scale-102'
                          }`}
                          style={{
                            borderColor: preferences.fontFamily === font ? '#007BFF' : interfaceStyles.borderColor,
                            backgroundColor: preferences.fontFamily === font ? '#007BFF10' : 'transparent'
                          }}
                          onClick={() => onPreferencesChange({ ...preferences, fontFamily: font as any })}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm" style={{ color: interfaceStyles.color }}>
                              {font}
                              {font === 'Inter' && <span className="text-xs text-gray-500 ml-1">({getTranslation('default')})</span>}
                            </span>
                            {preferences.fontFamily === font && (
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: '#007BFF' }}
                              />
                            )}
                          </div>
                          <div 
                            className="text-sm leading-relaxed"
                            style={{ 
                              fontFamily: getFontStyle(font),
                              color: interfaceStyles.color,
                              opacity: 0.8
                            }}
                          >
                            {previewText}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Line Height Slider */}
                  <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center" style={{ color: interfaceStyles.color }}>
                        {getTranslation('lineHeight')}
                        <DefaultIndicator isDefault={isDefault('lineHeight', preferences.lineHeight)} />
                      </label>
                      <span className="text-sm font-mono px-2 py-1 rounded" style={{ 
                        color: interfaceStyles.color, 
                        backgroundColor: interfaceStyles.borderColor + '40'
                      }}>
                        {preferences.lineHeight}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.2"
                      max="2.5"
                      step="0.1"
                      value={preferences.lineHeight}
                      onChange={(e) => handleSliderChange('lineHeight', parseFloat(e.target.value))}
                      className="slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #007BFF 0%, #007BFF ${((preferences.lineHeight - 1.2) / (2.5 - 1.2)) * 100}%, #e5e7eb ${((preferences.lineHeight - 1.2) / (2.5 - 1.2)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <span>1.2</span>
                      <span>2.5</span>
                    </div>
                  </div>

                  {/* Letter Spacing Slider */}
                  <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center" style={{ color: interfaceStyles.color }}>
                        {getTranslation('letterSpacing')}
                        <DefaultIndicator isDefault={isDefault('marginSize', preferences.marginSize)} />
                      </label>
                      <span className="text-sm font-mono px-2 py-1 rounded" style={{ 
                        color: interfaceStyles.color, 
                        backgroundColor: interfaceStyles.borderColor + '40'
                      }}>
                        {preferences.marginSize}em
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={preferences.marginSize}
                      onChange={(e) => handleSliderChange('marginSize', parseFloat(e.target.value))}
                      className="slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #007BFF 0%, #007BFF ${(preferences.marginSize / 2) * 100}%, #e5e7eb ${(preferences.marginSize / 2) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <span>0em</span>
                      <span>2em</span>
                    </div>
                  </div>

                  {/* Max Width */}
                  <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                    <label className="block text-sm font-medium mb-3 flex items-center" style={{ color: interfaceStyles.color }}>
                      {getTranslation('maxWidth')}
                      <DefaultIndicator isDefault={isDefault('maxWidth', preferences.maxWidth)} />
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['phone', 'normal', 'full'].map((width) => (
                        <button
                          key={width}
                          onClick={() => onPreferencesChange({ ...preferences, maxWidth: width as any })}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                            preferences.maxWidth === width
                              ? 'transform scale-105'
                              : 'hover:transform hover:scale-102'
                          }`}
                          style={{
                            borderColor: preferences.maxWidth === width ? '#007BFF' : interfaceStyles.borderColor,
                            backgroundColor: preferences.maxWidth === width ? '#007BFF10' : 'transparent',
                            color: interfaceStyles.color
                          }}
                        >
                          {getTranslation(width)}
                          {width === 'full' && <span className="text-xs text-gray-500 block">({getTranslation('default')})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Themes Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5" style={{ color: '#007BFF' }} />
                    <h3 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
                      {getTranslation('colorTheme')}
                    </h3>
                  </div>

                  {/* Theme Apply Mode Selector */}
                  <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                    <label className="block text-sm font-medium mb-3 flex items-center" style={{ color: interfaceStyles.color }}>
                      {getTranslation('applyThemeTo')}
                      <DefaultIndicator isDefault={isDefault('themeApplyMode', themeApplyMode)} />
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'both', label: getTranslation('interfaceAndReader'), icon: Layers },
                        { id: 'interface', label: getTranslation('interfaceOnly'), icon: Monitor },
                        { id: 'reader', label: getTranslation('readerOnly'), icon: BookOpen }
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setThemeApplyMode(id as any)}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 text-xs font-medium flex flex-col items-center gap-1 ${
                            themeApplyMode === id ? 'transform scale-105' : 'hover:transform hover:scale-102'
                          }`}
                          style={{
                            borderColor: themeApplyMode === id ? '#007BFF' : interfaceStyles.borderColor,
                            backgroundColor: themeApplyMode === id ? '#007BFF10' : 'transparent',
                            color: interfaceStyles.color
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                          {id === 'both' && <span className="text-xs text-gray-500">({getTranslation('default')})</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Themes Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {COLOR_THEMES.slice(0, 8).map((theme) => (
                      <ThemePreview
                        key={theme.id}
                        theme={theme}
                        isSelected={preferences.selectedColorTheme === theme.id}
                        type="color"
                      />
                    ))}
                  </div>

                  {/* Custom Colors */}
                  {preferences.selectedColorTheme === 'custom' && (
                    <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                      <h4 className="font-medium mb-3" style={{ color: interfaceStyles.color }}>
                        {getTranslation('customColors')}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium min-w-0 flex-1" style={{ color: interfaceStyles.color }}>
                            {getTranslation('backgroundColor')}
                          </label>
                          <input
                            type="color"
                            value={preferences.colors.backgroundColor}
                            onChange={(e) => handleCustomColorChange('backgroundColor', e.target.value)}
                            className="w-12 h-8 rounded border cursor-pointer"
                            style={{ borderColor: interfaceStyles.borderColor }}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium min-w-0 flex-1" style={{ color: interfaceStyles.color }}>
                            {getTranslation('textColor')}
                          </label>
                          <input
                            type="color"
                            value={preferences.colors.textColor}
                            onChange={(e) => handleCustomColorChange('textColor', e.target.value)}
                            className="w-12 h-8 rounded border cursor-pointer"
                            style={{ borderColor: interfaceStyles.borderColor }}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium min-w-0 flex-1" style={{ color: interfaceStyles.color }}>
                            {getTranslation('chapterTitleColor')}
                          </label>
                          <input
                            type="color"
                            value={preferences.colors.chapterTitleColor}
                            onChange={(e) => handleCustomColorChange('chapterTitleColor', e.target.value)}
                            className="w-12 h-8 rounded border cursor-pointer"
                            style={{ borderColor: interfaceStyles.borderColor }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Behavior Tab */}
            {activeTab === 'behavior' && (
              <div className="space-y-4">
                {/* Hide Menu While Reading */}
                <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center" style={{ color: interfaceStyles.color }}>
                      {getTranslation('hideMenuWhileReading')}
                      <DefaultIndicator isDefault={isDefault('hideMenuWhileReading', preferences.hideMenuWhileReading)} />
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.hideMenuWhileReading}
                        onChange={(e) => onPreferencesChange({ ...preferences, hideMenuWhileReading: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {getTranslation('hideMenuDescription')}
                  </p>
                </div>

                {/* Scroll Buttons */}
                <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center" style={{ color: interfaceStyles.color }}>
                      {getTranslation('scrollButtonsVisible')}
                      <DefaultIndicator isDefault={isDefault('scrollButtons', preferences.scrollButtons)} />
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.scrollButtons.visible}
                        onChange={(e) => onPreferencesChange({
                          ...preferences,
                          scrollButtons: { ...preferences.scrollButtons, visible: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {preferences.scrollButtons.visible && (
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: interfaceStyles.color }}>
                          {getTranslation('scrollButtonsSize')}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {['small', 'medium', 'large', 'custom'].map((size) => (
                            <button
                              key={size}
                              onClick={() => onPreferencesChange({
                                ...preferences,
                                scrollButtons: { ...preferences.scrollButtons, size: size as any }
                              })}
                              className={`p-2 rounded border text-xs transition-all duration-300 ${
                                preferences.scrollButtons.size === size
                                  ? 'transform scale-105'
                                  : 'hover:transform hover:scale-102'
                              }`}
                              style={{
                                borderColor: preferences.scrollButtons.size === size ? '#007BFF' : interfaceStyles.borderColor,
                                backgroundColor: preferences.scrollButtons.size === size ? '#007BFF10' : 'transparent',
                                color: interfaceStyles.color
                              }}
                            >
                              {getTranslation(size)}
                              {size === 'medium' && <span className="text-xs text-gray-500 block">({getTranslation('default')})</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Size Slider */}
                      {preferences.scrollButtons.size === 'custom' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium" style={{ color: interfaceStyles.color }}>
                              {getTranslation('customSize')}
                            </label>
                            <span className="text-sm font-mono px-2 py-1 rounded" style={{ 
                              color: interfaceStyles.color, 
                              backgroundColor: interfaceStyles.borderColor + '40'
                            }}>
                              {preferences.scrollButtons.customSize || 48}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="32"
                            max="80"
                            step="4"
                            value={preferences.scrollButtons.customSize || 48}
                            onChange={(e) => handleNestedSliderChange('scrollButtons', 'customSize', parseInt(e.target.value))}
                            className="slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #007BFF 0%, #007BFF ${(((preferences.scrollButtons.customSize || 48) - 32) / (80 - 32)) * 100}%, #e5e7eb ${(((preferences.scrollButtons.customSize || 48) - 32) / (80 - 32)) * 100}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs mt-1" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                            <span>32px</span>
                            <span>80px</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Corner Navigation */}
                <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center" style={{ color: interfaceStyles.color }}>
                      {getTranslation('cornerNavigationVisible')}
                      <DefaultIndicator isDefault={isDefault('cornerNavigation', preferences.cornerNavigation)} />
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.cornerNavigation.visible}
                        onChange={(e) => onPreferencesChange({
                          ...preferences,
                          cornerNavigation: { ...preferences.cornerNavigation, visible: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {getTranslation('cornerNavigationDescription')}
                  </p>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                {/* Icon Visibility Controls */}
                <div className="p-4 rounded-lg border" style={{ borderColor: interfaceStyles.borderColor }}>
                  <div className="flex items-center gap-2 mb-4">
                    <EyeOff className="w-5 h-5" style={{ color: '#007BFF' }} />
                    <h3 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
                      {getTranslation('iconVisibility')}
                    </h3>
                  </div>
                  
                  <p className="text-sm mb-4" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {getTranslation('iconVisibilityDescription')}
                  </p>

                  <div className="space-y-3">
                    {[
                      { key: 'showSearchIcon', label: getTranslation('showSearchIcon') },
                      { key: 'showBookmarkIcon', label: getTranslation('showBookmarkIcon') },
                      { key: 'showFavoriteIcon', label: getTranslation('showFavoriteIcon') },
                      { key: 'showShareIcon', label: getTranslation('showShareIcon') },
                      { key: 'showFullscreenIcon', label: getTranslation('showFullscreenIcon') }
                    ].map(({ key, label }) => {
                      const currentIconVisibility = preferences.iconVisibility || DEFAULT_VALUES.iconVisibility;
                      const isVisible = currentIconVisibility[key as keyof typeof currentIconVisibility];
                      
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="font-medium" style={{ color: interfaceStyles.color }}>
                            {label}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={(e) => handleIconVisibilityChange(key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Settings Icon Notice */}
                  <div 
                    className="mt-4 p-3 rounded-lg border-l-4"
                    style={{ 
                      backgroundColor: '#fef3c7',
                      borderColor: '#f59e0b'
                    }}
                  >
                    <p className="text-sm text-yellow-800">
                      <strong>{getTranslation('note')}:</strong> {getTranslation('settingsIconAlwaysVisible')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in">
            <div 
              className="rounded-lg p-6 max-w-sm w-full mx-4 animate-scale-in"
              style={{
                backgroundColor: interfaceStyles.backgroundColor,
                color: interfaceStyles.color
              }}
            >
              <h3 className="text-lg font-semibold mb-4">{getTranslation('resetToDefaults')}</h3>
              <p className="text-sm mb-6" style={{ opacity: 0.7 }}>
                {getTranslation('resetConfirm')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetToDefaults}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                >
                  {getTranslation('resetToDefaults')}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 hover:bg-opacity-20 transition-all duration-300"
                  style={{ 
                    borderColor: interfaceStyles.borderColor,
                    color: interfaceStyles.color
                  }}
                >
                  {getTranslation('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};