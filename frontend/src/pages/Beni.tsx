import { useState, useEffect } from 'react';
import { Plus, Car, Home, Laptop, ShoppingBag } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../styles/theme';

interface Bene {
  id: number;
  nome: string;
  tipo: string;
  valore_acquisto: number;
  valore_corrente: number;
  data_acquisto: string;
  marca?: string;
  modello?: string;
  note?: string;
}

function Beni() {
  const [beni, setBeni] = useState<Bene[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBeni = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/beni');
      if (response.ok) {
        const data = await response.json();
        setBeni(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeni();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
  };

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'veicolo': return <Car size={24} />;
      case 'immobile': return <Home size={24} />;
      case 'elettronica': return <Laptop size={24} />;
      default: return <ShoppingBag size={24} />;
    }
  };

  const totalValue = beni.reduce((sum, b) => sum + b.valore_corrente, 0);
  const totalPurchase = beni.reduce((sum, b) => sum + b.valore_acquisto, 0);
  const depreciation = totalPurchase > 0 ? ((totalPurchase - totalValue) / totalPurchase) * 100 : 0;

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <div>
          <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Beni Patrimoniali</h2>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            {beni.length} {beni.length === 1 ? 'bene' : 'beni'} registrati
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>Aggiungi Bene</Button>
      </div>

      {/* Summary Card */}
      {beni.length > 0 && (
        <Card padding="lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: theme.spacing.lg }}>
            <div>
              <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Valore Totale</p>
              <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary.DEFAULT }}>
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Costo Acquisto</p>
              <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
                {formatCurrency(totalPurchase)}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Deprezzamento</p>
              <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: depreciation > 20 ? theme.colors.danger : theme.colors.warning }}>
                {depreciation.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Assets List */}
      {beni.length === 0 ? (
        <Card padding="xl">
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
            <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🚗</div>
            <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessun bene registrato</h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Inizia a tracciare il tuo patrimonio</p>
            <Button variant="primary" leftIcon={<Plus size={16} />}>Aggiungi Bene</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: theme.spacing.md }}>
          {beni.map((bene) => {
            const depr = bene.valore_acquisto > 0 ? ((bene.valore_acquisto - bene.valore_corrente) / bene.valore_acquisto) * 100 : 0;
            
            return (
              <Card key={bene.id} hoverable padding="lg">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
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
                    {getIcon(bene.tipo)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xs }}>
                      <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                        {bene.nome}
                      </h4>
                      <Badge variant="neutral" size="sm">{bene.tipo}</Badge>
                    </div>
                    {(bene.marca || bene.modello) && (
                      <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                        {bene.marca} {bene.modello}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border.light}` }}>
                  <div>
                    <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Valore Corrente</p>
                    <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
                      {formatCurrency(bene.valore_corrente)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{formatDate(bene.data_acquisto)}</p>
                    <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: depr > 20 ? theme.colors.danger : theme.colors.warning }}>
                      {depr > 0 ? `-${depr.toFixed(0)}%` : 'Stabile'}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Beni;
