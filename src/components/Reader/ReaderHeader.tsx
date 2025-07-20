import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Settings, Search, Bookmark, Share2, Eye, EyeOff, Maximize, Heart, Volume2, Keyboard } from 'lucide-react';
import { getInterfaceTheme } from '../../utils/themes';
import { saveBookmark } from '../../utils/storage';
import { getTranslation } from '../../utils/translations';
import type { Book, Chapter, ReadingPreferences, Bookmark as BookmarkType } from '../../types';
import { ShortcutsModal } from './ShortcutsModal'; // Import the new ShortcutsModal

interface ReaderHeaderProps {
  book: Book;
  currentChapter?: Chapter;
  chapterProgress: number;
  totalChapters: number;
  onBackToLibrary: () => void;
  onToggleMenu: () => void;
  onToggleSettings: () => void;
  onToggleSearch: () => void;
  onToggleBookmarks: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  preferences?: ReadingPreferences;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  book,
  currentChapter,
  chapterProgress,
  totalChapters,
  onBackToLibrary,
  onToggleMenu,
  onToggleSettings,
  onToggleSearch,
  onToggleBookmarks,
  onToggleFullscreen,
  isFullscreen,
  preferences
}) => {
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [favoriteLabel, setFavoriteLabel] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false); // New state for shortcuts modal

  const progressPercentage = (chapterProgress / totalChapters) * 100;

  // Get icon visibility settings with defaults
  const iconVisibility = preferences?.iconVisibility || {
    showSearchIcon: true,
    showBookmarkIcon: true, // Default to true
    showFavoriteIcon: true,
    showShareIcon: false, // Default to false
    showFullscreenIcon: false, // Default to false
    showShortcutsIcon: false // Default to false
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Reading "${book.title}" by ${book.author}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFavoriteClick = () => {
    if (preferences?.enableFastFavorite && preferences?.fastFavoriteName) {
      // Fast favorite - save immediately with default name
      handleSaveFavorite(preferences.fastFavoriteName);
    } else {
      // Regular favorite - show input dialog
      setIsAddingFavorite(true);
      setFavoriteLabel('');
    }
  };

  const handleSaveFavorite = async (label: string) => {
    if (!currentChapter || !label.trim()) return;

    const bookmark: BookmarkType = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookId: book.id,
      chapterIndex: chapterProgress - 1,
      position: window.scrollY,
      text: `Chapter: ${currentChapter.title}`,
      label: label.trim(),
      createdAt: new Date()
    };

    try {
      await saveBookmark(bookmark);
      setIsAddingFavorite(false);
      setFavoriteLabel('');
      // Show success feedback
      const button = document.querySelector('[data-favorite-button]') as HTMLElement;
      if (button) {
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 200);
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      alert('Failed to save favorite. Please try again.');
    }
  };

  const handleTextToSpeech = () => {
    if (!currentChapter || !preferences?.enableTextToSpeech) return;

    if (isSpeaking) {
      // Stop speaking
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Start speaking
      const text = currentChapter.content.replace(/<[^>]*>/g, ''); // Strip HTML
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  // Get interface theme styles
  const getInterfaceStyles = () => {
    if (!preferences?.selectedInterfaceTheme) {
      return {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        borderColor: '#e5e7eb'
      };
    }

    const theme = getInterfaceTheme(preferences.selectedInterfaceTheme);
    return {
      backgroundColor: theme.colors.headerBackground,
      color: theme.colors.headerText,
      borderColor: theme.colors.headerBorder
    };
  };

  if (isFullscreen) {
    return null;
  }

  const interfaceStyles = getInterfaceStyles();

  return (
    <> {/* Use a React Fragment to return multiple top-level elements */}
      <header 
        className="shadow-sm border-b translate-y-0" // Removed sticky, top-0, z-40
        style={{
          backgroundColor: interfaceStyles.backgroundColor,
          borderColor: interfaceStyles.borderColor,
          fontFamily: preferences?.applyFontGlobally ? 
            (preferences.fontFamily === 'Inter' ? 'Inter, sans-serif' : 
             preferences.fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, monospace' :
             'Georgia, serif') : undefined // Removed Crimson Text and Source Sans Pro
        }}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToLibrary}
                className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                style={{ color: interfaceStyles.color }}
                aria-label={getTranslation('backToLibrary')}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={onToggleMenu}
                className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                style={{ color: interfaceStyles.color }}
                aria-label={getTranslation('tableOfContents')}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Text-to-Speech Button - Moved to right of Table Of Contents */}
              {preferences?.enableTextToSpeech && (
                <button
                  onClick={handleTextToSpeech}
                  className={`p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors ${
                    isSpeaking ? 'bg-blue-100 bg-opacity-20' : ''
                  }`}
                  style={{ color: isSpeaking ? '#007BFF' : interfaceStyles.color }}
                  aria-label={isSpeaking ? "Stop reading" : "Start reading"}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}

              {/* Shortcuts Icon */}
              {iconVisibility.showShortcutsIcon && (
                <button
                  onClick={() => setShowShortcutsModal(true)}
                  className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                  style={{ color: interfaceStyles.color }}
                  aria-label={getTranslation('shortcuts')}
                >
                  <Keyboard className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Center section - Book info */}
            <div className="flex-1 min-w-0 mx-4">
              <div className="text-center">
                <h1 className="text-lg font-semibold truncate" style={{ color: interfaceStyles.color }}>
                  {currentChapter?.title || book.title}
                </h1>
                <p className="text-sm truncate" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                  {book.author} • {getTranslation('chapter')} {chapterProgress} {getTranslation('of')} {totalChapters}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%`, backgroundColor: '#007BFF' }}
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Search Icon */}
              {iconVisibility.showSearchIcon && (
                <button
                  onClick={onToggleSearch}
                  className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                  style={{ color: interfaceStyles.color }}
                  aria-label={getTranslation('search')}
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Bookmark Icon */}
              {iconVisibility.showBookmarkIcon && (
                <button
                  onClick={onToggleBookmarks}
                  className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                  style={{ color: interfaceStyles.color }}
                  aria-label={getTranslation('bookmarks')}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
              )}

              {/* Favorite Icon */}
              {iconVisibility.showFavoriteIcon && (
                <button
                  onClick={handleFavoriteClick}
                  className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                  style={{ color: interfaceStyles.color }}
                  aria-label={getTranslation('addToFavorites')}
                  data-favorite-button
                >
                  <Heart className="w-5 h-5" />
                </button>
              )}

              {/* Share Icon */}
              {iconVisibility.showShareIcon && (
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                  style={{ color: interfaceStyles.color }}
                  aria-label={getTranslation('share')}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}

              {/* Settings Icon - Always visible */}
              <button
                onClick={onToggleSettings}
                className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                style={{ color: interfaceStyles.color }}
                aria-label={getTranslation('settings')}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Fullscreen Icon */}
              {iconVisibility.showFullscreenIcon && (
                <button
                  onClick={onToggleFullscreen}
                  className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-colors"
                  style={{ color: interfaceStyles.color }}
                  aria-label={getTranslation('fullscreen')}
                >
                  <Maximize className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Favorite Input Modal - Moved outside the header to ensure proper fixed positioning */}
      {isAddingFavorite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in">
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 animate-scale-in"
            style={{
              backgroundColor: interfaceStyles.backgroundColor,
              color: interfaceStyles.color
            }}
          >
            <h3 className="text-lg font-semibold mb-4">{getTranslation('addFavorite')}</h3>
            <input
              type="text"
              placeholder={getTranslation('enterBookmarkName')}
              value={favoriteLabel}
              onChange={(e) => setFavoriteLabel(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              style={{
                backgroundColor: interfaceStyles.backgroundColor,
                color: interfaceStyles.color,
                borderColor: interfaceStyles.borderColor
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && favoriteLabel.trim()) {
                  handleSaveFavorite(favoriteLabel);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => favoriteLabel.trim() && handleSaveFavorite(favoriteLabel)}
                disabled={!favoriteLabel.trim()}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {getTranslation('save')}
              </button>
              <button
                onClick={() => {
                  setIsAddingFavorite(false);
                  setFavoriteLabel('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 hover:bg-opacity-20 transition-all duration-300"
                style={{ 
                  borderColor: interfaceStyles.borderColor,
                  color: interfaceStyles.color
                }}
              >
                {getTranslation('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <ShortcutsModal 
          onClose={() => setShowShortcutsModal(false)} 
          preferences={preferences} 
        />
      )}
    </>
  );
};
