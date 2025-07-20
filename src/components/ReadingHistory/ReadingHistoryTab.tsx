import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, TrendingUp, Calendar, Search, BarChart3, Home, AlertTriangle, Globe, Settings } from 'lucide-react';
import { ChapterHistoryView } from './ChapterHistoryView';
import { BookHistoryView } from './BookHistoryView';
import { OverallStatsView } from './OverallStatsView';
import { ReadingTrendsChart } from './ReadingTrendsChart';
import { LanguageSelector } from '../LanguageSelector';
import { HomePageSettings } from '../HomePageSettings';
import { getReadingHistoryStats } from '../../utils/reading-tracker';
import { getPreferences, savePreferences } from '../../utils/storage';
import { formatDuration } from '../../utils/time-formatter';
import { getTranslation, initializeLanguage } from '../../utils/translations';
import { applyInterfaceTheme, getInterfaceTheme } from '../../utils/themes';
import type { ReadingHistoryStats, TimeFormat, SortOption, FilterOption, ReadingPreferences } from '../../types';

interface ReadingHistoryTabProps {
  onClose?: () => void;
  preferences?: ReadingPreferences;
  onPreferencesChange?: (preferences: ReadingPreferences) => void;
}

type ViewMode = 'chapters' | 'books' | 'stats' | 'trends';

