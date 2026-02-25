import { useState } from 'react'
import './MovimentoCard.css'
import { Movimento } from '../types'
import ScomposizioneModal from './ScomposizioneModal'

interface MovimentoCardProps {
  movimento: Movimento
  onEdit: (movimento: Movimento) => void
  onDelete: (id: number) => void
}

function MovimentoCard({ movimento, onEdit, onDelete }: MovimentoCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [showScomposizione, setShowScomposizione] = useState(false)

  const getTipoClass = () => {
    switch (movimento.tipo) {
      case 'entrata': return 'tipo-entrata'
      case 'uscita': return 'tipo-uscita'
      default: return 'tipo-trasferimento'
    }
  }

  const getTipoIcon = () => {
    switch (movimento.tipo) {
      case 'entrata': return '💰'
      case 'uscita': return '💸'
      default: return '🔄'
    }
  }

  const formatDate = () => {
    return new Date(movimento.data).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const hasScomposizione = movimento.bene_id && movimento.scomposizione_json

  return (
    <>
      <div 
        className={`movimento-card ${getTipoClass()}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="movimento-icon">
          {movimento.categoria_icona || getTipoIcon()}
        </div>

        <div className="movimento-info">
          <div className="movimento-header">
            <h3>{movimento.descrizione}</h3>
            {movimento.ricorrente && <span className="badge-ricorrente">🔁</span>}
            {hasScomposizione && (
              <button 
                className="badge-scomposizione"
                onClick={() => setShowScomposizione(true)}
                title="Vedi scomposizione costi"
              >
                🔥 Breakdown
              </button>
            )}
          </div>
          
          <div className="movimento-meta">
            <span>📅 {formatDate()}</span>
            {movimento.categoria_nome && (
              <span>📊 {movimento.categoria_nome}</span>
            )}
            {movimento.conto_nome && (
              <span>🏦 {movimento.conto_nome}</span>
            )}
            {movimento.bene_nome && (
              <span>🚗 {movimento.bene_nome}</span>
            )}
            {movimento.km_percorsi && (
              <span>🛣️ {movimento.km_percorsi} km</span>
            )}
          </div>
        </div>

        <div className={`movimento-importo ${getTipoClass()}`}>
          {movimento.tipo === 'entrata' ? '+' : movimento.tipo === 'uscita' ? '-' : ''}
          {movimento.importo.toFixed(2)} €
        </div>

        {showActions && (
          <div className="movimento-actions">
            <button 
              className="btn-icon btn-edit"
              onClick={() => onEdit(movimento)}
              title="Modifica"
            >
              ✏️
            </button>
            <button 
              className="btn-icon btn-delete"
              onClick={() => onDelete(movimento.id!)}
              title="Elimina"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {showScomposizione && (
        <ScomposizioneModal
          movimentoId={movimento.id!}
          onClose={() => setShowScomposizione(false)}
        />
      )}
    </>
  )
}

export default MovimentoCard
