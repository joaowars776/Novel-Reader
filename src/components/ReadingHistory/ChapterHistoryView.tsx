import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, CheckCircle, Circle, Globe, Loader } from 'lucide-react';
import { getChapterHistory } from '../../utils/reading-tracker';
import { formatDuration, formatRelativeTime } from '../../utils/time-formatter';
import { getTranslation } from '../../utils/translations';
import type { ChapterHistory, TimeFormat, SortOption, FilterOption, ReadingPreferences } from '../../types';

interface ChapterHistoryViewProps {
  timeFormat: TimeFormat;
  sortBy: SortOption;
  filterBy: FilterOption;
  searchQuery: string;
  preferences?: ReadingPreferences;
}

// Simple translation service simulation
const translateText = async (text: string, targetLang: string): Promise<string> => {
  // This is a placeholder for actual translation service
  // In a real implementation, you would use Google Translate API, DeepL, etc.
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock translation - in reality this would call a translation API
      resolve(`[${targetLang.toUpperCase()}] ${text}`);
    }, 1000);
  });
};

interface TranslationState {
  [key: string]: {
    isTranslating: boolean;
    translatedText?: string;
    originalText: string;
    targetLanguage?: string;
  };
}

export const ChapterHistoryView: React.FC<ChapterHistoryViewProps> = ({
  timeFormat,
  sortBy,
  filterBy,
  searchQuery,
  preferences
}) => {
  const [chapters, setChapters] = useState<ChapterHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState<TranslationState>({});

  useEffect(() => {
    loadChapterHistory();
  }, []);

  const loadChapterHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getChapterHistory();
      setChapters(history);
    } catch (error) {
      console.error('Error loading chapter history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get interface theme styles
  const getInterfaceStyles = () => {
    if (!preferences?.interfaceColors) {
      return {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        borderColor: '#e5e7eb',
        panelBackground: '#ffffff',
        panelSecondaryBackground: '#f9fafb'
      };
    }

    return {
      backgroundColor: preferences.interfaceColors.headerBackground || '#ffffff',
      color: preferences.interfaceColors.headerText || '#1f2937',
      borderColor: preferences.interfaceColors.headerBorder || '#e5e7eb',
      panelBackground: preferences.interfaceColors.panelBackground || '#ffffff',
      panelSecondaryBackground: preferences.interfaceColors.panelSecondaryBackground || '#f9fafb'
    };
  };

  const interfaceStyles = getInterfaceStyles();

  const handleTranslate = async (itemId: string, text: string, targetLang: string = 'en') => {
    setTranslations(prev => ({
      ...prev,
      [itemId]: {
        isTranslating: true,
        originalText: text,
        targetLanguage: targetLang
      }
    }));

    try {
      const translatedText = await translateText(text, targetLang);
      setTranslations(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isTranslating: false,
          translatedText
        }
      }));
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslations(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isTranslating: false
        }
      }));
    }
  };

  const toggleTranslation = (itemId: string) => {
    const translation = translations[itemId];
    if (translation?.translatedText) {
      // Remove translation to show original
      setTranslations(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  const getDisplayText = (itemId: string, originalText: string) => {
    const translation = translations[itemId];
    if (translation?.translatedText) {
      return translation.translatedText;
    }
    return originalText;
  };

  const formatReadTimes = (timesRead: number) => {
    const translation = getTranslation('readXTimes');
    const plural = timesRead !== 1 ? 's' : '';
    return translation
      .replace('{count}', timesRead.toString())
      .replace('{plural}', plural);
  };

  const filteredAndSortedChapters = React.useMemo(() => {
    let filtered = chapters;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chapter =>
        chapter.bookTitle.toLowerCase().includes(query) ||
        chapter.bookAuthor.toLowerCase().includes(query) ||
        chapter.chapterTitle.toLowerCase().includes(query)
      );
    }

    // Apply time-based filters
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filterBy) {
      case 'today':
        filtered = filtered.filter(chapter => chapter.lastRead >= today);
        break;
      case 'week':
        filtered = filtered.filter(chapter => chapter.lastRead >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(chapter => chapter.lastRead >= monthAgo);
        break;
      case 'completed':
        filtered = filtered.filter(chapter => chapter.completed);
        break;
      case 'in-progress':
        filtered = filtered.filter(chapter => !chapter.completed);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => b.lastRead.getTime() - a.lastRead.getTime());
        break;
      case 'duration':
        filtered.sort((a, b) => b.totalTime - a.totalTime);
        break;
      case 'book':
        filtered.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
        break;
      case 'chapter':
        filtered.sort((a, b) => a.chapterIndex - b.chapterIndex);
        break;
    }

    return filtered;
  }, [chapters, searchQuery, filterBy, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p style={{ color: interfaceStyles.color }}>{getTranslation('loadingReadingHistory')}</p>
        </div>
      </div>
    );
  }

  if (filteredAndSortedChapters.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2" style={{ color: interfaceStyles.color }}>
          {getTranslation('noBooksFound')}
        </h3>
        <p style={{ color: interfaceStyles.color, opacity: 0.7 }}>
          {searchQuery.trim() || filterBy !== 'all'
            ? getTranslation('tryAdjustingSearch')
            : 'Start reading to see your chapter history here'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div 
          className="rounded-lg p-6 shadow-sm border"
          style={{
            backgroundColor: interfaceStyles.panelBackground,
            borderColor: interfaceStyles.borderColor
          }}
        >
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                {getTranslation('chaptersTotal')}
              </p>
              <p className="text-2xl font-bold" style={{ color: interfaceStyles.color }}>
                {filteredAndSortedChapters.length}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="rounded-lg p-6 shadow-sm border"
          style={{
            backgroundColor: interfaceStyles.panelBackground,
            borderColor: interfaceStyles.borderColor
          }}
        >
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                {getTranslation('complete')}
              </p>
              <p className="text-2xl font-bold" style={{ color: interfaceStyles.color }}>
                {filteredAndSortedChapters.filter(c => c.completed).length}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="rounded-lg p-6 shadow-sm border"
          style={{
            backgroundColor: interfaceStyles.panelBackground,
            borderColor: interfaceStyles.borderColor
          }}
        >
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                {getTranslation('totalTime')}
              </p>
              <p className="text-2xl font-bold" style={{ color: interfaceStyles.color }}>
                {formatDuration(
                  filteredAndSortedChapters.reduce((sum, c) => sum + c.totalTime, 0),
                  'auto'
                )}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="rounded-lg p-6 shadow-sm border"
          style={{
            backgroundColor: interfaceStyles.panelBackground,
            borderColor: interfaceStyles.borderColor
          }}
        >
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                {getTranslation('avgPerChapter')}
              </p>
              <p className="text-2xl font-bold" style={{ color: interfaceStyles.color }}>
                {formatDuration(
                  filteredAndSortedChapters.reduce((sum, c) => sum + c.totalTime, 0) / filteredAndSortedChapters.length,
                  'auto'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div 
        className="rounded-lg shadow-sm border overflow-hidden"
        style={{
          backgroundColor: interfaceStyles.panelBackground,
          borderColor: interfaceStyles.borderColor
        }}
      >
        <div className="divide-y" style={{ borderColor: interfaceStyles.borderColor }}>
          {filteredAndSortedChapters.map((chapter) => {
            const itemId = `${chapter.bookId}-${chapter.chapterIndex}`;
            const translation = translations[itemId];
            
            return (
              <div key={itemId} className="p-6 hover:bg-gray-50 hover:bg-opacity-20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {chapter.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <h3 className="text-lg font-semibold truncate" style={{ color: interfaceStyles.color }}>
                        {getDisplayText(`${itemId}-title`, chapter.chapterTitle)}
                      </h3>
                      
                      {/* Translation Button for Title */}
                      <button
                        onClick={() => {
                          if (translation?.translatedText) {
                            toggleTranslation(`${itemId}-title`);
                          } else {
                            handleTranslate(`${itemId}-title`, chapter.chapterTitle);
                          }
                        }}
                        disabled={translation?.isTranslating}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title={translation?.translatedText ? getTranslation('originalText') : getTranslation('translate')}
                      >
                        {translation?.isTranslating ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <p style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                        <span className="font-medium">{getDisplayText(`${itemId}-book`, chapter.bookTitle)}</span> by {getDisplayText(`${itemId}-author`, chapter.bookAuthor)}
                      </p>
                      
                      {/* Translation Button for Book Info */}
                      <button
                        onClick={() => {
                          const bookInfo = `${chapter.bookTitle} by ${chapter.bookAuthor}`;
                          const bookTranslation = translations[`${itemId}-book`];
                          if (bookTranslation?.translatedText) {
                            toggleTranslation(`${itemId}-book`);
                          } else {
                            handleTranslate(`${itemId}-book`, bookInfo);
                          }
                        }}
                        disabled={translations[`${itemId}-book`]?.isTranslating}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title={translations[`${itemId}-book`]?.translatedText ? getTranslation('originalText') : getTranslation('translate')}
                      >
                        {translations[`${itemId}-book`]?.isTranslating ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(chapter.totalTime, timeFormat)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{getTranslation('lastRead')} {formatRelativeTime(chapter.lastRead)}</span>
                      </div>
                      
                      <span>{formatReadTimes(chapter.timesRead)}</span>
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold" style={{ color: interfaceStyles.color }}>
                      {getTranslation('chapter')} {chapter.chapterIndex + 1}
                    </div>
                    <div className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                      {chapter.firstRead.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Translation Status */}
                {translation?.isTranslating && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    {getTranslation('translating')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};