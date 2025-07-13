import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReaderHeader } from './ReaderHeader';
import { ReaderContent } from './ReaderContent';
import { TableOfContents } from './TableOfContents';
import { ReaderSettings } from './ReaderSettings';
import { SearchModal } from './SearchModal';
import { BookmarksPanel } from './BookmarksPanel';
import { CornerNavigation } from './CornerNavigation';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { getPreferences, savePreferences, saveNavigationState, logError } from '../../utils/storage';
import { applyInterfaceTheme, getInterfaceTheme } from '../../utils/themes';
import { createParserForFile } from '../../utils/file-parser';
import { startReadingSession, endReadingSession, changeChapter, updateReadingActivity } from '../../utils/reading-tracker';
import type { Book, Chapter, ReadingPreferences, SearchResult } from '../../types';

interface ReaderContainerProps {
  book: Book;
  onBackToLibrary: () => void;
}

export const ReaderContainer: React.FC<ReaderContainerProps> = ({ book, onBackToLibrary }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(book.currentChapter);
  const [preferences, setPreferences] = useState<ReadingPreferences | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenReading, setIsFullscreenReading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parser, setParser] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const { updateProgress } = useReadingProgress(book.id);

  // Memoize URL-friendly title generation
  const urlFriendlyTitle = useMemo(() => {
    return book.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, [book.title]);

  // Memoize current chapter
  const currentChapter = useMemo(() => chapters[currentChapterIndex], [chapters, currentChapterIndex]);

  // Debounced URL update to prevent excessive history entries
  const updateURL = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (chapterIndex: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (chapters.length > 0) {
            const newUrl = `/${urlFriendlyTitle}/chapter/${chapterIndex + 1}`;
            window.history.replaceState(
              { bookId: book.id, chapterIndex },
              `${book.title} - Chapter ${chapterIndex + 1}`,
              newUrl
            );
            saveNavigationState(book.id, chapterIndex, window.scrollY);
          }
        }, 100);
      };
    })(),
    [chapters.length, urlFriendlyTitle, book.id, book.title]
  );

  // Update URL when chapter changes
  useEffect(() => {
    updateURL(currentChapterIndex);
  }, [currentChapterIndex, updateURL]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.bookId === book.id) {
        setCurrentChapterIndex(event.state.chapterIndex);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [book.id]);

  // Initialize parser and load chapters
  useEffect(() => {
    let isMounted = true;
    let currentParser: any = null;

    const initializeReader = async () => {
      try {
        setIsLoading(true);
        
        if (!book.file || book.file.size === 0) {
          throw new Error('Invalid or corrupted file');
        }

        const fileParser = createParserForFile(book.file);
        await fileParser.initialize();
        currentParser = fileParser;
        
        if (!isMounted) {
          fileParser.destroy();
          return;
        }
        
        const chaptersData = await fileParser.getAllChapters();
        
        if (!isMounted) {
          fileParser.destroy();
          return;
        }
        
        if (!chaptersData || chaptersData.length === 0) {
          throw new Error('No chapters found in file');
        }
        
        setChapters(chaptersData);
        setParser(fileParser);

        // Load preferences in parallel
        const userPrefs = await getPreferences();
        
        if (!isMounted) {
          fileParser.destroy();
          return;
        }
        
        setPreferences(userPrefs);

        // Apply interface theme
        if (userPrefs.selectedInterfaceTheme) {
          const theme = getInterfaceTheme(userPrefs.selectedInterfaceTheme);
          applyInterfaceTheme(theme);
        }

        // Start reading session
        const currentChapter = chaptersData[currentChapterIndex];
        if (currentChapter) {
          startReadingSession(
            book.id,
            book.title,
            book.author,
            currentChapterIndex,
            currentChapter.title
          );
        }

        console.log('Reader initialized successfully');
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error initializing reader:', error);
        logError('READER_INIT_FAILED', error, { 
          bookId: book.id, 
          fileSize: book.file?.size,
          fileName: book.file?.name,
          fileType: book.fileType 
        });
        
        alert('Failed to load the book. The file may be corrupted or invalid. Returning to library.');
        onBackToLibrary();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeReader();

    return () => {
      isMounted = false;
      endReadingSession();
      
      if (currentParser) {
        try {
          currentParser.destroy();
        } catch (error) {
          console.warn('Error destroying parser:', error);
        }
      }
    };
  }, [book.file, book.id, book.title, book.author, currentChapterIndex, onBackToLibrary]);

  // Optimized progress update with debouncing
  useEffect(() => {
    if (currentChapterIndex === book.currentChapter) return;
    
    const timeoutId = setTimeout(() => {
      updateProgress({
        currentChapter: currentChapterIndex,
        progress: currentChapterIndex / Math.max(chapters.length - 1, 1)
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentChapterIndex, chapters.length, book.currentChapter, updateProgress]);

  // Throttled activity tracking
  useEffect(() => {
    let lastActivity = 0;
    const throttleDelay = 1000; // 1 second throttle

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > throttleDelay) {
        updateReadingActivity();
        lastActivity = now;
      }
    };

    const events = ['scroll', 'click', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Optimized chapter navigation handlers
  const handleNextChapter = useCallback(async () => {
    if (currentChapterIndex >= chapters.length - 1) return;
    
    const newChapterIndex = currentChapterIndex + 1;
    const newChapter = chapters[newChapterIndex];
    
    setCurrentChapterIndex(newChapterIndex);
    await changeChapter(newChapterIndex, newChapter.title, true);
  }, [currentChapterIndex, chapters]);

  const handlePreviousChapter = useCallback(async () => {
    if (currentChapterIndex <= 0) return;
    
    const newChapterIndex = currentChapterIndex - 1;
    const newChapter = chapters[newChapterIndex];
    
    setCurrentChapterIndex(newChapterIndex);
    await changeChapter(newChapterIndex, newChapter.title, false);
  }, [currentChapterIndex, chapters]);

  const handleChapterSelect = useCallback(async (index: number) => {
    if (index === currentChapterIndex || !chapters[index]) return;
    
    const newChapter = chapters[index];
    setCurrentChapterIndex(index);
    setIsMenuOpen(false);
    await changeChapter(index, newChapter.title, false);
  }, [currentChapterIndex, chapters]);

  // Debounced preferences save
  const handlePreferencesChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return async (newPreferences: ReadingPreferences) => {
        setPreferences(newPreferences);
        
        // Apply interface theme immediately
        if (newPreferences.selectedInterfaceTheme) {
          const theme = getInterfaceTheme(newPreferences.selectedInterfaceTheme);
          applyInterfaceTheme(theme);
        }
        
        // Debounce save operation
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            await savePreferences(newPreferences);
          } catch (error) {
            console.error('Error saving preferences:', error);
            logError('SAVE_PREFERENCES_FAILED', error);
          }
        }, 300);
      };
    })(),
    []
  );

  // Optimized search with caching and debouncing
  const handleSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      let searchCache = new Map<string, SearchResult[]>();
      
      return async (query: string, searchScope: 'chapter' | 'book' = 'chapter') => {
        if (!parser || !query.trim()) {
          setSearchResults([]);
          return;
        }

        const cacheKey = `${query}-${searchScope}-${currentChapterIndex}`;
        
        // Check cache first
        if (searchCache.has(cacheKey)) {
          setSearchResults(searchCache.get(cacheKey)!);
          return;
        }

        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            let results;
            
            if (searchScope === 'chapter') {
              if (!currentChapter) {
                setSearchResults([]);
                return;
              }
              
              const singleChapterResults = await parser.searchText(query);
              results = singleChapterResults.filter(result => result.chapterIndex === currentChapterIndex);
            } else {
              results = await parser.searchText(query);
            }

            const formattedResults: SearchResult[] = results.flatMap(({ chapterIndex, matches }) =>
              matches.map(match => ({
                chapterIndex,
                chapterTitle: chapters[chapterIndex]?.title || `Chapter ${chapterIndex + 1}`,
                text: match.text,
                position: match.position,
                matchStart: match.start,
                matchEnd: match.end
              }))
            );

            // Cache results (limit cache size)
            if (searchCache.size > 20) {
              const firstKey = searchCache.keys().next().value;
              searchCache.delete(firstKey);
            }
            searchCache.set(cacheKey, formattedResults);
            
            setSearchResults(formattedResults);
          } catch (error) {
            console.error('Error searching:', error);
            logError('SEARCH_FAILED', error, { query, searchScope });
            setSearchResults([]);
          }
        }, 300);
      };
    })(),
    [parser, chapters, currentChapterIndex, currentChapter]
  );

  const handleSearchResultClick = useCallback(async (result: SearchResult) => {
    const newChapter = chapters[result.chapterIndex];
    if (!newChapter) return;
    
    setCurrentChapterIndex(result.chapterIndex);
    setIsSearchOpen(false);
    await changeChapter(result.chapterIndex, newChapter.title, false);
    
    // Optimized scroll to position
    requestAnimationFrame(() => {
      setTimeout(() => {
        const element = document.querySelector(`[data-search-position="${result.position}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });
  }, [chapters]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.warn);
      setIsFullscreen(false);
    }
  }, []);

  // Optimized font size handlers
  const increaseFontSize = useCallback(() => {
    if (!preferences || preferences.fontSize >= 64) return;
    
    handlePreferencesChange({
      ...preferences,
      fontSize: Math.min(64, preferences.fontSize + 2)
    });
  }, [preferences, handlePreferencesChange]);

  const decreaseFontSize = useCallback(() => {
    if (!preferences || preferences.fontSize <= 12) return;
    
    handlePreferencesChange({
      ...preferences,
      fontSize: Math.max(12, preferences.fontSize - 2)
    });
  }, [preferences, handlePreferencesChange]);

  // Optimized panel close handler
  const handleContentClick = useCallback(() => {
    setIsMenuOpen(false);
    setIsSettingsOpen(false);
    setIsSearchOpen(false);
    setIsBookmarksOpen(false);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNextChapter: handleNextChapter,
    onPreviousChapter: handlePreviousChapter,
    onToggleMenu: () => setIsMenuOpen(prev => !prev),
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    onToggleFullscreen: toggleFullscreen,
    onSearch: () => setIsSearchOpen(true),
    onIncreaseFontSize: increaseFontSize,
    onDecreaseFontSize: decreaseFontSize
  });

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Memoized navigation state
  const navigationState = useMemo(() => ({
    canGoNext: currentChapterIndex < chapters.length - 1,
    canGoPrevious: currentChapterIndex > 0
  }), [currentChapterIndex, chapters.length]);

  if (isLoading || !preferences) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ReaderHeader
        book={book}
        currentChapter={currentChapter}
        chapterProgress={currentChapterIndex + 1}
        totalChapters={chapters.length}
        onBackToLibrary={onBackToLibrary}
        onToggleMenu={() => setIsMenuOpen(prev => !prev)}
        onToggleSettings={() => setIsSettingsOpen(prev => !prev)}
        onToggleSearch={() => setIsSearchOpen(prev => !prev)}
        onToggleBookmarks={() => setIsBookmarksOpen(prev => !prev)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen || isFullscreenReading}
        hideMenuWhileReading={preferences.hideMenuWhileReading}
        preferences={preferences}
      />

      <div className="reader-content">
        <ReaderContent
          chapter={currentChapter}
          preferences={preferences}
          onNextChapter={handleNextChapter}
          onPreviousChapter={handlePreviousChapter}
          canGoNext={navigationState.canGoNext}
          canGoPrevious={navigationState.canGoPrevious}
          onContentClick={handleContentClick}
        />
      </div>

      {/* Corner Navigation */}
      {preferences.cornerNavigation?.visible && !isFullscreenReading && (
        <CornerNavigation
          onNextChapter={handleNextChapter}
          onPreviousChapter={handlePreviousChapter}
          canGoNext={navigationState.canGoNext}
          canGoPrevious={navigationState.canGoPrevious}
          preferences={preferences}
        />
      )}

      {/* Fullscreen Reading Mode Indicator */}
      {isFullscreenReading && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm z-50 animate-fade-in">
          Fullscreen Reading Mode - Double tap to exit
        </div>
      )}

      {/* Conditional rendering for panels to prevent unnecessary renders */}
      {isMenuOpen && !isFullscreenReading && (
        <TableOfContents
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onChapterSelect={handleChapterSelect}
          onClose={() => setIsMenuOpen(false)}
          preferences={preferences}
          bookId={book.id}
        />
      )}

      {isSettingsOpen && !isFullscreenReading && (
        <ReaderSettings
          preferences={preferences}
          onPreferencesChange={handlePreferencesChange}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isSearchOpen && !isFullscreenReading && (
        <SearchModal
          onSearch={handleSearch}
          searchResults={searchResults}
          onResultClick={handleSearchResultClick}
          onClose={() => setIsSearchOpen(false)}
          preferences={preferences}
          currentChapterTitle={currentChapter?.title}
        />
      )}

      {isBookmarksOpen && !isFullscreenReading && (
        <BookmarksPanel
          bookId={book.id}
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onBookmarkClick={(chapterIndex) => {
            handleChapterSelect(chapterIndex);
            setIsBookmarksOpen(false);
          }}
          onClose={() => setIsBookmarksOpen(false)}
          preferences={preferences}
        />
      )}
    </div>
  );
};