import { Toast, ToastData } from './Toast';
import { theme } from '../../styles/theme';

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  // Show max 3 toasts
  const visibleToasts = toasts.slice(-3);

  return (
    <div
      style={{
        position: 'fixed',
        top: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm,
        pointerEvents: 'none'
      }}
    >
      {visibleToasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast data={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
