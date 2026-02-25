import './KpiCard.css'

interface KpiCardProps {
  title: string
  value: number
  icon: string
  format?: 'currency' | 'number' | 'percentage'
  color?: 'primary' | 'success' | 'danger' | 'warning'
}

function KpiCard({ title, value, icon, format = 'number', color = 'primary' }: KpiCardProps) {
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

  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <p className="kpi-title">{title}</p>
        <p className="kpi-value">{formatValue()}</p>
      </div>
    </div>
  )
}

export default KpiCard
