# 💰 Lume Finance

> Sistema moderno di gestione finanze personali con analisi avanzata dei costi nascosti, tema dark/light, dashboard personalizzabile e interfaccia mobile-first

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)

## 🎯 Caratteristiche Principali

### 🎨 UI/UX Moderna
- **🌓 Tema Dark/Light Avanzato**: 
  - Switch seamless con persistenza localStorage
  - Contrasti WCAG AAA (16.5:1) per accessibilità
  - Transizioni fluide tra temi
  - Auto-detect preferenza sistema
- **📱 Mobile-First**: Interfaccia ottimizzata per smartphone
- **🧭 Bottom Navigation**: Navigazione rapida con icone intuitive
- **🖼️ Header con Logo Cliccabile**: Click sul logo → torna alla Dashboard
- **⚡ Animazioni Fluide**: Transizioni smooth e hover effects
- **🎨 Design System**: Tema coerente con gradient accent colors

### 📊 Dashboard Personalizzabile
- **🎨 Widget Riordinabili**: Drag & drop per personalizzare layout (Coming soon)
- **👁️ Mostra/Nascondi Widget**: Customizza quali widget visualizzare
- **💾 Persistenza Layout**: Salvataggio automatico preferenze in localStorage
- **Widget Disponibili**:
  - 💰 Saldo Totale
  - 📊 Entrate vs Uscite (grafico)
  - 🏆 Top Categorie spesa
  - 📝 Ultimi Movimenti
  - 🎯 Budget & Obiettivi
- **KPI in tempo reale**: Saldo totale, entrate/uscite mensili
- **Grafici interattivi**: Spese per categoria con Chart.js
- **Widget intelligenti**: Budget e obiettivi di risparmio
- **Movimenti recenti**: Ultimi 5 movimenti con quick actions

### 💸 Gestione Movimenti
- ✅ CRUD completo (Create, Read, Update, Delete)
- 🏦 Collegamento conti bancari
- 🏷️ Categorizzazione automatica
- 🎯 **Budget esplicito prioritario** (campo budget_id)
- 💰 **Allocazione a obiettivi di risparmio** (campo obiettivo_id)
- 🔄 Supporto movimenti ricorrenti
- 📝 Descrizioni e note
- 🔍 Ricerca avanzata per descrizione, categoria, note

### 🔥 Scomposizione Costi Nascosti
Funzionalità **unica** per analizzare i costi reali di:

#### 🚗 Veicoli
- **Carburante**: Calcolo basato su consumo medio e km percorsi
- **Manutenzione**: Costo per km configurabile
- **Ammortamento**: Deprezzamento automatico nel tempo
- **Esempio**: "Viaggio Milano-Roma"
  ```
  💵 Totale: 85.50€
  ├─ Carburante: 45.20€ (300km × 6.5L/100km × 1.85€/L)
  ├─ Manutenzione: 18.00€ (300km × 0.06€/km)
  └─ Ammortamento: 22.30€ (300km × 0.074€/km)
  ```

#### ⚡ Elettrodomestici
- **Consumo energetico**: Calcolo kWh × tariffa
- **Costo orario**: Potenza × ore utilizzo
- **Esempio**: "Lavatrice settimana"
  ```
  💵 Totale: 3.15€
  ├─ Energia: 2.80€ (7 ore × 1.6kW × 0.25€/kWh)
  └─ Ammortamento: 0.35€ (7 ore × 0.05€/h)
  ```

### 🎯 Budget Intelligente
- 📅 Periodi: Settimanale, Mensile, Annuale
- 📈 **Calcolo prioritario spesa**:
  1. **Movimenti con budget_id esplicito** (priorità massima)
  2. **Movimenti con categoria** (fallback automatico)
- 🎨 Progress bar con stati:
  - 🟢 **OK**: < 80% utilizzo
  - 🟠 **Attenzione**: 80-99% utilizzo
  - 🔴 **Superato**: ≥ 100% utilizzo
- 📊 Riepilogo globale: totale budget, speso, rimanente

### 💰 Obiettivi di Risparmio
- 🎯 Definizione target con data scadenza
- 💵 **Allocazione fondi tramite movimenti** (campo obiettivo_id)
- 📈 **Calcolo automatico** da movimenti in entrata collegati
- 📊 Progress bar globale e per obiettivo
- 🏷️ Badge priorità colorati:
  - 🔴 Critica (5)
  - 🟠 Alta (4)
  - 🟡 Media (3)
  - 🟢 Bassa (2)
  - 🔵 Molto Bassa (1)
