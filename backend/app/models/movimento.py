from sqlalchemy import Column, Integer, Float, String, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Movimento(Base):
    __tablename__ = "movimenti"
    
    id = Column(Integer, primary_key=True, index=True)
    data = Column(Date, nullable=False, index=True)
    importo = Column(Float, nullable=False)
    tipo = Column(String(10), nullable=False)  # 'entrata' o 'uscita'
    categoria_id = Column(Integer, ForeignKey('categorie.id'), nullable=True)
    conto_id = Column(Integer, ForeignKey('conti.id'), nullable=True)
    budget_id = Column(Integer, ForeignKey('budget.id'), nullable=True)
    obiettivo_id = Column(Integer, ForeignKey('obiettivi_risparmio.id'), nullable=True)  # NEW: Link to savings goal
    descrizione = Column(String(500), nullable=False)
    ricorrente = Column(Boolean, default=False)
    bene_id = Column(Integer, ForeignKey('beni.id'), nullable=True)
    km_percorsi = Column(Float, nullable=True)
    prezzo_carburante_al_litro = Column(Float, nullable=True)
    ore_utilizzo = Column(Float, nullable=True)
    tariffa_kwh = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    categoria = relationship("Categoria", back_populates="movimenti")
    conto = relationship("Conto", back_populates="movimenti")
    budget = relationship("Budget", back_populates="movimenti")
    obiettivo = relationship("ObiettivoRisparmio", back_populates="movimenti")  # NEW: Relationship to goal
    bene = relationship("Bene", back_populates="movimenti")
