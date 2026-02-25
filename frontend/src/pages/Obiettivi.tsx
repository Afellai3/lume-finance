import { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { theme } from '../styles/theme';
import ObiettivoForm from '../components/ObiettivoForm';

interface Obiettivo {
  id: number;
  nome: string;
  descrizione?: string;
  importo_target: number;
  importo_attuale: number;
  importo_corrente?: number;
  data_target?: string;
  data_scadenza?: string;
  completato: boolean;
  priorita: number;
  icona?: string;
}

interface Movimento {
  id: number;
  importo: number;
  tipo: string;
  obiettivo_id?: number;
}

function Obiettivi() {
  const [obiettivi, setObiettivi] = useState<Obiettivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingObiettivo, setEditingObiettivo] = useState<Obiettivo | null>(null);

  const fetchObiettivi = async () => {
    setLoading(true);
    try {
      // Fetch obiettivi structure
      const obiettiviResponse = await fetch('/api/obiettivi');
      if (!obiettiviResponse.ok) {
        setObiettivi([]);
        setLoading(false);
        return;
      }
      
      const obiettiviData = await obiettiviResponse.json();
      
      // Fetch ALL movements to calculate actual amounts
      const movimentiResponse = await fetch('/api/movimenti?per_page=1000');
      let movimenti: Movimento[] = [];
      
      if (movimentiResponse.ok) {
        const movimentiData = await movimentiResponse.json();
        movimenti = movimentiData.items || movimentiData || [];
      }
      
      // Calculate importo_attuale for each obiettivo by summing movements
      const obiettiviWithAmounts = obiettiviData.map((obiettivo: Obiettivo) => {
        // Sum all income movements (entrata) linked to this obiettivo
        const importoCalcolato = movimenti
          .filter((m: Movimento) => m.obiettivo_id === obiettivo.id && m.tipo === 'entrata')
          .reduce((sum: number, m: Movimento) => sum + (m.importo || 0), 0);
        
        return {
          ...obiettivo,
          importo_attuale: importoCalcolato,
          importo_corrente: importoCalcolato
        };
      });
      
      setObiettivi(obiettiviWithAmounts);
    } catch (error) {
      console.error('Errore:', error);
      setObiettivi([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObiettivi();
  }, []);

  const handleCreate = () => {
    setEditingObiettivo(null);
    setShowForm(true);
  };

  const handleEdit = (obiettivo: Obiettivo) => {
    setEditingObiettivo(obiettivo);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingObiettivo(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchObiettivi();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo obiettivo?')) return;
    try {
      const response = await fetch(`/api/obiettivi/${id}`, { method: 'DELETE' });
      if (response.ok) fetchObiettivi();
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

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

  const calculatePercentage = (current: number, target: number): number => {
    const safeCurrent = current ?? 0;
    const safeTarget = target ?? 0;
    
    if (safeTarget === 0) return 0;
    return (safeCurrent / safeTarget) * 100;
  };

  if (loading) {
    return <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.secondary }}>Caricamento...</div>;
  }

  const obiettiviAttivi = obiettivi.filter(o => !o.completato);
  const obiettiviCompletati = obiettivi.filter(o => o.completato);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <div>
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary }}>Obiettivi di Risparmio</h2>
            <p style={{ margin: `${theme.spacing.xs} 0 0 0`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              {obiettiviAttivi.length} attivi • {obiettiviCompletati.length} completati
            </p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={handleCreate}>
            Nuovo Obiettivo
          </Button>
        </div>

        {/* Empty State */}
        {obiettivi.length === 0 ? (
          <Card padding="xl">
            <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🎯</div>
              <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessun obiettivo impostato</h3>
              <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>Definisci i tuoi traguardi finanziari</p>
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreate}>
                Crea Obiettivo
              </Button>
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
                    const importoCurrent = goal.importo_attuale ?? goal.importo_corrente ?? 0;
                    const percentuale = calculatePercentage(importoCurrent, goal.importo_target);
                    const daysRemaining = getDaysRemaining(goal.data_target || goal.data_scadenza);
                    
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                              <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />} onClick={() => handleEdit(goal)} />
                              <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => handleDelete(goal.id)} />
                            </div>
                          </div>
                        </div>
                        <ProgressBar 
                          value={importoCurrent} 
                          max={goal.importo_target || 1} 
                          label={`${formatCurrency(importoCurrent)} / ${formatCurrency(goal.importo_target)}`}
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
                            {formatCurrency(goal.importo_target || 0)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => handleDelete(goal.id)} />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ObiettivoForm
          obiettivo={editingObiettivo}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}

export default Obiettivi;
