import React, { useRef, useEffect, useMemo } from 'react';
import { X, Keyboard } from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import type { ReadingPreferences } from '../../types';

interface ShortcutsModalProps {
  onClose: () => void;
  preferences?: ReadingPreferences;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose, preferences }) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const shortcuts = [
    { action: getTranslation('nextChapter'), keys: ['ArrowRight'] },
    { action: getTranslation('previousChapter'), keys: ['ArrowLeft'] },
    { action: getTranslation('toggleMenu'), keys: ['M'] },
    { action: getTranslation('toggleSettings'), keys: ['S'] },
    { action: getTranslation('toggleFullscreen'), keys: ['F'] },
    { action: getTranslation('search'), keys: ['/', 'Ctrl + F'] },
    { action: getTranslation('increaseFontSize'), keys: ['='] },
    { action: getTranslation('decreaseFontSize'), keys: ['-'] },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 animate-fade-in">
      <div 
        ref={modalRef} 
        className="rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden animate-scale-in"
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
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: interfaceStyles.borderColor }}
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" style={{ color: interfaceStyles.color, opacity: 0.6 }} />
            <h3 className="text-lg font-semibold" style={{ color: interfaceStyles.color }}>
              {getTranslation('shortcuts')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-opacity-20 rounded-lg transition-all duration-300"
            style={{ color: interfaceStyles.color }}
            aria-label={getTranslation('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          <table className="w-full text-left table-auto">
            <thead>
              <tr>
                <th className="pb-2 text-sm font-medium" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                  {getTranslation('action')}
                </th>
                <th className="pb-2 text-sm font-medium text-right" style={{ color: interfaceStyles.color, opacity: 0.7 }}>
                  {getTranslation('shortcut')}
                </th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((shortcut, index) => (
                <tr key={index} className="border-t" style={{ borderColor: interfaceStyles.borderColor }}>
                  <td className="py-2" style={{ color: interfaceStyles.color }}>
                    {shortcut.action}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd 
                          key={keyIndex} 
                          className="px-2 py-1 text-xs font-mono rounded bg-gray-100 bg-opacity-20"
                          style={{ 
                            backgroundColor: interfaceStyles.panelSecondaryBackground,
                            color: interfaceStyles.color,
                            border: `1px solid ${interfaceStyles.borderColor}`
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
