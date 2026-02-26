import { useState, useCallback } from 'react';
import { useToast } from './useToast';

export type FeedbackVariant = 'success' | 'error' | 'warning' | 'info';

interface UseFeedbackReturn {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
  confirmDialog: ConfirmDialogState;
  showConfirm: (config: ConfirmDialogConfig) => void;
  hideConfirm: () => void;
}

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogState extends ConfirmDialogConfig {
  isOpen: boolean;
  loading: boolean;
}

const DEFAULT_CONFIRM_STATE: ConfirmDialogState = {
  isOpen: false,
  loading: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

/**
 * Unified feedback hook for toasts, loading states, and confirm dialogs
 * 
 * @example
 * ```tsx
 * const { showSuccess, showError, isLoading, withLoading, showConfirm } = useFeedback();
 * 
 * // Show toast
 * showSuccess('Operazione completata!');
 * 
 * // Wrap async operation with loading
 * await withLoading(async () => {
 *   await saveData();
 *   showSuccess('Dati salvati!');
 * });
 * 
 * // Show confirm dialog
 * showConfirm({
 *   title: 'Elimina elemento',
 *   message: 'Sei sicuro?',
 *   variant: 'danger',
 *   onConfirm: async () => {
 *     await deleteItem();
 *     showSuccess('Eliminato!');
 *   }
 * });
 * ```
 */
export const useFeedback = (): UseFeedbackReturn => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(DEFAULT_CONFIRM_STATE);

  // FIX: Use correct toast API methods
  const showSuccess = useCallback(
    (message: string) => {
      toast.success(message);
    },
    [toast]
  );

  const showError = useCallback(
    (message: string) => {
      toast.error(message);
    },
    [toast]
  );

  const showWarning = useCallback(
    (message: string) => {
      toast.warning(message);
    },
    [toast]
  );

  const showInfo = useCallback(
    (message: string) => {
      toast.info(message);
    },
    [toast]
  );

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  /**
   * Wrap an async operation with loading state
   * Automatically shows error toast on failure
   */
  const withLoading = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        const result = await promise;
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Errore sconosciuto';
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const showConfirm = useCallback((config: ConfirmDialogConfig) => {
    setConfirmDialog({
      ...config,
      isOpen: true,
      loading: false,
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmDialog(DEFAULT_CONFIRM_STATE);
  }, []);

  // Wrap the original onConfirm to handle loading and closing
  const handleConfirm = useCallback(async () => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      await confirmDialog.onConfirm();
      hideConfirm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante l\'operazione';
      toast.error(message);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  }, [confirmDialog.onConfirm, hideConfirm, toast]);

  const handleCancel = useCallback(() => {
    if (confirmDialog.onCancel) {
      confirmDialog.onCancel();
    }
    hideConfirm();
  }, [confirmDialog.onCancel, hideConfirm]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    isLoading,
    setLoading,
    withLoading,
    confirmDialog: {
      ...confirmDialog,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    showConfirm,
    hideConfirm,
  };
};
