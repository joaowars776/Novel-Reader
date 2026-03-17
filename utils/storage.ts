import { openDB, type IDBPDatabase } from 'idb';
import { INTERFACE_THEMES, getInterfaceTheme } from './themes';
import type { Book, ReadingPreferences, Bookmark, ReadingStats } from '../types';

const DB_NAME = 'EBookReaderDB';
const DB_VERSION = 4; // Incremented for reading sessions

let db: IDBPDatabase | null = null;

// Define default preferences constant with proper interface theme
const DEFAULT_PREFERENCES: ReadingPreferences = {
  fontSize: 38, // Updated default
  fontFamily: 'Inter',
  lineHeight: 1.6, // Updated default
  marginSize: 0.5, // Updated default (Letter Spacing)
  theme: 'light',
  maxWidth: 'full',
  hideMenuWhileReading: true,
  colors: {
    chapterTitleColor: '#1f2937',
    textColor: '#000000',
    backgroundColor: '#ffffff'
  },
  interfaceTheme: 'light',
  interfaceColors: INTERFACE_THEMES[0].colors, // Use the actual light theme colors
  scrollButtons: {
    visible: false,
    size: 'medium',
    customSize: 48
  },
  cornerNavigation: {
    visible: false
  },
  selectedColorTheme: 'light',
  selectedInterfaceTheme: 'light',
  useThemeBasedColors: true,
  syncInterfaceWithReading: true, // Default enabled
  applyFontGlobally: false,
  // Additional reading controls
  enablePageTurning: false,
  enableReadingProgress: true,
  enableNightMode: false,
  enableFocusMode: false,
  enableTextToSpeech: false, // Default to false
  enableFastFavorite: false,
  fastFavoriteName: 'Quick Bookmark',
  paragraphSpacing: 1.5,
  syncAllBookmarksColor: false,
  // Icon visibility controls
  iconVisibility: {
    showSearchIcon: true,
    showBookmarkIcon: true, // Default to true
    showFavoriteIcon: true,
    showShareIcon: false, // Changed to false
    showFullscreenIcon: false, // Changed to false
    showShortcutsIcon: true // Changed to true
  },
  bookmarkHighlight: {
    color: '#fef08a',
    style: 'highlight'
  },
  bookmarksSettingsExpanded: true,
  shortcuts: {
    nextChapter: ['ArrowRight'],
    previousChapter: ['ArrowLeft'],
    toggleMenu: ['m'],
    toggleSettings: ['s'],
    toggleFullscreen: ['f'],
    search: ['/'],
    increaseFontSize: ['='],
    decreaseFontSize: ['-']
  }
};

export const initDB = async () => {
  if (db) return db;
  
  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Books store
        if (!db.objectStoreNames.contains('books')) {
          const booksStore = db.createObjectStore('books', { keyPath: 'id' });
          booksStore.createIndex('title', 'title');
          booksStore.createIndex('author', 'author');
          booksStore.createIndex('lastRead', 'lastRead');
        }

        // Preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'id' });
        }

        // Bookmarks store
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarksStore.createIndex('bookId', 'bookId');
          bookmarksStore.createIndex('createdAt', 'createdAt');
        }

        // Reading stats store
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }

        // Chapter content cache
        if (!db.objectStoreNames.contains('chapters')) {
          const chaptersStore = db.createObjectStore('chapters', { keyPath: 'id' });
          chaptersStore.createIndex('bookId', 'bookId');
        }

        // Cover images store
        if (!db.objectStoreNames.contains('covers')) {
          const coversStore = db.createObjectStore('covers', { keyPath: 'bookId' });
          coversStore.createIndex('createdAt', 'createdAt');
        }

        // Navigation history store
        if (!db.objectStoreNames.contains('navigation')) {
          const navStore = db.createObjectStore('navigation', { keyPath: 'id' });
          navStore.createIndex('bookId', 'bookId');
          navStore.createIndex('timestamp', 'timestamp');
        }

        // Reading sessions store (new in version 4)
        if (!db.objectStoreNames.contains('readingSessions')) {
          const sessionsStore = db.createObjectStore('readingSessions', { keyPath: 'id' });
          sessionsStore.createIndex('bookId', 'bookId');
          sessionsStore.createIndex('startTime', 'startTime');
          sessionsStore.createIndex('chapterIndex', 'chapterIndex');
        }

        // Error logs store
        if (!db.objectStoreNames.contains('errorLogs')) {
          const errorStore = db.createObjectStore('errorLogs', { keyPath: 'id', autoIncrement: true });
          errorStore.createIndex('type', 'type');
          errorStore.createIndex('timestamp', 'timestamp');
        }
      },
    });

    // Log successful initialization
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Create error log entry
    logError('DB_INIT_FAILED', error);
    throw error;
  }
};

