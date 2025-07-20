import { EpubParser, createBookFromFile } from './epub-parser';
import { PdfParser, createBookFromPdfFile } from './pdf-parser';
import type { Book } from '../types';

export type SupportedFileType = 'epub' | 'pdf';

export const getSupportedFileTypes = (): string[] => {
  return ['.epub', '.pdf'];
};

export const getFileType = (file: File): SupportedFileType | null => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.epub')) {
    return 'epub';
  } else if (fileName.endsWith('.pdf')) {
    return 'pdf';
  }
  
  return null;
};

export const isFileSupported = (file: File): boolean => {
  return getFileType(file) !== null;
};

export const createBookFromSupportedFile = async (file: File): Promise<Omit<Book, 'id'>> => {
  const fileType = getFileType(file);
  
  if (!fileType) {
    throw new Error('Unsupported file type. Only EPUB and PDF files are supported.');
  }
  
  switch (fileType) {
    case 'epub':
      const epubBook = await createBookFromFile(file);
      return { ...epubBook, fileType: 'epub' };
      
    case 'pdf':
      const pdfBook = await createBookFromPdfFile(file);
      return { ...pdfBook, fileType: 'pdf' };
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

export const createParserForFile = (file: File): EpubParser | PdfParser => {
  const fileType = getFileType(file);
  
  if (!fileType) {
    throw new Error('Unsupported file type. Only EPUB and PDF files are supported.');
  }
  
  switch (fileType) {
    case 'epub':
      return new EpubParser(file);
      
    case 'pdf':
      return new PdfParser(file);
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

export const getFileTypeDisplayName = (fileType: SupportedFileType): string => {
  switch (fileType) {
    case 'epub':
      return 'EPUB';
    case 'pdf':
      return 'PDF';
    default:
      return 'Unknown';
  }
};

export const getFileTypeDescription = (fileType: SupportedFileType): string => {
  switch (fileType) {
    case 'epub':
      return 'Electronic Publication format, ideal for reflowable text content';
    case 'pdf':
      return 'Portable Document Format, preserves original layout and formatting';
    default:
      return 'Unknown file format';
  }
};
