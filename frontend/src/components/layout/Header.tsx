import React from 'react';
import { User } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, pageSubtitle, onLogoClick }) => {
  const { theme } = useTheme();

  const headerStyles: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: theme.layout.maxWidth,
    margin: '0 auto'
  };

  const logoImageStyles: React.CSSProperties = {
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease, transform 0.2s ease'
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md
  };

  const userInfoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    transition: 'background-color 0.3s ease'
  };

  const avatarStyles: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary.DEFAULT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  };

  const usernameStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    transition: 'color 0.3s ease'
  };

  return (
    <header style={headerStyles}>
      <div style={containerStyles}>
        {/* Logo - Clickable */}
        <img 
          src="/logo.jpg" 
          alt="Lume Finance Logo" 
          style={logoImageStyles}
          onClick={onLogoClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
        
        {/* Actions */}
        <div style={actionsStyles}>
          <ThemeToggle />
          <div style={userInfoStyles}>
            <div style={avatarStyles}>
              <User size={16} />
            </div>
            <span style={usernameStyles}>Utente</span>
          </div>
        </div>
      </div>
    </header>
  );
};
