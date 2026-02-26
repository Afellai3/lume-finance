# 📘 Lume Finance - Context & Development History

## 📌 Overview

**Lume Finance** è un sistema completo di gestione finanze personali sviluppato come progetto full-stack moderno.

### Tech Stack
- **Backend**: FastAPI 0.104 (Python 3.11+)
- **Frontend**: React 18.3 + TypeScript 5.5
- **Database**: SQLite 3
- **UI Libraries**: Lucide React (icone), Chart.js (grafici)
- **State Management**: React Context API

---

## 🎯 Caratteristiche Uniche

### 1. Scomposizione Automatica Costi Nascosti

Feature **esclusiva** che calcola i costi reali di utilizzo per:

#### Veicoli
- Carburante (consumo L/100km × prezzo)
- Manutenzione (costo per km)
- Ammortamento (deprezzamento nel tempo)

#### Elettrodomestici
- Consumo energetico (kWh × tariffa)
- Ammortamento orario

**Implementazione**: Campo `scomposizione_json` in tabella `movimenti` con breakdown dettagliato.

### 2. Budget con Logica Prioritaria

Calcolo spesa con **doppia priorità**:
1. Movimenti con `budget_id` esplicito (massima priorità)
2. Movimenti con `categoria_id` (fallback automatico)

Permette budget "trasversali" tipo "Emergenze" che accettano spese di qualsiasi categoria.

### 3. Obiettivi Risparmio con Calcolo da Movimenti

**NON più campo `importo_attuale` manuale**, ma calcolo automatico da:
```sql
SELECT SUM(importo) FROM movimenti 
WHERE obiettivo_id = ? AND tipo = 'entrata'
```

Garantisce coerenza dati - unica fonte di verità è la tabella movimenti.

### 4. Dashboard Personalizzabile

Widgets riordinabili e toggle-able con persistenza localStorage:
- Saldo Totale
- Entrate vs Uscite (grafico)
- Top Categorie
- Ultimi Movimenti
- Budget & Obiettivi

**Hook**: `useDashboardLayout()` gestisce stato e persistenza.

### 5. Tema Dark/Light Avanzato

- **Contrasti WCAG AAA**: 16.5:1 per massima accessibilità
- **Context Globale**: Tutti i componenti condividono stato tema
- **Persistenza**: localStorage con chiave `theme_mode`
- **Auto-detect**: Preferenza sistema con `prefers-color-scheme`
- **Transizioni smooth**: 200ms ease su tutti i colori

---

## 💾 Architettura Database

### Tabelle Principali

```sql
conti                   -- Conti bancari
categorie               -- Categorie entrate/uscite
movimenti               -- Transazioni finanziarie
budget                  -- Budget per categoria
obiettivi_risparmio     -- Obiettivi di risparmio
beni                    -- Veicoli ed elettrodomestici
```

### Relazioni Chiave

```
movimenti.categoria_id   → categorie.id
movimenti.conto_id       → conti.id
movimenti.budget_id      → budget.id         (⭐ Priorità esplicita)
movimenti.obiettivo_id   → obiettivi.id      (⭐ Allocazione risparmio)
movimenti.bene_id        → beni.id           (Scomposizione costi)

budget.categoria_id      → categorie.id
```

### Migrations System

Migrations SQL incrementali in `database/migrations/`:

```bash
001_add_icona_colore_categorie.sql     # Icone e colori categorie
002_add_obiettivi_table.sql            # Tabella obiettivi risparmio
003_add_scomposizione_columns.sql      # Campo scomposizione_json
004_add_budget_id_to_movimenti.sql     # Budget esplicito
```

Eseguite automaticamente all'avvio con tracking in `applied_migrations`.

---

## 🎨 Frontend Architecture

### Component Structure

```
components/
├── layout/
│   ├── Layout.tsx          # Container principale
│   ├── Header.tsx          # Logo + ThemeToggle + UserInfo
│   └── BottomNav.tsx       # 5-tab navigation
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ConfirmDialog.tsx
├── ThemeToggle.tsx     # Switch Sun/Moon
└── DashboardCustomizer.tsx  # Modal personalizzazione
```

