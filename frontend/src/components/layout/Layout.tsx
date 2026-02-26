import React, { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav, Page } from './BottomNav';
import { useTheme } from '../../providers/ThemeProvider';
import { Capacitor } from '@capacitor/core';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  pageTitle: string;
  pageSubtitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onPageChange,
  pageTitle,
  pageSubtitle
}) => {
  const { theme } = useTheme();

  // Use CSS env() for safe areas - works automatically on iOS/Android
  const mainStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    // Safe area top: notch + status bar
    paddingTop: 'max(env(safe-area-inset-top), 0px)',
    // Safe area bottom: home indicator + bottom nav (80px)
    paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
    transition: 'background-color 0.3s ease'
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: theme.layout.maxWidth,
    margin: '0 auto',
    padding: theme.spacing.lg
  };

  return (
    <div style={mainStyles}>
      <Header 
        pageTitle={pageTitle} 
        pageSubtitle={pageSubtitle}
        onLogoClick={() => onPageChange('dashboard')}
      />
      <main style={contentStyles}>
        {children}
      </main>
      <BottomNav currentPage={currentPage} onPageChange={onPageChange} />
    </div>
  );
};
