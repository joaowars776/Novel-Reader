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
import { getPreferences, savePreferences, saveNavigationState, logError, getHeaderButtonPosition, saveHeaderButtonPosition } from '../../utils/storage';
import { applyInterfaceTheme, getInterfaceTheme } from '../../utils/themes';
import { createParserForFile } from '../../utils/file-parser';
import { EpubParser } from '../../utils/epub-parser';
import { PdfParser } from '../../utils/pdf-parser';
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
  const [settingsInitialTab, setSettingsInitialTab] = useState<'appearance' | 'behavior' | 'advanced'>('appearance');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenReading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parser, setParser] = useState<EpubParser | PdfParser | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pdfMode, setPdfMode] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [buttonX, setButtonX] = useState(50);
  const [highlightBookmarkId, setHighlightBookmarkId] = useState<string | null>(null);
  const [searchHighlight, setSearchHighlight] = useState<{ text: string, position: number } | null>(null);

  const { updateProgress } = useReadingProgress(book.id);

  // Load persisted button position
  useEffect(() => {
    const loadButtonPosition = async () => {
      const x = await getHeaderButtonPosition();
      setButtonX(x);
    };
    loadButtonPosition();
  }, []);

  // Persist button position when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveHeaderButtonPosition(buttonX);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [buttonX]);

  // Memoize URL-friendly title generation
  const urlFriendlyTitle = useMemo(() => {
    return book.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, [book.title]);

  // Memoize current chapter
  const currentChapter = useMemo(() => {
    if (chapters.length === 0 || currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
      return undefined;
    }
    return chapters[currentChapterIndex];
  }, [chapters, currentChapterIndex]);

  const updateURLTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const updateURL = useCallback((chapterIndex: number) => {
    if (updateURLTimeoutRef.current) clearTimeout(updateURLTimeoutRef.current);
    updateURLTimeoutRef.current = setTimeout(() => {
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
  }, [chapters.length, urlFriendlyTitle, book.id, book.title]);

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
    let currentParser: EpubParser | PdfParser | null = null;

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
        
        // Optimize: Only get TOC first for faster initial load
        const toc = await fileParser.getTableOfContents();
        
        if (!isMounted) {
          fileParser.destroy();
          return;
        }
        
        if (!toc || toc.length === 0) {
          throw new Error('No chapters found in file');
        }
        
        setChapters(toc);
        setParser(fileParser);

        // Load current chapter content immediately
        const initialChapterIndex = book.currentChapter;
        if (toc[initialChapterIndex]) {
          const content = await fileParser.getChapterContent(toc[initialChapterIndex].href);
          if (isMounted) {
            setChapters(prev => {
              const updated = [...prev];
              if (updated[initialChapterIndex]) {
                updated[initialChapterIndex] = { ...updated[initialChapterIndex], content };
              }
              return updated;
            });
          }
        }

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
        const currentChapter = toc[currentChapterIndex];
        if (currentChapter) {
          startReadingSession(
            book.id,
            book.title,
            book.author,
            currentChapterIndex,
            currentChapter.title,
            book.fileType as 'epub' | 'pdf',
            book.metadata?.tags
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
  }, [book.file, book.id, book.title, book.author, book.currentChapter, book.fileType, book.metadata?.tags, currentChapterIndex, onBackToLibrary]);

  // Load chapter content when index changes
  useEffect(() => {
    if (!parser || !chapters || chapters.length === 0 || !chapters[currentChapterIndex] || chapters[currentChapterIndex].content) return;

    let isCurrent = true;

    const loadChapter = async () => {
      try {
        if (parser.isDestroyed) return;
        const chapterToLoad = chapters[currentChapterIndex];
        if (!chapterToLoad) return;
        
        const content = await parser.getChapterContent(chapterToLoad.href);
        if (!isCurrent || parser.isDestroyed) return;
        
        setChapters(prev => {
          if (!prev || prev.length === 0) return prev;
          const updated = [...prev];
          if (updated[currentChapterIndex]) {
            updated[currentChapterIndex] = { ...updated[currentChapterIndex], content };
          }
          return updated;
        });
      } catch (err) {
        console.error('Error loading chapter:', err);
      }
    };

    loadChapter();
    return () => { isCurrent = false; };
  }, [currentChapterIndex, parser, chapters, book.currentChapter, book.fileType]);

  // Preload next chapter
  useEffect(() => {
    const nextIndex = currentChapterIndex + 1;
    if (!parser || !chapters || chapters.length === 0 || !chapters[nextIndex] || chapters[nextIndex].content) return;

    let isCurrent = true;

    const preloadNext = async () => {
      try {
        if (parser.isDestroyed) return;
        const chapterToPreload = chapters[nextIndex];
        if (!chapterToPreload) return;
        
        const content = await parser.getChapterContent(chapterToPreload.href);
        if (!isCurrent || parser.isDestroyed) return;
        
        setChapters(prev => {
          if (!prev || prev.length === 0) return prev;
          const updated = [...prev];
          if (updated[nextIndex]) {
            updated[nextIndex] = { ...updated[nextIndex], content };
          }
          return updated;
        });
      } catch {
        // Silent fail for preloading
      }
    };

    // Delay preloading to prioritize current chapter
    const timeoutId = setTimeout(preloadNext, 2000);
    return () => {
      isCurrent = false;
      clearTimeout(timeoutId);
    };
  }, [currentChapterIndex, parser, chapters]);

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
  }, [currentChapterIndex, chapters, book.currentChapter, updateProgress]);

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

  const preferencesTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handlePreferencesChange = useCallback(async (newPreferences: ReadingPreferences) => {
    setPreferences(newPreferences);
    
    // Apply interface theme immediately
    if (newPreferences.selectedInterfaceTheme) {
      const theme = getInterfaceTheme(newPreferences.selectedInterfaceTheme);
      applyInterfaceTheme(theme);
    }
    
    // Debounce save operation
    if (preferencesTimeoutRef.current) clearTimeout(preferencesTimeoutRef.current);
    preferencesTimeoutRef.current = setTimeout(async () => {
      try {
        await savePreferences(newPreferences);
      } catch (error) {
        console.error('Error saving preferences:', error);
        logError('SAVE_PREFERENCES_FAILED', error);
      }
    }, 300);
  }, []);

  // Expose to window for components that might need it (like ShortcutsModal)
  useEffect(() => {
    (window as any).onPreferencesChange = handlePreferencesChange;
  }, [handlePreferencesChange]);

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const searchCacheRef = React.useRef(new Map<string, SearchResult[]>());
  
  const handleSearch = useCallback(async (query: string, searchScope: 'chapter' | 'book' = 'chapter') => {
    if (!parser || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const cacheKey = `${query}-${searchScope}-${currentChapterIndex}`;
    
    // Check cache first
    if (searchCacheRef.current.has(cacheKey)) {
      setSearchResults(searchCacheRef.current.get(cacheKey)!);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
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
        if (searchCacheRef.current.size > 20) {
          const firstKey = searchCacheRef.current.keys().next().value;
          searchCacheRef.current.delete(firstKey);
        }
        searchCacheRef.current.set(cacheKey, formattedResults);
        
        setSearchResults(formattedResults);
      } catch (error) {
        console.error('Error searching:', error);
        logError('SEARCH_FAILED', error, { query, searchScope });
        setSearchResults([]);
      }
    }, 300);
  }, [parser, chapters, currentChapterIndex, currentChapter]);

  const handleSearchResultClick = useCallback(async (result: SearchResult) => {
    const newChapter = chapters[result.chapterIndex];
    if (!newChapter) return;
    
    setCurrentChapterIndex(result.chapterIndex);
    setIsSearchOpen(false);
    setSearchHighlight({ text: result.text, position: result.position });
    await changeChapter(result.chapterIndex, newChapter.title, false);
    
    // Optimized scroll to position
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scrollToSearchResult', { detail: result }));
      }, 300);
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
    onNextChapter: pdfMode ? () => {} : handleNextChapter,
    onPreviousChapter: pdfMode ? () => {} : handlePreviousChapter,
    onToggleMenu: () => setIsMenuOpen(prev => !prev),
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    onToggleFullscreen: toggleFullscreen,
    onSearch: () => setIsSearchOpen(true),
    onIncreaseFontSize: increaseFontSize,
    onDecreaseFontSize: decreaseFontSize
  }, preferences);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleOpenBookmarkSettings = () => {
      setSettingsInitialTab('advanced');
      setIsSettingsOpen(true);
    };

    const handleOpenBookmarkWithHighlight = (event: any) => {
      const { bookmarkId } = event.detail;
      setHighlightBookmarkId(bookmarkId);
      setIsBookmarksOpen(true);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('openBookmarkSettings', handleOpenBookmarkSettings);
    window.addEventListener('openBookmarkWithHighlight' as any, handleOpenBookmarkWithHighlight);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('openBookmarkSettings', handleOpenBookmarkSettings);
      window.removeEventListener('openBookmarkWithHighlight' as any, handleOpenBookmarkWithHighlight);
    };
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
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: preferences.colors?.backgroundColor || '#ffffff' }}
    >
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
        preferences={preferences}
        pdfMode={pdfMode}
        onTogglePdfMode={() => setPdfMode(prev => !prev)}
        isMinimized={isHeaderMinimized}
        onToggleMinimize={() => setIsHeaderMinimized(prev => !prev)}
        buttonX={buttonX}
        onButtonXChange={setButtonX}
      />

      <div 
        className="reader-content transition-all duration-500 ease-in-out overflow-hidden"
        style={{ paddingTop: isHeaderMinimized ? 0 : 64 }}
      >
        <ReaderContent
          bookId={book.id}
          chapter={currentChapter}
          chapterIndex={currentChapterIndex}
          preferences={preferences}
          onNextChapter={handleNextChapter}
          onPreviousChapter={handlePreviousChapter}
          canGoNext={navigationState.canGoNext}
          canGoPrevious={navigationState.canGoPrevious}
          onContentClick={handleContentClick}
          pdfMode={pdfMode}
          file={book.file}
          isHeaderMinimized={isHeaderMinimized}
          searchHighlight={searchHighlight}
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
          pdfMode={pdfMode}
          initialTab={settingsInitialTab}
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
          onBookmarkClick={(chapterIndex, bookmark) => {
            handleChapterSelect(chapterIndex);
            setIsBookmarksOpen(false);
            if (bookmark?.type === 'text') {
              window.dispatchEvent(new CustomEvent('scrollToBookmark', { detail: bookmark }));
            }
          }}
          onClose={() => {
            setIsBookmarksOpen(false);
            setHighlightBookmarkId(null);
          }}
          preferences={preferences}
          onPreferencesChange={handlePreferencesChange}
          highlightBookmarkId={highlightBookmarkId || undefined}
        />
      )}
    </div>
  );
};
