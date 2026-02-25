import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

interface SaldoStoricoChartProps {
  contoId: number;
  contoNome?: string;
}

type Period = '7d' | '30d' | '90d' | '365d' | 'all';

interface DataPoint {
  data: string;
  saldo: number;
}

function SaldoStoricoChart({ contoId, contoNome }: SaldoStoricoChartProps) {
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saldoCorrente, setSaldoCorrente] = useState(0);

  useEffect(() => {
    fetchData();
  }, [contoId, period]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/conti/${contoId}/saldo-storico?periodo=${period}`);
      
      if (!response.ok) throw new Error('Errore caricamento dati');
      
      const result = await response.json();
      setData(result.punti || []);
      setSaldoCorrente(result.saldo_corrente || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  };

  const periodLabels: Record<Period, string> = {
    '7d': '7 giorni',
    '30d': '30 giorni',
    '90d': '90 giorni',
    '365d': '1 anno',
    'all': 'Tutto'
  };

  // Calculate trend
  const trend = data.length >= 2 ? data[data.length - 1].saldo - data[0].saldo : 0;
  const trendColor = trend >= 0 ? theme.colors.success : theme.colors.danger;

  return (
    <Card padding="lg">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: theme.spacing.lg,
        flexWrap: 'wrap',
        gap: theme.spacing.md
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary
          }}>
            📈 Evoluzione Saldo{contoNome && `: ${contoNome}`}
          </h3>
          <p style={{ 
            margin: `${theme.spacing.xs} 0 0 0`,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary
          }}>
            Saldo corrente: <strong style={{ color: theme.colors.text.primary }}>{formatCurrency(saldoCorrente)}</strong>
          </p>
          {data.length >= 2 && (
            <p style={{ 
              margin: `${theme.spacing.xs} 0 0 0`,
              fontSize: theme.typography.fontSize.sm,
              color: trendColor
            }}>
              Variazione: <strong>{trend >= 0 ? '+' : ''}{formatCurrency(trend)}</strong>
            </p>
          )}
        </div>

        {/* Period Filter */}
        <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
          {(Object.keys(periodLabels) as Period[]).map(p => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: `${theme.spacing.xl} 0`,
          color: theme.colors.text.secondary
        }}>
          <div style={{ fontSize: '32px', marginBottom: theme.spacing.sm }}>⏳</div>
          <p>Caricamento grafico...</p>
        </div>
      ) : error ? (
        <div style={{ 
          textAlign: 'center', 
          padding: `${theme.spacing.xl} 0`,
          color: theme.colors.danger
        }}>
          <p>{error}</p>
          <Button variant="primary" size="sm" onClick={fetchData} style={{ marginTop: theme.spacing.md }}>
            Riprova
          </Button>
        </div>
      ) : data.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: `${theme.spacing.xl} 0`,
          color: theme.colors.text.secondary
        }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.sm }}>📉</div>
          <p>Nessun dato disponibile per il periodo selezionato</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.light} />
            <XAxis 
              dataKey="data" 
              fontSize={12} 
              stroke={theme.colors.text.secondary}
              tickFormatter={formatDate}
            />
            <YAxis 
              fontSize={12} 
              stroke={theme.colors.text.secondary}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.colors.surface, 
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.sm
              }}
              formatter={(value: number) => [formatCurrency(value), 'Saldo']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('it-IT', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke={theme.colors.primary.DEFAULT}
              strokeWidth={2}
              dot={{ fill: theme.colors.primary.DEFAULT, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default SaldoStoricoChart;
