import { useState, useEffect } from 'react'
import './BudgetForm.css'
import { Budget, Categoria } from '../types'

interface BudgetFormProps {
  budget: Budget | null
  onClose: () => void
  onSuccess: () => void
}

function BudgetForm({ budget, onClose, onSuccess }: BudgetFormProps) {
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    categoria_id: '',
    importo: '',
    periodo: 'mensile'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategorie()
    
    if (budget) {
      setFormData({
        categoria_id: budget.categoria_id!.toString(),
        importo: budget.importo.toString(),
        periodo: budget.periodo
      })
    }
  }, [budget])

  const fetchCategorie = async () => {
    try {
      const response = await fetch('/api/movimenti/categorie?tipo=uscita')
      if (response.ok) {
        const data = await response.json()
        setCategorie(data)
      }
    } catch (error) {
      console.error('Errore caricamento categorie:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        categoria_id: parseInt(formData.categoria_id),
        importo: parseFloat(formData.importo),
        periodo: formData.periodo
      }

      const url = budget ? `/api/budget/${budget.id}` : '/api/budget'
      const method = budget ? 'PUT' : 'POST'

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
          <h2>{budget ? '✏️ Modifica Budget' : '➕ Nuovo Budget'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Categoria *</label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              required
              disabled={!!budget}
            >
              <option value="">Seleziona categoria...</option>
              {categorie.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icona} {cat.nome}
                </option>
              ))}
            </select>
            {budget && (
              <small className="form-note">La categoria non può essere modificata</small>
            )}
          </div>

          <div className="form-group">
            <label>Importo Budget (€) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.importo}
              onChange={(e) => setFormData({ ...formData, importo: e.target.value })}
              placeholder="500.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Periodo *</label>
            <select
              value={formData.periodo}
              onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
              required
            >
              <option value="mensile">Mensile</option>
              <option value="settimanale">Settimanale</option>
              <option value="annuale">Annuale</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvataggio...' : budget ? 'Aggiorna' : 'Crea Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BudgetForm
