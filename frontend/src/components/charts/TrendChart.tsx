import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { theme } from '../../styles/theme';
import { Card } from '../ui/Card';

interface TrendDataPoint {
  periodo: string; // 'Gen 2026', 'Feb 2026', etc.
  entrate: number;
  uscite: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

export default function TrendChart({ data, loading = false }: TrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          boxShadow: theme.shadows.lg,
          border: `1px solid ${theme.colors.border.light}`,
        }}>
          <p style={{ 
            margin: 0, 
            marginBottom: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary 
          }}>
            {payload[0].payload.periodo}
          </p>
          <p style={{ 
            margin: 0, 
            color: theme.colors.success,
            fontSize: theme.typography.fontSize.sm 
          }}>
            Entrate: {formatCurrency(payload[0].value)}
          </p>
          <p style={{ 
            margin: 0, 
            color: theme.colors.danger,
            fontSize: theme.typography.fontSize.sm 
          }}>
            Uscite: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card header="📊 Trend Entrate/Uscite" padding="lg">
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: theme.colors.text.secondary 
        }}>
          Caricamento...
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card header="📊 Trend Entrate/Uscite" padding="lg">
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          color: theme.colors.text.secondary,
          gap: theme.spacing.sm 
        }}>
          <div style={{ fontSize: '48px' }}>📊</div>
          <p style={{ margin: 0 }}>Nessun dato disponibile per il periodo selezionato</p>
        </div>
      </Card>
    );
  }

  return (
    <Card header="📊 Trend Entrate/Uscite" padding="lg">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.light} />
          <XAxis 
            dataKey="periodo" 
            stroke={theme.colors.text.secondary}
            style={{
              fontSize: theme.typography.fontSize.xs,
              fontFamily: theme.typography.fontFamily.sans
            }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            stroke={theme.colors.text.secondary}
            style={{
              fontSize: theme.typography.fontSize.xs,
              fontFamily: theme.typography.fontFamily.sans
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily.sans,
              paddingTop: theme.spacing.md
            }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="entrate" 
            name="Entrate"
            stroke={theme.colors.success} 
            strokeWidth={2}
            dot={{ fill: theme.colors.success, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="uscite" 
            name="Uscite"
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
