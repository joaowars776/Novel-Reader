import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight, BookOpen, FileText } from 'lucide-react';
import type { SearchResult, ReadingPreferences } from '../../types';

interface SearchModalProps {
  onSearch: (query: string, searchScope: 'chapter' | 'book') => void;
  searchResults: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
  preferences?: ReadingPreferences;
  currentChapterTitle?: string;
}

const RESULTS_PER_PAGE = 50;
const MAX_VISIBLE_RESULTS = 1000; // Limit visible results for performance

export const SearchModal: React.FC<SearchModalProps> = ({
  onSearch,
  searchResults,
  onResultClick,
  onClose,
  preferences,
  currentChapterTitle = 'Current Chapter'
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchScope, setSearchScope] = useState<'chapter' | 'book'>('chapter');
  const [visibleResults, setVisibleResults] = useState(RESULTS_PER_PAGE);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset visible results when search results change
  useEffect(() => {
    setVisibleResults(RESULTS_PER_PAGE);
  }, [searchResults]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Infinite scroll for large result sets
  useEffect(() => {
    const container = resultsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom && visibleResults < Math.min(searchResults.length, MAX_VISIBLE_RESULTS)) {
        setVisibleResults(prev => Math.min(prev + RESULTS_PER_PAGE, MAX_VISIBLE_RESULTS));
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [visibleResults, searchResults.length]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      onSearch('', searchScope);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      onSearch(query, searchScope);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchScope, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, searchScope);
    }
  };

  const handleScopeChange = (newScope: 'chapter' | 'book') => {
    setSearchScope(newScope);
    setVisibleResults(RESULTS_PER_PAGE); // Reset pagination
    
    // Trigger search immediately if there's a query
    if (query.trim()) {
      setIsSearching(true);
      onSearch(query, newScope);
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  const highlightMatch = (text: string, start: number, end: number) => {
    return (
      <>
        {text.slice(0, start)}
        <mark className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {text.slice(start, end)}
        </mark>
        {text.slice(end)}
      </>
    );
  };

  // Memoize visible results for performance
  const displayedResults = useMemo(() => {
    return searchResults.slice(0, visibleResults);
  }, [searchResults, visibleResults]);

  // Get interface theme styles
  const getInterfaceStyles = () => {
    if (!preferences?.interfaceColors) {
      return {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        borderColor: '#e5e7eb'
      };
    }

    return {
      backgroundColor: preferences.interfaceColors.panelBackground || '#ffffff',
      color: preferences.interfaceColors.panelText || '#1f2937',
      borderColor: preferences.interfaceColors.borderColor || '#e5e7eb'
    };
  };

  const interfaceStyles = getInterfaceStyles();

  const getScopeResultsText = () => {
    if (searchScope === 'chapter') {
      return `in current chapter`;
    }
    return `in entire book`;
  };

  const getResultsCountText = () => {
    const total = searchResults.length;
    const showing = Math.min(visibleResults, total);
    
    if (total === 0) return '';
    if (total <= MAX_VISIBLE_RESULTS) {
      return `Found ${total} ${total === 1 ? 'result' : 'results'}`;
    }
    
    return `Found ${total}+ results (showing first ${showing})`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 animate-fade-in">
      <div 
        ref={modalRef} 
        className="rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden animate-scale-in"
        style={{
          backgroundColor: interfaceStyles.backgroundColor,
          fontFamily: preferences?.applyFontGlobally ? 
            (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
             preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
             preferences.fontFamily === 'Crimson Text' ? 'Crimson Text, serif' :
             preferences.fontFamily === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
             'Georgia, serif') : undefined
        }}
      >
        {/* Search Header */}
        <div 
          className="flex items-center gap-4 p-4 border-b"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          <Search className="w-5 h-5" style={{ color: interfaceStyles.color, opacity: 0.6 }} />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${searchScope === 'chapter' ? 'in current chapter' : 'in entire book'}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-lg border-none outline-none placeholder-gray-400 transition-all duration-300 bg-transparent"
              style={{ color: interfaceStyles.color }}
            />
          </form>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
            style={{ color: interfaceStyles.color }}
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Scope Toggle */}
        <div 
          className="p-4 border-b"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: interfaceStyles.color }}>
              Search in:
            </span>
            
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: interfaceStyles.borderColor }}>
              <button
                onClick={() => handleScopeChange('chapter')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  searchScope === 'chapter' 
                    ? 'transform scale-105' 
                    : 'hover:bg-gray-100 hover:bg-opacity-20'
                }`}
                style={{
                  backgroundColor: searchScope === 'chapter' ? '#007BFF' : 'transparent',
                  color: searchScope === 'chapter' ? '#ffffff' : interfaceStyles.color
                }}
              >
                <FileText className="w-4 h-4" />
                Current Chapter
              </button>
              
              <button
                onClick={() => handleScopeChange('book')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  searchScope === 'book' 
                    ? 'transform scale-105' 
                    : 'hover:bg-gray-100 hover:bg-opacity-20'
                }`}
                style={{
                  backgroundColor: searchScope === 'book' ? '#007BFF' : 'transparent',
                  color: searchScope === 'book' ? '#ffffff' : interfaceStyles.color
                }}
              >
                <BookOpen className="w-4 h-4" />
                Entire Book
              </button>
            </div>
          </div>

          {/* Current Chapter Info */}
          {searchScope === 'chapter' && (
            <div className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
              Currently searching in: <span className="font-medium">{currentChapterTitle}</span>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div 
          ref={resultsContainerRef}
          className="max-h-96 overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          {!query.trim() ? (
            <div className="p-8 text-center" style={{ color: interfaceStyles.color }}>
              <Search className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <p className="mb-2">Enter a search term to find text in your {searchScope === 'chapter' ? 'current chapter' : 'book'}</p>
              <div className="mt-4 text-sm">
                <p className="mb-1">Tips:</p>
                <ul className="text-left inline-block space-y-1" style={{ opacity: 0.7 }}>
                  <li>• Search is case-insensitive</li>
                  <li>• Use specific words for better results</li>
                  <li>• Click on results to jump to that location</li>
                  <li>• Switch between chapter and book search above</li>
                </ul>
              </div>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" style={{ borderColor: '#007BFF' }}></div>
              <p style={{ color: interfaceStyles.color }}>Searching {getScopeResultsText()}...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center" style={{ color: interfaceStyles.color }}>
              <Search className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p style={{ opacity: 0.7 }}>
                No matches for "{query}" {getScopeResultsText()}
              </p>
              <div className="mt-4 text-sm" style={{ opacity: 0.6 }}>
                <p>Try:</p>
                <ul className="text-left inline-block space-y-1 mt-2">
                  <li>• Different keywords or check your spelling</li>
                  <li>• Searching in the {searchScope === 'chapter' ? 'entire book' : 'current chapter'} instead</li>
                  <li>• Using broader or more specific terms</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y" style={{ borderColor: interfaceStyles.borderColor }}>
                {displayedResults.map((result, index) => (
                  <button
                    key={`${result.chapterIndex}-${result.position}-${index}`}
                    onClick={() => onResultClick(result)}
                    className="w-full text-left p-4 hover:bg-gray-50 hover:bg-opacity-20 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium" style={{ color: '#007BFF' }}>
                            {result.chapterTitle}
                          </span>
                          {searchScope === 'book' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              Chapter {result.chapterIndex + 1}
                            </span>
                          )}
                        </div>
                        <p className="leading-relaxed text-sm" style={{ color: interfaceStyles.color }}>
                          {highlightMatch(result.text, result.matchStart, result.matchEnd)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: interfaceStyles.color, opacity: 0.4 }} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Load More Indicator */}
              {visibleResults < Math.min(searchResults.length, MAX_VISIBLE_RESULTS) && (
                <div className="p-4 text-center border-t" style={{ borderColor: interfaceStyles.borderColor }}>
                  <div className="text-sm" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                    Scroll down to load more results...
                  </div>
                </div>
              )}

              {/* Performance Warning for Large Result Sets */}
              {searchResults.length > MAX_VISIBLE_RESULTS && (
                <div className="p-4 text-center border-t bg-yellow-50" style={{ borderColor: interfaceStyles.borderColor }}>
                  <div className="text-sm text-yellow-800">
                    <strong>Large result set detected:</strong> Showing first {MAX_VISIBLE_RESULTS} results for optimal performance.
                    <br />
                    Try using more specific search terms to narrow down results.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Search Footer */}
        {searchResults.length > 0 && (
          <div 
            className="p-4 border-t"
            style={{ 
              borderColor: interfaceStyles.borderColor,
              backgroundColor: interfaceStyles.backgroundColor,
              opacity: 0.8
            }}
          >
            <p className="text-sm text-center" style={{ color: interfaceStyles.color }}>
              {getResultsCountText()} for "{query}" {getScopeResultsText()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};