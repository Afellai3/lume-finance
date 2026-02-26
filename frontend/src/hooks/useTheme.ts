import { useState, useEffect } from 'react';
import { ThemeMode, getTheme } from '../styles/theme';

const STORAGE_KEY = 'theme_mode';

const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as ThemeMode) || getSystemTheme();
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
      document.documentElement.setAttribute('data-theme', mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return {
    mode,
    theme: getTheme(mode),
    toggleTheme,
    setThemeMode,
    isDark: mode === 'dark',
  };
};
