import { useState, useEffect } from 'react';
import { Plus, Car, Home, Laptop, ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../styles/theme';
import BeneForm from '../components/BeneForm';

interface Bene {
  id: number;
  nome: string;
  tipo: string;
  prezzo_acquisto: number;
  valore_acquisto?: number;
  valore_corrente?: number;
  valore_attuale?: number;
  data_acquisto: string;
  marca?: string;
  modello?: string;
  note?: string;
  durata_anni_stimata?: number;
  tasso_ammortamento?: number;
  veicolo_tipo_carburante?: string;
  veicolo_consumo_medio?: number;
  veicolo_costo_manutenzione_per_km?: number;
  elettrodomestico_potenza?: number;
  elettrodomestico_ore_medie_giorno?: number;
}

function Beni() {
  const [beni, setBeni] = useState<Bene[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBene, setEditingBene] = useState<Bene | null>(null);

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

  const handleCreate = () => {
    setEditingBene(null);
    setShowForm(true);
  };

  const handleEdit = (bene: Bene) => {
    setEditingBene(bene);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBene(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchBeni();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo bene?')) return;
    try {
      const response = await fetch(`/api/beni/${id}`, { method: 'DELETE' });
      if (response.ok) fetchBeni();
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

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
      case 'elettrodomestico': return <Laptop size={24} />;
      default: return <ShoppingBag size={24} />;
    }
  };

  const totalValue = beni.reduce((sum, b) => sum + (b.valore_corrente || b.valore_attuale || 0), 0);
  const totalPurchase = beni.reduce((sum, b) => sum + (b.valore_acquisto || b.prezzo_acquisto || 0), 0);
  const depreciation = totalPurchase > 0 ? ((totalPurchase - totalValue) / totalPurchase) * 100 : 0;

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <div>
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Beni Patrimoniali</h2>
            <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              {beni.length} {beni.length === 1 ? 'bene' : 'beni'} registrati
            </p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>
            Aggiungi Bene
          </Button>
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
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>
                Aggiungi Bene
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: theme.spacing.md }}>
            {beni.map((bene) => {
              const valoreAcq = bene.valore_acquisto || bene.prezzo_acquisto || 0;
              const valoreCurr = bene.valore_corrente || bene.valore_attuale || 0;
              const depr = valoreAcq > 0 ? ((valoreAcq - valoreCurr) / valoreAcq) * 100 : 0;
              
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
                        {formatCurrency(valoreCurr)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                      <div>
                        <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{formatDate(bene.data_acquisto)}</p>
                        <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: depr > 20 ? theme.colors.danger : theme.colors.warning }}>
                          {depr > 0 ? `-${depr.toFixed(0)}%` : 'Stabile'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                        <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={() => handleEdit(bene)} />
                        <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => handleDelete(bene.id)} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <BeneForm
          bene={editingBene}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}

export default Beni;
