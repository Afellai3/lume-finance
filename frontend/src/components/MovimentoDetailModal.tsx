import { useEffect, useState } from 'react';
import { X, Calendar, Tag, CreditCard, Target, PieChart, Package } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { theme, getCategoryColor } from '../styles/theme';

interface Movimento {
  id: number;
  descrizione: string;
  importo: number;
  data: string;
  tipo: 'entrata' | 'uscita';
  categoria_id?: number;
  categoria_nome?: string;
  categoria_icona?: string;
  conto_id?: number;
  conto_nome?: string;
  budget_id?: number;
  budget_categoria_nome?: string;
  obiettivo_id?: number;
  obiettivo_nome?: string;
  obiettivo_target?: number;
  bene_id?: number;
  bene_nome?: string;
  bene_tipo?: string;
  km_percorsi?: number;
  ore_utilizzo?: number;
  note?: string;
  ricorrente?: boolean;
}

interface ScomposizioneComponente {
  nome: string;
  valore: number;
  percentuale?: number;
  dettagli?: string;
}

interface Scomposizione {
  totale: number;
  componenti: ScomposizioneComponente[];
}

interface MovimentoDetailModalProps {
  movimento: Movimento | null;
  onClose: () => void;
}

export default function MovimentoDetailModal({ movimento, onClose }: MovimentoDetailModalProps) {
  const [scomposizione, setScomposizione] = useState<Scomposizione | null>(null);
  const [loadingScomposizione, setLoadingScomposizione] = useState(false);

  useEffect(() => {
    // Close on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    // Fetch scomposizione if movimento has bene_id
    if (movimento?.bene_id) {
      fetchScomposizione();
    } else {
      setScomposizione(null);
    }
  }, [movimento]);

  const fetchScomposizione = async () => {
    if (!movimento?.id) return;
    
    setLoadingScomposizione(true);
    try {
      const response = await fetch(`/api/movimenti/${movimento.id}/scomposizione`);
      if (response.ok) {
        const data = await response.json();
        setScomposizione(data);
      }
    } catch (error) {
      console.error('Errore caricamento scomposizione:', error);
    } finally {
      setLoadingScomposizione(false);
    }
  };

  if (!movimento) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: theme.spacing.lg,
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.xl,
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.xl,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  const bodyStyles: React.CSSProperties = {
    padding: theme.spacing.xl,
  };

  const sectionStyles: React.CSSProperties = {
    marginBottom: theme.spacing.lg,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  };

  const valueStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const rowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} 0`,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: theme.borderRadius.lg,
                backgroundColor: `${getCategoryColor(movimento.categoria_nome || 'altro')}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize['3xl'],
              }}>
                {movimento.categoria_icona || (movimento.tipo === 'entrata' ? '⬆️' : '⬇️')}
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}>
                  {movimento.descrizione}
                </h3>
                <p style={{
                  margin: `${theme.spacing.xs} 0 0 0`,
                  fontSize: theme.typography.fontSize['3xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: movimento.tipo === 'entrata' ? theme.colors.success : theme.colors.danger,
                }}>
                  {movimento.tipo === 'entrata' ? '+' : '-'}{formatCurrency(Math.abs(movimento.importo))}
                </p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Body */}
        <div style={bodyStyles}>
          {/* Basic Info */}
          <div style={sectionStyles}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: theme.spacing.md }}>
              <div>
                <div style={labelStyles}>
                  <Calendar size={16} />
                  Data
                </div>
                <div style={valueStyles}>{formatDate(movimento.data)}</div>
              </div>
              <div>
                <div style={labelStyles}>
                  <Tag size={16} />
                  Tipo
                </div>
                <Badge variant={movimento.tipo === 'entrata' ? 'success' : 'danger'}>
                  {movimento.tipo === 'entrata' ? 'Entrata' : 'Uscita'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Category and Account */}
          <div style={sectionStyles}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: theme.spacing.md }}>
              {movimento.categoria_nome && (
                <div>
                  <div style={labelStyles}>
                    <Tag size={16} />
                    Categoria
                  </div>
                  <Badge category={movimento.categoria_nome}>
                    {movimento.categoria_nome}
                  </Badge>
                </div>
              )}
              {movimento.conto_nome && (
                <div>
                  <div style={labelStyles}>
                    <CreditCard size={16} />
                    Conto
                  </div>
                  <div style={valueStyles}>{movimento.conto_nome}</div>
                </div>
              )}
            </div>
          </div>

          {/* Budget and Goal */}
          {(movimento.budget_categoria_nome || movimento.obiettivo_nome) && (
            <div style={sectionStyles}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: theme.spacing.md }}>
                {movimento.budget_categoria_nome && (
                  <div>
                    <div style={labelStyles}>
                      <PieChart size={16} />
                      Budget
                    </div>
                    <Badge variant="info">{movimento.budget_categoria_nome}</Badge>
                  </div>
                )}
                {movimento.obiettivo_nome && (
                  <div>
                    <div style={labelStyles}>
                      <Target size={16} />
                      Obiettivo
                    </div>
                    <div style={valueStyles}>
                      {movimento.obiettivo_nome}
                      {movimento.obiettivo_target && (
                        <span style={{ 
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary,
                          marginLeft: theme.spacing.xs 
                        }}>
                          ({formatCurrency(movimento.obiettivo_target)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Asset Info */}
          {movimento.bene_nome && (
            <div style={sectionStyles}>
              <div style={labelStyles}>
                <Package size={16} />
                Bene Collegato
              </div>
              <div style={valueStyles}>
                {movimento.bene_nome}
                <span style={{ 
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginLeft: theme.spacing.xs 
                }}>
                  ({movimento.bene_tipo})
                </span>
              </div>
              {movimento.km_percorsi && (
                <div style={{ 
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs 
                }}>
                  📍 {movimento.km_percorsi} km percorsi
                </div>
              )}
              {movimento.ore_utilizzo && (
                <div style={{ 
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs 
                }}>
                  ⏱️ {movimento.ore_utilizzo} ore utilizzo
                </div>
              )}
            </div>
          )}

          {/* Cost Breakdown */}
          {movimento.bene_id && (
            <div style={sectionStyles}>
              <div style={{
                ...labelStyles,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md,
              }}>
                🔍 Scomposizione Costi
              </div>
              
              {loadingScomposizione ? (
                <div style={{ textAlign: 'center', padding: theme.spacing.lg, color: theme.colors.text.secondary }}>
                  Caricamento...
                </div>
              ) : scomposizione ? (
                <Card padding="md" style={{ backgroundColor: theme.colors.background }}>
                  {scomposizione.componenti.map((comp, index) => (
                    <div key={index} style={rowStyles}>
                      <div>
                        <div style={{ 
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary 
                        }}>
                          {comp.nome}
                        </div>
                        {comp.dettagli && (
                          <div style={{ 
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.text.muted,
                            marginTop: '2px'
                          }}>
                            {comp.dettagli}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: theme.typography.fontSize.base,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text.primary,
                        }}>
                          {formatCurrency(comp.valore)}
                        </div>
                        {comp.percentuale !== undefined && (
                          <div style={{
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.text.muted,
                          }}>
                            {comp.percentuale.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{
                    ...rowStyles,
                    borderBottom: 'none',
                    paddingTop: theme.spacing.md,
                    marginTop: theme.spacing.sm,
                    borderTop: `2px solid ${theme.colors.border.DEFAULT}`,
                  }}>
                    <div style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text.primary,
                    }}>
                      Totale Effettivo
                    </div>
                    <div style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.primary.DEFAULT,
                    }}>
                      {formatCurrency(scomposizione.totale)}
                    </div>
                  </div>
                </Card>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: theme.spacing.md,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm 
                }}>
                  Scomposizione non disponibile
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          {movimento.ricorrente && (
            <div style={sectionStyles}>
              <Badge variant="info">🔄 Movimento Ricorrente</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
