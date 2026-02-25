import './SavingsGoals.css'

interface SavingsGoal {
  id: number
  nome: string
  importo_target: number
  importo_attuale: number
  data_target: string
  priorita: number
  percentuale_completamento: number
}

interface SavingsGoalsProps {
  goals: SavingsGoal[]
}

function SavingsGoals({ goals }: SavingsGoalsProps) {
  const getPriorityColor = (priorita: number) => {
    if (priorita >= 4) return '#ef4444' // Rosso - Alta
    if (priorita >= 3) return '#f59e0b' // Arancione - Media
    return '#10b981' // Verde - Bassa
  }

  return (
    <div className="savings-goals">
      {goals.map((goal) => (
        <div key={goal.id} className="goal-item">
          <div className="goal-header">
            <h3>{goal.nome}</h3>
            <span className="goal-amount">
              {goal.importo_attuale.toFixed(0)} / {goal.importo_target.toFixed(0)} €
            </span>
          </div>
          
          <div className="goal-progress-container">
            <div className="goal-progress-bar">
              <div 
                className="goal-progress-fill"
                style={{ 
                  width: `${Math.min(goal.percentuale_completamento, 100)}%`,
                  backgroundColor: getPriorityColor(goal.priorita)
                }}
              />
            </div>
            <span className="goal-percentage">
              {goal.percentuale_completamento.toFixed(1)}%
            </span>
          </div>
          
          <div className="goal-footer">
            <span className="goal-deadline">
              📅 Scadenza: {new Date(goal.data_target).toLocaleDateString('it-IT')}
            </span>
            <span className="goal-remaining">
              Mancano: {(goal.importo_target - goal.importo_attuale).toFixed(0)} €
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SavingsGoals
