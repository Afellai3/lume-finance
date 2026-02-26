# 📋 Lume Finance - Context per AI Assistant

> Questo file fornisce contesto completo per assistenti AI (Claude, GPT, ecc.) che lavorano sul progetto.

---

## 📌 Informazioni Progetto

**Nome**: Lume Finance  
**Repository**: https://github.com/Afellai3/lume-finance  
**Tipo**: Applicazione web full-stack per gestione finanze personali  
**Stato**: ✅ Produzione (sviluppo attivo)  
**Data Ultima Modifica**: 26 Febbraio 2026  

---

## 🎯 Obiettivo Principale

Creare un sistema di gestione finanze personali che **va oltre le app tradizionali** analizzando i **costi nascosti** di veicoli ed elettrodomestici (carburante, manutenzione, ammortamento, energia).

**Differenziatore chiave**: La funzionalità di **scomposizione automatica dei costi** non è presente in Money Manager, Wallet, o altri competitor.

---

## 🏗️ Stack Tecnologico

### Backend
- **Framework**: FastAPI 0.104+ (Python 3.11+)
- **Database**: SQLite 3 (file-based, senza server)
- **ORM**: None (SQL puro per semplicità)
- **CORS**: Abilitato per localhost:3000
- **Porta**: 8000

### Frontend
- **Framework**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite
- **Routing**: Stato interno (no react-router)
- **Charts**: Chart.js
- **Icons**: Lucide React
- **Styling**: CSS puro + Inline styles (no Tailwind/CSS-in-JS)
- **Theme**: Dark/Light mode con localStorage
- **Porta**: 3000 (dev)

### Database
- **Tipo**: SQLite
- **Path**: `data/lume.db`
- **Inizializzazione**: Automatica al primo avvio backend
- **Migrations**: Incrementali in `database/migrations/`
- **Seed Data**: `database/seed_data.sql` (dati demo)

---

## 📁 Struttura Progetto

```
lume-finance/
├── backend/
│   ├── routes/              # Endpoints API
│   │   ├── analytics.py    # Dashboard KPI e grafici
│   │   ├── movimenti.py    # CRUD + scomposizione costi
│   │   ├── conti.py        # Gestione conti bancari
│   │   ├── budget.py       # Budget con logica prioritaria
│   │   ├── obiettivi.py    # Obiettivi risparmio
│   │   └── beni.py         # Veicoli/elettrodomestici
│   ├── database.py         # SQLite init + migrations
│   └── main.py             # FastAPI app + CORS
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Header, BottomNav, Layout
│   │   │   ├── ui/         # ThemeToggle, ConfirmDialog
│   │   │   └── forms/      # Form components
│   │   ├── pages/          # Dashboard, Movimenti, Conti, ecc.
│   │   ├── hooks/          # useTheme, useApi
│   │   ├── theme/          # Design system (dark/light)
│   │   └── App.tsx         # Root component
│   └── public/
│       └── logo.jpg        # Logo aziendale (40px height)
│
├── database/
│   ├── schema.sql          # Schema completo
│   ├── seed_data.sql       # Dati di esempio
│   └── migrations/         # SQL migrations incrementali
│       ├── 001_add_icona_colore_categorie.sql
│       ├── 002_add_obiettivi_table.sql
│       ├── 003_add_scomposizione_columns.sql
│       └── 004_add_budget_id_to_movimenti.sql
│
├── data/
│   └── lume.db            # Database SQLite (generato)
│
├── README.md              # Documentazione utente
├── context.md             # Questo file (context per AI)
├── requirements.txt       # Python dependencies
└── start.bat              # Avvio rapido Windows
```

---

## 🗄️ Schema Database

### Tabelle Principali

#### `conti`
Conti bancari/carte/contante dell'utente.

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

#### `categorie`
Categorie per entrate/uscite (Stipendio, Alimentari, Trasporti, ecc.).

```sql
CREATE TABLE categorie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    icona TEXT,         -- Emoji o nome icona Lucide
    colore TEXT         -- Hex color per UI
);
```

#### `movimenti`
Transazioni finanziarie - **tabella centrale del sistema**.

