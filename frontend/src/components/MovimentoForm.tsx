import { useState, useEffect } from 'react'
import './MovimentoForm.css'
import { Movimento, Categoria, Conto, Bene } from '../types'

interface MovimentoFormProps {
  movimento: Movimento | null
  onClose: () => void
  onSuccess: () => void
  categorie: Categoria[]
  conti: Conto[]
}

function MovimentoForm({ movimento, onClose, onSuccess, categorie, conti }: MovimentoFormProps) {
  const [beni, setBeni] = useState<Bene[]>([])
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    importo: '',
    tipo: 'uscita',
    categoria_id: '',
    conto_id: '',
    descrizione: '',
    ricorrente: false,
    // Scomposizione costi
    bene_id: '',
    km_percorsi: '',
    prezzo_carburante_al_litro: '',
    ore_utilizzo: '',
    tariffa_kwh: '0.25'
  })
  const [submitting, setSubmitting] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    fetchBeni()
    
    if (movimento) {
      setFormData({
        data: movimento.data.split('T')[0],
        importo: movimento.importo.toString(),
        tipo: movimento.tipo,
        categoria_id: movimento.categoria_id?.toString() || '',
        conto_id: movimento.conto_id?.toString() || '',
        descrizione: movimento.descrizione,
        ricorrente: movimento.ricorrente,
        bene_id: movimento.bene_id?.toString() || '',
        km_percorsi: movimento.km_percorsi?.toString() || '',
        prezzo_carburante_al_litro: '',
        ore_utilizzo: movimento.ore_utilizzo?.toString() || '',
        tariffa_kwh: '0.25'
      })
    }
  }, [movimento])

  const fetchBeni = async () => {
    try {
      const response = await fetch('/api/beni')
      if (response.ok) {
        const data = await response.json()
        setBeni(data)
      }
    } catch (error) {
      console.error('Errore caricamento beni:', error)
    }
  }

  const getSelectedBene = () => {
    return beni.find(b => b.id?.toString() === formData.bene_id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        data: new Date(formData.data).toISOString(),
        importo: parseFloat(formData.importo),
        tipo: formData.tipo,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        conto_id: formData.conto_id ? parseInt(formData.conto_id) : null,
        descrizione: formData.descrizione,
        ricorrente: formData.ricorrente
      }

      // Aggiungi campi scomposizione se bene selezionato
      if (formData.bene_id) {
        const bene = getSelectedBene()
        payload.bene_id = parseInt(formData.bene_id)
        
        if (bene?.tipo === 'veicolo') {
          if (!formData.km_percorsi) {
            alert('Inserisci i km percorsi per il calcolo')
            setSubmitting(false)
            return
          }
          payload.km_percorsi = parseFloat(formData.km_percorsi)
          if (formData.prezzo_carburante_al_litro) {
            payload.prezzo_carburante_al_litro = parseFloat(formData.prezzo_carburante_al_litro)
          }
        } else if (bene?.tipo === 'elettrodomestico') {
          if (!formData.ore_utilizzo) {
            alert('Inserisci le ore di utilizzo per il calcolo')
            setSubmitting(false)
            return
          }
          payload.ore_utilizzo = parseFloat(formData.ore_utilizzo)
          payload.tariffa_kwh = parseFloat(formData.tariffa_kwh)
        }
      }

      const url = movimento ? `/api/movimenti/${movimento.id}` : '/api/movimenti'
      const method = movimento ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Errore salvataggio')
      }

      const result = await response.json()
      
      // Mostra breakdown se disponibile
      if (result.scomposizione && !movimento) {
        alert(`✅ Movimento creato!\n\n💰 Costo diretto: ${result.scomposizione.costo_diretto.toFixed(2)} €\n🔥 Costo nascosto: ${result.scomposizione.costo_nascosto.toFixed(2)} €\n💵 Costo totale: ${result.scomposizione.costo_totale.toFixed(2)} €`)
      }

      onSuccess()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Errore durante il salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedBene = getSelectedBene()

  return (
    <div className="form-overlay">
      <div className="form-modal movimento-form-modal">
        <div className="form-header">
          <h2>{movimento ? '✏️ Modifica Movimento' : '➕ Nuovo Movimento'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Data *</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
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
                <option value="entrata">💰 Entrata</option>
                <option value="uscita">💸 Uscita</option>
                <option value="trasferimento">🔄 Trasferimento</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Importo (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.importo}
                onChange={(e) => setFormData({ ...formData, importo: e.target.value })}
                placeholder="50.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Conto</label>
              <select
                value={formData.conto_id}
                onChange={(e) => setFormData({ ...formData, conto_id: e.target.value })}
              >
                <option value="">Nessun conto</option>
                {conti.map((conto) => (
                  <option key={conto.id} value={conto.id}>
                    {conto.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
            >
              <option value="">Nessuna categoria</option>
              {categorie
                .filter(c => c.tipo === formData.tipo)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icona} {cat.nome}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrizione *</label>
            <input
              type="text"
              value={formData.descrizione}
              onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
              placeholder="Es: Spesa supermercato"
              required
            />
          </div>

          {/* SCOMPOSIZIONE COSTI */}
          {!movimento && formData.tipo === 'uscita' && (
            <>
              <div className="form-section-divider">
                <span>🔥 Scomposizione Costi Avanzata</span>
              </div>

              <div className="form-group">
                <label>🚗 Collega a Bene (opzionale)</label>
                <select
                  value={formData.bene_id}
                  onChange={(e) => setFormData({ ...formData, bene_id: e.target.value })}
                >
                  <option value="">Nessun bene</option>
                  {beni.map((bene) => (
                    <option key={bene.id} value={bene.id}>
                      {bene.tipo === 'veicolo' ? '🚗' : '🏠'} {bene.nome}
                    </option>
                  ))}
                </select>
                {selectedBene && (
                  <small className="form-hint">
                    ℹ️ Lume calcolerà automaticamente usura, ammortamento e costi nascosti
                  </small>
                )}
              </div>

              {selectedBene?.tipo === 'veicolo' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>🛣️ Km Percorsi *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.km_percorsi}
                      onChange={(e) => setFormData({ ...formData, km_percorsi: e.target.value })}
                      placeholder="125.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>⛽ Prezzo Carburante/L (opz)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prezzo_carburante_al_litro}
                      onChange={(e) => setFormData({ ...formData, prezzo_carburante_al_litro: e.target.value })}
                      placeholder="1.85"
                    />
                  </div>
                </div>
              )}

              {selectedBene?.tipo === 'elettrodomestico' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>⏱️ Ore Utilizzo *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.ore_utilizzo}
                      onChange={(e) => setFormData({ ...formData, ore_utilizzo: e.target.value })}
                      placeholder="2.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>⚡ Tariffa €/kWh</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tariffa_kwh}
                      onChange={(e) => setFormData({ ...formData, tariffa_kwh: e.target.value })}
                      placeholder="0.25"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.ricorrente}
                onChange={(e) => setFormData({ ...formData, ricorrente: e.target.checked })}
              />
              Movimento ricorrente
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvataggio...' : movimento ? 'Aggiorna' : 'Crea Movimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimentoForm
