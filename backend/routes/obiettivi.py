"""API endpoints per gestione obiettivi di risparmio"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/obiettivi", tags=["Obiettivi"])


class ObiettivoCreate(BaseModel):
    nome: str
    importo_target: float
    importo_attuale: float = 0.0
    data_target: Optional[str] = None
    priorita: int = 3


class ObiettivoUpdate(BaseModel):
    nome: Optional[str] = None
    importo_target: Optional[float] = None
    importo_attuale: Optional[float] = None
    data_target: Optional[str] = None
    priorita: Optional[int] = None
    completato: Optional[bool] = None


class ImportoModifica(BaseModel):
    importo: float


@router.get("")
async def list_obiettivi(completati: bool = False):
    """Lista tutti gli obiettivi"""
    with get_db_connection() as conn:
        if completati:
            cursor = conn.execute(
                "SELECT * FROM obiettivi_risparmio ORDER BY data_creazione DESC"
            )
        else:
            cursor = conn.execute(
                """
                SELECT * FROM obiettivi_risparmio 
                WHERE completato = 0
                ORDER BY priorita ASC, data_target ASC
                """
            )
        
        return [dict_from_row(row) for row in cursor.fetchall()]


@router.get("/tutti")
async def list_obiettivi_tutti():
    """Lista tutti gli obiettivi (attivi e completati)"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT * FROM obiettivi_risparmio 
            ORDER BY completato ASC, priorita ASC, data_target ASC
            """
        )
        
        return [dict_from_row(row) for row in cursor.fetchall()]


@router.get("/{obiettivo_id}")
async def get_obiettivo(obiettivo_id: int):
    """Ottiene dettagli di un obiettivo specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        return dict_from_row(row)


@router.post("", status_code=201)
async def create_obiettivo(obiettivo: ObiettivoCreate):
    """Crea un nuovo obiettivo"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO obiettivi_risparmio 
            (nome, importo_target, importo_attuale, data_target, priorita)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                obiettivo.nome,
                obiettivo.importo_target,
                obiettivo.importo_attuale,
                obiettivo.data_target,
                obiettivo.priorita
            )
        )
        
        conn.commit()
        obiettivo_id = cursor.lastrowid
        
        return await get_obiettivo(obiettivo_id)


@router.put("/{obiettivo_id}")
async def update_obiettivo(obiettivo_id: int, obiettivo: ObiettivoUpdate):
    """Aggiorna un obiettivo esistente"""
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute(
            "SELECT id FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        # Prepara update
        updates = []
        params = []
        
        for field, value in obiettivo.dict(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
        
        params.append(obiettivo_id)
        
        conn.execute(
            f"UPDATE obiettivi_risparmio SET {', '.join(updates)} WHERE id = ?",
            params
        )
        
        conn.commit()
        
        return await get_obiettivo(obiettivo_id)


@router.delete("/{obiettivo_id}")
async def delete_obiettivo(obiettivo_id: int):
    """Elimina un obiettivo"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT id FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        conn.execute("DELETE FROM obiettivi_risparmio WHERE id = ?", (obiettivo_id,))
        conn.commit()
        
        return {"message": "Obiettivo eliminato con successo"}


@router.post("/{obiettivo_id}/aggiungi")
async def aggiungi_importo(obiettivo_id: int, modifica: ImportoModifica):
    """Aggiunge fondi a un obiettivo"""
    with get_db_connection() as conn:
        # Recupera obiettivo
        cursor = conn.execute(
            "SELECT importo_attuale, importo_target FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        importo_attuale, importo_target = row
        nuovo_importo = importo_attuale + modifica.importo
        
        # Verifica se obiettivo completato
        completato = nuovo_importo >= importo_target
        
        # Aggiorna
        conn.execute(
            "UPDATE obiettivi_risparmio SET importo_attuale = ?, completato = ? WHERE id = ?",
            (nuovo_importo, completato, obiettivo_id)
        )
        
        conn.commit()
        
        return await get_obiettivo(obiettivo_id)


@router.post("/{obiettivo_id}/rimuovi")
async def rimuovi_importo(obiettivo_id: int, modifica: ImportoModifica):
    """Rimuove fondi da un obiettivo"""
    with get_db_connection() as conn:
        # Recupera obiettivo
        cursor = conn.execute(
            "SELECT importo_attuale, importo_target FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        importo_attuale, importo_target = row
        nuovo_importo = max(0, importo_attuale - modifica.importo)
        
        # Verifica se obiettivo ancora completato
        completato = nuovo_importo >= importo_target
        
        # Aggiorna
        conn.execute(
            "UPDATE obiettivi_risparmio SET importo_attuale = ?, completato = ? WHERE id = ?",
            (nuovo_importo, completato, obiettivo_id)
        )
        
        conn.commit()
        
        return await get_obiettivo(obiettivo_id)
