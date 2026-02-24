# 💡 Lume Finance

**Gestione Finanze Personali con Scomposizione Costi Dettagliata**

Lume è un'applicazione web moderna per la gestione delle finanze personali che va oltre il semplice tracciamento delle spese. Fornisce scomposizione granulare dei costi, stime intelligenti e strumenti completi di pianificazione finanziaria.

## ✨ Funzionalità Principali

### 📊 Tracciamento Base
- Inserimento manuale movimenti con supporto multi-conto
- Pianificazione budget e obiettivi di risparmio
- Organizzazione spese per categoria
- Tracciamento entrate e uscite

### 🔬 Motore Avanzato di Scomposizione Costi
- **Costi veicolo**: Stima automatica basata su km percorsi, consumo carburante e usura
- **Costi elettrodomestici**: Scomposizione consumo energetico per dispositivo (basato su kWh)
- **Allocazione centri di costo**: Distribuisce utenze (energia, gas) tra elettrodomestici e stanze
- **Analisi granulare**: Scompone ogni spesa fino al minimo componente

### 📈 Strumenti Investimenti e Simulazioni
- Tracciamento portafoglio investimenti
- Simulatori mutui e prestiti
- Proiezioni e scenari finanziari
- Evoluzione patrimonio netto nel tempo

### 📉 Analytics e Dashboard
- Dashboard KPI interattive
- Grafici e visualizzazioni personalizzabili
- Analisi trend e stagionalità
- Capacità di export per analisi ulteriori

## 🛠️ Stack Tecnologico

- **Backend**: Python + FastAPI
- **Frontend**: React + TypeScript
- **Database**: SQLite (locale) → PostgreSQL (produzione)
- **Grafici**: Chart.js + Recharts
- **Desktop**: Electron wrapper
- **Mobile**: Progressive Web App (PWA)

## 🚀 Quick Start

### Prerequisiti

- Python 3.10+
- Node.js 18+
- Git

### Installazione

```bash
# Clona repository
git clone https://github.com/Afellai3/lume-finance.git
cd lume-finance

# Installa dipendenze Python
pip install -r requirements.txt

# Inizializza database
cd database
sqlite3 lume.db < schema.sql
sqlite3 lume.db < seed_data.sql
cd ..
```

### Avvio Backend

```bash
# Dalla root del progetto
python run.py
```

Il server sarà disponibile su **http://localhost:8000**

Documentazione API interattiva: **http://localhost:8000/docs**

### Avvio Frontend (prossimamente)

```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentazione API

### Endpoint Disponibili

#### Conti
- `GET /api/conti` - Lista conti
- `POST /api/conti` - Crea nuovo conto
- `GET /api/conti/{id}` - Dettaglio conto
- `PUT /api/conti/{id}` - Aggiorna conto
- `DELETE /api/conti/{id}` - Elimina conto
- `GET /api/conti/{id}/saldo` - Saldo corrente

#### Beni (Auto, Elettrodomestici)
- `GET /api/beni` - Lista beni
- `POST /api/beni` - Registra nuovo bene
- `GET /api/beni/{id}` - Dettaglio bene
- `PUT /api/beni/{id}` - Aggiorna bene
- `DELETE /api/beni/{id}` - Elimina bene

#### Movimenti
- `GET /api/movimenti` - Lista movimenti (con filtri)
- `POST /api/movimenti` - Crea movimento con scomposizione automatica
- `GET /api/movimenti/{id}` - Dettaglio movimento
- `GET /api/movimenti/{id}/scomposizione` - Scomposizione costi dettagliata
- `DELETE /api/movimenti/{id}` - Elimina movimento

### Esempio: Creare movimento con scomposizione automatica

```bash
curl -X POST "http://localhost:8000/api/movimenti" \
  -H "Content-Type: application/json" \
  -d '{
    "movimento": {
      "data": "2026-02-24T20:00:00",
      "importo": 50.00,
      "tipo": "uscita",
      "categoria_id": 13,
      "conto_id": 1,
      "descrizione": "Rifornimento benzina"
    },
    "bene_id": 1,
    "km_percorsi": 100,
    "prezzo_carburante": 1.85
  }'
```

Risposta con scomposizione automatica:
```json
{
  "movimento": { ... },
  "scomposizione": [
    {
      "nome_componente": "Carburante",
      "valore_componente": 10.18,
      "percentuale_totale": 54.5
    },
    {
      "nome_componente": "Usura e Manutenzione",
      "valore_componente": 8.00,
      "percentuale_totale": 42.8
    },
    {
      "nome_componente": "Ammortamento",
      "valore_componente": 0.50,
      "percentuale_totale": 2.7
    }
  ]
}
```

## 🧪 Test

```bash
# Esegui test
pytest backend/tests/ -v

# Con coverage
pytest backend/tests/ --cov=backend --cov-report=html
```

## 📁 Struttura Progetto

```
lume-finance/
├── backend/                 # Backend Python FastAPI
│   ├── routes/             # Endpoint API
│   ├── services/           # Business logic (Cost Calculator)
│   ├── tests/              # Test automatici
│   ├── database.py         # Gestione database
│   ├── models.py           # Modelli Pydantic
│   └── main.py             # App FastAPI
│
├── frontend/               # Frontend React (in sviluppo)
│   ├── src/
│   └── package.json
│
├── database/               # Database SQLite
│   ├── schema.sql          # Schema completo
│   ├── seed_data.sql       # Dati di esempio
│   └── README.md           # Documentazione DB
│
├── docs/                   # Documentazione
│   └── PROJECT_STRUCTURE.md
│
├── run.py                  # Script avvio server
├── requirements.txt        # Dipendenze Python
└── README.md              # Questo file
```

## 🎯 Roadmap

- [x] Schema database completo
- [x] Motore scomposizione costi (veicoli + elettrodomestici)
- [x] API REST completa
- [x] Test automatici
- [ ] Frontend React con dashboard
- [ ] Sistema budget e analytics
- [ ] Simulatori investimenti e mutui
- [ ] Grafici e KPI interattivi
- [ ] Progressive Web App
- [ ] Packaging Electron per desktop
- [ ] Import automatico movimenti da CSV
- [ ] Autenticazione multi-utente

## 💼 Monetizzazione

- **Piano Free**: Tracciamento base, 1 conto, grafici semplici
- **Piano Pro** (€4.99/mese o €49/anno): Scomposizione avanzata, simulatori, multi-conto, export
- **Piano Family** (€7.99/mese): Accesso condiviso per membri famiglia

## 📄 Licenza

Questo progetto è attualmente in sviluppo privato.

## 👤 Autore

Sviluppato da [Afellai3](https://github.com/Afellai3)

---

*Lume - Illumina il tuo percorso finanziario* ✨
