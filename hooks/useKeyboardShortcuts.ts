import { useEffect } from 'react';
import type { ReadingPreferences } from '../types';

interface KeyboardShortcuts {
  onNextChapter?: () => void;
  onPreviousChapter?: () => void;
  onToggleMenu?: () => void;
  onToggleSettings?: () => void;
  onToggleFullscreen?: () => void;
  onSearch?: () => void;
  onIncreaseFontSize?: () => void;
  onDecreaseFontSize?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts, preferences?: ReadingPreferences) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { key } = event;
      
      // Helper to format key string for comparison
      const formatKey = (e: KeyboardEvent) => {
        let keyStr = e.key;
        if (e.ctrlKey || e.metaKey) keyStr = `Ctrl + ${keyStr}`;
        if (e.shiftKey) keyStr = `Shift + ${keyStr}`;
        if (e.altKey) keyStr = `Alt + ${keyStr}`;
        return keyStr.toLowerCase();
      };

      const pressedKey = formatKey(event);

      // Helper to check if a key matches any of the allowed keys for an action
      const matches = (actionId: string, defaultKeys: string[]) => {
        const userKeys = preferences?.shortcuts?.[actionId] || [];
        const allowedKeys = [
          ...userKeys.filter(k => k !== ''),
          ...(userKeys.length === 0 ? defaultKeys : [])
        ].map(k => k.toLowerCase());

        return allowedKeys.includes(pressedKey) || allowedKeys.includes(key.toLowerCase());
      };

      if (matches('nextChapter', ['ArrowRight'])) {
        event.preventDefault();
        shortcuts.onNextChapter?.();
      } else if (matches('previousChapter', ['ArrowLeft'])) {
        event.preventDefault();
        shortcuts.onPreviousChapter?.();
      } else if (matches('toggleMenu', ['m'])) {
        event.preventDefault();
        shortcuts.onToggleMenu?.();
      } else if (matches('toggleSettings', ['s'])) {
        event.preventDefault();
        shortcuts.onToggleSettings?.();
      } else if (matches('toggleFullscreen', ['F11'])) {
        event.preventDefault();
        shortcuts.onToggleFullscreen?.();
      } else if (matches('search', ['/'])) {
        event.preventDefault();
        shortcuts.onSearch?.();
      } else if (matches('increaseFontSize', ['='])) {
        event.preventDefault();
        shortcuts.onIncreaseFontSize?.();
      } else if (matches('decreaseFontSize', ['-'])) {
        event.preventDefault();
        shortcuts.onDecreaseFontSize?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, preferences]);
};
