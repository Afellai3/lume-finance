# 🔧 Fix: Sostituire TUTTI gli import di useTheme

## ❌ Problema

Quando un componente importa `useTheme` da `hooks/useTheme` invece che da `providers/ThemeProvider`, crea una **propria istanza separata** del tema invece di usare quello condiviso globalmente.

Risultato:
- Toggle non funziona
- Componenti non si aggiornano quando cambi tema
- Tema dark "bloccato"

## ✅ Soluzione

Sostituisci **TUTTI** gli import:

```typescript
// ❌ SBAGLIATO (crea istanza separata)
import { useTheme } from '../hooks/useTheme';
import { useTheme } from '../../hooks/useTheme';

// ✅ CORRETTO (usa context condiviso)
import { useTheme } from '../providers/ThemeProvider';
import { useTheme } from '../../providers/ThemeProvider';
```

---

## 🔍 Come Trovare File da Fixare

### Comando Linux/Mac
```bash
grep -r "from.*hooks/useTheme" frontend/src --include="*.tsx" --include="*.ts"
```

### Comando Windows (PowerShell)
```powershell
Get-ChildItem -Path frontend/src -Recurse -Include *.tsx,*.ts | Select-String "from.*hooks/useTheme"
```

### Comando Windows (Git Bash)
```bash
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs grep "from.*hooks/useTheme"
```

---

## 🛠️ Fix Automatico (Bulk Replace)

### Linux/Mac
```bash
#!/bin/bash
find frontend/src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s|from '[^']*hooks/useTheme'|from '../providers/ThemeProvider'|g" {} +
```

### Manuale con VS Code
1. Apri VS Code
2. `Ctrl+Shift+F` (Find in Files)
3. Cerca: `from.*hooks/useTheme`
4. Usa Regex: ☑️
5. Per ogni file trovato:
   - Conta quanti `../` servono per arrivare a `providers/ThemeProvider`
   - Sostituisci l'import

---

## 📋 File che Abbiamo Già Fixato

- ✅ `frontend/src/components/layout/Layout.tsx` (Commit: dc547027)
- ✅ `frontend/src/components/layout/Header.tsx` (Commit: 4e919cfc)
- ✅ `frontend/src/components/ThemeToggle.tsx` (Commit: 969c8752)

---

## 📁 File Probabilmente da Fixare

Cerca questi pattern nel progetto:

### Componenti Layout
- [ ] `BottomNav.tsx`
- [ ] Sidebar (se esiste)

### Componenti UI
- [ ] `Card.tsx`
- [ ] `Button.tsx`
- [ ] `Input.tsx`
- [ ] `Modal.tsx`
- [ ] Qualsiasi componente in `components/ui/`

### Pages
- [ ] `Dashboard.tsx`
- [ ] `Movimenti.tsx`
- [ ] `MovimentiWithTabs.tsx`
- [ ] `Patrimonio.tsx`
- [ ] `Finanza.tsx`
- [ ] `Impostazioni.tsx`

---

## ⚠️ IMPORTANTE: Paths Relativi

Dopo aver sostituito l'import, **verifica il path** in base alla posizione del file:

### Da `frontend/src/pages/`
```typescript
import { useTheme } from '../providers/ThemeProvider';
```

### Da `frontend/src/components/`
```typescript
import { useTheme } from '../providers/ThemeProvider';
```

### Da `frontend/src/components/layout/`
```typescript
import { useTheme } from '../../providers/ThemeProvider';
```

### Da `frontend/src/components/ui/`
```typescript
import { useTheme } from '../../providers/ThemeProvider';
```

---

## 🧪 Test dopo il Fix

1. **Riavvia dev server**: `npm run dev`
2. **Verifica toggle**:
   - Click "Light" → sfondo bianco
   - Click "Dark" → sfondo nero
   - Tutti i componenti cambiano insieme
3. **Verifica persistenza**:
   - Scegli dark mode
   - Refresh pagina (F5)
   - Deve restare dark
4. **Verifica localStorage**:
   ```javascript
   localStorage.getItem('theme_mode') // deve essere 'light' o 'dark'
   ```

---

## 🐛 Debugging

### Se il toggle ancora non funziona

Aggiungi console.log nel ThemeProvider:

```typescript
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useThemeHook();
  
  console.log('ThemeProvider rendering with mode:', themeValue.mode);
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {/* ... */}
    </ThemeContext.Provider>
  );
}
```

Poi nei componenti:

```typescript
const { mode, theme } = useTheme();
console.log('Component using theme mode:', mode);
```

Se vedi **valori diversi** in componenti diversi = qualcuno importa ancora da `hooks/useTheme`!

---

## 📚 Riferimenti

- [Multiple Context Providers Problem](https://dev.to/rakshyak/avoiding-state-inconsistencies-the-pitfall-of-multiple-react-context-providers-4e29)
- [useContext Returns Different Values](https://stackoverflow.com/questions/71743412/)
- [React Context Best Practices](https://github.com/facebook/react/issues/16086)

---

**✨ Dopo aver fixato tutti gli import, il toggle funzionerà perfettamente! ✨**
