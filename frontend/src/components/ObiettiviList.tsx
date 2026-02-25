import './ObiettiviList.css'

interface Obiettivo {
  nome: string
  importo_target: number
  importo_attuale: number
  percentuale: number
  data_target?: string
  priorita: number
}

interface Props {
  obiettivi: Obiettivo[]
}

function ObiettiviList({ obiettivi }: Props) {
  const getPriorityColor = (priorita: number) => {
    if (priorita >= 4) return '#ef4444'
    if (priorita >= 3) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div className="obiettivi-list">
      {obiettivi.map((obj, index) => (
        <div key={index} className="obiettivo-item">
          <div className="obiettivo-header">
            <span className="obiettivo-nome">{obj.nome}</span>
            <span className="obiettivo-amounts">
              {obj.importo_attuale.toFixed(0)} / {obj.importo_target.toFixed(0)} €
            </span>
          </div>
          <div className="obiettivo-bar">
            <div
              className="obiettivo-bar-fill"
              style={{
                width: `${Math.min(obj.percentuale, 100)}%`,
                backgroundColor: getPriorityColor(obj.priorita)
              }}
            />
          </div>
          <div className="obiettivo-footer">
            <span className="obiettivo-percentage">{obj.percentuale.toFixed(0)}%</span>
            {obj.data_target && (
              <span className="obiettivo-data">
                Scadenza: {new Date(obj.data_target).toLocaleDateString('it-IT')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ObiettiviList
