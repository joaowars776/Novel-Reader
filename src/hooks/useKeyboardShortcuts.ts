import { useEffect } from 'react';

interface KeyboardShortcuts {
  onNextChapter?: () => void;
  onPreviousChapter?: () => void;
  onToggleMenu?: () => void;
  onToggleSettings?: () => void;
  onToggleFullscreen?: () => void;
  onSearch?: () => void;
  onBookmark?: () => void;
  onIncreaseFontSize?: () => void;
  onDecreaseFontSize?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      switch (true) {
        // Navigation
        case key === 'ArrowRight' && !isModifierPressed:
          event.preventDefault();
          shortcuts.onNextChapter?.();
          break;
        case key === 'ArrowLeft' && !isModifierPressed:
          event.preventDefault();
          shortcuts.onPreviousChapter?.();
          break;

        // Menu toggles
        case key === 'm' && !isModifierPressed:
          event.preventDefault();
          shortcuts.onToggleMenu?.();
          break;
        case key === 's' && !isModifierPressed:
          event.preventDefault();
          shortcuts.onToggleSettings?.();
          break;

        // Fullscreen
        case key === 'f' && !isModifierPressed:
          event.preventDefault();
          shortcuts.onToggleFullscreen?.();
          break;

        // Search
        case key === '/' && !isModifierPressed:
        case (key === 'f' && isModifierPressed):
          event.preventDefault();
          shortcuts.onSearch?.();
          break;

        // Bookmark
        case key === 'b' && !isModifierPressed:
          event.preventDefault();
          shortcuts.onBookmark?.();
          break;

        // Font size
        case key === '=' && isModifierPressed:
        case key === '+' && isModifierPressed:
          event.preventDefault();
          shortcuts.onIncreaseFontSize?.();
          break;
        case key === '-' && isModifierPressed:
          event.preventDefault();
          shortcuts.onDecreaseFontSize?.();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};