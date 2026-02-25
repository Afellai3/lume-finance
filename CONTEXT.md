# 🎯 CONTEXT - Lume Finance Project

> File di contesto per AI assistants - Aggiornato: 25 Febbraio 2026

---

## 📋 Informazioni Progetto

**Nome**: Lume Finance  
**Tipo**: Applicazione web gestione finanze personali  
**Repository**: https://github.com/Afellai3/lume-finance  
**Status**: ✅ In produzione (sviluppo attivo)

### Tech Stack
```
Backend:  FastAPI 0.104 + Python 3.13 + SQLite 3
Frontend: React 18.3 + TypeScript 5.5 + Vite
Styling:  CSS Modules custom
Charts:   Chart.js
```

### Struttura Progetto
```
lume-finance/
├── backend/           # FastAPI REST API
│   ├── routes/       # 6 moduli API (analytics, movimenti, conti, budget, obiettivi, beni)
│   ├── database.py   # SQLite + auto-migrations
│   └── main.py
├── frontend/         # React + TypeScript SPA
│   └── src/
│       ├── pages/    # 6 pagine principali
│       └── components/
├── database/
│   ├── schema.sql
│   ├── seed_data.sql
│   └── migrations/   # 4 migrations applicate
└── data/
    └── lume.db      # Database SQLite (auto-generato)
```

---

## 🎨 Funzionalità Implementate

### ✅ Completate al 100%

1. **Dashboard Analytics**
   - KPI in tempo reale (saldo, entrate/uscite)
   - Grafico spese per categoria (Chart.js)
   - Widget budget e obiettivi
   - Movimenti recenti con quick actions

2. **Movimenti Finanziari**
   - CRUD completo
   - Collegamento Conto + Categoria
   - **Budget esplicito** (nuova feature 25/02/2026)
   - Movimenti ricorrenti
   - **Scomposizione costi nascosti** per veicoli/elettrodomestici

3. **Conti Bancari**
   - CRUD multi-conto
   - Calcolo saldo automatico
   - Attivazione/disattivazione
   - Multi-valuta (EUR default)

4. **Budget per Categoria**
   - Periodi: settimanale/mensile/annuale
   - **Calcolo prioritario**: budget_id esplicito > categoria automatica
   - Progress bar con stati (ok/attenzione/superato)
   - Riepilogo globale

5. **Obiettivi di Risparmio**
   - CRUD completo
   - **Aggiungi/Rimuovi fondi** interattivo
   - Progress bar globale + individuale
   - Badge priorità colorati (1-5)
   - Data target con countdown
   - Auto-completamento al 100%

6. **Gestione Beni**
   - Veicoli: carburante, manutenzione, ammortamento
   - Elettrodomestici: consumo energia, costo orario
   - Form dinamico per tipo

---

## 🔥 Feature Unica: Scomposizione Costi Nascosti

### Veicoli
Quando crei un movimento collegato a un veicolo con km percorsi:
```
💵 Totale: 85.50€
├─ Carburante: 45.20€ (300km × 6.5L/100km × 1.85€/L)
├─ Manutenzione: 18.00€ (300km × 0.06€/km)
└─ Ammortamento: 22.30€ (deprezzamento veicolo)
```

### Elettrodomestici
Quando crei un movimento con ore utilizzo:
```
💵 Totale: 3.15€
├─ Energia: 2.80€ (7h × 1.6kW × 0.25€/kWh)
└─ Ammortamento: 0.35€ (deprezzamento elettrodomestico)
```

**Calcolo salvato** in `movimenti.scomposizione_json` per storico.

---

## 🎯 Logica Budget Prioritaria (IMPORTANTE)

### Novità 25 Febbraio 2026

Aggiunto campo `budget_id` in tabella `movimenti`. Calcolo spesa budget:

```sql
-- PRIORITÀ 1: Movimenti con budget_id esplicito
SELECT SUM(importo) FROM movimenti 
WHERE budget_id = ? AND tipo = 'uscita'

-- PRIORITÀ 2: Movimenti con categoria (senza budget_id)
SELECT SUM(importo) FROM movimenti 
WHERE categoria_id = ? AND budget_id IS NULL AND tipo = 'uscita'

-- Spesa totale = PRIORITÀ 1 + PRIORITÀ 2
```

### Caso d'Uso
- Budget "Cibo" = 400€ (categoria_id: 3)
- Movimento A: 50€, categoria "Trasporti", **budget_id = 3** → Scala "Cibo" ✅
- Movimento B: 30€, categoria "Cibo", **budget_id = NULL** → Scala "Cibo" ✅
- Risultato: Budget "Cibo" ha speso 80€ (50+30)

