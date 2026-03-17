import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ReadingPreferences } from '../../types';

interface ScrollButtonsProps {
  preferences: ReadingPreferences;
}

export const ScrollButtons: React.FC<ScrollButtonsProps> = ({ preferences }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (!preferences.scrollButtons.visible) {
    return null;
  }

  const getSizeClasses = () => {
    if (preferences.scrollButtons.size === 'custom' && preferences.scrollButtons.customSize) {
      const size = preferences.scrollButtons.customSize;
      return { width: `${size}px`, height: `${size}px` };
    }
    
    switch (preferences.scrollButtons.size) {
      case 'small':
        return { width: '40px', height: '40px' };
      case 'large':
        return { width: '64px', height: '64px' };
      default:
        return { width: '48px', height: '48px' };
    }
  };

  const getIconSize = () => {
    if (preferences.scrollButtons.size === 'custom' && preferences.scrollButtons.customSize) {
      const size = Math.max(16, Math.min(32, preferences.scrollButtons.customSize * 0.4));
      return { width: `${size}px`, height: `${size}px` };
    }
    
    switch (preferences.scrollButtons.size) {
      case 'small':
        return { width: '16px', height: '16px' };
      case 'large':
        return { width: '32px', height: '32px' };
      default:
        return { width: '24px', height: '24px' };
    }
  };

  // Position in bottom left corner when reading settings is opened
  const isSettingsOpen = document.querySelector('[data-settings-panel]') !== null;
  const positionClass = isSettingsOpen ? 'bottom-6 left-6' : 'bottom-20 right-6';

  const sizeStyles = getSizeClasses();
  const iconStyles = getIconSize();

  return (
    <div className={`fixed ${positionClass} flex flex-col gap-2 z-30 transition-all duration-300`}>
      <button
        onClick={scrollToTop}
        className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        style={{
          ...sizeStyles,
          borderRadius: '8px',
          border: '2px solid #ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        aria-label="Scroll to top"
      >
        <ChevronUp style={iconStyles} />
      </button>
      
      <button
        onClick={scrollToBottom}
        className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        style={{
          ...sizeStyles,
          borderRadius: '8px',
          border: '2px solid #ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        aria-label="Scroll to bottom"
      >
        <ChevronDown style={iconStyles} />
      </button>
    </div>
  );
};
