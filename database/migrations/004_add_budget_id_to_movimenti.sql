-- Migration 004: Aggiungi collegamento esplicito budget ai movimenti

ALTER TABLE movimenti ADD COLUMN budget_id INTEGER REFERENCES budget(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_movimenti_budget ON movimenti(budget_id);
