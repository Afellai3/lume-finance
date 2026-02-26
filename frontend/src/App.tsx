import { useState } from 'react'
import { Layout, Page } from './components/layout'
import Dashboard from './pages/Dashboard'
import Movimenti from './pages/Movimenti'
import Conti from './pages/Conti'
import Beni from './pages/Beni'
import Budget from './pages/Budget'
import Obiettivi from './pages/Obiettivi'
import Ricorrenze from './pages/Ricorrenze'
import Categorie from './pages/Categorie'
import { ThemeProvider } from './providers/ThemeProvider'
import { ToastProvider } from './providers/ToastProvider'
import { ConfirmProvider } from './providers/ConfirmProvider'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const pageConfig: Record<Page, { title: string; subtitle?: string }> = {
    dashboard: { 
      title: 'Dashboard', 
      subtitle: 'Panoramica generale delle tue finanze' 
    },
    movimenti: { 
      title: 'Movimenti', 
      subtitle: 'Gestisci entrate e uscite' 
    },
    conti: { 
      title: 'Conti Bancari', 
      subtitle: 'I tuoi conti e saldi' 
    },
    ricorrenze: {
      title: 'Movimenti Ricorrenti',
      subtitle: 'Automatizza entrate e uscite ricorrenti'
    },
    categorie: {
      title: 'Categorie',
      subtitle: 'Gestisci categorie personalizzate'
    },
    beni: { 
      title: 'Beni', 
      subtitle: 'Veicoli ed elettrodomestici' 
    },
    budget: { 
      title: 'Budget', 
      subtitle: 'Pianifica e monitora le spese' 
    },
    obiettivi: { 
      title: 'Obiettivi di Risparmio', 
      subtitle: 'Traccia i tuoi traguardi finanziari' 
    },
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'movimenti':
        return <Movimenti />
      case 'conti':
        return <Conti />
      case 'ricorrenze':
        return <Ricorrenze />
      case 'categorie':
        return <Categorie />
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
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Layout
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageTitle={pageConfig[currentPage].title}
            pageSubtitle={pageConfig[currentPage].subtitle}
          >
            {/* Force remount on page change to trigger useEffect and refresh data */}
            <div key={currentPage}>
              {renderPage()}
            </div>
          </Layout>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
