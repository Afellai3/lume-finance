from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class Transaction(BaseModel):
    """Base transaction model"""
    id: Optional[int] = None
    date: datetime
    amount: float = Field(gt=0, description="Transaction amount (always positive)")
    type: TransactionType
    category: str
    description: str
    account_id: int
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2026-02-24T19:00:00",
                "amount": 50.00,
                "type": "expense",
                "category": "groceries",
                "description": "Weekly shopping",
                "account_id": 1,
                "notes": "Carrefour"
            }
        }


class Account(BaseModel):
    """Bank account or wallet"""
    id: Optional[int] = None
    name: str
    type: str  # checking, savings, credit_card, cash
    balance: float = 0.0
    currency: str = "EUR"
    created_at: Optional[datetime] = None


class Budget(BaseModel):
    """Budget for a specific category"""
    id: Optional[int] = None
    category: str
    amount: float = Field(gt=0)
    period: str  # monthly, yearly
    start_date: datetime
    end_date: Optional[datetime] = None


class CostBreakdown(BaseModel):
    """Detailed cost breakdown component"""
    id: Optional[int] = None
    transaction_id: int
    component_name: str  # e.g., "fuel", "wear", "electricity"
    component_value: float
    unit: str  # e.g., "km", "kWh", "EUR"
    calculation_params: Optional[dict] = None  # Store calculation parameters