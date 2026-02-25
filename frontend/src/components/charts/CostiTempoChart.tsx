import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { theme } from '../../styles/theme';

interface CostoTempo {
  periodo: string;
  costo: number;
}

interface CostiTempoChartProps {
  data: CostoTempo[];
  loading?: boolean;
  title?: string;
}

export default function CostiTempoChart({ 
  data, 
  loading = false,
  title = '📈 Costi nel Tempo'
}: CostiTempoChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Card header={title} padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          color: theme.colors.text.secondary 
        }}>
          Caricamento dati...
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card header={title} padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing.md
        }}>
          <div style={{ fontSize: '48px' }}>📉</div>
          <p style={{ margin: 0, color: theme.colors.text.secondary }}>
            Nessun costo registrato nel periodo selezionato
          </p>
        </div>
      </Card>
    );
  }

  // Calcola totale
  const totale = data.reduce((sum, item) => sum + item.costo, 0);
  const media = totale / data.length;

  return (
    <Card padding="lg">
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        }}>
          {title}
        </h3>
        <div style={{
          display: 'flex',
          gap: theme.spacing.xl,
          marginTop: theme.spacing.sm,
          flexWrap: 'wrap'
        }}>
          <div>
            <span style={{ 
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary
            }}>
              Totale periodo: 
            </span>
            <span style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginLeft: theme.spacing.xs
            }}>
              {formatCurrency(totale)}
            </span>
          </div>
          <div>
            <span style={{ 
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary
            }}>
              Media mensile: 
            </span>
            <span style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.primary.DEFAULT,
              marginLeft: theme.spacing.xs
            }}>
              {formatCurrency(media)}
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.light} />
          <XAxis 
            dataKey="periodo" 
            fontSize={12} 
            stroke={theme.colors.text.secondary}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            fontSize={12} 
            stroke={theme.colors.text.secondary}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: theme.colors.surface, 
              border: `1px solid ${theme.colors.border.light}`,
              borderRadius: theme.borderRadius.md
            }}
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="costo" 
            stroke={theme.colors.danger}
            strokeWidth={2}
            dot={{ fill: theme.colors.danger, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
