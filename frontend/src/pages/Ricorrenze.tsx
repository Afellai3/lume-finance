import { useState, useEffect } from 'react';
import { Plus, Play, Pause, Edit2, Trash2, Calendar, Repeat, Filter, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../styles/theme';
import RicorrenzeForm from '../components/ricorrenze/RicorrenzeForm';

interface Ricorrenza {
  id: number;
  descrizione: string;
  importo: number;
  tipo: 'entrata' | 'uscita';
  frequenza: 'giornaliera' | 'settimanale' | 'mensile' | 'annuale';
  prossima_data: string;
  attivo: boolean;
  conto_nome?: string;
  categoria_nome?: string;
  categoria_icona?: string;
  note?: string;
}

function Ricorrenze() {
  const [ricorrenze, setRicorrenze] = useState<Ricorrenza[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRicorrenza, setEditingRicorrenza] = useState<Ricorrenza | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    attivo: '',
    tipo: '',
    frequenza: ''
  });

  const fetchRicorrenze = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.attivo !== '') params.append('attivo', filters.attivo);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.frequenza) params.append('frequenza', filters.frequenza);

      const response = await fetch(`/api/ricorrenze?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRicorrenze(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRicorrenze();
  }, [filters]);

  const handleCreate = () => {
    setEditingRicorrenza(null);
    setShowForm(true);
  };

  const handleEdit = (ricorrenza: Ricorrenza) => {
    setEditingRicorrenza(ricorrenza);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRicorrenza(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchRicorrenze();
  };

  const handleToggle = async (id: number) => {
    try {
      const response = await fetch(`/api/ricorrenze/${id}/toggle`, { method: 'POST' });
      if (response.ok) fetchRicorrenze();
    } catch (error) {
      alert('Errore durante il toggle');
    }
  };

  const handleEsegui = async (id: number) => {
    if (!confirm('Eseguire manualmente questa ricorrenza?')) return;
    try {
      const response = await fetch(`/api/ricorrenze/${id}/esegui`, { method: 'POST' });
      if (response.ok) {
        alert('Movimento creato con successo!');
        fetchRicorrenze();
      }
    } catch (error) {
      alert('Errore durante l\'esecuzione');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa ricorrenza?')) return;
    try {
      const response = await fetch(`/api/ricorrenze/${id}`, { method: 'DELETE' });
      if (response.ok) fetchRicorrenze();
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getFrequenzaBadgeVariant = (freq: string): 'info' | 'success' | 'warning' | 'neutral' => {
    switch (freq) {
      case 'giornaliera': return 'info';
      case 'settimanale': return 'success';
      case 'mensile': return 'warning';
      case 'annuale': return 'neutral';
      default: return 'neutral';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <div>
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Movimenti Ricorrenti</h2>
            <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              {ricorrenze.length} {ricorrenze.length === 1 ? 'ricorrenza' : 'ricorrenze'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button 
              variant={showFilters ? 'primary' : 'secondary'} 
              size="sm" 
              leftIcon={<Filter size={16} />} 
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtri {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>
              Nuova Ricorrenza
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card padding="lg">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Stato</label>
                <select 
                  value={filters.attivo} 
                  onChange={(e) => setFilters({ ...filters, attivo: e.target.value })} 
                  style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
                >
                  <option value="">Tutti</option>
                  <option value="true">Attive</option>
                  <option value="false">In Pausa</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Tipo</label>
                <select 
                  value={filters.tipo} 
                  onChange={(e) => setFilters({ ...filters, tipo: e.target.value })} 
                  style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
                >
                  <option value="">Tutti</option>
                  <option value="entrata">Entrate</option>
                  <option value="uscita">Uscite</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Frequenza</label>
                <select 
                  value={filters.frequenza} 
                  onChange={(e) => setFilters({ ...filters, frequenza: e.target.value })} 
                  style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
                >
                  <option value="">Tutte</option>
                  <option value="giornaliera">Giornaliera</option>
                  <option value="settimanale">Settimanale</option>
                  <option value="mensile">Mensile</option>
                  <option value="annuale">Annuale</option>
                </select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({ attivo: '', tipo: '', frequenza: '' })}
                style={{ marginTop: theme.spacing.md }}
              >
                Rimuovi filtri
              </Button>
            )}
          </Card>
        )}

        {/* Ricorrenze List */}
        {ricorrenze.length === 0 ? (
          <Card padding="xl">
            <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🔄</div>
              <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessuna ricorrenza configurata</h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Automatizza entrate e uscite ricorrenti</p>
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>
                Crea Ricorrenza
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            {ricorrenze.map((ric) => (
              <Card key={ric.id} hoverable padding="lg" style={{ opacity: ric.attivo ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md, flex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: ric.tipo === 'entrata' ? `${theme.colors.success}20` : `${theme.colors.danger}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: ric.tipo === 'entrata' ? theme.colors.success : theme.colors.danger,
                      fontSize: theme.typography.fontSize['2xl']
                    }}>
                      {ric.categoria_icona || (ric.tipo === 'entrata' ? '💰' : '💸')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs, flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                          {ric.descrizione}
                        </h4>
                        <Badge variant={getFrequenzaBadgeVariant(ric.frequenza)} size="sm">
                          <Repeat size={12} style={{ marginRight: theme.spacing.xs }} />
                          {ric.frequenza}
                        </Badge>
                        {!ric.attivo && <Badge variant="neutral" size="sm">⏸️ Pausa</Badge>}
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing.md, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, flexWrap: 'wrap' }}>
                        <span>
                          <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          Prossima: {formatDate(ric.prossima_data)}
                        </span>
                        {ric.conto_nome && <span>• {ric.conto_nome}</span>}
                        {ric.categoria_nome && <span>• {ric.categoria_nome}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: theme.typography.fontSize.lg, 
                        fontWeight: theme.typography.fontWeight.bold, 
                        color: ric.tipo === 'entrata' ? theme.colors.success : theme.colors.danger 
                      }}>
                        {ric.tipo === 'entrata' ? '+' : '-'}{formatCurrency(Math.abs(ric.importo))}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        leftIcon={ric.attivo ? <Pause size={14} /> : <Play size={14} />} 
                        onClick={() => handleToggle(ric.id)}
                        title={ric.attivo ? 'Metti in pausa' : 'Riprendi'}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        leftIcon={<Play size={14} />} 
                        onClick={() => handleEsegui(ric.id)}
                        title="Esegui ora"
                      />
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={() => handleEdit(ric)} />
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => handleDelete(ric.id)} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <RicorrenzeForm
          ricorrenza={editingRicorrenza}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}

export default Ricorrenze;
