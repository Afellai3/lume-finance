import { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { theme } from '../styles/theme';

interface Obiettivo {
  id: number;
  nome: string;
  descrizione?: string;
  importo_target: number;
  importo_corrente: number;
  data_scadenza?: string;
  completato: boolean;
  icona?: string;
}

function Obiettivi() {
  const [obiettivi, setObiettivi] = useState<Obiettivo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchObiettivi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/obiettivi');
      if (response.ok) {
        const data = await response.json();
        setObiettivi(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObiettivi();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  const obiettiviAttivi = obiettivi.filter(o => !o.completato);
  const obiettiviCompletati = obiettivi.filter(o => o.completato);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <div>
          <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Obiettivi di Risparmio</h2>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            {obiettiviAttivi.length} attivi • {obiettiviCompletati.length} completati
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>Nuovo Obiettivo</Button>
      </div>

      {/* Empty State */}
      {obiettivi.length === 0 ? (
        <Card padding="xl">
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
            <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🎯</div>
            <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessun obiettivo impostato</h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Definisci i tuoi traguardi finanziari</p>
            <Button variant="primary" leftIcon={<Plus size={16} />}>Crea Obiettivo</Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Active Goals */}
          {obiettiviAttivi.length > 0 && (
            <div>
              <h3 style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
                In Corso
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {obiettiviAttivi.map((goal) => {
                  const percentuale = (goal.importo_corrente / goal.importo_target) * 100;
                  const daysRemaining = getDaysRemaining(goal.data_scadenza);
                  
                  return (
                    <Card key={goal.id} hoverable padding="lg">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
                        <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center', flex: 1 }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: theme.borderRadius.full,
                            backgroundColor: `${theme.colors.primary.DEFAULT}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: theme.typography.fontSize['3xl']
                          }}>
                            {goal.icona || '🎯'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                              {goal.nome}
                            </h4>
                            {goal.descrizione && (
                              <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                                {goal.descrizione}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary.DEFAULT }}>
                            {percentuale.toFixed(0)}%
                          </p>
                          {daysRemaining !== null && (
                            <Badge variant={daysRemaining < 30 ? 'warning' : 'info'} size="sm" style={{ marginTop: theme.spacing.xs }}>
                              <Calendar size={12} style={{ marginRight: theme.spacing.xs }} />
                              {daysRemaining > 0 ? `${daysRemaining}g` : 'Scaduto'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ProgressBar 
                        value={goal.importo_corrente} 
                        max={goal.importo_target} 
                        label={`${formatCurrency(goal.importo_corrente)} / ${formatCurrency(goal.importo_target)}`}
                        showLabel
                        variant="default"
                      />
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {obiettiviCompletati.length > 0 && (
            <div>
              <h3 style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
                Completati
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: theme.spacing.md }}>
                {obiettiviCompletati.map((goal) => (
                  <Card key={goal.id} hoverable padding="lg">
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: theme.borderRadius.full,
                        backgroundColor: `${theme.colors.success}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: theme.typography.fontSize['2xl']
                      }}>
                        ✅
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }}>
                          {goal.nome}
                        </h4>
                        <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.success }}>
                          {formatCurrency(goal.importo_target)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Obiettivi;
