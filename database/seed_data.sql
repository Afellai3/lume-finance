-- Lume Finance - Dati di Esempio
-- Dati campione per testing e sviluppo

-- ============================================================================
-- CATEGORIE PREDEFINITE
-- ============================================================================

-- Categorie entrate
INSERT INTO categorie (nome, tipo, icona, colore) VALUES
('Stipendio', 'entrata', '💼', '#10b981'),
('Freelance', 'entrata', '💻', '#34d399'),
('Investimenti', 'entrata', '📈', '#6ee7b7'),
('Altre Entrate', 'entrata', '💰', '#a7f3d0');

-- Categorie uscite - Principali
INSERT INTO categorie (nome, tipo, icona, colore) VALUES
('Casa', 'uscita', '🏠', '#ef4444'),
('Trasporti', 'uscita', '🚗', '#f97316'),
('Cibo e Ristorazione', 'uscita', '🍽️', '#f59e0b'),
('Utenze', 'uscita', '⚡', '#eab308'),
('Salute', 'uscita', '🏥', '#84cc16'),
('Intrattenimento', 'uscita', '🎮', '#22c55e'),
('Shopping', 'uscita', '🛍️', '#14b8a6'),
('Istruzione', 'uscita', '📚', '#06b6d4'),
('Cura Personale', 'uscita', '💇', '#0ea5e9'),
('Assicurazioni', 'uscita', '🛡️', '#3b82f6'),
('Risparmi', 'uscita', '💎', '#6366f1'),
('Altre Spese', 'uscita', '📦', '#8b5cf6');

-- Sottocategorie uscite
INSERT INTO categorie (nome, tipo, categoria_padre_id, icona, colore) VALUES
-- Sottocategorie Trasporti
('Carburante', 'uscita', (SELECT id FROM categorie WHERE nome = 'Trasporti'), '⛽', '#fb923c'),
('Manutenzione Auto', 'uscita', (SELECT id FROM categorie WHERE nome = 'Trasporti'), '🔧', '#fdba74'),
('Trasporto Pubblico', 'uscita', (SELECT id FROM categorie WHERE nome = 'Trasporti'), '🚌', '#fed7aa'),
('Parcheggio', 'uscita', (SELECT id FROM categorie WHERE nome = 'Trasporti'), '🅿️', '#ffedd5'),

-- Sottocategorie Cibo
('Spesa Alimentare', 'uscita', (SELECT id FROM categorie WHERE nome = 'Cibo e Ristorazione'), '🛒', '#fbbf24'),
('Ristoranti', 'uscita', (SELECT id FROM categorie WHERE nome = 'Cibo e Ristorazione'), '🍴', '#fcd34d'),
('Caffè e Snack', 'uscita', (SELECT id FROM categorie WHERE nome = 'Cibo e Ristorazione'), '☕', '#fde68a'),

-- Sottocategorie Utenze
('Elettricità', 'uscita', (SELECT id FROM categorie WHERE nome = 'Utenze'), '💡', '#facc15'),
('Acqua', 'uscita', (SELECT id FROM categorie WHERE nome = 'Utenze'), '💧', '#fde047'),
('Gas', 'uscita', (SELECT id FROM categorie WHERE nome = 'Utenze'), '🔥', '#fef08a'),
('Internet', 'uscita', (SELECT id FROM categorie WHERE nome = 'Utenze'), '🌐', '#fef9c3');

-- ============================================================================
-- CONTI DI ESEMPIO
-- ============================================================================

INSERT INTO conti (nome, tipo, saldo, valuta, descrizione) VALUES
('Conto Corrente Principale', 'corrente', 2500.00, 'EUR', 'Conto bancario principale'),
('Conto Risparmio', 'risparmio', 10000.00, 'EUR', 'Fondo emergenze e risparmi'),
('Carta di Credito', 'carta_credito', -450.00, 'EUR', 'Carta di credito Visa'),
('Portafoglio Contanti', 'contanti', 150.00, 'EUR', 'Contanti fisici');

-- ============================================================================
-- BENI DI ESEMPIO
-- ============================================================================

INSERT INTO beni (nome, tipo, data_acquisto, prezzo_acquisto, veicolo_tipo_carburante, veicolo_consumo_medio, veicolo_costo_manutenzione_per_km, durata_anni_stimata, tasso_ammortamento) VALUES
('Fiat Panda 2020', 'veicolo', '2020-03-15', 12000.00, 'benzina', 5.5, 0.08, 10, 15.0);

INSERT INTO beni (nome, tipo, data_acquisto, prezzo_acquisto, elettrodomestico_potenza, elettrodomestico_ore_medie_giorno, durata_anni_stimata) VALUES
('Frigorifero Samsung', 'elettrodomestico', '2023-06-10', 650.00, 150, 24, 12),
('Lavatrice LG', 'elettrodomestico', '2022-09-20', 450.00, 2000, 1.5, 10),
('Lavastoviglie Bosch', 'elettrodomestico', '2023-01-05', 550.00, 1800, 2, 10);

-- ============================================================================
-- CENTRI DI COSTO DI ESEMPIO
-- ============================================================================

INSERT INTO centri_costo (nome, tipo, descrizione) VALUES
('Cucina', 'stanza', 'Area cucina - elettrodomestici e utenze'),
('Soggiorno', 'stanza', 'Soggiorno - intrattenimento e utenze'),
('Camera da Letto', 'stanza', 'Camera da letto - climatizzazione'),
('Pendolarismo', 'attivita', 'Costi spostamenti casa-lavoro'),
('Viaggi Leisure', 'attivita', 'Viaggi weekend e vacanze');

-- ============================================================================
-- BUDGET DI ESEMPIO
-- ============================================================================

INSERT INTO budget (categoria_id, importo, periodo, data_inizio) VALUES
((SELECT id FROM categorie WHERE nome = 'Cibo e Ristorazione'), 400.00, 'mensile', '2026-02-01'),
((SELECT id FROM categorie WHERE nome = 'Trasporti'), 200.00, 'mensile', '2026-02-01'),
((SELECT id FROM categorie WHERE nome = 'Intrattenimento'), 150.00, 'mensile', '2026-02-01'),
((SELECT id FROM categorie WHERE nome = 'Utenze'), 180.00, 'mensile', '2026-02-01');

-- ============================================================================
-- OBIETTIVI DI RISPARMIO DI ESEMPIO
-- ============================================================================

INSERT INTO obiettivi_risparmio (nome, importo_target, importo_attuale, data_target, priorita) VALUES
('Fondo Emergenze', 15000.00, 10000.00, '2026-12-31', 5),
('Nuovo Laptop', 1200.00, 450.00, '2026-06-30', 3),
('Vacanza Estiva', 2500.00, 800.00, '2026-07-01', 2),
('Ristrutturazione Casa', 8000.00, 1200.00, '2027-03-31', 4);