```sql
CREATE TABLE movimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE NOT NULL,
    importo REAL NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    categoria_id INTEGER,
    conto_id INTEGER NOT NULL,
    
    -- ⭐ NUOVE COLONNE CHIAVE
    budget_id INTEGER,      -- Collegamento esplicito a budget (priorità)
    obiettivo_id INTEGER,   -- Allocazione a obiettivo risparmio
    
    descrizione TEXT,
    ricorrente BOOLEAN DEFAULT 0,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Scomposizione costi nascosti
    bene_id INTEGER,        -- FK a beni (veicolo/elettrodomestico)
    km_percorsi REAL,       -- Per veicoli
    ore_utilizzo REAL,      -- Per elettrodomestici
    scomposizione_json TEXT, -- JSON con dettaglio costi
    
    FOREIGN KEY (categoria_id) REFERENCES categorie(id),
    FOREIGN KEY (conto_id) REFERENCES conti(id),
    FOREIGN KEY (bene_id) REFERENCES beni(id),
    FOREIGN KEY (budget_id) REFERENCES budget(id),
    FOREIGN KEY (obiettivo_id) REFERENCES obiettivi_risparmio(id)
);
```

**⚠️ NOTA IMPORTANTE**: I campi `budget_id` e `obiettivo_id` sono opzionali ma **cambiano il comportamento**:
- `budget_id`: Se presente, la spesa scala da quel budget (priorità 1) invece che dal budget della categoria (priorità 2)
- `obiettivo_id`: Se presente, il movimento in **entrata** contribuisce al saldo dell'obiettivo

#### `budget`
Budget per categoria con periodi (settimanale/mensile/annuale).

```sql
CREATE TABLE budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    importo REAL NOT NULL,
    periodo TEXT NOT NULL CHECK(periodo IN ('settimanale', 'mensile', 'annuale')),
    data_inizio DATE NOT NULL,
    attivo BOOLEAN DEFAULT 1,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorie(id)
);
```

**Calcolo Spesa** (logica prioritaria):
```python
# Priorità 1: Movimenti con budget_id esplicito
speso_esplicito = SUM(importo) WHERE budget_id = X AND tipo = 'uscita'

# Priorità 2: Movimenti con categoria (fallback)
speso_categoria = SUM(importo) WHERE categoria_id = Y AND budget_id IS NULL AND tipo = 'uscita'

totale_speso = speso_esplicito + speso_categoria
```

#### `obiettivi_risparmio`
Obiettivi di risparmio con target e deadline.

```sql
CREATE TABLE obiettivi_risparmio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    importo_target REAL NOT NULL,
    importo_attuale REAL DEFAULT 0,  -- ⚠️ DEPRECATO - Calcolato da movimenti
    data_target DATE,
    priorita INTEGER DEFAULT 3 CHECK(priorita BETWEEN 1 AND 5),
    completato BOOLEAN DEFAULT 0,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**⚠️ CAMPO DEPRECATO**: `importo_attuale` non viene più aggiornato. Usa questo calcolo:

```python
importo_attuale = SUM(importo) FROM movimenti 
WHERE obiettivo_id = X AND tipo = 'entrata'
```

**Motivo**: Single source of truth - evita inconsistenze tra tabelle.

#### `beni`
Veicoli ed elettrodomestici per calcolo costi nascosti.

```sql
CREATE TABLE beni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('veicolo', 'elettrodomestico')),
    data_acquisto DATE NOT NULL,
    prezzo_acquisto REAL NOT NULL,
    durata_anni_stimata INTEGER NOT NULL DEFAULT 10,
    
    -- Campi specifici veicoli
    veicolo_tipo_carburante TEXT CHECK(veicolo_tipo_carburante IN ('Benzina', 'Diesel', 'Elettrico', 'Ibrido', 'GPL')),
    veicolo_consumo_medio REAL,  -- L/100km o kWh/100km
    veicolo_costo_manutenzione_per_km REAL DEFAULT 0,
    
    -- Campi specifici elettrodomestici
    elettrodomestico_potenza INTEGER,  -- Watt
    elettrodomestico_ore_medie_giorno REAL DEFAULT 0,
    
    attivo BOOLEAN DEFAULT 1,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔥 Funzionalità Uniche

### 1. Scomposizione Costi Nascosti

**Problema**: Quando usi l'auto, paghi solo la benzina? NO! C'è anche manutenzione e ammortamento.

**Soluzione**: Calcolo automatico di tutti i costi.

#### Esempio: Veicolo (Fiat 500)

