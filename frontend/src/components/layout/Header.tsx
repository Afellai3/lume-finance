import React from 'react';
import { User } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, pageSubtitle }) => {
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

  const titleContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    transition: 'color 0.3s ease'
  };

  const subtitleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    transition: 'color 0.3s ease'
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
        <div style={titleContainerStyles}>
          <h1 style={titleStyles}>{pageTitle}</h1>
          {pageSubtitle && <p style={subtitleStyles}>{pageSubtitle}</p>}
        </div>
        
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