### Hooks Custom

```typescript
useTheme()              // Gestione tema dark/light
useDashboardLayout()    // Layout dashboard personalizzabile
useApi()                // Wrapper fetch API con error handling
```

### Context Providers

```typescript
ThemeProvider           // Tema globale condiviso
ToastProvider           // Notifiche toast
ConfirmProvider         // Dialog conferma azioni
```

### Styling System

**Design System** in `styles/theme.ts`:

```typescript
colors: {
  primary, success, warning, danger, info,
  background, surface, border,
  text: { primary, secondary, muted, disabled }
}
spacing: { xs, sm, md, lg, xl, 2xl, 3xl }
typography: { fontFamily, fontSize, fontWeight, lineHeight }
borderRadius: { sm, md, lg, xl, full }
shadows: { sm, md, lg, xl, primary, none }
transitions: { fast, base, slow }
breakpoints: { sm, md, lg, xl }
```

**CSS Variables** in `styles/global.css`:

```css
:root {
  --color-background, --color-surface, 
  --color-text-primary, --color-text-secondary,
  --color-border, --color-primary, ...
}

[data-theme='dark'] {
  /* Override con palette dark */
}
```

---

## 🛠️ Development History

### Fase 1: Setup Iniziale (Gen 2026)
- Struttura backend FastAPI
- Schema database SQLite
- CRUD base per movimenti/conti
- Frontend React con TypeScript

### Fase 2: Feature Core (Gen-Feb 2026)
- Sistema categorie con icone/colori
- Budget per categoria
- Obiettivi risparmio
- Gestione beni (veicoli/elettrodomestici)
- Scomposizione automatica costi

### Fase 3: UI/UX Enhancements (Feb 2026)
- Tema dark/light con WCAG AAA
- Logo cliccabile in header
- Bottom navigation mobile-first
- Animazioni e transizioni smooth
- Design system coerente

### Fase 4: Personalizzazione (Feb 2026)
- Dashboard customizer (show/hide + riordino widget)
- Persistenza layout in localStorage
- Hook `useDashboardLayout`

### Fase 5: Fix & Refinements (Feb 2026)
- Fix contrasti dark mode
- Fix ThemeToggle import da providers
- Fix Layout/Header context condiviso
- Documentazione completa

---

## 🐛 Bug Fixes Log

### Database & Backend

#### Fix: `conn.commit()` mancanti
**Problema**: Modifiche non persistevano in DB  
**Soluzione**: Aggiunto `conn.commit()` dopo INSERT/UPDATE/DELETE

#### Fix: Campo `importo_attuale` deprecato
**Problema**: Valore manuale disallineato da movimenti  
**Soluzione**: Calcolo automatico da `SUM(movimenti.importo)`

#### Fix: Encoding UTF-8 Windows
**Problema**: `UnicodeDecodeError` su Windows  
**Soluzione**: `open(file, 'r', encoding='utf-8')`

### Frontend & UI

#### Fix: Dark mode contrasti insufficienti
**Problema**: Testo secondario `#B0B0B0` poco leggibile su `#121212`  
**Soluzione**: 
- Background: `#121212` → `#0F0F0F` (più nero)
- Text primary: `#E8E8E8` → `#F5F5F5` (+10%)
- Text secondary: `#B0B0B0` → `#C0C0C0` (+15%)
- **Risultato**: Contrasto 16.5:1 (WCAG AAA)

#### Fix: ThemeToggle non funziona
**Problema**: Click su toggle non cambia tema  
**Causa**: Import da `hooks/useTheme` (istanza separata)  
**Soluzione**: Import da `providers/ThemeProvider` (context condiviso)

