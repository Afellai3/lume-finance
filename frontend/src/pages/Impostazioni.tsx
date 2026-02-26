import { Settings, Moon, Sun, Download, FileText, Info, HelpCircle, Database } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';
import { useTheme } from '../hooks/useTheme';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, label, value, action, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      cursor: onClick ? 'pointer' : 'default',
      transition: `all ${theme.transitions.base}`,
    }}
    onMouseEnter={(e) => {
      if (onClick) e.currentTarget.style.backgroundColor = theme.colors.border.light;
    }}
    onMouseLeave={(e) => {
      if (onClick) e.currentTarget.style.backgroundColor = theme.colors.background;
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: theme.borderRadius.lg,
        backgroundColor: `${theme.colors.primary.DEFAULT}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.primary.DEFAULT,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.primary }}>
          {label}
        </p>
        {value && (
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
            {value}
          </p>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div style={{ marginBottom: theme.spacing.xl }}>
    <h3 style={{ 
      margin: `0 0 ${theme.spacing.md} 0`, 
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {title}
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
      {children}
    </div>
  </div>
);

function Impostazioni() {
  const { isDark, toggleTheme } = useTheme();

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/movimenti/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lume_finance_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert('✓ Export completato con successo!');
    } catch (error) {
      alert('Errore durante l\'esportazione');
      console.error('Export error:', error);
    }
  };

  const handleExportPDF = () => {
    alert('Funzionalità in arrivo! 📄');
  };

  const handleShowTutorial = () => {
    alert('Tutorial guidato in arrivo! 🎓');
  };

  const handleResetDatabase = () => {
    if (confirm('⚠️ ATTENZIONE: Questa azione eliminerà TUTTI i dati. Sei sicuro?')) {
      if (confirm('Conferma ancora una volta. Questa azione è IRREVERSIBILE.')) {
        alert('Funzionalità reset database non ancora implementata per sicurezza.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Header */}
      <div>
        <h1 style={{ 
          margin: 0, 
          fontSize: theme.typography.fontSize['2xl'], 
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          <Settings size={32} />
          Impostazioni
        </h1>
        <p style={{ 
          margin: `${theme.spacing.xs} 0 0 0`, 
          color: theme.colors.text.secondary, 
          fontSize: theme.typography.fontSize.sm 
        }}>
          Configura le preferenze dell'app
        </p>
      </div>

      {/* Preferenze */}
      <Section title="Preferenze">
        <SettingItem
          icon={isDark ? <Moon size={20} /> : <Sun size={20} />}
          label="Tema"
          value={isDark ? 'Scuro' : 'Chiaro'}
          action={
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
            >
              Cambia
            </Button>
          }
          onClick={toggleTheme}
        />
      </Section>

      {/* Dati */}
      <Section title="Gestione Dati">
        <SettingItem
          icon={<Download size={20} />}
          label="Esporta CSV"
          value="Scarica tutti i movimenti in formato CSV"
          action={
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleExportCSV();
              }}
            >
              Esporta
            </Button>
          }
          onClick={handleExportCSV}
        />
        <SettingItem
          icon={<FileText size={20} />}
          label="Esporta PDF"
          value="Genera report mensile in PDF"
          action={
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleExportPDF();
              }}
              disabled
            >
              Presto
            </Button>
          }
        />
        <SettingItem
          icon={<Database size={20} />}
          label="Reset Database"
          value="⚠️ Elimina tutti i dati permanentemente"
          action={
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleResetDatabase();
              }}
            >
              Reset
            </Button>
          }
          onClick={handleResetDatabase}
        />
      </Section>

      {/* Informazioni */}
      <Section title="Informazioni">
        <SettingItem
          icon={<Info size={20} />}
          label="Versione"
          value="Lume Finance v1.0.0"
        />
        <SettingItem
          icon={<HelpCircle size={20} />}
          label="Tutorial"
          value="Guida interattiva all'utilizzo"
          action={
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleShowTutorial();
              }}
              disabled
            >
              Avvia
            </Button>
          }
        />
      </Section>

      {/* Footer Info */}
      <Card padding="lg">
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
            💰 <strong>Lume Finance</strong>
          </p>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
            Gestione finanze personali con analisi avanzata
          </p>
          <p style={{ margin: `${theme.spacing.xs} 0 0 0`, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
            Sviluppato con ❤️ da <strong>Afellai3</strong>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Impostazioni;
