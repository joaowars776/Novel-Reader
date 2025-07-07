import React, { useRef, useEffect, useState } from 'react';
import { X, BookOpen, Bookmark } from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import { getBookmarks } from '../../utils/storage';
import type { Chapter, ReadingPreferences, Bookmark as BookmarkType } from '../../types';

interface TableOfContentsProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onChapterSelect: (index: number) => void;
  onClose: () => void;
  preferences?: ReadingPreferences;
  bookId?: string; // Add bookId prop to fetch bookmarks
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  chapters,
  currentChapterIndex,
  onChapterSelect,
  onClose,
  preferences,
  bookId
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<Set<number>>(new Set());
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);

  // Load bookmarks for this book
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!bookId) {
        setIsLoadingBookmarks(false);
        return;
      }

      try {
        setIsLoadingBookmarks(true);
        const bookmarks = await getBookmarks(bookId);
        
        // Create a set of chapter indices that have bookmarks
        const bookmarkedChapterIndices = new Set<number>();
        bookmarks.forEach((bookmark: BookmarkType) => {
          bookmarkedChapterIndices.add(bookmark.chapterIndex);
        });
        
        setBookmarkedChapters(bookmarkedChapterIndices);
      } catch (error) {
        console.error('Error loading bookmarks for TOC:', error);
        setBookmarkedChapters(new Set());
      } finally {
        setIsLoadingBookmarks(false);
      }
    };

    loadBookmarks();
  }, [bookId]);

  // Listen for bookmark changes to update indicators in real-time
  useEffect(() => {
    const handleBookmarkChange = () => {
      // Reload bookmarks when bookmark state changes
      if (bookId) {
        const loadBookmarks = async () => {
          try {
            const bookmarks = await getBookmarks(bookId);
            const bookmarkedChapterIndices = new Set<number>();
            bookmarks.forEach((bookmark: BookmarkType) => {
              bookmarkedChapterIndices.add(bookmark.chapterIndex);
            });
            setBookmarkedChapters(bookmarkedChapterIndices);
          } catch (error) {
            console.error('Error reloading bookmarks for TOC:', error);
          }
        };
        loadBookmarks();
      }
    };

    // Listen for custom bookmark events (you may need to dispatch these from bookmark operations)
    window.addEventListener('bookmarkAdded', handleBookmarkChange);
    window.addEventListener('bookmarkDeleted', handleBookmarkChange);
    
    return () => {
      window.removeEventListener('bookmarkAdded', handleBookmarkChange);
      window.removeEventListener('bookmarkDeleted', handleBookmarkChange);
    };
  }, [bookId]);

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

  // Check if a chapter has bookmarks
  const hasBookmarks = (chapterIndex: number): boolean => {
    return bookmarkedChapters.has(chapterIndex);
  };

  // Get bookmark indicator styles
  const getBookmarkIndicatorStyles = () => {
    return {
      color: '#f59e0b', // Amber color for bookmark indicator
      opacity: 0.8
    };
  };

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

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto">
          {chapters.length === 0 ? (
            <div className="p-4 text-center" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
              <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <p>{getTranslation('noChaptersAvailable')}</p>
            </div>
          ) : (
            <div className="p-2">
              {chapters.map((chapter, index) => {
                const isCurrentChapter = index === currentChapterIndex;
                const chapterHasBookmarks = hasBookmarks(index);
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => onChapterSelect(index)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-all duration-300 relative ${
                      isCurrentChapter
                        ? 'transform scale-105'
                        : 'hover:transform hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: isCurrentChapter ? '#007BFF20' : 'transparent',
                      borderLeft: isCurrentChapter ? '4px solid #007BFF' : '4px solid transparent',
                      color: isCurrentChapter ? '#007BFF' : interfaceStyles.color
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-sm font-medium mt-0.5 flex-shrink-0`}
                        style={{ 
                          color: isCurrentChapter ? '#007BFF' : interfaceStyles.color,
                          opacity: isCurrentChapter ? 1 : 0.6
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-medium mb-1 break-words flex-1`}>
                            {chapter.title}
                          </h3>
                          
                          {/* Bookmark Indicator */}
                          {chapterHasBookmarks && !isLoadingBookmarks && (
                            <div 
                              className="flex-shrink-0 ml-2 mt-0.5"
                              style={getBookmarkIndicatorStyles()}
                              title={getTranslation('bookmark')}
                              aria-label={`Chapter ${index + 1} has bookmarks`}
                            >
                              <Bookmark 
                                className="w-4 h-4 fill-current" 
                                style={{ 
                                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Loading indicator for bookmarks */}
                          {isLoadingBookmarks && (
                            <div className="flex-shrink-0 ml-2 mt-0.5">
                              <div 
                                className="w-4 h-4 rounded-full animate-pulse"
                                style={{ backgroundColor: interfaceStyles.color, opacity: 0.2 }}
                              />
                            </div>
                          )}
                        </div>
                        
                        {isCurrentChapter && (
                          <span className="text-xs font-medium" style={{ color: '#007BFF' }}>
                            {getTranslation('currentlyReading')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
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
          <div className="flex items-center justify-between text-sm" style={{ color: interfaceStyles.color }}>
            <span>
              {chapters.length} {getTranslation('chaptersTotal')} • {getTranslation('useArrowKeysToNavigate')}
            </span>
          </div>
        </div>
      </div>
      {/* Overlay - click to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};