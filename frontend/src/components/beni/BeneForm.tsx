import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

interface BeneFormProps {
  beneId?: number; // If provided, edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  nome: string;
  tipo: string;
  marca: string;
  modello: string;
  data_acquisto: string;
  prezzo_acquisto: string;
  stato: string;
  valore_residuo: string;
  durata_anni_stimata: string;
  note: string;
  
  // Vehicle
  veicolo_targa: string;
  veicolo_km_iniziali: string;
  veicolo_km_attuali: string;
  veicolo_tipo_carburante: string;
  veicolo_consumo_medio: string;
  veicolo_assicurazione_annuale: string;
  veicolo_bollo_annuale: string;
  
  // Property
  immobile_indirizzo: string;
  immobile_mq: string;
  immobile_valore_catastale: string;
  immobile_spese_condominiali_mensili: string;
  immobile_imu_annuale: string;
  
  // Equipment
  attrezzatura_serial_number: string;
  attrezzatura_ore_utilizzo: string;
  attrezzatura_costo_orario: string;
}

const initialFormData: FormData = {
  nome: '',
  tipo: 'veicolo',
  marca: '',
  modello: '',
  data_acquisto: new Date().toISOString().split('T')[0],
  prezzo_acquisto: '',
  stato: 'attivo',
  valore_residuo: '',
  durata_anni_stimata: '10',
  note: '',
  veicolo_targa: '',
  veicolo_km_iniziali: '',
  veicolo_km_attuali: '',
  veicolo_tipo_carburante: 'Benzina',
  veicolo_consumo_medio: '',
  veicolo_assicurazione_annuale: '',
  veicolo_bollo_annuale: '',
  immobile_indirizzo: '',
  immobile_mq: '',
  immobile_valore_catastale: '',
  immobile_spese_condominiali_mensili: '',
  immobile_imu_annuale: '',
  attrezzatura_serial_number: '',
  attrezzatura_ore_utilizzo: '',
  attrezzatura_costo_orario: '',
};

