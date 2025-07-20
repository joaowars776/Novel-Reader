import { useState, useEffect, useCallback } from 'react';
import { saveBook, getBook } from '../utils/storage';
import type { Book } from '../types';

export const useReadingProgress = (bookId: string) => {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSave, setLastSave] = useState<Date>(new Date());

  // Load book data
  useEffect(() => {
    const loadBook = async () => {
      try {
        const bookData = await getBook(bookId);
        if (bookData) {
          setBook(bookData);
        }
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!book) return;

    const interval = setInterval(async () => {
      try {
        await saveBook(book);
        setLastSave(new Date());
      } catch (error) {
        console.error('Error auto-saving progress:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [book]);

  const updateProgress = useCallback(async (updates: Partial<Pick<Book, 'progress' | 'currentChapter' | 'scrollPosition' | 'lastRead'>>) => {
    if (!book) return;

    const updatedBook = {
      ...book,
      ...updates,
      lastRead: new Date()
    };

    setBook(updatedBook);

    // Save immediately on chapter change
    if (updates.currentChapter !== undefined && updates.currentChapter !== book.currentChapter) {
      try {
        await saveBook(updatedBook);
        setLastSave(new Date());
      } catch (error) {
        console.error('Error saving progress on chapter change:', error);
      }
    }
  }, [book]);

  const saveProgress = useCallback(async () => {
    if (!book) return;

    try {
      await saveBook(book);
      setLastSave(new Date());
    } catch (error) {
      console.error('Error manually saving progress:', error);
    }
  }, [book]);

  return {
    book,
    isLoading,
    lastSave,
    updateProgress,
    saveProgress
  };
};
