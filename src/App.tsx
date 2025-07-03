import React, { useState, useEffect } from 'react';
import { Library } from './components/Library';
import { ReaderContainer } from './components/Reader/ReaderContainer';
import { initDB, logError } from './utils/storage';
import { initializeLanguage } from './utils/translations';
import { dragDropController } from './utils/dragDropController';
import type { Book } from './types';

function App() {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize the database, language, and drag drop controller
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize language first
        initializeLanguage();
        
        // Initialize drag drop controller to prevent unwanted popups
        dragDropController.init();
        
        await initDB();
        setIsInitialized(true);
        console.log('Application initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
        logError('APP_INIT_FAILED', error);
        setInitError('Failed to initialize the application. Please refresh the page.');
        setIsInitialized(true); // Still show the UI even if DB fails
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      // Note: We don't destroy the singleton dragDropController here
      // as it should persist for the entire app lifecycle
    };
  }, []);

  // Handle browser navigation and URL parsing
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      const bookTitleMatch = path.match(/^\/([^\/]+)\/chapter\/(\d+)$/);
      
      if (bookTitleMatch && currentBook) {
        const chapterNumber = parseInt(bookTitleMatch[2], 10);
        // Update current chapter if different from URL
        if (chapterNumber - 1 !== currentBook.currentChapter) {
          setCurrentBook(prev => prev ? { ...prev, currentChapter: chapterNumber - 1 } : null);
        }
      }
    };

    handleRouting();
    window.addEventListener('popstate', handleRouting);
    
    return () => {
      window.removeEventListener('popstate', handleRouting);
    };
  }, [currentBook]);

  const handleOpenBook = (book: Book) => {
    try {
      // Validate book before opening
      if (!book.file || book.file.size === 0) {
        throw new Error('Book file is corrupted or missing');
      }
      
      setCurrentBook(book);
      
      // Update URL for the book
      const bookTitle = book.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const newUrl = `/${bookTitle}/chapter/${book.currentChapter + 1}`;
      window.history.pushState(
        { bookId: book.id, chapterIndex: book.currentChapter },
        `${book.title} - Chapter ${book.currentChapter + 1}`,
        newUrl
      );
    } catch (error) {
      console.error('Error opening book:', error);
      logError('OPEN_BOOK_FAILED', error, { bookId: book.id });
      alert('Failed to open the book. The file may be corrupted.');
    }
  };

  const handleBackToLibrary = () => {
    setCurrentBook(null);
    
    // Reset URL to root
    window.history.pushState(null, 'eBook Reader Pro', '/');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing eBook Reader...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initialization Error</h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentBook ? (
        <ReaderContainer
          book={currentBook}
          onBackToLibrary={handleBackToLibrary}
        />
      ) : (
        <Library onOpenBook={handleOpenBook} />
      )}
    </div>
  );
}

export default App;