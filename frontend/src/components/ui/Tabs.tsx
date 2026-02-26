import React from 'react';
import { theme } from '../../styles/theme';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onChange, 
  variant = 'default',
  fullWidth = false 
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    gap: variant === 'pills' ? theme.spacing.sm : '0',
    borderBottom: variant === 'default' ? `2px solid ${theme.colors.border.light}` : 'none',
    marginBottom: theme.spacing.lg,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  const getTabStyles = (isActive: boolean): React.CSSProperties => {
    if (variant === 'pills') {
      return {
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        borderRadius: theme.borderRadius.full,
        backgroundColor: isActive ? theme.colors.primary.DEFAULT : 'transparent',
        color: isActive ? '#ffffff' : theme.colors.text.secondary,
        border: 'none',
        cursor: 'pointer',
        fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
        fontSize: theme.typography.fontSize.sm,
        transition: `all ${theme.transitions.base}`,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.xs,
        whiteSpace: 'nowrap',
        flex: fullWidth ? 1 : 'none',
        justifyContent: fullWidth ? 'center' : 'flex-start',
      };
    }

    // Default variant
    return {
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      backgroundColor: 'transparent',
      color: isActive ? theme.colors.primary.DEFAULT : theme.colors.text.secondary,
      border: 'none',
      borderBottom: isActive ? `3px solid ${theme.colors.primary.DEFAULT}` : '3px solid transparent',
      cursor: 'pointer',
      fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
      fontSize: theme.typography.fontSize.sm,
      transition: `all ${theme.transitions.base}`,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
      whiteSpace: 'nowrap',
      flex: fullWidth ? 1 : 'none',
      justifyContent: fullWidth ? 'center' : 'flex-start',
      position: 'relative',
      marginBottom: '-2px',
    };
  };

  const badgeStyles: React.CSSProperties = {
    backgroundColor: theme.colors.danger,
    color: '#ffffff',
    borderRadius: theme.borderRadius.full,
    padding: '2px 6px',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyles}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            style={getTabStyles(isActive)}
            onClick={() => onChange(tab.id)}
            onMouseEnter={(e) => {
              if (!isActive && variant === 'default') {
                e.currentTarget.style.color = theme.colors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && variant === 'default') {
                e.currentTarget.style.color = theme.colors.text.secondary;
              }
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span style={badgeStyles}>{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
