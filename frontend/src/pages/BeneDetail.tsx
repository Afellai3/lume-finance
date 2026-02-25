import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Car, Home, Wrench } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import TCOBreakdown from '../components/beni/TCOBreakdown';
import CostiTempoChart from '../components/charts/CostiTempoChart';
import { theme } from '../styles/theme';

interface BeneDetailProps {
  beneId: number;
  onBack: () => void;
}

interface Bene {
  id: number;
  nome: string;
  tipo: string;
  marca?: string;
  modello?: string;
  data_acquisto: string;
  prezzo_acquisto: number;
  stato: string;
  foto_url?: string;
  note?: string;
  eta_anni: number;
  eta_mesi: number;
  num_movimenti: number;
  
  // Vehicle
  veicolo_targa?: string;
  veicolo_km_iniziali?: number;
  veicolo_km_attuali?: number;
  veicolo_tipo_carburante?: string;
  veicolo_consumo_medio?: number;
  veicolo_ultima_revisione?: string;
  veicolo_assicurazione_annuale?: number;
  veicolo_bollo_annuale?: number;
  
  // Property
  immobile_indirizzo?: string;
  immobile_mq?: number;
  immobile_valore_catastale?: number;
  immobile_spese_condominiali_mensili?: number;
  immobile_imu_annuale?: number;
  
  // Equipment
  attrezzatura_serial_number?: string;
  attrezzatura_ore_utilizzo?: number;
  attrezzatura_costo_orario?: number;
}

interface Movimento {
  id: number;
  data: string;
  importo: number;
  descrizione: string;
  categoria_nome?: string;
  categoria_icona?: string;
  conto_nome?: string;
}

