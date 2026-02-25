import { useState, useEffect } from 'react'
import './MovimentoDetailModal.css'
import { Movimento } from '../types'

interface MovimentoDetailModalProps {
  movimentoId: number
  onClose: () => void
}

interface Scomposizione {
  costo_totale: number
  componenti: {
    voce: string
    importo: number
    dettaglio?: string
  }[]
}

function MovimentoDetailModal({ movimentoId, onClose }: MovimentoDetailModalProps) {
  const [movimento, setMovimento] = useState<Movimento | null>(null)
  const [scomposizione, setScomposizione] = useState<Scomposizione | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Recupera movimento
        const movRes = await fetch(`/api/movimenti/${movimentoId}`)
        if (!movRes.ok) throw new Error('Errore caricamento movimento')
        const movData = await movRes.json()
        setMovimento(movData)

        // Se ha bene collegato, recupera scomposizione
        if (movData.bene_id) {
          try {
            const scompRes = await fetch(`/api/movimenti/${movimentoId}/scomposizione`)
            if (scompRes.ok) {
              const scompData = await scompRes.json()
              setScomposizione(scompData)
            }
          } catch {
            // Scomposizione non disponibile, ignora
          }
        }
      } catch (error) {
        console.error('Errore:', error)
        alert('Errore caricamento dettagli')
        onClose()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [movimentoId])

  const formatData = (dataStr: string) => {
    const data = new Date(dataStr)
    return data.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Caricamento...</div>
        </div>
      </div>
    )
  }

  if (!movimento) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Dettaglio Movimento</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Testata Importo */}
          <div className={`detail-header ${movimento.tipo}`}>
            <div className="detail-type">
              {movimento.tipo === 'entrata' ? '💰' : '💸'}
              <span>{movimento.tipo === 'entrata' ? 'ENTRATA' : 'USCITA'}</span>
            </div>
            <div className="detail-amount">
              {movimento.tipo === 'uscita' && '- '}
              {formatCurrency(movimento.importo)}
            </div>
          </div>

          {/* Descrizione */}
          <div className="detail-section">
            <h3>📝 Descrizione</h3>
            <p className="detail-description">{movimento.descrizione}</p>
          </div>

          {/* Info Principali */}
          <div className="detail-section">
            <h3>ℹ️ Informazioni</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">📅 Data:</span>
                <span className="value">{formatData(movimento.data)}</span>
              </div>

              {movimento.categoria_nome && (
                <div className="detail-item">
                  <span className="label">🏷️ Categoria:</span>
                  <span className="value">
                    {movimento.categoria_icona} {movimento.categoria_nome}
                  </span>
                </div>
              )}

              {movimento.conto_nome && (
                <div className="detail-item">
                  <span className="label">🏦 Conto:</span>
                  <span className="value">{movimento.conto_nome}</span>
                </div>
              )}

              {movimento.budget_categoria_nome && (
                <div className="detail-item">
                  <span className="label">💼 Budget:</span>
                  <span className="value">
                    {movimento.budget_categoria_icona} {movimento.budget_categoria_nome}
                  </span>
                </div>
              )}

              {movimento.ricorrente && (
                <div className="detail-item">
                  <span className="label">🔄 Ricorrente:</span>
                  <span className="value badge badge-info">Sì</span>
                </div>
              )}
            </div>
          </div>

          {/* Bene Collegato */}
          {movimento.bene_nome && (
            <div className="detail-section">
              <h3>🚗 Bene Collegato</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Nome:</span>
                  <span className="value">{movimento.bene_nome}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Tipo:</span>
                  <span className="value">
                    {movimento.bene_tipo === 'veicolo' ? '🚗 Veicolo' : '🔌 Elettrodomestico'}
                  </span>
                </div>

                {movimento.km_percorsi && (
                  <div className="detail-item">
                    <span className="label">Km Percorsi:</span>
                    <span className="value">{movimento.km_percorsi.toFixed(1)} km</span>
                  </div>
                )}

                {movimento.ore_utilizzo && (
                  <div className="detail-item">
                    <span className="label">Ore Utilizzo:</span>
                    <span className="value">{movimento.ore_utilizzo.toFixed(1)} h</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scomposizione Costi */}
          {scomposizione && (
            <div className="detail-section scomposizione-section">
              <h3>🔍 Scomposizione Costi Nascosti</h3>
              <div className="scomposizione-total">
                <span>Costo Totale Effettivo:</span>
                <strong>{formatCurrency(scomposizione.costo_totale)}</strong>
              </div>

              <div className="scomposizione-list">
                {scomposizione.componenti.map((comp, index) => (
                  <div key={index} className="scomposizione-item">
                    <div className="scomposizione-voce">
                      <span className="bullet">•</span>
                      <div>
                        <div className="voce-nome">{comp.voce}</div>
                        {comp.dettaglio && (
                          <div className="voce-dettaglio">{comp.dettaglio}</div>
                        )}
                      </div>
                    </div>
                    <div className="scomposizione-importo">
                      {formatCurrency(comp.importo)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="scomposizione-alert">
                💡 <strong>Suggerimento:</strong> Questo movimento ha costi nascosti oltre l'importo visibile!
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}

export default MovimentoDetailModal
