import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
  theme: any;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
