import ePub from 'epubjs';
import { saveCoverImage, logError } from './storage';
import type { Book, Chapter } from '../types';

export class EpubParser {
  private book: any;
  private rendition: any;
  private isDestroyed: boolean = false;
  private searchCache: Map<string, any> = new Map();

  constructor(file: File) {
    try {
      this.book = ePub(file);
    } catch (error) {
      logError('EPUB_PARSER_INIT_FAILED', error, { fileName: file.name, fileSize: file.size });
      throw error;
    }
  }

  async initialize() {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      await this.book.ready;
      return this;
    } catch (error) {
      logError('EPUB_PARSER_READY_FAILED', error);
      throw error;
    }
  }

  async getMetadata(): Promise<{ title: string; author: string; cover?: string }> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      await this.book.ready;
      
      const metadata = this.book.packaging.metadata;
      let cover: string | undefined;

      // Try to get cover image and cache it
      try {
        const coverUrl = await this.book.coverUrl();
        if (coverUrl) {
          // Fetch the cover image and convert to blob for storage
          const response = await fetch(coverUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch cover: ${response.status}`);
          }
          
          const blob = await response.blob();
          
          // Validate blob
          if (blob.size === 0) {
            throw new Error('Cover image is empty');
          }
          
          // Generate a temporary book ID for caching
          const tempId = `temp-${Date.now()}`;
          await saveCoverImage(tempId, blob);
          
          // Create object URL for immediate use
          cover = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.warn('Could not load cover image:', error);
        logError('COVER_LOAD_FAILED', error);
      }

      return {
        title: metadata.title || 'Unknown Title',
        author: metadata.creator || 'Unknown Author',
        cover
      };
    } catch (error) {
      logError('GET_METADATA_FAILED', error);
      throw error;
    }
  }

  async getTableOfContents(): Promise<Chapter[]> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      await this.book.ready;
      
      const navigation = await this.book.loaded.navigation;
      const chapters: Chapter[] = [];

      const processNavItem = (item: any, order: number = 0): number => {
        chapters.push({
          id: item.id || `chapter-${order}`,
          title: item.label || `Chapter ${order + 1}`,
          content: '',
          href: item.href,
          order
        });

        let currentOrder = order + 1;
        if (item.subitems) {
          item.subitems.forEach((subitem: any) => {
            currentOrder = processNavItem(subitem, currentOrder);
          });
        }

        return currentOrder;
      };

      if (navigation.toc && navigation.toc.length > 0) {
        navigation.toc.forEach((item: any, index: number) => {
          processNavItem(item, index);
        });
      } else {
        // Fallback: use spine items if no TOC
        this.book.spine.each((section: any, index: number) => {
          chapters.push({
            id: section.idref || `chapter-${index}`,
            title: section.href || `Chapter ${index + 1}`,
            content: '',
            href: section.href,
            order: index
          });
        });
      }

      return chapters;
    } catch (error) {
      logError('GET_TOC_FAILED', error);
      throw error;
    }
  }

  async getChapterContent(href: string): Promise<string> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      const section = this.book.spine.get(href);
      if (!section) {
        throw new Error(`Chapter not found: ${href}`);
      }

      const doc = await section.load(this.book.load.bind(this.book));
      
      if (!doc) {
        throw new Error(`Failed to load chapter content: ${href}`);
      }
      
      return doc.innerHTML || doc.textContent || '';
    } catch (error) {
      console.error('Error loading chapter content:', error);
      logError('GET_CHAPTER_CONTENT_FAILED', error, { href });
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
      logError('GET_ALL_CHAPTERS_FAILED', error);
      throw error;
    }
  }

  async searchText(query: string): Promise<Array<{ chapterIndex: number; matches: Array<{ text: string; position: number; start: number; end: number }> }>> {
    try {
      if (this.isDestroyed) {
        throw new Error('Parser has been destroyed');
      }
      
      // Check cache first
      const cacheKey = query.toLowerCase();
      if (this.searchCache.has(cacheKey)) {
        return this.searchCache.get(cacheKey);
      }
      
      const chapters = await this.getAllChapters();
      const results: Array<{ chapterIndex: number; matches: Array<{ text: string; position: number; start: number; end: number }> }> = [];
      
      // Use a more efficient search approach for large texts
      const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      chapters.forEach((chapter, index) => {
        try {
          const content = this.stripHtml(chapter.content);
          const matches: Array<{ text: string; position: number; start: number; end: number }> = [];
          
          // Use a more efficient search method
          let match;
          let searchIndex = 0;
          const maxMatches = 100; // Limit matches per chapter for performance
          
          while ((match = searchRegex.exec(content)) !== null && matches.length < maxMatches) {
            const contextStart = Math.max(0, match.index - 50);
            const contextEnd = Math.min(content.length, match.index + match[0].length + 50);
            const context = content.substring(contextStart, contextEnd);

            matches.push({
              text: context,
              position: match.index,
              start: match.index - contextStart,
              end: match.index - contextStart + match[0].length
            });

            // Prevent infinite loop
            if (searchRegex.lastIndex === match.index) {
              searchRegex.lastIndex++;
            }
            
            // Break if we've found too many matches (performance optimization)
            if (matches.length >= maxMatches) {
              break;
            }
          }

          if (matches.length > 0) {
            results.push({ chapterIndex: index, matches });
          }
        } catch (error) {
          console.warn(`Search failed for chapter ${index}:`, error);
        }
      });

      // Cache the results for this query (limit cache size)
      if (this.searchCache.size > 50) {
        // Clear oldest entries
        const firstKey = this.searchCache.keys().next().value;
        this.searchCache.delete(firstKey);
      }
      this.searchCache.set(cacheKey, results);

      return results;
    } catch (error) {
      logError('SEARCH_TEXT_FAILED', error, { query });
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
      
      const coverUrl = await this.book.coverUrl();
      if (coverUrl) {
        const response = await fetch(coverUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch cover: ${response.status}`);
        }
        
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Cover image is empty');
        }
        
        await saveCoverImage(bookId, blob);
      }
    } catch (error) {
      console.warn('Could not cache cover image:', error);
      logError('CACHE_COVER_FAILED', error, { bookId });
    }
  }

  destroy() {
    try {
      this.isDestroyed = true;
      
      // Clear search cache
      this.searchCache.clear();
      
      if (this.book) {
        this.book.destroy();
        this.book = null;
      }
      
      if (this.rendition) {
        this.rendition.destroy();
        this.rendition = null;
      }
    } catch (error) {
      console.warn('Error during parser destruction:', error);
    }
  }
}

export const createBookFromFile = async (file: File): Promise<Omit<Book, 'id'>> => {
  try {
    // Validate file
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty or corrupted');
    }

    if (!file.name.toLowerCase().endsWith('.epub')) {
      throw new Error('Invalid file type: Only EPUB files are supported');
    }

    const parser = new EpubParser(file);
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
      scrollPosition: 0
    };

    parser.destroy();
    return book;
  } catch (error) {
    logError('CREATE_BOOK_FROM_FILE_FAILED', error, { 
      fileName: file?.name, 
      fileSize: file?.size 
    });
    throw error;
  }
};
