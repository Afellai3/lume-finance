# 💰 Lume Finance

> Sistema moderno di gestione finanze personali con analisi avanzata dei costi nascosti, tema dark/light, dashboard personalizzabile e **app mobile Android nativa con Capacitor**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.0-119EFF?logo=capacitor)](https://capacitorjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)

## 🎯 Caratteristiche Principali

### 📱 App Mobile Android Nativa
- **🤖 Capacitor**: Build APK nativo da codice React
- **🔌 API Centralizzata**: Configurazione backend tramite file `.env`
- **📡 Network Security**: Cleartext traffic per connessione a backend locale
- **🎨 Safe Area Support**: Layout adattivo per notch e gesture bar
- **🔍 Debug USB**: Chrome DevTools per debugging real-time
- **📦 Build APK**: Generazione APK via Android Studio

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
- **Widget Disponibili**:
  - 💰 Saldo Totale
  - 📊 Entrate vs Uscite (grafico)
  - 🏆 Top Categorie spesa
  - 📝 Ultimi Movimenti
  - 🎯 Budget & Obiettivi
- **KPI in tempo reale**: Saldo totale, entrate/uscite mensili
- **Grafici interattivi**: Spese per categoria con Recharts
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

### 🎯 Budget Intelligente
- 📅 Periodi: Settimanale, Mensile, Annuale
- 📈 **Calcolo prioritario spesa**:
  1. **Movimenti con budget_id esplicito** (priorità massima)
  2. **Movimenti con categoria** (fallback automatico)
- 🎨 Progress bar con stati:
  - 🟢 **OK**: < 80% utilizzo
  - 🟠 **Attenzione**: 80-99% utilizzo
  - 🔴 **Superato**: ≥ 100% utilizzo

### 💰 Obiettivi di Risparmio
- 🎯 Definizione target con data scadenza
- 💵 **Allocazione fondi tramite movimenti** (campo obiettivo_id)
- 📈 **Calcolo automatico** da movimenti in entrata collegati
- 📊 Progress bar globale e per obiettivo
- 🏷️ Badge priorità colorati

---

## 🏗️ Architettura

```
lume-finance/
├── backend/                 # FastAPI REST API
│   ├── routes/             # Endpoints
│   ├── database.py         # SQLite + migrations
│   └── main.py             # FastAPI app
├── frontend/               # React + TypeScript + Capacitor
│   ├── src/
│   │   ├── config/
│   │   │   └── api.ts      # ⭐ Client API centralizzato
│   │   ├── components/
│   │   ├── pages/
│   │   ├── providers/
│   │   └── App.tsx
│   ├── android/            # 🤖 Progetto Android nativo (generato)
│   ├── capacitor.config.ts # Config Capacitor
│   ├── .env                # ⚠️ VITE_API_URL (OBBLIGATORIO per mobile)
│   └── package.json
├── database/
│   ├── schema.sql
│   └── migrations/
├── docs/                   # 📚 Documentazione
│   ├── MOBILE_DEBUG_CONTEXT.md  # ⭐ Context per debug mobile
│   └── ...
└── data/
    └── lume.db
```

---

## 🚀 Setup & Installazione

### Prerequisiti
- **Python 3.11+**
- **Node.js 18+**
- **Android Studio** (per build APK)
- **Git**

### 1️⃣ Backend Setup
```bash
cd lume-finance
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 2️⃣ Frontend Web Setup
```bash
cd frontend
npm install
npm run dev
```

### 3️⃣ Mobile App Setup (Android)

#### Configura IP Backend
```bash
cd frontend

# Crea file .env con IP del PC sulla rete locale
echo VITE_API_URL=http://10.0.0.233:8000 > .env

# Verifica IP con:
# Windows: ipconfig
# Linux/Mac: ifconfig
```

#### Build APK
```bash
# Installa dipendenze Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Build progetto React
npm run build

# Genera progetto Android
npx cap add android
npx cap sync

# Apri Android Studio
npx cap open android
```

#### In Android Studio
1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Installa APK su telefono

### 🔍 Debug Mobile

```bash
# 1. Abilita Debug USB sul telefono
# Impostazioni → Info → Tocca 7 volte "Numero build"
# Impostazioni → Opzioni sviluppatore → Debug USB

# 2. Collega telefono via USB

# 3. Chrome DevTools
# Apri Chrome: chrome://inspect/#devices
# Click "inspect" su Lume Finance
```

---

## ⚙️ Configurazione Mobile

### File `.env` (OBBLIGATORIO)
```bash
# frontend/.env
VITE_API_URL=http://10.0.0.233:8000
```

### `capacitor.config.ts`
```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.lume.finance',
  appName: 'Lume Finance',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true  // ⚠️ Necessario per HTTP locale
  }
};