**Dati Bene**:
```json
{
  "tipo": "veicolo",
  "veicolo_consumo_medio": 6.5,  // L/100km
  "veicolo_costo_manutenzione_per_km": 0.06,
  "prezzo_acquisto": 15000,
  "durata_anni_stimata": 10
}
```

**Calcolo Movimento** (es. 200 km percorsi):

```python
# 1. Carburante
costo_litro = 1.85  # €/L (parametro sistema)
litri_consumati = 200 * 6.5 / 100  # 13 L
costo_carburante = 13 * 1.85  # 24.05€

# 2. Manutenzione
costo_manutenzione = 200 * 0.06  # 12.00€

# 3. Ammortamento
km_totali_stimati = 10_anni * 15000_km/anno  # 150000 km
ammortamento_per_km = 15000 / 150000  # 0.10€/km
costo_ammortamento = 200 * 0.10  # 20.00€

# TOTALE
importo_totale = 24.05 + 12.00 + 20.00  # 56.05€
```

**Salvataggio**:
```json
{
  "importo": 56.05,
  "bene_id": 1,
  "km_percorsi": 200,
  "scomposizione_json": {
    "carburante": 24.05,
    "manutenzione": 12.00,
    "ammortamento": 20.00
  }
}
```

#### Esempio: Elettrodomestico (Lavatrice)

**Dati Bene**:
```json
{
  "tipo": "elettrodomestico",
  "elettrodomestico_potenza": 1600,  // Watt
  "prezzo_acquisto": 450,
  "durata_anni_stimata": 8
}
```

**Calcolo Movimento** (es. 10 ore utilizzo):

```python
# 1. Energia elettrica
tariffa_kwh = 0.25  # €/kWh
potenza_kw = 1.6
costo_energia = 10 * 1.6 * 0.25  # 4.00€

# 2. Ammortamento
ore_vita_stimata = 8_anni * 365_giorni * 2_ore/giorno  # 5840 ore
ammortamento_per_ora = 450 / 5840  # 0.077€/h
costo_ammortamento = 10 * 0.077  # 0.77€

# TOTALE
importo_totale = 4.00 + 0.77  # 4.77€
```

### 2. Budget con Logica Prioritaria

**Problema**: Vuoi un budget "Emergenze" che accetta spese di categorie diverse.

**Soluzione**: Campo `budget_id` nei movimenti.

**Esempio**:

```python
# Scenario:
# - Budget "Emergenze" (id: 5) = 500€
# - Budget "Alimentari" (id: 2, categoria: 3) = 300€

# Movimento 1: Spesa alimentari normale
{
  "categoria_id": 3,
  "budget_id": null,  # Scala da budget categoria (300€)
  "importo": 50
}

# Movimento 2: Spesa alimentari emergenza
{
  "categoria_id": 3,
  "budget_id": 5,  # Scala da budget emergenze (500€)
  "importo": 80
}

# Risultato:
# Budget Alimentari: 50€ / 300€ (16.7%)
# Budget Emergenze: 80€ / 500€ (16%)
```

### 3. Obiettivi con Allocazione da Movimenti

**Problema**: Gli endpoint `/aggiungi` e `/rimuovi` creano inconsistenze nei dati.

**Soluzione**: Usa movimenti in **entrata** con `obiettivo_id`.

**Esempio**:

```python
# Obiettivo "Vacanza Estate 2026" (id: 3)
# Target: 2000€

# Allocazione 1: Stipendio Gennaio
POST /api/movimenti
{
  "tipo": "entrata",
  "importo": 200,
  "obiettivo_id": 3,
  "descrizione": "Allocazione vacanza - Gennaio"
}

# Allocazione 2: Bonus lavoro
POST /api/movimenti
{
  "tipo": "entrata",
  "importo": 150,
  "obiettivo_id": 3,
  "descrizione": "Bonus Q1 per vacanza"
}

# GET /api/obiettivi/3 ritorna:
{
  "id": 3,
  "nome": "Vacanza Estate 2026",
  "importo_target": 2000,
  "importo_attuale": 350,  # Calcolato: 200 + 150
  "percentuale": 17.5
}
```

---

## 🎨 Frontend: UI/UX

### Design System

**Tema**: Dark/Light mode con localStorage persistence

