import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Bookmark, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { getBookmarks, saveBookmark, deleteBookmark, saveBookmarkState, getBookmarkState } from '../../utils/storage';
import { getTranslation } from '../../utils/translations';
import type { Bookmark as BookmarkType, Chapter, ReadingPreferences } from '../../types';

interface BookmarksPanelProps {
  bookId: string;
  chapters: Chapter[];
  currentChapterIndex: number;
  onBookmarkClick: (chapterIndex: number) => void;
  onClose: () => void;
  preferences?: ReadingPreferences;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  bookId,
  chapters,
  currentChapterIndex,
  onBookmarkClick,
  onClose,
  preferences
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
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
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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
      createdAt: new Date()
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

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (window.confirm(getTranslation('areYouSureDeleteBookmark'))) {
      try {
        const bookmarkToDelete = bookmarks.find(b => b.id === bookmarkId);
        await deleteBookmark(bookmarkId);
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        
        // Dispatch custom event to notify TOC of bookmark change
        if (bookmarkToDelete) {
          window.dispatchEvent(new CustomEvent('bookmarkDeleted', { detail: { bookId, chapterIndex: bookmarkToDelete.chapterIndex } }));
        }
      } catch (error) {
        console.error('Error deleting bookmark:', error);
      }
    }
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


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fade-in">
      <div 
        ref={panelRef}
        className="w-full max-w-md h-full shadow-xl overflow-y-auto animate-slide-in-right"
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
          className="flex items-center justify-between p-4 border-b sticky top-0"
          style={{ 
            backgroundColor: interfaceStyles.backgroundColor,
            borderColor: interfaceStyles.borderColor 
          }}
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6" style={{ color: '#007BFF' }} />
            <h2 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>{getTranslation('bookmarks')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
            style={{ color: interfaceStyles.color }}
            aria-label={getTranslation('bookmarks')}
          >
            <X className="w-5 h-5" />
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
        <div className="flex-1">
          {bookmarks.length === 0 ? (
            <div className="p-8 text-center" style={{ color: interfaceStyles.color }}>
              <Bookmark className="w-12 h-12 mx-auto mb-3" style={{ color: interfaceStyles.color, opacity: 0.3 }} />
              <h3 className="text-lg font-medium mb-2">{getTranslation('noBookmarksYet')}</h3>
              <p className="text-sm opacity-60">{getTranslation('addBookmarksDescription')}</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: interfaceStyles.borderColor }}>
              {bookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id} 
                  className="p-4 hover:bg-gray-50 hover:bg-opacity-20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onBookmarkClick(bookmark.chapterIndex)}
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
                          <h4 className="font-medium mb-1" style={{ color: interfaceStyles.color }}>{bookmark.label}</h4>
                          <p className="text-sm mb-2" style={{ color: interfaceStyles.color, opacity: 0.7 }}>{bookmark.text}</p>
                          <div className="flex items-center gap-4 text-xs" style={{ color: interfaceStyles.color, opacity: 0.6 }}>
                            <span>Chapter {bookmark.chapterIndex + 1}</span>
                            <span>{formatDate(bookmark.createdAt)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {editingBookmark !== bookmark.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBookmark(bookmark.id);
                            setEditLabel(bookmark.label);
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
        {bookmarks.length > 0 && (
          <div 
            className="p-4 border-t"
            style={{ 
              borderColor: interfaceStyles.borderColor,
              backgroundColor: interfaceStyles.backgroundColor,
              opacity: 0.8
            }}
          >
            <p className="text-sm text-center" style={{ color: interfaceStyles.color }}>
              {bookmarks.length} {getTranslation('bookmarksSaved')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
