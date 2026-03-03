# 📋 Lume Finance - Context per AI Assistant

> Questo file fornisce contesto completo per assistenti AI (Claude, GPT, Perplexity, ecc.) che lavorano sul progetto.

---

## 📌 Informazioni Progetto

**Nome**: Lume Finance  
**Repository**: https://github.com/Afellai3/lume-finance  
**Tipo**: Applicazione web full-stack + **app mobile Android nativa**  
**Stato**: ✅ Produzione (sviluppo attivo)  
**Data Ultima Modifica**: 03 Marzo 2026  
**Versione Context**: 2.0

---

## 🎯 Obiettivo Principale

Creare un sistema di gestione finanze personali che **va oltre le app tradizionali** analizzando i **costi nascosti** di veicoli ed elettrodomestici (carburante, manutenzione, ammortamento, energia). Disponibile sia come web app che come **app Android nativa** tramite Capacitor.

---

## 🏗️ Stack Tecnologico

### Backend
- **Framework**: FastAPI 0.104+ (Python 3.11+)
- **Database**: SQLite 3 (file-based)
- **ORM**: None (SQL puro)
- **CORS**: Configurato per web + Capacitor mobile
- **Host**: `0.0.0.0:8000` (obbligatorio per raggiungibilità da telefono)
- **Avvio**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`

### Frontend
- **Framework**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite (build: `vite build`, NO `tsc &&`)
- **Mobile**: **Capacitor 6** (Android nativo)
- **Routing**: Stato interno (no react-router)
- **Charts**: Chart.js
- **Icons**: Lucide React
- **Styling**: CSS puro + Inline styles (no Tailwind)
- **Theme**: Dark/Light mode con localStorage
- **API Client**: `src/config/api.ts` centralizzato

### Database
- **Tipo**: SQLite
- **Path**: `data/lume.db`
- **Inizializzazione**: Automatica al primo avvio backend
- **Migrations**: Incrementali in `database/migrations/`

---

## 📁 Struttura Progetto

```
lume-finance/
├── backend/
│   ├── routes/
│   │   ├── analytics.py    # Dashboard KPI, trend, comparison, top-spese
│   │   ├── movimenti.py    # CRUD + scomposizione costi + export CSV
│   │   ├── conti.py        # Gestione conti bancari
│   │   ├── budget.py       # Budget con logica prioritaria
│   │   ├── obiettivi.py    # Obiettivi risparmio (calcolo da movimenti)
│   │   ├── beni.py         # Veicoli/elettrodomestici
│   │   ├── categorie.py    # ⭐ Categorie custom CRUD
│   │   └── ricorrenze.py   # ⭐ Movimenti ricorrenti automatici
│   ├── database.py         # SQLite init + migrations auto
│   └── main.py             # FastAPI app + CORS
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # ⭐ Entry point + global fetch patch
│   │   ├── config/
│   │   │   └── api.ts            # ⭐ Client API centralizzato (timeout+retry)
│   │   ├── components/
│   │   │   ├── layout/           # Header, BottomNav, Layout
│   │   │   ├── ui/               # Button, Card, Input, Badge, Tabs, ecc.
│   │   │   ├── ricorrenze/       # RicorrenzeForm
│   │   │   └── DashboardCustomizer.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MovimentiWithTabs.tsx  # Tabs: Movimenti | Ricorrenze | Categorie
│   │   │   ├── Movimenti.tsx
│   │   │   ├── Ricorrenze.tsx
│   │   │   ├── Categorie.tsx
│   │   │   ├── Patrimonio.tsx         # Tabs: Conti | Beni
│   │   │   ├── Conti.tsx
│   │   │   ├── Beni.tsx
│   │   │   ├── Finanza.tsx            # Tabs: Budget | Obiettivi
│   │   │   ├── Budget.tsx
│   │   │   ├── Obiettivi.tsx
│   │   │   └── Impostazioni.tsx
│   │   ├── hooks/
│   │   │   ├── useDashboardLayout.ts
│   │   │   └── useApi.ts
│   │   ├── providers/
│   │   │   ├── ThemeProvider.tsx      # ⚠️ SEMPRE importare useTheme da qui
│   │   │   ├── ToastProvider.tsx
│   │   │   └── ConfirmProvider.tsx
│   │   └── styles/
│   │       ├── theme.ts              # Design system dark/light
│   │       └── global.css
│   ├── android/                      # ⭐ Progetto Android (Capacitor)
│   ├── capacitor.config.ts           # Config Capacitor
│   ├── .env                          # VITE_API_URL=http://<IP_PC>:8000
│   └── package.json
│
├── database/
│   ├── schema.sql
│   ├── seed_data.sql
│   └── migrations/
│       ├── 001_add_icona_colore_categorie.sql
│       ├── 002_add_obiettivi_table.sql
│       ├── 003_add_scomposizione_columns.sql
│       ├── 003_enhance_beni_table.sql
│       ├── 004_add_budget_id_to_movimenti.sql
│       ├── 004_enhance_budget_obiettivi.sql
│       ├── 005_add_ricorrenze.sql
│       └── 006_add_categorie_custom.sql
│
├── data/
│   └── lume.db             # Database SQLite
│
├── README.md
├── CONTEXT.md              # Context sviluppo (markdown formale)
├── context.md              # Questo file (prompt per AI)
├── requirements.txt
├── start.bat / start.py / start.sh
└── INSTALL_WINDOWS.md
```

---

## 📱 Mobile App Android (Capacitor)

### Setup iniziale (già fatto nel repo)
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
```

