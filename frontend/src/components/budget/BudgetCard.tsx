import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

interface BudgetCardProps {
  budget: {
    id: number;
    categoria_nome: string;
    categoria_icona?: string;
    importo: number;
    spesa_corrente: number;
    rimanente: number;
    percentuale_utilizzo: number;
    stato: 'ok' | 'attenzione' | 'superato';
    periodo: string;
  };
  onClick?: () => void;
}

export default function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusConfig = (stato: string) => {
    switch (stato) {
      case 'superato':
        return {
          color: theme.colors.danger,
          icon: <AlertTriangle size={18} />,
          label: 'Superato',
          bgColor: `${theme.colors.danger}20`
        };
      case 'attenzione':
        return {
          color: theme.colors.warning,
          icon: <TrendingUp size={18} />,
          label: 'Attenzione',
          bgColor: `${theme.colors.warning}20`
        };
      default:
        return {
          color: theme.colors.success,
          icon: <CheckCircle size={18} />,
          label: 'Ok',
          bgColor: `${theme.colors.success}20`
        };
    }
  };

  const getProgressBarColor = () => {
    if (budget.stato === 'superato') return theme.colors.danger;
    if (budget.stato === 'attenzione') return theme.colors.warning;
    return theme.colors.primary.DEFAULT;
  };

  const statusConfig = getStatusConfig(budget.stato);
  const progressPercentage = Math.min(budget.percentuale_utilizzo, 100);

  return (
    <Card 
      hoverable={!!onClick}
      padding="lg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <div style={{
              fontSize: '24px',
              width: '40px',
              height: '40px',
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.colors.background,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {budget.categoria_icona || '💰'}
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary
              }}>
                {budget.categoria_nome}
              </h3>
              <p style={{ 
                margin: `${theme.spacing.xs} 0 0 0`,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                textTransform: 'capitalize'
              }}>
                {budget.periodo}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            borderRadius: theme.borderRadius.full,
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            {statusConfig.icon}
            {statusConfig.label}
          </div>
        </div>

        {/* Amounts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ 
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs
            }}>
              Speso
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: budget.stato === 'superato' ? theme.colors.danger : theme.colors.text.primary
            }}>
              {formatCurrency(budget.spesa_corrente)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs
            }}>
              Limite
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.secondary
            }}>
              {formatCurrency(budget.importo)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: theme.colors.border.light,
            borderRadius: theme.borderRadius.full,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: getProgressBarColor(),
              transition: `width ${theme.transitions.base}`,
              borderRadius: theme.borderRadius.full
            }} />
            
            {/* Overflow indicator if > 100% */}
            {budget.percentuale_utilizzo > 100 && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: '4px',
                backgroundColor: theme.colors.danger,
                animation: 'pulse 2s infinite'
              }} />
            )}
          </div>
          
          {/* Percentage and Remaining */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm
          }}>
            <span style={{ 
              fontWeight: theme.typography.fontWeight.medium,
              color: budget.stato === 'superato' ? theme.colors.danger : theme.colors.text.primary
            }}>
              {budget.percentuale_utilizzo.toFixed(1)}%
            </span>
            <span style={{ color: theme.colors.text.secondary }}>
              {budget.rimanente >= 0 ? 'Rimanenti: ' : 'Sforato: '}
              <strong style={{ color: budget.rimanente >= 0 ? theme.colors.success : theme.colors.danger }}>
                {formatCurrency(Math.abs(budget.rimanente))}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
