import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { theme } from '../../styles/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  data: ToastData;
  onClose: (id: string) => void;
}

const TOAST_VARIANTS = {
  success: {
    bg: theme.colors.success,
    icon: CheckCircle,
    label: 'Successo'
  },
  error: {
    bg: theme.colors.danger,
    icon: AlertCircle,
    label: 'Errore'
  },
  info: {
    bg: theme.colors.primary.DEFAULT,
    icon: Info,
    label: 'Info'
  },
  warning: {
    bg: '#F59E0B',
    icon: AlertTriangle,
    label: 'Attenzione'
  }
};

export function Toast({ data, onClose }: ToastProps) {
  const { id, message, type, duration = 5000 } = data;
  const variant = TOAST_VARIANTS[type];
  const Icon = variant.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        border: `2px solid ${variant.bg}`,
        minWidth: '320px',
        maxWidth: '420px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      {/* Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          backgroundColor: variant.bg,
          animation: `progress ${duration}ms linear`,
          transformOrigin: 'left'
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: theme.borderRadius.full,
          backgroundColor: `${variant.bg}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: variant.bg,
          flexShrink: 0
        }}
      >
        <Icon size={20} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: '2px' }}>
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            marginBottom: '2px'
          }}
        >
          {variant.label}
        </div>
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            lineHeight: '1.4'
          }}
        >
          {message}
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: theme.colors.text.secondary,
          padding: theme.spacing.xs,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.borderRadius.md,
          transition: theme.transitions.base,
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.border.light;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X size={16} />
      </button>

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
