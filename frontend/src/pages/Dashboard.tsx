import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { theme, getCategoryColor } from '../styles/theme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TrendChart from '../components/charts/TrendChart';
import ComparisonCard from '../components/dashboard/ComparisonCard';
import BudgetWarnings from '../components/dashboard/BudgetWarnings';
import TopSpese from '../components/dashboard/TopSpese';

interface DashboardData {
  kpi: {
    patrimonio_totale: number;
    entrate_mese: number;
    uscite_mese: number;
    saldo_mese: number;
  };
  spese_per_categoria: Array<{
    nome: string;
    icona: string;
    colore: string;
    totale: number;
  }>;
  ultimi_movimenti: Array<any>;
  obiettivi_risparmio: Array<any>;
  periodo: {
    mese_nome: string;
  };
}

type PeriodFilter = '1m' | '3m' | '6m' | '1y';

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('1m');

  // Mock data for new analytics components (will be replaced with API calls)
  const mockTrendData = [
    { periodo: 'Set 2025', entrate: 3200, uscite: 2800 },
    { periodo: 'Ott 2025', entrate: 3500, uscite: 2650 },
    { periodo: 'Nov 2025', entrate: 3100, uscite: 2900 },
    { periodo: 'Dic 2025', entrate: 4200, uscite: 3500 },
    { periodo: 'Gen 2026', entrate: 3300, uscite: 2700 },
    { periodo: 'Feb 2026', entrate: 3600, uscite: 2850 },
  ];

  const mockComparisonData = {
    periodo_corrente: {
      label: 'Febbraio 2026',
      entrate: 3600,
      uscite: 2850,
      bilancio: 750,
    },
    periodo_precedente: {
      label: 'Gennaio 2026',
      entrate: 3300,
      uscite: 2700,
      bilancio: 600,
    },
  };

  const mockBudgetWarnings = [
    {
      categoria_nome: 'Casa',
      categoria_icona: '🏠',
      limite: 1000,
      speso: 850,
      percentuale: 85,
    },
    {
      categoria_nome: 'Alimentari',
      categoria_icona: '🍕',
      limite: 500,
      speso: 460,
      percentuale: 92,
    },
    {
      categoria_nome: 'Trasporti',
      categoria_icona: '🚗',
      limite: 300,
      speso: 255,
      percentuale: 85,
    },
  ];

  const mockTopSpese = [
    {
      id: 1,
      descrizione: 'Affitto casa',
      importo: -850,
      data: '2026-02-01',
      categoria_nome: 'Casa',
      categoria_icona: '🏠',
    },
    {
      id: 2,
      descrizione: 'Spesa Carrefour',
      importo: -120,
      data: '2026-02-15',
      categoria_nome: 'Alimentari',
      categoria_icona: '🍕',
    },
    {
      id: 3,
      descrizione: 'Rifornimento Eni',
      importo: -85,
      data: '2026-02-10',
      categoria_nome: 'Trasporti',
      categoria_icona: '⛽',
    },
    {
      id: 4,
      descrizione: 'Cena ristorante',
      importo: -65,
      data: '2026-02-14',
      categoria_nome: 'Svago',
      categoria_icona: '🍴',
    },
    {
      id: 5,
      descrizione: 'Amazon ordine',
      importo: -45,
      data: '2026-02-18',
      categoria_nome: 'Shopping',
      categoria_icona: '🛍️',
    },
  ];

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/dashboard?');
      if (!response.ok) throw new Error('Errore caricamento dashboard');
      const dashboardData = await response.json();
      
      // Fetch obiettivi and movements to calculate actual amounts
      try {
        console.log('📊 Dashboard: Fetching obiettivi and movements...');
        
        const obiettiviRes = await fetch('/api/obiettivi');
        if (!obiettiviRes.ok) {
          console.error('❌ Dashboard: Failed to fetch obiettivi');
          setData(dashboardData);
          setLoading(false);
          return;
        }
        
        const obiettivi = await obiettiviRes.json();
        console.log('✅ Dashboard: Obiettivi fetched:', obiettivi);
        
        // Fetch movements with multiple fallback strategies
        let movimenti: any[] = [];
        
        try {
          const movimentiRes = await fetch('/api/movimenti');
          if (movimentiRes.ok) {
            const movimentiData = await movimentiRes.json();
            
            if (Array.isArray(movimentiData)) {
              movimenti = movimentiData;
            } else if (movimentiData.items && Array.isArray(movimentiData.items)) {
              movimenti = movimentiData.items;
            } else if (movimentiData.movimenti && Array.isArray(movimentiData.movimenti)) {
              movimenti = movimentiData.movimenti;
            }
            
            console.log(`✅ Dashboard: Fetched ${movimenti.length} movements`);
          }
        } catch (err) {
          console.error('❌ Dashboard: Error fetching movements:', err);
        }
        
        // If no movements, try with limit
        if (movimenti.length === 0) {
          try {
            const movimentiRes2 = await fetch('/api/movimenti?limit=10000');
            if (movimentiRes2.ok) {
              const movimentiData2 = await movimentiRes2.json();
              if (Array.isArray(movimentiData2)) {
                movimenti = movimentiData2;
              } else if (movimentiData2.items) {
                movimenti = movimentiData2.items;
              }
              console.log(`✅ Dashboard: Fetched ${movimenti.length} movements with limit`);
            }
          } catch (err) {
            console.error('❌ Dashboard: Error fetching movements with limit:', err);
          }
        }
        
        // Calculate importo_accumulato for each obiettivo
        const obiettiviWithAmounts = obiettivi.map((obiettivo: any) => {
          const relatedMovements = movimenti.filter(
            (m: any) => m.obiettivo_id === obiettivo.id && m.tipo === 'entrata'
          );
          
          const importoCalcolato = relatedMovements.reduce(
            (sum: number, m: any) => sum + (m.importo || 0),
            0
          );
          
          console.log(`📈 Dashboard Obiettivo "${obiettivo.nome}":`, {
            id: obiettivo.id,
            relatedMovements: relatedMovements.length,
            importoCalcolato
          });
          
          return {
            ...obiettivo,
            importo_accumulato: importoCalcolato,
            importo_corrente: importoCalcolato,
            importo_attuale: importoCalcolato,
            target: obiettivo.importo_target
          };
        });
        
        dashboardData.obiettivi_risparmio = obiettiviWithAmounts;
        console.log('✅ Dashboard: Obiettivi with amounts:', obiettiviWithAmounts);
        
      } catch (err) {
        console.error('❌ Dashboard: Error processing obiettivi:', err);
        // Continue with dashboard data even if obiettivi fail
      }
      
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [periodFilter]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>⏳</div>
          <p style={{ color: theme.colors.text.secondary }}>Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Card padding="xl">
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={48} color={theme.colors.danger} style={{ marginBottom: theme.spacing.md }} />
            <p style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.lg }}>{error}</p>
            <Button variant="primary" onClick={fetchDashboard}>Riprova</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  // Styles
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing.md,
  };

  const twoColGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing.lg,
  };

  const balanceCardStyles: React.CSSProperties = {
    background: theme.colors.primary.gradient,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.primary,
    color: theme.colors.text.white,
  };

  return (
    <div style={containerStyles}>
      {/* Header with Period Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <div>
          <h1 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
            Dashboard
          </h1>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
            Panoramica finanziaria
          </p>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Button
            variant={periodFilter === '1m' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriodFilter('1m')}
          >
            Mese
          </Button>
          <Button
            variant={periodFilter === '3m' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriodFilter('3m')}
          >
            3 Mesi
          </Button>
          <Button
            variant={periodFilter === '6m' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriodFilter('6m')}
          >
            6 Mesi
          </Button>
          <Button
            variant={periodFilter === '1y' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriodFilter('1y')}
          >
            Anno
          </Button>
        </div>
      </div>

      {/* Balance Card - Large Featured Card */}
      <div style={balanceCardStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: theme.typography.fontSize.sm, opacity: 0.9, marginBottom: theme.spacing.xs }}>
              Patrimonio Totale
            </p>
            <h2 style={{ fontSize: theme.typography.fontSize['3xl'], fontWeight: theme.typography.fontWeight.bold, margin: 0 }}>
              {formatCurrency(data.kpi.patrimonio_totale)}
            </h2>
          </div>
          <Wallet size={40} style={{ opacity: 0.8 }} />
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.xl, marginTop: theme.spacing.lg, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>Entrate</p>
            <p style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, margin: 0 }}>
              {formatCurrency(data.kpi.entrate_mese)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>Uscite</p>
            <p style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, margin: 0 }}>
              {formatCurrency(data.kpi.uscite_mese)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>Saldo</p>
            <p style={{ 
              fontSize: theme.typography.fontSize.lg, 
              fontWeight: theme.typography.fontWeight.semibold,
              margin: 0,
              color: data.kpi.saldo_mese >= 0 ? '#A8E6CF' : '#FFB3BA'
            }}>
              {formatCurrency(data.kpi.saldo_mese)}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={gridStyles}>
        <Card hoverable padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: theme.borderRadius.full, 
              backgroundColor: `${theme.colors.success}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowUpCircle size={24} color={theme.colors.success} />
            </div>
            <div>
              <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, margin: 0 }}>Entrate</p>
              <p style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, margin: 0, color: theme.colors.text.primary }}>
                {formatCurrency(data.kpi.entrate_mese)}
              </p>
            </div>
          </div>
        </Card>

        <Card hoverable padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: theme.borderRadius.full, 
              backgroundColor: `${theme.colors.danger}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowDownCircle size={24} color={theme.colors.danger} />
            </div>
            <div>
              <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, margin: 0 }}>Uscite</p>
              <p style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.semibold, margin: 0, color: theme.colors.text.primary }}>
                {formatCurrency(data.kpi.uscite_mese)}
              </p>
            </div>
          </div>
        </Card>

        <Card hoverable padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: theme.borderRadius.full, 
              backgroundColor: data.kpi.saldo_mese >= 0 ? `${theme.colors.success}20` : `${theme.colors.warning}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {data.kpi.saldo_mese >= 0 ? (
                <TrendingUp size={24} color={theme.colors.success} />
              ) : (
                <TrendingDown size={24} color={theme.colors.warning} />
              )}
            </div>
            <div>
              <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, margin: 0 }}>Saldo</p>
              <p style={{ 
                fontSize: theme.typography.fontSize.xl, 
                fontWeight: theme.typography.fontWeight.semibold, 
                margin: 0,
                color: data.kpi.saldo_mese >= 0 ? theme.colors.success : theme.colors.danger
              }}>
                {formatCurrency(data.kpi.saldo_mese)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* SPRINT 2: Trend Chart */}
      <TrendChart data={mockTrendData} loading={false} />

      {/* SPRINT 2: Comparison + Budget Warnings Grid */}
      <div style={twoColGridStyles}>
        <ComparisonCard data={mockComparisonData} loading={false} />
        <BudgetWarnings warnings={mockBudgetWarnings} loading={false} />
      </div>

      {/* SPRINT 2: Top Spese */}
      <TopSpese spese={mockTopSpese} loading={false} limit={5} />

      {/* Category Spending Chart */}
      {data.spese_per_categoria && data.spese_per_categoria.length > 0 && (
        <Card header="Spese per Categoria" padding="lg">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.spese_per_categoria}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.light} />
              <XAxis dataKey="nome" fontSize={12} stroke={theme.colors.text.secondary} />
              <YAxis fontSize={12} stroke={theme.colors.text.secondary} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.colors.surface, 
                  border: `1px solid ${theme.colors.border.light}`,
                  borderRadius: theme.borderRadius.md
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="totale" fill={theme.colors.primary.DEFAULT} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Movements */}
      {data.ultimi_movimenti && data.ultimi_movimenti.length > 0 && (
        <Card header="Ultimi Movimenti" padding="md">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.ultimi_movimenti.slice(0, 5).map((movimento: any, index: number) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  borderBottom: index < 4 ? `1px solid ${theme.colors.border.light}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: `${getCategoryColor(movimento.categoria || 'altro')}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: theme.typography.fontSize.lg
                  }}>
                    {movimento.icona || '💸'}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.primary }}>
                      {movimento.descrizione || 'Movimento'}
                    </p>
                    <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      {movimento.data ? new Date(movimento.data).toLocaleDateString('it-IT') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: movimento.tipo === 'entrata' ? theme.colors.success : theme.colors.danger
                  }}>
                    {movimento.tipo === 'entrata' ? '+' : '-'}{formatCurrency(Math.abs(movimento.importo || 0))}
                  </p>
                  {movimento.categoria && (
                    <Badge category={movimento.categoria} size="sm" style={{ marginTop: theme.spacing.xs }}>
                      {movimento.categoria}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Savings Goals */}
      {data.obiettivi_risparmio && data.obiettivi_risparmio.length > 0 && (
        <Card header="Obiettivi di Risparmio" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            {data.obiettivi_risparmio.map((goal: any, index: number) => {
              const currentValue = goal.importo_accumulato || goal.importo_corrente || goal.importo_attuale || 0;
              const targetValue = goal.importo_target || goal.target || 1000;
              
              return (
                <div key={index}>
                  <ProgressBar
                    value={currentValue}
                    max={targetValue}
                    label={goal.nome || 'Obiettivo'}
                    showLabel
                    variant="default"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
