import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Landmark,
  TrendingUp,
  Settings
} from 'lucide-react';
import { theme } from '../../styles/theme';

export type Page = 'dashboard' | 'movimenti' | 'patrimonio' | 'finanza' | 'impostazioni';

interface BottomNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard' as Page, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'movimenti' as Page, icon: ArrowLeftRight, label: 'Movimenti' },
    { id: 'patrimonio' as Page, icon: Landmark, label: 'Patrimonio' },
    { id: 'finanza' as Page, icon: TrendingUp, label: 'Finanza' },
    { id: 'impostazioni' as Page, icon: Settings, label: 'Altro' },
  ];

  const navStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTop: `1px solid ${theme.colors.border.light}`,
    display: 'flex',
    justifyContent: 'space-around',
    padding: `${theme.spacing.sm} 0`,
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
    zIndex: 100,
  };

  const getItemStyles = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: isActive ? theme.colors.primary.DEFAULT : theme.colors.text.secondary,
    transition: `all ${theme.transitions.base}`,
    flex: 1,
    maxWidth: '120px',
    minWidth: '60px',
  });

  const labelStyles = (isActive: boolean): React.CSSProperties => ({
    fontSize: theme.typography.fontSize.xs,
    fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
    whiteSpace: 'nowrap',
  });

  return (
    <nav style={navStyles}>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <button
            key={item.id}
            style={getItemStyles(isActive)}
            onClick={() => onPageChange(item.id)}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span style={labelStyles(isActive)}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
