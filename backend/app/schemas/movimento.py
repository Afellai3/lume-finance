from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class MovimentoBase(BaseModel):
    data: date = Field(..., description="Date of the movement")
    importo: float = Field(..., gt=0, description="Amount in EUR")
    tipo: str = Field(..., pattern="^(entrata|uscita)$", description="Type: 'entrata' or 'uscita'")
    categoria_id: Optional[int] = Field(None, description="Category ID")
    conto_id: Optional[int] = Field(None, description="Account ID")
    budget_id: Optional[int] = Field(None, description="Budget ID for expenses")
    obiettivo_id: Optional[int] = Field(None, description="Savings goal ID for income")  # NEW
    descrizione: str = Field(..., min_length=1, max_length=500, description="Movement description")
    ricorrente: bool = Field(False, description="Is this a recurring movement")
    bene_id: Optional[int] = Field(None, description="Asset ID for cost breakdown")
    km_percorsi: Optional[float] = Field(None, gt=0, description="Kilometers driven (for vehicles)")
    prezzo_carburante_al_litro: Optional[float] = Field(None, gt=0, description="Fuel price per liter")
    ore_utilizzo: Optional[float] = Field(None, gt=0, description="Hours of usage (for appliances)")
    tariffa_kwh: Optional[float] = Field(None, gt=0, description="kWh tariff for appliances")

class MovimentoCreate(MovimentoBase):
    pass

class MovimentoUpdate(MovimentoBase):
    data: Optional[date] = None
    importo: Optional[float] = None
    tipo: Optional[str] = None
    descrizione: Optional[str] = None

class MovimentoResponse(MovimentoBase):
    id: int
    categoria: Optional[dict] = None
    conto: Optional[dict] = None
    budget: Optional[dict] = None
    obiettivo: Optional[dict] = None  # NEW: Include goal info in response
    bene: Optional[dict] = None
    scomposizione: Optional[dict] = None
    
    class Config:
        from_attributes = True

class MovimentoListResponse(BaseModel):
    items: list[MovimentoResponse]
    total: int
    page: int
    per_page: int
    pages: int
