from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TipoMovimento(str, Enum):
    """Tipi di movimento finanziario"""
    ENTRATA = "entrata"
    USCITA = "uscita"
    TRASFERIMENTO = "trasferimento"


class TipoConto(str, Enum):
    """Tipi di conto"""
    CORRENTE = "corrente"
    RISPARMIO = "risparmio"
    CARTA_CREDITO = "carta_credito"
    CONTANTI = "contanti"
    INVESTIMENTO = "investimento"


class TipoBene(str, Enum):
    """Tipi di bene"""
    VEICOLO = "veicolo"
    ELETTRODOMESTICO = "elettrodomestico"
    IMMOBILE = "immobile"
    ALTRO = "altro"


class TipoCarburante(str, Enum):
    """Tipi di carburante per veicoli"""
    BENZINA = "benzina"
    DIESEL = "diesel"
    ELETTRICO = "elettrico"
    IBRIDO = "ibrido"
    GPL = "gpl"


class Movimento(BaseModel):
    """Modello movimento finanziario"""
    id: Optional[int] = None
    data: datetime
    importo: float = Field(gt=0, description="Importo movimento (sempre positivo)")
    tipo: TipoMovimento
    categoria_id: Optional[int] = None
    conto_id: int
    conto_destinazione_id: Optional[int] = None  # Per trasferimenti
    descrizione: str
    note: Optional[str] = None
    ricorrente: bool = False
    creato_il: Optional[datetime] = None
    modificato_il: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "data": "2026-02-24T19:00:00",
                "importo": 50.00,
                "tipo": "uscita",
                "categoria_id": 1,
                "conto_id": 1,
                "descrizione": "Spesa settimanale",
                "note": "Carrefour"
            }
        }


class Conto(BaseModel):
    """Modello conto bancario o portafoglio"""
    id: Optional[int] = None
    nome: str
    tipo: TipoConto
    saldo: float = 0.0
    valuta: str = "EUR"
    descrizione: Optional[str] = None
    attivo: bool = True
    creato_il: Optional[datetime] = None
    modificato_il: Optional[datetime] = None


class Categoria(BaseModel):
    """Modello categoria entrata/uscita"""
    id: Optional[int] = None
    nome: str
    tipo: str  # entrata, uscita
    categoria_padre_id: Optional[int] = None
    icona: Optional[str] = None
    colore: Optional[str] = None
    descrizione: Optional[str] = None
    creato_il: Optional[datetime] = None


class Budget(BaseModel):
    """Modello budget per categoria"""
    id: Optional[int] = None
    categoria_id: int
    importo: float = Field(gt=0)
    periodo: str  # giornaliero, settimanale, mensile, annuale
    data_inizio: datetime
    data_fine: Optional[datetime] = None
    attivo: bool = True
    note: Optional[str] = None
    creato_il: Optional[datetime] = None
    modificato_il: Optional[datetime] = None


class Bene(BaseModel):
    """Modello bene fisico (auto, elettrodomestico, ecc.)"""
    id: Optional[int] = None
    nome: str
    tipo: TipoBene
    data_acquisto: Optional[datetime] = None
    prezzo_acquisto: Optional[float] = None
    
    # Campi veicolo
    veicolo_tipo_carburante: Optional[TipoCarburante] = None
    veicolo_consumo_medio: Optional[float] = None  # L/100km o kWh/100km
    veicolo_costo_manutenzione_per_km: Optional[float] = None
    
    # Campi elettrodomestico
    elettrodomestico_potenza: Optional[float] = None  # Watt
    elettrodomestico_ore_medie_giorno: Optional[float] = None
    
    # Generale
    durata_anni_stimata: Optional[int] = None
    tasso_ammortamento: Optional[float] = None
    note: Optional[str] = None
    attivo: bool = True
    creato_il: Optional[datetime] = None
    modificato_il: Optional[datetime] = None


class ScomposizioneCosto(BaseModel):
    """Modello scomposizione dettagliata costo"""
    id: Optional[int] = None
    movimento_id: int
    bene_id: Optional[int] = None
    nome_componente: str  # es: 'carburante', 'usura', 'elettricita'
    valore_componente: float
    unita: Optional[str] = None  # es: 'EUR', 'km', 'kWh'
    percentuale_totale: Optional[float] = None
    metodo_calcolo: Optional[str] = None
    parametri_calcolo: Optional[dict] = None
    creato_il: Optional[datetime] = None


class ObiettivoRisparmio(BaseModel):
    """Modello obiettivo di risparmio"""
    id: Optional[int] = None
    nome: str
    importo_target: float = Field(gt=0)
    importo_attuale: float = 0.0
    data_target: Optional[datetime] = None
    conto_id: Optional[int] = None
    priorita: int = Field(ge=1, le=5, default=1)
    completato: bool = False
    note: Optional[str] = None
    creato_il: Optional[datetime] = None
    modificato_il: Optional[datetime] = None