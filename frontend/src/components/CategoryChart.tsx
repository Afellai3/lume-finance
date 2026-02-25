import './CategoryChart.css'

interface CategoryData {
  nome: string
  icona: string
  colore: string
  totale: number
}

interface CategoryChartProps {
  data: CategoryData[]
}

function CategoryChart({ data }: CategoryChartProps) {
  const totale = data.reduce((sum, cat) => sum + cat.totale, 0)

  return (
    <div className="category-chart">
      <div className="category-list">
        {data.map((categoria, idx) => {
          const percentuale = (categoria.totale / totale) * 100
          
          return (
            <div key={idx} className="category-item">
              <div className="category-header">
                <span className="category-icon">{categoria.icona}</span>
                <span className="category-name">{categoria.nome}</span>
                <span className="category-amount">
                  {categoria.totale.toFixed(2)} €
                </span>
              </div>
              <div className="category-bar">
                <div 
                  className="category-bar-fill"
                  style={{ 
                    width: `${percentuale}%`,
                    backgroundColor: categoria.colore || 'var(--primary)'
                  }}
                />
              </div>
              <div className="category-percentage">
                {percentuale.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="category-total">
        <strong>Totale:</strong> {totale.toFixed(2)} €
      </div>
    </div>
  )
}

export default CategoryChart
