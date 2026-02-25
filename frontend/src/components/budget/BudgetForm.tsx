import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

interface BudgetFormProps {
  budgetId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  categoria_id: string;
  importo: string;
  periodo: string;
  data_fine: string;
  soglia_avviso: string;
  descrizione: string;
}

interface Categoria {
  id: number;
  nome: string;
  icona?: string;
}

const initialFormData: FormData = {
  categoria_id: '',
  importo: '',
  periodo: 'mensile',
  data_fine: '',
  soglia_avviso: '80',
  descrizione: '',
};

export default function BudgetForm({ budgetId, onSuccess, onCancel }: BudgetFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!budgetId);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategorie();
    if (budgetId) {
      fetchBudgetData();
    }
  }, [budgetId]);

  const fetchCategorie = async () => {
    try {
      const response = await fetch('/api/categorie?tipo=uscita');
      if (!response.ok) throw new Error('Errore caricamento categorie');
      const data = await response.json();
      setCategorie(data);
    } catch (err) {
      setError('Errore caricamento categorie');
    }
  };

  const fetchBudgetData = async () => {
    try {
      const response = await fetch(`/api/budget/${budgetId}`);
      if (!response.ok) throw new Error('Errore caricamento budget');
      
      const data = await response.json();
      
      setFormData({
        categoria_id: String(data.categoria_id || ''),
        importo: String(data.importo || ''),
        periodo: data.periodo || 'mensile',
        data_fine: data.data_fine ? data.data_fine.split('T')[0] : '',
        soglia_avviso: String(data.soglia_avviso || 80),
        descrizione: data.descrizione || '',
      });
    } catch (err) {
      setError('Errore caricamento dati');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.categoria_id || !formData.importo) {
        throw new Error('Categoria e importo sono obbligatori');
      }

      const payload: any = {
        categoria_id: parseInt(formData.categoria_id),
        importo: parseFloat(formData.importo),
        periodo: formData.periodo,
        soglia_avviso: parseInt(formData.soglia_avviso),
      };

      if (formData.data_fine) {
        payload.data_fine = formData.data_fine;
      }

      if (formData.descrizione) {
        payload.descrizione = formData.descrizione;
      }

      const url = budgetId ? `/api/budget/${budgetId}` : '/api/budget';
      const method = budgetId ? 'PUT' : 'POST';

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
            {budgetId ? 'Modifica Budget' : 'Nuovo Budget'}
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
          {/* Categoria */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <label style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Categoria <span style={{ color: theme.colors.danger }}>*</span>
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) => handleInputChange('categoria_id', e.target.value)}
              required
              disabled={!!budgetId}
              style={{
                padding: theme.spacing.sm,
                border: `1px solid ${theme.colors.border.DEFAULT}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                outline: 'none',
                backgroundColor: budgetId ? theme.colors.background : 'white'
              }}
            >
              <option value="">Seleziona categoria...</option>
              {categorie.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icona} {cat.nome}
                </option>
              ))}
            </select>
            {budgetId && (
              <small style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>
                La categoria non può essere modificata
              </small>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
            {/* Importo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <label style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}>
                Importo Limite (€) <span style={{ color: theme.colors.danger }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.importo}
                onChange={(e) => handleInputChange('importo', e.target.value)}
                required
                placeholder="Es: 500"
                style={{
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none',
                }}
              />
            </div>

            {/* Periodo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <label style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}>
                Periodo <span style={{ color: theme.colors.danger }}>*</span>
              </label>
              <select
                value={formData.periodo}
                onChange={(e) => handleInputChange('periodo', e.target.value)}
                required
                style={{
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none',
                }}
              >
                <option value="settimanale">Settimanale</option>
                <option value="mensile">Mensile</option>
                <option value="annuale">Annuale</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
            {/* Data Fine */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <label style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}>
                Data Fine (opzionale)
              </label>
              <input
                type="date"
                value={formData.data_fine}
                onChange={(e) => handleInputChange('data_fine', e.target.value)}
                style={{
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none',
                }}
              />
            </div>

            {/* Soglia Avviso */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <label style={{ 
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary
              }}>
                Soglia Avviso (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.soglia_avviso}
                onChange={(e) => handleInputChange('soglia_avviso', e.target.value)}
                placeholder="80"
                style={{
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  outline: 'none',
                }}
              />
              <small style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>
                Ricevi avviso quando superi questa percentuale
              </small>
            </div>
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
              Descrizione / Note
            </label>
            <textarea
              value={formData.descrizione}
              onChange={(e) => handleInputChange('descrizione', e.target.value)}
              rows={3}
              placeholder="Note aggiuntive sul budget..."
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
            {loading ? 'Salvataggio...' : (budgetId ? 'Salva Modifiche' : 'Crea Budget')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
