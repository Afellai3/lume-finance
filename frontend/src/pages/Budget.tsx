import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetForm from '../components/budget/BudgetForm';
import { theme } from '../styles/theme';

interface Budget {
  id: number;
  categoria_nome: string;
  categoria_icona?: string;
  importo: number;
  spesa_corrente: number;
  rimanente: number;
  percentuale_utilizzo: number;
  stato: 'ok' | 'attenzione' | 'superato';
  periodo: string;
}

type View = 'list' | 'create' | 'edit';
type FilterStato = 'all' | 'ok' | 'attenzione' | 'superato';

function Budget() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [riepilogo, setRiepilogo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterStato, setFilterStato] = useState<FilterStato>('all');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('all');
  
  // View state
  const [view, setView] = useState<View>('list');
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch budgets
      const budgetRes = await fetch('/api/budget');
      if (!budgetRes.ok) throw new Error('Errore caricamento budget');
      const budgetData = await budgetRes.json();
      setBudgets(budgetData.budget || []);
      
      // Fetch riepilogo
      const riepilogoRes = await fetch('/api/budget/riepilogo/mensile');
      if (riepilogoRes.ok) {
        const riepilogoData = await riepilogoRes.json();
        setRiepilogo(riepilogoData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchData();
    }
  }, [view]);

  const handleCreateNew = () => {
    setSelectedBudgetId(null);
    setView('create');
  };

  const handleEdit = (budgetId: number) => {
    setSelectedBudgetId(budgetId);
    setView('edit');
  };

  const handleFormSuccess = () => {
    setView('list');
    setSelectedBudgetId(null);
  };

  const handleFormCancel = () => {
    setView('list');
    setSelectedBudgetId(null);
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
      <BudgetForm 
        budgetId={view === 'edit' ? selectedBudgetId || undefined : undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    if (filterStato !== 'all' && budget.stato !== filterStato) return false;
    if (filterPeriodo !== 'all' && budget.periodo !== filterPeriodo) return false;
    return true;
  });

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
            💰 Budget
          </h1>
          <p style={{ 
            margin: `${theme.spacing.xs} 0 0 0`, 
            fontSize: theme.typography.fontSize.sm, 
            color: theme.colors.text.secondary 
          }}>
            Monitora le tue spese per categoria
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleCreateNew}
          style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
        >
          <Plus size={18} />
          Nuovo Budget
        </Button>
      </div>

      {/* Riepilogo Dashboard */}
      {riepilogo && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md
        }}>
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Budget Totale
            </div>
            <div style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
              {formatCurrency(riepilogo.totale_budget)}
            </div>
          </Card>
          
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Speso
            </div>
            <div style={{ fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
              {formatCurrency(riepilogo.totale_speso)}
            </div>
          </Card>
          
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Rimanente
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize['2xl'], 
              fontWeight: theme.typography.fontWeight.bold, 
              color: riepilogo.rimanente >= 0 ? theme.colors.success : theme.colors.danger
            }}>
              {formatCurrency(riepilogo.rimanente)}
            </div>
          </Card>
          
          <Card padding="md">
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }}>
              Utilizzo
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize['2xl'], 
              fontWeight: theme.typography.fontWeight.bold,
              color: riepilogo.percentuale_utilizzo >= 100 ? theme.colors.danger : 
                     riepilogo.percentuale_utilizzo >= 80 ? theme.colors.warning : theme.colors.success
            }}>
              {riepilogo.percentuale_utilizzo.toFixed(1)}%
            </div>
          </Card>
        </div>
      )}

      {/* Warnings Alert */}
      {riepilogo && (riepilogo.budget_superati > 0 || riepilogo.budget_attenzione > 0) && (
        <Card padding="md" style={{ backgroundColor: `${theme.colors.warning}10`, border: `1px solid ${theme.colors.warning}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <AlertTriangle size={20} color={theme.colors.warning} />
            <div>
              <strong>Attenzione:</strong> {riepilogo.budget_superati > 0 && `${riepilogo.budget_superati} budget superati`}
              {riepilogo.budget_superati > 0 && riepilogo.budget_attenzione > 0 && ', '}
              {riepilogo.budget_attenzione > 0 && `${riepilogo.budget_attenzione} budget vicini al limite`}
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <div>
            <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, marginBottom: theme.spacing.xs }}>
              Filtra per stato
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
              <Button
                variant={filterStato === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterStato('all')}
              >
                Tutti
              </Button>
              <Button
                variant={filterStato === 'ok' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterStato('ok')}
                style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              >
                <CheckCircle size={16} />
                Ok
              </Button>
              <Button
                variant={filterStato === 'attenzione' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterStato('attenzione')}
                style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              >
                <TrendingUp size={16} />
                Attenzione
              </Button>
              <Button
                variant={filterStato === 'superato' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterStato('superato')}
                style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              >
                <AlertTriangle size={16} />
                Superati
              </Button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, marginBottom: theme.spacing.xs }}>
              Filtra per periodo
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
              <Button
                variant={filterPeriodo === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterPeriodo('all')}
              >
                Tutti
              </Button>
              <Button
                variant={filterPeriodo === 'settimanale' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterPeriodo('settimanale')}
              >
                Settimanale
              </Button>
              <Button
                variant={filterPeriodo === 'mensile' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterPeriodo('mensile')}
              >
                Mensile
              </Button>
              <Button
                variant={filterPeriodo === 'annuale' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterPeriodo('annuale')}
              >
                Annuale
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>⏳</div>
          <p style={{ color: theme.colors.text.secondary }}>Caricamento budget...</p>
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
      {!loading && !error && filteredBudgets.length === 0 && budgets.length === 0 && (
        <Card padding="xl">
          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing.md
          }}>
            <div style={{ fontSize: '64px' }}>💰</div>
            <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
              Nessun budget configurato
            </h3>
            <p style={{ margin: 0, color: theme.colors.text.secondary }}>
              Crea il tuo primo budget per monitorare le spese per categoria
            </p>
            <Button 
              variant="primary" 
              onClick={handleCreateNew}
              style={{ marginTop: theme.spacing.md }}
            >
              <Plus size={18} style={{ marginRight: theme.spacing.xs }} />
              Crea Primo Budget
            </Button>
          </div>
        </Card>
      )}

      {/* No results after filter */}
      {!loading && !error && filteredBudgets.length === 0 && budgets.length > 0 && (
        <Card padding="xl">
          <div style={{ textAlign: 'center', color: theme.colors.text.secondary }}>
            <p>Nessun budget trovato con i filtri selezionati</p>
          </div>
        </Card>
      )}

      {/* Budget grid */}
      {!loading && !error && filteredBudgets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: theme.spacing.lg
        }}>
          {filteredBudgets.map((budget) => (
            <BudgetCard 
              key={budget.id}
              budget={budget}
              onClick={() => handleEdit(budget.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Budget;
