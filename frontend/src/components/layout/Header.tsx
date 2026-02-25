import React from 'react';
import { theme } from '../../styles/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const headerStyles: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
  };

  const logoContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  };

  const logoImageStyles: React.CSSProperties = {
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
  };

  const logoTextStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.DEFAULT,
    margin: 0,
  };

  const dividerStyles: React.CSSProperties = {
    width: '1px',
    height: '32px',
    backgroundColor: theme.colors.border.light,
  };

  const titleContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  };

  return (
    <header style={headerStyles}>
      <div style={logoContainerStyles}>
        {/* 
          IMPORTANTE: Sostituisci il percorso dell'immagine con il tuo logo JPEG
          Metti il file in: frontend/public/logo.jpg
          Oppure usa: frontend/src/assets/logo.jpg (e importalo con: import logo from './assets/logo.jpg')
        */}
        <img 
          src="/logo.jpg" 
          alt="Lume Finance Logo" 
          style={logoImageStyles}
          onError={(e) => {
            // Fallback se l'immagine non viene trovata: mostra emoji temporanea
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('span');
            fallback.textContent = '💡';
            fallback.style.fontSize = '32px';
            e.currentTarget.parentElement?.insertBefore(fallback, e.currentTarget);
          }}
        />
        <h1 style={logoTextStyles}>Lume Finance</h1>
      </div>
      
      <div style={dividerStyles} />
      
      <div style={titleContainerStyles}>
        <h2 style={titleStyles}>{title}</h2>
        {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      </div>
    </header>
  );
};
