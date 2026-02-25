# 💰 Lume Finance

> Sistema di gestione finanze personali con analisi avanzata dei costi nascosti

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)

## 🎯 Caratteristiche Principali

### 📊 Dashboard
- **KPI in tempo reale**: Saldo totale, entrate/uscite mensili
- **Grafici interattivi**: Spese per categoria con Chart.js
- **Widget intelligenti**: Budget e obiettivi di risparmio
- **Movimenti recenti**: Ultimi 5 movimenti con quick actions

### 💸 Gestione Movimenti
- ✅ CRUD completo (Create, Read, Update, Delete)
- 🏦 Collegamento conti bancari
- 🏷️ Categorizzazione automatica
- 🎯 **Budget esplicito prioritario** (nuova feature!)
- 🔄 Supporto movimenti ricorrenti
- 📝 Descrizioni e note

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

### 💎 Obiettivi di Risparmio
- 🎯 Definizione target con data scadenza
- ➕ **Aggiungi/Rimuovi fondi** interattivo con prompt
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
│   │   ├── obiettivi.py    # Obiettivi risparmio
│   │   └── beni.py         # Veicoli ed elettrodomestici
│   ├── database.py         # SQLite connection + migrations
│   └── main.py             # FastAPI app
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/     # Form e UI components
│   │   ├── pages/          # Dashboard, Movimenti, Budget, ecc.
│   │   └── App.tsx         # Router principale
│   └── package.json
├── database/
│   ├── schema.sql          # Schema database
│   ├── seed_data.sql       # Dati demo
│   └── migrations/         # Migrations SQL incrementali
│       ├── 001_add_icona_colore_categorie.sql
│       ├── 002_add_obiettivi_table.sql
│       ├── 003_add_scomposizione_columns.sql
│       └── 004_add_budget_id_to_movimenti.sql
└── data/
    └── lume.db            # Database SQLite (generato)
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
  budget_id,  -- ⭐ Collegamento esplicito budget
  descrizione, ricorrente,
  bene_id, km_percorsi, ore_utilizzo,  -- Scomposizione costi
  scomposizione_json
)

-- Budget per categoria
budget (id, categoria_id, importo, periodo, data_inizio, attivo)

-- Obiettivi risparmio
obiettivi (
  id, nome, importo_target, importo_attuale, 
  data_target, priorita, completato
)

-- Beni (veicoli/elettrodomestici)
beni (
  id, nome, tipo, data_acquisto, prezzo_acquisto,
  veicolo_tipo_carburante, veicolo_consumo_medio,
  elettrodomestico_potenza, elettrodomestico_ore_medie_giorno
)
```

### Migrations
Le migrations vengono eseguite automaticamente all'avvio:

```bash
Database already exists, skipping schema
Executing migration: 003_add_scomposizione_columns.sql
  → 003_add_scomposizione_columns.sql already applied
Executing migration: 004_add_budget_id_to_movimenti.sql
  ✓ 004_add_budget_id_to_movimenti.sql completed
✓ Database initialized successfully
```

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

**Payload Movimento con Budget Esplicito:**
```json
{
  "data": "2026-02-25",
  "importo": 50.00,
  "tipo": "uscita",
  "categoria_id": 5,
  "budget_id": 3,        // ⭐ Budget esplicito (priorità)
  "conto_id": 1,
  "descrizione": "Spesa speciale",
  "bene_id": 2,          // Opzionale: per scomposizione
  "km_percorsi": 150     // Se bene_id è veicolo
}
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
GET    /api/obiettivi                  # Lista obiettivi
POST   /api/obiettivi                  # Crea obiettivo
GET    /api/obiettivi/{id}             # Dettaglio obiettivo
PUT    /api/obiettivi/{id}             # Aggiorna obiettivo
DELETE /api/obiettivi/{id}             # Elimina obiettivo
POST   /api/obiettivi/{id}/aggiungi-fondi  # Aggiungi importo
POST   /api/obiettivi/{id}/rimuovi-fondi   # Rimuovi importo
```

### Conti
```http
GET    /api/conti                      # Lista conti
POST   /api/conti                      # Crea conto
GET    /api/conti/{id}                 # Dettaglio conto
PUT    /api/conti/{id}                 # Aggiorna conto
DELETE /api/conti/{id}                 # Elimina conto
```

### Beni
```http
GET    /api/beni                       # Lista beni
POST   /api/beni                       # Crea bene
GET    /api/beni/{id}                  # Dettaglio bene
PUT    /api/beni/{id}                  # Aggiorna bene
DELETE /api/beni/{id}                  # Elimina bene
```

---

## 🎨 Frontend Components

### Pages
- **Dashboard**: `/` - Overview con KPI e grafici
- **Movimenti**: `/movimenti` - Lista e gestione transazioni
- **Conti**: `/conti` - Gestione conti bancari
- **Beni**: `/beni` - Gestione veicoli ed elettrodomestici
- **Budget**: `/budget` - Monitoraggio budget per categoria
- **Obiettivi**: `/obiettivi` - Obiettivi di risparmio

### Key Components
```typescript
// Form Components
MovimentoForm.tsx         // Form con budget_id + scomposizione
ContoForm.tsx
BeneForm.tsx              // Form dinamico veicolo/elettrodomestico
BudgetForm.tsx
ObiettivoForm.tsx

