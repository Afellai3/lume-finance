import { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle2, Edit2, Trash2, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import ObiettivoCard from '../components/obiettivi/ObiettivoCard';
import ObiettivoForm from '../components/obiettivi/ObiettivoForm';
import ContributiList from '../components/obiettivi/ContributiList';
import { theme } from '../styles/theme';

interface Obiettivo {
  id: number;
  nome: string;
  descrizione?: string;
  importo_target: number;
  importo_attuale: number;
  percentuale_completamento: number;
  data_target?: string;
  giorni_rimanenti?: number;
  priorita: number;
  completato: boolean;
  velocita_risparmio_mensile: number;
  categoria_nome?: string;
  categoria_icona?: string;
}

interface Contributo {
  id: number;
  data: string;
  importo: number;
  descrizione: string;
  conto_nome?: string;
}

type View = 'list' | 'create' | 'edit' | 'contributi';

function Obiettivi() {
  const [obiettivi, setObiettivi] = useState<Obiettivo[]>([]);
  const [contributi, setContributi] = useState<Contributo[]>([]);
  const [contributiTotale, setContributiTotale] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter
  const [showCompleted, setShowCompleted] = useState(false);
  
  // View state
  const [view, setView] = useState<View>('list');
  const [selectedObiettivoId, setSelectedObiettivoId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = showCompleted ? '/api/obiettivi/tutti' : '/api/obiettivi';
      const response = await fetch(endpoint);
      
      if (!response.ok) throw new Error('Errore caricamento obiettivi');
      
      const data = await response.json();
      setObiettivi(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributi = async (obiettivoId: number) => {
    try {
      const response = await fetch(`/api/obiettivi/${obiettivoId}/contributi`);
      if (!response.ok) throw new Error('Errore caricamento contributi');
      
      const data = await response.json();
      setContributi(data.contributi || []);
      setContributiTotale(data.totale || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento contributi');
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchData();
    }
  }, [view, showCompleted]);

  const handleCreateNew = () => {
    setSelectedObiettivoId(null);
    setView('create');
  };

  const handleEdit = (obiettivoId: number) => {
    setSelectedObiettivoId(obiettivoId);
    setView('edit');
  };

  const handleViewContributi = async (obiettivoId: number) => {
    setSelectedObiettivoId(obiettivoId);
    await fetchContributi(obiettivoId);
    setView('contributi');
  };

  const handleMarkCompleted = async (obiettivoId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/obiettivi/${obiettivoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completato: completed })
      });
      
      if (!response.ok) throw new Error('Errore aggiornamento obiettivo');
      
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    }
  };

  const handleDelete = async (obiettivoId: number) => {
    if (!confirm('Eliminare questo obiettivo?')) return;
    
    try {
      const response = await fetch(`/api/obiettivi/${obiettivoId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Errore eliminazione');
      
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore eliminazione');
    }
  };

  const handleFormSuccess = () => {
    setView('list');
    setSelectedObiettivoId(null);
  };

  const handleFormCancel = () => {
    setView('list');
    setSelectedObiettivoId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Show form view
  if (view === 'create' || view === 'edit') {
    return (
      <ObiettivoForm 
        obiettivoId={view === 'edit' ? selectedObiettivoId || undefined : undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  // Show contributi view
  if (view === 'contributi') {
    const obiettivo = obiettivi.find(o => o.id === selectedObiettivoId);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize['2xl'], 
              fontWeight: theme.typography.fontWeight.bold, 
              color: theme.colors.text.primary 
            }}>
              Contributi: {obiettivo?.nome}
            </h1>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setView('list')}
          >
            Indietro
          </Button>
        </div>
        
        <ContributiList contributi={contributi} totale={contributiTotale} />
      </div>
    );
  }

  // Calculate summary
  const totaleTarget = obiettivi.reduce((sum, o) => sum + o.importo_target, 0);
  const totaleRaggiunto = obiettivi.reduce((sum, o) => sum + o.importo_attuale, 0);
  const percentualeGlobale = totaleTarget > 0 ? (totaleRaggiunto / totaleTarget * 100) : 0;
  const obiettiviCompletati = obiettivi.filter(o => o.completato).length;

  // Show list view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize['2xl'], 
            fontWeight: theme.typography.fontWeight.bold, 
            color: theme.colors.text.primary 
          }}>
            🎯 Obiettivi di Risparmio
          </h1>
          <p style={{ 
            margin: `${theme.spacing.xs} 0 0 0`, 
            fontSize: theme.typography.fontSize.sm, 
            color: theme.colors.text.secondary 
          }}>
            Traccia i tuoi obiettivi finanziari
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleCreateNew}
          style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
        >
          <Plus size={18} />
          Nuovo Obiettivo
        </Button>
      </div>

      {/* Summary Dashboard */}
      {obiettivi.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md
        }}>
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Obiettivi Attivi
            </div>
            <div style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
              {obiettivi.filter(o => !o.completato).length}
            </div>
          </Card>
          
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Completati
            </div>
            <div style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.success }}>
              {obiettiviCompletati}
            </div>
          </Card>
          
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Risparmiato
            </div>
            <div style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
              {formatCurrency(totaleRaggiunto)}
            </div>
          </Card>
          
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Target Totale
            </div>
            <div style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
              {formatCurrency(totaleTarget)}
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <Card padding="md">
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
            Mostra:
          </div>
          <Button
            variant={!showCompleted ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowCompleted(false)}
          >
            Solo Attivi
          </Button>
          <Button
            variant={showCompleted ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowCompleted(true)}
          >
            Tutti
          </Button>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>⏳</div>
          <p style={{ color: theme.colors.text.secondary }}>Caricamento obiettivi...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card padding="xl">
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: theme.colors.danger, marginBottom: theme.spacing.lg }}>{error}</p>
            <Button variant="primary" onClick={fetchData}>Riprova</Button>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && obiettivi.length === 0 && (
        <Card padding="xl">
          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing.md
          }}>
            <div style={{ fontSize: '64px' }}>🎯</div>
            <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
              Nessun obiettivo configurato
            </h3>
            <p style={{ margin: 0, color: theme.colors.text.secondary }}>
              Inizia a pianificare i tuoi obiettivi di risparmio
            </p>
            <Button 
              variant="primary" 
              onClick={handleCreateNew}
              style={{ marginTop: theme.spacing.md }}
            >
              <Plus size={18} style={{ marginRight: theme.spacing.xs }} />
              Crea Primo Obiettivo
            </Button>
          </div>
        </Card>
      )}

      {/* Obiettivi grid */}
      {!loading && !error && obiettivi.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: theme.spacing.lg
        }}>
          {obiettivi.map((obiettivo) => (
            <div key={obiettivo.id} style={{ position: 'relative' }}>
              <ObiettivoCard 
                obiettivo={obiettivo}
                onClick={() => handleViewContributi(obiettivo.id)}
              />
              
              {/* Quick Actions */}
              <div style={{ 
                position: 'absolute', 
                top: theme.spacing.sm, 
                right: theme.spacing.sm,
                display: 'flex',
                gap: theme.spacing.xs
              }}>
                {!obiettivo.completato && obiettivo.percentuale_completamento >= 100 && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkCompleted(obiettivo.id, true);
                    }}
                    style={{ padding: theme.spacing.xs }}
                  >
                    <CheckCircle2 size={16} />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(obiettivo.id);
                  }}
                  style={{ padding: theme.spacing.xs }}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(obiettivo.id);
                  }}
                  style={{ padding: theme.spacing.xs }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Obiettivi;
