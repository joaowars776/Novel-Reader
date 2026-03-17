import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Trash2, Edit2 } from 'lucide-react';
import { ScrollButtons } from './ScrollButtons';
import type { Chapter, ReadingPreferences, Bookmark } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { saveBookmark, getBookmarks, deleteBookmark } from '../../utils/storage';

interface ReaderContentProps {
  bookId: string;
  chapter?: Chapter;
  chapterIndex: number;
  preferences: ReadingPreferences;
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onContentClick?: () => void;
  pdfMode?: boolean;
  file?: File;
  isHeaderMinimized?: boolean;
  searchHighlight?: { text: string, position: number } | null;
}

export const ReaderContent: React.FC<ReaderContentProps> = ({
  bookId,
  chapter,
  chapterIndex,
  preferences,
  onNextChapter,
  onPreviousChapter,
  canGoNext,
  canGoPrevious,
  onContentClick,
  pdfMode = false,
  file,
  isHeaderMinimized = false,
  searchHighlight
}) => {
  const { getTranslation } = useTranslations();
  const contentRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectionMenu, setSelectionMenu] = useState<{ x: number, y: number, text: string, existingBookmarkId?: string } | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const loadBookmarks = useCallback(async () => {
    try {
      const allBookmarks = await getBookmarks(bookId);
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, [bookId]);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialBookmarks = async () => {
      try {
        const allBookmarks = await getBookmarks(bookId);
        if (isMounted) {
          setBookmarks(allBookmarks);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };
    fetchInitialBookmarks();
    return () => { isMounted = false; };
  }, [bookId]);

  useEffect(() => {
    const handleBookmarkChange = () => {
      loadBookmarks();
    };

    window.addEventListener('bookmarkAdded', handleBookmarkChange);
    window.addEventListener('bookmarkDeleted', handleBookmarkChange);
    
    return () => {
      window.removeEventListener('bookmarkAdded', handleBookmarkChange);
      window.removeEventListener('bookmarkDeleted', handleBookmarkChange);
    };
  }, [loadBookmarks]);

  useEffect(() => {
    const handleScrollToBookmark = (event: CustomEvent<Bookmark>) => {
      const bookmark = event.detail;
      if (bookmark.type === 'text' && bookmark.chapterIndex === chapterIndex) {
        // Give some time for content to render if chapter just changed
        setTimeout(() => {
          const spans = contentRef.current?.querySelectorAll('span');
          const targetSpan = Array.from(spans || []).find(span => 
            span.textContent?.trim() === bookmark.text?.trim()
          );

          if (targetSpan) {
            targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add pulsing highlight effect
            targetSpan.classList.add('bookmark-pulse');
            setTimeout(() => {
              targetSpan.classList.remove('bookmark-pulse');
            }, 3000);
          }
        }, 300);
      }
    };

    window.addEventListener('scrollToBookmark' as any, handleScrollToBookmark as any);
    return () => window.removeEventListener('scrollToBookmark' as any, handleScrollToBookmark as any);
  }, [chapterIndex]);

  useEffect(() => {
    const handleScrollToSearchResult = (event: CustomEvent) => {
      const result = event.detail;
      if (result.chapterIndex === chapterIndex) {
        setTimeout(() => {
          const element = contentRef.current?.querySelector(`[data-search-position="${result.position}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('search-pulse');
            setTimeout(() => {
              element.classList.remove('search-pulse');
            }, 3000);
          }
        }, 300);
      }
    };

    window.addEventListener('scrollToSearchResult' as any, handleScrollToSearchResult as any);
    return () => window.removeEventListener('scrollToSearchResult' as any, handleScrollToSearchResult as any);
  }, [chapterIndex]);

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    if (pdfMode) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const selectedText = selection.toString().trim();
      
      // Check if this selection matches an existing bookmark
      const existingBookmark = bookmarks.find(b => 
        b.type === 'text' && 
        b.chapterIndex === chapterIndex && 
        b.text === selectedText
      );
      
      setSelectionMenu({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
        text: selectedText,
        existingBookmarkId: existingBookmark?.id
      });
    } else {
      setSelectionMenu(null);
    }
  }, [pdfMode, bookmarks, chapterIndex]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleSaveTextBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectionMenu) return;

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      chapterIndex,
      position: window.scrollY,
      text: selectionMenu.text,
      createdAt: new Date(),
      type: 'text',
      color: preferences.bookmarkHighlight.color,
      style: preferences.bookmarkHighlight.style
    };

    try {
      await saveBookmark(newBookmark);
      setSelectionMenu(null);
      window.getSelection()?.removeAllRanges();
      loadBookmarks();
      // Notify other components
      window.dispatchEvent(new CustomEvent('bookmarkAdded', { detail: { bookId, chapterIndex } }));
    } catch (error) {
      console.error('Error saving text bookmark:', error);
    }
  };

  const handleDeleteTextBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectionMenu?.existingBookmarkId) return;

    try {
      await deleteBookmark(selectionMenu.existingBookmarkId);
      setSelectionMenu(null);
      window.getSelection()?.removeAllRanges();
      loadBookmarks();
      // Notify other components
      window.dispatchEvent(new CustomEvent('bookmarkDeleted', { detail: { bookId, chapterIndex } }));
    } catch (error) {
      console.error('Error deleting text bookmark:', error);
    }
  };

  const handleEditBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectionMenu?.existingBookmarkId) {
      window.dispatchEvent(new CustomEvent('openBookmarkWithHighlight', { 
        detail: { bookmarkId: selectionMenu.existingBookmarkId } 
      }));
    }
    setSelectionMenu(null);
  };

  // Handle PDF URL creation and cleanup
  useEffect(() => {
    if (pdfMode && file) {
      const url = URL.createObjectURL(file);
      const timeoutId = setTimeout(() => {
        setPdfUrl(url);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
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
    margin: preferences.maxWidth === 'full' ? '0' : '0 auto',
    '--paragraph-spacing': `${preferences.paragraphSpacing || 1.5}em`
  } as React.CSSProperties;

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

  // Remove chapter title from content and apply highlights
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

    // Apply bookmark highlights
    if (bookmarks.length > 0 || searchHighlight) {
      const textBookmarks = bookmarks.filter(b => b.type === 'text' && b.chapterIndex === chapterIndex);
      
      if (textBookmarks.length > 0 || searchHighlight) {
        const globalStyle = preferences.bookmarkHighlight.style;
        const globalColor = preferences.bookmarkHighlight.color;
        const syncAll = preferences.syncAllBookmarks;

        // Recursive function to process text nodes
        const processNode = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            let newHtml = text;
            let hasMatch = false;

            // Handle search highlight first if it's in this node
            if (searchHighlight) {
              const strippedText = text; // Simplified: assuming text node content matches stripped content for this segment
              const searchIndex = strippedText.indexOf(searchHighlight.text);
              
              if (searchIndex !== -1) {
                // This is a simplified check. For a truly robust solution, we'd need to track 
                // the global offset across all text nodes.
                const escapedText = searchHighlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedText})`, 'gi');
                newHtml = newHtml.replace(regex, `<span class="search-match" data-search-position="${searchHighlight.position}">$1</span>`);
                hasMatch = true;
              }
            }

            // Sort bookmarks by length descending to avoid partial matches inside longer matches
            const sortedBookmarks = [...textBookmarks].sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));

            sortedBookmarks.forEach(bookmark => {
              if (bookmark.text && text.includes(bookmark.text)) {
                const style = syncAll ? globalStyle : (bookmark.style || globalStyle);
                const color = syncAll ? globalColor : (bookmark.color || globalColor);
                
                if (style === 'none') return;

                let styleAttr = '';
                if (style === 'highlight') {
                  styleAttr += `background-color: ${color}; `;
                }
                if (style === 'underline') {
                  styleAttr += `text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 2px; text-underline-offset: 2px; `;
                }
                if (style === 'strike') {
                  styleAttr += `text-decoration: line-through; text-decoration-color: ${color}; text-decoration-thickness: 2px; `;
                }

                const escapedText = bookmark.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedText})`, 'gi');
                newHtml = newHtml.replace(regex, `<span style="${styleAttr}">$1</span>`);
                hasMatch = true;
              }
            });

            if (hasMatch) {
              const span = document.createElement('span');
              span.innerHTML = newHtml;
              node.parentNode?.replaceChild(span, node);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Don't process script or style tags
            const tagName = (node as Element).tagName.toLowerCase();
            if (tagName !== 'script' && tagName !== 'style' && tagName !== 'span') {
              Array.from(node.childNodes).forEach(processNode);
            }
          }
        };

        processNode(tempDiv);
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
            {getTranslation('previousChapter')}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 transition-colors duration-300" style={{ color: preferences.theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {getTranslation('scrollToRead')}
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
            {getTranslation('nextChapter')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Text Selection Menu */}
      {selectionMenu && (
        <div 
          className="fixed z-[100] flex items-center gap-1 p-1 rounded-full shadow-xl border animate-in fade-in zoom-in duration-200"
          style={{ 
            left: `${selectionMenu.x}px`, 
            top: `${selectionMenu.y - 50}px`,
            transform: 'translateX(-50%)',
            backgroundColor: preferences.interfaceColors?.panelBackground || '#ffffff',
            borderColor: preferences.interfaceColors?.borderColor || '#e5e7eb',
            color: preferences.interfaceColors?.panelText || '#000000'
          }}
        >
          {selectionMenu.existingBookmarkId ? (
            <div className="flex items-center">
              <button
                onClick={handleEditBookmark}
                className="p-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-2 px-3"
                title={getTranslation('edit')}
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-xs font-medium">{getTranslation('edit')}</span>
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button
                onClick={handleDeleteTextBookmark}
                className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors flex items-center gap-2 px-3"
                title={getTranslation('delete')}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-medium">{getTranslation('delete')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSaveTextBookmark}
              className="p-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-2 px-3"
              title={getTranslation('bookmark')}
            >
              <BookmarkIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{getTranslation('bookmark')}</span>
            </button>
          )}
        </div>
      )}

      {/* Scroll Buttons */}
      <ScrollButtons preferences={preferences} />
    </div>
  );
};