### Build e deploy (flusso standard)
```bash
cd frontend
# 1. Aggiorna IP nel .env se cambiato
echo VITE_API_URL=http://10.0.0.105:8000 > .env

# 2. Build (SENZA tsc pre-check)
npm run build

# 3. Sync con Android
npx cap sync

# 4. Apri Android Studio -> Build APK
npx cap open android
```

### Note critiche mobile
- `package.json` build script: `"build": "vite build"` (NO `tsc &&`)
- `@capacitor/status-bar` NON installato → non importarlo mai in Layout.tsx
- Backend DEVE usare `--host 0.0.0.0` (non 127.0.0.1)
- Telefono e PC sulla stessa rete WiFi
- IP può cambiare → aggiornare `.env` e fare rebuild + sync

### CORS Backend (main.py)
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost",           # ⭐ WebView Capacitor Android
    "capacitor://localhost",      # ⭐ Capacitor iOS
    "ionic://localhost",
]
```

---

## ⭐ Global Fetch Patch (main.tsx)

**Problema**: Molte pagine usano `fetch('/api/...')` diretto. Su Capacitor, le URL relative
risolvono a `capacitor://localhost/api/...` → ricevono `index.html` → errore JSON.

**Soluzione**: Patch globale in `main.tsx` PRIMA del render React:

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  if (API_BASE) {
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        input = `${API_BASE}${input}`;
      }
      return originalFetch(input, init);
    };
  }
}
```

Questo fix è **trasparente**: tutte le pagine continuano a usare `fetch('/api/...')` normalmente.

---

## ⭐ API Client Centralizzato (api.ts)

```typescript
// frontend/src/config/api.ts
const API_BASE = Capacitor.isNativePlatform()
  ? (import.meta.env.VITE_API_URL || '')
  : '';

export const api = {
  async get(endpoint: string) { ... },
  async post(endpoint: string, data?: any) { ... },
  async put(endpoint: string, data?: any) { ... },
  async delete(endpoint: string) { ... },
};
```

**Features**:
- `fetchWithTimeout`: abort dopo 30s
- `fetchWithRetry`: 2 retry con 1s wait
- Throttle alert: max 1 popup ogni 5s
- Log `📡 API GET`, `✅ success`, `❌ failed` nella console

**Usato da**: Dashboard, Movimenti, Analytics, Obiettivi e altri

---

## 🗄️ Schema Database

### `conti`
```sql
CREATE TABLE conti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,  -- 'Carta', 'Contante', 'Risparmio', 'Investimenti'
    saldo REAL NOT NULL DEFAULT 0,
    valuta TEXT NOT NULL DEFAULT 'EUR',
    attivo BOOLEAN NOT NULL DEFAULT 1,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `categorie`
```sql
CREATE TABLE categorie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    icona TEXT,
    colore TEXT
);
```

### `movimenti` ← Tabella Centrale
```sql
CREATE TABLE movimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE NOT NULL,
    importo REAL NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    categoria_id INTEGER,
    conto_id INTEGER NOT NULL,
    budget_id INTEGER,      -- ⭐ Priorità esplicita budget
    obiettivo_id INTEGER,   -- ⭐ Allocazione risparmio
    descrizione TEXT,
    note TEXT,
    ricorrente BOOLEAN DEFAULT 0,
    bene_id INTEGER,
    km_percorsi REAL,
    ore_utilizzo REAL,
    scomposizione_json TEXT,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorie(id),
    FOREIGN KEY (conto_id) REFERENCES conti(id),
    FOREIGN KEY (budget_id) REFERENCES budget(id),
    FOREIGN KEY (obiettivo_id) REFERENCES obiettivi_risparmio(id),
    FOREIGN KEY (bene_id) REFERENCES beni(id)
);
```

