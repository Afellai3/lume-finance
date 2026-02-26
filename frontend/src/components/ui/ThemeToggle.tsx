import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';

export function ThemeToggle() {
  const { mode, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      leftIcon={mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      style={{
        transition: 'all 0.3s ease'
      }}
    >
      {mode === 'light' ? 'Dark' : 'Light'}
    </Button>
  );
}