function BeneDetail({ beneId, onBack }: BeneDetailProps) {
  const [bene, setBene] = useState<Bene | null>(null);
  const [tcoData, setTcoData] = useState<any>(null);
  const [costiTempo, setCostiTempo] = useState<any[]>([]);
  const [movimenti, setMovimenti] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBeneData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch bene details
      const beneRes = await fetch(`/api/beni/${beneId}`);
      if (!beneRes.ok) throw new Error('Errore caricamento bene');
      const beneData = await beneRes.json();
      setBene(beneData);

      // Fetch TCO
      const tcoRes = await fetch(`/api/beni/${beneId}/tco`);
      if (tcoRes.ok) {
        const tco = await tcoRes.json();
        setTcoData(tco);
      }

      // Fetch costi tempo
      const costiRes = await fetch(`/api/beni/${beneId}/costi-tempo?period=6m`);
      if (costiRes.ok) {
        const costi = await costiRes.json();
        setCostiTempo(costi);
      }

      // Fetch movimenti
      const movimentiRes = await fetch(`/api/beni/${beneId}/movimenti`);
      if (movimentiRes.ok) {
        const mov = await movimentiRes.json();
        setMovimenti(mov);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneData();
  }, [beneId]);

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo bene?')) return;
    
    try {
      const response = await fetch(`/api/beni/${beneId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Errore eliminazione');
      alert('Bene eliminato!');
      onBack();
    } catch (err) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'veicolo': return <Car size={32} />;
      case 'immobile': return <Home size={32} />;
      default: return <Wrench size={32} />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
        <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>⏳</div>
        <p style={{ color: theme.colors.text.secondary }}>Caricamento dettagli bene...</p>
      </div>
    );
  }

  if (error || !bene) {
    return (
      <Card padding="xl">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: theme.colors.danger, marginBottom: theme.spacing.lg }}>
            {error || 'Bene non trovato'}
          </p>
          <Button variant="primary" onClick={onBack}>Torna alla lista</Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Breadcrumb + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
        >
          <ArrowLeft size={16} />
          Torna ai beni
        </Button>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => alert('Edit - Coming soon!')}
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
          >
            <Edit size={16} />
            Modifica
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={handleDelete}
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
          >
            <Trash2 size={16} />
            Elimina
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card padding="lg">
        <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${theme.colors.primary.DEFAULT}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.primary.DEFAULT,
            flexShrink: 0
          }}>
            {getTypeIcon(bene.tipo)}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary
              }}>
                {bene.nome}
              </h1>
              <Badge category={bene.tipo}>{bene.tipo}</Badge>
            </div>
            
            {(bene.marca || bene.modello) && (
              <p style={{ 
                margin: `${theme.spacing.xs} 0`,
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.secondary
              }}>
                {[bene.marca, bene.modello].filter(Boolean).join(' ')}
              </p>
            )}
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: theme.spacing.md,
              marginTop: theme.spacing.md
            }}>
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Data Acquisto</div>
                <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                  {formatDate(bene.data_acquisto)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Prezzo Acquisto</div>
                <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                  {formatCurrency(bene.prezzo_acquisto)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Età</div>
                <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.eta_anni} anni ({bene.eta_mesi} mesi)
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Type-specific info */}
      {bene.tipo === 'veicolo' && (
        <Card header="🚗 Dettagli Veicolo" padding="lg">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.md
          }}>
            {bene.veicolo_targa && (
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Targa</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.veicolo_targa}
                </div>
              </div>
            )}
            {bene.veicolo_km_attuali && (
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Chilometraggio</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.veicolo_km_attuali.toLocaleString('it-IT')} km
                </div>
              </div>
            )}
            {bene.veicolo_tipo_carburante && (
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Carburante</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.veicolo_tipo_carburante}
                </div>
              </div>
            )}
            {bene.veicolo_consumo_medio && (
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Consumo Medio</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.veicolo_consumo_medio} L/100km
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {bene.tipo === 'immobile' && (
        <Card header="🏠 Dettagli Immobile" padding="lg">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.md
          }}>
            {bene.immobile_indirizzo && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Indirizzo</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.immobile_indirizzo}
                </div>
              </div>
            )}
            {bene.immobile_mq && (
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Superficie</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.immobile_mq} mq
                </div>
              </div>
            )}
            {bene.immobile_valore_catastale && (
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Valore Catastale</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {formatCurrency(bene.immobile_valore_catastale)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {bene.tipo === 'attrezzatura' && bene.attrezzatura_serial_number && (
        <Card header="🔧 Dettagli Attrezzatura" padding="lg">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.md
          }}>
            <div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Serial Number</div>
              <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                {bene.attrezzatura_serial_number}
              </div>
            </div>
            {bene.attrezzatura_ore_utilizzo && (
              <div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>Ore Utilizzo</div>
                <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium }}>
                  {bene.attrezzatura_ore_utilizzo.toLocaleString('it-IT')} h
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TCO Breakdown */}
      <TCOBreakdown data={tcoData} loading={!tcoData} />

      {/* Costi nel Tempo */}
      <CostiTempoChart data={costiTempo} loading={false} />

      {/* Movimenti */}
      {movimenti.length > 0 && (
        <Card header={`💸 Movimenti Collegati (${movimenti.length})`} padding="md">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {movimenti.slice(0, 10).map((mov, index) => (
              <div
                key={mov.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  borderBottom: index < 9 && index < movimenti.length - 1 ? `1px solid ${theme.colors.border.light}` : 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.primary }}>
                    {mov.descrizione}
                  </div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
                    {formatDate(mov.data)} {mov.categoria_nome && `• ${mov.categoria_nome}`}
                  </div>
                </div>
                <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.danger }}>
                  {formatCurrency(mov.importo)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Note */}
      {bene.note && (
        <Card header="📝 Note" padding="lg">
          <p style={{ margin: 0, color: theme.colors.text.secondary, whiteSpace: 'pre-wrap' }}>
            {bene.note}
          </p>
        </Card>
      )}
    </div>
  );
}

export default BeneDetail;
