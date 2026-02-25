-- Migration: Add obiettivo_id to movimenti table
-- Date: 2026-02-25
-- Purpose: Enable linking income movements to savings goals

-- Add obiettivo_id column
ALTER TABLE movimenti 
ADD COLUMN obiettivo_id INTEGER;

-- Add foreign key constraint
ALTER TABLE movimenti 
ADD CONSTRAINT fk_movimenti_obiettivo
FOREIGN KEY (obiettivo_id) 
REFERENCES obiettivi_risparmio(id)
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_movimenti_obiettivo ON movimenti(obiettivo_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'movimenti' AND column_name = 'obiettivo_id';
