"""API endpoints per analytics e dashboard"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
from calendar import monthrange
from dateutil.relativedelta import relativedelta

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def dashboard_summary(
    data_da: Optional[str] = Query(None, description="Data inizio periodo (YYYY-MM-DD)"),
    data_a: Optional[str] = Query(None, description="Data fine periodo (YYYY-MM-DD)")
):
    """Ottiene tutti i dati per la dashboard home con filtro periodo opzionale"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Determina periodo
        if data_da and data_a:
            primo_giorno = datetime.fromisoformat(data_da).date()
            ultimo_giorno = datetime.fromisoformat(data_a).date()
        else:
            oggi = date.today()
            primo_giorno = date(oggi.year, oggi.month, 1)
            ultimo_giorno = date(oggi.year, oggi.month, monthrange(oggi.year, oggi.month)[1])
        
        # 1. PATRIMONIO TOTALE
        cursor.execute("SELECT SUM(saldo) FROM conti WHERE attivo = 1")
        patrimonio_totale = cursor.fetchone()[0] or 0.0
        
        # 2. ENTRATE PERIODO
        cursor.execute(
            """
            SELECT COALESCE(SUM(importo), 0) 
            FROM movimenti 
            WHERE tipo = 'entrata' 
            AND date(data) >= ? 
            AND date(data) <= ?
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        entrate_periodo = cursor.fetchone()[0] or 0.0
        
        # 3. USCITE PERIODO
        cursor.execute(
            """
            SELECT COALESCE(SUM(importo), 0) 
            FROM movimenti 
            WHERE tipo = 'uscita' 
            AND date(data) >= ? 
            AND date(data) <= ?
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        uscite_periodo = cursor.fetchone()[0] or 0.0
        
        # 4. SALDO PERIODO
        saldo_periodo = entrate_periodo - uscite_periodo
        
        # 5. SPESE PER CATEGORIA (periodo)
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
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
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
                "entrate_mese": round(entrate_periodo, 2),
                "uscite_mese": round(uscite_periodo, 2),
                "saldo_mese": round(saldo_periodo, 2)
            },
            "spese_per_categoria": spese_per_categoria,
            "ultimi_movimenti": ultimi_movimenti,
            "obiettivi_risparmio": obiettivi,
            "conti_attivi": conti_attivi,
            "periodo": {
                "data_da": primo_giorno.isoformat(),
                "data_a": ultimo_giorno.isoformat(),
                "mese": primo_giorno.month,
                "anno": primo_giorno.year,
                "mese_nome": primo_giorno.strftime("%B %Y")
            }
        }


