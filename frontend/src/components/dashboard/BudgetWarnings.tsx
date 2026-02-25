import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { theme, getCategoryColor } from '../../styles/theme';

interface BudgetWarning {
  categoria_nome: string;
  categoria_icona?: string;
  limite: number;
  speso: number;
  percentuale: number;
}

interface BudgetWarningsProps {
  warnings: BudgetWarning[];
  loading?: boolean;
}

export default function BudgetWarnings({ warnings, loading = false }: BudgetWarningsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  const getSeverityColor = (percentage: number): string => {
    if (percentage >= 100) return theme.colors.danger;
    if (percentage >= 80) return theme.colors.warning;
    return theme.colors.success;
  };

  const getSeverityBadgeVariant = (percentage: number): 'danger' | 'warning' | 'success' => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Card header="⚠️ Budget Warnings" padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.lg,
          color: theme.colors.text.secondary 
        }}>
          Caricamento...
        </div>
      </Card>
    );
  }

  if (!warnings || warnings.length === 0) {
    return (
      <Card padding="lg">
        <div style={{ marginBottom: theme.spacing.md }}>
          <h3 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            ⚠️ Budget Status
          </h3>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing.md 
        }}>
          <CheckCircle size={48} color={theme.colors.success} />
          <div>
            <p style={{ 
              margin: 0,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary 
            }}>
              Tutti i budget sono sotto controllo!
            </p>
            <p style={{ 
              margin: `${theme.spacing.xs} 0 0 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary 
            }}>
              Nessun budget ha superato l'80%
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}>
          <AlertTriangle size={20} color={theme.colors.warning} />
          Budget Warnings
        </h3>
        <p style={{
          margin: `${theme.spacing.xs} 0 0 0`,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          {warnings.length} {warnings.length === 1 ? 'budget richiede' : 'budget richiedono'} attenzione
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {warnings.map((warning, index) => (
          <div 
            key={index}
            style={{
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.border.light}`,
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: theme.spacing.sm 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                <span style={{ fontSize: theme.typography.fontSize.xl }}>
                  {warning.categoria_icona || '💸'}
                </span>
                <span style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}>
                  {warning.categoria_nome}
                </span>
              </div>
              <Badge 
                variant={getSeverityBadgeVariant(warning.percentuale)} 
                size="sm"
              >
                {warning.percentuale.toFixed(0)}%
              </Badge>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: `${theme.colors.border.light}`,
              borderRadius: theme.borderRadius.full,
              overflow: 'hidden',
              marginBottom: theme.spacing.sm,
            }}>
              <div style={{
                width: `${Math.min(warning.percentuale, 100)}%`,
                height: '100%',
                backgroundColor: getSeverityColor(warning.percentuale),
                transition: `width ${theme.transitions.base}`,
              }} />
            </div>

            {/* Amount Info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary 
            }}>
              <span>Speso: {formatCurrency(warning.speso)}</span>
              <span>Limite: {formatCurrency(warning.limite)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
