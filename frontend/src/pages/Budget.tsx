import { useState, useEffect } from 'react'
import './Budget.css'
import BudgetCard from '../components/BudgetCard'
import BudgetForm from '../components/BudgetForm'
import { Budget } from '../types'

interface BudgetData {
  budget: Budget[]
  periodo: {
    mese: number
    anno: number
  }
}

interface Riepilogo {
  totale_budget: number
  totale_speso: number
  rimanente: number
  percentuale_utilizzo: number
  budget_superati: number
}

function BudgetPage() {
  const [data, setData] = useState<BudgetData | null>(null)
  const [riepilogo, setRiepilogo] = useState<Riepilogo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const fetchData = async () => {
    try {
      const [budgetRes, riepilogoRes] = await Promise.all([
        fetch('/api/budget'),
        fetch('/api/budget/riepilogo/mensile')
      ])
      
      if (!budgetRes.ok || !riepilogoRes.ok) {
        throw new Error('Errore caricamento dati')
      }
      
      const budgetData = await budgetRes.json()
      const riepilogoData = await riepilogoRes.json()
      
      setData(budgetData)
      setRiepilogo(riepilogoData)
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = () => {
    setEditingBudget(null)
    setShowForm(true)
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo budget?')) return

    try {
      const response = await fetch(`/api/budget/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore eliminazione')
      await fetchData()
    } catch (error) {
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingBudget(null)
    fetchData()
  }

  if (loading) {
    return (
      <div className="budget-page">
        <div className="loading">Caricamento budget...</div>
      </div>
    )
  }

  const getMeseNome = () => {
    if (!data) return ''
    const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
    return `${mesi[data.periodo.mese - 1]} ${data.periodo.anno}`
  }

  return (
    <div className="budget-page">
      <header className="page-header">
        <div>
          <h1>🎯 Budget</h1>
          <p className="page-subtitle">Gestisci i budget per categoria - {getMeseNome()}</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          ➕ Nuovo Budget
        </button>
      </header>

      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {riepilogo && (
        <div className="budget-summary">
          <div className="summary-card">
            <span className="summary-icon">💰</span>
            <div className="summary-content">
              <p className="summary-label">Budget Totale</p>
              <p className="summary-value">{riepilogo.totale_budget.toFixed(2)} €</p>
            </div>
          </div>
          
          <div className="summary-card">
            <span className="summary-icon">💸</span>
            <div className="summary-content">
              <p className="summary-label">Speso</p>
              <p className="summary-value">{riepilogo.totale_speso.toFixed(2)} €</p>
            </div>
          </div>
          
          <div className="summary-card">
            <span className="summary-icon">📉</span>
            <div className="summary-content">
              <p className="summary-label">Rimanente</p>
              <p className={`summary-value ${riepilogo.rimanente < 0 ? 'negative' : 'positive'}`}>
                {riepilogo.rimanente.toFixed(2)} €
              </p>
            </div>
          </div>
          
          <div className="summary-card">
            <span className="summary-icon">
              {riepilogo.budget_superati === 0 ? '✅' : '⚠️'}
            </span>
            <div className="summary-content">
              <p className="summary-label">Budget Superati</p>
              <p className="summary-value">{riepilogo.budget_superati}</p>
            </div>
          </div>
        </div>
      )}

      {!data || data.budget.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🎯</p>
          <h3>Nessun budget configurato</h3>
          <p>Crea il tuo primo budget per monitorare le spese per categoria</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Crea Budget
          </button>
        </div>
      ) : (
        <div className="budget-list">
          {data.budget.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BudgetPage
