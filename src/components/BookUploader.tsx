import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, BookOpen, X, FileText, File, Folder } from 'lucide-react';
import { createBookFromSupportedFile, getSupportedFileTypes, getFileType } from '../utils/file-parser';
import { saveBook } from '../utils/storage';
import { getTranslation } from '../utils/translations';
import { useDragDropController } from '../hooks/useDragDropController';
import type { Book } from '../types';

interface BookUploaderProps {
  onBookAdded: (book: Book) => void;
  onClose?: () => void;
}

export const BookUploader: React.FC<BookUploaderProps> = ({ onBookAdded, onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const supportedTypes = getSupportedFileTypes();

  const { enableDragForElement } = useDragDropController({
    enableDragOverlay: false,
    allowedFileTypes: supportedTypes,
    preventDefaultDragBehavior: true
  });

  useEffect(() => {
    if (dropZoneRef.current) {
      enableDragForElement(dropZoneRef.current);
    }
  }, [enableDragForElement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const processFile = useCallback(async (file: File) => {
    const fileType = getFileType(file);
    
    if (!fileType) {
      setError(getTranslation('pleaseSelectSupportedFile'));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const bookData = await createBookFromSupportedFile(file);
      const book: Book = {
        id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...bookData
      };

      if (book.cover) {
        try {
          if (book.fileType === 'epub') {
            const { EpubParser } = await import('../utils/epub-parser');
            const parser = new EpubParser(file);
            await parser.initialize();
            await parser.cacheCoverImage(book.id);
            parser.destroy();
          } else if (book.fileType === 'pdf') {
            const { PdfParser } = await import('../utils/pdf-parser');
            const parser = new PdfParser(file);
            await parser.initialize();
            await parser.cacheCoverImage(book.id);
            parser.destroy();
          }
        } catch (coverError) {
          console.warn('Could not cache cover image:', coverError);
        }
      }

      await saveBook(book);
      onBookAdded(book);
      onClose?.();
    } catch (error) {
      console.error('Error processing file:', error);
      setError(getTranslation('failedToProcessFile'));
    } finally {
      setIsUploading(false);
    }
  }, [onBookAdded, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer?.files || []);
    const supportedFile = files.find(file => {
      const fileName = file.name.toLowerCase();
      return supportedTypes.some(type => fileName.endsWith(type));
    });

    if (supportedFile) {
      processFile(supportedFile);
    } else {
      setError(getTranslation('pleaseDropSupportedFile'));
    }
  }, [processFile, supportedTypes]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const supportedFile = files.find(file => {
      const fileName = file.name.toLowerCase();
      return supportedTypes.some(type => fileName.endsWith(type));
    });

    if (supportedFile) {
      processFile(supportedFile);
    } else if (files.length > 0) {
      setError(getTranslation('noSupportedFilesInFolder'));
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  }, [processFile, supportedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        setIsDragOver(false);
      }
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div ref={modalContentRef} className="bg-white rounded-3xl max-w-2xl w-full p-6 relative animate-scale-in shadow-2xl border border-gray-100 themed-panel">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={getTranslation('closeUploader')}
          >
            <X className="w-6 h-6" style={{ color: 'var(--interface-textSecondary)' }} />
          </button>
        )}

        <div className="text-center mb-6 mt-10">
          <BookOpen className="w-14 h-14 mx-auto mb-3" style={{ color: 'var(--interface-accent)' }} />
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--interface-textPrimary)' }}>{getTranslation('addNewBook')}</h2>
          <p className="text-lg" style={{ color: 'var(--interface-textSecondary)' }}>{getTranslation('uploadSupportedFile')}</p>
        </div>

        <div
          ref={dropZoneRef}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-in-out ${
            isDragOver
              ? 'transform scale-[1.01] shadow-lg'
              : 'hover:shadow-md'
          } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
          style={{
            borderColor: isDragOver ? 'var(--interface-accent)' : 'var(--interface-divider)',
            backgroundColor: isDragOver ? 'var(--interface-panelSecondaryBackground)' : 'transparent',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnter={handleDragEnter}
          data-drop-zone="true"
        >
          <Upload className={`w-14 h-14 mx-auto mb-4 transition-all duration-300 ${isDragOver ? 'transform scale-110' : ''}`} style={{ color: isDragOver ? 'var(--interface-accent)' : 'var(--interface-textMuted)' }} />
          
          <div className="mb-4">
            <p className="text-xl font-semibold mb-1" style={{ color: 'var(--interface-textPrimary)' }}>
              {isDragOver ? getTranslation('dropFileHere') : getTranslation('dragAndDropFile')}
            </p>
            <p className="text-base" style={{ color: 'var(--interface-textSecondary)' }}>{getTranslation('or')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <label className="inline-block">
              <input
                type="file"
                accept={supportedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
                ref={fileInputRef}
              />
              <span className="px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer inline-flex items-center justify-center font-semibold text-lg transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--interface-buttonPrimary)',
                  color: 'var(--interface-buttonPrimaryText)',
                  boxShadow: '0 0 0 3px var(--interface-accent)',
                }}
              >
                <FileText className="w-5 h-5 mr-2" />
                {isUploading ? getTranslation('processing') : getTranslation('selectFile')}
              </span>
            </label>

            <label className="inline-block">
              <input
                type="file"
                // @ts-ignore webkitdirectory is a non-standard property
                webkitdirectory=""
                directory=""
                onChange={handleFolderSelect}
                className="hidden"
                disabled={isUploading}
                ref={folderInputRef}
              />
              <span className="px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer inline-flex items-center justify-center font-semibold text-lg transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--interface-buttonSecondary)',
                  color: 'var(--interface-buttonSecondaryText)',
                  boxShadow: '0 0 0 3px var(--interface-accent)',
                }}
              >
                <Folder className="w-5 h-5 mr-2" />
                {getTranslation('selectFolder')}
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-5 p-3 rounded-lg animate-fade-in text-sm font-medium"
            style={{
              backgroundColor: 'var(--interface-error)',
              color: 'var(--interface-buttonPrimaryText)',
              border: '1px solid var(--interface-error)',
            }}
          >
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3 text-center" style={{ color: 'var(--interface-textSecondary)' }}>{getTranslation('supportedFormats')}:</h3>
          <div className="flex gap-3 justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm border"
              style={{
                backgroundColor: 'var(--interface-panelSecondaryBackground)',
                borderColor: 'var(--interface-divider)',
              }}
            >
              <FileText className="w-4 h-4" style={{ color: 'var(--interface-accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--interface-textPrimary)' }}>EPUB</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm border"
              style={{
                backgroundColor: 'var(--interface-panelSecondaryBackground)',
                borderColor: 'var(--interface-divider)',
              }}
            >
              <File className="w-4 h-4" style={{ color: 'var(--interface-error)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--interface-textPrimary)' }}>PDF</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-center" style={{ color: 'var(--interface-textMuted)' }}>
          {getTranslation('supportedFormatsDescription')}
        </div>
      </div>
    </div>
  );
};
