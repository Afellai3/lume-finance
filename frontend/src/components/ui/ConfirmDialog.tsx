import { AlertTriangle, X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { theme } from '../../styles/theme';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmDialogProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ options, onConfirm, onCancel }: ConfirmDialogProps) {
  const {
    title,
    message,
    confirmText = 'Conferma',
    cancelText = 'Annulla',
    danger = false
  } = options;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: theme.spacing.md,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onCancel}
    >
      <Card
        padding="lg"
        style={{
          maxWidth: '480px',
          width: '100%',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.md
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.sm, flex: 1 }}>
            {danger && (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: `${theme.colors.danger}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.danger,
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={20} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary
                }}
              >
                {title}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            style={{ padding: theme.spacing.xs }}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Message */}
        <p
          style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            lineHeight: '1.5'
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
            justifyContent: 'flex-end'
          }}
        >
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </Card>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