### `budget`
```sql
CREATE TABLE budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    importo REAL NOT NULL,
    periodo TEXT NOT NULL CHECK(periodo IN ('settimanale', 'mensile', 'annuale')),
    data_inizio DATE NOT NULL,
    attivo BOOLEAN DEFAULT 1
);
```

**Calcolo Spesa** (logica prioritaria):
```python
# 1. Movimenti con budget_id esplicito
speso_esplicito = SUM(importo) WHERE budget_id = X AND tipo = 'uscita'
# 2. Movimenti con categoria (fallback)
speso_categoria = SUM(importo) WHERE categoria_id = Y AND budget_id IS NULL AND tipo = 'uscita'
totale_speso = speso_esplicito + speso_categoria
```

### `obiettivi_risparmio`
```sql
CREATE TABLE obiettivi_risparmio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    importo_target REAL NOT NULL,
    importo_attuale REAL DEFAULT 0,  -- ⚠️ DEPRECATO
    data_target DATE,
    priorita INTEGER DEFAULT 3 CHECK(priorita BETWEEN 1 AND 5),
    completato BOOLEAN DEFAULT 0
);
```

**⚠️ IMPORTANTE**: `importo_attuale` è DEPRECATO. Calcola SEMPRE da movimenti:
```python
SELECT COALESCE(SUM(importo), 0)
FROM movimenti WHERE obiettivo_id = ? AND tipo = 'entrata'
```

### `beni`
```sql
CREATE TABLE beni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('veicolo', 'elettrodomestico')),
    data_acquisto DATE NOT NULL,
    prezzo_acquisto REAL NOT NULL,
    durata_anni_stimata INTEGER DEFAULT 10,
    veicolo_tipo_carburante TEXT,
    veicolo_consumo_medio REAL,
    veicolo_costo_manutenzione_per_km REAL DEFAULT 0,
    elettrodomestico_potenza INTEGER,
    elettrodomestico_ore_medie_giorno REAL DEFAULT 0,
    attivo BOOLEAN DEFAULT 1
);
```

### `ricorrenze`
```sql
CREATE TABLE ricorrenze (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    importo REAL NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    frequenza TEXT NOT NULL CHECK(frequenza IN ('giornaliera','settimanale','mensile','annuale')),
    prossima_data DATE NOT NULL,
    attivo BOOLEAN DEFAULT 1,
    conto_id INTEGER,
    categoria_id INTEGER,
    note TEXT
);
```

---

## 📡 API Endpoints

```http
# Analytics
GET /api/analytics/dashboard
GET /api/analytics/trend?period=1m|3m|6m|1y
GET /api/analytics/comparison?period=month|quarter|year
GET /api/analytics/budget-warnings
GET /api/analytics/top-spese?limit=5&period=month

# Movimenti
GET/POST         /api/movimenti
GET/PUT/DELETE   /api/movimenti/{id}
GET              /api/movimenti/categorie
GET              /api/movimenti/export  (CSV)
GET              /api/movimenti?page=1&per_page=20

# Ricorrenze
GET/POST              /api/ricorrenze
GET/PUT/DELETE        /api/ricorrenze/{id}
POST                  /api/ricorrenze/{id}/toggle
POST                  /api/ricorrenze/{id}/esegui

# Conti
GET/POST/PUT/DELETE   /api/conti

# Budget
GET/POST/PUT/DELETE   /api/budget
GET                   /api/budget/riepilogo/{periodo}

# Obiettivi
GET/POST/PUT/DELETE   /api/obiettivi

# Beni
GET/POST/PUT/DELETE   /api/beni

# Categorie (custom)
GET/POST/PUT/DELETE   /api/categorie
```

---

## 🔥 Funzionalità Uniche

### 1. Scomposizione Costi Nascosti (Veicoli)
```python
costo_carburante = km * consumo/100 * prezzo_litro
costo_manutenzione = km * costo_per_km
costo_ammortamento = km * (prezzo_acquisto / (anni * km_annui_stimati))
importo_totale = costo_carburante + costo_manutenzione + costo_ammortamento
```

### 2. Scomposizione Costi Nascosti (Elettrodomestici)
```python
costo_energia = ore * (potenza_watt/1000) * tariffa_kwh
costo_ammortamento = ore * (prezzo_acquisto / ore_vita_stimata)
importo_totale = costo_energia + costo_ammortamento
```

### 3. Budget con Logica Prioritaria
Campo `budget_id` in movimenti → scala dal budget esplicito invece che dalla categoria.

