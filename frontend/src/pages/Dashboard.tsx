import { useState, useEffect } from 'react'
import './Dashboard.css'
import KPICard from '../components/KPICard'
import CategoryChart from '../components/CategoryChart'
import RecentMovements from '../components/RecentMovements'
import SavingsGoals from '../components/SavingsGoals'
import TrendChart from '../components/TrendChart'
import ComparisonCard from '../components/ComparisonCard'
import BudgetWarnings from '../components/BudgetWarnings'
import TopExpenses from '../components/TopExpenses'

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
    data_da: string
    data_a: string
    mese: number
    anno: number
    mese_nome: string
  }
}

type PeriodFilter = '1m' | '3m' | '6m' | '1y' | 'custom'

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [trendData, setTrendData] = useState<any[]>([])
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [budgetWarnings, setBudgetWarnings] = useState<any[]>([])
  const [topExpenses, setTopExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('1m')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')

  const calculateDateRange = (filter: PeriodFilter): { from: string; to: string } => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    
    switch (filter) {
      case '1m': {
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        return {
          from: firstDay.toISOString().split('T')[0],
          to: lastDay.toISOString().split('T')[0]
        }
      }
      case '3m': {
        const firstDay = new Date(year, month - 2, 1)
        const lastDay = new Date(year, month + 1, 0)
        return {
          from: firstDay.toISOString().split('T')[0],
          to: lastDay.toISOString().split('T')[0]
        }
      }
      case '6m': {
        const firstDay = new Date(year, month - 5, 1)
        const lastDay = new Date(year, month + 1, 0)
        return {
          from: firstDay.toISOString().split('T')[0],
          to: lastDay.toISOString().split('T')[0]
        }
      }
      case '1y': {
        const firstDay = new Date(year, 0, 1)
        const lastDay = new Date(year, 11, 31)
        return {
          from: firstDay.toISOString().split('T')[0],
          to: lastDay.toISOString().split('T')[0]
        }
      }
      case 'custom':
        return {
          from: customDateFrom,
          to: customDateTo
        }
    }
  }

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const { from, to } = calculateDateRange(periodFilter)
      
      const params = new URLSearchParams()
      if (periodFilter !== '1m') {
        params.append('data_da', from)
        params.append('data_a', to)
      }

      const [dashRes, trendRes, compRes, warningsRes, topRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?${params.toString()}`),
        fetch('/api/analytics/trend-mensile?mesi=6'),
        fetch('/api/analytics/confronto-periodo'),
        fetch('/api/analytics/budget-warnings'),
        fetch('/api/analytics/top-spese?limit=5')
      ])

      if (!dashRes.ok) throw new Error('Errore caricamento dashboard')

      const [dashboardData, trend, comparison, warnings, top] = await Promise.all([
        dashRes.json(),
        trendRes.ok ? trendRes.json() : [],
        compRes.ok ? compRes.json() : null,
        warningsRes.ok ? warningsRes.json() : [],
        topRes.ok ? topRes.json() : []
      ])

      setData(dashboardData)
      setTrendData(trend)
      setComparisonData(comparison)
      setBudgetWarnings(warnings)
      setTopExpenses(top)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [periodFilter, customDateFrom, customDateTo])

  const handlePeriodChange = (filter: PeriodFilter) => {
    setPeriodFilter(filter)
  }

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

      {/* Filtro Periodo */}
      <section className="period-filter">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${periodFilter === '1m' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('1m')}
          >
            Mese
          </button>
          <button
            className={`filter-btn ${periodFilter === '3m' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('3m')}
          >
            3 Mesi
          </button>
          <button
            className={`filter-btn ${periodFilter === '6m' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('6m')}
          >
            6 Mesi
          </button>
          <button
            className={`filter-btn ${periodFilter === '1y' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('1y')}
          >
            Anno
          </button>
          <button
            className={`filter-btn ${periodFilter === 'custom' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('custom')}
          >
            📅 Custom
          </button>
        </div>

        {periodFilter === 'custom' && (
          <div className="custom-date-inputs">
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => setCustomDateFrom(e.target.value)}
              placeholder="Da"
            />
            <span>→</span>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => setCustomDateTo(e.target.value)}
              placeholder="A"
            />
          </div>
        )}
      </section>

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
          label="Entrate Periodo"
          value={data.kpi.entrate_mese}
          format="currency"
          trend="positive"
        />
        <KPICard
          icon="📉"
          label="Uscite Periodo"
          value={data.kpi.uscite_mese}
          format="currency"
          trend="negative"
        />
        <KPICard
          icon={data.kpi.saldo_mese >= 0 ? '✅' : '⚠️'}
          label="Saldo Periodo"
          value={data.kpi.saldo_mese}
          format="currency"
          trend={data.kpi.saldo_mese >= 0 ? 'positive' : 'negative'}
        />
      </section>

      {/* Confronto Mese */}
      {comparisonData && periodFilter === '1m' && (
        <section className="comparison-section">
          <ComparisonCard data={comparisonData} />
        </section>
      )}

      {/* Budget Warnings */}
      {periodFilter === '1m' && budgetWarnings.length > 0 && (
        <section className="warnings-section">
          <BudgetWarnings warnings={budgetWarnings} />
        </section>
      )}

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Trend 6 Mesi */}
        <section className="dashboard-card wide-card">
          <h2>📈 Trend Entrate/Uscite (6 Mesi)</h2>
          <TrendChart data={trendData} />
        </section>

        {/* Spese per categoria */}
        <section className="dashboard-card">
          <h2>📊 Spese per Categoria</h2>
          {data.spese_per_categoria.length > 0 ? (
            <CategoryChart data={data.spese_per_categoria} />
          ) : (
            <div className="empty-state-small">
              <p>Nessuna spesa registrata</p>
            </div>
          )}
        </section>

        {/* Top 5 Spese */}
        {periodFilter === '1m' && (
          <section className="dashboard-card">
            <TopExpenses expenses={topExpenses} />
          </section>
        )}

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
