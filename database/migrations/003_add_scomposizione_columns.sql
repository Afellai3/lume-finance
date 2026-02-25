-- Migration 003: Aggiungi colonne per scomposizione costi

ALTER TABLE movimenti ADD COLUMN bene_id INTEGER REFERENCES beni(id) ON DELETE SET NULL;
ALTER TABLE movimenti ADD COLUMN km_percorsi REAL;
ALTER TABLE movimenti ADD COLUMN ore_utilizzo REAL;
ALTER TABLE movimenti ADD COLUMN scomposizione_json TEXT;

CREATE INDEX IF NOT EXISTS idx_movimenti_bene ON movimenti(bene_id);