**Motivo**: Permette di collegare spese di qualsiasi categoria a un budget specifico (es. "Emergenze", "Vacanze").

---

## 🗄️ Database Schema Chiave

### Tabelle Principali

```sql
movimenti (
  id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  importo REAL NOT NULL,
  tipo TEXT CHECK(tipo IN ('entrata', 'uscita')),
  categoria_id INTEGER,
  conto_id INTEGER,
  budget_id INTEGER,              -- ⭐ NUOVO: collegamento esplicito
  descrizione TEXT NOT NULL,
  ricorrente BOOLEAN DEFAULT 0,
  
  -- Scomposizione costi
  bene_id INTEGER,
  km_percorsi REAL,
  ore_utilizzo REAL,
  scomposizione_json TEXT,
  
  FOREIGN KEY (categoria_id) REFERENCES categorie(id),
  FOREIGN KEY (conto_id) REFERENCES conti(id),
  FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE SET NULL,
  FOREIGN KEY (bene_id) REFERENCES beni(id)
)

budget (
  id INTEGER PRIMARY KEY,
  categoria_id INTEGER NOT NULL,
  importo REAL NOT NULL,
  periodo TEXT CHECK(periodo IN ('settimanale', 'mensile', 'annuale')),
  data_inizio TEXT DEFAULT CURRENT_DATE,
  attivo BOOLEAN DEFAULT 1,
  FOREIGN KEY (categoria_id) REFERENCES categorie(id)
)

obiettivi (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  importo_target REAL NOT NULL,
  importo_attuale REAL DEFAULT 0,
  data_target TEXT,
  priorita INTEGER CHECK(priorita BETWEEN 1 AND 5) DEFAULT 3,
  completato BOOLEAN DEFAULT 0,
  data_creazione TEXT DEFAULT CURRENT_TIMESTAMP
)

beni (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT CHECK(tipo IN ('veicolo', 'elettrodomestico')),
  data_acquisto TEXT NOT NULL,
  prezzo_acquisto REAL NOT NULL,
  durata_anni_stimata INTEGER,
  
  -- Veicolo
  veicolo_tipo_carburante TEXT,
  veicolo_consumo_medio REAL,
  veicolo_costo_manutenzione_per_km REAL,
  
  -- Elettrodomestico
  elettrodomestico_potenza INTEGER,
  elettrodomestico_ore_medie_giorno REAL
)
```

### Migrations Applicate

1. `001_add_icona_colore_categorie.sql` - Aggiunti campi UI categorie
2. `002_add_obiettivi_table.sql` - Creata tabella obiettivi
3. `003_add_scomposizione_columns.sql` - Aggiunti campi scomposizione in movimenti
4. `004_add_budget_id_to_movimenti.sql` - Aggiunto budget_id con FK

**Gestione automatica**: Le migrations vengono eseguite all'avvio se non già applicate.

---

## 📡 API Endpoints Chiave

### Movimenti
```http
POST /api/movimenti
Body:
{
  "data": "2026-02-25",
  "importo": 50.00,
  "tipo": "uscita",
  "categoria_id": 5,
  "budget_id": 3,        // ⭐ Opzionale: override budget categoria
  "conto_id": 1,
  "descrizione": "Spesa",
  "bene_id": 2,          // Per scomposizione
  "km_percorsi": 150
}

Response:
{
  "id": 42,
  "scomposizione": {     // Se bene_id presente
    "costo_totale": 85.50,
    "componenti": [
      {"voce": "Carburante", "importo": 45.20},
      {"voce": "Manutenzione", "importo": 18.00},
      {"voce": "Ammortamento", "importo": 22.30}
    ]
  }
}
```

### Budget
```http
GET /api/budget
Response:
{
  "budget": [
    {
      "id": 1,
      "categoria_id": 3,
      "categoria_nome": "Cibo e Ristorazione",
      "importo": 400.00,
      "spesa_corrente": 285.50,  // Priorità 1 + Priorità 2
      "rimanente": 114.50,
      "percentuale_utilizzo": 71.38,
      "stato": "ok"  // ok | attenzione | superato
    }
  ],
  "periodo": {"mese": 2, "anno": 2026}
}
```

### Obiettivi
```http
POST /api/obiettivi/{id}/aggiungi-fondi
Body: {"importo": 100.00}

POST /api/obiettivi/{id}/rimuovi-fondi
Body: {"importo": 50.00}
```

