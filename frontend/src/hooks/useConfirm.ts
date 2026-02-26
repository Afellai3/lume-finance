import { createContext, useContext } from 'react';
import { ConfirmOptions } from '../components/ui/ConfirmDialog';

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  
  return context.confirm;
}
