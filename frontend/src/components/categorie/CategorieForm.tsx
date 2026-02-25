import { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { theme } from '../../styles/theme';

interface CategorieFormProps {
  categoria?: any;
  onSuccess: () => void;
  onClose: () => void;
}

const EMOJI_PRESETS = [
  // Money & Finance
  '💰', '💵', '💸', '💳', '💴', '💶', '💷', '📊', '📈', '📉',
  // Food & Drink
  '🍔', '🍕', '🍟', '🍺', '☕', '🍰', '🎉', '🍽️', '🥤', '🍮',
  // Transportation
  '🚗', '⛽', '🚌', '🚂', '✈️', '🚲', '🛵', '🚓', '🚕', '🚡',
  // Home & Family
  '🏠', '🛋️', '🚿', '💡', '🔧', '🧹', '📺', '🚪', '🧺', '👨‍👩‍👧',
  // Entertainment
  '🎮', '🎥', '🎬', '🎭', '🎵', '🎸', '🎯', '🏀', '⚽', '🏆',
  // Health & Wellness
  '❤️', '💊', '🏋️', '🧘', '💆', '🛌', '🧘‍♀️', '💅', '🥼', '👶',
  // Work & Education
  '💼', '📝', '📚', '🎓', '💻', '📱', '✉️', '📦', '📅', '📖',
  // Shopping & Gifts
  '🎁', '🛍️', '👜', '👗', '👠', '💍', '💄', '🕯️', '🎪', '🎭',
  // Other
  '✨', '🌈', '🌟', '☀️', '🌻', '🐾', '🎶', '📧', '💬', '🔔'
];

const COLOR_PRESETS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#22C55E', // green
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
];

function CategorieForm({ categoria, onSuccess, onClose }: CategorieFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nome: categoria?.nome || '',
    tipo: categoria?.tipo || 'uscita',
    icona: categoria?.icona || '🏷️',
    colore: categoria?.colore || '#3B82F6',
    descrizione: categoria?.descrizione || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nome.trim() || formData.nome.length < 2) {
      setError('Inserisci un nome valido (min 2 caratteri)');
      return;
    }

    setLoading(true);

    try {
      const url = categoria 
        ? `/api/categorie/${categoria.id}` 
        : '/api/categorie';

      const method = categoria ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
            {categoria ? '✏️ Modifica' : '➕ Nuova'} Categoria
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
          {/* Preview */}
          <Card padding="md" style={{ backgroundColor: `${formData.colore}10`, border: `2px solid ${formData.colore}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: theme.borderRadius.lg,
                backgroundColor: `${formData.colore}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                border: `2px solid ${formData.colore}`
              }}>
                {formData.icona}
              </div>
              <div>
                <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.primary }}>
                  {formData.nome || 'Nome Categoria'}
                </div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                  {formData.tipo === 'entrata' ? '↗ Entrata' : '↘ Uscita'}
                </div>
              </div>
            </div>
          </Card>

          {/* Nome */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Nome *
            </label>
            <Input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Es: Hobby, Formazione, Viaggi"
              required
              maxLength={50}
              fullWidth
            />
          </div>

          {/* Tipo */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Tipo *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
              <Button
                type="button"
                variant={formData.tipo === 'entrata' ? 'primary' : 'secondary'}
                onClick={() => setFormData({ ...formData, tipo: 'entrata' })}
                fullWidth
              >
                ↗ Entrata
              </Button>
              <Button
                type="button"
                variant={formData.tipo === 'uscita' ? 'primary' : 'secondary'}
                onClick={() => setFormData({ ...formData, tipo: 'uscita' })}
                fullWidth
              >
                ↘ Uscita
              </Button>
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Icona
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(10, 1fr)', 
              gap: theme.spacing.xs,
              maxHeight: '200px',
              overflowY: 'auto',
              padding: theme.spacing.sm,
              border: `1px solid ${theme.colors.border.light}`,
              borderRadius: theme.borderRadius.md
            }}>
              {EMOJI_PRESETS.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, icona: emoji })}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: formData.icona === emoji ? `2px solid ${theme.colors.primary.DEFAULT}` : '1px solid transparent',
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: formData.icona === emoji ? `${theme.colors.primary.DEFAULT}10` : 'transparent',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: theme.transitions.base
                  }}
                  onMouseEnter={(e) => {
                    if (formData.icona !== emoji) {
                      e.currentTarget.style.backgroundColor = theme.colors.border.light;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.icona !== emoji) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Colore
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: theme.spacing.xs }}>
              {COLOR_PRESETS.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, colore: color })}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: formData.colore === color ? `3px solid ${theme.colors.text.primary}` : '2px solid transparent',
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: color,
                    cursor: 'pointer',
                    transition: theme.transitions.base,
                    boxShadow: formData.colore === color ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              Descrizione (opzionale)
            </label>
            <textarea
              value={formData.descrizione}
              onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
              placeholder="Breve descrizione della categoria..."
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
              {loading ? 'Salvataggio...' : categoria ? 'Aggiorna' : 'Crea Categoria'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CategorieForm;
