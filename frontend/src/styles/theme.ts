/**
 * Lume Finance - Design System Theme
 * Professional fintech design tokens
 */

export const theme = {
  colors: {
    // Primary Colors
    primary: {
      DEFAULT: '#4A90E2',
      dark: '#2D5F8D',
      light: '#7AB8FF',
      hover: '#3A7BC8',
      gradient: 'linear-gradient(135deg, #4A90E2 0%, #2D5F8D 100%)',
    },

    // Semantic Colors
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#FF6B6B',
    info: '#2196F3',

    // Neutral Colors
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: {
      light: '#E0E0E0',
      DEFAULT: '#BDBDBD',
      dark: '#9E9E9E',
    },

    // Text Colors
    text: {
      primary: '#212121',
      secondary: '#757575',
      muted: '#BDBDBD',
      disabled: '#9E9E9E',
      white: '#FFFFFF',
    },

    // Financial specific
    entrata: '#4CAF50',
    uscita: '#FF6B6B',

    // Category Colors (for charts and icons)
    categories: {
      alimentari: '#81C784',
      trasporti: '#64B5F6',
      svaghi: '#FFB74D',
      bollette: '#E57373',
      salute: '#BA68C8',
      casa: '#4DB6AC',
      abbigliamento: '#F06292',
      istruzione: '#9575CD',
      altro: '#A1887F',
    },
  },

  // Layout
  layout: {
    maxWidth: '1200px',
  },

  // Spacing scale (based on 8px)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },

    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '40px',
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
    primary: '0 4px 12px rgba(74, 144, 226, 0.3)',
    none: 'none',
  },

  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
  },

  // Breakpoints (for responsive design)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type Theme = typeof theme;

// Helper function to get category color
export const getCategoryColor = (category: string): string => {
  const normalizedCategory = category.toLowerCase();
  return theme.colors.categories[normalizedCategory as keyof typeof theme.colors.categories] || theme.colors.categories.altro;
};