// UI Components
ConfirmDialog.tsx         // Dialog conferma eliminazione
PromptDialog.tsx          // Dialog input importo (obiettivi)
```

---

## 🔥 Funzionalità Avanzate

### 1. Budget con Logica Prioritaria

Il calcolo della spesa di un budget segue questa logica:

```python
# PRIORITÀ 1: Movimenti con budget_id esplicito
SELECT SUM(importo) FROM movimenti 
WHERE budget_id = ? AND tipo = 'uscita'

# PRIORITÀ 2: Movimenti con categoria (senza budget_id)
SELECT SUM(importo) FROM movimenti 
WHERE categoria_id = ? AND budget_id IS NULL AND tipo = 'uscita'

# Totale = Priorità 1 + Priorità 2
```

**Caso d'uso**: Hai un budget "Emergenze" da 500€. Puoi:
- Collegare spese di **qualsiasi categoria** a questo budget
- Le spese con `budget_id` esplicito scalano da quel budget
- Le spese senza `budget_id` scalano dal budget della categoria

### 2. Scomposizione Automatica Costi

**Veicolo** (esempio: Fiat 500):
```json
{
  "tipo": "veicolo",
  "veicolo_consumo_medio": 6.5,  // L/100km
  "veicolo_costo_manutenzione_per_km": 0.06,
  "prezzo_acquisto": 15000,
  "durata_anni_stimata": 10
}
```

Creando un movimento con `km_percorsi: 200`:
```
💵 Totale: 36.80€
├─ Carburante: 24.05€ (200km × 6.5L/100km × 1.85€/L)
├─ Manutenzione: 12.00€ (200km × 0.06€/km)
└─ Ammortamento: 0.75€ (200km × 0.00375€/km)
```

**Elettrodomestico** (esempio: Lavatrice):
```json
{
  "tipo": "elettrodomestico",
  "elettrodomestico_potenza": 1600,  // Watt
  "prezzo_acquisto": 450,
  "durata_anni_stimata": 8
}
```

Creando un movimento con `ore_utilizzo: 10`:
```
💵 Totale: 4.56€
├─ Energia: 4.00€ (10h × 1.6kW × 0.25€/kWh)
└─ Ammortamento: 0.56€ (10h × 0.056€/h)
```

---

## 🐛 Bug Risolti (Feb 2026)

- ✅ `conn.commit()` mancante in Conti/Beni/Budget
- ✅ Nome colonna `creato_il` → `data_creazione` in Obiettivi
- ✅ CSS mancante per BudgetForm
- ✅ Struttura dati API Budget errata
- ✅ Import errato `dashboard` → `analytics`
- ✅ Nome file `seed.sql` → `seed_data.sql`
- ✅ Encoding UTF-8 per Windows (fix UnicodeDecodeError)
- ✅ Schema già esistente: skip se DB presente

---

## 📝 TODO & Roadmap

### In Sviluppo
- [ ] Export PDF/Excel dei report
- [ ] Notifiche budget superati
- [ ] Grafici trend mensili
- [ ] Gestione automatica movimenti ricorrenti

### Future Features
- [ ] Multi-utente con autenticazione
- [ ] Cloud sync e backup automatico
- [ ] Mobile app (React Native)
- [ ] Integrazione API bancarie (PSD2)
- [ ] Machine Learning per previsioni spesa
- [ ] Tag personalizzati oltre le categorie

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
**Località**: Provincia di Salerno, Campania, IT  

---

## 🙏 Ringraziamenti

- FastAPI per l'eccellente framework backend
- React team per l'ecosistema frontend
- Chart.js per i grafici interattivi
- SQLite per il database leggero e potente

---

**⭐ Se trovi utile questo progetto, lascia una stella su GitHub!**
