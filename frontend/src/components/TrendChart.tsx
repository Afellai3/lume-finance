import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import './TrendChart.css'

Chart.register(...registerables)

interface TrendData {
  mese: string
  mese_label: string
  entrate: number
  uscite: number
  saldo: number
}

interface TrendChartProps {
  data: TrendData[]
}

function TrendChart({ data }: TrendChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Distruggi chart precedente
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.mese_label),
        datasets: [
          {
            label: 'Entrate',
            data: data.map(d => d.entrate),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Uscite',
            data: data.map(d => d.uscite),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 13,
                weight: '600'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || ''
                if (label) {
                  label += ': '
                }
                label += new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(context.parsed.y)
                return label
              },
              footer: function(tooltipItems) {
                const index = tooltipItems[0].dataIndex
                const saldo = data[index].saldo
                const saldoStr = new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(saldo)
                return `Saldo: ${saldoStr}`
              }
            },
            footerFont: {
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(value as number)
              },
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="trend-chart-empty">
        <p>📊 Nessun dato disponibile per il trend</p>
      </div>
    )
  }

  return (
    <div className="trend-chart-container">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default TrendChart
