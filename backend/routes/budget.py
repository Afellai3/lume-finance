"""API endpoints per gestione budget"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/budget", tags=["Budget"])


class BudgetCreate(BaseModel):
    categoria_id: int
    importo: float
    periodo: str


class BudgetUpdate(BaseModel):
    categoria_id: Optional[int] = None
    importo: Optional[float] = None
    periodo: Optional[str] = None
    attivo: Optional[bool] = None


@router.get("")
async def list_budget(attivi_solo: bool = True):
    """Lista tutti i budget con calcolo spesa corrente"""
    with get_db_connection() as conn:
        query = """
            SELECT 
                b.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                c.colore as categoria_colore
            FROM budget b
            JOIN categorie c ON b.categoria_id = c.id
        """
        
        if attivi_solo:
            query += " WHERE b.attivo = 1"
        
        query += " ORDER BY b.data_inizio DESC"
        
        cursor = conn.execute(query)
        budget_list = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Calcola spesa corrente per ogni budget
        for budget in budget_list:
            periodo_query = get_periodo_query(budget['periodo'])
            
            cursor = conn.execute(
                f"""
                SELECT COALESCE(SUM(importo), 0)
                FROM movimenti
                WHERE categoria_id = ?
                AND tipo = 'uscita'
                AND {periodo_query}
                """,
                (budget['categoria_id'],)
            )
            
            spesa_corrente = cursor.fetchone()[0]
            budget['spesa_corrente'] = spesa_corrente
            budget['rimanente'] = budget['importo'] - spesa_corrente
            budget['percentuale_utilizzo'] = (
                (spesa_corrente / budget['importo'] * 100) 
                if budget['importo'] > 0 else 0
            )
            
            # Determina stato
            if budget['percentuale_utilizzo'] >= 100:
                budget['stato'] = 'superato'
            elif budget['percentuale_utilizzo'] >= 80:
                budget['stato'] = 'attenzione'
            else:
                budget['stato'] = 'ok'
        
        return budget_list


@router.get("/riepilogo/{periodo}")
async def get_riepilogo(periodo: str = 'mensile'):
    """Ottiene riepilogo budget per periodo"""
    with get_db_connection() as conn:
        # Ottieni tutti i budget attivi
        budget_list = await list_budget(attivi_solo=True)
        
        # Calcola totali
        totale_budget = sum(b['importo'] for b in budget_list)
        totale_speso = sum(b['spesa_corrente'] for b in budget_list)
        rimanente = totale_budget - totale_speso
        percentuale = (totale_speso / totale_budget * 100) if totale_budget > 0 else 0
        budget_superati = sum(1 for b in budget_list if b['stato'] == 'superato')
        
        now = datetime.now()
        
        return {
            'totale_budget': totale_budget,
            'totale_speso': totale_speso,
            'rimanente': rimanente,
            'percentuale_utilizzo': percentuale,
            'budget_superati': budget_superati,
            'periodo': {
                'mese': now.month,
                'anno': now.year
            }
        }


def get_periodo_query(periodo: str) -> str:
    """Genera la condizione WHERE per il periodo"""
    now = datetime.now()
    
    if periodo == 'settimanale':
        start = now - timedelta(days=7)
    elif periodo == 'mensile':
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif periodo == 'annuale':
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    return f"data >= '{start.isoformat()}'"


@router.get("/{budget_id}")
async def get_budget(budget_id: int):
    """Ottiene dettagli di un budget specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT 
                b.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                c.colore as categoria_colore
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
    with get_db_connection() as conn:
        # Verifica categoria esiste
        cursor = conn.execute(
            "SELECT id, tipo FROM categorie WHERE id = ?",
            (budget.categoria_id,)
        )
        cat_row = cursor.fetchone()
        
        if not cat_row:
            raise HTTPException(status_code=404, detail="Categoria non trovata")
        
        if cat_row[1] != 'uscita':
            raise HTTPException(
                status_code=400,
                detail="Il budget può essere impostato solo per categorie di uscita"
            )
        
        # Verifica budget non già esistente per categoria
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
            INSERT INTO budget (categoria_id, importo, periodo)
            VALUES (?, ?, ?)
            """,
            (budget.categoria_id, budget.importo, budget.periodo)
        )
        
        conn.commit()
        budget_id = cursor.lastrowid
        
        return await get_budget(budget_id)


@router.put("/{budget_id}")
async def update_budget(budget_id: int, budget: BudgetUpdate):
    """Aggiorna un budget esistente"""
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute("SELECT id FROM budget WHERE id = ?", (budget_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Budget non trovato")
        
        # Prepara update
        updates = []
        params = []
        
        for field, value in budget.dict(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)
        
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
