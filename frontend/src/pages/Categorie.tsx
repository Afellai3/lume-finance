import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../styles/theme';
import CategorieForm from '../components/categorie/CategorieForm';

interface Categoria {
  id: number;
  nome: string;
  tipo: 'entrata' | 'uscita';
  icona?: string;
  colore?: string;
  descrizione?: string;
  is_system: boolean;
  movimento_count?: number;
}

function Categorie() {
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [showSystem, setShowSystem] = useState(true);

  const fetchCategorie = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterTipo) params.append('tipo', filterTipo);
      if (!showSystem) params.append('include_system', 'false');
      params.append('include_usage', 'true');

      const response = await fetch(`/api/categorie?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCategorie(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorie();
  }, [filterTipo, showSystem]);

  const handleCreate = () => {
    setEditingCategoria(null);
    setShowForm(true);
  };

  const handleEdit = (categoria: Categoria) => {
    if (categoria.is_system) {
      alert('Le categorie di sistema non possono essere modificate');
      return;
    }
    setEditingCategoria(categoria);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategoria(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchCategorie();
  };

  const handleDelete = async (categoria: Categoria) => {
    if (categoria.is_system) {
      alert('Le categorie di sistema non possono essere eliminate');
      return;
    }

    // Controlla utilizzo
    try {
      const response = await fetch(`/api/categorie/${categoria.id}/usage`);
      if (response.ok) {
        const usage = await response.json();
        
        if (!usage.can_delete) {
          const messages = [];
          if (usage.movimento_count > 0) messages.push(`${usage.movimento_count} movimenti`);
          if (usage.budget_count > 0) messages.push(`${usage.budget_count} budget`);
          if (usage.ricorrenze_count > 0) messages.push(`${usage.ricorrenze_count} ricorrenze`);
          
          alert(
            `Impossibile eliminare la categoria "${categoria.nome}"\n\n` +
            `È utilizzata in:\n${messages.join('\n')}\n\n` +
            `Rimuovi prima questi riferimenti.`
          );
          return;
        }
      }
    } catch (error) {
      alert('Errore durante il controllo utilizzo categoria');
      return;
    }

    if (!confirm(`Eliminare la categoria "${categoria.nome}"?`)) return;

    try {
      const response = await fetch(`/api/categorie/${categoria.id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchCategorie();
      } else {
        const error = await response.json();
        alert(error.detail || 'Errore durante l\'eliminazione');
      }
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const entrateCount = categorie.filter(c => c.tipo === 'entrata').length;
  const usciteCount = categorie.filter(c => c.tipo === 'uscita').length;
  const customCount = categorie.filter(c => !c.is_system).length;

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  const filteredCategorie = categorie.filter(cat => {
    if (filterTipo && cat.tipo !== filterTipo) return false;
    if (!showSystem && cat.is_system) return false;
    return true;
  });

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <div>
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Categorie</h2>
            <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              {entrateCount} entrate • {usciteCount} uscite • {customCount} personalizzate
            </p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>
            Nuova Categoria
          </Button>
        </div>

        {/* Filters */}
        <Card padding="md">
          <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Button
                variant={filterTipo === '' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterTipo('')}
              >
                Tutte
              </Button>
              <Button
                variant={filterTipo === 'entrata' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterTipo('entrata')}
              >
                Entrate
              </Button>
              <Button
                variant={filterTipo === 'uscita' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterTipo('uscita')}
              >
                Uscite
              </Button>
            </div>
            <div style={{ borderLeft: `1px solid ${theme.colors.border.light}`, height: '24px' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showSystem}
                onChange={(e) => setShowSystem(e.target.checked)}
              />
              Mostra categorie di sistema
            </label>
          </div>
        </Card>

        {/* Categorie List */}
        {filteredCategorie.length === 0 ? (
          <Card padding="xl">
            <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🏷️</div>
              <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessuna categoria trovata</h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Crea categorie personalizzate per organizzare meglio i tuoi movimenti</p>
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>
                Crea Categoria
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: theme.spacing.md }}>
            {filteredCategorie.map((cat) => (
              <Card key={cat.id} hoverable padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md, flex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: theme.borderRadius.lg,
                      backgroundColor: cat.colore ? `${cat.colore}20` : cat.tipo === 'entrata' ? `${theme.colors.success}20` : `${theme.colors.danger}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: theme.typography.fontSize['2xl'],
                      border: `2px solid ${cat.colore || (cat.tipo === 'entrata' ? theme.colors.success : theme.colors.danger)}`
                    }}>
                      {cat.icona || (cat.tipo === 'entrata' ? '💰' : '💸')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.xs, flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                          {cat.nome}
                        </h4>
                        {cat.is_system && (
                          <Badge variant="neutral" size="sm">
                            <Shield size={12} style={{ marginRight: '4px' }} />
                            Sistema
                          </Badge>
                        )}
                        <Badge variant={cat.tipo === 'entrata' ? 'success' : 'danger'} size="sm">
                          {cat.tipo === 'entrata' ? '↗ Entrata' : '↘ Uscita'}
                        </Badge>
                      </div>
                      {cat.descrizione && (
                        <p style={{ margin: `${theme.spacing.xs} 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                          {cat.descrizione}
                        </p>
                      )}
                      {typeof cat.movimento_count === 'number' && (
                        <div style={{ marginTop: theme.spacing.sm, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                          {cat.movimento_count} {cat.movimento_count === 1 ? 'movimento' : 'movimenti'}
                        </div>
                      )}
                    </div>
                  </div>
                  {!cat.is_system && (
                    <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={() => handleEdit(cat)} />
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => handleDelete(cat)} />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CategorieForm
          categoria={editingCategoria}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}

export default Categorie;
