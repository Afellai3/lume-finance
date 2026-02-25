import { useState, useEffect } from 'react';
import { Plus, Wallet, CreditCard, PiggyBank, Building } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../styles/theme';

interface Conto {
  id: number;
  nome: string;
  tipo: string;
  saldo: number;
  banca?: string;
  numero?: string;
  note?: string;
}

function Conti() {
  const [conti, setConti] = useState<Conto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConti = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/conti');
      if (response.ok) {
        const data = await response.json();
        setConti(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConti();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'corrente': return <Wallet size={24} />;
      case 'risparmio': return <PiggyBank size={24} />;
      case 'carta': return <CreditCard size={24} />;
      default: return <Building size={24} />;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'corrente': return 'info';
      case 'risparmio': return 'success';
      case 'carta': return 'warning';
      default: return 'neutral';
    }
  };

  const totalBalance = conti.reduce((sum, c) => sum + c.saldo, 0);

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <div>
          <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Conti Bancari</h2>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            {conti.length} {conti.length === 1 ? 'conto' : 'conti'} attivi
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>Nuovo Conto</Button>
      </div>

      {/* Total Balance Card */}
      {conti.length > 0 && (
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Saldo Totale</p>
              <h3 style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize['3xl'], fontWeight: theme.typography.fontWeight.bold, color: totalBalance >= 0 ? theme.colors.success : theme.colors.danger }}>
                {formatCurrency(totalBalance)}
              </h3>
            </div>
            <Wallet size={48} color={theme.colors.primary.DEFAULT} style={{ opacity: 0.5 }} />
          </div>
        </Card>
      )}

      {/* Accounts List */}
      {conti.length === 0 ? (
        <Card padding="xl">
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
            <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🏛️</div>
            <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessun conto configurato</h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Aggiungi i tuoi conti bancari per iniziare</p>
            <Button variant="primary" leftIcon={<Plus size={16} />}>Aggiungi Conto</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: theme.spacing.md }}>
          {conti.map((conto) => (
            <Card key={conto.id} hoverable padding="lg">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: `${theme.colors.primary.DEFAULT}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.primary.DEFAULT
                }}>
                  {getIcon(conto.tipo)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xs }}>
                    <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                      {conto.nome}
                    </h4>
                    <Badge variant={getBadgeVariant(conto.tipo)} size="sm">{conto.tipo}</Badge>
                  </div>
                  {conto.banca && (
                    <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      {conto.banca}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border.light}` }}>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Saldo Disponibile</p>
                <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: conto.saldo >= 0 ? theme.colors.success : theme.colors.danger }}>
                  {formatCurrency(conto.saldo)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Conti;
