-- Migration 006: Categorie Custom
-- Sprint 5: Categorie Personalizzabili
-- Data: 2026-02-25

-- Aggiungi campo is_system per distinguere categorie predefinite da custom
ALTER TABLE categorie ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT 0;

-- Marca tutte le categorie esistenti come categorie di sistema
UPDATE categorie SET is_system = 1;

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_categorie_is_system ON categorie(is_system);
CREATE INDEX IF NOT EXISTS idx_categorie_tipo ON categorie(tipo);

-- Nota: Le categorie di sistema non possono essere eliminate o modificate
-- Le categorie custom (is_system = 0) possono essere gestite liberamente dall'utente
