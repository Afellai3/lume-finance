-- Seed 005: Budget & Obiettivi Examples (Sprint 4)
-- Dati di esempio per testare le funzionalità di budget e obiettivi

-- Nota: Questo seed assume che esistano già le categorie base e i conti
-- Se necessario, eseguire prima 001_categorie_base.sql e 002_conti_base.sql

-- ============================================================================
-- BUDGET DI ESEMPIO
-- ============================================================================

-- Budget Alimentari (mensile, 65% utilizzato)
INSERT OR IGNORE INTO budget (categoria_id, importo, periodo, soglia_avviso, descrizione, attivo)
SELECT 
    id, 
    600.00, 
    'mensile', 
    80, 
    'Budget per spesa e alimentari', 
    1
FROM categorie WHERE nome = 'Alimentari' AND tipo = 'uscita';

-- Budget Trasporti (mensile, 90% utilizzato - attenzione)
INSERT OR IGNORE INTO budget (categoria_id, importo, periodo, soglia_avviso, descrizione, attivo)
SELECT 
    id, 
    300.00, 
    'mensile', 
    80, 
    'Budget benzina e mezzi pubblici', 
    1
FROM categorie WHERE nome = 'Trasporti' AND tipo = 'uscita';

-- Budget Svago (mensile, 105% utilizzato - superato!)
INSERT OR IGNORE INTO budget (categoria_id, importo, periodo, soglia_avviso, descrizione, attivo)
SELECT 
    id, 
    200.00, 
    'mensile', 
    80, 
    'Ristoranti, cinema, eventi', 
    1
FROM categorie WHERE nome = 'Svago' AND tipo = 'uscita';

-- Budget Casa (mensile, 50% utilizzato)
INSERT OR IGNORE INTO budget (categoria_id, importo, periodo, soglia_avviso, descrizione, attivo)
SELECT 
    id, 
    1000.00, 
    'mensile', 
    80, 
    'Affitto, bollette, spese condominiali', 
    1
FROM categorie WHERE nome = 'Casa' AND tipo = 'uscita';

-- ============================================================================
-- MOVIMENTI DI SPESA PER I BUDGET (Febbraio 2026)
-- ============================================================================

-- Spese Alimentari (390€ su 600€ = 65%)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-03 10:30:00',
    -85.50,
    'uscita',
    cat.id,
    con.id,
    'Spesa settimanale - Supermercato'
FROM categorie cat, conti con
WHERE cat.nome = 'Alimentari' AND con.nome = 'Conto Corrente'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-10 11:15:00',
    -92.30,
    'uscita',
    cat.id,
    con.id,
    'Spesa settimanale - Supermercato'
FROM categorie cat, conti con
WHERE cat.nome = 'Alimentari' AND con.nome = 'Conto Corrente'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-17 09:45:00',
    -78.20,
    'uscita',
    cat.id,
    con.id,
    'Spesa settimanale - Supermercato'
FROM categorie cat, conti con
WHERE cat.nome = 'Alimentari' AND con.nome = 'Conto Corrente'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-24 12:00:00',
    -134.00,
    'uscita',
    cat.id,
    con.id,
    'Spesa grande - Supermercato + dispensa'
FROM categorie cat, conti con
WHERE cat.nome = 'Alimentari' AND con.nome = 'Conto Corrente'
LIMIT 1;

-- Spese Trasporti (270€ su 300€ = 90% - ATTENZIONE)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-05 08:20:00',
    -65.00,
    'uscita',
    cat.id,
    con.id,
    'Rifornimento benzina'
FROM categorie cat, conti con
WHERE cat.nome = 'Trasporti' AND con.nome = 'Carta di Credito'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-12 07:45:00',
    -70.00,
    'uscita',
    cat.id,
    con.id,
    'Rifornimento benzina'
FROM categorie cat, conti con
WHERE cat.nome = 'Trasporti' AND con.nome = 'Carta di Credito'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-20 19:30:00',
    -55.00,
    'uscita',
    cat.id,
    con.id,
    'Rifornimento benzina'
FROM categorie cat, conti con
WHERE cat.nome = 'Trasporti' AND con.nome = 'Carta di Credito'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-01 09:00:00',
    -80.00,
    'uscita',
    cat.id,
    con.id,
    'Abbonamento parcheggio mensile'
FROM categorie cat, conti con
WHERE cat.nome = 'Trasporti' AND con.nome = 'Conto Corrente'
LIMIT 1;

-- Spese Svago (210€ su 200€ = 105% - SUPERATO!)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-08 20:30:00',
    -65.00,
    'uscita',
    cat.id,
    con.id,
    'Cena ristorante'
FROM categorie cat, conti con
WHERE cat.nome = 'Svago' AND con.nome = 'Carta di Credito'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-14 21:00:00',
    -85.00,
    'uscita',
    cat.id,
    con.id,
    'San Valentino - Ristorante'
FROM categorie cat, conti con
WHERE cat.nome = 'Svago' AND con.nome = 'Carta di Credito'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-15 18:30:00',
    -30.00,
    'uscita',
    cat.id,
    con.id,
    'Cinema + popcorn'
FROM categorie cat, conti con
WHERE cat.nome = 'Svago' AND con.nome = 'Contanti'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-22 19:45:00',
    -30.00,
    'uscita',
    cat.id,
    con.id,
    'Aperitivo con amici'
FROM categorie cat, conti con
WHERE cat.nome = 'Svago' AND con.nome = 'Contanti'
LIMIT 1;

