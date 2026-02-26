import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from './ui/Button';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md',
  variant = 'ghost',
  showLabel = true,
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
      {showLabel && (isDark ? 'Dark' : 'Light')}
    </Button>
  );
};
