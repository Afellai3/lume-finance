import './KPICard.css'

interface KPICardProps {
  icon: string
  label: string
  value: number
  format?: 'currency' | 'number' | 'percentage'
  trend?: 'positive' | 'negative' | 'neutral'
}

function KPICard({ icon, label, value, format = 'number', trend = 'neutral' }: KPICardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `${value.toFixed(2)} €`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString('it-IT')
    }
  }

  const getTrendClass = () => {
    if (trend === 'positive') return 'trend-positive'
    if (trend === 'negative') return 'trend-negative'
    return 'trend-neutral'
  }

  return (
    <div className={`kpi-card ${getTrendClass()}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{formatValue()}</p>
      </div>
    </div>
  )
}

export default KPICard