**Colori**:
```typescript
// Light Mode
background: '#f8f9fa',
surface: '#ffffff',
text: { primary: '#1a1a1a', secondary: '#6c757d' }

// Dark Mode
background: '#0f172a',
surface: '#1e293b',
text: { primary: '#f1f5f9', secondary: '#94a3b8' }

// Shared
primary: {
  DEFAULT: '#3b82f6',
  hover: '#2563eb',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}
```

**Spacing**:
```typescript
xs: '0.25rem',  // 4px
sm: '0.5rem',   // 8px
md: '1rem',     // 16px
lg: '1.5rem',   // 24px
xl: '2rem'      // 32px
```

**Typography**:
```typescript
fontSize: {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem'  // 24px
}
```

### Layout

**Header**:
- Logo cliccabile (40px height) → torna alla Dashboard
- ThemeToggle (Sun/Moon icon)
- UserInfo (avatar + username)

**BottomNav** (mobile-first):
- 5 tab: Dashboard, Movimenti, Conti, Budget, Obiettivi
- Icone Lucide React
- Active state con primary color
- Sticky bottom con backdrop blur

**Content**:
- Max width: 1280px
- Padding: 1.5rem
- Cards con shadow e border radius

---

## 🔧 Convenzioni Sviluppo

### Backend (Python)

**Stile**:
- Snake_case per variabili/funzioni
- Type hints (quando possibile)
- Docstrings per funzioni complesse

**Gestione Errori**:
```python
try:
    # operazione database
except sqlite3.IntegrityError as e:
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

**Commit Transactions**:
```python
conn = get_db()
cursor = conn.cursor()
try:
    cursor.execute(...)
    conn.commit()  # ⚠️ NON DIMENTICARE!
    return {...}
except Exception as e:
    conn.rollback()
    raise
```

### Frontend (TypeScript)

**Stile**:
- CamelCase per variabili/funzioni
- PascalCase per componenti
- Interfaces per props

**Componenti**:
```typescript
interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  // ...
};
```

**Hooks**:
```typescript
const [state, setState] = useState<Type>(initialValue);

useEffect(() => {
  // effect
  return () => { /* cleanup */ };
}, [dependencies]);
```

### Commit Messages

**Formato**: `<type>: <subject>`

**Types**:
- `feat`: Nuova funzionalità
- `fix`: Bug fix
- `docs`: Documentazione
- `refactor`: Refactoring codice
- `style`: Formattazione (CSS/UI)
- `test`: Test
- `chore`: Build/config

**Esempi**:
```
feat: Add dark/light theme toggle
fix: Budget calculation includes explicit budget_id
docs: Update README with theme system
refactor: Extract budget logic to separate function
style: Improve mobile responsive layout
```

---

## ⚠️ Problemi Noti & Workaround

### 1. Windows Encoding Error

**Problema**: `UnicodeDecodeError` all'avvio backend su Windows.

**Causa**: Windows usa `cp1252` invece di UTF-8 per leggere file SQL.

**Fix**:
```python
# In database.py
with open(sql_file, 'r', encoding='utf-8') as f:  # ⭐ Aggiungi encoding!
    sql_script = f.read()
