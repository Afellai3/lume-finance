-- Lume Finance - Database Schema
-- Schema completo per gestione finanze personali con scomposizione costi

-- ============================================================================
-- CATEGORIE
-- ============================================================================

CREATE TABLE IF NOT EXISTS categorie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    icona TEXT,
    colore TEXT,
    categoria_padre_id INTEGER,
    FOREIGN KEY (categoria_padre_id) REFERENCES categorie(id) ON DELETE SET NULL
);

CREATE INDEX idx_categorie_tipo ON categorie(tipo);

-- ============================================================================
-- CONTI
-- ============================================================================

CREATE TABLE IF NOT EXISTS conti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('corrente', 'risparmio', 'carta_credito', 'contanti', 'investimenti', 'altro')),
    saldo REAL NOT NULL DEFAULT 0.0,
    valuta TEXT NOT NULL DEFAULT 'EUR',
    descrizione TEXT,
    attivo BOOLEAN NOT NULL DEFAULT 1,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BENI (Auto, Elettrodomestici, ecc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS beni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('veicolo', 'elettrodomestico', 'altro')),
    data_acquisto TIMESTAMP NOT NULL,
    prezzo_acquisto REAL NOT NULL,
    
    -- Campi specifici per veicoli
    veicolo_tipo_carburante TEXT,
    veicolo_consumo_medio REAL,
    veicolo_costo_manutenzione_per_km REAL,
    
    -- Campi specifici per elettrodomestici
    elettrodomestico_potenza REAL,
    elettrodomestico_ore_medie_giorno REAL,
    
    -- Campi comuni per ammortamento
    durata_anni_stimata INTEGER,
    tasso_ammortamento REAL,
    
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MOVIMENTI
-- ============================================================================

CREATE TABLE IF NOT EXISTS movimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TIMESTAMP NOT NULL,
    importo REAL NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita', 'trasferimento')),
    categoria_id INTEGER,
    conto_id INTEGER,
    descrizione TEXT NOT NULL,
    ricorrente BOOLEAN DEFAULT 0,
    
    -- Collegamento a beni per scomposizione costi
    bene_id INTEGER,
    km_percorsi REAL,
    ore_utilizzo REAL,
    scomposizione_json TEXT,
    
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorie(id) ON DELETE SET NULL,
    FOREIGN KEY (conto_id) REFERENCES conti(id) ON DELETE SET NULL,
    FOREIGN KEY (bene_id) REFERENCES beni(id) ON DELETE SET NULL
);

CREATE INDEX idx_movimenti_data ON movimenti(data DESC);
CREATE INDEX idx_movimenti_tipo ON movimenti(tipo);
CREATE INDEX idx_movimenti_categoria ON movimenti(categoria_id);
CREATE INDEX idx_movimenti_conto ON movimenti(conto_id);
CREATE INDEX idx_movimenti_bene ON movimenti(bene_id);

-- ============================================================================
-- BUDGET
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    importo REAL NOT NULL,
    periodo TEXT NOT NULL CHECK(periodo IN ('settimanale', 'mensile', 'annuale')),
    data_inizio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attivo BOOLEAN DEFAULT 1,
    
    FOREIGN KEY (categoria_id) REFERENCES categorie(id) ON DELETE CASCADE
);

CREATE INDEX idx_budget_categoria ON budget(categoria_id);

-- ============================================================================
-- OBIETTIVI DI RISPARMIO
-- ============================================================================

CREATE TABLE IF NOT EXISTS obiettivi_risparmio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    importo_target REAL NOT NULL,
    importo_attuale REAL DEFAULT 0.0,
    data_target TIMESTAMP,
    priorita INTEGER DEFAULT 3 CHECK(priorita BETWEEN 1 AND 5),
    completato BOOLEAN DEFAULT 0,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CENTRI DI COSTO
-- ============================================================================

CREATE TABLE IF NOT EXISTS centri_costo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('stanza', 'attivita', 'progetto', 'altro')),
    descrizione TEXT,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
