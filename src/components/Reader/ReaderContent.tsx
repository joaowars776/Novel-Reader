import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollButtons } from './ScrollButtons';
import type { Chapter, ReadingPreferences } from '../../types';

interface ReaderContentProps {
  chapter?: Chapter;
  preferences: ReadingPreferences;
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onContentClick?: () => void;
  pdfMode?: boolean;
  file?: File;
  isHeaderMinimized?: boolean;
}

export const ReaderContent: React.FC<ReaderContentProps> = ({
  chapter,
  preferences,
  onNextChapter,
  onPreviousChapter,
  canGoNext,
  canGoPrevious,
  onContentClick,
  pdfMode = false,
  file,
  isHeaderMinimized = false
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Handle PDF URL creation and cleanup
  useEffect(() => {
    if (pdfMode && file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPdfUrl(null);
      };
    }
  }, [pdfMode, file]);

  // Apply theme styles
  const getThemeStyles = () => {
    return {
      backgroundColor: preferences.colors?.backgroundColor || '#ffffff',
      color: preferences.colors?.textColor || '#000000',
    };
  };

  const getFontFamily = () => {
    const fonts = {
      'Georgia': 'Georgia, serif',
      'Inter': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      'JetBrains Mono': 'JetBrains Mono, monospace'
    };
    return fonts[preferences.fontFamily] || fonts.Inter;
  };

  const getMaxWidth = () => {
    const widths = {
      phone: '100%',
      normal: '75ch',
      full: '100%'
    };
    return widths[preferences.maxWidth] || widths.full;
  };

  const getContainerClass = () => {
    if (preferences.maxWidth === 'phone') {
      return 'w-full px-4 max-w-sm mx-auto';
    } else if (preferences.maxWidth === 'full') {
      return 'w-full px-4 sm:px-6 lg:px-8';
    } else {
      return 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';
    }
  };

  const contentStyles = {
    ...getThemeStyles(),
    fontSize: `${preferences.fontSize}px`,
    fontFamily: getFontFamily(),
    lineHeight: preferences.lineHeight,
    padding: `${preferences.marginSize}em`,
    maxWidth: getMaxWidth(),
    margin: preferences.maxWidth === 'full' ? '0' : '0 auto'
  };

  // Handle scroll position saving
  useEffect(() => {
    const handleScroll = () => {
      // Save scroll position logic would go here
      // This would be integrated with the useReadingProgress hook
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter?.id]);

  // Handle responsive font sizing
  useEffect(() => {
    const updateResponsiveFontSize = () => {
      const screenWidth = window.innerWidth;
      
      // Calculate responsive multiplier based on screen size
      let multiplier = 1;
      
      // For very small screens (phones in portrait)
      if (screenWidth <= 480) {
        multiplier = 0.7;
      }
      // For small screens (phones in landscape, small tablets)
      else if (screenWidth <= 768) {
        multiplier = 0.8;
      }
      // For medium screens (tablets)
      else if (screenWidth <= 1024) {
        multiplier = 0.9;
      }
      // For large screens (desktop)
      else if (screenWidth <= 1440) {
        multiplier = 1;
      }
      // For very large screens (4K and above)
      else {
        multiplier = 1.2;
      }

      // Additional adjustment for very high resolution screens
      if (screenWidth >= 2560) {
        multiplier *= 1.3;
      }

      // Apply the responsive font size
      if (contentRef.current) {
        const responsiveFontSize = Math.max(12, preferences.fontSize * multiplier);
        contentRef.current.style.fontSize = `${responsiveFontSize}px`;
      }
    };

    updateResponsiveFontSize();
    window.addEventListener('resize', updateResponsiveFontSize);
    
    return () => window.removeEventListener('resize', updateResponsiveFontSize);
  }, [preferences.fontSize]);

  const handleNextChapter = () => {
    onNextChapter();
  };

  const handlePreviousChapter = () => {
    onPreviousChapter();
  };

  // Remove chapter title from content
  const getProcessedContent = (content: string) => {
    if (!content) return '';
    
    // Remove specific boilerplate text requested by user
    const processedContent = content.replace(/If audio player doesn't work, press Stop then Play button again/gi, '');
    
    // Remove chapter title if it appears at the beginning
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;
    
    // Remove first h1, h2, or h3 if it matches the chapter title
    const firstHeading = tempDiv.querySelector('h1, h2, h3');
    if (firstHeading && chapter?.title) {
      const headingText = firstHeading.textContent?.trim().toLowerCase();
      const chapterTitle = chapter.title.trim().toLowerCase();
      
      if (headingText === chapterTitle || 
          headingText === `chapter ${chapterTitle}` ||
          headingText?.includes(chapterTitle)) {
        firstHeading.remove();
      }
    }
    
    return tempDiv.innerHTML;
  };

  if (pdfMode && file && pdfUrl) {
    const pageNumber = chapter?.pageNumber || 1;
    const headerHeight = isHeaderMinimized ? 0 : 64;
    return (
      <div className="w-full transition-all duration-500 bg-gray-100 flex flex-col" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
        <iframe
          src={`${pdfUrl}#page=${pageNumber}&toolbar=1&view=FitH`}
          className="w-full h-full border-none"
          title="PDF Viewer"
          key={`${pdfUrl}-${pageNumber}`} // Force reload when page changes
        />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No chapter content available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-300" style={getThemeStyles()}>
      <main 
        className={getContainerClass()} 
        onClick={onContentClick}
      >
        {/* Chapter content */}
        <article
          ref={contentRef}
          className="prose prose-lg max-w-none transition-all duration-300"
          style={contentStyles}
        >
          <div
            dangerouslySetInnerHTML={{ __html: getProcessedContent(chapter.content) }}
            className="chapter-content"
            data-custom-font="true"
            style={{
              fontSize: `${preferences.fontSize}px`,
              lineHeight: preferences.lineHeight,
              fontFamily: getFontFamily(),
              color: preferences.colors?.textColor || '#000000'
            }}
          />
        </article>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center py-8 px-4">
          <button
            onClick={handlePreviousChapter}
            disabled={!canGoPrevious}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
              canGoPrevious
                ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous Chapter
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 transition-colors duration-300" style={{ color: preferences.theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              Scroll to read • Use arrow keys to navigate
            </p>
          </div>

          <button
            onClick={handleNextChapter}
            disabled={!canGoNext}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
              canGoNext
                ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next Chapter
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Scroll Buttons */}
      <ScrollButtons preferences={preferences} />
    </div>
  );
};
