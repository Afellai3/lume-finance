import React, { ReactNode, useEffect, useState } from 'react';
import { Header } from './Header';
import { BottomNav, Page } from './BottomNav';
import { useTheme } from '../../providers/ThemeProvider';
import { Capacitor } from '@capacitor/core';
import { SafeArea } from '@capacitor/status-bar';

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
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    // Get safe area insets on mobile
    if (Capacitor.isNativePlatform()) {
      // For Android/iOS, use safe area insets
      SafeArea.getSafeAreaInsets().then((insets) => {
        console.log('📱 Safe Area Insets:', insets);
        setSafeAreaInsets({
          top: insets.insets.top,
          bottom: insets.insets.bottom
        });
      }).catch(() => {
        // Fallback values if SafeArea plugin fails
        console.log('⚠️ SafeArea plugin not available, using fallback');
        setSafeAreaInsets({ top: 40, bottom: 20 });
      });
    }
  }, []);

  const mainStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    paddingTop: Capacitor.isNativePlatform() ? `${safeAreaInsets.top}px` : '0',
    paddingBottom: Capacitor.isNativePlatform() ? `${80 + safeAreaInsets.bottom}px` : '80px',
    transition: 'background-color 0.3s ease'
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: theme.layout.maxWidth,
    margin: '0 auto',
    padding: theme.spacing.lg
  };

  const bottomNavStyles: React.CSSProperties = {
    paddingBottom: Capacitor.isNativePlatform() ? `${safeAreaInsets.bottom}px` : '0'
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
      <div style={bottomNavStyles}>
        <BottomNav currentPage={currentPage} onPageChange={onPageChange} />
      </div>
    </div>
  );
};