- ⏰ Avviso scadenza con countdown
- ✅ Auto-completamento al 100%
- 📂 Separazione attivi/completati

### 🏦 Conti
- 💳 Multi-conto: Carta, Contante, Risparmio, Investimenti
- 💰 Calcolo saldo automatico dai movimenti
- 🔄 Attivazione/Disattivazione
- 🌍 Multi-valuta (EUR default)

### 🚗 Gestione Beni
- **Veicoli**:
  - Tipo carburante (Benzina, Diesel, Elettrico, Ibrido, GPL)
  - Consumo medio (L/100km o kWh/100km)
  - Costo manutenzione per km
- **Elettrodomestici**:
  - Potenza (Watt)
  - Ore medie utilizzo giornaliero
  - Consumo annuale stimato
- **Ammortamento automatico** con durata configurabile

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
│   │   ├── obiettivi.py    # Obiettivi risparmio (calcolo da movimenti)
│   │   └── beni.py         # Veicoli ed elettrodomestici
│   ├── database.py         # SQLite connection + migrations
│   └── main.py             # FastAPI app
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Header, BottomNav, Layout
│   │   │   ├── ui/               # ThemeToggle, ConfirmDialog
│   │   │   ├── DashboardCustomizer.tsx  # Modal personalizzazione
│   │   │   └── forms/            # MovimentoForm, ContoForm, ecc.
│   │   ├── pages/                # Dashboard, Movimenti, Budget, ecc.
│   │   ├── hooks/
│   │   │   ├── useTheme.ts       # Hook gestione tema
│   │   │   ├── useDashboardLayout.ts  # Hook layout personalizzabile
│   │   │   └── useApi.ts
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx # Context globale tema
│   │   ├── styles/
│   │   │   ├── theme.ts          # Design system con dark/light
│   │   │   └── global.css        # CSS globale con variabili
│   │   └── App.tsx               # Router principale
│   └── public/
│       └── logo.jpg              # Logo aziendale
├── database/
│   ├── schema.sql                # Schema database
│   ├── seed_data.sql             # Dati demo
│   └── migrations/               # Migrations SQL incrementali
│       ├── 001_add_icona_colore_categorie.sql
│       ├── 002_add_obiettivi_table.sql
│       ├── 003_add_scomposizione_columns.sql
│       └── 004_add_budget_id_to_movimenti.sql
├── docs/                         # 📚 Documentazione completa
│   ├── STEP_5_CUSTOMIZABLE_DASHBOARD.md
│   ├── DARK_MODE_SETUP.md
│   ├── DARK_MODE_FIX.md
│   ├── FIX_ALL_THEME_IMPORTS.md
│   └── DASHBOARD_INTEGRATION_EXAMPLE.md
└── data/
    └── lume.db                   # Database SQLite (generato)
```

---

## 🚀 Setup & Installazione

### Prerequisiti
- **Python 3.11+** (testato su 3.13)
- **Node.js 18+** (testato su 18.x)
- **Git**

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Afellai3/lume-finance.git
cd lume-finance
```

### 2️⃣ Backend Setup
```bash
# Crea virtual environment
python -m venv venv

# Attiva venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installa dipendenze
pip install -r requirements.txt

# Avvia server (inizializza DB automaticamente)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend disponibile su: **http://localhost:8000**

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend disponibile su: **http://localhost:3000**

### 🪟 Avvio Rapido (Windows)
```bash
start.bat
```
Avvia automaticamente backend + frontend in finestre separate.

---

## 🎨 Sistema di Temi (Dark/Light)

### Features
- **Persistenza**: Tema salvato in `localStorage` con chiave `theme_mode`
- **Auto-detect**: Rileva preferenza sistema con `prefers-color-scheme`
- **Transizioni**: Tutti i colori con `transition: 200ms ease`
- **Contrasti WCAG AAA**: Text su background = 16.5:1
- **Context Globale**: Tema condiviso tra tutti i componenti

### Palette Colori

#### Light Mode
```typescript
background: '#F8F9FA'      // Grigio molto chiaro
surface: '#FFFFFF'         // Bianco
text.primary: '#212121'    // Quasi nero
text.secondary: '#757575'  // Grigio medio
border.light: '#E0E0E0'    // Bordi soft
```

#### Dark Mode (High Contrast)
```typescript
background: '#0F0F0F'      // Nero profondo
surface: '#1A1A1A'         // Grigio molto scuro
text.primary: '#F5F5F5'    // Quasi bianco (contrasto 16.5:1)
text.secondary: '#C0C0C0'  // Grigio chiaro (contrasto 9.8:1)
border.light: '#2A2A2A'    // Bordi visibili ma discreti
```

### Utilizzo nei Componenti

```typescript
import { useTheme } from '../providers/ThemeProvider';

