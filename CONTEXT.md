# 📘 Lume Finance - Context & Development History

## 📌 Overview

**Lume Finance** è un sistema completo di gestione finanze personali sviluppato come progetto full-stack moderno con supporto **app mobile Android nativa** tramite Capacitor.

### Tech Stack
- **Backend**: FastAPI 0.104 (Python 3.11+)
- **Frontend**: React 18.3 + TypeScript 5.5
- **Mobile**: Capacitor 6 + Android Studio
- **Database**: SQLite 3
- **UI Libraries**: Lucide React (icone), Chart.js (grafici)
- **State Management**: React Context API

---

## 🎯 Caratteristiche Uniche

### 1. Mobile App Android (Capacitor)

**Setup completo** per build e distribuzione come APK Android:
- `frontend/.env` → `VITE_API_URL=http://<IP_PC>:8000`
- Backend avviato con `--host 0.0.0.0` per essere raggiungibile in rete locale
- CORS backend configurato per `http://localhost` (WebView Capacitor)
- **Global fetch patch** in `main.tsx`: trasparente a tutti i componenti
- **Safe areas** tramite CSS `env(safe-area-inset-*)` in `Layout.tsx`

#### Flusso build mobile
```bash
cd frontend
npm run build      # vite build (senza tsc)
npx cap sync       # copia dist → android/assets
npx cap open android  # apri Android Studio → build APK
```

#### Note critiche
- `package.json` build script: `"build": "vite build"` (NO `tsc &&`)
- `@capacitor/status-bar` NON installato → non importarlo in Layout.tsx
- Connessione WiFi: telefono e PC devono essere sulla stessa rete
- IP può cambiare ad ogni connessione WiFi → aggiornare `.env` e rebuilda

### 2. Global Fetch Patch

In `main.tsx`, prima del render React, viene applicata una patch a `window.fetch` per piattaforma nativa:

```typescript
if (Capacitor.isNativePlatform()) {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const originalFetch = window.fetch.bind(window);
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = `${API_BASE}${input}`;
    }
    return originalFetch(input, init);
  };
}
```

**Motivazione**: molte pagine (Ricorrenze, Categorie, Conti, ecc.) usano `fetch('/api/...')` direttamente invece di `api.ts`. Su Capacitor, le URL relative risolvono a `capacitor://localhost/api/...` restituendo l'`index.html`. La patch risolve il problema globalmente senza modificare ogni singola pagina.

### 3. API Client Centralizzato (`api.ts`)

```typescript
// frontend/src/config/api.ts
export const api = {
  async get(endpoint: string) { ... },
  async post(endpoint: string, data?: any) { ... },
  async put(endpoint: string, data?: any) { ... },
  async delete(endpoint: string) { ... },
  getUrl(): string { ... }
};
```

**Features**:
- `fetchWithTimeout`: abort dopo 30s
- `fetchWithRetry`: 2 retry automatici con 1s di attesa
- Throttle alert: max 1 popup ogni 5s per evitare spam
- Auto-detect piattaforma con `Capacitor.isNativePlatform()`

### 4. Scomposizione Automatica Costi Nascosti

Feature **esclusiva** in campo `scomposizione_json` di `movimenti`:

```json
{
  "tipo": "veicolo",
  "carburante": 45.20,
  "manutenzione": 18.00,
  "ammortamento": 22.30,
  "km": 300
}
```

### 5. Budget con Logica Prioritaria

Calcolo spesa con **doppia priorità**:
1. `budget_id` esplicito su movimento (massima priorità)
2. Fallback automatico su `categoria_id` del movimento

### 6. Obiettivi con Calcolo da Movimenti

```sql
SELECT SUM(importo) FROM movimenti 
WHERE obiettivo_id = ? AND tipo = 'entrata'
```

Il campo `importo_attuale` in `obiettivi_risparmio` è **DEPRECATO**.

### 7. Tema Dark/Light Avanzato

- **Contrasti WCAG AAA**: 16.5:1
- **Context Globale**: `providers/ThemeProvider` (NON `hooks/useTheme`)
- **Persistenza**: `localStorage` key `theme_mode`
- **⚠️ Regola d'oro**: importare sempre `useTheme` da `providers/ThemeProvider`

---

## 💾 Architettura Database

### Tabelle
```sql
conti                   -- Conti bancari
categorie               -- Categorie entrate/uscite (custom)
movimenti               -- Transazioni finanziarie
budget                  -- Budget per categoria
obiettivi_risparmio     -- Obiettivi di risparmio
beni                    -- Veicoli ed elettrodomestici
ricorrenze              -- Movimenti ricorrenti
applied_migrations      -- Tracking migrazioni eseguite
```

### Migrations applicate
```
001_add_icona_colore_categorie.sql
002_add_obiettivi_table.sql
003_add_scomposizione_columns.sql
003_enhance_beni_table.sql
004_add_budget_id_to_movimenti.sql
004_enhance_budget_obiettivi.sql
005_add_ricorrenze.sql
006_add_categorie_custom.sql
```

---

## 🎨 Frontend Architecture

### Pages & Navigation

