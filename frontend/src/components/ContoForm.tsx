import { useState, useEffect } from 'react'
import './ContoForm.css'
import { Conto } from '../types'

interface ContoFormProps {
  conto: Conto | null
  onSuccess: () => void
  onCancel: () => void
}

function ContoForm({ conto, onSuccess, onCancel }: ContoFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'corrente',
    saldo: '',
    valuta: 'EUR',
    descrizione: '',
    attivo: true,
  })

  useEffect(() => {
    if (conto) {
      setFormData({
        nome: conto.nome,
        tipo: conto.tipo,
        saldo: conto.saldo.toString(),
        valuta: conto.valuta,
        descrizione: conto.descrizione || '',
        attivo: conto.attivo,
      })
    }
  }, [conto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        nome: formData.nome,
        tipo: formData.tipo,
        saldo: parseFloat(formData.saldo),
        valuta: formData.valuta,
        descrizione: formData.descrizione || null,
        attivo: formData.attivo,
      }

      const url = conto ? `/api/conti/${conto.id}` : '/api/conti'
      const method = conto ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Errore salvataggio conto')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="conto-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{conto ? '✏️ Modifica Conto' : '➕ Nuovo Conto'}</h2>
        <button type="button" className="btn-close" onClick={onCancel}>
          ✕
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Nome Conto *</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Es: Conto Corrente Intesa"
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo *</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            required
          >
            <option value="corrente">🏦 Conto Corrente</option>
            <option value="risparmio">🐷 Risparmio</option>
            <option value="investimento">📈 Investimento</option>
            <option value="carta_credito">💳 Carta di Credito</option>
            <option value="contanti">💵 Contanti</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Saldo Iniziale *</label>
          <input
            type="number"
            step="0.01"
            value={formData.saldo}
            onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>Valuta</label>
          <select
            value={formData.valuta}
            onChange={(e) => setFormData({ ...formData, valuta: e.target.value })}
          >
            <option value="EUR">€ EUR</option>
            <option value="USD">$ USD</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Descrizione (opzionale)</label>
        <textarea
          value={formData.descrizione}
          onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
          placeholder="Aggiungi dettagli sul conto..."
          rows={3}
        />
      </div>

      <div className="form-group-checkbox">
        <label>
          <input
            type="checkbox"
            checked={formData.attivo}
            onChange={(e) => setFormData({ ...formData, attivo: e.target.checked })}
          />
          <span>Conto attivo</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvataggio...' : conto ? '💾 Aggiorna' : '💾 Crea Conto'}
        </button>
      </div>
    </form>
  )
}

export default ContoForm
