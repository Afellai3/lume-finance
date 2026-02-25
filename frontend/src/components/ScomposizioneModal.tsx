import { useState, useEffect } from 'react'
import './ScomposizioneModal.css'

interface ScomposizioneData {
  bene_nome: string
  bene_tipo: string
  costo_diretto: number
  costo_nascosto: number
  costo_totale: number
  scomposizione: Array<{
    tipo: string
    descrizione: string
    importo: number
    dettagli: any
  }>
  riepilogo: any
}

interface ScomposizioneModalProps {
  movimentoId: number
  onClose: () => void
}

function ScomposizioneModal({ movimentoId, onClose }: ScomposizioneModalProps) {
  const [data, setData] = useState<ScomposizioneData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScomposizione()
  }, [movimentoId])

  const fetchScomposizione = async () => {
    try {
      const response = await fetch(`/api/movimenti/${movimentoId}/scomposizione`)
      if (!response.ok) throw new Error('Scomposizione non disponibile')
      const scompData = await response.json()
      setData(scompData)
    } catch (error) {
      console.error('Errore:', error)
      alert('Impossibile caricare la scomposizione')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="form-overlay">
        <div className="scomposizione-modal">
          <div className="loading">Caricamento scomposizione...</div>
        </div>
      </div>
    )
  }

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'carburante': return '⛽'
      case 'energia': return '⚡'
      case 'usura': return '🔧'
      case 'ammortamento': return '📉'
      default: return '💰'
    }
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="scomposizione-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>🔥 Scomposizione Costi Dettagliata</h2>
            <p className="modal-subtitle">
              {data.bene_tipo === 'veicolo' ? '🚗' : '🏠'} {data.bene_nome}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* KPI Cards */}
        <div className="scomposizione-kpi">
          <div className="kpi-card kpi-diretto">
            <span className="kpi-icon">💰</span>
            <div>
              <p className="kpi-label">Costo Diretto</p>
              <p className="kpi-value">{data.costo_diretto.toFixed(2)} €</p>
            </div>
          </div>
          
          <div className="kpi-card kpi-nascosto">
            <span className="kpi-icon">🔥</span>
            <div>
              <p className="kpi-label">Costo Nascosto</p>
              <p className="kpi-value">{data.costo_nascosto.toFixed(2)} €</p>
            </div>
          </div>
          
          <div className="kpi-card kpi-totale">
            <span className="kpi-icon">💵</span>
            <div>
              <p className="kpi-label">Costo Totale</p>
              <p className="kpi-value">{data.costo_totale.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Breakdown dettagliato */}
        <div className="scomposizione-breakdown">
          <h3>📊 Breakdown Dettagliato</h3>
          
          {data.scomposizione.map((item, idx) => (
            <div key={idx} className="breakdown-item">
              <div className="breakdown-header">
                <span className="breakdown-icon">{getIconForTipo(item.tipo)}</span>
                <span className="breakdown-descrizione">{item.descrizione}</span>
                <span className="breakdown-importo">{item.importo.toFixed(2)} €</span>
              </div>
              
              {item.dettagli && Object.keys(item.dettagli).length > 0 && (
                <div className="breakdown-dettagli">
                  {Object.entries(item.dettagli).map(([key, value]) => {
                    if (Array.isArray(value)) return null
                    if (typeof value === 'object') return null
                    
                    return (
                      <div key={key} className="dettaglio-row">
                        <span className="dettaglio-label">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </span>
                        <span className="dettaglio-value">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Riepilogo */}
        {data.riepilogo && (
          <div className="scomposizione-riepilogo">
            <h3>📌 Riepilogo</h3>
            <div className="riepilogo-grid">
              {Object.entries(data.riepilogo).map(([key, value]) => (
                <div key={key} className="riepilogo-item">
                  <span className="riepilogo-label">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="riepilogo-value">
                    {typeof value === 'number' ? `${value.toFixed(2)} €` : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScomposizioneModal
