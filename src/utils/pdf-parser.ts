import * as pdfjsLib from 'pdfjs-dist';
import { saveCoverImage, logError } from './storage';
import type { Book, Chapter } from '../types';

// Configure PDF.js worker for Vite
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export class PdfParser {
  private pdf: any;
  private isDestroyed: boolean = false;
  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  async initialize() {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const arrayBuffer = await this.file.arrayBuffer();
      this.pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return this;
    } catch (error) {
      logError('PDF_PARSER_READY_FAILED', error);
      throw error;
    }
  }

  async getMetadata(): Promise<{ title: string; author: string; cover?: string }> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const metadata = await this.pdf.getMetadata();
      let cover: string | undefined;

      // Try to generate cover from first page
      try {
        const page = await this.pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/jpeg', 0.8);
          });

          if (blob && blob.size > 0) {
            // Generate a temporary book ID for caching
            const tempId = `temp-${Date.now()}`;
            await saveCoverImage(tempId, blob);
            
            // Create object URL for immediate use
            cover = URL.createObjectURL(blob);
          }
        }
      } catch (error) {
        console.warn('Could not generate cover from first page:', error);
        logError('PDF_COVER_GENERATION_FAILED', error);
      }

      return {
        title: metadata.info?.Title || this.file.name.replace('.pdf', '') || 'Unknown Title',
        author: metadata.info?.Author || 'Unknown Author',
        cover
      };
    } catch (error) {
      logError('GET_PDF_METADATA_FAILED', error);
      throw error;
    }
  }

  async getTableOfContents(): Promise<Chapter[]> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const chapters: Chapter[] = [];
      const numPages = this.pdf.numPages;

      // Try to get outline (bookmarks) from PDF
      try {
        const outline = await this.pdf.getOutline();
        if (outline && outline.length > 0) {
          let order = 0;
          
          const processOutlineItem = async (item: any, level: number = 0): Promise<void> => {
            const pageRef = item.dest;
            let pageNumber = 1;
            
            if (pageRef) {
              try {
                const pageIndex = await this.pdf.getPageIndex(pageRef[0]);
                pageNumber = pageIndex + 1;
              } catch (error) {
                console.warn('Could not resolve page reference:', error);
              }
            }

            chapters.push({
              id: `chapter-${order}`,
              title: item.title || `Chapter ${order + 1}`,
              content: '',
              href: `page-${pageNumber}`,
              order: order++
            });

            if (item.items && item.items.length > 0) {
              for (const subItem of item.items) {
                await processOutlineItem(subItem, level + 1);
              }
            }
          };

          for (const item of outline) {
            await processOutlineItem(item);
          }
        }
      } catch (error) {
        console.warn('Could not load PDF outline:', error);
      }

      // Fallback: create chapters based on page ranges if no outline
      if (chapters.length === 0) {
        const pagesPerChapter = Math.max(1, Math.floor(numPages / 20)); // Max 20 chapters
        
        for (let i = 0; i < numPages; i += pagesPerChapter) {
          const startPage = i + 1;
          const endPage = Math.min(i + pagesPerChapter, numPages);
          
          chapters.push({
            id: `chapter-${chapters.length}`,
            title: endPage === startPage ? `Page ${startPage}` : `Pages ${startPage}-${endPage}`,
            content: '',
            href: `page-${startPage}`,
            order: chapters.length
          });
        }
      }

      return chapters;
    } catch (error) {
      logError('GET_PDF_TOC_FAILED', error);
      throw error;
    }
  }

  async getPageContent(pageNumber: number): Promise<string> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const page = await this.pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      
      let text = '';
      textContent.items.forEach((item: any) => {
        if (item.str) {
          text += item.str + ' ';
        }
      });

      // Basic formatting - add line breaks for better readability
      text = text.replace(/\s+/g, ' ').trim();
      
      // Try to detect paragraphs and add proper formatting
      const sentences = text.split(/[.!?]+/);
      const formattedText = sentences
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
        .map(sentence => `<p>${sentence}.</p>`)
        .join('\n');

      return formattedText || `<p>Page ${pageNumber}</p>`;
    } catch (error) {
      console.error('Error loading page content:', error);
      logError('GET_PDF_PAGE_CONTENT_FAILED', error, { pageNumber });
      return `<p>Error loading page ${pageNumber} content.</p>`;
    }
  }

  async getChapterContent(href: string): Promise<string> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const pageMatch = href.match(/page-(\d+)/);
      if (!pageMatch) {
        throw new Error(`Invalid page reference: ${href}`);
      }

      const pageNumber = parseInt(pageMatch[1], 10);
      return await this.getPageContent(pageNumber);
    } catch (error) {
      console.error('Error loading chapter content:', error);
      logError('GET_PDF_CHAPTER_CONTENT_FAILED', error, { href });
      return '<p>Error loading chapter content.</p>';
    }
  }

  async getAllChapters(): Promise<Chapter[]> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const toc = await this.getTableOfContents();
      
      const chaptersWithContent = await Promise.all(
        toc.map(async (chapter) => {
          try {
            const content = await this.getChapterContent(chapter.href);
            return { ...chapter, content };
          } catch (error) {
            console.warn(`Failed to load content for chapter: ${chapter.title}`, error);
            return { ...chapter, content: '<p>Failed to load chapter content.</p>' };
          }
        })
      );

      return chaptersWithContent;
    } catch (error) {
      logError('GET_ALL_PDF_CHAPTERS_FAILED', error);
      throw error;
    }
  }

  async searchText(query: string): Promise<Array<{ chapterIndex: number; matches: Array<{ text: string; position: number; start: number; end: number }> }>> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const chapters = await this.getAllChapters();
      const results: Array<{ chapterIndex: number; matches: Array<{ text: string; position: number; start: number; end: number }> }> = [];

      chapters.forEach((chapter, index) => {
        try {
          const content = this.stripHtml(chapter.content);
          const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const matches: Array<{ text: string; position: number; start: number; end: number }> = [];
          let match;

          while ((match = regex.exec(content)) !== null) {
            const start = Math.max(0, match.index - 50);
            const end = Math.min(content.length, match.index + match[0].length + 50);
            const context = content.substring(start, end);

            matches.push({
              text: context,
              position: match.index,
              start: match.index - start,
              end: match.index - start + match[0].length
            });

            // Prevent infinite loop
            if (regex.lastIndex === match.index) {
              regex.lastIndex++;
            }
          }

          if (matches.length > 0) {
            results.push({ chapterIndex: index, matches });
          }
        } catch (error) {
          console.warn(`Search failed for chapter ${index}:`, error);
        }
      });

      return results;
    } catch (error) {
      logError('PDF_SEARCH_TEXT_FAILED', error, { query });
      throw error;
    }
  }

  private stripHtml(html: string): string {
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    } catch (error) {
      console.warn('Failed to strip HTML:', error);
      return html;
    }
  }

  async cacheCoverImage(bookId: string): Promise<void> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      // Generate cover from first page
      const page = await this.pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', 0.9);
        });

        if (blob && blob.size > 0) {
          await saveCoverImage(bookId, blob);
        }
      }
    } catch (error) {
      console.warn('Could not cache PDF cover image:', error);
      logError('CACHE_PDF_COVER_FAILED', error, { bookId });
    }
  }

  destroy() {
    try {
      this.isDestroyed = true;
      
      if (this.pdf) {
        this.pdf.destroy();
        this.pdf = null;
      }
    } catch (error) {
      console.warn('Error during PDF parser destruction:', error);
    }
  }
}

export const createBookFromPdfFile = async (file: File): Promise<Omit<Book, 'id'>> => {
  try {
    // Validate file
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty or corrupted');
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type: Only PDF files are supported');
    }

    const parser = new PdfParser(file);
    await parser.initialize();
    
    const metadata = await parser.getMetadata();
    
    const book: Omit<Book, 'id'> = {
      title: metadata.title,
      author: metadata.author,
      cover: metadata.cover,
      file,
      addedAt: new Date(),
      progress: 0,
      currentChapter: 0,
      scrollPosition: 0,
      fileType: 'pdf' // Add file type identifier
    };

    parser.destroy();
    return book;
  } catch (error) {
    logError('CREATE_BOOK_FROM_PDF_FILE_FAILED', error, { 
      fileName: file?.name, 
      fileSize: file?.size 
    });
    throw error;
  }
};