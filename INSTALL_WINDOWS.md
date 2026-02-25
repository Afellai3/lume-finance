# 💻 Guida Installazione Lume Finance - Windows

## 🐛 Problemi Comuni e Soluzioni

### Errore: "Python was not found"

**Problema:** Windows sta cercando Python nel Microsoft Store invece del tuo Python installato.

**Soluzioni:**

#### Soluzione 1: Disabilita alias Microsoft Store (Raccomandato)

1. Apri **Impostazioni Windows** (Win + I)
2. Vai su **App > App avanzate > Alias di esecuzione app**
3. **Disabilita** gli interruttori per:
   - `python.exe`
   - `python3.exe`
4. Riavvia il terminale
5. Testa: `python --version`

#### Soluzione 2: Aggiungi Python al PATH

1. Trova dove hai installato Python:  
   Solitamente: `C:\Users\<tuonome>\AppData\Local\Programs\Python\Python3XX`

2. Apri **Variabili d'ambiente**:
   - Tasto destro su "Questo PC" → Proprietà
   - Impostazioni di sistema avanzate
   - Variabili d'ambiente

3. In "Variabili utente", seleziona **Path** → Modifica

4. Aggiungi questi 2 percorsi (sostituisci `3XX` con la tua versione):
   ```
   C:\Users\<tuonome>\AppData\Local\Programs\Python\Python3XX
   C:\Users\<tuonome>\AppData\Local\Programs\Python\Python3XX\Scripts
   ```

5. Click OK su tutto

6. **IMPORTANTE:** Chiudi e riapri il terminale

7. Testa: `python --version`

#### Soluzione 3: Usa comando alternativo

Se hai installato Python dal sito ufficiale ma `python` non funziona, prova:

```bash
# Prova questi comandi per vedere quale funziona:
py --version
python3 --version
python --version
```

Lo script `start.bat` ora prova automaticamente tutti e 3!

---

### Errore: "npm non riconosciuto"

**Soluzione:**

1. Installa Node.js da https://nodejs.org (versione LTS)
2. Durante l'installazione, assicurati che sia spuntato "Add to PATH"
3. Riavvia il terminale
4. Testa: `node --version` e `npm --version`

---

## ✅ Installazione Completa Passo-Passo

### 1. Installa Python

1. Vai su https://python.org/downloads
2. Scarica **Python 3.10** o superiore
3. **CRUCIALE:** Durante l'installazione, spunta:
   - ☑️ **"Add Python to PATH"**
   - ☑️ **"Install for all users"** (opzionale)
4. Completa installazione
5. Apri nuovo terminale e verifica:
   ```bash
   python --version
   pip --version
   ```

### 2. Installa Node.js

1. Vai su https://nodejs.org
2. Scarica versione **LTS** (20.x o 22.x)
3. Installa con impostazioni predefinite
4. Verifica:
   ```bash
   node --version
   npm --version
   ```

### 3. Clona Lume Finance

```bash
cd C:\Users\<tuonome>\Desktop
git clone https://github.com/Afellai3/lume-finance.git
cd lume-finance
```

### 4. Installa Dipendenze Python

```bash
pip install -r requirements.txt
```

### 5. Installa Dipendenze Frontend

```bash
cd frontend
npm install
cd ..
```

### 6. Inizializza Database

```bash
cd database
sqlite3 lume.db < schema.sql
sqlite3 lume.db < seed_data.sql
cd ..
```

Se `sqlite3` non è disponibile:

```bash
# Alternativa con Python
python -c "import sqlite3; conn = sqlite3.connect('database/lume.db'); conn.executescript(open('database/schema.sql').read()); conn.commit()"
python -c "import sqlite3; conn = sqlite3.connect('database/lume.db'); conn.executescript(open('database/seed_data.sql').read()); conn.commit()"
```

### 7. Avvia Lume!

```bash
# Doppio click oppure:
start.bat
```

---

## 🔧 Avvio Manuale (se lo script non funziona)

### Terminale 1 - Backend
```bash
cd C:\Users\<tuonome>\Desktop\lume-finance
python run.py
```

### Terminale 2 - Frontend
```bash
cd C:\Users\<tuonome>\Desktop\lume-finance\frontend
npm run dev
```

### Browser
Apri manualmente: http://localhost:3000

---

## 📞 Supporto

Se hai ancora problemi:

1. Verifica versioni:
   ```bash
   python --version  # Deve essere 3.10+
   node --version    # Deve essere 18+
   npm --version     # Deve essere 9+
   ```

2. Verifica che il backend sia avviato:
   - Vai su http://localhost:8000
   - Dovresti vedere: `{"messaggio": "Benvenuto su Lume Finance API", ...}`

3. Verifica che il frontend sia avviato:
   - Vai su http://localhost:3000
   - Dovresti vedere la sidebar con logo Lume

4. Controlla errori nel terminale backend/frontend

5. Apri un issue su GitHub con:
   - Output di `python --version`
   - Output di `npm --version`
   - Screenshot errori
