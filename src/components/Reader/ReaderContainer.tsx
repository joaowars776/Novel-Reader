import React, { useState, useEffect, useCallback } from 'react';
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
import type { Book, Chapter, ReadingPreferences, Bookmark, SearchResult } from '../../types';

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
  const [tapCount, setTapCount] = useState(0);

  const { updateProgress } = useReadingProgress(book.id);

  // Generate URL-friendly book title
  const getUrlFriendlyTitle = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Update URL when chapter changes
  useEffect(() => {
    if (chapters.length > 0) {
      const bookTitle = getUrlFriendlyTitle(book.title);
      const newUrl = `/${bookTitle}/chapter/${currentChapterIndex + 1}`;
      
      // Update URL without triggering page reload
      window.history.pushState(
        { bookId: book.id, chapterIndex: currentChapterIndex },
        `${book.title} - Chapter ${currentChapterIndex + 1}`,
        newUrl
      );

      // Save navigation state
      saveNavigationState(book.id, currentChapterIndex, window.scrollY);
    }
  }, [currentChapterIndex, chapters.length, book.id, book.title]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.bookId === book.id) {
        setCurrentChapterIndex(event.state.chapterIndex);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [book.id]);

  // Initialize parser and load chapters
  useEffect(() => {
    const initializeReader = async () => {
      try {
        setIsLoading(true);
        
        // Check if file is still valid
        if (!book.file || book.file.size === 0) {
          throw new Error('Invalid or corrupted file');
        }

        // Create appropriate parser based on file type
        const fileParser = createParserForFile(book.file);
        await fileParser.initialize();
        
        const chaptersData = await fileParser.getAllChapters();
        
        if (!chaptersData || chaptersData.length === 0) {
          throw new Error('No chapters found in file');
        }
        
        setChapters(chaptersData);
        setParser(fileParser);

        // Load user preferences
        const userPrefs = await getPreferences();
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
        console.error('Error initializing reader:', error);
        logError('READER_INIT_FAILED', error, { 
          bookId: book.id, 
          fileSize: book.file?.size,
          fileName: book.file?.name,
          fileType: book.fileType 
        });
        
        // Show user-friendly error and return to library
        alert('Failed to load the book. The file may be corrupted or invalid. Returning to library.');
        onBackToLibrary();
      } finally {
        setIsLoading(false);
      }
    };

    initializeReader();

    return () => {
      // End reading session when component unmounts
      endReadingSession();
      
      if (parser) {
        try {
          parser.destroy();
        } catch (error) {
          console.warn('Error destroying parser:', error);
        }
      }
    };
  }, [book.file, book.id, onBackToLibrary]);

  // Update progress when chapter changes
  useEffect(() => {
    if (currentChapterIndex !== book.currentChapter) {
      updateProgress({
        currentChapter: currentChapterIndex,
        progress: currentChapterIndex / Math.max(chapters.length - 1, 1)
      });
    }
  }, [currentChapterIndex, chapters.length, book.currentChapter, updateProgress]);

  // Track reading activity
  useEffect(() => {
    const handleActivity = () => {
      updateReadingActivity();
    };

    // Track various user activities
    const events = ['scroll', 'click', 'keydown', 'mousemove', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Screen tap functionality for menu minimization
  useEffect(() => {
    let tapTimeout: NodeJS.Timeout;

    const handleScreenTap = () => {
      setTapCount(prev => prev + 1);
      
      clearTimeout(tapTimeout);
      tapTimeout = setTimeout(() => {
        if (tapCount >= 2) {
          // Double tap - toggle fullscreen reading mode
          setIsFullscreenReading(prev => !prev);
        } else if (tapCount === 1) {
          // Single tap - close all panels
          setIsMenuOpen(false);
          setIsSettingsOpen(false);
          setIsSearchOpen(false);
          setIsBookmarksOpen(false);
        }
        setTapCount(0);
      }, 300);
    };

    const contentArea = document.querySelector('.reader-content');
    if (contentArea) {
      contentArea.addEventListener('click', handleScreenTap);
      return () => {
        contentArea.removeEventListener('click', handleScreenTap);
        clearTimeout(tapTimeout);
      };
    }

    return () => clearTimeout(tapTimeout);
  }, [tapCount]);

  const handleNextChapter = useCallback(async () => {
    if (currentChapterIndex < chapters.length - 1) {
      const newChapterIndex = currentChapterIndex + 1;
      const newChapter = chapters[newChapterIndex];
      
      // Mark current chapter as completed and change to next chapter
      await changeChapter(newChapterIndex, newChapter.title, true);
      setCurrentChapterIndex(newChapterIndex);
    }
  }, [currentChapterIndex, chapters.length, chapters]);

  const handlePreviousChapter = useCallback(async () => {
    if (currentChapterIndex > 0) {
      const newChapterIndex = currentChapterIndex - 1;
      const newChapter = chapters[newChapterIndex];
      
      // Change to previous chapter (not marked as completed)
      await changeChapter(newChapterIndex, newChapter.title, false);
      setCurrentChapterIndex(newChapterIndex);
    }
  }, [currentChapterIndex, chapters]);

  const handleChapterSelect = useCallback(async (index: number) => {
    const newChapter = chapters[index];
    if (newChapter) {
      // Change to selected chapter
      await changeChapter(index, newChapter.title, false);
      setCurrentChapterIndex(index);
      setIsMenuOpen(false);
    }
  }, [chapters]);

  const handlePreferencesChange = useCallback(async (newPreferences: ReadingPreferences) => {
    setPreferences(newPreferences);
    
    // Apply interface theme immediately
    if (newPreferences.selectedInterfaceTheme) {
      const theme = getInterfaceTheme(newPreferences.selectedInterfaceTheme);
      applyInterfaceTheme(theme);
    }
    
    try {
      await savePreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      logError('SAVE_PREFERENCES_FAILED', error);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!parser || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await parser.searchText(query);
      const formattedResults: SearchResult[] = [];

      results.forEach(({ chapterIndex, matches }) => {
        matches.forEach(match => {
          formattedResults.push({
            chapterIndex,
            chapterTitle: chapters[chapterIndex]?.title || `Chapter ${chapterIndex + 1}`,
            text: match.text,
            position: match.position,
            matchStart: match.start,
            matchEnd: match.end
          });
        });
      });

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching:', error);
      logError('SEARCH_FAILED', error, { query });
      setSearchResults([]);
    }
  }, [parser, chapters]);

  const handleSearchResultClick = useCallback(async (result: SearchResult) => {
    const newChapter = chapters[result.chapterIndex];
    if (newChapter) {
      await changeChapter(result.chapterIndex, newChapter.title, false);
      setCurrentChapterIndex(result.chapterIndex);
      setIsSearchOpen(false);
      // Scroll to position after a brief delay to ensure content is rendered
      setTimeout(() => {
        const element = document.querySelector(`[data-search-position="${result.position}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [chapters]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    if (preferences && preferences.fontSize < 64) {
      handlePreferencesChange({
        ...preferences,
        fontSize: Math.min(64, preferences.fontSize + 2)
      });
    }
  }, [preferences, handlePreferencesChange]);

  const decreaseFontSize = useCallback(() => {
    if (preferences && preferences.fontSize > 12) {
      handlePreferencesChange({
        ...preferences,
        fontSize: Math.max(12, preferences.fontSize - 2)
      });
    }
  }, [preferences, handlePreferencesChange]);

  // Close all panels when clicking on content
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

  const currentChapter = chapters[currentChapterIndex];

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
          canGoNext={currentChapterIndex < chapters.length - 1}
          canGoPrevious={currentChapterIndex > 0}
          onContentClick={handleContentClick}
        />
      </div>

      {/* Corner Navigation */}
      {preferences.cornerNavigation?.visible && !isFullscreenReading && (
        <CornerNavigation
          onNextChapter={handleNextChapter}
          onPreviousChapter={handlePreviousChapter}
          canGoNext={currentChapterIndex < chapters.length - 1}
          canGoPrevious={currentChapterIndex > 0}
          preferences={preferences}
        />
      )}

      {/* Fullscreen Reading Mode Indicator */}
      {isFullscreenReading && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm z-50 animate-fade-in">
          Fullscreen Reading Mode - Double tap to exit
        </div>
      )}

      {/* Table of Contents */}
      {isMenuOpen && !isFullscreenReading && (
        <TableOfContents
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onChapterSelect={handleChapterSelect}
          onClose={() => setIsMenuOpen(false)}
          preferences={preferences}
        />
      )}

      {/* Settings Panel */}
      {isSettingsOpen && !isFullscreenReading && (
        <ReaderSettings
          preferences={preferences}
          onPreferencesChange={handlePreferencesChange}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && !isFullscreenReading && (
        <SearchModal
          onSearch={handleSearch}
          searchResults={searchResults}
          onResultClick={handleSearchResultClick}
          onClose={() => setIsSearchOpen(false)}
          preferences={preferences}
        />
      )}

      {/* Bookmarks Panel */}
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