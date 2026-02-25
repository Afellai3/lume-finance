import { useState, useEffect } from 'react';
import { Search, Plus, Download, Filter, X, Edit2, Trash2, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { theme, getCategoryColor } from '../styles/theme';

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

function Movimenti() {
  const [movimenti, setMovimenti] = useState<Movimento[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [conti, setConti] = useState<Conto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    tipo: '',
    categoria_id: '',
    conto_id: '',
    data_da: '',
    data_a: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [movRes, catRes, contiRes] = await Promise.all([
        fetch('/api/movimenti?per_page=100'),
        fetch('/api/movimenti/categorie'),
        fetch('/api/conti')
      ]);

      if (movRes.ok) {
        const data = await movRes.json();
        setMovimenti(data.items || data);
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
    fetchData();
  }, []);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo movimento?')) return;
    try {
      const response = await fetch(`/api/movimenti/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing['2xl'] }}>
        <p style={{ color: theme.colors.text.secondary }}>Caricamento...</p>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      {/* Header with Actions */}
      <div style={headerStyles}>
        <div>
          <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>
            Movimenti
          </h2>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            {filteredMovimenti.length} {filteredMovimenti.length === 1 ? 'movimento' : 'movimenti'}
          </p>
        </div>
        <div style={actionsStyles}>
          <Button variant="secondary" size="sm" leftIcon={<Download size={16} />}>
            Esporta
          </Button>
          <Button 
            variant={showFilters ? 'primary' : 'secondary'} 
            size="sm" 
            leftIcon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtri {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
            Nuovo
          </Button>
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
              <X 
                size={14} 
                style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                onClick={() => setFilters({ ...filters, tipo: '' })}
              />
            </Badge>
          )}
          {filters.categoria_id && (
            <Badge variant="info">
              {categorie.find(c => c.id.toString() === filters.categoria_id)?.nome || 'Categoria'}
              <X 
                size={14} 
                style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                onClick={() => setFilters({ ...filters, categoria_id: '' })}
              />
            </Badge>
          )}
          {(filters.data_da || filters.data_a) && (
            <Badge variant="neutral">
              <Calendar size={12} style={{ marginRight: theme.spacing.xs }} />
              {filters.data_da && formatDate(filters.data_da)}
              {filters.data_da && filters.data_a && ' - '}
              {filters.data_a && formatDate(filters.data_a)}
              <X 
                size={14} 
                style={{ marginLeft: theme.spacing.xs, cursor: 'pointer' }} 
                onClick={() => setFilters({ ...filters, data_da: '', data_a: '' })}
              />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters({ search: filters.search, tipo: '', categoria_id: '', conto_id: '', data_da: '', data_a: '' })}
          >
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
              <select 
                value={filters.tipo} 
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border.light}`,
                  fontSize: theme.typography.fontSize.sm
                }}
              >
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
            <Button variant="primary" leftIcon={<Plus size={16} />}>Aggiungi Movimento</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {filteredMovimenti.map((movimento) => (
            <Card key={movimento.id} hoverable padding="md">
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
                    <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                      {movimento.descrizione}
                    </h4>
                    <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                        {formatDate(movimento.data)}
                      </span>
                      {movimento.categoria_nome && (
                        <Badge category={movimento.categoria_nome} size="sm">{movimento.categoria_nome}</Badge>
                      )}
                      {movimento.conto_nome && (
                        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                          • {movimento.conto_nome}
                        </span>
                      )}
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
                    <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} />
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => handleDelete(movimento.id)} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Movimenti;
