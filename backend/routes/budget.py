"""API endpoints per gestione budget"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import calendar

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/budget", tags=["Budget"])


class BudgetCreate(BaseModel):
    categoria_id: int
    importo: float
    periodo: str
    data_fine: Optional[str] = None
    soglia_avviso: int = 80
    descrizione: Optional[str] = None


class BudgetUpdate(BaseModel):
    categoria_id: Optional[int] = None
    importo: Optional[float] = None
    periodo: Optional[str] = None
    attivo: Optional[bool] = None
    data_fine: Optional[str] = None
    soglia_avviso: Optional[int] = None
    descrizione: Optional[str] = None


@router.get("")
async def list_budget(attivi_solo: bool = True):
    """Lista tutti i budget con calcolo spesa corrente e periodo"""
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
            
            # PRIORITÀ 1: Movimenti con budget_id esplicito
            cursor = conn.execute(
                f"""
                SELECT COALESCE(SUM(ABS(importo)), 0)
                FROM movimenti
                WHERE budget_id = ?
                AND tipo = 'uscita'
                AND {periodo_query}
                """,
                (budget['id'],)
            )
            spesa_budget_esplicito = cursor.fetchone()[0]
            
            # PRIORITÀ 2: Movimenti con categoria ma SENZA budget_id esplicito
            cursor = conn.execute(
                f"""
                SELECT COALESCE(SUM(ABS(importo)), 0)
                FROM movimenti
                WHERE categoria_id = ?
                AND budget_id IS NULL
                AND tipo = 'uscita'
                AND {periodo_query}
                """,
                (budget['categoria_id'],)
            )
            spesa_categoria = cursor.fetchone()[0]
            
            # Somma le due tipologie
            spesa_corrente = spesa_budget_esplicito + spesa_categoria
            
            budget['spesa_corrente'] = spesa_corrente
            budget['rimanente'] = budget['importo'] - spesa_corrente
            budget['percentuale_utilizzo'] = (
                (spesa_corrente / budget['importo'] * 100) 
                if budget['importo'] > 0 else 0
            )
            
            # Determina stato usando soglia personalizzata
            soglia = budget.get('soglia_avviso', 80)
            if budget['percentuale_utilizzo'] >= 100:
                budget['stato'] = 'superato'
            elif budget['percentuale_utilizzo'] >= soglia:
                budget['stato'] = 'attenzione'
            else:
                budget['stato'] = 'ok'
        
        # Ritorna struttura con periodo
        now = datetime.now()
        return {
            'budget': budget_list,
            'periodo': {
                'mese': now.month,
                'anno': now.year
            }
        }


@router.get("/warnings")
async def get_budget_warnings():
    """Ottiene budget in stato di attenzione o superati"""
    data = await list_budget(attivi_solo=True)
    budget_list = data['budget']
    
    # Filtra solo budget con problemi
    warnings = [
        b for b in budget_list 
        if b['stato'] in ['attenzione', 'superato']
    ]
    
    # Ordina per gravità (superati prima, poi per percentuale)
    warnings.sort(
        key=lambda x: (0 if x['stato'] == 'superato' else 1, -x['percentuale_utilizzo'])
    )
    
    return {
        'warnings': warnings,
        'totale_warnings': len(warnings),
        'superati': sum(1 for b in warnings if b['stato'] == 'superato'),
        'attenzione': sum(1 for b in warnings if b['stato'] == 'attenzione')
    }


@router.get("/{budget_id}/history")
async def get_budget_history(budget_id: int, mesi: int = 6):
    """Ottiene storico mensile spese per un budget"""
    with get_db_connection() as conn:
        # Verifica budget esiste
        cursor = conn.execute(
            """
            SELECT b.*, c.nome as categoria_nome
            FROM budget b
            JOIN categorie c ON b.categoria_id = c.id
            WHERE b.id = ?
            """,
            (budget_id,)
        )
        
        budget_row = cursor.fetchone()
        if not budget_row:
            raise HTTPException(status_code=404, detail="Budget non trovato")
        
        budget = dict_from_row(budget_row)
        
        # Calcola storico per gli ultimi N mesi
        history = []
        now = datetime.now()
        
        for i in range(mesi):
            # Calcola mese target
            target_month = now.month - i
            target_year = now.year
            
            while target_month <= 0:
                target_month += 12
                target_year -= 1
            
            # Primo e ultimo giorno del mese
            first_day = datetime(target_year, target_month, 1)
            last_day_num = calendar.monthrange(target_year, target_month)[1]
            last_day = datetime(target_year, target_month, last_day_num, 23, 59, 59)
            
            # Query spese del mese
            cursor = conn.execute(
                """
                SELECT COALESCE(SUM(ABS(importo)), 0)
                FROM movimenti
                WHERE categoria_id = ?
                AND tipo = 'uscita'
                AND data >= ?
                AND data <= ?
                """,
                (budget['categoria_id'], first_day.isoformat(), last_day.isoformat())
            )
            
            spesa_mese = cursor.fetchone()[0]
            percentuale = (spesa_mese / budget['importo'] * 100) if budget['importo'] > 0 else 0
            
            history.append({
                'mese': target_month,
                'anno': target_year,
                'mese_nome': calendar.month_name[target_month],
                'spesa': spesa_mese,
                'budget': budget['importo'],
                'percentuale': percentuale,
                'superato': spesa_mese > budget['importo']
            })
        
        # Inverti per avere ordine cronologico
        history.reverse()
        
        # Calcola statistiche
        spese = [h['spesa'] for h in history]
        media_spesa = sum(spese) / len(spese) if spese else 0
        mesi_superati = sum(1 for h in history if h['superato'])
        
        return {
            'budget': budget,
            'history': history,
            'statistiche': {
                'media_spesa': media_spesa,
                'mesi_superati': mesi_superati,
                'mesi_analizzati': len(history)
            }
        }


@router.get("/riepilogo/{periodo}")
async def get_riepilogo(periodo: str = 'mensile'):
    """Ottiene riepilogo budget per periodo"""
    # Ottieni tutti i budget attivi
    data = await list_budget(attivi_solo=True)
    budget_list = data['budget']
    
    # Calcola totali
    totale_budget = sum(b['importo'] for b in budget_list)
    totale_speso = sum(b['spesa_corrente'] for b in budget_list)
    rimanente = totale_budget - totale_speso
    percentuale = (totale_speso / totale_budget * 100) if totale_budget > 0 else 0
    budget_superati = sum(1 for b in budget_list if b['stato'] == 'superato')
    budget_attenzione = sum(1 for b in budget_list if b['stato'] == 'attenzione')
    
    return {
        'totale_budget': totale_budget,
        'totale_speso': totale_speso,
        'rimanente': rimanente,
        'percentuale_utilizzo': percentuale,
        'budget_superati': budget_superati,
        'budget_attenzione': budget_attenzione,
        'budget_ok': len(budget_list) - budget_superati - budget_attenzione
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
        
        # Verifica budget non già esistente per categoria (e periodo)
        cursor = conn.execute(
            "SELECT id FROM budget WHERE categoria_id = ? AND attivo = 1 AND periodo = ?",
            (budget.categoria_id, budget.periodo)
        )
        
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail=f"Esiste già un budget {budget.periodo} attivo per questa categoria"
            )
        
        # Crea budget
        cursor = conn.execute(
            """
            INSERT INTO budget (categoria_id, importo, periodo, data_fine, soglia_avviso, descrizione)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (budget.categoria_id, budget.importo, budget.periodo, 
             budget.data_fine, budget.soglia_avviso, budget.descrizione)
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