export default config;
```

### Client API Centralizzato
```typescript
// frontend/src/config/api.ts
import { Capacitor } from '@capacitor/core';

const getApiUrl = (): string => {
  if (Capacitor.isNativePlatform()) {
    // Mobile: usa VITE_API_URL da .env
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }
  // Web: usa path relativi (proxy Vite)
  return '';
};

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${getApiUrl()}${endpoint}`);
    return await response.json();
  },
  // ... post, put, delete
};
```

**Utilizzo**:
```typescript
import { api } from '../config/api';

// Invece di:
// const res = await fetch('/api/movimenti');

// Usa:
const movimenti = await api.get('/api/movimenti');
```

---

## 🐛 Problemi Comuni Mobile

### ❌ "Failed to fetch" / "Unexpected token '<'"
**Causa**: App chiama `localhost` invece del PC  
**Fix**: 
1. Verifica `.env` con IP corretto
2. Rebuild: `npm run build && npx cap sync`
3. Rebuilda APK in Android Studio

### ❌ Header coperto dal notch
**Fix**: Layout usa CSS `safe-area-inset-top`
```css
padding-top: env(safe-area-inset-top);
```

### ❌ Bottom nav copre tasti Android
**Fix**: Usa `safe-area-inset-bottom`
```css
padding-bottom: calc(80px + env(safe-area-inset-bottom));
```

### ❌ Console vuota in Chrome DevTools
**Fix**: 
1. Telefono in Debug USB
2. `chrome://inspect/#devices`
3. Click "inspect" su app

---

## 📚 Documentazione

- **[MOBILE_DEBUG_CONTEXT.md](docs/MOBILE_DEBUG_CONTEXT.md)**: Stato attuale debug mobile
- **[DARK_MODE_SETUP.md](docs/DARK_MODE_SETUP.md)**: Setup tema dark/light
- **[API_CENTRALIZED.md](docs/API_CENTRALIZED.md)**: Guida client API

---

## 📝 Stato Progetto (Feb 2026)

### ✅ Completato
- Backend FastAPI completo
- Frontend React + TypeScript
- Tema Dark/Light con contrasti WCAG AAA
- Dashboard con KPI real-time
- CRUD Movimenti, Conti, Budget, Obiettivi
- Scomposizione costi veicoli/elettrodomestici
- Build APK Android con Capacitor
- Client API centralizzato
- Safe area support (parziale)

### 🚧 In Sviluppo
- **Debug mobile**: Errore "Failed to fetch" (priorità alta)
- **Safe area bottom**: Bottom nav copre gesture bar
- **Logging avanzato**: Console Chrome DevTools

### 📋 TODO
- Export PDF/Excel
- Notifiche push
- PWA installabile
- Cloud sync

---

## 🤝 Contributi

Per contribuire:
1. Fork repository
2. Crea branch feature
3. Commit modifiche
4. Push e apri PR

---

## 👤 Autore

**Sviluppato da**: Afellai3  
**Ruolo**: Ingegnere Gestionale e Consulente Informatico  
**Contesto**: Data Analyst con Power BI in azienda trasporto e logistica  
**Località**: Montoro Superiore, Campania, IT  

---

**⭐ Se trovi utile questo progetto, lascia una stella su GitHub!**
