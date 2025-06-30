import type { InterfaceTheme, ColorTheme } from '../types';

// Interface Theme Definitions with Complete Color Specifications
export const INTERFACE_THEMES: InterfaceTheme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface with excellent readability',
    isDefault: true,
    colors: {
      // Header colors
      headerBackground: '#ffffff',
      headerText: '#1f2937',
      headerBorder: '#e5e7eb',
      
      // Panel colors
      panelBackground: '#ffffff',
      panelText: '#1f2937',
      panelBorder: '#e5e7eb',
      panelSecondaryBackground: '#f9fafb',
      
      // Button colors
      buttonPrimary: '#007BFF',
      buttonPrimaryText: '#ffffff',
      buttonSecondary: '#f3f4f6',
      buttonSecondaryText: '#374151',
      buttonHover: '#0056b3',
      
      // Input colors
      inputBackground: '#ffffff',
      inputText: '#1f2937',
      inputBorder: '#d1d5db',
      inputFocus: '#007BFF',
      
      // Accent colors
      accent: '#007BFF',
      accentHover: '#0056b3',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      // Text hierarchy
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      
      // Interactive elements
      linkColor: '#007BFF',
      linkHover: '#0056b3',
      divider: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.5)'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Modern dark theme perfect for low-light reading',
    colors: {
      // Header colors
      headerBackground: '#1f2937',
      headerText: '#f9fafb',
      headerBorder: '#374151',
      
      // Panel colors
      panelBackground: '#1f2937',
      panelText: '#f9fafb',
      panelBorder: '#374151',
      panelSecondaryBackground: '#111827',
      
      // Button colors
      buttonPrimary: '#3b82f6',
      buttonPrimaryText: '#ffffff',
      buttonSecondary: '#374151',
      buttonSecondaryText: '#d1d5db',
      buttonHover: '#2563eb',
      
      // Input colors
      inputBackground: '#374151',
      inputText: '#f9fafb',
      inputBorder: '#4b5563',
      inputFocus: '#3b82f6',
      
      // Accent colors
      accent: '#3b82f6',
      accentHover: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      // Text hierarchy
      textPrimary: '#f9fafb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      
      // Interactive elements
      linkColor: '#60a5fa',
      linkHover: '#3b82f6',
      divider: '#374151',
      shadow: 'rgba(0, 0, 0, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.7)'
    }
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Warm, paper-like interface that reduces eye strain',
    colors: {
      // Header colors
      headerBackground: '#f7f3e9',
      headerText: '#5d4e37',
      headerBorder: '#e6d7c3',
      
      // Panel colors
      panelBackground: '#f7f3e9',
      panelText: '#5d4e37',
      panelBorder: '#e6d7c3',
      panelSecondaryBackground: '#f0e6d2',
      
      // Button colors
      buttonPrimary: '#8b4513',
      buttonPrimaryText: '#f7f3e9',
      buttonSecondary: '#e6d7c3',
      buttonSecondaryText: '#5d4e37',
      buttonHover: '#a0522d',
      
      // Input colors
      inputBackground: '#faf6ed',
      inputText: '#5d4e37',
      inputBorder: '#d4c4a8',
      inputFocus: '#8b4513',
      
      // Accent colors
      accent: '#8b4513',
      accentHover: '#a0522d',
      success: '#6b8e23',
      warning: '#daa520',
      error: '#cd5c5c',
      
      // Text hierarchy
      textPrimary: '#5d4e37',
      textSecondary: '#8b7355',
      textMuted: '#a0916d',
      
      // Interactive elements
      linkColor: '#8b4513',
      linkHover: '#a0522d',
      divider: '#e6d7c3',
      shadow: 'rgba(93, 78, 55, 0.15)',
      overlay: 'rgba(93, 78, 55, 0.5)'
    }
  },
  {
    id: 'highcontrast',
    name: 'High Contrast',
    description: 'Maximum contrast for enhanced accessibility',
    colors: {
      // Header colors
      headerBackground: '#000000',
      headerText: '#ffffff',
      headerBorder: '#ffffff',
      
      // Panel colors
      panelBackground: '#000000',
      panelText: '#ffffff',
      panelBorder: '#ffffff',
      panelSecondaryBackground: '#1a1a1a',
      
      // Button colors
      buttonPrimary: '#ffffff',
      buttonPrimaryText: '#000000',
      buttonSecondary: '#333333',
      buttonSecondaryText: '#ffffff',
      buttonHover: '#cccccc',
      
      // Input colors
      inputBackground: '#000000',
      inputText: '#ffffff',
      inputBorder: '#ffffff',
      inputFocus: '#ffff00',
      
      // Accent colors
      accent: '#ffff00',
      accentHover: '#cccc00',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      
      // Text hierarchy
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
      textMuted: '#999999',
      
      // Interactive elements
      linkColor: '#ffff00',
      linkHover: '#cccc00',
      divider: '#ffffff',
      shadow: 'rgba(255, 255, 255, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.8)'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue tones inspired by deep ocean waters',
    colors: {
      // Header colors
      headerBackground: '#0f172a',
      headerText: '#e2e8f0',
      headerBorder: '#1e293b',
      
      // Panel colors
      panelBackground: '#0f172a',
      panelText: '#e2e8f0',
      panelBorder: '#1e293b',
      panelSecondaryBackground: '#020617',
      
      // Button colors
      buttonPrimary: '#0ea5e9',
      buttonPrimaryText: '#ffffff',
      buttonSecondary: '#1e293b',
      buttonSecondaryText: '#cbd5e1',
      buttonHover: '#0284c7',
      
      // Input colors
      inputBackground: '#1e293b',
      inputText: '#e2e8f0',
      inputBorder: '#334155',
      inputFocus: '#0ea5e9',
      
      // Accent colors
      accent: '#0ea5e9',
      accentHover: '#0284c7',
      success: '#06b6d4',
      warning: '#f59e0b',
      error: '#ef4444',
      
      // Text hierarchy
      textPrimary: '#e2e8f0',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      
      // Interactive elements
      linkColor: '#38bdf8',
      linkHover: '#0ea5e9',
      divider: '#1e293b',
      shadow: 'rgba(15, 23, 42, 0.4)',
      overlay: 'rgba(15, 23, 42, 0.7)'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green theme inspired by forest environments',
    colors: {
      // Header colors
      headerBackground: '#14532d',
      headerText: '#f0fdf4',
      headerBorder: '#166534',
      
      // Panel colors
      panelBackground: '#14532d',
      panelText: '#f0fdf4',
      panelBorder: '#166534',
      panelSecondaryBackground: '#052e16',
      
      // Button colors
      buttonPrimary: '#22c55e',
      buttonPrimaryText: '#ffffff',
      buttonSecondary: '#166534',
      buttonSecondaryText: '#dcfce7',
      buttonHover: '#16a34a',
      
      // Input colors
      inputBackground: '#166534',
      inputText: '#f0fdf4',
      inputBorder: '#15803d',
      inputFocus: '#22c55e',
      
      // Accent colors
      accent: '#22c55e',
      accentHover: '#16a34a',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      // Text hierarchy
      textPrimary: '#f0fdf4',
      textSecondary: '#dcfce7',
      textMuted: '#bbf7d0',
      
      // Interactive elements
      linkColor: '#4ade80',
      linkHover: '#22c55e',
      divider: '#166534',
      shadow: 'rgba(20, 83, 45, 0.4)',
      overlay: 'rgba(20, 83, 45, 0.7)'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and purple gradients like a beautiful sunset',
    colors: {
      // Header colors
      headerBackground: '#451a03',
      headerText: '#fed7aa',
      headerBorder: '#9a3412',
      
      // Panel colors
      panelBackground: '#451a03',
      panelText: '#fed7aa',
      panelBorder: '#9a3412',
      panelSecondaryBackground: '#1c0701',
      
      // Button colors
      buttonPrimary: '#ea580c',
      buttonPrimaryText: '#ffffff',
      buttonSecondary: '#9a3412',
      buttonSecondaryText: '#fed7aa',
      buttonHover: '#dc2626',
      
      // Input colors
      inputBackground: '#9a3412',
      inputText: '#fed7aa',
      inputBorder: '#c2410c',
      inputFocus: '#ea580c',
      
      // Accent colors
      accent: '#ea580c',
      accentHover: '#dc2626',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      
      // Text hierarchy
      textPrimary: '#fed7aa',
      textSecondary: '#fdba74',
      textMuted: '#fb923c',
      
      // Interactive elements
      linkColor: '#fb923c',
      linkHover: '#ea580c',
      divider: '#9a3412',
      shadow: 'rgba(69, 26, 3, 0.4)',
      overlay: 'rgba(69, 26, 3, 0.7)'
    }
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple theme with calming lavender tones',
    colors: {
      // Header colors
      headerBackground: '#581c87',
      headerText: '#f3e8ff',
      headerBorder: '#7c3aed',
      
      // Panel colors
      panelBackground: '#581c87',
      panelText: '#f3e8ff',
      panelBorder: '#7c3aed',
      panelSecondaryBackground: '#3b0764',
      
      // Button colors
      buttonPrimary: '#8b5cf6',
      buttonPrimaryText: '#ffffff',
      buttonSecondary: '#7c3aed',
      buttonSecondaryText: '#e9d5ff',
      buttonHover: '#7c3aed',
      
      // Input colors
      inputBackground: '#7c3aed',
      inputText: '#f3e8ff',
      inputBorder: '#8b5cf6',
      inputFocus: '#a855f7',
      
      // Accent colors
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      
      // Text hierarchy
      textPrimary: '#f3e8ff',
      textSecondary: '#e9d5ff',
      textMuted: '#d8b4fe',
      
      // Interactive elements
      linkColor: '#a855f7',
      linkHover: '#8b5cf6',
      divider: '#7c3aed',
      shadow: 'rgba(88, 28, 135, 0.4)',
      overlay: 'rgba(88, 28, 135, 0.7)'
    }
  }
];

// Reading Color Themes (for EPUB content)
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Classic black text on white background',
    colors: {
      chapterTitleColor: '#1f2937',
      textColor: '#000000',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'White text on dark background for low-light reading',
    colors: {
      chapterTitleColor: '#e5e7eb',
      textColor: '#f9fafb',
      backgroundColor: '#1f2937'
    }
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Warm, paper-like reading experience',
    colors: {
      chapterTitleColor: '#5d4e37',
      textColor: '#5d4e37',
      backgroundColor: '#f7f3e9'
    }
  },
  {
    id: 'highcontrast',
    name: 'High Contrast',
    description: 'Maximum contrast for accessibility',
    colors: {
      chapterTitleColor: '#ffffff',
      textColor: '#ffffff',
      backgroundColor: '#000000'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue tones for reduced eye strain',
    colors: {
      chapterTitleColor: '#e2e8f0',
      textColor: '#cbd5e1',
      backgroundColor: '#0f172a'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green theme for comfortable reading',
    colors: {
      chapterTitleColor: '#f0fdf4',
      textColor: '#dcfce7',
      backgroundColor: '#14532d'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange tones for evening reading',
    colors: {
      chapterTitleColor: '#fed7aa',
      textColor: '#fdba74',
      backgroundColor: '#451a03'
    }
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple theme for calming reading',
    colors: {
      chapterTitleColor: '#f3e8ff',
      textColor: '#e9d5ff',
      backgroundColor: '#581c87'
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Create your own color combination',
    colors: {
      chapterTitleColor: '#1f2937',
      textColor: '#000000',
      backgroundColor: '#ffffff'
    }
  }
];

// Helper function to get interface theme by ID
export const getInterfaceTheme = (themeId: string): InterfaceTheme => {
  return INTERFACE_THEMES.find(theme => theme.id === themeId) || INTERFACE_THEMES[0];
};

// Helper function to get reading color theme by ID
export const getColorTheme = (themeId: string): ColorTheme => {
  return COLOR_THEMES.find(theme => theme.id === themeId) || COLOR_THEMES[0];
};

// Helper function to apply interface theme colors to CSS variables
export const applyInterfaceTheme = (theme: InterfaceTheme) => {
  const root = document.documentElement;
  
  // Apply all theme colors as CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--interface-${key}`, value);
  });
};

// Helper function to get contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd want a more robust color parsing library
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Validate theme accessibility
export const validateThemeAccessibility = (theme: InterfaceTheme): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check critical contrast ratios
  const textContrast = getContrastRatio(theme.colors.textPrimary, theme.colors.panelBackground);
  if (textContrast < 4.5) {
    issues.push('Text contrast ratio is below WCAG AA standard (4.5:1)');
  }
  
  const buttonContrast = getContrastRatio(theme.colors.buttonPrimaryText, theme.colors.buttonPrimary);
  if (buttonContrast < 4.5) {
    issues.push('Button text contrast ratio is below WCAG AA standard (4.5:1)');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};