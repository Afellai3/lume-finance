-- Migration 004: Enhance Budget & Obiettivi (Sprint 4)
-- Aggiunge campi per collegamento movimenti e funzionalità avanzate

-- ============================================================================
-- MOVIMENTI: Aggiungi collegamento a budget e obiettivi
-- ============================================================================

-- Aggiungi budget_id per tracciare spese specifiche per budget
ALTER TABLE movimenti ADD COLUMN budget_id INTEGER REFERENCES budget(id) ON DELETE SET NULL;

-- Aggiungi obiettivo_id per tracciare contributi a obiettivi di risparmio
ALTER TABLE movimenti ADD COLUMN obiettivo_id INTEGER REFERENCES obiettivi_risparmio(id) ON DELETE SET NULL;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_movimenti_budget ON movimenti(budget_id);
CREATE INDEX IF NOT EXISTS idx_movimenti_obiettivo ON movimenti(obiettivo_id);

-- ============================================================================
-- BUDGET: Aggiungi campi avanzati
-- ============================================================================

-- Data fine budget (opzionale, per budget temporanei)
ALTER TABLE budget ADD COLUMN data_fine TIMESTAMP;

-- Soglia di avviso personalizzata (default 80%)
ALTER TABLE budget ADD COLUMN soglia_avviso INTEGER DEFAULT 80 CHECK(soglia_avviso BETWEEN 1 AND 100);

-- Descrizione/note per il budget
ALTER TABLE budget ADD COLUMN descrizione TEXT;

-- ============================================================================
-- OBIETTIVI_RISPARMIO: Aggiungi campi avanzati
-- ============================================================================

-- Descrizione dettagliata obiettivo
ALTER TABLE obiettivi_risparmio ADD COLUMN descrizione TEXT;

-- Categoria associata (opzionale, per tracciare risparmi su categorie specifiche)
ALTER TABLE obiettivi_risparmio ADD COLUMN categoria_id INTEGER REFERENCES categorie(id) ON DELETE SET NULL;

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_obiettivi_categoria ON obiettivi_risparmio(categoria_id);

-- ============================================================================
-- Note sulla migrazione
-- ============================================================================

-- Questa migrazione è compatibile con i dati esistenti:
-- - I nuovi campi sono NULL o hanno default
-- - Gli indici migliorano le query esistenti
-- - Nessun dato viene perso o modificato

-- Per applicare:
-- sqlite3 data/lume.db < database/migrations/004_enhance_budget_obiettivi.sql
