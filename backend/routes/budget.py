"""API endpoints per gestione budget"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, date
from calendar import monthrange
from pydantic import BaseModel

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/budget", tags=["Budget"])


class BudgetCreate(BaseModel):
    categoria_id: int
    importo: float
    periodo: str = "mensile"  # mensile, settimanale, annuale
    data_inizio: Optional[str] = None


class BudgetUpdate(BaseModel):
    importo: Optional[float] = None
    periodo: Optional[str] = None
    attivo: Optional[bool] = None


@router.get("")
async def list_budget(
    mese: int = None,
    anno: int = None,
    attivo: bool = None
):
    """Lista tutti i budget con statistiche spesa corrente"""
    
    # Data corrente o specificata
    if not mese or not anno:
        oggi = date.today()
        mese = oggi.month
        anno = oggi.year
    
    primo_giorno = date(anno, mese, 1)
    ultimo_giorno = date(anno, mese, monthrange(anno, mese)[1])
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        query = """
            SELECT 
                b.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                c.colore as categoria_colore,
                COALESCE(
                    (SELECT SUM(m.importo) 
                     FROM movimenti m 
                     WHERE m.categoria_id = b.categoria_id 
                     AND m.tipo = 'uscita'
                     AND date(m.data) >= ?
                     AND date(m.data) <= ?), 
                    0
                ) as spesa_corrente,
                ROUND(
                    COALESCE(
                        (SELECT SUM(m.importo) 
                         FROM movimenti m 
                         WHERE m.categoria_id = b.categoria_id 
                         AND m.tipo = 'uscita'
                         AND date(m.data) >= ?
                         AND date(m.data) <= ?), 
                        0
                    ) * 100.0 / b.importo,
                    1
                ) as percentuale_utilizzo
            FROM budget b
            JOIN categorie c ON b.categoria_id = c.id
        """
        
        params = [primo_giorno.isoformat(), ultimo_giorno.isoformat(),
                  primo_giorno.isoformat(), ultimo_giorno.isoformat()]
        
        if attivo is not None:
            query += " WHERE b.attivo = ?"
            params.append(1 if attivo else 0)
        
        query += " ORDER BY percentuale_utilizzo DESC"
        
        cursor.execute(query, params)
        budget_list = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Calcola stato per ogni budget
        for budget in budget_list:
            perc = budget['percentuale_utilizzo']
            if perc >= 100:
                budget['stato'] = 'superato'
            elif perc >= 80:
                budget['stato'] = 'attenzione'
            else:
                budget['stato'] = 'ok'
            
            budget['rimanente'] = budget['importo'] - budget['spesa_corrente']
        
        return {
            "budget": budget_list,
            "periodo": {
                "mese": mese,
                "anno": anno,
                "primo_giorno": primo_giorno.isoformat(),
                "ultimo_giorno": ultimo_giorno.isoformat()
            }
        }


@router.get("/{budget_id}")
async def get_budget(budget_id: int):
    """Ottiene dettagli di un budget specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT b.*, c.nome as categoria_nome, c.icona as categoria_icona
            FROM budget b
            JOIN categorie c ON b.categoria_id = c.id
            WHERE b.id = ?
            """,
            (budget_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Budget non trovato")
        
        return dict_from_row(row)


@router.post("", status_code=201)
async def create_budget(budget: BudgetCreate):
    """Crea un nuovo budget"""
    
    data_inizio = budget.data_inizio or datetime.now().isoformat()
    
    with get_db_connection() as conn:
        # Verifica che la categoria esista
        cursor = conn.execute(
            "SELECT id FROM categorie WHERE id = ?",
            (budget.categoria_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Categoria non trovata")
        
        # Verifica che non esista già un budget per quella categoria
        cursor = conn.execute(
            "SELECT id FROM budget WHERE categoria_id = ? AND attivo = 1",
            (budget.categoria_id,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400, 
                detail="Esiste già un budget attivo per questa categoria"
            )
        
        # Crea budget
        cursor = conn.execute(
            """
            INSERT INTO budget (categoria_id, importo, periodo, data_inizio)
            VALUES (?, ?, ?, ?)
            """,
            (budget.categoria_id, budget.importo, budget.periodo, data_inizio)
        )
        
        conn.commit()
        budget_id = cursor.lastrowid
        
        # Ritorna budget creato
        return await get_budget(budget_id)


@router.put("/{budget_id}")
async def update_budget(budget_id: int, budget: BudgetUpdate):
    """Aggiorna un budget esistente"""
    
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute("SELECT id FROM budget WHERE id = ?", (budget_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Budget non trovato")
        
        # Costruisci query update dinamica
        updates = []
        params = []
        
        if budget.importo is not None:
            updates.append("importo = ?")
            params.append(budget.importo)
        
        if budget.periodo is not None:
            updates.append("periodo = ?")
            params.append(budget.periodo)
        
        if budget.attivo is not None:
            updates.append("attivo = ?")
            params.append(1 if budget.attivo else 0)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
        
        params.append(budget_id)
        
        conn.execute(
            f"UPDATE budget SET {', '.join(updates)} WHERE id = ?",
            params
        )
        conn.commit()
        
        return await get_budget(budget_id)


@router.delete("/{budget_id}")
async def delete_budget(budget_id: int):
    """Elimina un budget"""
    
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM budget WHERE id = ?", (budget_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Budget non trovato")
        
        conn.execute("DELETE FROM budget WHERE id = ?", (budget_id,))
        conn.commit()
        
        return {"message": "Budget eliminato con successo"}


@router.get("/riepilogo/mensile")
async def budget_riepilogo(
    mese: int = None,
    anno: int = None
):
    """Riepilogo generale budget del mese"""
    
    if not mese or not anno:
        oggi = date.today()
        mese = oggi.month
        anno = oggi.year
    
    primo_giorno = date(anno, mese, 1)
    ultimo_giorno = date(anno, mese, monthrange(anno, mese)[1])
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Totale budget pianificato
        cursor.execute(
            "SELECT COALESCE(SUM(importo), 0) FROM budget WHERE attivo = 1"
        )
        totale_budget = cursor.fetchone()[0]
        
        # Totale speso
        cursor.execute(
            """
            SELECT COALESCE(SUM(m.importo), 0)
            FROM movimenti m
            JOIN budget b ON m.categoria_id = b.categoria_id
            WHERE m.tipo = 'uscita'
            AND date(m.data) >= ?
            AND date(m.data) <= ?
            AND b.attivo = 1
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        totale_speso = cursor.fetchone()[0]
        
        # Numero budget superati
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM budget b
            WHERE b.attivo = 1
            AND (
                SELECT COALESCE(SUM(m.importo), 0)
                FROM movimenti m
                WHERE m.categoria_id = b.categoria_id
                AND m.tipo = 'uscita'
                AND date(m.data) >= ?
                AND date(m.data) <= ?
            ) > b.importo
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        budget_superati = cursor.fetchone()[0]
        
        return {
            "totale_budget": round(totale_budget, 2),
            "totale_speso": round(totale_speso, 2),
            "rimanente": round(totale_budget - totale_speso, 2),
            "percentuale_utilizzo": round((totale_speso / totale_budget * 100) if totale_budget > 0 else 0, 1),
            "budget_superati": budget_superati,
            "periodo": {
                "mese": mese,
                "anno": anno
            }
        }
