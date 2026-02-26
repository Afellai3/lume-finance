import { useState } from 'react'
import { Layout, Page } from './components/layout'
import Dashboard from './pages/Dashboard'
import MovimentiWithTabs from './pages/MovimentiWithTabs'
import Patrimonio from './pages/Patrimonio'
import Finanza from './pages/Finanza'
import Impostazioni from './pages/Impostazioni'
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
      subtitle: 'Gestisci entrate, uscite e ricorrenze' 
    },
    patrimonio: { 
      title: 'Patrimonio', 
      subtitle: 'I tuoi conti e beni' 
    },
    finanza: { 
      title: 'Finanza', 
      subtitle: 'Budget e obiettivi di risparmio' 
    },
    impostazioni: { 
      title: 'Impostazioni', 
      subtitle: 'Configura le preferenze dell\'app' 
    },
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'movimenti':
        return <MovimentiWithTabs />
      case 'patrimonio':
        return <Patrimonio />
      case 'finanza':
        return <Finanza />
      case 'impostazioni':
        return <Impostazioni />
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
