import React from 'react';
import { Loader2 } from 'lucide-react';
import { theme } from '../../styles/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: theme.typography.fontWeight.medium,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: `all ${theme.transitions.base}`,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: `${theme.spacing.xs} ${theme.spacing.md}`,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.sm,
    },
    lg: {
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
      fontSize: theme.typography.fontSize.base,
    },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.primary.DEFAULT,
      color: theme.colors.text.white,
      boxShadow: theme.shadows.primary,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.light}`,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.text.white,
      boxShadow: '0 2px 4px rgba(255, 107, 107, 0.3)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.primary.dark,
      boxShadow: '0 4px 8px rgba(74, 144, 226, 0.4)',
      transform: 'translateY(-1px)',
    },
    secondary: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.primary.DEFAULT,
    },
    danger: {
      backgroundColor: '#E55555',
      boxShadow: '0 4px 8px rgba(255, 107, 107, 0.4)',
    },
    ghost: {
      backgroundColor: theme.colors.background,
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled && !isLoading ? hoverStyles[variant] : {}),
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading ? (
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

// Add keyframe animation for loading spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
