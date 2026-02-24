import { useState } from 'react'
import './MovimentoList.css'
import { Movimento, ScomposizioneCosto } from '../types'

interface MovimentoListProps {
  movimenti: Movimento[]
  onRefresh: () => void
}

function MovimentoList({ movimenti, onRefresh }: MovimentoListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [scomposizione, setScomposizione] = useState<ScomposizioneCosto[]>([])
  const [loadingScomposizione, setLoadingScomposizione] = useState(false)

  const fetchScomposizione = async (movimentoId: number) => {
    if (expandedId === movimentoId) {
      setExpandedId(null)
      return
    }

    setLoadingScomposizione(true)
    try {
      const response = await fetch(`/api/movimenti/${movimentoId}/scomposizione`)
      const data = await response.json()
      setScomposizione(data)
      setExpandedId(movimentoId)
    } catch (error) {
      console.error('Errore caricamento scomposizione:', error)
    } finally {
      setLoadingScomposizione(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrata': return '💰'
      case 'uscita': return '💸'
      case 'trasferimento': return '🔄'
      default: return '💵'
    }
  }

  const getTipoClass = (tipo: string) => {
    switch (tipo) {
      case 'entrata': return 'tipo-entrata'
      case 'uscita': return 'tipo-uscita'
      default: return 'tipo-trasferimento'
    }
  }

  if (movimenti.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 Nessun movimento ancora</p>
        <p className="empty-subtitle">Inizia inserendo il tuo primo movimento!</p>
      </div>
    )
  }

  return (
    <div className="movimento-list">
      {movimenti.map((movimento) => (
        <div key={movimento.id} className="movimento-item">
          <div className="movimento-header" onClick={() => fetchScomposizione(movimento.id!)}>
            <div className="movimento-icon">
              {getTipoIcon(movimento.tipo)}
            </div>
            <div className="movimento-info">
              <h3>{movimento.descrizione}</h3>
              <p className="movimento-date">
                {new Date(movimento.data).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`movimento-amount ${getTipoClass(movimento.tipo)}`}>
              {movimento.tipo === 'entrata' ? '+' : '-'}
              {movimento.importo.toFixed(2)} €
            </div>
            <button className="expand-btn">
              {expandedId === movimento.id ? '▼' : '▶'}
            </button>
          </div>

          {expandedId === movimento.id && (
            <div className="movimento-details">
              {loadingScomposizione ? (
                <p>Caricamento scomposizione...</p>
              ) : scomposizione.length > 0 ? (
                <div className="scomposizione">
                  <h4>🔬 Scomposizione Dettagliata</h4>
                  <div className="scomposizione-list">
                    {scomposizione.map((comp, idx) => (
                      <div key={idx} className="scomposizione-item">
                        <div className="comp-header">
                          <span className="comp-name">{comp.nome_componente}</span>
                          <span className="comp-value">{comp.valore_componente.toFixed(2)} €</span>
                        </div>
                        <div className="comp-details">
                          <span className="comp-percentage">{comp.percentuale_totale?.toFixed(1)}%</span>
                          <span className="comp-method">{comp.metodo_calcolo}</span>
                        </div>
                        <div className="comp-bar">
                          <div 
                            className="comp-bar-fill" 
                            style={{ width: `${comp.percentuale_totale}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-scomposizione">Nessuna scomposizione disponibile</p>
              )}

              {movimento.note && (
                <div className="movimento-notes">
                  <strong>Note:</strong> {movimento.note}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MovimentoList
