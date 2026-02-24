"""API endpoints per gestione beni (auto, elettrodomestici)"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import date

from ..database import get_db_connection, dict_from_row
from ..models import Bene, TipoBene

router = APIRouter(prefix="/beni", tags=["Beni"])


@router.get("", response_model=List[Bene])
async def lista_beni(tipo: Optional[TipoBene] = None, attivi_solo: bool = True):
    """Ottiene la lista di tutti i beni"""
    with get_db_connection() as conn:
        query = "SELECT * FROM beni WHERE 1=1"
        params = []
        
        if attivi_solo:
            query += " AND attivo = 1"
        
        if tipo:
            query += " AND tipo = ?"
            params.append(tipo.value)
        
        query += " ORDER BY creato_il DESC"
        
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        
        return [dict_from_row(row) for row in rows]


@router.get("/{bene_id}", response_model=Bene)
async def dettaglio_bene(bene_id: int):
    """Ottiene i dettagli di un bene specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bene {bene_id} non trovato"
            )
        
        return dict_from_row(row)


@router.post("", response_model=Bene, status_code=status.HTTP_201_CREATED)
async def crea_bene(bene: Bene):
    """Crea un nuovo bene"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO beni (
                nome, tipo, data_acquisto, prezzo_acquisto,
                veicolo_tipo_carburante, veicolo_consumo_medio, 
                veicolo_costo_manutenzione_per_km,
                elettrodomestico_potenza, elettrodomestico_ore_medie_giorno,
                durata_anni_stimata, tasso_ammortamento, note, attivo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                bene.nome, bene.tipo.value, bene.data_acquisto, bene.prezzo_acquisto,
                bene.veicolo_tipo_carburante.value if bene.veicolo_tipo_carburante else None,
                bene.veicolo_consumo_medio, bene.veicolo_costo_manutenzione_per_km,
                bene.elettrodomestico_potenza, bene.elettrodomestico_ore_medie_giorno,
                bene.durata_anni_stimata, bene.tasso_ammortamento, bene.note, bene.attivo
            )
        )
        
        bene_id = cursor.lastrowid
        
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        row = cursor.fetchone()
        
        return dict_from_row(row)


@router.put("/{bene_id}", response_model=Bene)
async def aggiorna_bene(bene_id: int, bene: Bene):
    """Aggiorna un bene esistente"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM beni WHERE id = ?", (bene_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bene {bene_id} non trovato"
            )
        
        conn.execute(
            """
            UPDATE beni SET
                nome = ?, tipo = ?, data_acquisto = ?, prezzo_acquisto = ?,
                veicolo_tipo_carburante = ?, veicolo_consumo_medio = ?,
                veicolo_costo_manutenzione_per_km = ?,
                elettrodomestico_potenza = ?, elettrodomestico_ore_medie_giorno = ?,
                durata_anni_stimata = ?, tasso_ammortamento = ?, note = ?, attivo = ?
            WHERE id = ?
            """,
            (
                bene.nome, bene.tipo.value, bene.data_acquisto, bene.prezzo_acquisto,
                bene.veicolo_tipo_carburante.value if bene.veicolo_tipo_carburante else None,
                bene.veicolo_consumo_medio, bene.veicolo_costo_manutenzione_per_km,
                bene.elettrodomestico_potenza, bene.elettrodomestico_ore_medie_giorno,
                bene.durata_anni_stimata, bene.tasso_ammortamento, bene.note, bene.attivo,
                bene_id
            )
        )
        
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        row = cursor.fetchone()
        
        return dict_from_row(row)


@router.delete("/{bene_id}", status_code=status.HTTP_204_NO_CONTENT)
async def elimina_bene(bene_id: int):
    """Elimina un bene (soft delete)"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM beni WHERE id = ?", (bene_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bene {bene_id} non trovato"
            )
        
        conn.execute("UPDATE beni SET attivo = 0 WHERE id = ?", (bene_id,))