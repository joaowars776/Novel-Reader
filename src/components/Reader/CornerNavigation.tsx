import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReadingPreferences } from '../../types';

interface CornerNavigationProps {
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  preferences: ReadingPreferences;
}

export const CornerNavigation: React.FC<CornerNavigationProps> = ({
  onNextChapter,
  onPreviousChapter,
  canGoNext,
  canGoPrevious,
  preferences
}) => {
  const getButtonStyles = () => {
    if (!preferences?.interfaceColors) {
      return {
        backgroundColor: '#3b82f6',
        color: '#ffffff'
      };
    }

    return {
      backgroundColor: preferences.interfaceColors.buttonBackground || '#3b82f6',
      color: preferences.interfaceColors.buttonText || '#ffffff'
    };
  };

  const buttonStyles = getButtonStyles();

  return (
    <>
      {/* Previous Chapter - Bottom Left */}
      {canGoPrevious && (
        <button
          onClick={onPreviousChapter}
          className="fixed bottom-6 left-6 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-30"
          style={buttonStyles}
          aria-label="Previous chapter"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Chapter - Bottom Right */}
      {canGoNext && (
        <button
          onClick={onNextChapter}
          className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-30"
          style={buttonStyles}
          aria-label="Next chapter"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </>
  );
};
