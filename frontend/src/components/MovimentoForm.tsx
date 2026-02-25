import { useState, useEffect } from 'react'
import './MovimentoForm.css'
import { Categoria, Conto, Bene, Budget } from '../types'

interface MovimentoFormProps {
  movimento?: any
  onClose: () => void
  onSuccess: () => void
}

function MovimentoForm({ movimento, onClose, onSuccess }: MovimentoFormProps) {
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [conti, setConti] = useState<Conto[]>([])
  const [beni, setBeni] = useState<Bene[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  
  const [formData, setFormData] = useState({
    data: movimento?.data.split('T')[0] || new Date().toISOString().split('T')[0],
    importo: movimento?.importo.toString() || '',
    tipo: movimento?.tipo || 'uscita',
    categoria_id: movimento?.categoria_id?.toString() || '',
    conto_id: movimento?.conto_id?.toString() || '',
    budget_id: movimento?.budget_id?.toString() || '',
    descrizione: movimento?.descrizione || '',
    ricorrente: movimento?.ricorrente || false,
    // Campi bene
    bene_id: movimento?.bene_id?.toString() || '',
    km_percorsi: movimento?.km_percorsi?.toString() || '',
    prezzo_carburante_al_litro: '',
    ore_utilizzo: movimento?.ore_utilizzo?.toString() || '',
    tariffa_kwh: '0.25'
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [beneSelezionato, setBeneSelezionato] = useState<Bene | null>(null)

  useEffect(() => {
    fetchCategorie()
    fetchConti()
    fetchBeni()
    fetchBudgets()
  }, [])

  useEffect(() => {
    if (formData.bene_id) {
      const bene = beni.find(b => b.id === parseInt(formData.bene_id))
      setBeneSelezionato(bene || null)
    } else {
      setBeneSelezionato(null)
    }
  }, [formData.bene_id, beni])

  const fetchCategorie = async () => {
    try {
      const response = await fetch('/api/movimenti/categorie')
      if (response.ok) {
        const data = await response.json()
        setCategorie(data)
      }
    } catch (error) {
      console.error('Errore caricamento categorie:', error)
    }
  }

  const fetchConti = async () => {
    try {
      const response = await fetch('/api/conti')
      if (response.ok) {
        const data = await response.json()
        setConti(data.filter((c: Conto) => c.attivo))
      }
    } catch (error) {
      console.error('Errore caricamento conti:', error)
    }
  }

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

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budget')
      if (response.ok) {
        const data = await response.json()
        // Filtra solo budget attivi
        const budgetsAttivi = data.budget?.filter((b: Budget) => b.attivo !== false) || []
        setBudgets(budgetsAttivi)
      }
    } catch (error) {
      console.error('Errore caricamento budget:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        data: formData.data,
        importo: parseFloat(formData.importo),
        tipo: formData.tipo,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        conto_id: formData.conto_id ? parseInt(formData.conto_id) : null,
        budget_id: formData.budget_id ? parseInt(formData.budget_id) : null,
        descrizione: formData.descrizione,
        ricorrente: formData.ricorrente
      }

      // Aggiungi campi bene se selezionato
      if (formData.bene_id) {
        payload.bene_id = parseInt(formData.bene_id)
        
        if (beneSelezionato?.tipo === 'veicolo' && formData.km_percorsi) {
          payload.km_percorsi = parseFloat(formData.km_percorsi)
          if (formData.prezzo_carburante_al_litro) {
            payload.prezzo_carburante_al_litro = parseFloat(formData.prezzo_carburante_al_litro)
          }
        } else if (beneSelezionato?.tipo === 'elettrodomestico' && formData.ore_utilizzo) {
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
      
      // Se c'è scomposizione, mostrala
      if (result.scomposizione) {
        mostraScomposizione(result.scomposizione)
      }

      onSuccess()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Errore durante il salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  const mostraScomposizione = (scomposizione: any) => {
    const dettagli = [
      `💵 Totale: ${scomposizione.costo_totale.toFixed(2)}€`,
      '',
      '🔍 Scomposizione:'
    ]

    scomposizione.componenti.forEach((comp: any) => {
      dettagli.push(`  • ${comp.voce}: ${comp.importo.toFixed(2)}€`)
      if (comp.dettagli) {
        dettagli.push(`    ${comp.dettagli}`)
      }
    })

    alert(dettagli.join('\n'))
  }

  const categorieByTipo = categorie.filter(c => c.tipo === formData.tipo)
  const budgetsDisponibili = budgets.filter(b => b.importo > 0)

  return (
    <div className="form-overlay">
      <div className="form-modal form-modal-large">
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
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value, categoria_id: '' })}
                required
              >
                <option value="entrata">Entrata</option>
                <option value="uscita">Uscita</option>
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
                placeholder="100.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              >
                <option value="">Nessuna categoria</option>
                {categorieByTipo.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icona} {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Conto</label>
              <select
                value={formData.conto_id}
                onChange={(e) => setFormData({ ...formData, conto_id: e.target.value })}
              >
                <option value="">Nessun conto</option>
                {conti.map((conto) => (
                  <option key={conto.id} value={conto.id}>
                    {conto.nome} ({conto.saldo.toFixed(2)}€)
                  </option>
                ))}
              </select>
            </div>

            {formData.tipo === 'uscita' && budgetsDisponibili.length > 0 && (
              <div className="form-group">
                <label>
                  🎯 Budget <span className="label-hint">(opzionale)</span>
                </label>
                <select
                  value={formData.budget_id}
                  onChange={(e) => setFormData({ ...formData, budget_id: e.target.value })}
                >
                  <option value="">Nessun budget (usa categoria)</option>
                  {budgetsDisponibili.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.categoria_icona} {budget.categoria_nome} - {budget.rimanente.toFixed(0)}€ rimanenti
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  💡 Se non selezioni un budget, verrà usato quello della categoria
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Descrizione *</label>
            <textarea
              value={formData.descrizione}
              onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
              placeholder="Descrizione del movimento..."
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.ricorrente}
                onChange={(e) => setFormData({ ...formData, ricorrente: e.target.checked })}
              />
              <span>Movimento ricorrente</span>
            </label>
          </div>

          {/* Sezione Scomposizione Costi */}
          {formData.tipo === 'uscita' && beni.length > 0 && (
            <div className="form-section">
              <h3 className="section-title">🔥 Scomposizione Costi Nascosti</h3>
              
              <div className="form-group">
                <label>Collega a Bene (opzionale)</label>
                <select
                  value={formData.bene_id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    bene_id: e.target.value,
                    km_percorsi: '',
                    ore_utilizzo: ''
                  })}
                >
                  <option value="">Nessun bene</option>
                  {beni.map((bene) => (
                    <option key={bene.id} value={bene.id}>
                      {bene.tipo === 'veicolo' ? '🚗' : '📡'} {bene.nome}
                    </option>
                  ))}
                </select>
              </div>

              {beneSelezionato?.tipo === 'veicolo' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Km Percorsi *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.km_percorsi}
                      onChange={(e) => setFormData({ ...formData, km_percorsi: e.target.value })}
                      placeholder="150"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Prezzo Carburante al Litro (€)</label>
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

              {beneSelezionato?.tipo === 'elettrodomestico' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Ore di Utilizzo *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.ore_utilizzo}
                      onChange={(e) => setFormData({ ...formData, ore_utilizzo: e.target.value })}
                      placeholder="3.5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tariffa kWh (€)</label>
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
            </div>
          )}

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