```

### 2. Obiettivi: Campo `importo_attuale` Deprecato

**Problema**: `importo_attuale` in `obiettivi_risparmio` diventa obsoleto.

**Causa**: Dati duplicati tra `obiettivi_risparmio` e `movimenti`.

**Fix**: Calcola sempre da movimenti:
```python
cursor.execute("""
    SELECT COALESCE(SUM(importo), 0) 
    FROM movimenti 
    WHERE obiettivo_id = ? AND tipo = 'entrata'
""", (obiettivo_id,))
importo_attuale = cursor.fetchone()[0]
```

### 3. CORS in Produzione

**Problema**: Frontend in produzione su dominio diverso dal backend.

**Soluzione Temporanea**: CORS aperto per development
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Cambiare in produzione!
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**TODO**: Configurare origins specifici per produzione.

---

## 🚀 Deployment

### Requisiti Produzione

- Python 3.11+
- Node.js 18+
- Nginx (reverse proxy)
- Supervisor/systemd (process management)
- HTTPS (Let's Encrypt)

### Build Frontend

```bash
cd frontend
npm run build  # Genera dist/
```

**Output**: Cartella `dist/` con HTML/CSS/JS statici.

### Run Backend (Production)

```bash
pip install gunicorn
gunicorn backend.main:app --workers 4 --bind 0.0.0.0:8000
```

### Nginx Config (Esempio)

```nginx
server {
    listen 80;
    server_name lume-finance.example.com;

    # Frontend (static files)
    location / {
        root /var/www/lume-finance/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🧪 Testing

### Manual Testing Checklist

**Dashboard**:
- [ ] KPI cards mostrano valori corretti
- [ ] Grafico categorie funziona
- [ ] Movimenti recenti visibili
- [ ] Theme toggle funziona

**Movimenti**:
- [ ] Lista movimenti caricata
- [ ] Filtri per tipo/categoria
- [ ] Crea movimento semplice
- [ ] Crea movimento con scomposizione (veicolo)
- [ ] Crea movimento con obiettivo_id
- [ ] Modifica movimento
- [ ] Elimina movimento (conferma dialog)

**Budget**:
- [ ] Lista budget con progress bar
- [ ] Colori corretti (verde/giallo/rosso)
- [ ] Crea budget
- [ ] Calcolo speso include budget_id espliciti

**Obiettivi**:
- [ ] Lista obiettivi con calcolo da movimenti
- [ ] Badge priorità corretti
- [ ] Progress bar funziona
- [ ] Auto-completamento al 100%

**Conti**:
- [ ] Lista conti
- [ ] Saldo calcolato da movimenti
- [ ] Crea/modifica/elimina conto

**Beni**:
- [ ] Lista beni (veicoli + elettrodomestici)
- [ ] Form dinamico (campi specifici per tipo)
- [ ] Calcolo ammortamento corretto

---

## 📚 Risorse Utili

### Documentazione
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Chart.js**: https://www.chartjs.org/docs/
- **Lucide Icons**: https://lucide.dev/icons/

### API Testing
- **Swagger UI**: http://localhost:8000/docs (auto-generato da FastAPI)
- **Redoc**: http://localhost:8000/redoc

---

## 🎯 Prossimi Step

### High Priority
1. **Autenticazione**: Login/registro utenti
2. **Export Report**: PDF/Excel con grafici
3. **Notifiche**: Budget superati, scadenze obiettivi
4. **PWA**: Installabile come app mobile

### Medium Priority
5. **Grafici Trend**: Andamento spese mensili
6. **Movimenti Ricorrenti**: Automazione entrate/uscite fisse
7. **Multi-valuta**: Conversione automatica
8. **Backup Cloud**: Sync database su cloud storage

### Low Priority
9. **Integrazione Bancaria**: API PSD2 per import movimenti
10. **Machine Learning**: Previsioni spesa basate su storico
11. **Tag Personalizzati**: Oltre le categorie predefinite
12. **Mobile App**: React Native per iOS/Android

---

## 💬 Note per AI Assistant

### Quando modifichi codice:

1. **Backend**:
   - Sempre `conn.commit()` dopo INSERT/UPDATE/DELETE
   - Usa `encoding='utf-8'` per file SQL
   - Gestisci errori con HTTPException

2. **Frontend**:
   - Mantieni consistenza con design system
   - Usa `useTheme()` per accedere al tema
   - Componenti devono essere responsive (mobile-first)

3. **Database**:
   - NON modificare direttamente `importo_attuale` in obiettivi
   - Calcola sempre da movimenti
   - Migrations incrementali in `database/migrations/`

4. **Commit**:
   - Usa conventional commits
   - Emoji nel messaggio per chiarezza
   - Riferisci issue/PR se esistenti

### Domande Frequenti:

**Q**: Come aggiungere una nuova categoria?  
**A**: INSERT in `categorie`, poi sarà disponibile nei dropdown.

**Q**: Come calcolare il saldo di un conto?  
**A**: `SELECT SUM(CASE WHEN tipo='entrata' THEN importo ELSE -importo END) FROM movimenti WHERE conto_id = ?`

**Q**: Come testare scomposizione costi?  
**A**: Crea un bene veicolo/elettrodomestico, poi crea movimento con `bene_id` + `km_percorsi`/`ore_utilizzo`.

**Q**: Perché `importo_attuale` non viene aggiornato?  
**A**: È deprecato. Usa il calcolo da movimenti per evitare inconsistenze.

---

**Ultima Modifica**: 26 Febbraio 2026, 09:15 CET  
**Versione Context**: 1.0  
**Autore**: Afellai3