-- Spese Casa (500€ su 1000€ = 50%)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-01 00:00:00',
    -400.00,
    'uscita',
    cat.id,
    con.id,
    'Affitto mensile'
FROM categorie cat, conti con
WHERE cat.nome = 'Casa' AND con.nome = 'Conto Corrente'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione)
SELECT 
    '2026-02-10 14:00:00',
    -100.00,
    'uscita',
    cat.id,
    con.id,
    'Bolletta elettricità + gas'
FROM categorie cat, conti con
WHERE cat.nome = 'Casa' AND con.nome = 'Conto Corrente'
LIMIT 1;

-- ============================================================================
-- OBIETTIVI DI RISPARMIO
-- ============================================================================

-- Obiettivo 1: Vacanze Estate 2026 (40% completato)
INSERT OR IGNORE INTO obiettivi_risparmio (nome, importo_target, data_target, priorita, descrizione)
VALUES (
    'Vacanze Estate 2026',
    3000.00,
    '2026-06-15',
    5,
    'Viaggio di 2 settimane in Grecia'
);

-- Obiettivo 2: Fondo Emergenza (56% completato)
INSERT OR IGNORE INTO obiettivi_risparmio (nome, importo_target, priorita, descrizione)
VALUES (
    'Fondo Emergenza',
    5000.00,
    5,
    'Fondo di sicurezza per imprevisti (3-6 mesi di spese)'
);

-- Obiettivo 3: Nuovo MacBook (32% completato)
INSERT OR IGNORE INTO obiettivi_risparmio (nome, importo_target, data_target, priorita, descrizione)
VALUES (
    'Nuovo MacBook Pro',
    2500.00,
    '2026-09-30',
    4,
    'MacBook Pro 14" per lavoro'
);

-- Obiettivo 4: Auto Nuova (30% completato)
INSERT OR IGNORE INTO obiettivi_risparmio (nome, importo_target, data_target, priorita, descrizione)
VALUES (
    'Auto Nuova',
    15000.00,
    '2027-03-31',
    3,
    'Anticipo per auto elettrica o ibrida'
);

-- ============================================================================
-- CONTRIBUTI AGLI OBIETTIVI (Movimenti di entrata)
-- ============================================================================

-- Contributi Vacanze Estate (1200€ su 3000€)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-01-15 00:00:00',
    300.00,
    'entrata',
    con.id,
    'Acconto vacanze - Gennaio',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Vacanze Estate 2026'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-02-01 00:00:00',
    400.00,
    'entrata',
    con.id,
    'Acconto vacanze - Febbraio',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Vacanze Estate 2026'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-02-15 00:00:00',
    500.00,
    'entrata',
    con.id,
    'Bonus San Valentino risparmiato',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Vacanze Estate 2026'
LIMIT 1;

-- Contributi Fondo Emergenza (2800€ su 5000€)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2025-11-01 00:00:00',
    1000.00,
    'entrata',
    con.id,
    'Primo versamento fondo emergenza',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Fondo Emergenza'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2025-12-01 00:00:00',
    600.00,
    'entrata',
    con.id,
    'Versamento mensile fondo emergenza',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Fondo Emergenza'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-01-01 00:00:00',
    600.00,
    'entrata',
    con.id,
    'Versamento mensile fondo emergenza',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Fondo Emergenza'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-02-01 00:00:00',
    600.00,
    'entrata',
    con.id,
    'Versamento mensile fondo emergenza',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Fondo Emergenza'
LIMIT 1;

-- Contributi MacBook (800€ su 2500€)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-01-10 00:00:00',
    400.00,
    'entrata',
    con.id,
    'Risparmio MacBook - Gennaio',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Nuovo MacBook Pro'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-02-10 00:00:00',
    400.00,
    'entrata',
    con.id,
    'Risparmio MacBook - Febbraio',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Nuovo MacBook Pro'
LIMIT 1;

-- Contributi Auto Nuova (4500€ su 15000€)
INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2025-10-01 00:00:00',
    1500.00,
    'entrata',
    con.id,
    'Primo versamento auto - bonus',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Auto Nuova'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2025-12-01 00:00:00',
    1000.00,
    'entrata',
    con.id,
    'Tredicesima destinata ad auto',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Auto Nuova'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-01-01 00:00:00',
    1000.00,
    'entrata',
    con.id,
    'Gennaio - risparmio auto',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Auto Nuova'
LIMIT 1;

INSERT OR IGNORE INTO movimenti (data, importo, tipo, conto_id, descrizione, obiettivo_id)
SELECT 
    '2026-02-01 00:00:00',
    1000.00,
    'entrata',
    con.id,
    'Febbraio - risparmio auto',
    ob.id
FROM conti con, obiettivi_risparmio ob
WHERE con.nome = 'Risparmio' AND ob.nome = 'Auto Nuova'
LIMIT 1;

-- ============================================================================
-- Note finali
-- ============================================================================
-- 
-- Per applicare questo seed:
-- sqlite3 data/lume.db < database/seeds/005_budget_obiettivi_examples.sql
--
-- Questo seed crea:
-- - 4 budget mensili con diversi livelli di utilizzo
-- - Movimenti di spesa per testare i budget
-- - 4 obiettivi di risparmio con diverse priorità
-- - Contributi (movimenti di entrata) collegati agli obiettivi
--
-- I dati sono realistici e permettono di testare:
-- - Budget in stato OK, Attenzione e Superato
-- - Calcolo percentuale utilizzo
-- - Dashboard riepilogo
-- - Obiettivi con progress tracking
-- - Calcolo velocità risparmio mensile
-- - Giorni rimanenti per raggiungere target
