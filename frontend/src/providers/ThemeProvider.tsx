import { ReactNode, useState, useEffect, useMemo } from 'react';
import { ThemeContext, ThemeMode } from '../hooks/useTheme';
import { theme as lightTheme } from '../styles/theme';
import { darkTheme } from '../styles/darkTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'lume-finance-theme';

function getInitialTheme(): ThemeMode {
  // Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored) return stored;

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    
    // Update document class for global styles
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const toggle = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentTheme = useMemo(() => {
    if (mode === 'dark') {
      return {
        ...lightTheme,
        colors: darkTheme.colors,
        shadows: darkTheme.shadows
      };
    }
    return lightTheme;
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggle, theme: currentTheme }}>
      <div style={{
        backgroundColor: currentTheme.colors.background,
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
