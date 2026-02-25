"""API endpoints per analytics e KPI dashboard"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, date
from typing import Dict, List, Optional
from calendar import monthrange

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def dashboard_kpi(anno: Optional[int] = None, mese: Optional[int] = None):
    """
    Ottiene i KPI principali per la dashboard.
    
    Args:
        anno: Anno di riferimento (default: anno corrente)
        mese: Mese di riferimento (default: mese corrente)
    
    Returns:
        Dict con tutti i KPI per la dashboard
    """
    # Default: mese e anno corrente
    if anno is None:
        anno = datetime.now().year
    if mese is None:
        mese = datetime.now().month
    
    # Calcola primo e ultimo giorno del mese
    primo_giorno = date(anno, mese, 1)
    ultimo_giorno_num = monthrange(anno, mese)[1]
    ultimo_giorno = date(anno, mese, ultimo_giorno_num)
    
    with get_db_connection() as conn:
        # 1. PATRIMONIO TOTALE (somma saldi conti attivi)
        cursor = conn.execute(
            "SELECT SUM(saldo) as totale FROM conti WHERE attivo = 1"
        )
        patrimonio = cursor.fetchone()[0] or 0.0
        
        # 2. ENTRATE MESE CORRENTE
        cursor = conn.execute(
            """
            SELECT COALESCE(SUM(importo), 0) as totale
            FROM movimenti
            WHERE tipo = 'entrata'
            AND date(data) >= ?
            AND date(data) <= ?
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        entrate_mese = cursor.fetchone()[0] or 0.0
        
        # 3. USCITE MESE CORRENTE
        cursor = conn.execute(
            """
            SELECT COALESCE(SUM(importo), 0) as totale
            FROM movimenti
            WHERE tipo = 'uscita'
            AND date(data) >= ?
            AND date(data) <= ?
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        uscite_mese = cursor.fetchone()[0] or 0.0
        
        # 4. SALDO MESE
        saldo_mese = entrate_mese - uscite_mese
        
        # 5. SPESE PER CATEGORIA (top 10 del mese)
        cursor = conn.execute(
            """
            SELECT 
                c.nome as categoria,
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
        
        # 6. ULTIMI MOVIMENTI (5 più recenti)
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
            ORDER BY m.data DESC
            LIMIT 5
            """
        )
        ultimi_movimenti = [dict_from_row(row) for row in cursor.fetchall()]
        
        # 7. OBIETTIVI RISPARMIO
        cursor = conn.execute(
            """
            SELECT 
                nome,
                importo_target,
                importo_attuale,
                data_target,
                priorita
            FROM obiettivi_risparmio
            WHERE attivo = 1
            ORDER BY priorita DESC, data_target ASC
            LIMIT 5
            """
        )
        obiettivi = []
        for row in cursor.fetchall():
            obj = dict_from_row(row)
            # Calcola percentuale completamento
            if obj['importo_target'] > 0:
                obj['percentuale'] = round((obj['importo_attuale'] / obj['importo_target']) * 100, 1)
            else:
                obj['percentuale'] = 0
            obiettivi.append(obj)
        
        # 8. CONFRONTO BUDGET vs SPESO
        cursor = conn.execute(
            """
            SELECT 
                b.id,
                c.nome as categoria,
                c.icona,
                b.importo as budget,
                COALESCE(SUM(m.importo), 0) as speso
            FROM budget b
            JOIN categorie c ON b.categoria_id = c.id
            LEFT JOIN movimenti m ON m.categoria_id = b.categoria_id
                AND m.tipo = 'uscita'
                AND date(m.data) >= ?
                AND date(m.data) <= ?
            WHERE b.attivo = 1
            AND b.periodo = 'mensile'
            GROUP BY b.id, c.nome, c.icona, b.importo
            """,
            (primo_giorno.isoformat(), ultimo_giorno.isoformat())
        )
        
        budget_vs_speso = []
        for row in cursor.fetchall():
            item = dict_from_row(row)
            # Calcola percentuale utilizzo
            if item['budget'] > 0:
                item['percentuale_utilizzo'] = round((item['speso'] / item['budget']) * 100, 1)
            else:
                item['percentuale_utilizzo'] = 0
            
            # Determina stato (ok, warning, danger)
            if item['percentuale_utilizzo'] < 80:
                item['stato'] = 'ok'
            elif item['percentuale_utilizzo'] < 100:
                item['stato'] = 'warning'
            else:
                item['stato'] = 'danger'
            
            budget_vs_speso.append(item)
        
        return {
            'periodo': {
                'anno': anno,
                'mese': mese,
                'mese_nome': primo_giorno.strftime('%B %Y')
            },
            'kpi': {
                'patrimonio_totale': round(patrimonio, 2),
                'entrate_mese': round(entrate_mese, 2),
                'uscite_mese': round(uscite_mese, 2),
                'saldo_mese': round(saldo_mese, 2)
            },
            'spese_per_categoria': spese_per_categoria,
            'ultimi_movimenti': ultimi_movimenti,
            'obiettivi_risparmio': obiettivi,
            'budget_vs_speso': budget_vs_speso
        }
