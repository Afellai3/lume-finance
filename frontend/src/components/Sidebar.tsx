import './Sidebar.css'

type Page = 'dashboard' | 'movimenti' | 'conti' | 'beni'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Page, icon: '📊', label: 'Dashboard' },
    { id: 'movimenti' as Page, icon: '💸', label: 'Movimenti' },
    { id: 'conti' as Page, icon: '🏦', label: 'Conti' },
    { id: 'beni' as Page, icon: '🚗', label: 'Beni' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">💡 Lume</h1>
        <p className="tagline">Finance</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="version">v0.1.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