---

## 🐛 Bug Risolti (25 Feb 2026)

### Critici
1. ✅ `conn.commit()` mancante in `conti.py`, `beni.py`, `budget.py`
2. ✅ Nome colonna errato `creato_il` → `data_creazione` in Obiettivi
3. ✅ Import errato `dashboard` → `analytics` in `main.py`
4. ✅ File seed `seed.sql` → `seed_data.sql`

### Windows-Specific
5. ✅ UnicodeDecodeError: Aggiunto `encoding='utf-8'` in `database.py`
6. ✅ Schema re-creazione: Skip se DB già esistente
7. ✅ Indici duplicati: Gestione errori `already exists`

### UI/UX
8. ✅ CSS mancante per `BudgetForm.tsx`
9. ✅ Struttura dati API Budget non conforme a frontend

---

## 🚀 Setup Rapido

### Windows
```bash
git clone https://github.com/Afellai3/lume-finance.git
cd lume-finance
start.bat  # Avvia backend + frontend automaticamente
```

### Linux/Mac
```bash
# Terminal 1 - Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

**Porte**:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Docs API: `http://localhost:8000/docs`

---

## 📝 Note Importanti per AI

### Convenzioni Codice

1. **Backend (Python)**:
   - Snake_case per variabili/funzioni
   - Type hints sempre presenti
   - Docstrings per funzioni pubbliche
   - `async/await` per route handlers

2. **Frontend (TypeScript)**:
   - CamelCase per componenti
   - Interfaces per props
   - Functional components con hooks
   - CSS Modules per styling

3. **Database**:
   - Migrations incrementali in `database/migrations/`
   - Naming: `{numero}_{descrizione}.sql`
   - Encoding UTF-8 obbligatorio
   - Foreign keys con ON DELETE specifici

### Pattern Comuni

**Form Submit**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitting(true)
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (!response.ok) throw new Error('Errore')
    onSuccess()
  } catch (error) {
    alert(error.message)
  } finally {
    setSubmitting(false)
  }
}
```

**API Route**:
```python
@router.post("", status_code=201)
async def create_resource(data: ResourceCreate):
    with get_db_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO table (field) VALUES (?)",
            (data.field,)
        )
        conn.commit()  # ⚠️ NON DIMENTICARE
        return await get_resource(cursor.lastrowid)
```

---

## 🎯 Obiettivi Futuri

### Priorità Alta
- [ ] Export PDF report mensili
- [ ] Notifiche push budget superati
- [ ] Grafici trend 6/12 mesi

### Priorità Media
- [ ] Gestione automatica movimenti ricorrenti
- [ ] Tag personalizzati oltre categorie
- [ ] Dark mode UI

### Priorità Bassa
- [ ] Multi-utente con auth
- [ ] Cloud sync
- [ ] Mobile app
- [ ] API bancarie PSD2
- [ ] ML previsioni spesa

---

## 👤 Info Sviluppatore

**Username**: Afellai3  
**Ruolo**: Data Analyst con Power BI  
**Settore**: Azienda trasporto e logistica  
**Località**: Provincia di Salerno, Campania, IT  
**Tools preferiti**: Python, Power BI, SQL

---

## 📚 Risorse Utili

- **Repository**: https://github.com/Afellai3/lume-finance
- **Docs FastAPI**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Chart.js**: https://www.chartjs.org/
- **SQLite Docs**: https://www.sqlite.org/docs.html

---

**🔄 Ultimo aggiornamento**: 25 Febbraio 2026, 10:45 CET  
**📊 Stato progetto**: Produzione - Sviluppo attivo  
**✅ Test status**: Tutti i moduli funzionanti

---

## 🤖 Prompt Suggeriti per AI

Quando inizi un nuovo thread, usa questi prompt:

### Setup Contesto
```
Ho il progetto Lume Finance su GitHub (Afellai3/lume-finance).
È un'app FastAPI + React per gestione finanze personali.
Leggi CONTEXT.md per i dettagli completi.
```

### Sviluppo Feature
```
Vorrei aggiungere [feature] a Lume Finance.
Il progetto usa FastAPI backend + React frontend.
Controlla CONTEXT.md per architettura e convenzioni.
```

### Debug
```
Ho un errore in Lume Finance: [errore].
Progetto FastAPI + React + SQLite.
Vedi CONTEXT.md per struttura database e API.
```

---

**Fine documento di contesto** 🎯
