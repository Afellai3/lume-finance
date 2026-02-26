import { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter, X, Edit2, Trash2, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { theme, getCategoryColor } from '../styles/theme';
import MovimentoForm from '../components/forms/MovimentoForm';
import MovimentoDetailModal from '../components/MovimentoDetailModal';
import { api } from '../config/api';

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
  importo_min: string;
  importo_max: string;
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
    data_a: '',
    importo_min: '',
    importo_max: '',
  });

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    try {
      const [movData, catData, contiData] = await Promise.all([
        api.get(`/api/movimenti?page=${page}&per_page=${pagination.per_page}`),
        api.get('/api/movimenti/categorie'),
        api.get('/api/conti')
      ]);

      setMovimenti(movData.items || []);
      setPagination({
        total: movData.total || 0,
        page: movData.page || 1,
        per_page: movData.per_page || 20,
        total_pages: movData.total_pages || 0,
      });
      setCategorie(catData);
      setConti(contiData);
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore di connessione al backend. Verifica che sia avviato.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page]);

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
    e.stopPropagation();
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
      const response = await fetch(`${api.get === undefined ? '' : await api.getUrl()}/api/movimenti/export`);
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
    // Search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const haystack = `${m.descrizione} ${m.categoria_nome || ''} ${m.note || ''} ${m.conto_nome || ''}`.toLowerCase();
      if (!haystack.includes(searchLower)) return false;
    }
    
    // Type
    if (filters.tipo && m.tipo !== filters.tipo) return false;
    
    // Category
    if (filters.categoria_id && m.categoria_id?.toString() !== filters.categoria_id) return false;
    
    // Account
    if (filters.conto_id && m.conto_id?.toString() !== filters.conto_id) return false;
    
    // Date from
    if (filters.data_da && m.data < filters.data_da) return false;
    
    // Date to
    if (filters.data_a && m.data > filters.data_a) return false;
    
    // Amount min
    if (filters.importo_min) {
      const min = parseFloat(filters.importo_min);
      if (!isNaN(min) && Math.abs(m.importo) < min) return false;
    }
    
    // Amount max
    if (filters.importo_max) {
      const max = parseFloat(filters.importo_max);
      if (!isNaN(max) && Math.abs(m.importo) > max) return false;
    }
    
    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => key !== 'search' && value).length;

  const clearAllFilters = () => {
    setFilters({
      search: '',
      tipo: '',
      categoria_id: '',
      conto_id: '',
      data_da: '',
      data_a: '',
      importo_min: '',
      importo_max: '',
    });
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Eliminare questo movimento?')) return;
    try {
      await api.delete(`/api/movimenti/${id}`);
      fetchData(pagination.page);
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
              {filteredMovimenti.length !== pagination.total 
                ? `${filteredMovimenti.length} di ${pagination.total} movimenti` 
                : `${pagination.total} ${pagination.total === 1 ? 'movimento' : 'movimenti'}`
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" leftIcon={<Download size={16} />} onClick={handleExport}>Esporta</Button>
            <Button 
              variant={showFilters ? 'primary' : 'secondary'} 
              size="sm" 
              leftIcon={<Filter size={16} />} 
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtri {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>Nuovo</Button>
          </div>
        </div>

        {/* Search Bar */}
        <Input
          placeholder="Cerca per descrizione, categoria, note o conto..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          leftIcon={<Search size={18} />}
          fullWidth
        />

        {/* Filters Panel */}
        {showFilters && (
          <Card padding="lg">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: theme.spacing.md }}>
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Tipo</label>
                <select 
                  value={filters.tipo} 
                  onChange={(e) => setFilters({ ...filters, tipo: e.target.value })} 
                  style={{ 
                    width: '100%', 
                    padding: theme.spacing.sm, 
                    borderRadius: theme.borderRadius.md, 
                    border: `1px solid ${theme.colors.border.light}`, 
                    fontSize: theme.typography.fontSize.sm,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                  }}
                >
                  <option value="">Tutti</option>
                  <option value="entrata">Entrate</option>
                  <option value="uscita">Uscite</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Categoria</label>
                <select 
                  value={filters.categoria_id} 
                  onChange={(e) => setFilters({ ...filters, categoria_id: e.target.value })} 
                  style={{ 
                    width: '100%', 
                    padding: theme.spacing.sm, 
                    borderRadius: theme.borderRadius.md, 
                    border: `1px solid ${theme.colors.border.light}`, 
                    fontSize: theme.typography.fontSize.sm,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                  }}
                >
                  <option value="">Tutte</option>
                  {categorie.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icona} {cat.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Conto</label>
                <select 
                  value={filters.conto_id} 
                  onChange={(e) => setFilters({ ...filters, conto_id: e.target.value })} 
                  style={{ 
                    width: '100%', 
                    padding: theme.spacing.sm, 
                    borderRadius: theme.borderRadius.md, 
                    border: `1px solid ${theme.colors.border.light}`, 
                    fontSize: theme.typography.fontSize.sm,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                  }}
                >
                  <option value="">Tutti</option>
                  {conti.map(conto => (
                    <option key={conto.id} value={conto.id}>{conto.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Data da</label>
                <Input 
                  type="date" 
                  value={filters.data_da} 
                  onChange={(e) => setFilters({ ...filters, data_da: e.target.value })} 
                  fullWidth 
                />
              </div>
              
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Data a</label>
                <Input 
                  type="date" 
                  value={filters.data_a} 
                  onChange={(e) => setFilters({ ...filters, data_a: e.target.value })} 
                  fullWidth 
                />
              </div>
              
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Importo min (€)</label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={filters.importo_min} 
                  onChange={(e) => setFilters({ ...filters, importo_min: e.target.value })} 
                  leftIcon={<TrendingDown size={16} />}
                  fullWidth 
                />
              </div>
              
              <div>
                <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, display: 'block', marginBottom: theme.spacing.xs }}>Importo max (€)</label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={filters.importo_max} 
                  onChange={(e) => setFilters({ ...filters, importo_max: e.target.value })} 
                  leftIcon={<TrendingUp size={16} />}
                  fullWidth 
                />
              </div>
            </div>
            
            {activeFiltersCount > 0 && (
              <div style={{ marginTop: theme.spacing.md, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Pulisci tutti i filtri
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Filter Pills */}
        {activeFiltersCount > 0 && (
          <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, fontWeight: theme.typography.fontWeight.medium }}>Filtri attivi:</span>
            
            {filters.tipo && (
              <Badge variant={filters.tipo === 'entrata' ? 'success' : 'danger'}>
                {filters.tipo === 'entrata' ? '⬆️ Entrate' : '⬇️ Uscite'}
                <X 
                  size={14} 
                  style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                  onClick={() => setFilters({ ...filters, tipo: '' })} 
                />
              </Badge>
            )}
            
            {filters.categoria_id && (
              <Badge variant="info">
                {categorie.find(c => c.id.toString() === filters.categoria_id)?.icona} {categorie.find(c => c.id.toString() === filters.categoria_id)?.nome || 'Categoria'}
                <X 
                  size={14} 
                  style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                  onClick={() => setFilters({ ...filters, categoria_id: '' })} 
                />
              </Badge>
            )}
            
            {filters.conto_id && (
              <Badge variant="neutral">
                {conti.find(c => c.id.toString() === filters.conto_id)?.nome || 'Conto'}
                <X 
                  size={14} 
                  style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                  onClick={() => setFilters({ ...filters, conto_id: '' })} 
                />
              </Badge>
            )}
            
            {(filters.data_da || filters.data_a) && (
              <Badge variant="neutral">
                <Calendar size={12} style={{ marginRight: theme.spacing.xs }} />
                {filters.data_da && formatDate(filters.data_da)}{filters.data_da && filters.data_a && ' - '}{filters.data_a && formatDate(filters.data_a)}
                <X 
                  size={14} 
                  style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                  onClick={() => setFilters({ ...filters, data_da: '', data_a: '' })} 
                />
              </Badge>
            )}
            
            {(filters.importo_min || filters.importo_max) && (
              <Badge variant="warning">
                {filters.importo_min && `≥ ${filters.importo_min}€`}
                {filters.importo_min && filters.importo_max && ' - '}
                {filters.importo_max && `≤ ${filters.importo_max}€`}
                <X 
                  size={14} 
                  style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                  onClick={() => setFilters({ ...filters, importo_min: '', importo_max: '' })} 
                />
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Rimuovi tutti
            </Button>
          </div>
        )}

        {/* Movements List */}
        {filteredMovimenti.length === 0 ? (
          <Card padding="xl">
            <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>💸</div>
              <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
                {activeFiltersCount > 0 ? 'Nessun movimento trovato' : 'Nessun movimento'}
              </h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>
                {activeFiltersCount > 0 
                  ? 'Prova a modificare i filtri di ricerca' 
                  : 'Inizia aggiungendo il tuo primo movimento'
                }
              </p>
              {activeFiltersCount > 0 ? (
                <Button variant="secondary" onClick={clearAllFilters}>Rimuovi Filtri</Button>
              ) : (
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>Aggiungi Movimento</Button>
              )}
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
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: theme.borderRadius.full, 
                        backgroundColor: `${getCategoryColor(movimento.categoria_nome || 'altro')}20`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: theme.typography.fontSize['2xl'] 
                      }}>
                        {movimento.icona || (movimento.tipo === 'entrata' ? '⬆️' : '⬇️')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: theme.typography.fontSize.base, 
                          fontWeight: theme.typography.fontWeight.semibold, 
                          color: theme.colors.text.primary 
                        }}>
                          {movimento.descrizione}
                        </h4>
                        <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>{formatDate(movimento.data)}</span>
                          {movimento.categoria_nome && <Badge category={movimento.categoria_nome} size="sm">{movimento.categoria_nome}</Badge>}
                          {movimento.conto_nome && <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>• {movimento.conto_nome}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                      <span style={{ 
                        fontSize: theme.typography.fontSize.lg, 
                        fontWeight: theme.typography.fontWeight.bold, 
                        color: movimento.tipo === 'entrata' ? theme.colors.success : theme.colors.danger 
                      }}>
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
