-- Migration 003: Enhance beni table for Sprint 3 (TCO Management)
-- Adds fields for comprehensive asset tracking and TCO calculation

-- ============================================================================
-- Add Common Fields
-- ============================================================================

ALTER TABLE beni ADD COLUMN marca TEXT;
ALTER TABLE beni ADD COLUMN modello TEXT;
ALTER TABLE beni ADD COLUMN foto_url TEXT;
ALTER TABLE beni ADD COLUMN note TEXT;
ALTER TABLE beni ADD COLUMN stato TEXT DEFAULT 'attivo' CHECK(stato IN ('attivo', 'dismesso', 'in_vendita'));
ALTER TABLE beni ADD COLUMN valore_residuo REAL;

-- ============================================================================
-- Vehicle-Specific Fields
-- ============================================================================

ALTER TABLE beni ADD COLUMN veicolo_targa TEXT;
ALTER TABLE beni ADD COLUMN veicolo_km_iniziali REAL;
ALTER TABLE beni ADD COLUMN veicolo_km_attuali REAL;
ALTER TABLE beni ADD COLUMN veicolo_ultima_revisione TIMESTAMP;
ALTER TABLE beni ADD COLUMN veicolo_assicurazione_annuale REAL;
ALTER TABLE beni ADD COLUMN veicolo_bollo_annuale REAL;

-- ============================================================================
-- Property-Specific Fields (Immobili)
-- ============================================================================

ALTER TABLE beni ADD COLUMN immobile_indirizzo TEXT;
ALTER TABLE beni ADD COLUMN immobile_mq REAL;
ALTER TABLE beni ADD COLUMN immobile_valore_catastale REAL;
ALTER TABLE beni ADD COLUMN immobile_spese_condominiali_mensili REAL;
ALTER TABLE beni ADD COLUMN immobile_imu_annuale REAL;

-- ============================================================================
-- Equipment-Specific Fields (Attrezzatura)
-- ============================================================================

ALTER TABLE beni ADD COLUMN attrezzatura_serial_number TEXT;
ALTER TABLE beni ADD COLUMN attrezzatura_ore_utilizzo REAL;
ALTER TABLE beni ADD COLUMN attrezzatura_costo_orario REAL;

-- ============================================================================
-- Update tipo check constraint (add 'immobile' and 'attrezzatura')
-- Note: SQLite doesn't support ALTER COLUMN, so we document the extended types
-- New valid types: 'veicolo', 'immobile', 'attrezzatura', 'elettrodomestico', 'altro'
-- ============================================================================

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_beni_tipo ON beni(tipo);
CREATE INDEX IF NOT EXISTS idx_beni_stato ON beni(stato);
CREATE INDEX IF NOT EXISTS idx_beni_data_acquisto ON beni(data_acquisto DESC);
