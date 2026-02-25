"""API endpoints per gestione conti"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime

from ..database import get_db_connection, dict_from_row
from ..models import Conto, TipoConto

router = APIRouter(prefix="/conti", tags=["Conti"])


@router.get("", response_model=List[Conto])
async def lista_conti(attivi_solo: bool = True):
    """Ottiene la lista di tutti i conti"""
    with get_db_connection() as conn:
        query = "SELECT * FROM conti"
        if attivi_solo:
            query += " WHERE attivo = 1"
        query += " ORDER BY data_creazione DESC"
        
        cursor = conn.execute(query)
        rows = cursor.fetchall()
        
        return [dict_from_row(row) for row in rows]


@router.get("/{conto_id}", response_model=Conto)
async def dettaglio_conto(conto_id: int):
    """Ottiene i dettagli di un conto specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT * FROM conti WHERE id = ?", (conto_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conto {conto_id} non trovato"
            )
        
        return dict_from_row(row)


@router.post("", response_model=Conto, status_code=status.HTTP_201_CREATED)
async def crea_conto(conto: Conto):
    """Crea un nuovo conto"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO conti (nome, tipo, saldo, valuta, descrizione, attivo)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (conto.nome, conto.tipo.value, conto.saldo, conto.valuta, 
             conto.descrizione, conto.attivo)
        )
        
        conn.commit()  # FIX: Aggiungi commit
        conto_id = cursor.lastrowid
        
        # Recupera il conto creato
        cursor = conn.execute("SELECT * FROM conti WHERE id = ?", (conto_id,))
        row = cursor.fetchone()
        
        return dict_from_row(row)


@router.put("/{conto_id}", response_model=Conto)
async def aggiorna_conto(conto_id: int, conto: Conto):
    """Aggiorna un conto esistente"""
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute("SELECT id FROM conti WHERE id = ?", (conto_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conto {conto_id} non trovato"
            )
        
        # Aggiorna
        conn.execute(
            """
            UPDATE conti 
            SET nome = ?, tipo = ?, saldo = ?, valuta = ?, 
                descrizione = ?, attivo = ?
            WHERE id = ?
            """,
            (conto.nome, conto.tipo.value, conto.saldo, conto.valuta,
             conto.descrizione, conto.attivo, conto_id)
        )
        
        conn.commit()  # FIX: Aggiungi commit
        
        # Recupera aggiornato
        cursor = conn.execute("SELECT * FROM conti WHERE id = ?", (conto_id,))
        row = cursor.fetchone()
        
        return dict_from_row(row)


@router.delete("/{conto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def elimina_conto(conto_id: int):
    """Elimina un conto (soft delete - imposta attivo=0)"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM conti WHERE id = ?", (conto_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conto {conto_id} non trovato"
            )
        
        # Soft delete
        conn.execute("UPDATE conti SET attivo = 0 WHERE id = ?", (conto_id,))
        conn.commit()  # FIX: Aggiungi commit


@router.get("/{conto_id}/saldo")
async def saldo_conto(conto_id: int):
    """Ottiene il saldo corrente di un conto"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT saldo, valuta FROM conti WHERE id = ?", 
            (conto_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conto {conto_id} non trovato"
            )
        
        return {
            "conto_id": conto_id,
            "saldo": row[0],
            "valuta": row[1]
        }
