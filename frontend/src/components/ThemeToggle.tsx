import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/Button';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md',
  variant = 'ghost'
}) => {
  const { mode, toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      leftIcon={isDark ? <Moon size={18} /> : <Sun size={18} />}
      aria-label={`Passa a tema ${isDark ? 'chiaro' : 'scuro'}`}
      title={`Passa a tema ${isDark ? 'chiaro' : 'scuro'}`}
    >
      {isDark ? 'Dark' : 'Light'}
    </Button>
  );
};
