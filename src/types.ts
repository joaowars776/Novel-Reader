export interface ReadingPreferences {
  fontSize: number;
  fontFamily: 'Inter' | 'Georgia' | 'JetBrains Mono';
  lineHeight: number;
  marginSize: number; // Letter spacing
  theme: 'light' | 'dark' | 'sepia' | 'highcontrast' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'custom';
  maxWidth: 'phone' | 'normal' | 'full';
  hideMenuWhileReading: boolean;
  colors: {
    chapterTitleColor: string;
    textColor: string;
    backgroundColor: string;
  };
  interfaceTheme: 'light' | 'dark' | 'sepia' | 'highcontrast' | 'ocean' | 'forest' | 'sunset' | 'lavender';
  interfaceColors: {
    headerBackground: string;
    headerText: string;
    headerBorder: string;
    panelBackground: string;
    panelText: string;
    borderColor: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
  };
  scrollButtons: {
    visible: boolean;
    size: 'small' | 'medium' | 'large' | 'custom';
    customSize: number;
  };
  cornerNavigation: {
    visible: boolean;
  };
  selectedColorTheme: string;
  selectedInterfaceTheme: string;
  useThemeBasedColors: boolean;
  syncInterfaceWithReading: boolean;
  applyFontGlobally: boolean;
  enablePageTurning: boolean;
  enableReadingProgress: boolean;
  enableNightMode: boolean;
  enableFocusMode: boolean;
  enableTextToSpeech: boolean;
  enableFastFavorite: boolean;
  fastFavoriteName: string;
  iconVisibility: IconVisibility;
}

export interface IconVisibility {
  showSearchIcon?: boolean;
  showBookmarkIcon?: boolean;
  showFavoriteIcon?: boolean;
  showShareIcon?: boolean;
  showFullscreenIcon?: boolean;
  showShortcutsIcon?: boolean; // New: Show/hide shortcuts icon
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  file: File;
  fileType: 'epub' | 'pdf' | 'txt';
  lastRead: Date;
  currentChapter: number;
  progress: number;
  totalPages?: number;
  currentPage?: number;
  metadata?: { [key: string]: any };
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterIndex: number;
  position: number; // Scroll position or page number
  text: string; // Snippet of text for context
  label?: string; // User-defined label
  createdAt: Date;
}

export interface ReadingStats {
  totalTimeRead: number; // in minutes
  booksCompleted: number;
  pagesRead: number;
  averageReadingSpeed: number; // words per minute
  streakDays: number;
  lastReadDate: Date;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  startChapterIndex: number;
  startChapterTitle: string;
  endChapterIndex?: number;
  endChapterTitle?: string;
  activityLog: { timestamp: Date; type: 'read' | 'idle' | 'chapter_change' }[];
}

export interface SearchResult {
  chapterIndex: number;
  chapterTitle: string;
  text: string;
  position: number; // Relative position within the chapter (e.g., paragraph index, or scrollY)
  matchStart: number; // Start index of the match within the text snippet
  matchEnd: number; // End index of the match within the text snippet
}

export interface ColorTheme {
  id: string;
  name: string;
  colors: {
    chapterTitleColor: string;
    textColor: string;
    backgroundColor: string;
  };
}

export interface InterfaceTheme {
  id: string;
  name: string;
  colors: {
    headerBackground: string;
    headerText: string;
    headerBorder: string;
    panelBackground: string;
    panelText: string;
    borderColor: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
  };
}
