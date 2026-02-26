import { useState, useEffect } from 'react';
import { Plus, Wallet, CreditCard, PiggyBank, Building, Edit2, Trash2, ArrowRightLeft, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../styles/theme';
import ContoForm from '../components/ContoForm';
import TrasferimentoForm from '../components/conti/TrasferimentoForm';
import SaldoStoricoChart from '../components/conti/SaldoStoricoChart';
import { api } from '../config/api';

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

interface Movimento {
  id: number;
  data: string;
  importo: number;
  tipo: string;
  descrizione: string;
  categoria_nome?: string;
}

function Conti() {
  const [conti, setConti] = useState<Conto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTrasferimento, setShowTrasferimento] = useState(false);
  const [editingConto, setEditingConto] = useState<Conto | null>(null);
  const [expandedConto, setExpandedConto] = useState<number | null>(null);
  const [movimentiPerConto, setMovimentiPerConto] = useState<{ [key: number]: Movimento[] }>({});

  const fetchConti = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/conti');
      setConti(data);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovimentiConto = async (contoId: number) => {
    try {
      const data = await api.get(`/api/conti/${contoId}/movimenti?per_page=5`);
      setMovimentiPerConto(prev => ({ ...prev, [contoId]: data.items || [] }));
    } catch (error) {
      console.error('Errore caricamento movimenti:', error);
    }
  };

  useEffect(() => {
    fetchConti();
  }, []);

  useEffect(() => {
    if (expandedConto) {
      fetchMovimentiConto(expandedConto);
    }
  }, [expandedConto]);

  const handleCreate = () => {
    setEditingConto(null);
    setShowForm(true);
  };

  const handleEdit = (conto: Conto, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleTrasferimentoSuccess = () => {
    setShowTrasferimento(false);
    fetchConti();
    // Refresh expanded account if any
    if (expandedConto) {
      fetchMovimentiConto(expandedConto);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Eliminare questo conto?')) return;
    try {
      await api.delete(`/api/conti/${id}`);
      fetchConti();
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const toggleExpand = (contoId: number) => {
    setExpandedConto(expandedConto === contoId ? null : contoId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
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
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button 
              variant="secondary" 
              size="sm" 
              leftIcon={<ArrowRightLeft size={16} />} 
              onClick={() => setShowTrasferimento(true)}
              disabled={conti.length < 2}
            >
              Trasferimento
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>
              Nuovo Conto
            </Button>
          </div>
        </div>

        {/* Total Balance Card */}
        {conti.length > 0 && (
          <Card padding="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Patrimonio Totale</p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            {conti.map((conto) => (
              <div key={conto.id} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <Card 
                  hoverable 
                  padding="lg"
                  onClick={() => toggleExpand(conto.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: theme.borderRadius.lg,
                      backgroundColor: `${theme.colors.primary.DEFAULT}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.primary.DEFAULT,
                      flexShrink: 0
                    }}>
                      {getIcon(conto.tipo)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xs, flexWrap: 'wrap', gap: theme.spacing.sm }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                            {conto.nome}
                          </h4>
                          {conto.banca && (
                            <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                              {conto.banca}
                            </p>
                          )}
                        </div>
                        <Badge variant={getBadgeVariant(conto.tipo)} size="sm">{conto.tipo}</Badge>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md }}>
                        <div>
                          <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Saldo Disponibile</p>
                          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: conto.saldo >= 0 ? theme.colors.success : theme.colors.danger }}>
                            {formatCurrency(conto.saldo)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                          <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={(e) => handleEdit(conto, e)} />
                          <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={(e) => handleDelete(conto.id, e)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Expanded View */}
                {expandedConto === conto.id && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, paddingLeft: theme.spacing.lg }}>
                    {/* Balance History Chart */}
                    <SaldoStoricoChart contoId={conto.id} contoNome={conto.nome} />

                    {/* Recent Movements */}
                    {movimentiPerConto[conto.id] && movimentiPerConto[conto.id].length > 0 && (
                      <Card padding="lg">
                        <h3 style={{ 
                          margin: `0 0 ${theme.spacing.md} 0`, 
                          fontSize: theme.typography.fontSize.base,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary
                        }}>
                          📋 Ultimi Movimenti
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                          {movimentiPerConto[conto.id].map((mov) => (
                            <div
                              key={mov.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.md,
                                backgroundColor: theme.colors.background
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: theme.borderRadius.full,
                                  backgroundColor: mov.tipo === 'entrata' ? `${theme.colors.success}20` : `${theme.colors.danger}20`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: mov.tipo === 'entrata' ? theme.colors.success : theme.colors.danger
                                }}>
                                  {mov.tipo === 'entrata' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.primary }}>
                                    {mov.descrizione}
                                  </p>
                                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                                    {formatDate(mov.data)}
                                    {mov.categoria_nome && ` • ${mov.categoria_nome}`}
                                  </p>
                                </div>
                              </div>
                              <span style={{ 
                                fontSize: theme.typography.fontSize.base, 
                                fontWeight: theme.typography.fontWeight.semibold,
                                color: mov.tipo === 'entrata' ? theme.colors.success : theme.colors.danger
                              }}>
                                {mov.tipo === 'entrata' ? '+' : ''}{formatCurrency(mov.importo)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
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

      {/* Trasferimento Modal */}
      {showTrasferimento && (
        <TrasferimentoForm
          onSuccess={handleTrasferimentoSuccess}
          onCancel={() => setShowTrasferimento(false)}
        />
      )}
    </>
  );
}

export default Conti;