@router.get("/trend-mensile")
async def trend_mensile(mesi: int = Query(6, ge=1, le=24, description="Numero mesi da visualizzare")):
    """Ottiene il trend di entrate/uscite degli ultimi N mesi"""
    
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT 
                strftime('%Y-%m', data) as mese,
                SUM(CASE WHEN tipo = 'entrata' THEN importo ELSE 0 END) as entrate,
                SUM(CASE WHEN tipo = 'uscita' THEN importo ELSE 0 END) as uscite
            FROM movimenti
            WHERE date(data) >= date('now', '-' || ? || ' months')
            GROUP BY mese
            ORDER BY mese ASC
            """,
            (mesi,)
        )
        
        rows = cursor.fetchall()
        
        # Formatta risultati
        risultati = []
        for row in rows:
            mese_str = row[0]
            anno, mese_num = mese_str.split('-')
            
            # Nome mese in italiano
            data_mese = date(int(anno), int(mese_num), 1)
            mese_nome = data_mese.strftime("%b %Y")
            
            risultati.append({
                "mese": mese_str,
                "mese_label": mese_nome,
                "entrate": round(row[1], 2),
                "uscite": round(row[2], 2),
                "saldo": round(row[1] - row[2], 2)
            })
        
        return risultati


@router.get("/confronto-periodo")
async def confronto_periodo():
    """Confronta il mese corrente con il precedente"""
    
    with get_db_connection() as conn:
        oggi = date.today()
        
        # Mese corrente
        primo_corrente = date(oggi.year, oggi.month, 1)
        ultimo_corrente = date(oggi.year, oggi.month, monthrange(oggi.year, oggi.month)[1])
        
        # Mese precedente
        data_precedente = primo_corrente - timedelta(days=1)
        primo_precedente = date(data_precedente.year, data_precedente.month, 1)
        ultimo_precedente = data_precedente
        
        # Dati mese corrente
        cursor = conn.execute(
            """
            SELECT 
                SUM(CASE WHEN tipo = 'entrata' THEN importo ELSE 0 END) as entrate,
                SUM(CASE WHEN tipo = 'uscita' THEN importo ELSE 0 END) as uscite
            FROM movimenti
            WHERE date(data) >= ? AND date(data) <= ?
            """,
            (primo_corrente.isoformat(), ultimo_corrente.isoformat())
        )
        row_corrente = cursor.fetchone()
        entrate_corrente = row_corrente[0] or 0.0
        uscite_corrente = row_corrente[1] or 0.0
        
        # Dati mese precedente
        cursor = conn.execute(
            """
            SELECT 
                SUM(CASE WHEN tipo = 'entrata' THEN importo ELSE 0 END) as entrate,
                SUM(CASE WHEN tipo = 'uscita' THEN importo ELSE 0 END) as uscite
            FROM movimenti
            WHERE date(data) >= ? AND date(data) <= ?
            """,
            (primo_precedente.isoformat(), ultimo_precedente.isoformat())
        )
        row_precedente = cursor.fetchone()
        entrate_precedente = row_precedente[0] or 0.0
        uscite_precedente = row_precedente[1] or 0.0
        
        # Calcola variazioni percentuali
        def calcola_delta_percentuale(corrente: float, precedente: float) -> float:
            if precedente == 0:
                return 100.0 if corrente > 0 else 0.0
            return round(((corrente - precedente) / precedente) * 100, 1)
        
        delta_entrate = calcola_delta_percentuale(entrate_corrente, entrate_precedente)
        delta_uscite = calcola_delta_percentuale(uscite_corrente, uscite_precedente)
        
        saldo_corrente = entrate_corrente - uscite_corrente
        saldo_precedente = entrate_precedente - uscite_precedente
        delta_saldo = saldo_corrente - saldo_precedente
        
        return {
            "mese_corrente": {
                "periodo": primo_corrente.strftime("%B %Y"),
                "entrate": round(entrate_corrente, 2),
                "uscite": round(uscite_corrente, 2),
                "saldo": round(saldo_corrente, 2)
            },
            "mese_precedente": {
                "periodo": primo_precedente.strftime("%B %Y"),
                "entrate": round(entrate_precedente, 2),
                "uscite": round(uscite_precedente, 2),
                "saldo": round(saldo_precedente, 2)
            },
            "variazioni": {
                "entrate_percentuale": delta_entrate,
                "uscite_percentuale": delta_uscite,
                "saldo_differenza": round(delta_saldo, 2)
            }
        }


@router.get("/budget-warnings")
async def budget_warnings():
    """Ottiene budget in attenzione o superati del mese corrente"""
    
    with get_db_connection() as conn:
        oggi = date.today()
        primo_giorno = date(oggi.year, oggi.month, 1)
        ultimo_giorno = date(oggi.year, oggi.month, monthrange(oggi.year, oggi.month)[1])
        
        cursor = conn.execute(
            """
            SELECT 
                b.id,
                b.importo as budget,
                b.periodo,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                c.colore as categoria_colore
            FROM budget b
            JOIN categorie c ON b.categoria_id = c.id
            WHERE b.attivo = 1
            ORDER BY c.nome
            """
        )
        
        warnings = []
        
        for row in cursor.fetchall():
            budget_dict = dict_from_row(row)
            budget_id = budget_dict['id']
            categoria_id = None
            
            # Recupera categoria_id
            cursor_cat = conn.execute(
                "SELECT categoria_id FROM budget WHERE id = ?",
                (budget_id,)
            )
            cat_row = cursor_cat.fetchone()
            if cat_row:
                categoria_id = cat_row[0]
            
            # Calcola spesa con logica prioritaria
            # 1. Movimenti con budget_id esplicito
            cursor_spesa = conn.execute(
                """
                SELECT COALESCE(SUM(importo), 0)
                FROM movimenti
                WHERE budget_id = ?
                AND tipo = 'uscita'
                AND date(data) >= ?
                AND date(data) <= ?
                """,
                (budget_id, primo_giorno.isoformat(), ultimo_giorno.isoformat())
            )
            spesa_esplicita = cursor_spesa.fetchone()[0] or 0.0
            
            # 2. Movimenti con categoria (senza budget_id)
            spesa_categoria = 0.0
            if categoria_id:
                cursor_spesa_cat = conn.execute(
                    """
                    SELECT COALESCE(SUM(importo), 0)
                    FROM movimenti
                    WHERE categoria_id = ?
                    AND budget_id IS NULL
                    AND tipo = 'uscita'
                    AND date(data) >= ?
                    AND date(data) <= ?
                    """,
                    (categoria_id, primo_giorno.isoformat(), ultimo_giorno.isoformat())
                )
                spesa_categoria = cursor_spesa_cat.fetchone()[0] or 0.0
            
            spesa_totale = spesa_esplicita + spesa_categoria
            percentuale = (spesa_totale / budget_dict['budget']) * 100 if budget_dict['budget'] > 0 else 0
            
            # Solo se >= 80% (attenzione o superato)
            if percentuale >= 80:
                stato = 'superato' if percentuale >= 100 else 'attenzione'
                
                warnings.append({
                    "budget_id": budget_id,
                    "categoria": budget_dict['categoria_nome'],
                    "icona": budget_dict['categoria_icona'],
                    "colore": budget_dict['categoria_colore'],
                    "budget": round(budget_dict['budget'], 2),
                    "spesa": round(spesa_totale, 2),
                    "percentuale": round(percentuale, 1),
                    "stato": stato
                })
        
        # Ordina per percentuale decrescente
        warnings.sort(key=lambda x: x['percentuale'], reverse=True)
        
        return warnings


@router.get("/top-spese")
async def top_spese(limit: int = Query(5, ge=1, le=20, description="Numero spese da restituire")):
    """Ottiene le spese maggiori del mese corrente"""
    
    with get_db_connection() as conn:
        oggi = date.today()
        primo_giorno = date(oggi.year, oggi.month, 1)
        ultimo_giorno = date(oggi.year, oggi.month, monthrange(oggi.year, oggi.month)[1])
        
        cursor = conn.execute(
            """
            SELECT 
                m.id,
                m.data,
                m.importo,
                m.descrizione,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                c.colore as categoria_colore,
                co.nome as conto_nome
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            LEFT JOIN conti co ON m.conto_id = co.id
            WHERE m.tipo = 'uscita'
            AND date(m.data) >= ?
            AND date(m.data) <= ?
            ORDER BY m.importo DESC
            LIMIT ?
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat(), limit)
        )
        
        return [dict_from_row(row) for row in cursor.fetchall()]


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
