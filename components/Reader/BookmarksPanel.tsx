import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Plus, X, Trash2, Edit2, Settings, Type, BookOpen, Check, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { getBookmarks, saveBookmark, deleteBookmark, saveBookmarkState } from '../../utils/storage';
import { getTranslation } from '../../utils/translations';
import type { Bookmark as BookmarkType, Chapter, ReadingPreferences } from '../../types';

interface BookmarksPanelProps {
  bookId: string;
  chapters: Chapter[];
  currentChapterIndex: number;
  onBookmarkClick: (chapterIndex: number, bookmark?: BookmarkType) => void;
  onClose: () => void;
  preferences?: ReadingPreferences;
  onPreferencesChange?: (prefs: ReadingPreferences) => void;
  highlightBookmarkId?: string | null;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  bookId,
  chapters,
  currentChapterIndex,
  onBookmarkClick,
  onClose,
  preferences,
  onPreferencesChange,
  highlightBookmarkId
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [showSettings, setShowSettings] = useState(preferences?.bookmarksSettingsExpanded ?? true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const bookmarkRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle highlight bookmark
  useEffect(() => {
    if (highlightBookmarkId) {
      setHighlightedId(highlightBookmarkId);
      
      // Scroll to the bookmark after a short delay to ensure list is rendered
      setTimeout(() => {
        const element = bookmarkRefs.current[highlightBookmarkId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightBookmarkId]);

  // Sync showSettings with preferences if it changes externally
  useEffect(() => {
    if (preferences?.bookmarksSettingsExpanded !== undefined) {
      setShowSettings(preferences.bookmarksSettingsExpanded);
    }
  }, [preferences?.bookmarksSettingsExpanded]);

  const handleToggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !showSettings;
    setShowSettings(newState);
    if (onPreferencesChange && preferences) {
      onPreferencesChange({
        ...preferences,
        bookmarksSettingsExpanded: newState
      });
    }
  };
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Memoize interface styles to prevent recalculation
  const interfaceStyles = useMemo(() => {
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
  }, [preferences?.interfaceColors]);

  // Memoize format date function
  const formatDate = useCallback((date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return getTranslation('justNow');
    if (diffInHours < 24) return `${Math.round(diffInHours)}${getTranslation('hoursAgo')}`;
    if (diffInHours < 168) return `${Math.round(diffInHours / 24)}${getTranslation('daysAgo')}`;
    return date.toLocaleDateString();
  }, []);
  // Load bookmarks and state
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const userBookmarks = await getBookmarks(bookId);
        setBookmarks(userBookmarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    loadBookmarks();
  }, [bookId]);

  // Auto-save bookmark state
  useEffect(() => {
    const saveState = async () => {
      await saveBookmarkState(bookId, true);
    };
    saveState();

    return () => {
      saveBookmarkState(bookId, false);
    };
  }, [bookId]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the panel or if a delete modal is open
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && !bookmarkToDelete) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, bookmarkToDelete]);

  const handleAddBookmark = async () => {
    if (!bookmarkLabel.trim()) return;

    const currentChapter = chapters[currentChapterIndex];
    if (!currentChapter) return;

    const bookmark: BookmarkType = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      chapterIndex: currentChapterIndex,
      position: window.scrollY,
      text: `Chapter: ${currentChapter.title}`,
      label: bookmarkLabel.trim(),
      createdAt: new Date(),
      type: 'chapter'
    };

    try {
      await saveBookmark(bookmark);
      setBookmarks(prev => [bookmark, ...prev]);
      setBookmarkLabel('');
      setIsAddingBookmark(false);
      
      // Dispatch custom event to notify TOC of bookmark change
      window.dispatchEvent(new CustomEvent('bookmarkAdded', { detail: { bookId, chapterIndex: currentChapterIndex } }));
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    setBookmarkToDelete(bookmarkId);
  };

  const confirmDeleteBookmark = async () => {
    if (bookmarkToDelete) {
      try {
        const bookmark = bookmarks.find(b => b.id === bookmarkToDelete);
        await deleteBookmark(bookmarkToDelete);
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkToDelete));
        
        // Dispatch custom event to notify TOC of bookmark change
        if (bookmark) {
          window.dispatchEvent(new CustomEvent('bookmarkDeleted', { detail: { bookId, chapterIndex: bookmark.chapterIndex } }));
        }
      } catch (error) {
        console.error('Error deleting bookmark:', error);
      } finally {
        setBookmarkToDelete(null);
      }
    }
  };

  const cancelDeleteBookmark = () => {
    setBookmarkToDelete(null);
  };

  const handleEditBookmark = async (bookmarkId: string) => {
    if (!editLabel.trim()) return;

    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;

    const updatedBookmark = { ...bookmark, label: editLabel.trim() };

    try {
      await saveBookmark(updatedBookmark);
      setBookmarks(prev => prev.map(b => b.id === bookmarkId ? updatedBookmark : b));
      setEditingBookmark(null);
      setEditLabel('');
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };


  const [activeTab, setActiveTab] = useState<'all' | 'chapter' | 'text'>('all');

  const counts = useMemo(() => {
    return {
      all: bookmarks.length,
      chapter: bookmarks.filter(b => b.type === 'chapter' || !b.type).length,
      text: bookmarks.filter(b => b.type === 'text').length
    };
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    if (activeTab === 'all') return bookmarks;
    if (activeTab === 'chapter') return bookmarks.filter(b => b.type === 'chapter' || !b.type);
    if (activeTab === 'text') return bookmarks.filter(b => b.type === 'text');
    return bookmarks;
  }, [bookmarks, activeTab]);

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end animate-fade-in backdrop-blur-sm">
      <div 
        ref={panelRef}
        className="w-full max-w-md h-full shadow-xl flex flex-col animate-slide-in-right"
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
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style={{ 
            backgroundColor: interfaceStyles.backgroundColor,
            borderColor: interfaceStyles.borderColor 
          }}
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6" style={{ color: '#007BFF' }} />
            <h2 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>{getTranslation('bookmarks')}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSettings}
              className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-1 ${showSettings ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-gray-100 hover:bg-opacity-20'}`}
              style={{ 
                color: showSettings ? '#007BFF' : interfaceStyles.color,
              }}
              title={getTranslation('bookmarkHighlight')}
            >
              <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin-slow' : ''}`} />
              {showSettings ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
              style={{ color: interfaceStyles.color }}
              aria-label={getTranslation('bookmarks')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bookmark Settings Section */}
        {showSettings && preferences && onPreferencesChange && (
          <div 
            className="p-4 border-b animate-fade-in"
            style={{ 
              borderColor: interfaceStyles.borderColor,
              backgroundColor: interfaceStyles.backgroundColor + '80'
            }}
          >
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-60" style={{ color: interfaceStyles.color }}>
                  {getTranslation('highlightStyle')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['none', 'highlight', 'underline', 'strike'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onPreferencesChange({ 
                        ...preferences, 
                        bookmarkHighlight: { ...preferences.bookmarkHighlight, style } 
                      })}
                      className={`p-3 text-xs rounded-xl border transition-all duration-300 flex flex-col gap-2 items-start ${
                        preferences.bookmarkHighlight?.style === style 
                          ? 'ring-2 ring-blue-500 shadow-md' 
                          : 'hover:border-blue-300 opacity-80'
                      }`}
                      style={{ 
                        borderColor: preferences.bookmarkHighlight?.style === style ? '#007BFF' : interfaceStyles.borderColor,
                        backgroundColor: interfaceStyles.backgroundColor,
                        color: preferences.bookmarkHighlight?.style === style ? '#ffffff' : interfaceStyles.color
                      }}
                    >
                      <div className="flex items-center gap-1 w-full justify-between">
                        <span className="font-bold">{getTranslation(style)}</span>
                        {preferences.bookmarkHighlight?.style === style && <Check className="w-3 h-3" />}
                      </div>
                      
                      {/* Visual Preview */}
                      <div className="w-full p-1.5 rounded bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700">
                        <span className={`text-[10px] ${
                          style === 'highlight' ? 'px-1' :
                          style === 'underline' ? 'border-b-2' :
                          style === 'strike' ? 'line-through' :
                          ''
                        }`}
                        style={{
                          backgroundColor: style === 'highlight' ? preferences.bookmarkHighlight?.color : undefined,
                          borderBottomColor: style === 'underline' ? preferences.bookmarkHighlight?.color : undefined,
                          textDecorationColor: style === 'strike' ? preferences.bookmarkHighlight?.color : undefined,
                          color: interfaceStyles.color
                        }}
                        >
                          {getTranslation('sampleText') || 'Sample'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {preferences.bookmarkHighlight?.style !== 'none' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: interfaceStyles.color }}>
                      {getTranslation('highlightColor')}
                    </label>
                    
                    {/* Theme Recommendation Warning */}
                    {(() => {
                      const theme = preferences.selectedColorTheme;
                      const color = preferences.bookmarkHighlight?.color;
                      
                      const badCombinations: Record<string, string[]> = {
                        'Forest': ['#bbf7d0', '#86efac', '#22c55e'],
                        'Ocean': ['#bfdbfe', '#93c5fd', '#3b82f6'],
                        'Sunset': ['#fed7aa', '#fdba74', '#f97316'],
                        'Midnight': ['#ddd6fe', '#c4b5fd', '#8b5cf6'],
                        'Sepia': ['#fef08a', '#fde047', '#eab308'],
                      };

                      const isBad = badCombinations[theme]?.includes(color || '');

                      if (isBad) {
                        return (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {getTranslation('lowContrastWarning') || 'Low contrast'}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '#fef08a', '#fde047', '#eab308',
                      '#bbf7d0', '#86efac', '#22c55e',
                      '#bfdbfe', '#93c5fd', '#3b82f6',
                      '#fbcfe8', '#f9a8d4', '#ec4899',
                      '#ddd6fe', '#c4b5fd', '#8b5cf6',
                      '#fed7aa', '#fdba74', '#f97316',
                      '#fecaca', '#fca5a5', '#ef4444',
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => onPreferencesChange({ 
                          ...preferences, 
                          bookmarkHighlight: { ...preferences.bookmarkHighlight, color } 
                        })}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
                          preferences.bookmarkHighlight?.color === color ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {preferences.bookmarkHighlight?.color === color && (
                          <Check className="w-3.5 h-3.5 text-gray-800" />
                        )}
                      </button>
                    ))}
                    <div className="relative w-7 h-7">
                      <input
                        type="color"
                        value={preferences.bookmarkHighlight?.color || '#fef08a'}
                        onChange={(e) => onPreferencesChange({ 
                          ...preferences, 
                          bookmarkHighlight: { ...preferences.bookmarkHighlight || { style: 'highlight' }, color: e.target.value } 
                        })}
                        className="absolute inset-0 w-full h-full rounded-full border-2 border-transparent cursor-pointer overflow-hidden p-0 opacity-0"
                      />
                      <div 
                        className="w-full h-full rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        style={{ backgroundColor: preferences.bookmarkHighlight?.color }}
                      >
                        <Plus className="w-3 h-3 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="mt-3 p-3 rounded-lg border-l-4 flex gap-2 items-start animate-pulse-slow" 
                    style={{ 
                      backgroundColor: '#e0f2fe',
                      borderColor: '#0ea5e9',
                      color: '#0369a1'
                    }}
                  >
                    <Settings className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-medium leading-relaxed">
                      {getTranslation('colorRecommendationInfo') || 'Tip: Choose colors that contrast well with your current theme for better visibility.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Sync All Bookmarks Color Option */}
              <div className="pt-2 border-t" style={{ borderColor: interfaceStyles.borderColor }}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.syncAllBookmarks}
                      onChange={(e) => onPreferencesChange({
                        ...preferences,
                        syncAllBookmarks: e.target.checked
                      })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 ${preferences.syncAllBookmarks ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    <div className={`absolute left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${preferences.syncAllBookmarks ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold" style={{ color: interfaceStyles.color }}>
                      {getTranslation('syncAllBookmarks')}
                    </span>
                    <span className="text-[10px] opacity-60" style={{ color: interfaceStyles.color }}>
                      {getTranslation('syncAllBookmarksDescription')}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div 
          className="flex border-b"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${activeTab === 'all' ? 'text-blue-500' : 'opacity-60'}`}
            style={{ color: activeTab === 'all' ? '#007BFF' : interfaceStyles.color }}
          >
            {getTranslation('allBookmarks')} ({counts.all})
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
          <button
            onClick={() => setActiveTab('chapter')}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${activeTab === 'chapter' ? 'text-blue-500' : 'opacity-60'}`}
            style={{ color: activeTab === 'chapter' ? '#007BFF' : interfaceStyles.color }}
          >
            {getTranslation('chapter')} ({counts.chapter})
            {activeTab === 'chapter' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${activeTab === 'text' ? 'text-blue-500' : 'opacity-60'}`}
            style={{ color: activeTab === 'text' ? '#007BFF' : interfaceStyles.color }}
          >
            {getTranslation('text')} ({counts.text})
            {activeTab === 'text' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
        </div>

        {/* Add Bookmark Section */}
        <div 
          className="p-4 border-b"
          style={{ 
            borderColor: interfaceStyles.borderColor,
            backgroundColor: interfaceStyles.backgroundColor,
            opacity: 0.95
          }}
        >
          {!isAddingBookmark ? (
            <button
              onClick={() => setIsAddingBookmark(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg hover:border-gray-400 transition-all duration-300 hover:bg-gray-100 hover:bg-opacity-20"
              style={{ 
                borderColor: interfaceStyles.borderColor,
                color: interfaceStyles.color
              }}
            >
              <Plus className="w-5 h-5" />
              {getTranslation('addBookmarkHere')}
            </button>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <input
                type="text"
                placeholder={getTranslation('bookmarkLabel')}
                value={bookmarkLabel}
                onChange={(e) => setBookmarkLabel(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                style={{ 
                  borderColor: interfaceStyles.borderColor,
                  backgroundColor: interfaceStyles.backgroundColor,
                  color: interfaceStyles.color
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBookmark}
                  disabled={!bookmarkLabel.trim()}
                  className="flex-1 py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: '#007BFF',
                    color: '#ffffff'
                  }}
                >
                  {getTranslation('save')}
                </button>
                <button
                  onClick={() => {
                    setIsAddingBookmark(false);
                    setBookmarkLabel('');
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
          )}
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto">
          {filteredBookmarks.length === 0 ? (
            <div className="p-8 text-center" style={{ color: interfaceStyles.color }}>
              <Bookmark className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <h3 className="text-lg font-medium mb-2">{getTranslation('noBookmarksYet')}</h3>
              <p className="text-sm opacity-60">{getTranslation('addBookmarksDescription')}</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: interfaceStyles.borderColor }}>
              {filteredBookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id} 
                  ref={el => bookmarkRefs.current[bookmark.id] = el}
                  className={`p-4 transition-all duration-500 ${
                    highlightedId === bookmark.id 
                      ? 'bg-blue-500/20 ring-2 ring-blue-500/50 z-10 relative' 
                      : 'hover:bg-gray-50 hover:bg-opacity-20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onBookmarkClick(bookmark.chapterIndex, bookmark)}
                    >
                      {editingBookmark === bookmark.id ? (
                        <div className="space-y-2 animate-fade-in">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            style={{ 
                              borderColor: interfaceStyles.borderColor,
                              backgroundColor: interfaceStyles.backgroundColor,
                              color: interfaceStyles.color
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditBookmark(bookmark.id)}
                              className="text-sm px-3 py-1 rounded hover:opacity-90 transition-all duration-300"
                              style={{ 
                                backgroundColor: '#007BFF',
                                color: '#ffffff'
                              }}
                            >
                              {getTranslation('save')}
                            </button>
                            <button
                              onClick={() => {
                                setEditingBookmark(null);
                                setEditLabel('');
                              }}
                              className="text-sm border px-3 py-1 rounded hover:bg-gray-50 hover:bg-opacity-20 transition-all duration-300"
                              style={{ 
                                borderColor: interfaceStyles.borderColor,
                                color: interfaceStyles.color
                              }}
                            >
                              {getTranslation('cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {bookmark.label && bookmark.label.trim() !== '' && (
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium line-clamp-1" style={{ color: interfaceStyles.color }}>
                                {bookmark.label}
                              </h4>
                            </div>
                          )}
                          <p className="text-sm mb-2 line-clamp-2 italic opacity-70" style={{ color: interfaceStyles.color }}>
                            {bookmark.type === 'text' ? `"${bookmark.text}"` : getTranslation('chapterBookmark')}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider" style={{ color: interfaceStyles.color, opacity: 0.5 }}>
                            <span>{getTranslation('chapter')} {bookmark.chapterIndex + 1}</span>
                            <span>•</span>
                            <span>{formatDate(bookmark.createdAt)}</span>
                            {bookmark.type === 'text' ? (
                              <>
                                <span>•</span>
                                <Type className="w-3 h-3 text-blue-500" />
                              </>
                            ) : (
                              <>
                                <span>•</span>
                                <BookOpen className="w-3 h-3 text-amber-500" />
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {editingBookmark !== bookmark.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBookmark(bookmark.id);
                            setEditLabel(bookmark.label || '');
                          }}
                          className="p-1 hover:bg-gray-200 hover:bg-opacity-20 rounded transition-all duration-300"
                          style={{ color: interfaceStyles.color, opacity: 0.6 }}
                          aria-label={getTranslation('editBookmark')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          className="p-1 hover:bg-red-100 hover:bg-opacity-20 rounded transition-all duration-300"
                          style={{ color: '#ef4444' }}
                          aria-label={getTranslation('deleteBookmark')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
      </div>

      {/* Delete Confirmation Modal */}
      {bookmarkToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 animate-fade-in backdrop-blur-sm">
          <div 
            className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
            style={{
              backgroundColor: interfaceStyles.backgroundColor,
              color: interfaceStyles.color,
              border: `1px solid ${interfaceStyles.borderColor}`
            }}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                {getTranslation('delete')}
              </h3>
              <p className="mb-6 opacity-80">
                {getTranslation('areYouSureDeleteBookmark')}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDeleteBookmark}
                  className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {getTranslation('cancel')}
                </button>
                <button
                  onClick={confirmDeleteBookmark}
                  className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                >
                  {getTranslation('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
