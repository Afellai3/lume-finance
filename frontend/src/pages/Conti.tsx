import { useState, useEffect } from 'react';
import { Plus, Wallet, CreditCard, PiggyBank, Building, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../styles/theme';
import ContoForm from '../components/ContoForm';

interface Conto {
  id: number;
  nome: string;
  tipo: string;
  saldo: number;
  valuta: string;
  attivo: boolean;
  banca?: string;
  numero?: string;
  descrizione?: string;
  note?: string;
}

function Conti() {
  const [conti, setConti] = useState<Conto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConto, setEditingConto] = useState<Conto | null>(null);

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

  const handleCreate = () => {
    setEditingConto(null);
    setShowForm(true);
  };

  const handleEdit = (conto: Conto) => {
    setEditingConto(conto);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingConto(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchConti();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo conto?')) return;
    try {
      const response = await fetch(`/api/conti/${id}`, { method: 'DELETE' });
      if (response.ok) fetchConti();
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'corrente': return <Wallet size={24} />;
      case 'risparmio': return <PiggyBank size={24} />;
      case 'carta_credito': return <CreditCard size={24} />;
      case 'carta': return <CreditCard size={24} />;
      default: return <Building size={24} />;
    }
  };

  const getBadgeVariant = (tipo: string): 'info' | 'success' | 'warning' | 'neutral' => {
    switch (tipo.toLowerCase()) {
      case 'corrente': return 'info';
      case 'risparmio': return 'success';
      case 'carta': case 'carta_credito': return 'warning';
      default: return 'neutral';
    }
  };

  const totalBalance = conti.reduce((sum, c) => sum + (c.saldo || 0), 0);

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <div>
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Conti Bancari</h2>
            <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              {conti.length} {conti.length === 1 ? 'conto' : 'conti'} attivi
            </p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>
            Nuovo Conto
          </Button>
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
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>
                Aggiungi Conto
              </Button>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border.light}` }}>
                  <div>
                    <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Saldo Disponibile</p>
                    <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: conto.saldo >= 0 ? theme.colors.success : theme.colors.danger }}>
                      {formatCurrency(conto.saldo)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                    <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={() => handleEdit(conto)} />
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => handleDelete(conto.id)} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal - ContoForm uses different interface */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <ContoForm
              conto={editingConto}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Conti;
