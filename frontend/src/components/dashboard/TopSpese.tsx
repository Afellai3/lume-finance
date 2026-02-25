import { Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

interface TopSpesa {
  id: number;
  descrizione: string;
  importo: number;
  data: string;
  categoria_nome?: string;
  categoria_icona?: string;
}

interface TopSpeseProps {
  spese: TopSpesa[];
  loading?: boolean;
  limit?: number;
}

export default function TopSpese({ spese, loading = false, limit = 5 }: TopSpeseProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getRankEmoji = (rank: number): string => {
    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    return emojis[rank - 1] || `${rank}️⃣`;
  };

  if (loading) {
    return (
      <Card header="🔥 Top Spese" padding="lg">
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

  if (!spese || spese.length === 0) {
    return (
      <Card header="🔥 Top Spese" padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          color: theme.colors.text.secondary,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing.sm 
        }}>
          <div style={{ fontSize: '48px' }}>💸</div>
          <p style={{ margin: 0 }}>Nessuna spesa nel periodo selezionato</p>
        </div>
      </Card>
    );
  }

  const displaySpese = spese.slice(0, limit);

  return (
    <Card padding="lg">
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        }}>
          🔥 Top {limit} Spese del Periodo
        </h3>
        <p style={{
          margin: `${theme.spacing.xs} 0 0 0`,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          Le spese più significative
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        {displaySpese.map((spesa, index) => (
          <div
            key={spesa.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.md,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.border.light}`,
              transition: `all ${theme.transitions.base}`,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.md;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Rank */}
            <div style={{
              fontSize: theme.typography.fontSize['2xl'],
              minWidth: '32px',
              textAlign: 'center',
            }}>
              {getRankEmoji(index + 1)}
            </div>

            {/* Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.danger + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: theme.typography.fontSize.xl,
            }}>
              {spesa.categoria_icona || '💸'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {spesa.descrizione}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: theme.spacing.sm,
                flexWrap: 'wrap' 
              }}>
                {spesa.categoria_nome && (
                  <Badge category={spesa.categoria_nome} size="sm">
                    {spesa.categoria_nome}
                  </Badge>
                )}
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Calendar size={12} />
                  {formatDate(spesa.data)}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.danger,
              whiteSpace: 'nowrap',
            }}>
              {formatCurrency(Math.abs(spesa.importo))}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {displaySpese.length > 0 && (
        <div style={{
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          borderTop: `2px solid ${theme.colors.border.DEFAULT}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Totale Top {displaySpese.length}
          </span>
          <span style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.danger,
          }}>
            {formatCurrency(displaySpese.reduce((sum, s) => sum + Math.abs(s.importo), 0))}
          </span>
        </div>
      )}
    </Card>
  );
}
