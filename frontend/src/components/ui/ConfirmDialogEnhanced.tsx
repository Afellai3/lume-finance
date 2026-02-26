import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Button } from './Button';
import { theme } from '../../styles/theme';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogEnhancedProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showIcon?: boolean;
  loading?: boolean;
}

const VARIANT_CONFIG = {
  danger: {
    icon: AlertTriangle,
    color: theme.colors.danger,
    confirmVariant: 'danger' as const,
    iconBg: `${theme.colors.danger}20`,
  },
  warning: {
    icon: AlertTriangle,
    color: '#F59E0B',
    confirmVariant: 'primary' as const,
    iconBg: '#FEF3C7',
  },
  info: {
    icon: Info,
    color: theme.colors.primary.DEFAULT,
    confirmVariant: 'primary' as const,
    iconBg: `${theme.colors.primary.DEFAULT}20`,
  },
  success: {
    icon: CheckCircle,
    color: theme.colors.success,
    confirmVariant: 'primary' as const,
    iconBg: `${theme.colors.success}20`,
  },
};

export const ConfirmDialogEnhanced: React.FC<ConfirmDialogEnhancedProps> = ({
  isOpen,
  title,
  message,
  variant = 'info',
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  onConfirm,
  onCancel,
  showIcon = true,
  loading = false,
}) => {
  if (!isOpen) return null;

  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: theme.spacing.lg,
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={!loading ? onCancel : undefined}
      >
        {/* Dialog */}
        <div
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxWidth: '480px',
            width: '100%',
            padding: theme.spacing.xl,
            animation: 'scaleIn 0.2s ease-out',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {!loading && (
            <button
              onClick={onCancel}
              style={{
                position: 'absolute',
                top: theme.spacing.md,
                right: theme.spacing.md,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme.colors.text.secondary,
                padding: theme.spacing.xs,
                borderRadius: theme.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: theme.transitions.base,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.border.light;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} />
            </button>
          )}

          {/* Icon */}
          {showIcon && (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: theme.borderRadius.full,
                backgroundColor: config.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `0 auto ${theme.spacing.lg}`,
                color: config.color,
              }}
            >
              <Icon size={32} />
            </div>
          )}

          {/* Title */}
          <h2
            style={{
              margin: `0 0 ${theme.spacing.md} 0`,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              textAlign: 'center',
            }}
          >
            {title}
          </h2>

          {/* Message */}
          <p
            style={{
              margin: `0 0 ${theme.spacing.xl} 0`,
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              lineHeight: '1.6',
            }}
          >
            {message}
          </p>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.md,
              justifyContent: 'center',
            }}
          >
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              style={{ minWidth: '120px' }}
            >
              {cancelText}
            </Button>
            <Button
              variant={config.confirmVariant}
              onClick={onConfirm}
              disabled={loading}
              style={{ minWidth: '120px' }}
            >
              {loading ? 'Attendere...' : confirmText}
            </Button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
    </>
  );
};
