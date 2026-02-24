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
  data_acquisto?: string
  prezzo_acquisto?: number
  veicolo_tipo_carburante?: string
  veicolo_consumo_medio?: number
  veicolo_costo_manutenzione_per_km?: number
  elettrodomestico_potenza?: number
  elettrodomestico_ore_medie_giorno?: number
  durata_anni_stimata?: number
  tasso_ammortamento?: number
  attivo: boolean
}

export interface Categoria {
  id?: number
  nome: string
  tipo: string
  icona?: string
  colore?: string
}

export interface Movimento {
  id?: number
  data: string
  importo: number
  tipo: string
  categoria_id?: number
  conto_id: number
  conto_destinazione_id?: number
  descrizione: string
  note?: string
  ricorrente: boolean
}

export interface ScomposizioneCosto {
  id?: number
  movimento_id: number
  bene_id?: number
  nome_componente: string
  valore_componente: number
  unita?: string
  percentuale_totale?: number
  metodo_calcolo?: string
  parametri_calcolo?: string
}
