-- Migration 005: Tabella Movimenti Ricorrenti
-- Sprint 4: Ricorrenze & Automazioni
-- Data: 2026-02-25

CREATE TABLE IF NOT EXISTS movimenti_ricorrenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Template movimento
    descrizione TEXT NOT NULL,
    importo REAL NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
    
    -- Ricorrenza
    frequenza TEXT NOT NULL CHECK(frequenza IN ('giornaliera', 'settimanale', 'mensile', 'annuale')),
    giorno_mese INTEGER CHECK(giorno_mese BETWEEN 1 AND 31), -- Per mensile/annuale
    giorno_settimana INTEGER CHECK(giorno_settimana BETWEEN 0 AND 6), -- Per settimanale (0=Lun)
    mese INTEGER CHECK(mese BETWEEN 1 AND 12), -- Per annuale
    
    -- Scheduling
    data_inizio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fine DATE, -- NULL = infinito
    prossima_data DATE NOT NULL,
    
    -- Stato
    attivo BOOLEAN NOT NULL DEFAULT 1,
    
    -- Collegamenti (come movimenti normali)
    conto_id INTEGER,
    categoria_id INTEGER,
    budget_id INTEGER,
    obiettivo_id INTEGER,
    bene_id INTEGER,
    
    -- Metadata
    note TEXT,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_modifica TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (conto_id) REFERENCES conti(id),
    FOREIGN KEY (categoria_id) REFERENCES categorie(id),
    FOREIGN KEY (budget_id) REFERENCES budget(id),
    FOREIGN KEY (obiettivo_id) REFERENCES obiettivi(id),
    FOREIGN KEY (bene_id) REFERENCES beni(id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_ricorrenze_prossima_data ON movimenti_ricorrenti(prossima_data);
CREATE INDEX IF NOT EXISTS idx_ricorrenze_attivo ON movimenti_ricorrenti(attivo);
CREATE INDEX IF NOT EXISTS idx_ricorrenze_conto ON movimenti_ricorrenti(conto_id);
CREATE INDEX IF NOT EXISTS idx_ricorrenze_tipo ON movimenti_ricorrenti(tipo);

-- Trigger per aggiornare data_modifica
CREATE TRIGGER IF NOT EXISTS update_ricorrenze_timestamp 
AFTER UPDATE ON movimenti_ricorrenti
BEGIN
    UPDATE movimenti_ricorrenti 
    SET data_modifica = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;
