import { useState, useEffect } from 'react';
import { Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { theme } from '../styles/theme';

interface BudgetItem {
  id: number;
  categoria_nome: string;
  categoria_icona?: string;
  importo_budget: number;
  importo_speso: number;
  mese: number;
  anno: number;
  percentuale_uso: number;
}

function Budget() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const mese = now.getMonth() + 1;
      const anno = now.getFullYear();
      
      const response = await fetch(`/api/budget/corrente?mese=${mese}&anno=${anno}`);
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      } else {
        // Silent handling: no budgets exist for current month
        setBudgets([]);
      }
    } catch (error) {
      // Silent error handling
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreateBudget = () => {
    alert('Funzionalità in arrivo: Crea Budget');
    // TODO: Open modal/form to create new budget
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (b.importo_budget || 0), 0);
  const totalSpeso = budgets.reduce((sum, b) => sum + (b.importo_speso || 0), 0);
  const percentualeGlobale = totalBudget > 0 ? (totalSpeso / totalBudget) * 100 : 0;

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <div>
          <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Budget Mensile</h2>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            {budgets.length} {budgets.length === 1 ? 'categoria' : 'categorie'} monitorate
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreateBudget}>
          Aggiungi Budget
        </Button>
      </div>

      {/* Global Summary */}
      {budgets.length > 0 && (
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <div>
              <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Budget Totale</p>
              <h3 style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
                {formatCurrency(totalSpeso)} / {formatCurrency(totalBudget)}
              </h3>
            </div>
            <TrendingUp size={32} color={percentualeGlobale < 80 ? theme.colors.success : theme.colors.warning} />
          </div>
          <ProgressBar value={totalSpeso} max={totalBudget} showLabel variant="default" />
        </Card>
      )}

      {/* Budget Items */}
      {budgets.length === 0 ? (
        <Card padding="xl">
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
            <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🎯</div>
            <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessun budget impostato</h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Inizia a pianificare le tue spese mensili</p>
            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreateBudget}>
              Crea Budget
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: theme.spacing.md }}>
          {budgets.map((budget) => (
            <Card key={budget.id} hoverable padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: `${theme.colors.primary.DEFAULT}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: theme.typography.fontSize['2xl']
                }}>
                  {budget.categoria_icona || '💸'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                    {budget.categoria_nome}
                  </h4>
                  <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                    {formatCurrency(budget.importo_speso || 0)} / {formatCurrency(budget.importo_budget || 0)}
                  </p>
                </div>
                {(budget.percentuale_uso || 0) >= 90 && (
                  <AlertCircle size={20} color={theme.colors.danger} />
                )}
              </div>
              <ProgressBar value={budget.importo_speso || 0} max={budget.importo_budget || 1} variant="default" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Budget;
