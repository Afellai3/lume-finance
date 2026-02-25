import React from 'react';
import { Header } from './Header';
import { BottomNav, Page } from './BottomNav';
import { theme } from '../../styles/theme';

interface LayoutProps {
  children: React.ReactNode;
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
  pageSubtitle,
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
  };

  const mainStyles: React.CSSProperties = {
    flex: 1,
    padding: theme.spacing.lg,
    paddingBottom: '80px', // Space for bottom navigation
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
  };

  return (
    <div style={containerStyles}>
      <Header title={pageTitle} subtitle={pageSubtitle} />
      <main style={mainStyles}>
        {children}
      </main>
      <BottomNav currentPage={currentPage} onPageChange={onPageChange} />
    </div>
  );
};
