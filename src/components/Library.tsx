import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Clock, MoreVertical, Trash2, Globe } from 'lucide-react';
import { getBooks, deleteBook, getCoverImage } from '../utils/storage';
import { BookUploader } from './BookUploader';
import { LanguageSelector } from './LanguageSelector';
import { getTranslation, initializeLanguage } from '../utils/translations';
import type { Book } from '../types';

interface LibraryProps {
  onOpenBook: (book: Book) => void;
}

export const Library: React.FC<LibraryProps> = ({ onOpenBook }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Initialize language on component mount
  useEffect(() => {
    initializeLanguage();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getTranslation('myLibrary')}</h1>
              <p className="text-gray-600 mt-1">
                {books.length} {books.length === 1 ? getTranslation('book') : getTranslation('books')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300"
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
      </header>

      {/* Books Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            {books.length === 0 ? (
              <>
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">{getTranslation('noBooksYet')}</h3>
                <p className="text-gray-600 mb-6">{getTranslation('addFirstBook')}</p>
                <button
                  onClick={() => setIsUploaderOpen(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  {getTranslation('addYourFirstBook')}
                </button>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">{getTranslation('noBooksFound')}</h3>
                <p className="text-gray-600">{getTranslation('tryAdjustingSearch')}</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group transform hover:scale-105"
              >
                {/* Book Cover */}
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                  {coverUrls[book.id] || book.cover ? (
                    <img
                      src={coverUrls[book.id] || book.cover}
                      alt={`${book.title} cover`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to default cover if image fails to load
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
                  
                  {/* Progress overlay */}
                  {book.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transition-opacity duration-300">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatProgress(book.progress)}% {getTranslation('complete')}</span>
                      </div>
                    </div>
                  )}

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
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-fade-in">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id);
                            }}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            {getTranslation('delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => onOpenBook(book)}
                >
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-1">by {book.author}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{getTranslation('lastRead')}: {formatLastRead(book.lastRead)}</span>
                    {book.progress > 0 && (
                      <span>{formatProgress(book.progress)}%</span>
                    )}
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
    </div>
  );
};