import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Movimenti from './pages/Movimenti'
import Conti from './pages/Conti'
import Beni from './pages/Beni'
import Budget from './pages/Budget'
import Obiettivi from './pages/Obiettivi'

type Page = 'dashboard' | 'movimenti' | 'conti' | 'beni' | 'budget' | 'obiettivi'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'movimenti':
        return <Movimenti />
      case 'conti':
        return <Conti />
      case 'beni':
        return <Beni />
      case 'budget':
        return <Budget />
      case 'obiettivi':
        return <Obiettivi />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