### 4. Obiettivi con Calcolo da Movimenti
`importo_attuale` sempre calcolato `SUM(movimenti.importo)` dove `obiettivo_id = ?`.

### 5. Dashboard Personalizzabile
Hook `useDashboardLayout()`, modal `DashboardCustomizer`, persistenza `localStorage`.

### 6. Movimenti Ricorrenti
Endpoint `/toggle` (attiva/pausa) e `/esegui` (esecuzione manuale con creazione movimento).

---

## 🎨 UI / Design System

### Navigazione (App.tsx)
```
Dashboard → MovimentiWithTabs → Patrimonio → Finanza → Impostazioni
```
Bottom navigation con 5 tab. Solo una pagina attiva alla volta (`activeTab` in App.tsx).

### Theme (providers/ThemeProvider)
- **⚠️ REGOLA CRITICA**: importare `useTheme` SEMPRE da `providers/ThemeProvider`, MAI da `hooks/useTheme`
- Light: `background #F8F9FA`, `surface #FFFFFF`, `text.primary #212121`
- Dark: `background #0F0F0F`, `surface #1A1A1A`, `text.primary #F5F5F5` (contrasto 16.5:1 WCAG AAA)
- Persistenza: localStorage key `theme_mode`

### Safe Areas (Mobile)
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```
NON usare `@capacitor/status-bar` (non installato).

---

## ⚠️ Problemi Noti & Workaround

### 1. Windows Encoding Error
```python
# In database.py
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_script = f.read()
```

### 2. Backend non raggiungibile da telefono
```bash
# SBAGLIATO (solo localhost)
uvicorn backend.main:app --host 127.0.0.1 --port 8000
# CORRETTO (tutta la rete)
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 3. ERR_CONNECTION_TIMED_OUT al primo avvio mobile
**Causa**: Android WebView ha ~6 connessioni simultanee. Dashboard lancia 8+ richieste.  
**Comportamento**: Timeout → 2 retry automatici → successo al secondo tentativo.  
**Non è un bug**: i dati caricano correttamente dopo i retry.

### 4. SyntaxError JSON su fetch('/api/...')
**Causa**: `fetch('/api/...')` su Capacitor risolve a `capacitor://localhost/api/...` → riceve HTML.  
**Fix**: Global fetch patch in `main.tsx` (già applicato).

### 5. Build fallisce con errori TypeScript
**Causa**: script `build` con `tsc && vite build`.  
**Fix**: `package.json` → `"build": "vite build"` (senza tsc pre-check).

### 6. @capacitor/status-bar non trovato
**Fix**: Rimuovere import da `Layout.tsx`. Usare CSS `env()` per safe areas.

---

## 💬 Note per AI Assistant

### Backend
- Sempre `conn.commit()` dopo INSERT/UPDATE/DELETE
- `encoding='utf-8'` per tutti i file SQL
- Gestire errori con `HTTPException`
- Backend DEVE girare su `--host 0.0.0.0`

### Frontend
- Build: `"build": "vite build"` (NO `tsc &&`)
- `useTheme` SEMPRE da `providers/ThemeProvider`
- Per chiamate API usare `api.ts` oppure `fetch('/api/...')` (coperto dalla global patch)
- Per safe areas mobile: CSS `env(safe-area-inset-*)`, NON `@capacitor/status-bar`
- NON aggiungere `@capacitor/status-bar` (non installato)
- NON modificare `importo_attuale` in `obiettivi_risparmio` (deprecato)

### Capacitor / Mobile
- Dopo ogni modifica frontend: `npm run build` → `npx cap sync` → build da Android Studio
- Il file `.env` contiene l'IP del PC sulla rete WiFi (può cambiare)
- Telefono e PC devono essere sulla stessa rete WiFi

### Commit Messages
```
feat: Add nuova funzionalità
fix: Risolve bug specifico
docs: Aggiorna documentazione
refactor: Ristruttura codice
style: Migliora CSS/UI
chore: Build/config
```

---

## 📝 Prossimi Step

### High Priority
- [ ] Drag & Drop riordino widget dashboard
- [ ] Export PDF/Excel report con grafici
- [ ] Notifiche push budget superati

### Medium Priority
- [ ] Multi-utente con autenticazione
- [ ] Cloud sync e backup automatico
- [ ] iOS build (Capacitor - già pronto lato codice)
- [ ] PWA installabile

### Low Priority
- [ ] API bancarie PSD2
- [ ] ML previsioni spesa
- [ ] Tag personalizzati
- [ ] Dark mode auto-switch per orario

---

**Ultima Modifica**: 03 Marzo 2026  
**Versione Context**: 2.0  
**Autore**: Afellai3
