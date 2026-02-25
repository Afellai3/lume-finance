"""API endpoints per gestione beni (veicoli, elettrodomestici)"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/beni", tags=["Beni"])


class BeneCreate(BaseModel):
    nome: str
    tipo: str
    data_acquisto: str
    prezzo_acquisto: float
    durata_anni_stimata: Optional[int] = None
    tasso_ammortamento: Optional[float] = None
    # Veicolo
    veicolo_tipo_carburante: Optional[str] = None
    veicolo_consumo_medio: Optional[float] = None
    veicolo_costo_manutenzione_per_km: Optional[float] = None
    # Elettrodomestico
    elettrodomestico_potenza: Optional[float] = None
    elettrodomestico_ore_medie_giorno: Optional[float] = None


class BeneUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    data_acquisto: Optional[str] = None
    prezzo_acquisto: Optional[float] = None
    durata_anni_stimata: Optional[int] = None
    tasso_ammortamento: Optional[float] = None
    veicolo_tipo_carburante: Optional[str] = None
    veicolo_consumo_medio: Optional[float] = None
    veicolo_costo_manutenzione_per_km: Optional[float] = None
    elettrodomestico_potenza: Optional[float] = None
    elettrodomestico_ore_medie_giorno: Optional[float] = None


@router.get("")
async def list_beni(tipo: Optional[str] = None):
    """Lista tutti i beni, opzionalmente filtrati per tipo"""
    with get_db_connection() as conn:
        if tipo:
            cursor = conn.execute(
                "SELECT * FROM beni WHERE tipo = ? ORDER BY data_creazione DESC",
                (tipo,)
            )
        else:
            cursor = conn.execute("SELECT * FROM beni ORDER BY data_creazione DESC")
        
        return [dict_from_row(row) for row in cursor.fetchall()]


@router.get("/{bene_id}")
async def get_bene(bene_id: int):
    """Ottiene dettagli di un bene specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        return dict_from_row(row)


@router.post("", status_code=201)
async def create_bene(bene: BeneCreate):
    """Crea un nuovo bene"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO beni (
                nome, tipo, data_acquisto, prezzo_acquisto,
                durata_anni_stimata, tasso_ammortamento,
                veicolo_tipo_carburante, veicolo_consumo_medio,
                veicolo_costo_manutenzione_per_km,
                elettrodomestico_potenza, elettrodomestico_ore_medie_giorno
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                bene.nome,
                bene.tipo,
                bene.data_acquisto,
                bene.prezzo_acquisto,
                bene.durata_anni_stimata,
                bene.tasso_ammortamento,
                bene.veicolo_tipo_carburante,
                bene.veicolo_consumo_medio,
                bene.veicolo_costo_manutenzione_per_km,
                bene.elettrodomestico_potenza,
                bene.elettrodomestico_ore_medie_giorno
            )
        )
        
        conn.commit()  # FIX: Aggiungi commit
        bene_id = cursor.lastrowid
        
        return await get_bene(bene_id)


@router.put("/{bene_id}")
async def update_bene(bene_id: int, bene: BeneUpdate):
    """Aggiorna un bene esistente"""
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        existing_dict = dict_from_row(existing)
        
        # Prepara update
        updates = []
        params = []
        
        for field, value in bene.dict(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
        
        params.append(bene_id)
        
        conn.execute(
            f"UPDATE beni SET {', '.join(updates)} WHERE id = ?",
            params
        )
        
        conn.commit()  # FIX: Aggiungi commit
        
        return await get_bene(bene_id)


@router.delete("/{bene_id}")
async def delete_bene(bene_id: int):
    """Elimina un bene"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM beni WHERE id = ?", (bene_id,))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        conn.execute("DELETE FROM beni WHERE id = ?", (bene_id,))
        conn.commit()  # FIX: Aggiungi commit
        
        return {"message": "Bene eliminato con successo"}


@router.get("/{bene_id}/movimenti")
async def get_movimenti_bene(bene_id: int):
    """Ottiene tutti i movimenti collegati a un bene"""
    with get_db_connection() as conn:
        # Verifica bene
        cursor = conn.execute("SELECT id FROM beni WHERE id = ?", (bene_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        # Recupera movimenti
        cursor = conn.execute(
            """
            SELECT 
                m.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                co.nome as conto_nome
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            LEFT JOIN conti co ON m.conto_id = co.id
            WHERE m.bene_id = ?
            ORDER BY m.data DESC
            """,
            (bene_id,)
        )
        
        return [dict_from_row(row) for row in cursor.fetchall()]
