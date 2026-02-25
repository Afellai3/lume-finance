import React from 'react';
import { theme, getCategoryColor } from '../../styles/theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  category?: string; // For category-based coloring
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  category,
  size = 'md',
  style,
}) => {
  const getBackgroundColor = () => {
    if (category) {
      const categoryColor = getCategoryColor(category);
      return `${categoryColor}20`; // 20% opacity
    }

    const variantColors: Record<string, string> = {
      success: `${theme.colors.success}20`,
      warning: `${theme.colors.warning}20`,
      danger: `${theme.colors.danger}20`,
      info: `${theme.colors.info}20`,
      neutral: theme.colors.background,
    };

    return variantColors[variant];
  };

  const getTextColor = () => {
    if (category) {
      return getCategoryColor(category);
    }

    const variantColors: Record<string, string> = {
      success: theme.colors.success,
      warning: theme.colors.warning,
      danger: theme.colors.danger,
      info: theme.colors.info,
      neutral: theme.colors.text.secondary,
    };

    return variantColors[variant];
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      padding: `${theme.spacing.xs} ${theme.spacing.md}`,
      fontSize: theme.typography.fontSize.sm,
    },
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: getBackgroundColor(),
    color: getTextColor(),
    borderRadius: theme.borderRadius.full,
    fontWeight: theme.typography.fontWeight.medium,
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...style,
  };

  return <span style={badgeStyles}>{children}</span>;
};
