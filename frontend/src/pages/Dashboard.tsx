import { useState, useEffect } from 'react'
import './Dashboard.css'
import KPICard from '../components/KPICard'
import CategoryChart from '../components/CategoryChart'
import RecentMovements from '../components/RecentMovements'
import SavingsGoals from '../components/SavingsGoals'

interface DashboardData {
  kpi: {
    patrimonio_totale: number
    entrate_mese: number
    uscite_mese: number
    saldo_mese: number
  }
  spese_per_categoria: Array<{
    nome: string
    icona: string
    colore: string
    totale: number
  }>
  ultimi_movimenti: Array<any>
  obiettivi_risparmio: Array<any>
  conti_attivi: Array<any>
  periodo: {
    mese: number
    anno: number
    mese_nome: string
  }
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard')
      if (!response.ok) throw new Error('Errore caricamento dashboard')
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <p>❌ {error}</p>
          <button className="btn btn-primary" onClick={fetchDashboard}>
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>📊 Dashboard</h1>
          <p className="page-subtitle">
            Panoramica finanziaria - {data.periodo.mese_nome}
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="kpi-section">
        <KPICard
          icon="💰"
          label="Patrimonio Totale"
          value={data.kpi.patrimonio_totale}
          format="currency"
          trend="neutral"
        />
        <KPICard
          icon="📈"
          label="Entrate Mese"
          value={data.kpi.entrate_mese}
          format="currency"
          trend="positive"
        />
        <KPICard
          icon="📉"
          label="Uscite Mese"
          value={data.kpi.uscite_mese}
          format="currency"
          trend="negative"
        />
        <KPICard
          icon={data.kpi.saldo_mese >= 0 ? '✅' : '⚠️'}
          label="Saldo Mese"
          value={data.kpi.saldo_mese}
          format="currency"
          trend={data.kpi.saldo_mese >= 0 ? 'positive' : 'negative'}
        />
      </section>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Spese per categoria */}
        <section className="dashboard-card">
          <h2>📊 Spese per Categoria</h2>
          {data.spese_per_categoria.length > 0 ? (
            <CategoryChart data={data.spese_per_categoria} />
          ) : (
            <div className="empty-state-small">
              <p>Nessuna spesa registrata questo mese</p>
            </div>
          )}
        </section>

        {/* Ultimi movimenti */}
        <section className="dashboard-card">
          <h2>💸 Ultimi Movimenti</h2>
          {data.ultimi_movimenti.length > 0 ? (
            <RecentMovements movements={data.ultimi_movimenti} />
          ) : (
            <div className="empty-state-small">
              <p>Nessun movimento ancora</p>
            </div>
          )}
        </section>

        {/* Obiettivi di risparmio */}
        <section className="dashboard-card full-width">
          <h2>🎯 Obiettivi di Risparmio</h2>
          {data.obiettivi_risparmio.length > 0 ? (
            <SavingsGoals goals={data.obiettivi_risparmio} />
          ) : (
            <div className="empty-state-small">
              <p>Nessun obiettivo configurato</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