```
App.tsx
├── Dashboard
├── MovimentiWithTabs
│   ├── [tab] Movimenti
│   ├── [tab] Ricorrenze
│   └── [tab] Categorie
├── Patrimonio
│   ├── [tab] Conti
│   └── [tab] Beni
├── Finanza
│   ├── [tab] Budget
│   └── [tab] Obiettivi
└── Impostazioni
```

### Context Providers

```typescript
ThemeProvider       // Tema dark/light globale
ToastProvider       // Notifiche toast
ConfirmProvider     // Dialog conferma azioni
```

### Hooks Custom

```typescript
useTheme()              // da providers/ThemeProvider (NON hooks/)
useDashboardLayout()    // layout widget personalizzabile
```

### Design System (`styles/theme.ts`)

```typescript
colors: { primary, success, warning, danger, background, surface, text, border }
spacing: { xs, sm, md, lg, xl, 2xl }
typography: { fontSize, fontWeight, lineHeight }
borderRadius, shadows, transitions, breakpoints
```

---

## 🛠️ Development History

### Fase 1: Setup Iniziale (Gen 2026)
- Struttura backend FastAPI + schema SQLite
- CRUD base movimenti/conti + frontend React/TypeScript

### Fase 2: Feature Core (Gen-Feb 2026)
- Categorie con icone/colori, Budget, Obiettivi
- Gestione beni (veicoli/elettrodomestici)
- Scomposizione automatica costi nascosti

### Fase 3: UI/UX Enhancements (Feb 2026)
- Tema dark/light WCAG AAA
- Bottom navigation, logo cliccabile, animazioni
- Dashboard customizer (show/hide + riordino widget)

### Fase 4: Sprint Ricorrenze & Categorie Custom (Feb 2026)
- Movimenti ricorrenti automatici
- Categorie personalizzabili dall'utente

### Fase 5: Mobile App Android (Mar 2026)
- Integrazione Capacitor per build Android nativo
- Fix backend: `--host 0.0.0.0` per rete locale
- Fix CORS: origins per Capacitor WebView
- Fix `Layout.tsx`: rimosso `@capacitor/status-bar`, CSS `env()` safe areas
- Fix `api.ts`: timeout, retry, throttle alert
- Fix `main.tsx`: global fetch patch per tutti i componenti nativi
- Fix dipendenze: `@capacitor/core`, `@capacitor/android`
- Fix `package.json`: build senza `tsc` pre-check

---

## 🐛 Bug Fixes Log

### Mar 2026 - Mobile

#### Fix: Backend non raggiungibile da telefono
**Problema**: Backend ascoltava su `127.0.0.1` (solo localhost)  
**Soluzione**: `uvicorn --host 0.0.0.0 --port 8000`

#### Fix: CORS bloccato su mobile
**Problema**: `No 'Access-Control-Allow-Origin' header` da WebView Android  
**Soluzione**: Aggiunto `http://localhost` e `capacitor://localhost` in `allow_origins`

#### Fix: `@capacitor/status-bar` non installato
**Problema**: Build falliva per import mancante in `Layout.tsx`  
**Soluzione**: Rimosso import, usato CSS `env(safe-area-inset-*)` nativo

#### Fix: Pagine con `fetch('/api/...')` diretto
**Problema**: `Ricorrenze`, `Categorie`, `Conti`, ecc. usavano fetch relativo → HTML 404 su mobile  
**Soluzione**: Global patch in `main.tsx` che prepend `VITE_API_URL` su native

#### Fix: ERR_CONNECTION_TIMED_OUT al primo avvio
**Problema**: 8+ richieste simultanee saturavano il pool connessioni Android WebView  
**Soluzione**: Retry logic in `api.ts` con 2 tentativi + 1s wait; timeout 30s

### Feb 2026

#### Fix: `conn.commit()` mancanti
**Problema**: Modifiche non persistevano  
**Soluzione**: Aggiunto dopo INSERT/UPDATE/DELETE

#### Fix: Obiettivi `importo_attuale` disallineato
**Problema**: Valore manuale non coerente con movimenti  
**Soluzione**: Calcolo automatico `SUM(movimenti.importo)` dove `obiettivo_id = ?`

#### Fix: Dark mode contrasti insufficienti
**Soluzione**: `#0F0F0F` background, `#F5F5F5` text primary → 16.5:1 (WCAG AAA)

#### Fix: ThemeToggle non funzionava
**Causa**: Import da `hooks/useTheme` (istanza separata)  
**Soluzione**: Import da `providers/ThemeProvider`

---

## 📝 TODO & Roadmap

### High Priority
- [ ] Drag & Drop riordino widget dashboard
- [ ] Export PDF/Excel report
- [ ] Notifiche push budget superati

### Medium Priority
- [ ] Multi-utente con auth
- [ ] Cloud sync e backup automatico
- [ ] PWA installabile
- [ ] iOS build (Capacitor)

### Low Priority
- [ ] API bancarie PSD2
- [ ] ML previsioni spesa
- [ ] Tag personalizzati
- [ ] Dark mode auto-switch per orario

---

## 🤝 Autore

**Afellai3**  
Data Analyst con Power BI | Trasporto e Logistica  
Provincia di Salerno, Campania, IT

### Stack Expertise
- Python (FastAPI, Pandas)
- TypeScript / React / Capacitor
- SQL (SQLite, PostgreSQL)
- Power BI, DAX
- Git

---

*Last updated: 03 Mar 2026*
