import { useState, useEffect } from 'react';
import { X, Calendar, Repeat } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { theme } from '../../styles/theme';

interface Conto {
  id: number;
  nome: string;
}

interface Categoria {
  id: number;
  nome: string;
  tipo: string;
}

interface RicorrenzeFormProps {
  ricorrenza?: any;
  onSuccess: () => void;
  onClose: () => void;
}

type Frequenza = 'giornaliera' | 'settimanale' | 'mensile' | 'annuale';

function RicorrenzeForm({ ricorrenza, onSuccess, onClose }: RicorrenzeFormProps) {
  const [conti, setConti] = useState<Conto[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    descrizione: ricorrenza?.descrizione || '',
    importo: ricorrenza?.importo || '',
    tipo: ricorrenza?.tipo || 'uscita',
    frequenza: (ricorrenza?.frequenza || 'mensile') as Frequenza,
    giorno_mese: ricorrenza?.giorno_mese || '',
    giorno_settimana: ricorrenza?.giorno_settimana || '',
    mese: ricorrenza?.mese || '',
    data_inizio: ricorrenza?.data_inizio || new Date().toISOString().split('T')[0],
    data_fine: ricorrenza?.data_fine || '',
    prossima_data: ricorrenza?.prossima_data?.split('T')[0] || new Date().toISOString().split('T')[0],
    conto_id: ricorrenza?.conto_id || '',
    categoria_id: ricorrenza?.categoria_id || '',
    note: ricorrenza?.note || ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contiRes, catRes] = await Promise.all([
        fetch('/api/conti'),
        fetch('/api/movimenti/categorie')
      ]);

      if (contiRes.ok) setConti(await contiRes.json());
      if (catRes.ok) setCategorie(await catRes.json());
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validazione
    if (!formData.descrizione.trim()) {
      setError('Inserisci una descrizione');
      return;
    }

    const importo = parseFloat(formData.importo);
    if (!importo || importo <= 0) {
      setError('Inserisci un importo valido');
      return;
    }

    // Validazione campi frequenza
    if (formData.frequenza === 'settimanale' && !formData.giorno_settimana) {
      setError('Seleziona il giorno della settimana');
      return;
    }

    if (formData.frequenza === 'mensile' && !formData.giorno_mese) {
      setError('Inserisci il giorno del mese');
      return;
    }

    if (formData.frequenza === 'annuale') {
      if (!formData.giorno_mese || !formData.mese) {
        setError('Inserisci giorno e mese per la ricorrenza annuale');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        descrizione: formData.descrizione,
        importo: parseFloat(formData.importo),
        tipo: formData.tipo,
        frequenza: formData.frequenza,
        giorno_mese: formData.giorno_mese ? parseInt(formData.giorno_mese) : null,
        giorno_settimana: formData.giorno_settimana ? parseInt(formData.giorno_settimana) : null,
        mese: formData.mese ? parseInt(formData.mese) : null,
        data_inizio: formData.data_inizio,
        data_fine: formData.data_fine || null,
        prossima_data: formData.prossima_data,
        attivo: true,
        conto_id: formData.conto_id ? parseInt(formData.conto_id) : null,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        note: formData.note || null
      };

      const url = ricorrenza 
        ? `/api/ricorrenze/${ricorrenza.id}` 
        : '/api/ricorrenze';

      const method = ricorrenza ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Errore durante il salvataggio');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const giorni_settimana = [
    { value: 0, label: 'Lunedì' },
    { value: 1, label: 'Martedì' },
    { value: 2, label: 'Mercoledì' },
    { value: 3, label: 'Giovedì' },
    { value: 4, label: 'Venerdì' },
    { value: 5, label: 'Sabato' },
    { value: 6, label: 'Domenica' }
  ];

  const mesi = [
    { value: 1, label: 'Gennaio' },
    { value: 2, label: 'Febbraio' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Aprile' },
    { value: 5, label: 'Maggio' },
    { value: 6, label: 'Giugno' },
    { value: 7, label: 'Luglio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Settembre' },
    { value: 10, label: 'Ottobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Dicembre' }
  ];

  const categorieFiltered = categorie.filter(c => c.tipo === formData.tipo);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: theme.spacing.md
    }}>
      <Card 
        padding="lg" 
        style={{ 
          maxWidth: '700px', 
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: theme.spacing.lg
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary
          }}>
            {ricorrenza ? '✏️ Modifica' : '➕ Nuova'} Ricorrenza
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ padding: theme.spacing.xs }}
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          {/* Descrizione */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Descrizione *
            </label>
            <Input
              type="text"
              value={formData.descrizione}
              onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
              placeholder="Es: Stipendio, Affitto, Abbonamento Netflix"
              required
              fullWidth
            />
          </div>

          {/* Tipo e Importo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: theme.spacing.md }}>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'entrata' | 'uscita', categoria_id: '' })}
                required
                style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
              >
                <option value="entrata">Entrata</option>
                <option value="uscita">Uscita</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Importo (€) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.importo}
                onChange={(e) => setFormData({ ...formData, importo: e.target.value })}
                placeholder="0.00"
                required
                fullWidth
              />
            </div>
          </div>

          {/* Frequenza */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              <Repeat size={14} style={{ marginRight: theme.spacing.xs, verticalAlign: 'text-bottom' }} />
              Frequenza *
            </label>
            <select
              value={formData.frequenza}
              onChange={(e) => setFormData({ 
                ...formData, 
                frequenza: e.target.value as Frequenza,
                giorno_mese: '',
                giorno_settimana: '',
                mese: ''
              })}
              required
              style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
            >
              <option value="giornaliera">Giornaliera</option>
              <option value="settimanale">Settimanale</option>
              <option value="mensile">Mensile</option>
              <option value="annuale">Annuale</option>
            </select>
          </div>

          {/* Campi specifici per frequenza */}
          {formData.frequenza === 'settimanale' && (
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Giorno della Settimana *
              </label>
              <select
                value={formData.giorno_settimana}
                onChange={(e) => setFormData({ ...formData, giorno_settimana: e.target.value })}
                required
                style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
              >
                <option value="">Seleziona giorno</option>
                {giorni_settimana.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          )}

          {formData.frequenza === 'mensile' && (
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Giorno del Mese (1-31) *
              </label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.giorno_mese}
                onChange={(e) => setFormData({ ...formData, giorno_mese: e.target.value })}
                placeholder="Es: 27"
                required
                fullWidth
              />
            </div>
          )}

          {formData.frequenza === 'annuale' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: theme.spacing.md }}>
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                  Giorno *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.giorno_mese}
                  onChange={(e) => setFormData({ ...formData, giorno_mese: e.target.value })}
                  placeholder="Giorno"
                  required
                  fullWidth
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                  Mese *
                </label>
                <select
                  value={formData.mese}
                  onChange={(e) => setFormData({ ...formData, mese: e.target.value })}
                  required
                  style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
                >
                  <option value="">Seleziona mese</option>
                  {mesi.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Conto e Categoria */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Conto
              </label>
              <select
                value={formData.conto_id}
                onChange={(e) => setFormData({ ...formData, conto_id: e.target.value })}
                style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
              >
                <option value="">Nessuno</option>
                {conti.map(conto => (
                  <option key={conto.id} value={conto.id}>{conto.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Categoria
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border.light}` }}
              >
                <option value="">Nessuna</option>
                {categorieFiltered.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: theme.spacing.md }}>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                <Calendar size={14} style={{ marginRight: theme.spacing.xs, verticalAlign: 'text-bottom' }} />
                Data Inizio *
              </label>
              <Input
                type="date"
                value={formData.data_inizio}
                onChange={(e) => setFormData({ ...formData, data_inizio: e.target.value })}
                required
                fullWidth
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Prossima Esecuzione *
              </label>
              <Input
                type="date"
                value={formData.prossima_data}
                onChange={(e) => setFormData({ ...formData, prossima_data: e.target.value })}
                required
                fullWidth
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                Data Fine (opzionale)
              </label>
              <Input
                type="date"
                value={formData.data_fine}
                onChange={(e) => setFormData({ ...formData, data_fine: e.target.value })}
                fullWidth
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Note aggiuntive..."
              rows={3}
              style={{ 
                width: '100%', 
                padding: theme.spacing.sm, 
                borderRadius: theme.borderRadius.md, 
                border: `1px solid ${theme.colors.border.light}`,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ 
              padding: theme.spacing.sm, 
              backgroundColor: `${theme.colors.danger}20`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.danger
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'flex-end', marginTop: theme.spacing.md }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : ricorrenza ? 'Aggiorna' : 'Crea Ricorrenza'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default RicorrenzeForm;
