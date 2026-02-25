"""API endpoints per analytics e dashboard"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict, List, Any
from datetime import datetime, date
from calendar import monthrange

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def dashboard_summary():
    """Ottiene tutti i dati per la dashboard home"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Data corrente
        oggi = date.today()
        primo_giorno_mese = date(oggi.year, oggi.month, 1)
        ultimo_giorno_mese = date(oggi.year, oggi.month, monthrange(oggi.year, oggi.month)[1])
        
        # 1. PATRIMONIO TOTALE
        cursor.execute("SELECT SUM(saldo) FROM conti WHERE attivo = 1")
        patrimonio_totale = cursor.fetchone()[0] or 0.0
        
        # 2. ENTRATE MESE CORRENTE
        cursor.execute(
            """
            SELECT COALESCE(SUM(importo), 0) 
            FROM movimenti 
            WHERE tipo = 'entrata' 
            AND date(data) >= ? 
            AND date(data) <= ?
            """,
            (primo_giorno_mese.isoformat(), ultimo_giorno_mese.isoformat())
        )
        entrate_mese = cursor.fetchone()[0] or 0.0
        
        # 3. USCITE MESE CORRENTE
        cursor.execute(
            """
            SELECT COALESCE(SUM(importo), 0) 
            FROM movimenti 
            WHERE tipo = 'uscita' 
            AND date(data) >= ? 
            AND date(data) <= ?
            """,
            (primo_giorno_mese.isoformat(), ultimo_giorno_mese.isoformat())
        )
        uscite_mese = cursor.fetchone()[0] or 0.0
        
        # 4. SALDO MESE
        saldo_mese = entrate_mese - uscite_mese
        
        # 5. SPESE PER CATEGORIA (mese corrente)
        cursor.execute(
            """
            SELECT 
                c.nome,
                c.icona,
                c.colore,
                SUM(m.importo) as totale
            FROM movimenti m
            JOIN categorie c ON m.categoria_id = c.id
            WHERE m.tipo = 'uscita'
            AND date(m.data) >= ?
            AND date(m.data) <= ?
            GROUP BY c.id, c.nome, c.icona, c.colore
            ORDER BY totale DESC
            LIMIT 10
            """,
            (primo_giorno_mese.isoformat(), ultimo_giorno_mese.isoformat())
        )
        spese_per_categoria = [dict_from_row(row) for row in cursor.fetchall()]
        
        # 6. ULTIMI MOVIMENTI
        cursor.execute(
            """
            SELECT 
                m.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                co.nome as conto_nome
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            LEFT JOIN conti co ON m.conto_id = co.id
            ORDER BY m.data DESC
            LIMIT 10
            """
        )
        ultimi_movimenti = [dict_from_row(row) for row in cursor.fetchall()]
        
        # 7. OBIETTIVI DI RISPARMIO
        cursor.execute(
            """
            SELECT 
                id,
                nome,
                importo_target,
                importo_attuale,
                data_target,
                priorita,
                ROUND((importo_attuale * 100.0) / importo_target, 1) as percentuale_completamento
            FROM obiettivi_risparmio
            WHERE completato = 0
            ORDER BY priorita DESC, data_target ASC
            LIMIT 5
            """
        )
        obiettivi = [dict_from_row(row) for row in cursor.fetchall()]
        
        # 8. CONTI ATTIVI
        cursor.execute(
            """
            SELECT id, nome, tipo, saldo, valuta
            FROM conti
            WHERE attivo = 1
            ORDER BY saldo DESC
            """
        )
        conti_attivi = [dict_from_row(row) for row in cursor.fetchall()]
        
        return {
            "kpi": {
                "patrimonio_totale": round(patrimonio_totale, 2),
                "entrate_mese": round(entrate_mese, 2),
                "uscite_mese": round(uscite_mese, 2),
                "saldo_mese": round(saldo_mese, 2)
            },
            "spese_per_categoria": spese_per_categoria,
            "ultimi_movimenti": ultimi_movimenti,
            "obiettivi_risparmio": obiettivi,
            "conti_attivi": conti_attivi,
            "periodo": {
                "mese": oggi.month,
                "anno": oggi.year,
                "mese_nome": oggi.strftime("%B %Y")
            }
        }


@router.get("/spese-categoria")
async def spese_per_categoria(
    mese: int = None,
    anno: int = None
):
    """Ottiene le spese raggruppate per categoria"""
    
    if not mese or not anno:
        oggi = date.today()
        mese = oggi.month
        anno = oggi.year
    
    primo_giorno = date(anno, mese, 1)
    ultimo_giorno = date(anno, mese, monthrange(anno, mese)[1])
    
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT 
                c.nome,
                c.icona,
                c.colore,
                COUNT(m.id) as num_movimenti,
                SUM(m.importo) as totale
            FROM movimenti m
            JOIN categorie c ON m.categoria_id = c.id
            WHERE m.tipo = 'uscita'
            AND date(m.data) >= ?
            AND date(m.data) <= ?
            GROUP BY c.id, c.nome, c.icona, c.colore
            ORDER BY totale DESC
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        
        return [dict_from_row(row) for row in cursor.fetchall()]


@router.get("/trend-mensile")
async def trend_mensile(ultimi_mesi: int = 6):
    """Ottiene il trend di entrate/uscite degli ultimi N mesi"""
    
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT 
                strftime('%Y-%m', data) as mese,
                tipo,
                SUM(importo) as totale
            FROM movimenti
            WHERE date(data) >= date('now', '-' || ? || ' months')
            GROUP BY mese, tipo
            ORDER BY mese DESC
            """,
            (ultimi_mesi,)
        )
        
        return [dict_from_row(row) for row in cursor.fetchall()]