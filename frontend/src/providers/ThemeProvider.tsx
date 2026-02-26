import { ReactNode, createContext, useContext } from 'react';
import { ThemeMode, getTheme, Theme } from '../styles/theme';
import { useTheme as useThemeHook } from '../hooks/useTheme';

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useThemeHook();
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <div style={{
        backgroundColor: themeValue.theme.colors.background,
        color: themeValue.theme.colors.text.primary,
        minHeight: '100vh',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
