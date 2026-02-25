import { useState, useEffect } from 'react';
import { Plus, Car, Home, Wrench, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';

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
  
  // Computed
  eta_anni: number;
  totale_spese: number;
  tco_totale: number;
  costo_per_km?: number;
  costo_per_ora?: number;
  
  // Type-specific
  veicolo_targa?: string;
  veicolo_km_attuali?: number;
  immobile_indirizzo?: string;
  immobile_mq?: number;
  attrezzatura_serial_number?: string;
  attrezzatura_ore_utilizzo?: number;
}

function Beni() {
  const navigate = useNavigate();
  const [beni, setBeni] = useState<Bene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBeni = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = '/api/beni?';
      
      if (tipoFilter !== 'all') {
        url += `tipo=${tipoFilter}&`;
      }
      
      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Errore caricamento beni');
      }
      
      const data = await response.json();
      setBeni(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeni();
  }, [tipoFilter]);

  const handleSearch = () => {
    fetchBeni();
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'veicolo':
        return <Car size={24} />;
      case 'immobile':
        return <Home size={24} />;
      case 'attrezzatura':
      case 'elettrodomestico':
        return <Wrench size={24} />;
      default:
        return <Wrench size={24} />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      veicolo: 'Veicolo',
      immobile: 'Immobile',
      attrezzatura: 'Attrezzatura',
      elettrodomestico: 'Elettrodomestico',
      altro: 'Altro'
    };
    return labels[tipo] || tipo;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredBeni = beni;

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
            📦 Beni
          </h1>
          <p style={{ 
            margin: `${theme.spacing.xs} 0 0 0`, 
            fontSize: theme.typography.fontSize.sm, 
            color: theme.colors.text.secondary 
          }}>
            Gestisci i tuoi beni e calcola il TCO
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/beni/nuovo')}
          style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
        >
          <Plus size={18} />
          Nuovo Bene
        </Button>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          {/* Type filters */}
          <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            <Button
              variant={tipoFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTipoFilter('all')}
            >
              Tutti
            </Button>
            <Button
              variant={tipoFilter === 'veicolo' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTipoFilter('veicolo')}
              style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
            >
              <Car size={16} />
              Veicoli
            </Button>
            <Button
              variant={tipoFilter === 'immobile' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTipoFilter('immobile')}
              style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
            >
              <Home size={16} />
              Immobili
            </Button>
            <Button
              variant={tipoFilter === 'attrezzatura' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTipoFilter('attrezzatura')}
              style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
            >
              <Wrench size={16} />
              Attrezzature
            </Button>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: theme.colors.text.secondary
                }} 
              />
              <input
                type="text"
                placeholder="Cerca per nome, marca o modello..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  width: '100%',
                  padding: `${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} 40px`,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none',
                  transition: `border-color ${theme.transitions.base}`,
                }}
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>
              Cerca
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>⏳</div>
          <p style={{ color: theme.colors.text.secondary }}>Caricamento beni...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card padding="xl">
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: theme.colors.danger, marginBottom: theme.spacing.lg }}>{error}</p>
            <Button variant="primary" onClick={fetchBeni}>Riprova</Button>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && filteredBeni.length === 0 && (
        <Card padding="xl">
          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing.md
          }}>
            <div style={{ fontSize: '64px' }}>📦</div>
            <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
              {tipoFilter === 'all' ? 'Nessun bene trovato' : `Nessun ${getTypeLabel(tipoFilter).toLowerCase()} trovato`}
            </h3>
            <p style={{ margin: 0, color: theme.colors.text.secondary }}>
              Inizia aggiungendo il tuo primo bene per tracciarne i costi
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/beni/nuovo')}
              style={{ marginTop: theme.spacing.md }}
            >
              <Plus size={18} style={{ marginRight: theme.spacing.xs }} />
              Crea Primo Bene
            </Button>
          </div>
        </Card>
      )}

      {/* Beni grid */}
      {!loading && !error && filteredBeni.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: theme.spacing.lg
        }}>
          {filteredBeni.map((bene) => (
            <Card 
              key={bene.id}
              hoverable
              padding="lg"
              onClick={() => navigate(`/beni/${bene.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {bene.nome}
                    </h3>
                    {(bene.marca || bene.modello) && (
                      <p style={{ 
                        margin: `${theme.spacing.xs} 0 0 0`,
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary
                      }}>
                        {[bene.marca, bene.modello].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Type-specific info */}
                <div style={{ 
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm
                }}>
                  {bene.tipo === 'veicolo' && (
                    <>
                      {bene.veicolo_targa && (
                        <div style={{ color: theme.colors.text.secondary }}>
                          🅿️ Targa: <strong>{bene.veicolo_targa}</strong>
                        </div>
                      )}
                      {bene.veicolo_km_attuali && (
                        <div style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
                          📏 {bene.veicolo_km_attuali.toLocaleString('it-IT')} km
                        </div>
                      )}
                    </>
                  )}
                  {bene.tipo === 'immobile' && (
                    <>
                      {bene.immobile_indirizzo && (
                        <div style={{ color: theme.colors.text.secondary }}>
                          📍 {bene.immobile_indirizzo}
                        </div>
                      )}
                      {bene.immobile_mq && (
                        <div style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
                          📏 {bene.immobile_mq} mq
                        </div>
                      )}
                    </>
                  )}
                  {bene.tipo === 'attrezzatura' && bene.attrezzatura_ore_utilizzo && (
                    <div style={{ color: theme.colors.text.secondary }}>
                      ⏱️ {bene.attrezzatura_ore_utilizzo.toLocaleString('it-IT')} ore
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.xs
                    }}>
                      TCO Totale
                    </div>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text.primary
                    }}>
                      {formatCurrency(bene.tco_totale)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary
                    }}>
                      Età: {bene.eta_anni} anni
                    </div>
                    {bene.costo_per_km && (
                      <div style={{ 
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.primary.DEFAULT,
                        marginTop: theme.spacing.xs
                      }}>
                        {bene.costo_per_km.toFixed(2)} €/km
                      </div>
                    )}
                    {bene.costo_per_ora && (
                      <div style={{ 
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.primary.DEFAULT,
                        marginTop: theme.spacing.xs
                      }}>
                        {bene.costo_per_ora.toFixed(2)} €/h
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Beni;
