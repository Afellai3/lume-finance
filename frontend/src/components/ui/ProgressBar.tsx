import React from 'react';
import { theme } from '../../styles/theme';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  label?: string;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'default',
  label,
  style,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Auto-detect variant based on percentage if variant is 'default'
  const getVariant = () => {
    if (variant !== 'default') return variant;
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'danger';
  };

  const currentVariant = getVariant();

  const variantColors: Record<string, string> = {
    default: theme.colors.primary.DEFAULT,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  };

  const sizeStyles: Record<string, { height: string; fontSize: string }> = {
    sm: { height: '4px', fontSize: theme.typography.fontSize.xs },
    md: { height: '8px', fontSize: theme.typography.fontSize.sm },
    lg: { height: '12px', fontSize: theme.typography.fontSize.base },
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    fontSize: sizeStyles[size].fontSize,
    color: theme.colors.text.secondary,
  };

  const trackStyles: React.CSSProperties = {
    width: '100%',
    height: sizeStyles[size].height,
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  };

  const fillStyles: React.CSSProperties = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: variantColors[currentVariant],
    borderRadius: theme.borderRadius.full,
    transition: `width ${theme.transitions.slow}`,
  };

  return (
    <div style={containerStyles}>
      {(label || showLabel) && (
        <div style={headerStyles}>
          {label && <span style={{ fontWeight: theme.typography.fontWeight.medium }}>{label}</span>}
          {showLabel && (
            <span style={{ fontWeight: theme.typography.fontWeight.semibold }}>
              {value.toFixed(0)}/{max}
            </span>>
          )}
        </div>
      )}
      <div style={trackStyles}>
        <div style={fillStyles} />
      </div>
    </div>
  );
};
