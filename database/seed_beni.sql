-- Seed data per beni (veicoli, immobili, attrezzature)
-- Inserire solo se la tabella beni è vuota

-- Pulisci beni esistenti (solo per test)
-- DELETE FROM movimenti WHERE bene_id IS NOT NULL;
-- DELETE FROM beni;

-- ============================================================================
-- VEICOLO: Fiat Panda 2020
-- ============================================================================

INSERT OR IGNORE INTO beni (
    id,
    nome,
    tipo,
    marca,
    modello,
    data_acquisto,
    prezzo_acquisto,
    stato,
    valore_residuo,
    durata_anni_stimata,
    veicolo_targa,
    veicolo_km_iniziali,
    veicolo_km_attuali,
    veicolo_tipo_carburante,
    veicolo_consumo_medio,
    veicolo_assicurazione_annuale,
    veicolo_bollo_annuale
) VALUES (
    1,
    'Fiat Panda City',
    'veicolo',
    'Fiat',
    'Panda 1.2 Easy',
    '2020-03-15',
    12500.00,
    'attivo',
    5000.00,
    10,
    'AB123CD',
    0,
    45000,
    'Benzina',
    5.8,
    650.00,
    220.00
);

-- Movimenti per Fiat Panda
INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione, bene_id) VALUES
-- Rifornimenti (categoria 2: Trasporti)
('2024-01-15', -65.00, 'uscita', 2, 1, 'Rifornimento Eni - 45 litri', 1),
('2024-02-10', -70.00, 'uscita', 2, 1, 'Rifornimento Q8 - 48 litri', 1),
('2024-03-05', -68.00, 'uscita', 2, 1, 'Rifornimento Agip - 46 litri', 1),
('2024-04-20', -72.00, 'uscita', 2, 1, 'Rifornimento Tamoil - 50 litri', 1),
('2024-05-12', -65.00, 'uscita', 2, 1, 'Rifornimento Shell - 44 litri', 1),
('2024-06-08', -69.00, 'uscita', 2, 1, 'Rifornimento IP - 47 litri', 1),

-- Manutenzione (categoria 2: Trasporti)
('2024-01-20', -180.00, 'uscita', 2, 1, 'Tagliando ordinario - Officina Rossi', 1),
('2024-04-15', -85.00, 'uscita', 2, 1, 'Cambio olio motore', 1),
('2024-06-10', -320.00, 'uscita', 2, 1, 'Sostituzione pneumatici anteriori', 1),

-- Assicurazione (categoria 4: Utilità)
('2024-03-15', -650.00, 'uscita', 4, 1, 'Assicurazione auto annuale', 1),

-- Bollo (categoria 4: Utilità)
('2024-01-10', -220.00, 'uscita', 4, 1, 'Bollo auto 2024', 1);

-- ============================================================================
-- IMMOBILE: Appartamento Roma
-- ============================================================================

INSERT OR IGNORE INTO beni (
    id,
    nome,
    tipo,
    data_acquisto,
    prezzo_acquisto,
    stato,
    valore_residuo,
    durata_anni_stimata,
    immobile_indirizzo,
    immobile_mq,
    immobile_valore_catastale,
    immobile_spese_condominiali_mensili,
    immobile_imu_annuale
) VALUES (
    2,
    'Casa Roma',
    'immobile',
    '2018-06-01',
    180000.00,
    'attivo',
    200000.00,
    30,
    'Via dei Colli Albani, 45 - Roma (RM)',
    85,
    150000.00,
    150.00,
    1200.00
);

-- Movimenti per Immobile
INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione, bene_id) VALUES
-- Spese condominiali (categoria 3: Casa)
('2024-01-15', -150.00, 'uscita', 3, 1, 'Spese condominiali gennaio', 2),
('2024-02-15', -150.00, 'uscita', 3, 1, 'Spese condominiali febbraio', 2),
('2024-03-15', -150.00, 'uscita', 3, 1, 'Spese condominiali marzo', 2),
('2024-04-15', -150.00, 'uscita', 3, 1, 'Spese condominiali aprile', 2),
('2024-05-15', -150.00, 'uscita', 3, 1, 'Spese condominiali maggio', 2),
('2024-06-15', -150.00, 'uscita', 3, 1, 'Spese condominiali giugno', 2),

-- IMU (categoria 4: Utilità)
('2024-06-16', -600.00, 'uscita', 4, 1, 'IMU prima rata 2024', 2),

-- Manutenzioni (categoria 3: Casa)
('2024-02-10', -450.00, 'uscita', 3, 1, 'Riparazione caldaia', 2),
('2024-04-05', -280.00, 'uscita', 3, 1, 'Tinteggiatura camera da letto', 2),
('2024-05-20', -120.00, 'uscita', 3, 1, 'Idraulico per perdita rubinetto', 2);

-- ============================================================================
-- ATTREZZATURA: MacBook Pro
-- ============================================================================

INSERT OR IGNORE INTO beni (
    id,
    nome,
    tipo,
    marca,
    modello,
    data_acquisto,
    prezzo_acquisto,
    stato,
    valore_residuo,
    durata_anni_stimata,
    attrezzatura_serial_number,
    attrezzatura_ore_utilizzo
) VALUES (
    3,
    'MacBook Pro Lavoro',
    'attrezzatura',
    'Apple',
    'MacBook Pro 14" M1 Pro',
    '2021-11-10',
    2800.00,
    'attivo',
    1200.00,
    5,
    'C02XL1234567',
    3500
);

-- Movimenti per MacBook
INSERT OR IGNORE INTO movimenti (data, importo, tipo, categoria_id, conto_id, descrizione, bene_id) VALUES
-- Software e accessori (categoria 5: Altro)
('2021-11-10', -89.00, 'uscita', 5, 1, 'AppleCare+ 3 anni', 3),
('2021-12-01', -45.00, 'uscita', 5, 1, 'Custodia protettiva', 3),
('2022-01-15', -120.00, 'uscita', 5, 1, 'Adobe Creative Cloud annuale', 3),
('2022-06-10', -35.00, 'uscita', 5, 1, 'Adattatore USB-C', 3),
('2023-01-15', -120.00, 'uscita', 5, 1, 'Adobe Creative Cloud annuale', 3),
('2024-01-15', -120.00, 'uscita', 5, 1, 'Adobe Creative Cloud annuale', 3);