export default function BeneForm({ beneId, onSuccess, onCancel }: BeneFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(!!beneId);

  useEffect(() => {
    if (beneId) {
      fetchBeneData();
    }
  }, [beneId]);

  const fetchBeneData = async () => {
    try {
      const response = await fetch(`/api/beni/${beneId}`);
      if (!response.ok) throw new Error('Errore caricamento bene');
      
      const data = await response.json();
      
      // Convert data to form format
      const formattedData: FormData = {
        ...initialFormData,
        ...Object.keys(data).reduce((acc, key) => {
          const value = data[key];
          acc[key] = value === null || value === undefined ? '' : String(value);
          return acc;
        }, {} as any)
      };
      
      setFormData(formattedData);
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
      // Validate required fields
      if (!formData.nome || !formData.prezzo_acquisto) {
        throw new Error('Nome e prezzo acquisto sono obbligatori');
      }

      // Prepare payload (convert empty strings to null)
      const payload: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value === '') {
          payload[key] = null;
        } else if (
          key.includes('prezzo') || 
          key.includes('importo') || 
          key.includes('km') || 
          key.includes('mq') ||
          key.includes('valore') ||
          key.includes('consumo') ||
          key.includes('ore') ||
          key.includes('costo') ||
          key.includes('durata') ||
          key.includes('spese') ||
          key.includes('assicurazione') ||
          key.includes('bollo') ||
          key.includes('imu')
        ) {
          payload[key] = parseFloat(value) || null;
        } else {
          payload[key] = value;
        }
      });

      const url = beneId ? `/api/beni/${beneId}` : '/api/beni';
      const method = beneId ? 'PUT' : 'POST';

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

  const renderInput = (
    label: string,
    field: keyof FormData,
    type: string = 'text',
    required: boolean = false,
    placeholder: string = ''
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
      <label style={{ 
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.primary
      }}>
        {label} {required && <span style={{ color: theme.colors.danger }}>*</span>}
      </label>
      <input
        type={type}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        required={required}
        placeholder={placeholder}
        style={{
          padding: theme.spacing.sm,
          border: `1px solid ${theme.colors.border.DEFAULT}`,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.typography.fontSize.sm,
          outline: 'none',
        }}
      />
    </div>
  );

  const renderSelect = (
    label: string,
    field: keyof FormData,
    options: { value: string; label: string }[],
    required: boolean = false
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
      <label style={{ 
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.primary
      }}>
        {label} {required && <span style={{ color: theme.colors.danger }}>*</span>}
      </label>
      <select
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        required={required}
        style={{
          padding: theme.spacing.sm,
          border: `1px solid ${theme.colors.border.DEFAULT}`,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.typography.fontSize.sm,
          outline: 'none',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

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
            {beneId ? 'Modifica Bene' : 'Nuovo Bene'}
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
          {/* Common Fields */}
          <div>
            <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg }}>
              Informazioni Generali
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.md }}>
              {renderInput('Nome', 'nome', 'text', true, 'Es: Fiat Panda, Casa Roma, ecc.')}
              {renderSelect('Tipo', 'tipo', [
                { value: 'veicolo', label: 'Veicolo' },
                { value: 'immobile', label: 'Immobile' },
                { value: 'attrezzatura', label: 'Attrezzatura' },
                { value: 'elettrodomestico', label: 'Elettrodomestico' },
                { value: 'altro', label: 'Altro' },
              ], true)}
              {renderInput('Marca', 'marca', 'text', false)}
              {renderInput('Modello', 'modello', 'text', false)}
              {renderInput('Data Acquisto', 'data_acquisto', 'date', true)}
              {renderInput('Prezzo Acquisto (€)', 'prezzo_acquisto', 'number', true)}
              {renderSelect('Stato', 'stato', [
                { value: 'attivo', label: 'Attivo' },
                { value: 'dismesso', label: 'Dismesso' },
                { value: 'in_vendita', label: 'In Vendita' },
              ])}
            </div>
          </div>

          {/* TCO Parameters */}
          <div>
            <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg }}>
              Parametri TCO
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.md }}>
              {renderInput('Durata Stimata (anni)', 'durata_anni_stimata', 'number', false)}
              {renderInput('Valore Residuo (€)', 'valore_residuo', 'number', false)}
            </div>
          </div>

          {/* Vehicle Fields */}
          {formData.tipo === 'veicolo' && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg }}>
                🚗 Dettagli Veicolo
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.md }}>
                {renderInput('Targa', 'veicolo_targa', 'text', false)}
                {renderInput('Km Iniziali', 'veicolo_km_iniziali', 'number', false)}
                {renderInput('Km Attuali', 'veicolo_km_attuali', 'number', false)}
                {renderSelect('Tipo Carburante', 'veicolo_tipo_carburante', [
                  { value: 'Benzina', label: 'Benzina' },
                  { value: 'Diesel', label: 'Diesel' },
                  { value: 'GPL', label: 'GPL' },
                  { value: 'Metano', label: 'Metano' },
                  { value: 'Elettrico', label: 'Elettrico' },
                  { value: 'Ibrido', label: 'Ibrido' },
                ])}
                {renderInput('Consumo Medio (L/100km)', 'veicolo_consumo_medio', 'number', false)}
                {renderInput('Assicurazione Annuale (€)', 'veicolo_assicurazione_annuale', 'number', false)}
                {renderInput('Bollo Annuale (€)', 'veicolo_bollo_annuale', 'number', false)}
              </div>
            </div>
          )}

          {/* Property Fields */}
          {formData.tipo === 'immobile' && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg }}>
                🏠 Dettagli Immobile
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.md }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  {renderInput('Indirizzo', 'immobile_indirizzo', 'text', false, 'Via, Città')}
                </div>
                {renderInput('Superficie (mq)', 'immobile_mq', 'number', false)}
                {renderInput('Valore Catastale (€)', 'immobile_valore_catastale', 'number', false)}
                {renderInput('Spese Condominiali (€/mese)', 'immobile_spese_condominiali_mensili', 'number', false)}
                {renderInput('IMU Annuale (€)', 'immobile_imu_annuale', 'number', false)}
              </div>
            </div>
          )}

          {/* Equipment Fields */}
          {(formData.tipo === 'attrezzatura' || formData.tipo === 'elettrodomestico') && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg }}>
                🔧 Dettagli Attrezzatura
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.md }}>
                {renderInput('Serial Number', 'attrezzatura_serial_number', 'text', false)}
                {renderInput('Ore Utilizzo', 'attrezzatura_ore_utilizzo', 'number', false)}
                {renderInput('Costo Orario (€/h)', 'attrezzatura_costo_orario', 'number', false)}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={{ 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              display: 'block',
              marginBottom: theme.spacing.xs
            }}>
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={3}
              placeholder="Note aggiuntive..."
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
            {loading ? 'Salvataggio...' : (beneId ? 'Salva Modifiche' : 'Crea Bene')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