#### Fix: Layout/Header tema non sincronizzato
**Problema**: Header resta dark anche in light mode  
**Causa**: Import da `hooks/useTheme` invece di `providers/ThemeProvider`  
**Soluzione**: Sostituito import in:
- `components/layout/Layout.tsx`
- `components/layout/Header.tsx`
- `components/ThemeToggle.tsx`

**Regola d'oro**: Tutti i componenti devono importare `useTheme` da `providers/ThemeProvider` per condividere stato globale.

---

## 📚 Documentazione

### Struttura `/docs`

```
docs/
├── STEP_5_CUSTOMIZABLE_DASHBOARD.md
│   └─ Guida completa dashboard personalizzabile
├── DARK_MODE_SETUP.md
│   └─ Setup tema dark/light da zero
├── DARK_MODE_FIX.md
│   └─ Fix contrasti e problemi comuni
├── FIX_ALL_THEME_IMPORTS.md
│   └─ Come fixare import useTheme in bulk
└── DASHBOARD_INTEGRATION_EXAMPLE.md
    └─ Esempi codice integrazione
```

### Checklist Testing

#### Dark Mode
- [ ] Toggle Light/Dark funziona
- [ ] Testi leggibili (contrasto > 7:1)
- [ ] Bordi visibili ma non invasivi
- [ ] Transizioni smooth (no flash)
- [ ] Persistenza dopo refresh
- [ ] Auto-detect preferenza sistema

#### Dashboard Personalizzabile
- [ ] Toggle show/hide widget
- [ ] Riordino con frecce ⬆️⬇️
- [ ] Reset a default
- [ ] Persistenza layout
- [ ] Modal chiude con overlay click

#### Scomposizione Costi
- [ ] Calcolo carburante corretto
- [ ] Ammortamento veicolo/elettrodomestico
- [ ] JSON scomposizione ben formattato
- [ ] Display breakdown in UI

---

## 🚀 Workflow Sviluppo

### Branch Strategy

```bash
main              # Production-ready code
├─ feature/*     # Nuove features
├─ fix/*         # Bug fixes
└─ docs/*        # Documentazione
```

### Commit Messages

```bash
feat: Add dashboard customizer
fix: Theme toggle now works correctly
docs: Update README with dark mode section
refactor: Extract theme logic to context
chore: Remove unused imports
```

### Testing Locale

```bash
# Backend
cd backend
python -m pytest tests/

# Frontend
cd frontend
npm test
npm run lint
```

---

## 📝 TODO & Roadmap

### High Priority
- [ ] Drag & Drop riordino widget
- [ ] Export PDF report
- [ ] Notifiche push budget superati
- [ ] Grafici trend mensili

### Medium Priority
- [ ] Multi-utente con auth
- [ ] Cloud sync
- [ ] PWA installabile
- [ ] Dark mode auto-switch per orario

### Low Priority
- [ ] Mobile app (React Native)
- [ ] API bancarie PSD2
- [ ] ML previsioni spesa
- [ ] Tag personalizzati

---

## 🤝 Contributi & Team

### Autore Principale
**Afellai3**  
Data Analyst con Power BI | Trasporto e Logistica  
Montoro Superiore, Salerno, IT

### Stack Expertise
- Python (FastAPI, Pandas, NumPy)
- TypeScript/React
- SQL (SQLite, PostgreSQL)
- Power BI, DAX
- Git, CI/CD

---

## 🔗 Risorse Utili

### Documentazione Ufficiale
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

### Best Practices
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

---

## 📊 Metriche Progetto

### Codebase
- **Backend**: ~2,500 LOC Python
- **Frontend**: ~4,000 LOC TypeScript/TSX
- **Database**: 6 tabelle + migrations
- **Componenti React**: ~25
- **API Endpoints**: ~30

### Performance
- **Startup backend**: < 2s
- **Startup frontend**: < 5s (dev mode)
- **Query DB medie**: < 50ms
- **Render dashboard**: < 100ms

---

**✨ Lume Finance - Modern Personal Finance Management ✨**

*Last updated: 26 Feb 2026*
