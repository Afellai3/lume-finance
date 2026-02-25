from datetime import datetime, date
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


class FrequenzaRicorrenza(str, Enum):
    """Frequenza per movimenti ricorrenti"""
    GIORNALIERA = "giornaliera"
    SETTIMANALE = "settimanale"
    MENSILE = "mensile"
    ANNUALE = "annuale"


class TipoCategoria(str, Enum):
    """Tipo di categoria"""
    ENTRATA = "entrata"
    USCITA = "uscita"


class Movimento(BaseModel):
    """Modello movimento finanziario"""
    id: Optional[int] = None
    data: datetime
    importo: float = Field(gt=0, description="Importo movimento (sempre positivo)")
    tipo: TipoMovimento
    categoria_id: Optional[int] = None
    conto_id: int
    conto_destinazione_id: Optional[int] = None  # Per trasferimenti
    obiettivo_id: Optional[int] = Field(None, description="ID obiettivo risparmio (solo per entrate)")  # NEW
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


class MovimentoRicorrente(BaseModel):
    """Modello movimento ricorrente - template per generazione automatica"""
    id: Optional[int] = None
    
    # Template movimento
    descrizione: str
    importo: float = Field(gt=0)
    tipo: TipoMovimento
    
    # Ricorrenza
    frequenza: FrequenzaRicorrenza
    giorno_mese: Optional[int] = Field(None, ge=1, le=31, description="Giorno del mese (1-31)")
    giorno_settimana: Optional[int] = Field(None, ge=0, le=6, description="Giorno settimana (0=Lun, 6=Dom)")
    mese: Optional[int] = Field(None, ge=1, le=12, description="Mese per frequenza annuale (1-12)")
    
    # Scheduling
    data_inizio: date
    data_fine: Optional[date] = None
    prossima_data: date
    
    # Stato
    attivo: bool = True
    
    # Collegamenti
    conto_id: Optional[int] = None
    categoria_id: Optional[int] = None
    budget_id: Optional[int] = None
    obiettivo_id: Optional[int] = None
    bene_id: Optional[int] = None
    
    # Metadata
    note: Optional[str] = None
    data_creazione: Optional[datetime] = None
    data_modifica: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "descrizione": "Stipendio mensile",
                "importo": 2500.00,
                "tipo": "entrata",
                "frequenza": "mensile",
                "giorno_mese": 27,
                "data_inizio": "2026-01-01",
                "prossima_data": "2026-02-27",
                "conto_id": 1,
                "categoria_id": 1,
                "attivo": True
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
    """Modello categoria entrata/uscita personalizzabile"""
    id: Optional[int] = None
    nome: str = Field(min_length=2, max_length=50, description="Nome categoria")
    tipo: TipoCategoria
    categoria_padre_id: Optional[int] = None
    icona: Optional[str] = Field(None, max_length=10, description="Emoji o icona")
    colore: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Colore esadecimale")
    descrizione: Optional[str] = None
    is_system: bool = False  # Categorie di sistema non modificabili
    creato_il: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "nome": "Hobby",
                "tipo": "uscita",
                "icona": "🎮",
                "colore": "#9333EA",
                "descrizione": "Spese per hobby e tempo libero"
            }
        }


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
