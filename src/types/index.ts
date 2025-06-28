export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  file: File;
  addedAt: Date;
  lastRead?: Date;
  progress: number;
  currentChapter: number;
  scrollPosition: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  href: string;
  order: number;
}

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  warning?: string;
  colors: {
    chapterTitleColor: string;
    textColor: string;
    backgroundColor: string;
  };
}

export interface InterfaceTheme {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  colors: {
    // Header colors
    headerBackground: string;
    headerText: string;
    headerBorder: string;
    
    // Panel colors (settings, bookmarks, TOC)
    panelBackground: string;
    panelText: string;
    panelBorder: string;
    panelSecondaryBackground: string;
    
    // Button colors
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonHover: string;
    
    // Input colors
    inputBackground: string;
    inputText: string;
    inputBorder: string;
    inputFocus: string;
    
    // Accent colors
    accent: string;
    accentHover: string;
    success: string;
    warning: string;
    error: string;
    
    // Text hierarchy
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Interactive elements
    linkColor: string;
    linkHover: string;
    divider: string;
    shadow: string;
    overlay: string;
  };
}

export interface ReadingPreferences {
  fontSize: number;
  fontFamily: 'Georgia' | 'Inter' | 'JetBrains Mono' | 'Crimson Text' | 'Source Sans Pro';
  lineHeight: number;
  marginSize: number;
  theme: ThemePreset | 'custom';
  customTheme?: CustomTheme;
  maxWidth: 'phone' | 'normal' | 'full';
  hideMenuWhileReading: boolean;
  colors: {
    chapterTitleColor: string;
    textColor: string;
    backgroundColor: string;
  };
  interfaceTheme: string;
  interfaceColors: InterfaceTheme['colors'];
  scrollButtons: {
    visible: boolean;
    size: 'small' | 'medium' | 'large' | 'custom';
    customSize?: number;
  };
  cornerNavigation: {
    visible: boolean;
  };
  selectedColorTheme?: string;
  selectedInterfaceTheme?: string;
  useThemeBasedColors?: boolean;
  syncInterfaceWithReading?: boolean;
  applyFontGlobally?: boolean;
  // Additional reading controls
  enablePageTurning?: boolean;
  enableReadingProgress?: boolean;
  enableNightMode?: boolean;
  enableFocusMode?: boolean;
  enableTextToSpeech?: boolean;
  enableFastFavorite?: boolean;
  fastFavoriteName?: string;
}

export interface CustomTheme {
  background: string;
  text: string;
  accent: string;
}

export type ThemePreset = 'light' | 'sepia' | 'dark' | 'high-contrast';

export interface Bookmark {
  id: string;
  bookId: string;
  chapterIndex: number;
  position: number;
  text: string;
  label: string;
  createdAt: Date;
}

export interface ReadingStats {
  totalTimeRead: number;
  booksCompleted: number;
  pagesRead: number;
  averageReadingSpeed: number;
  streakDays: number;
  lastReadDate: Date;
}

export interface SearchResult {
  chapterIndex: number;
  chapterTitle: string;
  text: string;
  position: number;
  matchStart: number;
  matchEnd: number;
}