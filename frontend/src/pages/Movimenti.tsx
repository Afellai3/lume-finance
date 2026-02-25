import { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter, X, Edit2, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { theme, getCategoryColor } from '../styles/theme';
import MovimentoForm from '../components/forms/MovimentoForm';
import MovimentoDetailModal from '../components/MovimentoDetailModal';

interface Movimento {
  id: number;
  descrizione: string;
  importo: number;
  data: string;
  tipo: 'entrata' | 'uscita';
  categoria_id?: number;
  categoria_nome?: string;
  conto_id?: number;
  conto_nome?: string;
  note?: string;
  icona?: string;
  budget_id?: number;
  budget_categoria_nome?: string;
  obiettivo_id?: number;
  obiettivo_nome?: string;
  obiettivo_target?: number;
  bene_id?: number;
  bene_nome?: string;
  bene_tipo?: string;
  km_percorsi?: number;
  ore_utilizzo?: number;
  categoria_icona?: string;
  ricorrente?: boolean;
}

interface Categoria {
  id: number;
  nome: string;
  icona: string;
  colore: string;
}

interface Conto {
  id: number;
  nome: string;
  tipo: string;
}

interface Filters {
  search: string;
  tipo: string;
  categoria_id: string;
  conto_id: string;
  data_da: string;
  data_a: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

function Movimenti() {
  const [movimenti, setMovimenti] = useState<Movimento[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0,
  });
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [conti, setConti] = useState<Conto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMovimento, setEditingMovimento] = useState<Movimento | null>(null);
  const [selectedMovimento, setSelectedMovimento] = useState<Movimento | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    tipo: '',
    categoria_id: '',
    conto_id: '',
    data_da: '',
    data_a: ''
  });

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    try {
      const [movRes, catRes, contiRes] = await Promise.all([
        fetch(`/api/movimenti?page=${page}&per_page=${pagination.per_page}`),
        fetch('/api/movimenti/categorie'),
        fetch('/api/conti')
      ]);

      if (movRes.ok) {
        const data = await movRes.json();
        setMovimenti(data.items || []);
        setPagination({
          total: data.total || 0,
          page: data.page || 1,
          per_page: data.per_page || 20,
          total_pages: data.total_pages || 0,
        });
      }
      if (catRes.ok) setCategorie(await catRes.json());
      if (contiRes.ok) setConti(await contiRes.json());
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [filters]);

  const handleCreate = () => {
    setEditingMovimento(null);
    setShowForm(true);
  };

  const handleEdit = (movimento: Movimento, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    setEditingMovimento(movimento);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMovimento(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchData(pagination.page);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/movimenti/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `movimenti_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Errore durante l\'esportazione');
      console.error('Export error:', error);
    }
  };

  const handleCardClick = (movimento: Movimento) => {
    setSelectedMovimento(movimento);
  };

  const filteredMovimenti = movimenti.filter(m => {
    if (filters.search && !m.descrizione.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.tipo && m.tipo !== filters.tipo) return false;
    if (filters.categoria_id && m.categoria_id?.toString() !== filters.categoria_id) return false;
    if (filters.conto_id && m.conto_id?.toString() !== filters.conto_id) return false;
    if (filters.data_da && m.data < filters.data_da) return false;
    if (filters.data_a && m.data > filters.data_a) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length - (filters.search ? 1 : 0);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (!confirm('Eliminare questo movimento?')) return;
    try {
      const response = await fetch(`/api/movimenti/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData(pagination.page);
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing['2xl'] }}>
        <p style={{ color: theme.colors.text.secondary }}>Caricamento...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Header with Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Movimenti</h2>
            <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              {pagination.total} {pagination.total === 1 ? 'movimento' : 'movimenti'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} onClick={handleExport}>Esporta</Button>
            <Button variant={showFilters ? 'primary' : 'secondary'} size="sm" leftIcon={<Filter size={16} />} onClick={() => setShowFilters(!showFilters)}>
              Filtri {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>Nuovo</Button>
          </div>
        </div>

        {/* Search Bar */}
        <Input
          placeholder="Cerca movimenti..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          leftIcon={<Search size={18} />}
          fullWidth
        />

        {/* Filter Chips */}
        {activeFiltersCount > 0 && (
          <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Filtri attivi:</span>
            {filters.tipo && (
              <Badge variant={filters.tipo === 'entrata' ? 'success' : 'danger'}>
                {filters.tipo === 'entrata' ? 'Entrate' : 'Uscite'}
                <X size={14} style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} onClick={() => setFilters({ ...filters, tipo: '' })} />
              </Badge>
            )}
            {filters.categoria_id && (
              <Badge variant="info">
                {categorie.find(c => c.id.toString() === filters.categoria_id)?.nome || 'Categoria'}
                <X size={14} style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} onClick={() => setFilters({ ...filters, categoria_id: '' })} />
              </Badge>
            )}
            {(filters.data_da || filters.data_a) && (
              <Badge variant="neutral">
                <Calendar size={12} style={{ marginRight: theme.spacing.xs }} />
                {filters.data_da && formatDate(filters.data_da)}{filters.data_da && filters.data_a && ' - '}{filters.data_a && formatDate(filters.data_a)}
                <X size={14} style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} onClick={() => setFilters({ ...filters, data_da: '', data_a: '' })} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => setFilters({ search: filters.search, tipo: '', categoria_id: '', conto_id: '', data_da: '', data_a: '' })}>
              Rimuovi tutti
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Card padding="lg">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Tipo</label>
                <select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })} style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}`, fontSize: theme.typography.fontSize.sm }}>
                  <option value="">Tutti</option>
                  <option value="entrata">Entrate</option>
                  <option value="uscita">Uscite</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Data da</label>
                <Input type="date" value={filters.data_da} onChange={(e) => setFilters({ ...filters, data_da: e.target.value })} fullWidth />
              </div>
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Data a</label>
                <Input type="date" value={filters.data_a} onChange={(e) => setFilters({ ...filters, data_a: e.target.value })} fullWidth />
              </div>
            </div>
          </Card>
        )}

        {/* Movements List */}
        {filteredMovimenti.length === 0 ? (
          <Card padding="xl">
            <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>💸</div>
              <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessun movimento trovato</h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Inizia aggiungendo il tuo primo movimento</p>
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>Aggiungi Movimento</Button>
            </div>
          </Card>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {filteredMovimenti.map((movimento) => (
                <Card 
                  key={movimento.id} 
                  hoverable 
                  padding="md"
                  onClick={() => handleCardClick(movimento)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.md }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: theme.borderRadius.full, backgroundColor: `${getCategoryColor(movimento.categoria_nome || 'altro')}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: theme.typography.fontSize['2xl'] }}>
                        {movimento.icona || (movimento.tipo === 'entrata' ? '⬆️' : '⬇️')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>{movimento.descrizione}</h4>
                        <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>{formatDate(movimento.data)}</span>
                          {movimento.categoria_nome && <Badge category={movimento.categoria_nome} size="sm">{movimento.categoria_nome}</Badge>}
                          {movimento.conto_nome && <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>• {movimento.conto_nome}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                      <span style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: movimento.tipo === 'entrata' ? theme.colors.success : theme.colors.danger }}>
                        {movimento.tipo === 'entrata' ? '+' : '-'}{formatCurrency(Math.abs(movimento.importo))}
                      </span>
                      <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                        <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={(e) => handleEdit(movimento, e)} />
                        <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={(e) => handleDelete(movimento.id, e)} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: theme.spacing.lg,
                padding: theme.spacing.lg,
              }}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ChevronLeft size={16} />}
                  onClick={handlePreviousPage}
                  disabled={pagination.page === 1}
                >
                  Precedente
                </Button>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: theme.spacing.xs 
                }}>
                  <span style={{ 
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}>
                    Pagina {pagination.page} di {pagination.total_pages}
                  </span>
                  <span style={{ 
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                  }}>
                    {pagination.total} movimenti totali
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ChevronRight size={16} />}
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.total_pages}
                >
                  Successiva
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <MovimentoForm
          movimento={editingMovimento}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Detail Modal */}
      {selectedMovimento && (
        <MovimentoDetailModal
          movimento={selectedMovimento}
          onClose={() => setSelectedMovimento(null)}
        />
      )}
    </>
  );
}

export default Movimenti;
