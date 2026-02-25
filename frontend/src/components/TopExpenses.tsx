import './TopExpenses.css'

interface TopExpense {
  id: number
  data: string
  importo: number
  descrizione: string
  categoria_nome: string
  categoria_icona: string
  categoria_colore: string
  conto_nome: string
}

interface TopExpensesProps {
  expenses: TopExpense[]
}

function TopExpenses({ expenses }: TopExpensesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short'
    })
  }

  if (expenses.length === 0) {
    return (
      <div className="top-expenses">
        <div className="expenses-header">
          <h3>🔥 Top Spese del Mese</h3>
        </div>
        <div className="no-expenses">
          <p>Nessuna spesa registrata</p>
        </div>
      </div>
    )
  }

  return (
    <div className="top-expenses">
      <div className="expenses-header">
        <h3>🔥 Top {expenses.length} Spese del Mese</h3>
      </div>

      <div className="expenses-list">
        {expenses.map((expense, index) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-rank">#{index + 1}</div>
            
            <div className="expense-main">
              <div className="expense-top">
                <span className="expense-icon" style={{ color: expense.categoria_colore }}>
                  {expense.categoria_icona}
                </span>
                <div className="expense-details">
                  <div className="expense-description">{expense.descrizione}</div>
                  <div className="expense-meta">
                    <span className="expense-category">{expense.categoria_nome}</span>
                    {expense.conto_nome && (
                      <>
                        <span className="expense-separator">•</span>
                        <span className="expense-account">{expense.conto_nome}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="expense-right">
              <div className="expense-amount">{formatCurrency(expense.importo)}</div>
              <div className="expense-date">{formatDate(expense.data)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopExpenses
