import './BudgetCard.css'
import { Budget } from '../types'

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (id: number) => void
}

function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const getStatoClass = () => {
    switch (budget.stato) {
      case 'superato': return 'stato-superato'
      case 'attenzione': return 'stato-attenzione'
      default: return 'stato-ok'
    }
  }

  const getStatoIcon = () => {
    switch (budget.stato) {
      case 'superato': return '🔴'
      case 'attenzione': return '🟡'
      default: return '🟢'
    }
  }

  return (
    <div className={`budget-card ${getStatoClass()}`}>
      <div className="budget-card-header">
        <div className="budget-categoria">
          <span className="categoria-icon">{budget.categoria_icona}</span>
          <div>
            <h3>{budget.categoria_nome}</h3>
            <span className="budget-periodo">{budget.periodo}</span>
          </div>
        </div>
        
        <div className="budget-importi">
          <div className="importo-item">
            <span className="importo-label">Budget</span>
            <span className="importo-value">{budget.importo.toFixed(2)} €</span>
          </div>
          <div className="importo-item">
            <span className="importo-label">Speso</span>
            <span className="importo-value speso">{budget.spesa_corrente.toFixed(2)} €</span>
          </div>
          <div className="importo-item">
            <span className="importo-label">Rimanente</span>
            <span className={`importo-value ${budget.rimanente < 0 ? 'negative' : 'positive'}`}>
              {budget.rimanente.toFixed(2)} €
            </span>
          </div>
        </div>
        
        <div className="budget-actions">
          <button className="btn-icon btn-edit" onClick={() => onEdit(budget)} title="Modifica">
            ✏️
          </button>
          <button className="btn-icon btn-delete" onClick={() => onDelete(budget.id!)} title="Elimina">
            🗑️
          </button>
        </div>
      </div>
      
      <div className="budget-progress">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${getStatoClass()}`}
            style={{ width: `${Math.min(budget.percentuale_utilizzo, 100)}%` }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-icon">{getStatoIcon()}</span>
          <span className="progress-text">
            {budget.percentuale_utilizzo.toFixed(1)}% utilizzato
          </span>
        </div>
      </div>
    </div>
  )
}

export default BudgetCard
