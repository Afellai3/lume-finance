-- Lume Finance - Schema Database
-- Schema compatibile SQLite per gestione finanze personali con analisi costi dettagliata

-- ============================================================================
-- TABELLE PRINCIPALI
-- ============================================================================

-- Tabella conti: conti bancari, carte di credito, portafogli contanti
CREATE TABLE IF NOT EXISTS conti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('corrente', 'risparmio', 'carta_credito', 'contanti', 'investimento')),
    saldo REAL NOT NULL DEFAULT 0.0,
    valuta TEXT NOT NULL DEFAULT 'EUR',
    descrizione TEXT,
    attivo BOOLEAN DEFAULT 1,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella categorie: categorie entrate e uscite
CREATE TABLE IF NOT EXISTS categorie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    categoria_padre_id INTEGER,
    icona TEXT,
    colore TEXT,
    descrizione TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_padre_id) REFERENCES categorie(id) ON DELETE SET NULL
);

-- Tabella movimenti: tutti i movimenti finanziari
CREATE TABLE IF NOT EXISTS movimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TIMESTAMP NOT NULL,
    importo REAL NOT NULL CHECK(importo > 0),
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita', 'trasferimento')),
    categoria_id INTEGER,
    conto_id INTEGER NOT NULL,
    conto_destinazione_id INTEGER, -- Per trasferimenti
    descrizione TEXT NOT NULL,
    note TEXT,
    ricorrente BOOLEAN DEFAULT 0,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorie(id) ON DELETE SET NULL,
    FOREIGN KEY (conto_id) REFERENCES conti(id) ON DELETE CASCADE,
    FOREIGN KEY (conto_destinazione_id) REFERENCES conti(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELLE MOTORE ANALISI COSTI
-- ============================================================================

-- Tabella beni: oggetti fisici con costi continuativi (auto, elettrodomestici, ecc.)
CREATE TABLE IF NOT EXISTS beni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('veicolo', 'elettrodomestico', 'immobile', 'altro')),
    data_acquisto DATE,
    prezzo_acquisto REAL,
    
    -- Campi specifici veicoli
    veicolo_tipo_carburante TEXT CHECK(veicolo_tipo_carburante IN ('benzina', 'diesel', 'elettrico', 'ibrido', 'gpl')),
    veicolo_consumo_medio REAL, -- L/100km o kWh/100km
    veicolo_costo_manutenzione_per_km REAL,
    
    -- Campi specifici elettrodomestici
    elettrodomestico_potenza REAL, -- Watt
    elettrodomestico_ore_medie_giorno REAL,
    
    -- Generale
    durata_anni_stimata INTEGER,
    tasso_ammortamento REAL, -- Percentuale annuale
    note TEXT,
    attivo BOOLEAN DEFAULT 1,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracciamento utilizzo beni: registra utilizzo effettivo (km percorsi, ore uso, ecc.)
CREATE TABLE IF NOT EXISTS utilizzo_beni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bene_id INTEGER NOT NULL,
    data DATE NOT NULL,
    
    -- Metriche di utilizzo
    km_percorsi REAL, -- Per veicoli
    ore_utilizzo REAL, -- Per elettrodomestici
    kwh_consumati REAL, -- Per dispositivi elettrici
    
    -- Costi al momento dell'utilizzo
    prezzo_carburante_al_litro REAL,
    prezzo_elettricita_per_kwh REAL,
    
    note TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bene_id) REFERENCES beni(id) ON DELETE CASCADE
);

-- Scomposizione costi: decomposizione granulare dei costi delle transazioni
CREATE TABLE IF NOT EXISTS scomposizione_costi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movimento_id INTEGER NOT NULL,
    bene_id INTEGER, -- Collega al bene se applicabile
    
    nome_componente TEXT NOT NULL, -- es: 'carburante', 'usura', 'elettricita', 'costo_base'
    valore_componente REAL NOT NULL,
    unita TEXT, -- es: 'EUR', 'km', 'kWh'
    percentuale_totale REAL, -- Percentuale del movimento totale
    
    -- Metadata calcolo
    metodo_calcolo TEXT, -- Descrizione di come è stato calcolato
    parametri_calcolo TEXT, -- Stringa JSON con parametri usati
    
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movimento_id) REFERENCES movimenti(id) ON DELETE CASCADE,
    FOREIGN KEY (bene_id) REFERENCES beni(id) ON DELETE SET NULL
);

-- Centri di costo: alloca i costi a diverse aree (es: cucina, camera per utenze)
CREATE TABLE IF NOT EXISTS centri_costo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    tipo TEXT, -- es: 'stanza', 'attivita', 'persona'
    descrizione TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allocazioni centri di costo: distribuisce i costi dei movimenti tra i centri
CREATE TABLE IF NOT EXISTS allocazioni_centri_costo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movimento_id INTEGER NOT NULL,
    centro_costo_id INTEGER NOT NULL,
    importo_allocato REAL NOT NULL,
    percentuale_allocazione REAL,
    note TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movimento_id) REFERENCES movimenti(id) ON DELETE CASCADE,
    FOREIGN KEY (centro_costo_id) REFERENCES centri_costo(id) ON DELETE CASCADE
);

-- ============================================================================
-- BUDGET E PIANIFICAZIONE
-- ============================================================================

-- Tabella budget: limiti di spesa per categoria
CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    importo REAL NOT NULL CHECK(importo > 0),
    periodo TEXT NOT NULL CHECK(periodo IN ('giornaliero', 'settimanale', 'mensile', 'annuale')),
    data_inizio DATE NOT NULL,
    data_fine DATE,
    attivo BOOLEAN DEFAULT 1,
    note TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorie(id) ON DELETE CASCADE
);

