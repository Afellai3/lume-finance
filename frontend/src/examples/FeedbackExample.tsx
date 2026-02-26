/**
 * ESEMPIO DI UTILIZZO DEL SISTEMA DI FEEDBACK
 * 
 * Questo file mostra come usare:
 * - useFeedback hook per toast e conferme
 * - LoadingState per stati di caricamento
 * - ConfirmDialogEnhanced per conferme eleganti
 * 
 * NON INCLUDERE IN PRODUZIONE - Solo per riferimento
 */

import { useState } from 'react';
import { Save, Trash2, RefreshCw } from 'lucide-react';
import { Button, Card, LoadingState, ConfirmDialogEnhanced } from '../components/ui';
import { useFeedback } from '../hooks/useFeedback';
import { theme } from '../styles/theme';

function FeedbackExample() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    isLoading,
    withLoading,
    confirmDialog,
    showConfirm,
  } = useFeedback();

  const [data, setData] = useState<string[]>(['Item 1', 'Item 2', 'Item 3']);

  // ========================================
  // ESEMPIO 1: Toast Notifications
  // ========================================
  const handleShowToasts = () => {
    showSuccess('✅ Operazione completata con successo!');
    setTimeout(() => showInfo('📄 Informazione utile'), 500);
    setTimeout(() => showWarning('⚠️ Attenzione: quota limite raggiunta'), 1000);
    setTimeout(() => showError('❌ Errore durante il salvataggio'), 1500);
  };

  // ========================================
  // ESEMPIO 2: Operazione Async con Loading
  // ========================================
  const handleSaveWithLoading = async () => {
    await withLoading(
      new Promise((resolve) => {
        setTimeout(() => {
          showSuccess('Dati salvati correttamente!');
          resolve(true);
        }, 2000);
      })
    );
  };

  // ========================================
  // ESEMPIO 3: Confirm Dialog - Danger
  // ========================================
  const handleDeleteWithConfirm = () => {
    showConfirm({
      title: 'Elimina tutti gli elementi',
      message: 'Questa azione è irreversibile. Tutti gli elementi verranno eliminati definitivamente.',
      variant: 'danger',
      confirmText: 'Elimina Tutto',
      cancelText: 'Annulla',
      onConfirm: async () => {
        // Simula operazione async
        await new Promise(resolve => setTimeout(resolve, 1500));
        setData([]);
        showSuccess('Elementi eliminati!');
      },
    });
  };

  // ========================================
  // ESEMPIO 4: Confirm Dialog - Warning
  // ========================================
  const handleResetWithConfirm = () => {
    showConfirm({
      title: 'Ripristina impostazioni',
      message: 'Vuoi davvero ripristinare le impostazioni predefinite? Questa azione non può essere annullata.',
      variant: 'warning',
      confirmText: 'Ripristina',
      onConfirm: () => {
        showInfo('Impostazioni ripristinate');
      },
    });
  };

  // ========================================
  // ESEMPIO 5: Operazione con Error Handling
  // ========================================
  const handleOperationWithError = async () => {
    try {
      await withLoading(
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Connessione al server fallita'));
          }, 1500);
        })
      );
    } catch (error) {
      // L'errore è già gestito da withLoading (mostra toast error)
      console.log('Errore catturato:', error);
    }
  };

  return (
    <div style={{ padding: theme.spacing.xl, maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: theme.spacing.lg }}>Sistema di Feedback - Esempi</h1>

      {/* Toast Examples */}
      <Card padding="lg" style={{ marginBottom: theme.spacing.lg }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>🎉 Toast Notifications</h2>
        <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
          Mostra notifiche colorate con icone per feedback immediato
        </p>
        <Button onClick={handleShowToasts} leftIcon={<RefreshCw size={16} />}>
          Mostra Tutti i Toast
        </Button>
        <pre style={{ 
          marginTop: theme.spacing.md, 
          padding: theme.spacing.sm, 
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.typography.fontSize.xs,
          overflow: 'auto'
        }}>
{`const { showSuccess, showError, showWarning, showInfo } = useFeedback();

showSuccess('✅ Operazione completata!');
showError('❌ Errore durante il salvataggio');
showWarning('⚠️ Attenzione!');
showInfo('📄 Info utile');`}
        </pre>
      </Card>

      {/* Loading State */}
      <Card padding="lg" style={{ marginBottom: theme.spacing.lg }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>⏳ Loading States</h2>
        <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
          Avvolgi operazioni async con withLoading per gestire automaticamente lo stato di caricamento
        </p>
        <Button 
          onClick={handleSaveWithLoading} 
          leftIcon={<Save size={16} />}
          disabled={isLoading}
        >
          {isLoading ? 'Salvataggio in corso...' : 'Salva Dati'}
        </Button>
        {isLoading && (
          <div style={{ marginTop: theme.spacing.md }}>
            <LoadingState size="sm" message="Attendere..." />
          </div>
        )}
        <pre style={{ 
          marginTop: theme.spacing.md, 
          padding: theme.spacing.sm, 
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.typography.fontSize.xs,
          overflow: 'auto'
        }}>
{`const { withLoading, isLoading } = useFeedback();

await withLoading(async () => {
  await saveData();
  showSuccess('Salvato!');
});`}
        </pre>
      </Card>

      {/* Confirm Dialogs */}
      <Card padding="lg" style={{ marginBottom: theme.spacing.lg }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>✅ Confirm Dialogs</h2>
        <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
          Dialoghi di conferma eleganti con varianti colorate e gestione async
        </p>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <Button 
            variant="danger" 
            onClick={handleDeleteWithConfirm}
            leftIcon={<Trash2 size={16} />}
          >
            Elimina (Danger)
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleResetWithConfirm}
            leftIcon={<RefreshCw size={16} />}
          >
            Reset (Warning)
          </Button>
        </div>
        <pre style={{ 
          marginTop: theme.spacing.md, 
          padding: theme.spacing.sm, 
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.typography.fontSize.xs,
          overflow: 'auto'
        }}>
{`const { showConfirm } = useFeedback();

showConfirm({
  title: 'Elimina elemento',
  message: 'Sei sicuro?',
  variant: 'danger',
  onConfirm: async () => {
    await deleteItem();
    showSuccess('Eliminato!');
  }
});`}
        </pre>
      </Card>

      {/* Error Handling */}
      <Card padding="lg" style={{ marginBottom: theme.spacing.lg }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>❌ Error Handling</h2>
        <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
          Gli errori vengono automaticamente catturati e mostrati come toast
        </p>
        <Button 
          variant="secondary"
          onClick={handleOperationWithError}
        >
          Simula Errore
        </Button>
      </Card>

      {/* Data Display */}
      <Card padding="lg">
        <h2 style={{ marginBottom: theme.spacing.md }}>📄 Dati Correnti</h2>
        {data.length === 0 ? (
          <p style={{ color: theme.colors.text.secondary }}>Nessun elemento</p>
        ) : (
          <ul>
            {data.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </Card>

      {/* Confirm Dialog Component */}
      <ConfirmDialogEnhanced
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel || (() => {})}
        loading={confirmDialog.loading}
      />
    </div>
  );
}

export default FeedbackExample;