function MyComponent() {
  const { theme, mode, toggleTheme, isDark } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.surface,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.light}`
    }}>
      <button onClick={toggleTheme}>
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}
```

**⚠️ Importante**: Tutti i componenti devono importare `useTheme` da `providers/ThemeProvider`, NON da `hooks/useTheme` (altrimenti creano istanze separate).

---

## 🗄️ Database

### Schema Principale
```sql
-- Conti bancari
conti (id, nome, tipo, saldo, valuta, attivo)

-- Categorie entrate/uscite
categorie (id, nome, tipo, icona, colore)

-- Movimenti finanziari
movimenti (
  id, data, importo, tipo, categoria_id, conto_id, 
  budget_id,       -- ⭐ Collegamento esplicito budget
  obiettivo_id,    -- ⭐ Allocazione a obiettivo risparmio
  descrizione, ricorrente,
  bene_id, km_percorsi, ore_utilizzo,  -- Scomposizione costi
  scomposizione_json
)

-- Budget per categoria
budget (id, categoria_id, importo, periodo, data_inizio, attivo)

-- Obiettivi risparmio
obiettivi_risparmio (
  id, nome, importo_target, importo_attuale,  -- importo_attuale DEPRECATO
  data_target, priorita, completato
)

-- Beni (veicoli/elettrodomestici)
beni (
  id, nome, tipo, data_acquisto, prezzo_acquisto,
  veicolo_tipo_carburante, veicolo_consumo_medio,
  elettrodomestico_potenza, elettrodomestico_ore_medie_giorno
)
```

### ⚠️ Nota Importante: Campo `importo_attuale` Deprecato

Il campo `importo_attuale` in `obiettivi_risparmio` **NON viene più utilizzato**. L'importo è **calcolato automaticamente** dalla somma dei movimenti in entrata con `obiettivo_id`:

```sql
SELECT SUM(importo) FROM movimenti 
WHERE obiettivo_id = ? AND tipo = 'entrata'
```

**Motivo**: Garantisce coerenza dati - unica fonte di verità è la tabella movimenti.

---

## 📡 API Endpoints

### Analytics
```http
GET  /api/analytics/dashboard          # KPI e statistiche
GET  /api/analytics/spese-per-categoria # Grafico categorie
```

### Movimenti
```http
GET    /api/movimenti                  # Lista movimenti
POST   /api/movimenti                  # Crea movimento
GET    /api/movimenti/{id}             # Dettaglio movimento
PUT    /api/movimenti/{id}             # Aggiorna movimento
DELETE /api/movimenti/{id}             # Elimina movimento
GET    /api/movimenti/categorie        # Lista categorie
```

### Budget
```http
GET    /api/budget                     # Lista budget
POST   /api/budget                     # Crea budget
GET    /api/budget/{id}                # Dettaglio budget
PUT    /api/budget/{id}                # Aggiorna budget
DELETE /api/budget/{id}                # Elimina budget
GET    /api/budget/riepilogo/{periodo} # Riepilogo (mensile/annuale)
```

### Obiettivi
```http
GET    /api/obiettivi                  # Lista obiettivi (importo calcolato)
POST   /api/obiettivi                  # Crea obiettivo
GET    /api/obiettivi/{id}             # Dettaglio obiettivo
PUT    /api/obiettivi/{id}             # Aggiorna obiettivo
DELETE /api/obiettivi/{id}             # Elimina obiettivo
```

### Conti & Beni
```http
GET/POST/PUT/DELETE  /api/conti        # CRUD conti
GET/POST/PUT/DELETE  /api/beni         # CRUD beni
```

---

## 🎨 Frontend Components

### Layout & Navigation
```typescript
Layout.tsx              // Container principale con Header e BottomNav
Header.tsx              // Logo cliccabile + ThemeToggle + UserInfo
BottomNav.tsx           // 5 tab navigation
```

