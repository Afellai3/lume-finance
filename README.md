# 💰 Lume Finance

> Sistema moderno di gestione finanze personali con analisi avanzata dei costi nascosti, tema dark/light, dashboard personalizzabile e **app mobile Android nativa tramite Capacitor**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6-119EFF?logo=capacitor)](https://capacitorjs.com/)

## 🎯 Caratteristiche Principali

### 📱 App Mobile Android (Capacitor)
- **Build nativo Android** tramite Capacitor + Android Studio
- **Safe area support** tramite CSS `env(safe-area-inset-*)` per notch e barre di sistema
- **API client centralizzato** (`api.ts`) con base URL configurabile via `.env`
- **Global fetch patch** in `main.tsx`: tutti i `fetch('/api/...')` ricevono automaticamente il prefisso dell'IP backend su piattaforma nativa
- **Retry logic**: timeout 30s con 2 retry automatici su failure
- **CORS configurato** per `http://localhost`, `capacitor://localhost`, `ionic://localhost`

### 🎨 UI/UX Moderna
- **🌓 Tema Dark/Light Avanzato**: switch seamless, persistenza localStorage, contrasti WCAG AAA (16.5:1), auto-detect sistema
- **📱 Mobile-First**: interfaccia ottimizzata per smartphone
- **🧭 Bottom Navigation**: navigazione rapida con icone intuitive
- **🖼️ Header con Logo Cliccabile**: click → torna alla Dashboard
- **⚡ Animazioni Fluide**: transizioni smooth e hover effects

### 📊 Dashboard Personalizzabile
- Widget show/hide e riordinabili con persistenza `localStorage`
- KPI in tempo reale: saldo totale, entrate/uscite mensili
- Grafici interattivi con Chart.js
- Widget: Saldo, Entrate vs Uscite, Top Categorie, Ultimi Movimenti, Budget & Obiettivi

### 💸 Gestione Movimenti
- CRUD completo con collegamento conti, categorie, budget, obiettivi
- Ricerca avanzata per descrizione, categoria, note
- Movimenti ricorrenti automatici

### 🔥 Scomposizione Costi Nascosti
Feature **unica** per analizzare i costi reali di veicoli ed elettrodomestici:
- **Veicoli**: carburante + manutenzione + ammortamento
- **Elettrodomestici**: consumo kWh + ammortamento orario

### 🎯 Budget Intelligente
- Calcolo priorità: `budget_id` esplicito > categoria (fallback)
- Progress bar con stati OK / Attenzione / Superato
- Periodi: Settimanale, Mensile, Annuale

### 💰 Obiettivi di Risparmio
- Importo calcolato automaticamente da movimenti in entrata con `obiettivo_id`
- Progress bar, badge priorità, countdown scadenza
- Auto-completamento al 100%

### 🏦 Conti & Beni
- Multi-conto: Carta, Contante, Risparmio, Investimenti
- Veicoli ed elettrodomestici con ammortamento automatico

---

## 🏗️ Architettura

```
lume-finance/
├── backend/                 # FastAPI REST API
│   ├── routes/
│   │   ├── analytics.py    # Dashboard e analytics
│   │   ├── movimenti.py    # CRUD movimenti + scomposizione
│   │   ├── conti.py        # Gestione conti
│   │   ├── budget.py       # Budget con logica prioritaria
│   │   ├── obiettivi.py    # Obiettivi risparmio
│   │   ├── beni.py         # Veicoli ed elettrodomestici
│   │   ├── categorie.py    # Categorie custom
│   │   └── ricorrenze.py   # Movimenti ricorrenti
│   ├── database.py         # SQLite + migrations
│   └── main.py             # FastAPI app + CORS
├── frontend/               # React + TypeScript + Capacitor
│   ├── src/
│   │   ├── main.tsx              # Entry point + global fetch patch
│   │   ├── config/
│   │   │   └── api.ts            # ⭐ Client API centralizzato
│   │   ├── components/
│   │   │   ├── layout/           # Header, BottomNav, Layout
│   │   │   ├── ui/               # Button, Card, Input, ecc.
│   │   │   └── DashboardCustomizer.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MovimentiWithTabs.tsx  # Tabs: Movimenti | Ricorrenze | Categorie
│   │   │   ├── Patrimonio.tsx         # Tabs: Conti | Beni
│   │   │   ├── Finanza.tsx            # Tabs: Budget | Obiettivi
│   │   │   └── Impostazioni.tsx
│   │   ├── providers/            # ThemeProvider, ToastProvider, ConfirmProvider
│   │   └── styles/               # theme.ts, global.css
│   ├── android/                  # Progetto Android (Capacitor)
│   ├── capacitor.config.ts
│   └── .env                      # VITE_API_URL=http://<IP_PC>:8000
├── database/
│   ├── schema.sql
│   ├── seed_data.sql
│   └── migrations/
└── data/
    └── lume.db
```

---

## 🚀 Setup & Installazione

### Prerequisiti
- **Python 3.11+**
- **Node.js 18+**
- **Android Studio** (solo per build mobile)
- **Git**

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Afellai3/lume-finance.git
cd lume-finance
```

### 2️⃣ Backend Setup
```bash
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Avvia su TUTTE le interfacce (obbligatorio per mobile)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

> ⚠️ Usare sempre `--host 0.0.0.0` per rendere il backend raggiungibile dal telefono

### 3️⃣ Frontend Setup (Web)
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Build App Android

#### Configurazione iniziale
```bash
cd frontend

# Crea file .env con IP del PC sulla rete WiFi
echo VITE_API_URL=http://10.0.0.105:8000 > .env

# Installa dipendenze Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android   # Solo la prima volta
```

#### Build e deploy
```bash
# Build produzione (senza type check)
# In package.json: "build": "vite build"
npm run build

# Sincronizza con Android
npx cap sync

# Apri in Android Studio per build APK
npx cap open android
```

> 💡 Trovare il proprio IP: `ipconfig` su Windows → cercare "Wireless LAN adapter"

---

## ⚙️ Configurazione CORS (Backend)

Il backend accetta richieste da:

```python
allow_origins=[
    "http://localhost:3000",   # Vite dev server
    "http://localhost",        # Capacitor Android/iOS
    "capacitor://localhost",   # Capacitor iOS
    "ionic://localhost",       # Ionic
]
```

---

## ⚙️ Global Fetch Patch (Frontend)

In `main.tsx`, prima del render, viene applicata una patch globale a `window.fetch` per Capacitor:

```typescript
if (Capacitor.isNativePlatform()) {
  const API_BASE = import.meta.env.VITE_API_URL;
  const originalFetch = window.fetch.bind(window);
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = `${API_BASE}${input}`;
    }
    return originalFetch(input, init);
  };
}
```

Questo fix permette a **tutte le pagine** di usare `fetch('/api/...')` senza modifiche, anche quelle che non usano `api.ts` direttamente.

---

## 🗄️ Database

### Schema Principale
```sql
conti (id, nome, tipo, saldo, valuta, attivo)
categorie (id, nome, tipo, icona, colore)
movimenti (id, data, importo, tipo, categoria_id, conto_id,
           budget_id, obiettivo_id,          -- ⭐ Logica prioritaria
           bene_id, km_percorsi, ore_utilizzo, scomposizione_json)
budget (id, categoria_id, importo, periodo, data_inizio, attivo)
obiettivi_risparmio (id, nome, importo_target, data_target, priorita, completato)
beni (id, nome, tipo, veicolo_*, elettrodomestico_*)
ricorrenze (id, descrizione, importo, tipo, frequenza, prossima_data, attivo)
```

### Migrations
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

## 📡 API Endpoints

```http
GET  /api/analytics/dashboard
GET  /api/analytics/trend
GET  /api/analytics/comparison
GET  /api/analytics/budget-warnings
GET  /api/analytics/top-spese

GET/POST/PUT/DELETE  /api/movimenti
GET/POST/PUT/DELETE  /api/conti
GET/POST/PUT/DELETE  /api/budget
GET/POST/PUT/DELETE  /api/obiettivi
GET/POST/PUT/DELETE  /api/beni
GET/POST/PUT/DELETE  /api/categorie
GET/POST/PUT/DELETE  /api/ricorrenze

POST /api/ricorrenze/{id}/toggle
POST /api/ricorrenze/{id}/esegui
GET  /api/movimenti/export      # Export CSV
```

---

## 🐛 Bug Risolti

### Feb 2026
- ✅ `conn.commit()` mancante in Conti/Beni/Budget
- ✅ Campo `importo_attuale` deprecato → calcolo da movimenti
- ✅ Encoding UTF-8 Windows
- ✅ Fix contrasti dark mode (WCAG AAA)
- ✅ ThemeToggle import da `providers/ThemeProvider`
- ✅ Dashboard customizer persistenza layout

### Mar 2026 - Mobile App
- ✅ Backend in ascolto su `0.0.0.0` (era `127.0.0.1`)
- ✅ CORS: aggiunto `http://localhost` e `capacitor://localhost`
- ✅ `Layout.tsx`: rimosso `@capacitor/status-bar`, usato CSS `env()` per safe areas
- ✅ `api.ts`: aggiunto timeout 30s, retry logic (2 tentativi), throttle alert
- ✅ `main.tsx`: global fetch patch per Capacitor native
- ✅ Fix dipendenze: `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`
- ✅ `package.json`: build senza `tsc` pre-check

---

## 📝 TODO & Roadmap

### In Sviluppo
- [ ] Export PDF/Excel dei report
- [ ] Notifiche push budget superati
- [ ] Drag & Drop riordino widget dashboard
- [ ] Grafici trend mensili

### Future Features
- [ ] Multi-utente con autenticazione
- [ ] Cloud sync e backup automatico
- [ ] Integrazione API bancarie (PSD2)
- [ ] Machine Learning per previsioni spesa
- [ ] PWA (Progressive Web App) installabile
- [ ] iOS build (Capacitor)

---

## 👤 Autore

**Sviluppato da**: Afellai3  
**Ruolo**: Data Analyst con Power BI in azienda trasporto e logistica  
**Località**: Provincia di Salerno, Campania, IT

---

**⭐ Se trovi utile questo progetto, lascia una stella su GitHub!**
