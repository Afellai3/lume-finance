import { useState, useEffect } from 'react'
import './ObiettivoForm.css'
import { Obiettivo } from '../types'

interface ObiettivoFormProps {
  obiettivo: Obiettivo | null
  onClose: () => void
  onSuccess: () => void
}

function ObiettivoForm({ obiettivo, onClose, onSuccess }: ObiettivoFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    importo_target: '',
    importo_attuale: '0',
    data_target: '',
    priorita: '3'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (obiettivo) {
      setFormData({
        nome: obiettivo.nome,
        importo_target: obiettivo.importo_target.toString(),
        importo_attuale: obiettivo.importo_attuale.toString(),
        data_target: obiettivo.data_target ? obiettivo.data_target.split('T')[0] : '',
        priorita: obiettivo.priorita.toString()
      })
    }
  }, [obiettivo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        nome: formData.nome,
        importo_target: parseFloat(formData.importo_target),
        importo_attuale: parseFloat(formData.importo_attuale),
        data_target: formData.data_target || null,
        priorita: parseInt(formData.priorita)
      }

      const url = obiettivo ? `/api/obiettivi/${obiettivo.id}` : '/api/obiettivi'
      const method = obiettivo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Errore salvataggio')
      }

      onSuccess()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Errore durante il salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <div className="form-header">
          <h2>{obiettivo ? '✏️ Modifica Obiettivo' : '➕ Nuovo Obiettivo'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Obiettivo *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Es: Vacanza in Giappone"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Importo Obiettivo (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.importo_target}
                onChange={(e) => setFormData({ ...formData, importo_target: e.target.value })}
                placeholder="5000.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Importo Attuale (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.importo_attuale}
                onChange={(e) => setFormData({ ...formData, importo_attuale: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data Target (opzionale)</label>
              <input
                type="date"
                value={formData.data_target}
                onChange={(e) => setFormData({ ...formData, data_target: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Priorità</label>
              <select
                value={formData.priorita}
                onChange={(e) => setFormData({ ...formData, priorita: e.target.value })}
              >
                <option value="1">🔴 Urgente</option>
                <option value="2">🟠 Alta</option>
                <option value="3">🟡 Media</option>
                <option value="4">🟢 Bassa</option>
                <option value="5">🔵 Molto Bassa</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvataggio...' : obiettivo ? 'Aggiorna' : 'Crea Obiettivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ObiettivoForm
