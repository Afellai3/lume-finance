import { Target, Calendar, TrendingUp, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { theme } from '../../styles/theme';

interface ObiettivoCardProps {
  obiettivo: {
    id: number;
    nome: string;
    descrizione?: string;
    importo_target: number;
    importo_attuale: number;
    percentuale_completamento: number;
    data_target?: string;
    giorni_rimanenti?: number;
    priorita: number;
    velocita_risparmio_mensile: number;
    categoria_nome?: string;
    categoria_icona?: string;
  };
  onClick?: () => void;
}

export default function ObiettivoCard({ obiettivo, onClick }: ObiettivoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderPriorityStars = () => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={14}
            fill={i <= obiettivo.priorita ? theme.colors.warning : 'none'}
            color={i <= obiettivo.priorita ? theme.colors.warning : theme.colors.border.DEFAULT}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = () => {
    if (obiettivo.percentuale_completamento >= 100) return theme.colors.success;
    if (obiettivo.giorni_rimanenti && obiettivo.giorni_rimanenti < 0) return theme.colors.danger;
    if (obiettivo.percentuale_completamento >= 75) return theme.colors.primary.DEFAULT;
    if (obiettivo.percentuale_completamento >= 50) return theme.colors.info;
    return theme.colors.text.secondary;
  };

  const progressPercentage = Math.min(obiettivo.percentuale_completamento, 100);

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
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
              <Target size={20} color={theme.colors.primary.DEFAULT} />
              <h3 style={{ 
                margin: 0, 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary
              }}>
                {obiettivo.nome}
              </h3>
            </div>
            {obiettivo.descrizione && (
              <p style={{ 
                margin: 0,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                {obiettivo.descrizione}
              </p>
            )}
          </div>
          {renderPriorityStars()}
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
            <span style={{ 
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary
            }}>
              {formatCurrency(obiettivo.importo_attuale)}
            </span>
            <span style={{ 
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary
            }}>
              / {formatCurrency(obiettivo.importo_target)}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: theme.colors.border.light,
            borderRadius: theme.borderRadius.full,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: getStatusColor(),
              transition: `width ${theme.transitions.base}`,
              borderRadius: theme.borderRadius.full
            }} />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm
          }}>
            <span style={{ fontWeight: theme.typography.fontWeight.medium, color: getStatusColor() }}>
              {obiettivo.percentuale_completamento.toFixed(1)}%
            </span>
            <span style={{ color: theme.colors.text.secondary }}>
              Mancano: {formatCurrency(obiettivo.importo_target - obiettivo.importo_attuale)}
            </span>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          paddingTop: theme.spacing.sm,
          borderTop: `1px solid ${theme.colors.border.light}`,
          fontSize: theme.typography.fontSize.sm
        }}>
          {obiettivo.data_target && (
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
              <Calendar size={14} color={theme.colors.text.secondary} />
              <span style={{ color: theme.colors.text.secondary }}>
                {obiettivo.giorni_rimanenti !== null && obiettivo.giorni_rimanenti >= 0
                  ? `${obiettivo.giorni_rimanenti} giorni`
                  : obiettivo.giorni_rimanenti !== null && obiettivo.giorni_rimanenti < 0
                  ? `Scaduto ${Math.abs(obiettivo.giorni_rimanenti)} giorni fa`
                  : 'Nessuna scadenza'
                }
              </span>
            </div>
          )}
          {obiettivo.velocita_risparmio_mensile > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
              <TrendingUp size={14} color={theme.colors.success} />
              <span style={{ color: theme.colors.text.secondary }}>
                {formatCurrency(obiettivo.velocita_risparmio_mensile)}/mese
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
