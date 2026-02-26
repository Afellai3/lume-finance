import React, { ReactNode, CSSProperties } from 'react';
import { theme } from '../../styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: theme.colors.primary.DEFAULT,
    color: 'white',
    border: 'none',
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.light}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    border: 'none',
  },
  danger: {
    backgroundColor: theme.colors.danger,
    color: 'white',
    border: 'none',
  }
};

const SIZE_STYLES: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    fontSize: theme.typography.fontSize.sm,
  },
  md: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSize.base,
  },
  lg: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSize.lg,
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  style
}) => {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: theme.transitions.base,
    width: fullWidth ? '100%' : 'auto',
    ...VARIANT_STYLES[variant],
    ...SIZE_STYLES[size],
    ...style
  };

  return (
    <button
      type={type}
      style={baseStyles}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = theme.colors.primary.hover;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = theme.colors.border.light;
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = theme.colors.border.light;
          } else if (variant === 'danger') {
            e.currentTarget.style.opacity = '0.9';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = VARIANT_STYLES[variant].backgroundColor as string;
          e.currentTarget.style.opacity = '1';
        }
      }}
    >
      {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
      {children}
      {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
    </button>
  );
};