export const ReadingHistoryTab: React.FC<ReadingHistoryTabProps> = ({ 
  onClose, 
  preferences: externalPreferences,
  onPreferencesChange: externalOnPreferencesChange 
}) => {
  const [activeView, setActiveView] = useState<ViewMode>('chapters');
  const [stats, setStats] = useState<ReadingHistoryStats | null>(null);
  const [preferences, setPreferences] = useState<ReadingPreferences | null>(null);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('auto');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showHomePageSettings, setShowHomePageSettings] = useState(false);

  // Initialize language on component mount
  useEffect(() => {
    initializeLanguage();
  }, []);

  // Use external preferences if provided, otherwise load from storage
  useEffect(() => {
    if (externalPreferences) {
      setPreferences(externalPreferences);
    } else {
      loadPreferences();
    }
  }, [externalPreferences]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const historyStats = await getReadingHistoryStats();
      setStats(historyStats);
    } catch (error) {
      console.error('Error loading reading history stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const userPrefs = await getPreferences();
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
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
      
      // Propagate changes to parent component if callback is provided
      if (externalOnPreferencesChange) {
        externalOnPreferencesChange(newPreferences);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
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

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-all duration-300"
        style={{ 
          backgroundColor: interfaceStyles.panelSecondaryBackground,
          fontFamily: preferences?.applyFontGlobally ? 
            (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
             preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
             preferences.fontFamily === 'Crimson Text' ? 'Crimson Text, serif' :
             preferences.fontFamily === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
             'Georgia, serif') : undefined
        }}
      >
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p style={{ color: interfaceStyles.color }}>{getTranslation('loadingReadingHistory')}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{ 
        backgroundColor: interfaceStyles.panelSecondaryBackground,
        fontFamily: preferences?.applyFontGlobally ? 
          (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
           preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
           preferences.fontFamily === 'Crimson Text' ? 'Crimson Text, serif' :
           preferences.fontFamily === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
           'Georgia, serif') : undefined
      }}
    >
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
            <div className="flex items-center gap-4">
              {/* Home Button */}
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-105"
                style={{ color: interfaceStyles.color }}
                aria-label={getTranslation('backToHome')}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">{getTranslation('home')}</span>
              </button>

              <div className="h-6 w-px" style={{ backgroundColor: interfaceStyles.borderColor }}></div>

              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: interfaceStyles.color }}>
                  <Clock className="w-8 h-8 text-blue-600" />
                  {getTranslation('readingHistory')}
                </h1>
                {stats && (
                  <p className="mt-1" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    {formatDuration(stats.totalReadingTime)} {getTranslation('totalTime')} • {stats.totalChaptersCompleted} {getTranslation('chaptersCompleted')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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
                    <div 
                      className="bg-white rounded-lg shadow-xl border-2 border-gray-300 py-2 min-w-48 animate-fade-in"
                      style={{
                        backgroundColor: interfaceStyles.panelBackground,
                        borderColor: interfaceStyles.borderColor,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Time Format Toggle */}
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value as TimeFormat)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-300"
                style={{
                  backgroundColor: interfaceStyles.panelBackground,
                  borderColor: interfaceStyles.borderColor,
                  color: interfaceStyles.color
                }}
              >
                <option value="auto">{getTranslation('autoFormat')}</option>
                <option value="minutes">{getTranslation('minutes')}</option>
                <option value="hours">{getTranslation('hours')}</option>
                <option value="detailed">{getTranslation('detailed')}</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 border-b" style={{ borderColor: interfaceStyles.borderColor }}>
            <nav className="flex space-x-8">
              {[
                { id: 'chapters', label: getTranslation('chapterHistory'), icon: BookOpen },
                { id: 'books', label: getTranslation('bookHistory'), icon: Clock },
                { id: 'stats', label: getTranslation('statistics'), icon: TrendingUp },
                { id: 'trends', label: getTranslation('trends'), icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as ViewMode)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 rounded-t-lg ${
                      activeView === tab.id
                        ? 'border-blue-500 text-blue-600 transform scale-105'
                        : 'border-transparent hover:border-gray-300 hover:bg-gray-100 hover:bg-opacity-20'
                    }`}
                    style={{
                      color: activeView === tab.id ? '#007BFF' : interfaceStyles.color,
                      opacity: activeView === tab.id ? 1 : 0.7,
                      backgroundColor: activeView === tab.id ? `${interfaceStyles.panelBackground}20` : 'transparent'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filters */}
          {(activeView === 'chapters' || activeView === 'books') && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getTranslation('searchBooksOrChapters')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  style={{
                    backgroundColor: interfaceStyles.panelBackground,
                    borderColor: interfaceStyles.borderColor,
                    color: interfaceStyles.color
                  }}
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                style={{
                  backgroundColor: interfaceStyles.panelBackground,
                  borderColor: interfaceStyles.borderColor,
                  color: interfaceStyles.color
                }}
              >
                <option value="date">{getTranslation('sortByDate')}</option>
                <option value="duration">{getTranslation('sortByDuration')}</option>
                <option value="book">{getTranslation('sortByBook')}</option>
                <option value="chapter">{getTranslation('sortByChapter')}</option>
              </select>

              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                style={{
                  backgroundColor: interfaceStyles.panelBackground,
                  borderColor: interfaceStyles.borderColor,
                  color: interfaceStyles.color
                }}
              >
                <option value="all">{getTranslation('allTime')}</option>
                <option value="today">{getTranslation('today')}</option>
                <option value="week">{getTranslation('thisWeek')}</option>
                <option value="month">{getTranslation('thisMonth')}</option>
                <option value="completed">{getTranslation('completedOnly')}</option>
                <option value="in-progress">{getTranslation('inProgress')}</option>
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Feature Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div 
          className="border-l-2 p-2 text-sm"
          style={{ backgroundColor: '#fffbe6', borderColor: '#facc15' }}
        >
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" style={{ color: '#854d0e' }} />
            <div>
              <p style={{ color: '#854d0e' }}>
                <span className="font-medium">{getTranslation('featureNote')}:</span>{' '}
                {getTranslation('featureAccuracyNote')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'chapters' && (
          <ChapterHistoryView
            timeFormat={timeFormat}
            sortBy={sortBy}
            filterBy={filterBy}
            searchQuery={searchQuery}
            preferences={preferences}
          />
        )}
        
        {activeView === 'books' && (
          <BookHistoryView
            timeFormat={timeFormat}
            sortBy={sortBy}
            filterBy={filterBy}
            searchQuery={searchQuery}
            preferences={preferences}
          />
        )}
        
        {activeView === 'stats' && stats && (
          <OverallStatsView 
            stats={stats} 
            timeFormat={timeFormat} 
            preferences={preferences}
          />
        )}
        
        {activeView === 'trends' && (
          <ReadingTrendsChart 
            timeFormat={timeFormat} 
            preferences={preferences}
          />
        )}
      </main>

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
