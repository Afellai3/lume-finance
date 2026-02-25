import './RecentMovements.css'

interface Movement {
  id: number
  data: string
  importo: number
  tipo: string
  descrizione: string
  categoria_nome?: string
  categoria_icona?: string
  conto_nome: string
}

interface RecentMovementsProps {
  movements: Movement[]
}

function RecentMovements({ movements }: RecentMovementsProps) {
  const getTipoClass = (tipo: string) => {
    switch (tipo) {
      case 'entrata': return 'tipo-entrata'
      case 'uscita': return 'tipo-uscita'
      default: return 'tipo-trasferimento'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrata': return '💰'
      case 'uscita': return '💸'
      default: return '🔄'
    }
  }

  return (
    <div className="recent-movements">
      {movements.slice(0, 5).map((movimento) => (
        <div key={movimento.id} className="movement-row">
          <div className="movement-icon-small">
            {movimento.categoria_icona || getTipoIcon(movimento.tipo)}
          </div>
          <div className="movement-info-small">
            <p className="movement-desc">{movimento.descrizione}</p>
            <p className="movement-meta">
              {new Date(movimento.data).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'short'
              })}
              {' • '}
              {movimento.conto_nome}
            </p>
          </div>
          <div className={`movement-amount-small ${getTipoClass(movimento.tipo)}`}>
            {movimento.tipo === 'entrata' ? '+' : '-'}
            {movimento.importo.toFixed(2)} €
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentMovements
