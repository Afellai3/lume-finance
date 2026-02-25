"""API endpoints per gestione categorie"""

from fastapi import APIRouter, HTTPException
from typing import Optional

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/categorie", tags=["Categorie"])


@router.get("")
async def list_categorie(tipo: Optional[str] = None):
    """Lista tutte le categorie, opzionalmente filtrate per tipo"""
    with get_db_connection() as conn:
        if tipo:
            # Filtra per tipo (entrata/uscita)
            cursor = conn.execute(
                """
                SELECT * FROM categorie 
                WHERE tipo = ?
                ORDER BY nome ASC
                """,
                (tipo,)
            )
        else:
            # Tutte le categorie
            cursor = conn.execute(
                "SELECT * FROM categorie ORDER BY tipo, nome ASC"
            )
        
        categorie = [dict_from_row(row) for row in cursor.fetchall()]
        return categorie


@router.get("/{categoria_id}")
async def get_categoria(categoria_id: int):
    """Ottiene dettagli di una categoria specifica"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM categorie WHERE id = ?",
            (categoria_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Categoria non trovata")
        
        return dict_from_row(row)
