import { Card } from '../ui/Card';
import { theme } from '../../styles/theme';

interface Contributo {
  id: number;
  data: string;
  importo: number;
  descrizione: string;
  conto_nome?: string;
  categoria_nome?: string;
}

interface ContributiListProps {
  contributi: Contributo[];
  totale: number;
}

export default function ContributiList({ contributi, totale }: ContributiListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (contributi.length === 0) {
    return (
      <Card padding="xl">
        <div style={{ textAlign: 'center', color: theme.colors.text.secondary }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>💸</div>
          <p style={{ margin: 0 }}>Nessun contributo ancora</p>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm }}>
            Aggiungi una entrata e collegala a questo obiettivo
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card header={`💸 Contributi (${contributi.length})`} padding="md">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {contributi.map((contrib, index) => (
          <div
            key={contrib.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: theme.spacing.md,
              borderBottom: index < contributi.length - 1 ? `1px solid ${theme.colors.border.light}` : 'none',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: theme.typography.fontWeight.medium, 
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs
              }}>
                {contrib.descrizione}
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: theme.colors.text.secondary 
              }}>
                {formatDate(contrib.data)}
                {contrib.conto_nome && ` • ${contrib.conto_nome}`}
              </div>
            </div>
            <div style={{ 
              fontWeight: theme.typography.fontWeight.bold, 
              color: theme.colors.success,
              fontSize: theme.typography.fontSize.lg
            }}>
              +{formatCurrency(contrib.importo)}
            </div>
          </div>
        ))}
        
        {/* Total */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing.md,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          marginTop: theme.spacing.sm
        }}>
          <div style={{ 
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary
          }}>
            Totale Contributi
          </div>
          <div style={{ 
            fontWeight: theme.typography.fontWeight.bold, 
            color: theme.colors.success,
            fontSize: theme.typography.fontSize.xl
          }}>
            {formatCurrency(totale)}
          </div>
        </div>
      </div>
    </Card>
  );
}
