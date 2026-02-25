import { useState, useEffect } from 'react'
import './Obiettivi.css'
import ObiettivoCard from '../components/ObiettivoCard'
import ObiettivoForm from '../components/ObiettivoForm'
import { Obiettivo } from '../types'

function ObiettiviPage() {
  const [obiettivi, setObiettivi] = useState<Obiettivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingObiettivo, setEditingObiettivo] = useState<Obiettivo | null>(null)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/obiettivi')
      if (!response.ok) throw new Error('Errore caricamento')
      const data = await response.json()
      setObiettivi(data)
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
    setEditingObiettivo(null)
    setShowForm(true)
  }

  const handleEdit = (obiettivo: Obiettivo) => {
    setEditingObiettivo(obiettivo)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo obiettivo?')) return

    try {
      const response = await fetch(`/api/obiettivi/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore eliminazione')
      await fetchData()
    } catch (error) {
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingObiettivo(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingObiettivo(null)
    fetchData()
  }

  const handleAggiungiImporto = async (id: number) => {
    const importoStr = prompt('Quanto vuoi aggiungere all\'obiettivo?')
    if (!importoStr) return

    const importo = parseFloat(importoStr)
    if (isNaN(importo) || importo <= 0) {
      alert('Importo non valido')
      return
    }

    try {
      const response = await fetch(`/api/obiettivi/${id}/aggiungi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importo })
      })

      if (!response.ok) throw new Error('Errore')
      await fetchData()
    } catch (error) {
      alert('Errore durante l\'operazione')
    }
  }

  const handleRimuoviImporto = async (id: number) => {
    const importoStr = prompt('Quanto vuoi prelevare dall\'obiettivo?')
    if (!importoStr) return

    const importo = parseFloat(importoStr)
    if (isNaN(importo) || importo <= 0) {
      alert('Importo non valido')
      return
    }

    try {
      const response = await fetch(`/api/obiettivi/${id}/rimuovi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importo })
      })

      if (!response.ok) throw new Error('Errore')
      await fetchData()
    } catch (error) {
      alert('Errore durante l\'operazione')
    }
  }

  if (loading) {
    return (
      <div className="obiettivi-page">
        <div className="loading">Caricamento obiettivi...</div>
      </div>
    )
  }

  const obiettiviAttivi = obiettivi.filter(o => !o.completato)
  const obiettiviCompletati = obiettivi.filter(o => o.completato)
  const totaleTarget = obiettiviAttivi.reduce((sum, o) => sum + o.importo_target, 0)
  const totaleRaggiunto = obiettiviAttivi.reduce((sum, o) => sum + o.importo_attuale, 0)
  const percentualeGlobale = totaleTarget > 0 ? (totaleRaggiunto / totaleTarget * 100) : 0

  return (
    <div className="obiettivi-page">
      <header className="page-header">
        <div>
          <h1>💎 Obiettivi di Risparmio</h1>
          <p className="page-subtitle">
            {obiettiviAttivi.length} obiettivi attivi • {totaleRaggiunto.toFixed(0)}€ / {totaleTarget.toFixed(0)}€
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          ➕ Nuovo Obiettivo
        </button>
      </header>

      {showForm && (
        <ObiettivoForm
          obiettivo={editingObiettivo}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {obiettiviAttivi.length > 0 && (
        <div className="obiettivi-summary">
          <div className="summary-header">
            <span>Progresso Globale</span>
            <span className="summary-percentage">{percentualeGlobale.toFixed(1)}%</span>
          </div>
          <div className="progress-bar-global">
            <div 
              className="progress-fill-global"
              style={{ width: `${Math.min(percentualeGlobale, 100)}%` }}
            />
          </div>
        </div>
      )}

      {obiettiviAttivi.length === 0 && obiettiviCompletati.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">💎</p>
          <h3>Nessun obiettivo configurato</h3>
          <p>Crea il tuo primo obiettivo di risparmio per iniziare</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Crea Obiettivo
          </button>
        </div>
      ) : (
        <>
          {obiettiviAttivi.length > 0 && (
            <section className="obiettivi-section">
              <h2 className="section-title">🎯 Obiettivi Attivi</h2>
              <div className="obiettivi-list">
                {obiettiviAttivi.map((obiettivo) => (
                  <ObiettivoCard
                    key={obiettivo.id}
                    obiettivo={obiettivo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAggiungi={handleAggiungiImporto}
                    onRimuovi={handleRimuoviImporto}
                  />
                ))}
              </div>
            </section>
          )}

          {obiettiviCompletati.length > 0 && (
            <section className="obiettivi-section">
              <h2 className="section-title">✅ Obiettivi Completati</h2>
              <div className="obiettivi-list">
                {obiettiviCompletati.map((obiettivo) => (
                  <ObiettivoCard
                    key={obiettivo.id}
                    obiettivo={obiettivo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAggiungi={handleAggiungiImporto}
                    onRimuovi={handleRimuoviImporto}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default ObiettiviPage
