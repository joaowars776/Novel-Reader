import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Bookmark, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import { getBookmarks, getNavigationHistory } from '../../utils/storage';
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
  const [visitedChapters, setVisitedChapters] = useState<Set<number>>(new Set());
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);

  // Memoize interface styles to prevent recalculation
  const interfaceStyles = useMemo(() => {
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
  }, [preferences?.interfaceColors]);

  // Memoize bookmark indicator styles
  const bookmarkIndicatorStyles = useMemo(() => ({
    color: '#f59e0b', // Amber color for bookmark indicator
    opacity: 0.8
  }), []);

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

    const loadHistory = async () => {
      if (!bookId) return;

      try {
        const history = await getNavigationHistory(bookId);
        const visitedIndices = new Set<number>();
        history.forEach((entry: { chapterIndex: number }) => {
          visitedIndices.add(entry.chapterIndex);
        });
        setVisitedChapters(visitedIndices);
      } catch (error) {
        console.error('Error loading history for TOC:', error);
      }
    };

    loadBookmarks();
    loadHistory();
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

  // Check if a chapter has bookmarks
  const hasBookmarks = useCallback((chapterIndex: number): boolean => {
    return bookmarkedChapters.has(chapterIndex);
  }, [bookmarkedChapters]);

  // Check if a chapter has been visited
  const isVisited = useCallback((chapterIndex: number): boolean => {
    return visitedChapters.has(chapterIndex);
  }, [visitedChapters]);

  const totalProgress = useMemo(() => {
    if (chapters.length === 0) return 0;
    return Math.round(((currentChapterIndex + 1) / chapters.length) * 100);
  }, [currentChapterIndex, chapters.length]);
  	
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[100] flex animate-fade-in backdrop-blur-sm">
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
                const chapterIsVisited = isVisited(index);
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => onChapterSelect(index)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-all duration-300 relative group/item
                      ${isCurrentChapter
                        ? 'bg-blue-100 dark:bg-blue-900/20 shadow-md' // More prominent for current
                        : 'hover:bg-gray-100 hover:bg-opacity-10' // Subtle hover
                      }`}
                    style={{
                      backgroundColor: isCurrentChapter ? '#007BFF20' : 'transparent', // Keep the blue tint
                      borderLeft: isCurrentChapter ? '4px solid #007BFF' : '4px solid transparent',
                      color: isCurrentChapter ? '#007BFF' : interfaceStyles.color,
                      boxShadow: isCurrentChapter ? '0 2px 8px rgba(0, 123, 255, 0.15)' : 'none' // Subtle shadow for current
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 mt-1">
                        {chapterIsVisited && !isCurrentChapter && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 opacity-80" />
                        )}
                        {!chapterIsVisited && !isCurrentChapter && (
                          <div className="w-5 h-5 rounded-full border-2 border-current opacity-20" />
                        )}
                        {isCurrentChapter && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-medium mb-1 break-words flex-1`}
                            style={{ 
                              color: isCurrentChapter ? '#007BFF' : interfaceStyles.color,
                              opacity: chapterIsVisited || isCurrentChapter ? 1 : 0.7
                            }}
                          >
                            {chapter.title}
                          </h3>
                          
                          <div className="flex items-center gap-1">
                            {/* Bookmark Indicator */}
                            {chapterHasBookmarks && !isLoadingBookmarks && (
                              <div 
                                className="flex-shrink-0"
                                style={bookmarkIndicatorStyles}
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
                              <div className="flex-shrink-0">
                                <div 
                                  className="w-4 h-4 rounded-full animate-pulse"
                                  style={{ backgroundColor: interfaceStyles.color, opacity: 0.2 }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          {isCurrentChapter && (
                            <span className="text-xs font-medium" style={{ color: '#007BFF' }}>
                              {getTranslation('currentlyReading')}
                            </span>
                          )}
                        </div>
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
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-medium" style={{ color: interfaceStyles.color }}>
              <span className="opacity-60">{getTranslation('totalProgress')}</span>
              <span style={{ color: '#007BFF' }}>{totalProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-60" style={{ color: interfaceStyles.color }}>
              <span>
                {chapters.length} {getTranslation('chaptersTotal')}
              </span>
              <span>{getTranslation('useArrowKeysToNavigate')}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay - click to close */}
      <div className="flex-1" onClick={onClose} />
    </div>,
    document.body
  );
};
