# Dashboard.tsx - Esempio Integrazione Completa

Ecco come integrare il sistema di personalizzazione nella tua Dashboard esistente.

## 1. Import Necessari

```typescript
import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { DashboardCustomizer } from '../components/DashboardCustomizer';
import { Button } from '../components/ui/Button';
// ... altri import esistenti
```

## 2. Setup Hook nel Componente

```typescript
function Dashboard() {
  // Hook personalizzazione
  const {
    widgets,
    visibleWidgets,
    isCustomizing,
    setIsCustomizing,
    toggleVisibility,
    moveUp,
    moveDown,
    reset,
  } = useDashboardLayout();

  // ... resto del tuo codice esistente (stato, fetch, ecc.)
}
```

## 3. Rendering con Widget Dinamici

```tsx
return (
  <div style={{ padding: '1rem' }}>
    {/* Header con bottone Personalizza */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '1.5rem' 
    }}>
      <h1>Dashboard</h1>
      <Button 
        variant="secondary" 
        size="sm"
        leftIcon={<Settings size={16} />}
        onClick={() => setIsCustomizing(true)}
      >
        Personalizza
      </Button>
    </div>

    {/* Grid widget - Solo widget visibili */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem' 
    }}>
      {visibleWidgets.map(widget => {
        switch (widget.id) {
          case 'saldo':
            return (
              <div key="saldo">
                {/* Il tuo componente Saldo esistente */}
              </div>
            );
          
          case 'entrateUscite':
            return (
              <div key="entrateUscite">
                {/* Il tuo grafico Entrate/Uscite esistente */}
              </div>
            );
          
          case 'topCategorie':
            return (
              <div key="topCategorie">
                {/* Componente Top Categorie */}
              </div>
            );
          
          case 'ultimiMovimenti':
            return (
              <div key="ultimiMovimenti">
                {/* Lista ultimi movimenti */}
              </div>
            );
          
          case 'budgetObiettivi':
            return (
              <div key="budgetObiettivi">
                {/* Card Budget & Obiettivi */}
              </div>
            );
          
          default:
            return null;
        }
      })}
    </div>

    {/* Modal Personalizzazione */}
    {isCustomizing && (
      <DashboardCustomizer
        widgets={widgets}
        onToggleVisibility={toggleVisibility}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        onReset={reset}
        onClose={() => setIsCustomizing(false)}
      />
    )}
  </div>
);
```

## 4. Esempio Completo Minimal

```tsx
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { DashboardCustomizer } from '../components/DashboardCustomizer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings } from 'lucide-react';

function Dashboard() {
  const {
    widgets,
    visibleWidgets,
    isCustomizing,
    setIsCustomizing,
    toggleVisibility,
    moveUp,
    moveDown,
    reset,
  } = useDashboardLayout();

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button 
          variant="secondary" 
          leftIcon={<Settings size={16} />}
          onClick={() => setIsCustomizing(true)}
        >
          Personalizza
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {visibleWidgets.map(widget => (
          <Card key={widget.id} padding="lg">
            <h3>{widget.label}</h3>
            <p>Contenuto widget {widget.id}</p>
          </Card>
        ))}
      </div>

      {isCustomizing && (
        <DashboardCustomizer
          widgets={widgets}
          onToggleVisibility={toggleVisibility}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onReset={reset}
          onClose={() => setIsCustomizing(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
```

## 5. Note Importanti

### Ordine Widget
L'array `visibleWidgets` mantiene l'ordine salvato dall'utente. Usa `.map()` per renderizzarli in sequenza.

### Persistenza
Il layout viene salvato automaticamente in localStorage ad ogni modifica. Non serve fare nulla manualmente.

### Reset
Quando l'utente fa reset, tutti i widget tornano visibili nell'ordine di default definito in `useDashboardLayout.ts`.

### Aggiungere Nuovi Widget
1. Aggiungi il tipo in `WidgetId` (useDashboardLayout.ts)
2. Aggiungi voce in `DEFAULT_WIDGETS`
3. Aggiungi case nello switch del render

---

## Testing

1. **Nascondi widget**: Click Personalizza → Eye icon → Fatto
2. **Riordina**: Click frecce su/giù → Fatto
3. **Reset**: Click Reset Default
4. **Persistenza**: Refresh pagina → layout rimane
5. **localStorage**: DevTools → Application → Local Storage → cerca `dashboard_layout_v1`

---

Buon lavoro! 🚀
