import './ComparisonCard.css'

interface ComparisonData {
  mese_corrente: {
    periodo: string
    entrate: number
    uscite: number
    saldo: number
  }
  mese_precedente: {
    periodo: string
    entrate: number
    uscite: number
    saldo: number
  }
  variazioni: {
    entrate_percentuale: number
    uscite_percentuale: number
    saldo_differenza: number
  }
}

interface ComparisonCardProps {
  data: ComparisonData | null
}

function ComparisonCard({ data }: ComparisonCardProps) {
  if (!data) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value}%`
  }

  const getDeltaClass = (value: number, inverse: boolean = false) => {
    if (value === 0) return 'neutral'
    const positive = inverse ? value < 0 : value > 0
    return positive ? 'positive' : 'negative'
  }

  return (
    <div className="comparison-card">
      <div className="comparison-header">
        <h3>📅 Confronto Periodi</h3>
      </div>

      <div className="comparison-grid">
        {/* Colonna Mese Precedente */}
        <div className="comparison-col">
          <div className="period-label prev">{data.mese_precedente.periodo}</div>
          <div className="comparison-values">
            <div className="comp-value">
              <span className="comp-label">💰 Entrate</span>
              <span className="comp-amount">{formatCurrency(data.mese_precedente.entrate)}</span>
            </div>
            <div className="comp-value">
              <span className="comp-label">💸 Uscite</span>
              <span className="comp-amount">{formatCurrency(data.mese_precedente.uscite)}</span>
            </div>
            <div className="comp-value">
              <span className="comp-label">📊 Saldo</span>
              <span className="comp-amount">{formatCurrency(data.mese_precedente.saldo)}</span>
            </div>
          </div>
        </div>

        {/* Colonna Variazioni */}
        <div className="comparison-col delta-col">
          <div className="period-label">Variazione</div>
          <div className="comparison-values">
            <div className="comp-value">
              <span className={`delta-badge ${getDeltaClass(data.variazioni.entrate_percentuale)}`}>
                {formatPercentage(data.variazioni.entrate_percentuale)}
              </span>
            </div>
            <div className="comp-value">
              <span className={`delta-badge ${getDeltaClass(data.variazioni.uscite_percentuale, true)}`}>
                {formatPercentage(data.variazioni.uscite_percentuale)}
              </span>
            </div>
            <div className="comp-value">
              <span className={`delta-badge ${getDeltaClass(data.variazioni.saldo_differenza)}`}>
                {formatCurrency(data.variazioni.saldo_differenza)}
              </span>
            </div>
          </div>
        </div>

        {/* Colonna Mese Corrente */}
        <div className="comparison-col">
          <div className="period-label current">{data.mese_corrente.periodo}</div>
          <div className="comparison-values">
            <div className="comp-value">
              <span className="comp-label">💰 Entrate</span>
              <span className="comp-amount">{formatCurrency(data.mese_corrente.entrate)}</span>
            </div>
            <div className="comp-value">
              <span className="comp-label">💸 Uscite</span>
              <span className="comp-amount">{formatCurrency(data.mese_corrente.uscite)}</span>
            </div>
            <div className="comp-value">
              <span className="comp-label">📊 Saldo</span>
              <span className="comp-amount">{formatCurrency(data.mese_corrente.saldo)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonCard
