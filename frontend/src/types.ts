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
}

export interface Categoria {
  id?: number
  nome: string
  tipo: string
  icona?: string
  colore?: string
  categoria_padre_id?: number
}