-- Obiettivi risparmio: importi target da risparmiare
CREATE TABLE IF NOT EXISTS obiettivi_risparmio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    importo_target REAL NOT NULL CHECK(importo_target > 0),
    importo_attuale REAL DEFAULT 0.0,
    data_target DATE,
    conto_id INTEGER,
    priorita INTEGER DEFAULT 1 CHECK(priorita BETWEEN 1 AND 5),
    completato BOOLEAN DEFAULT 0,
    note TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conto_id) REFERENCES conti(id) ON DELETE SET NULL
);

-- ============================================================================
-- INVESTIMENTI E SIMULAZIONI
-- ============================================================================

-- Tabella investimenti: azioni, obbligazioni, fondi, crypto
CREATE TABLE IF NOT EXISTS investimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conto_id INTEGER NOT NULL,
    simbolo TEXT, -- Ticker symbol (es: AAPL, BTC)
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('azione', 'obbligazione', 'fondo', 'etf', 'crypto', 'altro')),
    quantita REAL NOT NULL DEFAULT 0,
    prezzo_acquisto REAL,
    data_acquisto DATE,
    prezzo_attuale REAL,
    valuta TEXT DEFAULT 'EUR',
    note TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conto_id) REFERENCES conti(id) ON DELETE CASCADE
);

-- Operazioni investimenti: operazioni di acquisto/vendita
CREATE TABLE IF NOT EXISTS operazioni_investimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investimento_id INTEGER NOT NULL,
    data TIMESTAMP NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('acquisto', 'vendita', 'dividendo')),
    quantita REAL NOT NULL,
    prezzo_unitario REAL NOT NULL,
    importo_totale REAL NOT NULL,
    commissioni REAL DEFAULT 0,
    note TEXT,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investimento_id) REFERENCES investimenti(id) ON DELETE CASCADE
);

-- Prestiti e mutui: traccia debiti e piani di pagamento
CREATE TABLE IF NOT EXISTS prestiti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('mutuo', 'prestito_personale', 'prestito_auto', 'prestito_studio', 'altro')),
    importo_capitale REAL NOT NULL,
    tasso_interesse REAL NOT NULL, -- Percentuale annuale
    durata_mesi INTEGER NOT NULL,
    data_inizio DATE NOT NULL,
    rata_mensile REAL NOT NULL,
    saldo_residuo REAL,
    conto_id INTEGER, -- Conto usato per pagamenti
    note TEXT,
    attivo BOOLEAN DEFAULT 1,
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conto_id) REFERENCES conti(id) ON DELETE SET NULL
);

-- Pagamenti prestiti: traccia singoli pagamenti
CREATE TABLE IF NOT EXISTS pagamenti_prestiti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestito_id INTEGER NOT NULL,
    data_pagamento DATE NOT NULL,
    importo_pagato REAL NOT NULL,
    capitale_pagato REAL NOT NULL,
    interessi_pagati REAL NOT NULL,
    saldo_residuo REAL NOT NULL,
    movimento_id INTEGER, -- Collega al movimento se registrato
    creato_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prestito_id) REFERENCES prestiti(id) ON DELETE CASCADE,
    FOREIGN KEY (movimento_id) REFERENCES movimenti(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDICI PER PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_movimenti_data ON movimenti(data);
CREATE INDEX IF NOT EXISTS idx_movimenti_conto ON movimenti(conto_id);
CREATE INDEX IF NOT EXISTS idx_movimenti_categoria ON movimenti(categoria_id);
CREATE INDEX IF NOT EXISTS idx_scomposizione_costi_movimento ON scomposizione_costi(movimento_id);
CREATE INDEX IF NOT EXISTS idx_utilizzo_beni_bene ON utilizzo_beni(bene_id);
CREATE INDEX IF NOT EXISTS idx_utilizzo_beni_data ON utilizzo_beni(data);
CREATE INDEX IF NOT EXISTS idx_investimenti_conto ON investimenti(conto_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_prestiti_prestito ON pagamenti_prestiti(prestito_id);

-- ============================================================================
-- TRIGGER PER AGGIORNAMENTI AUTOMATICI
-- ============================================================================

-- Aggiorna saldo conto all'inserimento movimento
CREATE TRIGGER IF NOT EXISTS aggiorna_saldo_conto_inserimento
AFTER INSERT ON movimenti
FOR EACH ROW
BEGIN
    UPDATE conti 
    SET saldo = saldo + 
        CASE 
            WHEN NEW.tipo = 'entrata' THEN NEW.importo
            WHEN NEW.tipo = 'uscita' THEN -NEW.importo
            WHEN NEW.tipo = 'trasferimento' THEN -NEW.importo
        END,
        modificato_il = CURRENT_TIMESTAMP
    WHERE id = NEW.conto_id;
    
    -- Gestisce destinazione trasferimento
    UPDATE conti
    SET saldo = saldo + NEW.importo,
        modificato_il = CURRENT_TIMESTAMP
    WHERE id = NEW.conto_destinazione_id AND NEW.tipo = 'trasferimento';
END;

-- Aggiorna timestamp alla modifica record
CREATE TRIGGER IF NOT EXISTS aggiorna_timestamp_conti
AFTER UPDATE ON conti
FOR EACH ROW
BEGIN
    UPDATE conti SET modificato_il = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS aggiorna_timestamp_movimenti
AFTER UPDATE ON movimenti
FOR EACH ROW
BEGIN
    UPDATE movimenti SET modificato_il = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS aggiorna_timestamp_beni
AFTER UPDATE ON beni
FOR EACH ROW
BEGIN
    UPDATE beni SET modificato_il = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;