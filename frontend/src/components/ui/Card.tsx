import React from 'react';
import { theme } from '../../styles/theme';

export interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  padding?: keyof typeof theme.spacing;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  hoverable = false,
  padding = 'lg',
  className,
  style,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const containerStyles: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    boxShadow: isHovered && hoverable ? theme.shadows.lg : theme.shadows.md,
    transition: `all ${theme.transitions.base}`,
    transform: isHovered && hoverable ? 'translateY(-2px)' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    overflow: 'hidden',
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    padding: theme.spacing[padding],
    borderBottom: `1px solid ${theme.colors.border.light}`,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  };

  const bodyStyles: React.CSSProperties = {
    padding: theme.spacing[padding],
  };

  const footerStyles: React.CSSProperties = {
    padding: theme.spacing[padding],
    borderTop: `1px solid ${theme.colors.border.light}`,
    backgroundColor: theme.colors.background,
  };

  return (
    <div
      className={className}
      style={containerStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {header && <div style={headerStyles}>{header}</div>}
      <div style={bodyStyles}>{children}</div>
      {footer && <div style={footerStyles}>{footer}</div>}
    </div>
  );
};
