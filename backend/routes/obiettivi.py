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


def calculate_obiettivo_importo_attuale(conn, obiettivo_id: int) -> float:
    """Calculate actual amount from movements linked to this obiettivo."""
    cursor = conn.execute(
        """
        SELECT SUM(importo) FROM movimenti 
        WHERE obiettivo_id = ? AND tipo = 'entrata'
        """,
        (obiettivo_id,)
    )
    result = cursor.fetchone()[0]
    return result if result is not None else 0.0


def enrich_obiettivo_with_calculated_amount(conn, obiettivo: dict) -> dict:
    """Add calculated importo_attuale to obiettivo."""
    calculated_amount = calculate_obiettivo_importo_attuale(conn, obiettivo['id'])
    return {
        **obiettivo,
        'importo_attuale': calculated_amount
    }


@router.get("")
async def list_obiettivi(completati: bool = False):
    """Lista tutti gli obiettivi con importo_attuale calcolato dai movimenti"""
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
        
        obiettivi = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Calculate importo_attuale from movements for each obiettivo
        return [enrich_obiettivo_with_calculated_amount(conn, obj) for obj in obiettivi]


@router.get("/tutti")
async def list_obiettivi_tutti():
    """Lista tutti gli obiettivi (attivi e completati) con importo_attuale calcolato"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT * FROM obiettivi_risparmio 
            ORDER BY completato ASC, priorita ASC, data_target ASC
            """
        )
        
        obiettivi = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Calculate importo_attuale from movements for each obiettivo
        return [enrich_obiettivo_with_calculated_amount(conn, obj) for obj in obiettivi]


@router.get("/{obiettivo_id}")
async def get_obiettivo(obiettivo_id: int):
    """Ottiene dettagli di un obiettivo specifico con importo_attuale calcolato"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        obiettivo = dict_from_row(row)
        
        # Calculate importo_attuale from movements
        return enrich_obiettivo_with_calculated_amount(conn, obiettivo)


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
                0.0,  # Always start at 0, will be calculated from movements
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
        
        # Prepara update (exclude importo_attuale - it's calculated)
        update_data = obiettivo.dict(exclude_unset=True)
        if 'importo_attuale' in update_data:
            del update_data['importo_attuale']  # Don't allow manual updates
        
        updates = []
        params = []
        
        for field, value in update_data.items():
            updates.append(f"{field} = ?")
            params.append(value)
        
        if not updates:
            # If only importo_attuale was provided, just return current state
            return await get_obiettivo(obiettivo_id)
        
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
        
        # Note: This will leave orphaned movements with obiettivo_id
        # Consider adding ON DELETE SET NULL to the foreign key
        conn.execute("DELETE FROM obiettivi_risparmio WHERE id = ?", (obiettivo_id,))
        conn.commit()
        
        return {"message": "Obiettivo eliminato con successo"}


@router.post("/{obiettivo_id}/aggiungi")
async def aggiungi_importo(obiettivo_id: int, modifica: ImportoModifica):
    """DEPRECATED: Use movements with obiettivo_id instead.
    
    This endpoint is kept for backwards compatibility but should not be used.
    Create an income movement with obiettivo_id to add funds to a goal.
    """
    raise HTTPException(
        status_code=410,
        detail="Endpoint deprecato. Usa POST /api/movimenti con obiettivo_id per allocare fondi."
    )


@router.post("/{obiettivo_id}/rimuovi")
async def rimuovi_importo(obiettivo_id: int, modifica: ImportoModifica):
    """DEPRECATED: Use movements with obiettivo_id instead.
    
    This endpoint is kept for backwards compatibility but should not be used.
    Delete or modify income movements to remove funds from a goal.
    """
    raise HTTPException(
        status_code=410,
        detail="Endpoint deprecato. Elimina o modifica movimenti per rimuovere fondi."
    )