### Theme System
```typescript
useTheme.ts             // Hook per gestione tema dark/light
ThemeProvider.tsx       // Context globale condiviso
ThemeToggle.tsx         // Switch animato Sun/Moon
theme.ts                // Design system (palette + spacing)
global.css              // CSS variabili per dark mode
```

### Dashboard Personalizzabile
```typescript
useDashboardLayout.ts       // Hook gestione widget
DashboardCustomizer.tsx     // Modal personalizzazione
```

**Features**:
- Mostra/nascondi widget con toggle Eye/EyeOff
- Riordina widget con frecce ⬆️⬇️
- Reset a layout default
- Persistenza in `localStorage` (key: `dashboard_layout_v1`)

---

## 🐛 Bug Risolti (Feb 2026)

### Database & Backend
- ✅ `conn.commit()` mancante in Conti/Beni/Budget
- ✅ Nome colonna `creato_il` → `data_creazione` in Obiettivi
- ✅ Encoding UTF-8 per Windows (fix UnicodeDecodeError)
- ✅ Schema già esistente: skip se DB presente
- ✅ **Obiettivi con valori diversi**: GET `/api/obiettivi` ora calcola da movimenti

### Frontend & UI
- ✅ CSS mancante per BudgetForm
- ✅ Struttura dati API Budget errata
- ✅ Import errato `dashboard` → `analytics`
- ✅ **Logo cliccabile**: Click logo → torna alla Dashboard
- ✅ **Tema dark/light**: Switch persistente con localStorage
- ✅ **Bottom navigation**: Icone Material Design con hover effects
- ✅ **Dark mode contrasti**: Text primary `#F5F5F5` (era `#E8E8E8`) → +10% luminosità
- ✅ **ThemeToggle non funzionava**: Fix import da `providers/ThemeProvider`
- ✅ **Layout/Header import errato**: Ora usano context condiviso
- ✅ **Testi non leggibili in dark**: Background `#0F0F0F`, text secondary `#C0C0C0`

---

## 📚 Documentazione

Documentazione completa nella cartella `/docs`:

- **[STEP_5_CUSTOMIZABLE_DASHBOARD.md](docs/STEP_5_CUSTOMIZABLE_DASHBOARD.md)**: Guida dashboard personalizzabile
- **[DARK_MODE_SETUP.md](docs/DARK_MODE_SETUP.md)**: Setup completo tema dark/light
- **[DARK_MODE_FIX.md](docs/DARK_MODE_FIX.md)**: Fix contrasti e problemi comuni
- **[FIX_ALL_THEME_IMPORTS.md](docs/FIX_ALL_THEME_IMPORTS.md)**: Come fixare import useTheme
- **[DASHBOARD_INTEGRATION_EXAMPLE.md](docs/DASHBOARD_INTEGRATION_EXAMPLE.md)**: Esempi integrazione

---

## 📝 TODO & Roadmap

### In Sviluppo
- [ ] Export PDF/Excel dei report
- [ ] Notifiche budget superati
- [ ] Grafici trend mensili
- [ ] Gestione automatica movimenti ricorrenti
- [ ] Drag & Drop riordino widget dashboard

### Future Features
- [ ] Multi-utente con autenticazione
- [ ] Cloud sync e backup automatico
- [ ] Mobile app (React Native)
- [ ] Integrazione API bancarie (PSD2)
- [ ] Machine Learning per previsioni spesa
- [ ] Tag personalizzati oltre le categorie
- [ ] PWA (Progressive Web App) installabile

---

## 🤝 Contributi

Progetto in sviluppo attivo. Per contribuire:

1. Fork il repository
2. Crea un branch feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit modifiche (`git commit -m 'Aggiungi nuova funzionalità'`)
4. Push al branch (`git push origin feature/nuova-funzionalita`)
5. Apri una Pull Request

---

## 📄 Licenza

MIT License - vedi file LICENSE per dettagli.

---

## 👤 Autore

**Sviluppato da**: Afellai3  
**Contesto**: Data Analyst con Power BI in azienda trasporto e logistica  
**Località**: Montoro Superiore, Provincia di Salerno, Campania, IT  

---

## 🙏 Ringraziamenti

- FastAPI per l'eccellente framework backend
- React team per l'ecosistema frontend
- Chart.js per i grafici interattivi
- SQLite per il database leggero e potente
- Lucide React per le icone

---

**⭐ Se trovi utile questo progetto, lascia una stella su GitHub!**
