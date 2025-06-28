import React, { useCallback, useState } from 'react';
import { Upload, BookOpen, X, Globe } from 'lucide-react';
import { createBookFromFile, EpubParser } from '../utils/epub-parser';
import { saveBook, saveCoverImage } from '../utils/storage';
import { LanguageSelector } from './LanguageSelector';
import { getTranslation } from '../utils/translations';
import type { Book } from '../types';

interface BookUploaderProps {
  onBookAdded: (book: Book) => void;
  onClose?: () => void;
}

export const BookUploader: React.FC<BookUploaderProps> = ({ onBookAdded, onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      setError(getTranslation('pleaseSelectEpub'));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const bookData = await createBookFromFile(file);
      const book: Book = {
        id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...bookData
      };

      // Cache cover image if available
      if (book.cover) {
        try {
          const parser = new EpubParser(file);
          await parser.initialize();
          await parser.cacheCoverImage(book.id);
          parser.destroy();
        } catch (coverError) {
          console.warn('Could not cache cover image:', coverError);
        }
      }

      await saveBook(book);
      onBookAdded(book);
      onClose?.();
    } catch (error) {
      console.error('Error processing EPUB file:', error);
      setError(getTranslation('failedToProcessEpub'));
    } finally {
      setIsUploading(false);
    }
  }, [onBookAdded, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer?.files || []);
    const epubFile = files.find(file => file.name.toLowerCase().endsWith('.epub'));

    if (epubFile) {
      processFile(epubFile);
    } else {
      setError(getTranslation('pleaseDropEpub'));
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-scale-in">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
            aria-label={getTranslation('closeUploader')}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Language Selector */}
        <div className="absolute top-4 left-4">
          <div className="relative">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300"
              aria-label={getTranslation('language')}
            >
              <Globe className="w-5 h-5" />
            </button>
            
            {showLanguageSelector && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-6 mt-8">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTranslation('addNewBook')}</h2>
          <p className="text-gray-600">{getTranslation('uploadEpubFile')}</p>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 transform scale-105'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 transition-all duration-300 ${isDragOver ? 'text-blue-600 transform scale-110' : 'text-gray-400'}`} />
          
          <div className="mb-4">
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? getTranslation('dropEpubHere') : getTranslation('dragAndDropEpub')}
            </p>
            <p className="text-gray-600">{getTranslation('or')}</p>
          </div>

          <label className="inline-block">
            <input
              type="file"
              accept=".epub"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer inline-block font-medium transform hover:scale-105">
              {isUploading ? getTranslation('processing') : getTranslation('chooseFile')}
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          {getTranslation('supportedFormat')}
        </div>
      </div>
    </div>
  );
};