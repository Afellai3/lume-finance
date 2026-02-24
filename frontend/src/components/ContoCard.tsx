import { useState } from 'react'
import './ContoCard.css'
import { Conto } from '../types'

interface ContoCardProps {
  conto: Conto
  onEdit: (conto: Conto) => void
  onDelete: (id: number) => void
}

function ContoCard({ conto, onEdit, onDelete }: ContoCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'corrente': return '🏦'
      case 'risparmio': return '🐷'
      case 'investimento': return '📈'
      case 'carta_credito': return '💳'
      case 'contanti': return '💵'
      default: return '💰'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'corrente': return 'Conto Corrente'
      case 'risparmio': return 'Risparmio'
      case 'investimento': return 'Investimento'
      case 'carta_credito': return 'Carta di Credito'
      case 'contanti': return 'Contanti'
      default: return tipo
    }
  }

  const getSaldoClass = () => {
    if (conto.saldo > 1000) return 'saldo-positivo'
    if (conto.saldo < 0) return 'saldo-negativo'
    return 'saldo-neutro'
  }

  return (
    <div 
      className={`conto-card ${!conto.attivo ? 'conto-inattivo' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="conto-header">
        <div className="conto-icon">
          {getTipoIcon(conto.tipo)}
        </div>
        <div className="conto-info">
          <h3>{conto.nome}</h3>
          <p className="conto-tipo">{getTipoLabel(conto.tipo)}</p>
        </div>
        {!conto.attivo && <span className="badge-inattivo">Inattivo</span>}
      </div>

      <div className="conto-saldo">
        <p className="saldo-label">Saldo</p>
        <p className={`saldo-value ${getSaldoClass()}`}>
          {conto.saldo.toFixed(2)} {conto.valuta}
        </p>
      </div>

      {conto.descrizione && (
        <div className="conto-descrizione">
          <p>{conto.descrizione}</p>
        </div>
      )}

      {showActions && (
        <div className="conto-actions">
          <button 
            className="btn-icon btn-edit"
            onClick={() => onEdit(conto)}
            title="Modifica"
          >
            ✏️
          </button>
          <button 
            className="btn-icon btn-delete"
            onClick={() => onDelete(conto.id!)}
            title="Elimina"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

export default ContoCard
