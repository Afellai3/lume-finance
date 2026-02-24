import { useState, useEffect } from 'react'
import './MovimentoForm.css'
import { Conto, Bene, Categoria } from '../types'

interface MovimentoFormProps {
  onSuccess: () => void
}

function MovimentoForm({ onSuccess }: MovimentoFormProps) {
  const [conti, setConti] = useState<Conto[]>([])
  const [beni, setBeni] = useState<Bene[]>([])
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    data: new Date().toISOString().slice(0, 16),
    importo: '',
    tipo: 'uscita',
    categoria_id: '',
    conto_id: '',
    descrizione: '',
    note: '',
    // Scomposizione
    bene_id: '',
    km_percorsi: '',
    prezzo_carburante: '',
    prezzo_kwh: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [contiRes, beniRes] = await Promise.all([
        fetch('/api/conti'),
        fetch('/api/beni'),
      ])
      
      setConti(await contiRes.json())
      setBeni(await beniRes.json())
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const payload: any = {
        movimento: {
          data: formData.data,
          importo: parseFloat(formData.importo),
          tipo: formData.tipo,
          categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
          conto_id: parseInt(formData.conto_id),
          descrizione: formData.descrizione,
          note: formData.note || null,
          ricorrente: false,
        }
      }

      // Aggiungi parametri scomposizione se bene selezionato
      if (formData.bene_id) {
        payload.bene_id = parseInt(formData.bene_id)
        
        if (formData.km_percorsi) {
          payload.km_percorsi = parseFloat(formData.km_percorsi)
        }
        if (formData.prezzo_carburante) {
          payload.prezzo_carburante = parseFloat(formData.prezzo_carburante)
        }
        if (formData.prezzo_kwh) {
          payload.prezzo_kwh = parseFloat(formData.prezzo_kwh)
        }
      }

      const response = await fetch('/api/movimenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Errore creazione movimento')
      }

      const result = await response.json()
      console.log('Movimento creato:', result)

      setSuccess(true)
      setFormData({
        data: new Date().toISOString().slice(0, 16),
        importo: '',
        tipo: 'uscita',
        categoria_id: '',
        conto_id: '',
        descrizione: '',
        note: '',
        bene_id: '',
        km_percorsi: '',
        prezzo_carburante: '',
        prezzo_kwh: '',
      })

      onSuccess()
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  const selectedBene = beni.find(b => b.id === parseInt(formData.bene_id))

  return (
    <form className="movimento-form" onSubmit={handleSubmit}>
      <h2>➕ Nuovo Movimento</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✅ Movimento creato con successo!</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Data e Ora</label>
          <input
            type="datetime-local"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            required
          >
            <option value="uscita">💸 Uscita</option>
            <option value="entrata">💰 Entrata</option>
            <option value="trasferimento">🔄 Trasferimento</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Importo (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.importo}
            onChange={(e) => setFormData({ ...formData, importo: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>Conto</label>
          <select
            value={formData.conto_id}
            onChange={(e) => setFormData({ ...formData, conto_id: e.target.value })}
            required
          >
            <option value="">Seleziona conto</option>
            {conti.map((conto) => (
              <option key={conto.id} value={conto.id}>
                {conto.nome} ({conto.saldo.toFixed(2)} €)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Descrizione</label>
        <input
          type="text"
          value={formData.descrizione}
          onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
          placeholder="Es: Rifornimento benzina"
          required
        />
      </div>

      <div className="form-group">
        <label>Note (opzionali)</label>
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Aggiungi dettagli..."
          rows={2}
        />
      </div>

      <div className="form-divider">
        <span>🔬 Scomposizione Automatica (Opzionale)</span>
      </div>

      <div className="form-group">
        <label>Bene Associato</label>
        <select
          value={formData.bene_id}
          onChange={(e) => setFormData({ ...formData, bene_id: e.target.value })}
        >
          <option value="">Nessuno</option>
          {beni.map((bene) => (
            <option key={bene.id} value={bene.id}>
              {bene.nome} ({bene.tipo})
            </option>
          ))}
        </select>
      </div>

      {selectedBene?.tipo === 'veicolo' && (
        <div className="form-row">
          <div className="form-group">
            <label>Km Percorsi</label>
            <input
              type="number"
              step="0.1"
              value={formData.km_percorsi}
              onChange={(e) => setFormData({ ...formData, km_percorsi: e.target.value })}
              placeholder="100"
            />
          </div>
          <div className="form-group">
            <label>Prezzo Carburante (€/L)</label>
            <input
              type="number"
              step="0.01"
              value={formData.prezzo_carburante}
              onChange={(e) => setFormData({ ...formData, prezzo_carburante: e.target.value })}
              placeholder="1.85"
            />
          </div>
        </div>
      )}

      {selectedBene?.tipo === 'elettrodomestico' && (
        <div className="form-group">
          <label>Prezzo Elettricità (€/kWh)</label>
          <input
            type="number"
            step="0.001"
            value={formData.prezzo_kwh}
            onChange={(e) => setFormData({ ...formData, prezzo_kwh: e.target.value })}
            placeholder="0.25"
          />
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Creazione...' : '💾 Salva Movimento'}
      </button>
    </form>
  )
}

export default MovimentoForm
