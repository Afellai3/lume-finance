import { useState, useEffect } from 'react';
import { Save, X, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

interface ObiettivoFormProps {
  obiettivoId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  nome: string;
  descrizione: string;
  importo_target: string;
  data_target: string;
  priorita: number;
  categoria_id: string;
}

interface Categoria {
  id: number;
  nome: string;
  icona?: string;
}

const initialFormData: FormData = {
  nome: '',
  descrizione: '',
  importo_target: '',
  data_target: '',
  priorita: 3,
  categoria_id: '',
};

export default function ObiettivoForm({ obiettivoId, onSuccess, onCancel }: ObiettivoFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!obiettivoId);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategorie();
    if (obiettivoId) {
      fetchObiettivoData();
    }
  }, [obiettivoId]);

  const fetchCategorie = async () => {
    try {
      const response = await fetch('/api/categorie');
      if (!response.ok) throw new Error('Errore caricamento categorie');
      const data = await response.json();
      setCategorie(data);
    } catch (err) {
      setError('Errore caricamento categorie');
    }
  };

  const fetchObiettivoData = async () => {
    try {
      const response = await fetch(`/api/obiettivi/${obiettivoId}`);
      if (!response.ok) throw new Error('Errore caricamento obiettivo');
      
      const data = await response.json();
      
      setFormData({
        nome: data.nome || '',
        descrizione: data.descrizione || '',
        importo_target: String(data.importo_target || ''),
        data_target: data.data_target ? data.data_target.split('T')[0] : '',
        priorita: data.priorita || 3,
        categoria_id: String(data.categoria_id || ''),
      });
    } catch (err) {
      setError('Errore caricamento dati');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.nome || !formData.importo_target) {
        throw new Error('Nome e importo target sono obbligatori');
      }

      const payload: any = {
        nome: formData.nome,
        importo_target: parseFloat(formData.importo_target),
        priorita: formData.priorita,
      };

      if (formData.descrizione) payload.descrizione = formData.descrizione;
      if (formData.data_target) payload.data_target = formData.data_target;
      if (formData.categoria_id) payload.categoria_id = parseInt(formData.categoria_id);

      const url = obiettivoId ? `/api/obiettivi/${obiettivoId}` : '/api/obiettivi';
      const method = obiettivoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Errore salvataggio');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card padding="xl">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: theme.colors.text.secondary }}>Caricamento dati...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary
          }}>
            {obiettivoId ? 'Modifica Obiettivo' : 'Nuovo Obiettivo di Risparmio'}
          </h2>
        </div>

        {error && (
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: `${theme.colors.danger}20`,
            border: `1px solid ${theme.colors.danger}`,
            borderRadius: theme.borderRadius.md,
            color: theme.colors.danger,
            marginBottom: theme.spacing.lg
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          {/* Nome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <label style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Nome Obiettivo <span style={{ color: theme.colors.danger }}>*</span>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
              placeholder="Es: Vacanze Estate, Nuovo MacBook, ecc."
              style={{
                padding: theme.spacing.sm,
                border: `1px solid ${theme.colors.border.DEFAULT}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                outline: 'none',
              }}
            />
          </div>

          {/* Descrizione */}
          <div>
            <label style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              display: 'block',
              marginBottom: theme.spacing.xs
            }}>
              Descrizione
            </label>
            <textarea
              value={formData.descrizione}
              onChange={(e) => handleInputChange('descrizione', e.target.value)}
              rows={2}
              placeholder="Descrizione dettagliata dell'obiettivo..."
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                border: `1px solid ${theme.colors.border.DEFAULT}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
            {/* Importo Target */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <label style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}>
                Importo Target (€) <span style={{ color: theme.colors.danger }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.importo_target}
                onChange={(e) => handleInputChange('importo_target', e.target.value)}
                required
                placeholder="Es: 5000"
                style={{
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none',
                }}
              />
            </div>

            {/* Data Target */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <label style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}>
                Data Target (opzionale)
              </label>
              <input
                type="date"
                value={formData.data_target}
                onChange={(e) => handleInputChange('data_target', e.target.value)}
                style={{
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Priorita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <label style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Priorità
            </label>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInputChange('priorita', value)}
                  style={{
                    padding: theme.spacing.sm,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <Star
                    size={32}
                    fill={value <= formData.priorita ? theme.colors.warning : 'none'}
                    color={value <= formData.priorita ? theme.colors.warning : theme.colors.border.DEFAULT}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Categoria */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <label style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Categoria Associata (opzionale)
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) => handleInputChange('categoria_id', e.target.value)}
              style={{
                padding: theme.spacing.sm,
                border: `1px solid ${theme.colors.border.DEFAULT}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                outline: 'none',
              }}
            >
              <option value="">Nessuna categoria</option>
              {categorie.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icona} {cat.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          gap: theme.spacing.md, 
          marginTop: theme.spacing.xl,
          justifyContent: 'flex-end'
        }}>
          <Button 
            type="button"
            variant="secondary" 
            onClick={onCancel}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
          >
            <X size={18} />
            Annulla
          </Button>
          <Button 
            type="submit"
            variant="primary" 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
          >
            <Save size={18} />
            {loading ? 'Salvataggio...' : (obiettivoId ? 'Salva Modifiche' : 'Crea Obiettivo')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
