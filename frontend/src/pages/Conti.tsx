import { useState, useEffect } from 'react'
import './Conti.css'
import ContoCard from '../components/ContoCard'
import ContoForm from '../components/ContoForm'
import { Conto } from '../types'

function Conti() {
  const [conti, setConti] = useState<Conto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingConto, setEditingConto] = useState<Conto | null>(null)

  const fetchConti = async () => {
    try {
      const response = await fetch('/api/conti')
      const data = await response.json()
      setConti(data)
    } catch (error) {
      console.error('Errore caricamento conti:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConti()
  }, [])

  const handleContoSaved = () => {
    fetchConti()
    setShowForm(false)
    setEditingConto(null)
  }

  const handleEdit = (conto: Conto) => {
    setEditingConto(conto)
    setShowForm(true)
  }

  const handleDelete = async (contoId: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo conto?')) return

    try {
      const response = await fetch(`/api/conti/${contoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchConti()
      } else {
        alert('Errore durante l\'eliminazione')
      }
    } catch (error) {
      console.error('Errore eliminazione conto:', error)
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleNewConto = () => {
    setEditingConto(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingConto(null)
  }

  // Calcola totali
  const totalePatrimonio = conti.reduce((sum, conto) => sum + conto.saldo, 0)
  const contiAttivi = conti.filter(c => c.attivo).length

  if (loading) {
    return (
      <div className="conti-page">
        <p>Caricamento conti...</p>
      </div>
    )
  }

  return (
    <div className="conti-page">
      <header className="page-header">
        <div>
          <h1>🏦 Conti</h1>
          <p className="page-subtitle">Gestisci i tuoi conti bancari e portafogli</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewConto}>
          ➕ Nuovo Conto
        </button>
      </header>

      {/* Riepilogo */}
      <div className="conti-summary">
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <p className="summary-label">Patrimonio Totale</p>
            <p className="summary-value">{totalePatrimonio.toFixed(2)} €</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <p className="summary-label">Conti Attivi</p>
            <p className="summary-value">{contiAttivi}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🏦</div>
          <div className="summary-content">
            <p className="summary-label">Conti Totali</p>
            <p className="summary-value">{conti.length}</p>
          </div>
        </div>
      </div>

      {/* Form creazione/modifica */}
      {showForm && (
        <div className="form-container">
          <ContoForm 
            conto={editingConto}
            onSuccess={handleContoSaved}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Lista conti */}
      {conti.length === 0 ? (
        <div className="empty-state">
          <p>📭 Nessun conto ancora</p>
          <p className="empty-subtitle">Inizia creando il tuo primo conto!</p>
          <button className="btn btn-primary" onClick={handleNewConto}>
            ➕ Crea Primo Conto
          </button>
        </div>
      ) : (
        <div className="conti-grid">
          {conti.map((conto) => (
            <ContoCard 
              key={conto.id} 
              conto={conto}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Conti
