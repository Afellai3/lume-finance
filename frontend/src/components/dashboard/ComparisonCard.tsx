import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

interface ComparisonData {
  periodo_corrente: {
    label: string; // 'Febbraio 2026'
    entrate: number;
    uscite: number;
    bilancio: number;
  };
  periodo_precedente: {
    label: string; // 'Gennaio 2026'
    entrate: number;
    uscite: number;
    bilancio: number;
  };
}

interface ComparisonCardProps {
  data: ComparisonData | null;
  loading?: boolean;
}

export default function ComparisonCard({ data, loading = false }: ComparisonCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  const calculateChange = (current: number, previous: number): { value: number; percentage: number } => {
    const diff = current - previous;
    const percentage = previous !== 0 ? (diff / previous) * 100 : 0;
    return { value: diff, percentage };
  };

  const renderChangeIndicator = (change: { value: number; percentage: number }, isIncome: boolean = true) => {
    const isPositive = isIncome ? change.value > 0 : change.value < 0; // For expenses, negative is good
    const color = isPositive ? theme.colors.success : theme.colors.danger;
    const Icon = change.value > 0 ? TrendingUp : TrendingDown;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: theme.spacing.xs,
        color 
      }}>
        <Icon size={16} />
        <span style={{ 
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold 
        }}>
          {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card header="📊 Confronto Periodo" padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          color: theme.colors.text.secondary 
        }}>
          Caricamento...
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card header="📊 Confronto Periodo" padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          color: theme.colors.text.secondary 
        }}>
          Nessun dato disponibile
        </div>
      </Card>
    );
  }

  const entrateChange = calculateChange(data.periodo_corrente.entrate, data.periodo_precedente.entrate);
  const usciteChange = calculateChange(data.periodo_corrente.uscite, data.periodo_precedente.uscite);
  const bilancioChange = calculateChange(data.periodo_corrente.bilancio, data.periodo_precedente.bilancio);

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} 0`,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  return (
    <Card padding="lg">
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        }}>
          📊 Confronto Periodo
        </h3>
        <p style={{
          margin: `${theme.spacing.xs} 0 0 0`,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          {data.periodo_corrente.label} vs {data.periodo_precedente.label}
        </p>
      </div>

      {/* Entrate */}
      <div style={rowStyle}>
        <div>
          <div style={{ 
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xs 
          }}>
            Entrate
          </div>
          <div style={{ 
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.success 
          }}>
            {formatCurrency(data.periodo_corrente.entrate)}
          </div>
        </div>
        {renderChangeIndicator(entrateChange, true)}
      </div>

      {/* Uscite */}
      <div style={rowStyle}>
        <div>
          <div style={{ 
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xs 
          }}>
            Uscite
          </div>
          <div style={{ 
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.danger 
          }}>
            {formatCurrency(Math.abs(data.periodo_corrente.uscite))}
          </div>
        </div>
        {renderChangeIndicator(usciteChange, false)}
      </div>

      {/* Bilancio */}
      <div style={{ 
        ...rowStyle, 
        borderBottom: 'none',
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.sm,
        borderTop: `2px solid ${theme.colors.border.DEFAULT}` 
      }}>
        <div>
          <div style={{ 
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xs 
          }}>
            Bilancio
          </div>
          <div style={{ 
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: data.periodo_corrente.bilancio >= 0 ? theme.colors.success : theme.colors.danger 
          }}>
            {formatCurrency(data.periodo_corrente.bilancio)}
          </div>
        </div>
        {renderChangeIndicator(bilancioChange, true)}
      </div>
    </Card>
  );
}