// Error logging function
export const logError = async (type: string, error: any, context?: any) => {
  // Throttle error logging to prevent spam
  const errorKey = `${type}-${error?.message || error}`;
  
  try {
    const lastLogged = sessionStorage.getItem(`lastError-${errorKey}`);
    const now = Date.now();
    
    if (lastLogged && (now - parseInt(lastLogged)) < 5000) {
      return; // Don't log the same error within 5 seconds
    }
    
    sessionStorage.setItem(`lastError-${errorKey}`, now.toString());
  } catch {
    // Ignore sessionStorage errors (e.g., in iframes with blocked cookies)
    console.warn('Could not access sessionStorage for error throttling');
  }
  
  const errorLog = {
    type,
    error: error?.message || error,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error('Error logged:', errorLog);
  
  try {
    const database = await initDB();
    await database.put('errorLogs', errorLog);
  } catch (logError) {
    console.error('Failed to log error to database:', logError);
  }
};

// Books operations
export const saveBook = async (book: Book) => {
  try {
    const database = await initDB();
    await database.put('books', book);
  } catch (error) {
    logError('SAVE_BOOK_FAILED', error, { bookId: book.id });
    throw error;
  }
};

export const getBooks = async (): Promise<Book[]> => {
  try {
    const database = await initDB();
    return database.getAll('books');
  } catch (error) {
    logError('GET_BOOKS_FAILED', error);
    return [];
  }
};

export const getBook = async (id: string): Promise<Book | undefined> => {
  try {
    const database = await initDB();
    return database.get('books', id);
  } catch (error) {
    logError('GET_BOOK_FAILED', error, { bookId: id });
    return undefined;
  }
};

export const deleteBook = async (id: string) => {
  try {
    const database = await initDB();
    const tx = database.transaction(['books', 'bookmarks', 'chapters', 'covers', 'navigation', 'readingSessions'], 'readwrite');
    
    await Promise.all([
      tx.objectStore('books').delete(id),
      tx.objectStore('bookmarks').index('bookId').getAllKeys(id).then(keys => 
        Promise.all(keys.map(key => tx.objectStore('bookmarks').delete(key)))
      ),
      tx.objectStore('chapters').index('bookId').getAllKeys(id).then(keys =>
        Promise.all(keys.map(key => tx.objectStore('chapters').delete(key)))
      ),
      tx.objectStore('covers').delete(id),
      tx.objectStore('navigation').index('bookId').getAllKeys(id).then(keys =>
        Promise.all(keys.map(key => tx.objectStore('navigation').delete(key)))
      )
    ]);
  } catch (error) {
    logError('DELETE_BOOK_FAILED', error, { bookId: id });
    throw error;
  }
};

// Cover image operations
export const saveCoverImage = async (bookId: string, imageBlob: Blob) => {
  try {
    const database = await initDB();
    await database.put('covers', {
      bookId,
      imageBlob,
      createdAt: new Date()
    });
  } catch (error) {
    logError('SAVE_COVER_FAILED', error, { bookId });
    throw error;
  }
};

export const getCoverImage = async (bookId: string): Promise<string | null> => {
  try {
    const database = await initDB();
    const cover = await database.get('covers', bookId);
    if (cover?.imageBlob) {
      return URL.createObjectURL(cover.imageBlob);
    }
    return null;
  } catch (error) {
    logError('GET_COVER_FAILED', error, { bookId });
    return null;
  }
};

// Preferences operations with proper interface theme handling
export const savePreferences = async (preferences: ReadingPreferences) => {
  try {
    const database = await initDB();
    
    // Ensure interface colors are properly set based on selected theme
    const interfaceTheme = getInterfaceTheme(preferences.selectedInterfaceTheme || 'light');
    const updatedPreferences = {
      ...preferences,
      interfaceColors: interfaceTheme.colors,
      interfaceTheme: interfaceTheme.id
    };
    
    await database.put('preferences', { id: 'default', ...updatedPreferences });
  } catch (error) {
    logError('SAVE_PREFERENCES_FAILED', error);
    throw error;
  }
};

export const getPreferences = async (): Promise<ReadingPreferences> => {
  try {
    const database = await initDB();
    const prefs = await database.get('preferences', 'default');
    
    if (!prefs) {
      // Return defaults if no preferences exist
      return DEFAULT_PREFERENCES;
    }
    
    // Ensure interface colors are properly set
    const interfaceTheme = getInterfaceTheme(prefs.selectedInterfaceTheme || 'light');
    
    // Merge stored preferences with defaults and ensure interface colors are current
    const mergedPrefs = {
      ...DEFAULT_PREFERENCES,
      ...prefs,
      interfaceColors: interfaceTheme.colors,
      interfaceTheme: interfaceTheme.id
    };
    
    return mergedPrefs;
  } catch (error) {
    logError('GET_PREFERENCES_FAILED', error);
    // Return defaults on error
    return DEFAULT_PREFERENCES;
  }
};

// Reset to defaults function - Clears EVERYTHING
export const resetToDefaults = async () => {
  try {
    const database = await initDB();
    
    // Get all object store names
    const storeNames = Array.from(database.objectStoreNames);
    
    // Clear all object stores
    const tx = database.transaction(storeNames, 'readwrite');
    await Promise.all(storeNames.map(storeName => tx.objectStore(storeName).clear()));
    await tx.done;
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Reload the page to ensure fresh state
    window.location.reload();
  } catch (error) {
    logError('RESET_TO_DEFAULTS_FAILED', error);
    throw error;
  }
};

// Navigation history operations
export const saveNavigationState = async (bookId: string, chapterIndex: number, scrollPosition: number = 0) => {
  try {
    const database = await initDB();
    await database.put('navigation', {
      id: `${bookId}-${chapterIndex}`,
      bookId,
      chapterIndex,
      scrollPosition,
      timestamp: new Date()
    });
  } catch (error) {
    logError('SAVE_NAVIGATION_FAILED', error, { bookId, chapterIndex });
  }
};

export const saveHeaderButtonPosition = async (x: number) => {
  try {
    const database = await initDB();
    await database.put('preferences', { id: 'header-button-x', x });
  } catch (error) {
    logError('SAVE_HEADER_BUTTON_X_FAILED', error);
  }
};

export const getHeaderButtonPosition = async (): Promise<number> => {
  try {
    const database = await initDB();
    const data = await database.get('preferences', 'header-button-x');
    return data?.x ?? 50;
  } catch (error) {
    logError('GET_HEADER_BUTTON_X_FAILED', error);
    return 50;
  }
};

export const getNavigationHistory = async (bookId: string) => {
  try {
    const database = await initDB();
    return database.getAllFromIndex('navigation', 'bookId', bookId);
  } catch (error) {
    logError('GET_NAVIGATION_FAILED', error, { bookId });
    return [];
  }
};

// Bookmarks operations
export const saveBookmark = async (bookmark: Bookmark) => {
  try {
    const database = await initDB();
    await database.put('bookmarks', bookmark);
  } catch (error) {
    logError('SAVE_BOOKMARK_FAILED', error, { bookmarkId: bookmark.id });
    throw error;
  }
};

export const getBookmarks = async (bookId?: string): Promise<Bookmark[]> => {
  try {
    const database = await initDB();
    if (bookId) {
      return database.getAllFromIndex('bookmarks', 'bookId', bookId);
    }
    return database.getAll('bookmarks');
  } catch (error) {
    logError('GET_BOOKMARKS_FAILED', error, { bookId });
    return [];
  }
};

export const deleteBookmark = async (id: string) => {
  try {
    const database = await initDB();
    await database.delete('bookmarks', id);
  } catch (error) {
    logError('DELETE_BOOKMARK_FAILED', error, { bookmarkId: id });
    throw error;
  }
};

// Auto-save bookmarks state
export const saveBookmarkState = async (bookId: string, isOpen: boolean) => {
  try {
    const database = await initDB();
    await database.put('preferences', { 
      id: `bookmark-state-${bookId}`, 
      isOpen,
      lastUpdated: new Date()
    });
  } catch (error) {
    logError('SAVE_BOOKMARK_STATE_FAILED', error, { bookId });
  }
};

export const getBookmarkState = async (bookId: string): Promise<boolean> => {
  try {
    const database = await initDB();
    const state = await database.get('preferences', `bookmark-state-${bookId}`);
    return state?.isOpen || false;
  } catch (error) {
    logError('GET_BOOKMARK_STATE_FAILED', error, { bookId });
    return false;
  }
};

// Reading stats operations
export const saveReadingStats = async (stats: ReadingStats) => {
  try {
    const database = await initDB();
    await database.put('stats', { id: 'default', ...stats });
  } catch (error) {
    logError('SAVE_STATS_FAILED', error);
    throw error;
  }
};

export const getReadingStats = async (): Promise<ReadingStats> => {
  try {
    const database = await initDB();
    const stats = await database.get('stats', 'default');
    
    return stats || {
      totalTimeRead: 0,
      booksCompleted: 0,
      pagesRead: 0,
      averageReadingSpeed: 0,
      streakDays: 0,
      lastReadDate: new Date()
    };
  } catch (error) {
    logError('GET_STATS_FAILED', error);
    return {
      totalTimeRead: 0,
      booksCompleted: 0,
      pagesRead: 0,
      averageReadingSpeed: 0,
      streakDays: 0,
      lastReadDate: new Date()
    };
  }
};

// Chapter cache operations
export const cacheChapter = async (bookId: string, chapterIndex: number, content: string) => {
  try {
    const database = await initDB();
    await database.put('chapters', {
      id: `${bookId}-${chapterIndex}`,
      bookId,
      chapterIndex,
      content,
      cachedAt: new Date()
    });
  } catch (error) {
    logError('CACHE_CHAPTER_FAILED', error, { bookId, chapterIndex });
  }
};

export const getCachedChapter = async (bookId: string, chapterIndex: number): Promise<string | null> => {
  try {
    const database = await initDB();
    const cached = await database.get('chapters', `${bookId}-${chapterIndex}`);
    return cached?.content || null;
  } catch (error) {
    logError('GET_CACHED_CHAPTER_FAILED', error, { bookId, chapterIndex });
    return null;
  }
};

// Export/Import functionality
export const exportUserData = async () => {
  try {
    const database = await initDB();
    
    // Get all data from all stores
    const [
      books, 
      preferences, 
      bookmarks, 
      stats, 
      chapters, 
      covers, 
      navigation, 
      readingSessions
    ] = await Promise.all([
      database.getAll('books'),
      database.getAll('preferences'),
      database.getAll('bookmarks'),
      database.get('stats', 'default'),
      database.getAll('chapters'),
      database.getAll('covers'),
      database.getAll('navigation'),
      database.getAll('readingSessions')
    ]);

    // We do NOT export the actual book files or cover images as requested
    const processedBooks = books.map(book => ({
      ...book,
      file: null,
      fileData: undefined
    }));

    const processedCovers = covers.map(cover => ({
      ...cover,
      imageBlob: null,
      imageData: undefined
    }));

    const exportData = {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      localStorage: { ...localStorage },
      database: {
        books: processedBooks,
        preferences,
        bookmarks,
        stats,
        chapters,
        covers: processedCovers,
        navigation,
        readingSessions
      }
    };

    // Create and download the file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebook-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
  } catch (error) {
    logError('EXPORT_DATA_FAILED', error);
    throw error;
  }
};

export const importUserData = async (data: any) => {
  try {
    const database = await initDB();
    const storeNames = ['preferences', 'bookmarks', 'stats', 'chapters', 'navigation', 'readingSessions', 'books', 'covers'];
    const tx = database.transaction(storeNames, 'readwrite');

    // Helper to convert date strings to Date objects
    const toDate = (val: any) => {
      if (!val) return val;
      if (val instanceof Date) return val;
      const date = new Date(val);
      return isNaN(date.getTime()) ? val : date;
    };

    // Import localStorage
    if (data.localStorage) {
      Object.entries(data.localStorage).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
    }

    // Import database stores
    const dbData = data.database;
    if (dbData) {
      if (dbData.preferences) {
        for (const pref of dbData.preferences) {
          await tx.objectStore('preferences').put(pref);
        }
      }
      if (dbData.bookmarks) {
        for (const bookmark of dbData.bookmarks) {
          await tx.objectStore('bookmarks').put({
            ...bookmark,
            createdAt: toDate(bookmark.createdAt)
          });
        }
      }
      if (dbData.stats) {
        await tx.objectStore('stats').put({ 
          id: 'default', 
          ...dbData.stats,
          lastReadDate: toDate(dbData.stats.lastReadDate)
        });
      }
      if (dbData.chapters) {
        for (const chapter of dbData.chapters) {
          await tx.objectStore('chapters').put({
            ...chapter,
            cachedAt: toDate(chapter.cachedAt)
          });
        }
      }
      if (dbData.navigation) {
        for (const nav of dbData.navigation) {
          await tx.objectStore('navigation').put({
            ...nav,
            timestamp: toDate(nav.timestamp)
          });
        }
      }
      if (dbData.readingSessions) {
        for (const session of dbData.readingSessions) {
          await tx.objectStore('readingSessions').put({
            ...session,
            startTime: toDate(session.startTime),
            endTime: toDate(session.endTime)
          });
        }
      }
      // Books and Covers will be handled specially if they need files
      if (dbData.books) {
        for (const book of dbData.books) {
          await tx.objectStore('books').put({
            ...book,
            lastRead: toDate(book.lastRead),
            addedAt: toDate(book.addedAt)
          });
        }
      }
      if (dbData.covers) {
        for (const cover of dbData.covers) {
          await tx.objectStore('covers').put({
            ...cover,
            createdAt: toDate(cover.createdAt)
          });
        }
      }
    }

    await tx.done;
    return true;
  } catch (error) {
    logError('IMPORT_DATA_FAILED', error);
    throw error;
  }
};
