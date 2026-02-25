import { useState } from 'react'
import './ObiettivoCard.css'
import { Obiettivo } from '../types'

interface ObiettivoCardProps {
  obiettivo: Obiettivo
  onEdit: (obiettivo: Obiettivo) => void
  onDelete: (id: number) => void
  onAggiungi: (id: number) => void
  onRimuovi: (id: number) => void
}

function ObiettivoCard({ obiettivo, onEdit, onDelete, onAggiungi, onRimuovi }: ObiettivoCardProps) {
  const [showActions, setShowActions] = useState(false)

  const percentuale = (obiettivo.importo_attuale / obiettivo.importo_target) * 100
  const rimanente = obiettivo.importo_target - obiettivo.importo_attuale

  const getPrioritaIcon = (priorita: number) => {
    switch (priorita) {
      case 1: return '🔴'
      case 2: return '🟠'
      case 3: return '🟡'
      case 4: return '🟢'
      case 5: return '🔵'
      default: return '⚪'
    }
  }

  const getPrioritaLabel = (priorita: number) => {
    switch (priorita) {
      case 1: return 'Urgente'
      case 2: return 'Alta'
      case 3: return 'Media'
      case 4: return 'Bassa'
      case 5: return 'Molto Bassa'
      default: return 'Non specificata'
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const isScaduto = () => {
    if (!obiettivo.data_target) return false
    return new Date(obiettivo.data_target) < new Date() && !obiettivo.completato
  }

  return (
    <div 
      className={`obiettivo-card ${obiettivo.completato ? 'completato' : ''} ${isScaduto() ? 'scaduto' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="obiettivo-header">
        <div>
          <h3>{obiettivo.nome}</h3>
          <div className="obiettivo-meta">
            <span className="priorita-badge">
              {getPrioritaIcon(obiettivo.priorita)} {getPrioritaLabel(obiettivo.priorita)}
            </span>
            {obiettivo.data_target && (
              <span className={`data-target ${isScaduto() ? 'scaduta' : ''}`}>
                📅 {formatDate(obiettivo.data_target)}
              </span>
            )}
          </div>
        </div>
        {obiettivo.completato && (
          <span className="badge-completato">✅ Completato</span>
        )}
      </div>

      <div className="obiettivo-importi">
        <div className="importo-item">
          <span className="importo-label">Raggiunto</span>
          <span className="importo-value attuale">{obiettivo.importo_attuale.toFixed(2)} €</span>
        </div>
        <div className="importo-item">
          <span className="importo-label">Obiettivo</span>
          <span className="importo-value target">{obiettivo.importo_target.toFixed(2)} €</span>
        </div>
        <div className="importo-item">
          <span className="importo-label">Rimanente</span>
          <span className="importo-value rimanente">{rimanente.toFixed(2)} €</span>
        </div>
      </div>

      <div className="obiettivo-progress">
        <div className="progress-header">
          <span>Progresso</span>
          <span className="progress-percentage">{percentuale.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${percentuale >= 100 ? 'complete' : ''}`}
            style={{ width: `${Math.min(percentuale, 100)}%` }}
          />
        </div>
      </div>

      {!obiettivo.completato && showActions && (
        <div className="obiettivo-actions">
          <button 
            className="btn-action btn-add"
            onClick={() => onAggiungi(obiettivo.id!)}
            title="Aggiungi fondi"
          >
            ➕
          </button>
          <button 
            className="btn-action btn-remove"
            onClick={() => onRimuovi(obiettivo.id!)}
            title="Rimuovi fondi"
          >
            ➖
          </button>
          <button 
            className="btn-action btn-edit"
            onClick={() => onEdit(obiettivo)}
            title="Modifica"
          >
            ✏️
          </button>
          <button 
            className="btn-action btn-delete"
            onClick={() => onDelete(obiettivo.id!)}
            title="Elimina"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

export default ObiettivoCard
