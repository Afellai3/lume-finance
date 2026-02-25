import { useState, useEffect } from 'react'
import './BeneForm.css'
import { Bene } from '../types'

interface BeneFormProps {
  bene: Bene | null
  onClose: () => void
  onSuccess: () => void
}

function BeneForm({ bene, onClose, onSuccess }: BeneFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'veicolo' as 'veicolo' | 'elettrodomestico',
    data_acquisto: new Date().toISOString().split('T')[0],
    prezzo_acquisto: '',
    durata_anni_stimata: '10',
    tasso_ammortamento: '15',
    // Veicolo
    veicolo_tipo_carburante: 'benzina',
    veicolo_consumo_medio: '',
    veicolo_costo_manutenzione_per_km: '0.08',
    // Elettrodomestico
    elettrodomestico_potenza: '',
    elettrodomestico_ore_medie_giorno: ''
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (bene) {
      setFormData({
        nome: bene.nome,
        tipo: bene.tipo as 'veicolo' | 'elettrodomestico',
        data_acquisto: bene.data_acquisto.split('T')[0],
        prezzo_acquisto: bene.prezzo_acquisto.toString(),
        durata_anni_stimata: bene.durata_anni_stimata?.toString() || '10',
        tasso_ammortamento: bene.tasso_ammortamento?.toString() || '15',
        veicolo_tipo_carburante: bene.veicolo_tipo_carburante || 'benzina',
        veicolo_consumo_medio: bene.veicolo_consumo_medio?.toString() || '',
        veicolo_costo_manutenzione_per_km: bene.veicolo_costo_manutenzione_per_km?.toString() || '0.08',
        elettrodomestico_potenza: bene.elettrodomestico_potenza?.toString() || '',
        elettrodomestico_ore_medie_giorno: bene.elettrodomestico_ore_medie_giorno?.toString() || ''
      })
    }
  }, [bene])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        nome: formData.nome,
        tipo: formData.tipo,
        data_acquisto: new Date(formData.data_acquisto).toISOString(),
        prezzo_acquisto: parseFloat(formData.prezzo_acquisto),
        durata_anni_stimata: parseInt(formData.durata_anni_stimata),
        tasso_ammortamento: parseFloat(formData.tasso_ammortamento)
      }

      if (formData.tipo === 'veicolo') {
        payload.veicolo_tipo_carburante = formData.veicolo_tipo_carburante
        payload.veicolo_consumo_medio = parseFloat(formData.veicolo_consumo_medio)
        payload.veicolo_costo_manutenzione_per_km = parseFloat(formData.veicolo_costo_manutenzione_per_km)
      } else {
        payload.elettrodomestico_potenza = parseFloat(formData.elettrodomestico_potenza)
        payload.elettrodomestico_ore_medie_giorno = parseFloat(formData.elettrodomestico_ore_medie_giorno)
      }

      const url = bene ? `/api/beni/${bene.id}` : '/api/beni'
      const method = bene ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Errore salvataggio')

      onSuccess()
    } catch (error) {
      alert('Errore durante il salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-overlay">
      <div className="form-modal bene-form-modal">
        <div className="form-header">
          <h2>{bene ? '✏️ Modifica Bene' : '➕ Nuovo Bene'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Es: Fiat Panda 2020"
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tipo: e.target.value as 'veicolo' | 'elettrodomestico'
                })}
                required
              >
                <option value="veicolo">🚗 Veicolo</option>
                <option value="elettrodomestico">🏠 Elettrodomestico</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data Acquisto *</label>
              <input
                type="date"
                value={formData.data_acquisto}
                onChange={(e) => setFormData({ ...formData, data_acquisto: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Prezzo Acquisto (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.prezzo_acquisto}
                onChange={(e) => setFormData({ ...formData, prezzo_acquisto: e.target.value })}
                placeholder="15000.00"
                required
              />
            </div>
          </div>

          {formData.tipo === 'veicolo' && (
            <>
              <div className="form-section-title">⛽ Dati Veicolo</div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo Carburante</label>
                  <select
                    value={formData.veicolo_tipo_carburante}
                    onChange={(e) => setFormData({ ...formData, veicolo_tipo_carburante: e.target.value })}
                  >
                    <option value="benzina">Benzina</option>
                    <option value="diesel">Diesel</option>
                    <option value="gpl">GPL</option>
                    <option value="metano">Metano</option>
                    <option value="elettrico">Elettrico</option>
                    <option value="ibrido">Ibrido</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Consumo Medio (L/100km o kWh/100km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.veicolo_consumo_medio}
                    onChange={(e) => setFormData({ ...formData, veicolo_consumo_medio: e.target.value })}
                    placeholder="6.5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Costo Manutenzione per KM (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.veicolo_costo_manutenzione_per_km}
                  onChange={(e) => setFormData({ ...formData, veicolo_costo_manutenzione_per_km: e.target.value })}
                  placeholder="0.08"
                />
              </div>
            </>
          )}

          {formData.tipo === 'elettrodomestico' && (
            <>
              <div className="form-section-title">⚡ Dati Elettrodomestico</div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Potenza (Watt)</label>
                  <input
                    type="number"
                    value={formData.elettrodomestico_potenza}
                    onChange={(e) => setFormData({ ...formData, elettrodomestico_potenza: e.target.value })}
                    placeholder="2000"
                  />
                </div>

                <div className="form-group">
                  <label>Ore Medie al Giorno</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.elettrodomestico_ore_medie_giorno}
                    onChange={(e) => setFormData({ ...formData, elettrodomestico_ore_medie_giorno: e.target.value })}
                    placeholder="2.5"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Durata Stimata (anni)</label>
              <input
                type="number"
                value={formData.durata_anni_stimata}
                onChange={(e) => setFormData({ ...formData, durata_anni_stimata: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="form-group">
              <label>Tasso Ammortamento (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tasso_ammortamento}
                onChange={(e) => setFormData({ ...formData, tasso_ammortamento: e.target.value })}
                placeholder="15.0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvataggio...' : bene ? 'Aggiorna' : 'Crea Bene'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BeneForm
