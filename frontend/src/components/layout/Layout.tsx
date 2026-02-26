import React, { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav, Page } from './BottomNav';
import { useTheme } from '../../hooks/useTheme';

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

  const mainStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    paddingBottom: '80px',
    transition: 'background-color 0.3s ease'
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: theme.layout.maxWidth,
    margin: '0 auto',
    padding: theme.spacing.lg
  };

  return (
    <div style={mainStyles}>
      <Header pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
      <main style={contentStyles}>
        {children}
      </main>
      <BottomNav currentPage={currentPage} onPageChange={onPageChange} />
    </div>
  );
};
