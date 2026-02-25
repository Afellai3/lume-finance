import './BudgetWarnings.css'

interface BudgetWarning {
  budget_id: number
  categoria: string
  icona: string
  colore: string
  budget: number
  spesa: number
  percentuale: number
  stato: 'attenzione' | 'superato'
}

interface BudgetWarningsProps {
  warnings: BudgetWarning[]
}

function BudgetWarnings({ warnings }: BudgetWarningsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  if (warnings.length === 0) {
    return (
      <div className="budget-warnings">
        <div className="warnings-header">
          <h3>⚠️ Budget in Attenzione</h3>
        </div>
        <div className="no-warnings">
          <p>✅ Tutti i budget sotto controllo!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="budget-warnings">
      <div className="warnings-header">
        <h3>⚠️ Budget in Attenzione</h3>
        <span className="warning-count">{warnings.length}</span>
      </div>

      <div className="warnings-list">
        {warnings.map((warning) => (
          <div key={warning.budget_id} className={`warning-item ${warning.stato}`}>
            <div className="warning-left">
              <span className="warning-icon" style={{ color: warning.colore }}>
                {warning.icona}
              </span>
              <div className="warning-info">
                <div className="warning-categoria">{warning.categoria}</div>
                <div className="warning-amounts">
                  <span>{formatCurrency(warning.spesa)}</span>
                  <span className="separator">/</span>
                  <span>{formatCurrency(warning.budget)}</span>
                </div>
              </div>
            </div>

            <div className="warning-right">
              <div className={`warning-badge ${warning.stato}`}>
                {warning.stato === 'superato' ? '🔴' : '🟡'}
                <span>{warning.percentuale}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BudgetWarnings
