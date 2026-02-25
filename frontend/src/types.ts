// Tipi comuni per l'applicazione

export interface Conto {
  id?: number
  nome: string
  tipo: string
  saldo: number
  valuta: string
  descrizione?: string
  attivo: boolean
}

export interface Bene {
  id?: number
  nome: string
  tipo: string
  data_acquisto: string
  prezzo_acquisto: number
  durata_anni_stimata?: number
  tasso_ammortamento?: number
  // Veicolo
  veicolo_tipo_carburante?: string
  veicolo_consumo_medio?: number
  veicolo_costo_manutenzione_per_km?: number
  // Elettrodomestico
  elettrodomestico_potenza?: number
  elettrodomestico_ore_medie_giorno?: number
}

export interface Movimento {
  id?: number
  data: string
  importo: number
  tipo: string
  categoria_id?: number
  conto_id?: number
  descrizione: string
  ricorrente: boolean
  categoria_nome?: string
  categoria_icona?: string
  conto_nome?: string
  // Scomposizione costi
  bene_id?: number
  bene_nome?: string
  bene_tipo?: string
  km_percorsi?: number
  ore_utilizzo?: number
  scomposizione_json?: string
}

export interface Categoria {
  id?: number
  nome: string
  tipo: string
  icona?: string
  colore?: string
  categoria_padre_id?: number
}

export interface Budget {
  id?: number
  categoria_id?: number
  categoria_nome?: string
  categoria_icona?: string
  categoria_colore?: string
  importo: number
  periodo: string
  data_inizio?: string
  attivo?: boolean
  spesa_corrente: number
  percentuale_utilizzo: number
  rimanente: number
  stato?: 'ok' | 'attenzione' | 'superato'
}

export interface Obiettivo {
  id?: number
  nome: string
  importo_target: number
  importo_attuale: number
  data_target: string | null
  priorita: number
  completato: boolean
  data_creazione?: string
}
