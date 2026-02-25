import React from 'react';
import { theme } from '../../styles/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onLogoClick }) => {
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

  const logoButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: `opacity ${theme.transitions.base}`,
  };

  const logoImageStyles: React.CSSProperties = {
    height: '56px',
    width: 'auto',
    objectFit: 'contain',
  };

  const dividerStyles: React.CSSProperties = {
    width: '1px',
    height: '40px',
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

  const [isLogoHovered, setIsLogoHovered] = React.useState(false);

  return (
    <header style={headerStyles}>
      <button
        style={{
          ...logoButtonStyles,
          opacity: isLogoHovered ? 0.8 : 1,
        }}
        onClick={onLogoClick}
        onMouseEnter={() => setIsLogoHovered(true)}
        onMouseLeave={() => setIsLogoHovered(false)}
        title="Torna alla Dashboard"
      >
        <img 
          src="/logo.jpg" 
          alt="Lume Finance Logo" 
          style={logoImageStyles}
          onError={(e) => {
            // Fallback se l'immagine non viene trovata: mostra emoji temporanea
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('span');
            fallback.textContent = '💡';
            fallback.style.fontSize = '48px';
            e.currentTarget.parentElement?.insertBefore(fallback, e.currentTarget);
          }}
        />
      </button>
      
      <div style={dividerStyles} />
      
      <div style={titleContainerStyles}>
        <h2 style={titleStyles}>{title}</h2>
        {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      </div>
    </header>
  );
};
