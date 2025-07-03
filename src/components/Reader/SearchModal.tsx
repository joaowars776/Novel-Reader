import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import type { SearchResult, ReadingPreferences } from '../../types';

interface SearchModalProps {
  onSearch: (query: string) => void;
  searchResults: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
  preferences?: ReadingPreferences;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  onSearch,
  searchResults,
  onResultClick,
  onClose,
  preferences
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      onSearch('');
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      onSearch(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
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
              placeholder="Search in book..."
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

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query.trim() ? (
            <div className="p-8 text-center" style={{ color: interfaceStyles.color }}>
              <Search className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <p>Enter a search term to find text in your book</p>
              <div className="mt-4 text-sm">
                <p className="mb-1">Tips:</p>
                <ul className="text-left inline-block space-y-1" style={{ opacity: 0.7 }}>
                  <li>• Search is case-insensitive</li>
                  <li>• Use specific words for better results</li>
                  <li>• Click on results to jump to that location</li>
                </ul>
              </div>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" style={{ borderColor: '#007BFF' }}></div>
              <p style={{ color: interfaceStyles.color }}>Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center" style={{ color: interfaceStyles.color }}>
              <Search className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p style={{ opacity: 0.7 }}>Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: interfaceStyles.borderColor }}>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => onResultClick(result)}
                  className="w-full text-left p-4 hover:bg-gray-50 hover:bg-opacity-20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium" style={{ color: '#007BFF' }}>
                          {result.chapterTitle}
                        </span>
                      </div>
                      <p className="leading-relaxed" style={{ color: interfaceStyles.color }}>
                        {highlightMatch(result.text, result.matchStart, result.matchEnd)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: interfaceStyles.color, opacity: 0.4 }} />
                  </div>
                </button>
              ))}
            </div>
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
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{query}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};