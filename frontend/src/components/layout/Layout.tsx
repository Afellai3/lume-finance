import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useSafeArea } from '../../context/SafeAreaContext';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const safeArea = useSafeArea();

  return (
    <div className="layout">
      {/* Desktop Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="layout-main">
        {/* Header with safe area top padding */}
        <div style={{ paddingTop: `${safeArea.top}px` }}>
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Content */}
        <main className="layout-content">
          <Outlet />
        </main>
        
        {/* Bottom Navigation with safe area bottom padding */}
        <div style={{ paddingBottom: `${safeArea.bottom}px` }}>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default Layout;
