import { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { theme } from '../../styles/theme';

interface Conto {
  id: number;
  nome: string;
  tipo: string;
  saldo: number;
}

interface TrasferimentoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function TrasferimentoForm({ onSuccess, onCancel }: TrasferimentoFormProps) {
  const [conti, setConti] = useState<Conto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    conto_origine_id: '',
    conto_destinazione_id: '',
    importo: '',
    descrizione: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchConti();
  }, []);

  const fetchConti = async () => {
    try {
      const response = await fetch('/api/conti');
      if (!response.ok) throw new Error('Errore caricamento conti');
      
      const data = await response.json();
      setConti(data);
    } catch (err) {
      setError('Impossibile caricare i conti');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validazione
    if (!formData.conto_origine_id || !formData.conto_destinazione_id) {
      setError('Seleziona entrambi i conti');
      return;
    }
    
    if (formData.conto_origine_id === formData.conto_destinazione_id) {
      setError('I conti devono essere diversi');
      return;
    }
    
    const importo = parseFloat(formData.importo);
    if (!importo || importo <= 0) {
      setError('Inserisci un importo valido');
      return;
    }
    
    if (!formData.descrizione.trim()) {
      setError('Inserisci una descrizione');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/conti/trasferimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conto_origine_id: parseInt(formData.conto_origine_id),
          conto_destinazione_id: parseInt(formData.conto_destinazione_id),
          importo: parseFloat(formData.importo),
          descrizione: formData.descrizione,
          data: `${formData.data} ${new Date().toTimeString().split(' ')[0]}`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Errore durante il trasferimento');
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const contoOrigine = conti.find(c => c.id.toString() === formData.conto_origine_id);
  const contoDestinazione = conti.find(c => c.id.toString() === formData.conto_destinazione_id);
  const importo = parseFloat(formData.importo) || 0;

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
          maxWidth: '600px', 
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
            💸 Trasferimento tra Conti
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            style={{ padding: theme.spacing.xs }}
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          {/* Conto Origine */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Da Conto *
            </label>
            <select
              value={formData.conto_origine_id}
              onChange={(e) => setFormData({ ...formData, conto_origine_id: e.target.value })}
              required
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border.light}`,
                fontSize: theme.typography.fontSize.sm,
                backgroundColor: theme.colors.surface
              }}
            >
              <option value="">Seleziona conto origine</option>
              {conti.map(conto => (
                <option key={conto.id} value={conto.id}>
                  {conto.nome} - {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(conto.saldo)}
                </option>
              ))}
            </select>
            {contoOrigine && importo > 0 && importo > contoOrigine.saldo && (
              <p style={{ 
                marginTop: theme.spacing.xs, 
                fontSize: theme.typography.fontSize.xs, 
                color: theme.colors.warning 
              }}>
                ⚠️ Saldo insufficiente
              </p>
            )}
          </div>

          {/* Arrow Icon */}
          {formData.conto_origine_id && formData.conto_destinazione_id && (
            <div style={{ textAlign: 'center', color: theme.colors.primary.DEFAULT }}>
              <ArrowRight size={32} />
            </div>
          )}

          {/* Conto Destinazione */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              A Conto *
            </label>
            <select
              value={formData.conto_destinazione_id}
              onChange={(e) => setFormData({ ...formData, conto_destinazione_id: e.target.value })}
              required
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border.light}`,
                fontSize: theme.typography.fontSize.sm,
                backgroundColor: theme.colors.surface
              }}
            >
              <option value="">Seleziona conto destinazione</option>
              {conti
                .filter(c => c.id.toString() !== formData.conto_origine_id)
                .map(conto => (
                  <option key={conto.id} value={conto.id}>
                    {conto.nome} - {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(conto.saldo)}
                  </option>
                ))}
            </select>
          </div>

          {/* Preview */}
          {contoOrigine && contoDestinazione && importo > 0 && (
            <Card padding="md" style={{ backgroundColor: `${theme.colors.primary.DEFAULT}10` }}>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                  <span>{contoOrigine.nome}:</span>
                  <span style={{ fontWeight: theme.typography.fontWeight.semibold }}>
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(contoOrigine.saldo)} → 
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(contoOrigine.saldo - importo)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{contoDestinazione.nome}:</span>
                  <span style={{ fontWeight: theme.typography.fontWeight.semibold }}>
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(contoDestinazione.saldo)} → 
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(contoDestinazione.saldo + importo)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Importo */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
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

          {/* Descrizione */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Descrizione *
            </label>
            <Input
              type="text"
              value={formData.descrizione}
              onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
              placeholder="Es: Pagamento affitto, Ricarica carta, ecc."
              required
              fullWidth
            />
          </div>

          {/* Data */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Data
            </label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              fullWidth
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
              onClick={onCancel}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Trasferimento...' : 'Conferma Trasferimento'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default TrasferimentoForm;
