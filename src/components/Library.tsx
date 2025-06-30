import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, BookOpen, Clock, MoreVertical, Trash2, Globe, BarChart3, Library as LibraryIcon, Grid3X3, List, Upload, Settings } from 'lucide-react';
import { getBooks, deleteBook, getCoverImage, getPreferences, savePreferences } from '../utils/storage';
import { BookUploader } from './BookUploader';
import { LanguageSelector } from './LanguageSelector';
import { ReadingHistoryTab } from './ReadingHistory/ReadingHistoryTab';
import { HomePageSettings } from './HomePageSettings';
import { getTranslation, initializeLanguage } from '../utils/translations';
import { applyInterfaceTheme, getInterfaceTheme } from '../utils/themes';
import { useDragDropController } from '../hooks/useDragDropController';
import type { Book, ReadingPreferences } from '../types';

interface LibraryProps {
  onOpenBook: (book: Book) => void;
}

type ViewMode = 'cover' | 'detail';

export const Library: React.FC<LibraryProps> = ({ onOpenBook }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  const [showHomePageSettings, setShowHomePageSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cover');
  const [isDragOver, setIsDragOver] = useState(false);
  const [preferences, setPreferences] = useState<ReadingPreferences | null>(null);

  // Initialize drag drop controller to prevent unwanted popups
  const { enableDragForElement } = useDragDropController({
    enableDragOverlay: false,
    allowedFileTypes: ['.epub'],
    preventDefaultDragBehavior: true
  });

  // Initialize language on component mount
  useEffect(() => {
    initializeLanguage();
  }, []);

  // Load preferences and apply theme
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const userPrefs = await getPreferences();
        setPreferences(userPrefs);
        
        // Apply interface theme
        if (userPrefs.selectedInterfaceTheme) {
          const theme = getInterfaceTheme(userPrefs.selectedInterfaceTheme);
          applyInterfaceTheme(theme);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Load books from storage
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const loadedBooks = await getBooks();
        setBooks(loadedBooks);
        setFilteredBooks(loadedBooks);
        
        // Load cached cover images
        const covers: Record<string, string> = {};
        for (const book of loadedBooks) {
          const cachedCover = await getCoverImage(book.id);
          if (cachedCover) {
            covers[book.id] = cachedCover;
          }
        }
        setCoverUrls(covers);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Filter books based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [books, searchQuery]);

  // Controlled drag and drop handlers that work with the controller
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if the dragged items contain EPUB files
    const items = Array.from(e.dataTransfer?.items || []);
    const hasEpubFile = items.some(item => 
      item.kind === 'file' && item.type === 'application/epub+zip'
    );
    
    if (hasEpubFile) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're actually leaving the library area
    const target = e.target as Element;
    const relatedTarget = e.relatedTarget as Element;
    
    if (!target.closest('.library-container')?.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer?.files || []);
    const epubFile = files.find(file => file.name.toLowerCase().endsWith('.epub'));

    if (epubFile) {
      setIsUploaderOpen(true);
    }
  }, []);

  const handleBookAdded = async (newBook: Book) => {
    setBooks(prev => [newBook, ...prev]);
    
    // Load cover image for the new book
    const cachedCover = await getCoverImage(newBook.id);
    if (cachedCover) {
      setCoverUrls(prev => ({ ...prev, [newBook.id]: cachedCover }));
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm(getTranslation('confirmDeleteBook'))) {
      try {
        await deleteBook(bookId);
        setBooks(prev => prev.filter(book => book.id !== bookId));
        setCoverUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[bookId];
          return newUrls;
        });
        setSelectedBook(null);
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handlePreferencesChange = async (newPreferences: ReadingPreferences) => {
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
    }
  };

  const formatProgress = (progress: number) => {
    return Math.round(progress * 100);
  };

  const formatLastRead = (date?: Date) => {
    if (!date) return getTranslation('never');
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return getTranslation('justNow');
    if (diffInHours < 24) return `${Math.round(diffInHours)}${getTranslation('hoursAgo')}`;
    if (diffInHours < 168) return `${Math.round(diffInHours / 24)}${getTranslation('daysAgo')}`;
    return date.toLocaleDateString();
  };

  // Calculate grid items needed (books + exactly one placeholder)
  const getGridItems = () => {
    const items = [...filteredBooks];
    
    // Always add exactly one placeholder
    items.push(null);
    
    return items;
  };

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
      backgroundColor: preferences.interfaceColors.headerBackground || '#ffffff',
      color: preferences.interfaceColors.headerText || '#1f2937',
      borderColor: preferences.interfaceColors.headerBorder || '#e5e7eb'
    };
  };

  if (showReadingHistory) {
    return (
      <ReadingHistoryTab 
        onClose={() => setShowReadingHistory(false)}
        preferences={preferences}
        onPreferencesChange={handlePreferencesChange}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">{getTranslation('loadingLibrary')}</p>
        </div>
      </div>
    );
  }

  const interfaceStyles = getInterfaceStyles();

  return (
    <div 
      className="library-container min-h-screen transition-all duration-300"
      style={{ 
        backgroundColor: preferences?.interfaceColors?.panelSecondaryBackground || '#f9fafb',
        fontFamily: preferences?.applyFontGlobally ? 
          (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
           preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
           preferences.fontFamily === 'Crimson Text' ? 'Crimson Text, serif' :
           preferences.fontFamily === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
           'Georgia, serif') : undefined
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Controlled drag overlay - only shows for valid EPUB files */}
      {isDragOver && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl p-8 shadow-xl border-2 border-dashed border-blue-500">
            <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900">{getTranslation('dropEpubHere')}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header 
        className="shadow-sm border-b transition-all duration-300"
        style={{
          backgroundColor: interfaceStyles.backgroundColor,
          borderColor: interfaceStyles.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* My Library Section */}
              <div 
                className="flex items-center gap-3 px-4 py-2 rounded-lg border-2"
                style={{
                  backgroundColor: '#007BFF20',
                  borderColor: '#007BFF'
                }}
              >
                <LibraryIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: interfaceStyles.color }}>
                    {getTranslation('myLibrary')}
                  </h1>
                  <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {books.length} {books.length === 1 ? getTranslation('book') : getTranslation('books')}
                  </p>
                </div>
              </div>

              {/* My Statistics Section */}
              <button
                onClick={() => setShowReadingHistory(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border-2 hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: preferences?.interfaceColors?.panelSecondaryBackground || '#f9fafb',
                  borderColor: interfaceStyles.borderColor,
                  color: interfaceStyles.color
                }}
                aria-label="My Statistics"
              >
                <BarChart3 className="w-8 h-8 text-gray-600" />
                <div className="text-left">
                  <h2 className="text-xl font-bold">{getTranslation('readingHistory')}</h2>
                  <p className="text-sm opacity-70">{getTranslation('trackYourProgress')}</p>
                </div>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div 
                className="flex items-center rounded-lg p-1"
                style={{ backgroundColor: preferences?.interfaceColors?.panelSecondaryBackground || '#f3f4f6' }}
              >
                <button
                  onClick={() => setViewMode('cover')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'cover' 
                      ? 'shadow-sm' 
                      : ''
                  }`}
                  style={{
                    backgroundColor: viewMode === 'cover' ? interfaceStyles.backgroundColor : 'transparent',
                    color: viewMode === 'cover' ? '#007BFF' : interfaceStyles.color
                  }}
                  title={getTranslation('coverView')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('detail')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'detail' 
                      ? 'shadow-sm' 
                      : ''
                  }`}
                  style={{
                    backgroundColor: viewMode === 'detail' ? interfaceStyles.backgroundColor : 'transparent',
                    color: viewMode === 'detail' ? '#007BFF' : interfaceStyles.color
                  }}
                  title={getTranslation('detailView')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Home Page Settings */}
              <button
                onClick={() => setShowHomePageSettings(true)}
                className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                style={{ color: interfaceStyles.color }}
                aria-label={getTranslation('homePageSettings')}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                  style={{ color: interfaceStyles.color }}
                  aria-label={getTranslation('language')}
                >
                  <Globe className="w-5 h-5" />
                </button>
                
                {showLanguageSelector && (
                  <div className="absolute top-full right-0 mt-2 z-50">
                    <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsUploaderOpen(true)}
                className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                style={{ backgroundColor: '#007BFF' }}
              >
                <Plus className="w-5 h-5" />
                {getTranslation('addBook')}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={getTranslation('searchBooks')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              style={{
                backgroundColor: interfaceStyles.backgroundColor,
                borderColor: interfaceStyles.borderColor,
                color: interfaceStyles.color
              }}
            />
          </div>
        </div>
      </header>

      {/* Books Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBooks.length === 0 && books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2" style={{ color: interfaceStyles.color }}>
              {getTranslation('noBooksYet')}
            </h3>
            <p className="mb-6" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
              {getTranslation('addFirstBook')}
            </p>
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: '#007BFF' }}
            >
              {getTranslation('addYourFirstBook')}
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2" style={{ color: interfaceStyles.color }}>
              {getTranslation('noBooksFound')}
            </h3>
            <p style={{ color: interfaceStyles.color, opacity: 0.7 }}>
              {getTranslation('tryAdjustingSearch')}
            </p>
          </div>
        ) : viewMode === 'cover' ? (
          /* Cover View - 5 Column Grid */
          <div className="grid grid-cols-5 gap-6">
            {getGridItems().map((book, index) => {
              if (!book) {
                // Placeholder - exactly one
                return (
                  <div
                    key={`placeholder-${index}`}
                    className="aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 transition-all duration-300 cursor-pointer group"
                    style={{
                      borderColor: interfaceStyles.borderColor,
                      backgroundColor: preferences?.interfaceColors?.panelSecondaryBackground || '#f9fafb'
                    }}
                    onClick={() => setIsUploaderOpen(true)}
                    data-drop-zone="true"
                  >
                    <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium text-center px-2">
                      {getTranslation('dragAndDropEbook')}
                    </span>
                    <span className="text-xs text-center px-2 mt-1">
                      {getTranslation('or')} {getTranslation('selectEbook')}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={book.id}
                  className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border overflow-hidden group transform hover:scale-105"
                  style={{
                    backgroundColor: interfaceStyles.backgroundColor,
                    borderColor: interfaceStyles.borderColor
                  }}
                >
                  {/* Book Cover */}
                  <div 
                    className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden cursor-pointer"
                    onClick={() => onOpenBook(book)}
                  >
                    {coverUrls[book.id] || book.cover ? (
                      <img
                        src={coverUrls[book.id] || book.cover}
                        alt={`${book.title} cover`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.querySelector('.fallback-cover')?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback cover */}
                    <div className={`fallback-cover w-full h-full flex items-center justify-center ${(coverUrls[book.id] || book.cover) ? 'hidden' : ''}`}>
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>

                    {/* Actions menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBook(selectedBook === book.id ? null : book.id);
                          }}
                          className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-all duration-300"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {selectedBook === book.id && (
                          <div 
                            className="absolute top-full right-0 mt-1 rounded-lg shadow-lg border py-1 z-10 animate-fade-in"
                            style={{
                              backgroundColor: interfaceStyles.backgroundColor,
                              borderColor: interfaceStyles.borderColor
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBook(book.id);
                              }}
                              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:bg-opacity-20 flex items-center gap-2 transition-colors duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                              {getTranslation('delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modern Progress Bar */}
                  {book.progress > 0 && (
                    <div className="px-4 pt-3">
                      <div className="flex items-center justify-between text-xs mb-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        <span>{getTranslation('complete')}</span>
                        <span className="font-medium">{formatProgress(book.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${formatProgress(book.progress)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Book Info */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => onOpenBook(book)}
                  >
                    <h3 className="font-semibold mb-1 line-clamp-2 leading-tight text-sm" style={{ color: interfaceStyles.color }}>
                      {book.title}
                    </h3>
                    <p className="text-xs mb-2 line-clamp-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                      by {book.author}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <span>{getTranslation('lastRead')}: {formatLastRead(book.lastRead)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Detail View - Text-based List */
          <div className="space-y-4">
            {/* Add placeholder at the top in detail view */}
            <div
              className="rounded-xl shadow-sm border-2 border-dashed p-6 hover:border-gray-400 transition-all duration-300 cursor-pointer group"
              style={{
                backgroundColor: interfaceStyles.backgroundColor,
                borderColor: interfaceStyles.borderColor
              }}
              onClick={() => setIsUploaderOpen(true)}
              data-drop-zone="true"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: preferences?.interfaceColors?.panelSecondaryBackground || '#f3f4f6' }}
                >
                  <Upload className="w-6 h-6 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {getTranslation('selectEbook')}
                  </h3>
                  <p className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.5 }}>
                    {getTranslation('dragAndDropEbook')}
                  </p>
                </div>
              </div>
            </div>

            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border overflow-hidden group"
                style={{
                  backgroundColor: interfaceStyles.backgroundColor,
                  borderColor: interfaceStyles.borderColor
                }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Book Cover Thumbnail */}
                    <div 
                      className="w-16 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => onOpenBook(book)}
                    >
                      {coverUrls[book.id] || book.cover ? (
                        <img
                          src={coverUrls[book.id] || book.cover}
                          alt={`${book.title} cover`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement?.querySelector('.fallback-cover')?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      
                      <div className={`fallback-cover w-full h-full flex items-center justify-center ${(coverUrls[book.id] || book.cover) ? 'hidden' : ''}`}>
                        <BookOpen className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>

                    {/* Book Details */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onOpenBook(book)}
                    >
                      <h3 className="font-semibold mb-1 text-lg" style={{ color: interfaceStyles.color }}>
                        {book.title}
                      </h3>
                      <p className="mb-2" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        by {book.author}
                      </p>
                      
                      {/* Progress Bar */}
                      {book.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                            <span>{getTranslation('complete')}</span>
                            <span className="font-medium">{formatProgress(book.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${formatProgress(book.progress)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                        <span>{getTranslation('lastRead')}: {formatLastRead(book.lastRead)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBook(selectedBook === book.id ? null : book.id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {selectedBook === book.id && (
                        <div 
                          className="absolute top-full right-0 mt-1 rounded-lg shadow-lg border py-1 z-10 animate-fade-in"
                          style={{
                            backgroundColor: interfaceStyles.backgroundColor,
                            borderColor: interfaceStyles.borderColor
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id);
                            }}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:bg-opacity-20 flex items-center gap-2 transition-colors duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            {getTranslation('delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Book Uploader Modal */}
      {isUploaderOpen && (
        <div className="animate-fade-in">
          <BookUploader
            onBookAdded={handleBookAdded}
            onClose={() => setIsUploaderOpen(false)}
          />
        </div>
      )}

      {/* Home Page Settings Panel */}
      {showHomePageSettings && preferences && (
        <HomePageSettings
          preferences={preferences}
          onPreferencesChange={handlePreferencesChange}
          onClose={() => setShowHomePageSettings(false)}
        />
      )}
    </div>
  );
};