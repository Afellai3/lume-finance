import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { theme, getCategoryColor } from '../styles/theme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/dashboard?');
      if (!response.ok) throw new Error('Errore caricamento dashboard');
      const dashboardData = await response.json();
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
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
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

  const balanceCardStyles: React.CSSProperties = {
    background: theme.colors.primary.gradient,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.primary,
    color: theme.colors.text.white,
  };

  return (
    <div style={containerStyles}>
      {/* Period Filter */}
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
        <div style={{ display: 'flex', gap: theme.spacing.xl, marginTop: theme.spacing.lg }}>
          <div>
            <p style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>Entrate</p>
            <p style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>
              {formatCurrency(data.kpi.entrate_mese)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>Uscite</p>
            <p style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>
              {formatCurrency(data.kpi.uscite_mese)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>Saldo</p>
            <p style={{ 
              fontSize: theme.typography.fontSize.lg, 
              fontWeight: theme.typography.fontWeight.semibold,
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

      {/* Category Spending Chart */}
      {data.spese_per_categoria.length > 0 && (
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
      {data.ultimi_movimenti.length > 0 && (
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
                      {movimento.descrizione}
                    </p>
                    <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      {new Date(movimento.data).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: movimento.tipo === 'entrata' ? theme.colors.success : theme.colors.danger
                  }}>
                    {movimento.tipo === 'entrata' ? '+' : '-'}{formatCurrency(Math.abs(movimento.importo))}
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
      {data.obiettivi_risparmio.length > 0 && (
        <Card header="Obiettivi di Risparmio" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            {data.obiettivi_risparmio.map((goal: any, index: number) => (
              <div key={index}>
                <ProgressBar
                  value={goal.importo_accumulato}
                  max={goal.importo_target}
                  label={goal.nome}
                  showLabel
                  variant="default"
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
