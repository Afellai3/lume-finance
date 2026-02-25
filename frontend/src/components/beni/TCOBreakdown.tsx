import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { theme } from '../../styles/theme';

interface TCOData {
  costi_diretti: { [key: string]: number };
  costi_fissi: number;
  ammortamento: number;
  valore_residuo: number;
  totale_costi_diretti: number;
  tco_totale: number;
  metriche: {
    eta_anni: number;
    prezzo_acquisto: number;
    num_movimenti: number;
    km_totali?: number;
    costo_per_km?: number;
    ore_utilizzo?: number;
    costo_per_ora?: number;
    mq?: number;
    costo_per_mq?: number;
  };
}

interface TCOBreakdownProps {
  data: TCOData | null;
  loading?: boolean;
}

const COLORS = [
  theme.colors.primary.DEFAULT,
  theme.colors.success,
  theme.colors.warning,
  theme.colors.danger,
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#a4de6c',
  '#d0ed57'
];

export default function TCOBreakdown({ data, loading = false }: TCOBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Card header="💰 TCO Dettagliato" padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          color: theme.colors.text.secondary 
        }}>
          Caricamento TCO...
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card header="💰 TCO Dettagliato" padding="lg">
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          color: theme.colors.text.secondary 
        }}>
          Nessun dato TCO disponibile
        </div>
      </Card>
    );
  }

  // Prepara dati per il grafico
  const chartData: Array<{ name: string; value: number; percentage: number }> = [];
  
  // Aggiungi costi diretti per categoria
  Object.entries(data.costi_diretti).forEach(([categoria, valore]) => {
    if (valore > 0) {
      chartData.push({
        name: categoria,
        value: valore,
        percentage: (valore / data.tco_totale) * 100
      });
    }
  });

  // Aggiungi costi fissi se presenti
  if (data.costi_fissi > 0) {
    chartData.push({
      name: 'Costi Fissi',
      value: data.costi_fissi,
      percentage: (data.costi_fissi / data.tco_totale) * 100
    });
  }

  // Aggiungi ammortamento
  if (data.ammortamento > 0) {
    chartData.push({
      name: 'Ammortamento',
      value: data.ammortamento,
      percentage: (data.ammortamento / data.tco_totale) * 100
    });
  }

  // Ordina per valore decrescente
  chartData.sort((a, b) => b.value - a.value);

  const hasData = chartData.length > 0;

  return (
    <Card padding="lg">
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        }}>
          💰 Total Cost of Ownership (TCO)
        </h3>
        <p style={{
          margin: `${theme.spacing.xs} 0 0 0`,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          Costo totale di possesso scomposto
        </p>
      </div>

      {/* Total TCO */}
      <div style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.primary.gradient,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
        color: theme.colors.text.white
      }}>
        <div style={{ 
          fontSize: theme.typography.fontSize.sm,
          opacity: 0.9,
          marginBottom: theme.spacing.xs
        }}>
          TCO Totale
        </div>
        <div style={{ 
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold
        }}>
          {formatCurrency(data.tco_totale)}
        </div>
        {data.metriche.eta_anni > 0 && (
          <div style={{ 
            fontSize: theme.typography.fontSize.sm,
            opacity: 0.8,
            marginTop: theme.spacing.xs
          }}>
            in {data.metriche.eta_anni} anni
          </div>
        )}
      </div>

      {/* Metriche chiave */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg
      }}>
        {data.metriche.costo_per_km && (
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs
            }}>
              Costo per km
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.primary.DEFAULT
            }}>
              {data.metriche.costo_per_km.toFixed(2)} €/km
            </div>
          </div>
        )}
        {data.metriche.costo_per_ora && (
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs
            }}>
              Costo per ora
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.primary.DEFAULT
            }}>
              {data.metriche.costo_per_ora.toFixed(2)} €/h
            </div>
          </div>
        )}
        {data.metriche.costo_per_mq && (
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs
            }}>
              Costo per mq
            </div>
            <div style={{ 
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.primary.DEFAULT
            }}>
              {data.metriche.costo_per_mq.toFixed(2)} €/mq
            </div>
          </div>
        )}
      </div>

      {/* Pie Chart */}
      {hasData && (
        <div style={{ marginBottom: theme.spacing.lg }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: theme.colors.surface, 
                  border: `1px solid ${theme.colors.border.light}`,
                  borderRadius: theme.borderRadius.md
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breakdown list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        {chartData.map((item, index) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.md,
              borderLeft: `4px solid ${COLORS[index % COLORS.length]}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: COLORS[index % COLORS.length]
                }}
              />
              <span style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}>
                {item.name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <span style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                {item.percentage.toFixed(1)}%
              </span>
              <span style={{ 
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                minWidth: '80px',
                textAlign: 'right'
              }}>
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Valore residuo */}
      {data.valore_residuo > 0 && (
        <div style={{
          marginTop: theme.spacing.md,
          padding: theme.spacing.md,
          backgroundColor: `${theme.colors.success}20`,
          borderRadius: theme.borderRadius.md,
          borderLeft: `4px solid ${theme.colors.success}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ 
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.primary
            }}>
              ✅ Valore Residuo (sottratto)
            </span>
            <span style={{ 
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.success
            }}>
              -{formatCurrency(data.valore_residuo)}
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div style={{ 
          textAlign: 'center', 
          padding: theme.spacing.xl,
          color: theme.colors.text.secondary 
        }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>📊</div>
          <p style={{ margin: 0 }}>Nessun costo registrato per questo bene</p>
        </div>
      )}
    </Card>
  );
}
