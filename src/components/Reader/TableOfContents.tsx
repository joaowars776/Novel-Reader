import React, { useRef, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import type { Chapter, ReadingPreferences } from '../../types';

interface TableOfContentsProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onChapterSelect: (index: number) => void;
  onClose: () => void;
  preferences?: ReadingPreferences;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  chapters,
  currentChapterIndex,
  onChapterSelect,
  onClose,
  preferences
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
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
      color: preferences.interfaceColors.textPrimary || '#1f2937',
      borderColor: preferences.interfaceColors.panelBorder || '#e5e7eb'
    };
  };

  const interfaceStyles = getInterfaceStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex animate-fade-in">
      {/* Sidebar */}
      <div 
        ref={sidebarRef} 
        className="w-full max-w-md h-full shadow-xl flex flex-col animate-slide-in-left overflow-hidden"
        style={{
          backgroundColor: interfaceStyles.backgroundColor,
          fontFamily: preferences?.applyFontGlobally ? 
            (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
             preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
             preferences.fontFamily === 'Crimson Text' ? 'Crimson Text, serif' :
             preferences.fontFamily === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
             'Georgia, serif') : undefined
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b flex-shrink-0"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" style={{ color: '#007BFF' }} />
            <h2 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
              {getTranslation('tableOfContents')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
            style={{ color: interfaceStyles.color }}
            aria-label="Close table of contents"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter list - Remove horizontal scroll */}
        <div className="flex-1 overflow-y-auto">
          {chapters.length === 0 ? (
            <div className="p-4 text-center" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
              <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <p>{getTranslation('noChaptersAvailable')}</p>
            </div>
          ) : (
            <div className="p-2">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => onChapterSelect(index)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-all duration-300 ${
                    index === currentChapterIndex
                      ? 'transform scale-105'
                      : 'hover:transform hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: index === currentChapterIndex ? '#007BFF20' : 'transparent',
                    borderLeft: index === currentChapterIndex ? '4px solid #007BFF' : '4px solid transparent',
                    color: index === currentChapterIndex ? '#007BFF' : interfaceStyles.color
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-sm font-medium mt-0.5 flex-shrink-0`}
                      style={{ 
                        color: index === currentChapterIndex ? '#007BFF' : interfaceStyles.color,
                        opacity: index === currentChapterIndex ? 1 : 0.6
                      }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium mb-1 break-words`}>
                        {chapter.title}
                      </h3>
                      {index === currentChapterIndex && (
                        <span className="text-xs font-medium" style={{ color: '#007BFF' }}>
                          {getTranslation('currentlyReading')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t flex-shrink-0"
          style={{ 
            borderColor: interfaceStyles.borderColor,
            backgroundColor: interfaceStyles.backgroundColor,
            opacity: 0.8
          }}
        >
      <p className="text-sm text-center" style={{ color: interfaceStyles.color }}>
        {chapters.length} {getTranslation('chaptersTotal')} • {getTranslation('useArrowKeysToNavigate')}
      </p>
        </div>
      </div>

      {/* Overlay - click to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};