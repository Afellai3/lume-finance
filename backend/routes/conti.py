"""API endpoints per gestione conti"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from ..database import get_db_connection, dict_from_row
from ..models import Conto, TipoConto

router = APIRouter(prefix="/conti", tags=["Conti"])


class TrasferimentoRequest(BaseModel):
    """Modello per richiesta trasferimento tra conti"""
    conto_origine_id: int
    conto_destinazione_id: int
    importo: float
    descrizione: str
    data: Optional[str] = None


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
        
        conn.commit()
        conto_id = cursor.lastrowid
        
        cursor = conn.execute("SELECT * FROM conti WHERE id = ?", (conto_id,))
        row = cursor.fetchone()
        
        return dict_from_row(row)


@router.put("/{conto_id}", response_model=Conto)
async def aggiorna_conto(conto_id: int, conto: Conto):
    """Aggiorna un conto esistente"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM conti WHERE id = ?", (conto_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conto {conto_id} non trovato"
            )
        
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
        
        conn.commit()
        
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
        
        conn.execute("UPDATE conti SET attivo = 0 WHERE id = ?", (conto_id,))
        conn.commit()


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


# ============================================================================
# SPRINT 3: NUOVI ENDPOINT AVANZATI
# ============================================================================

@router.post("/trasferimento", status_code=status.HTTP_201_CREATED)
async def crea_trasferimento(trasferimento: TrasferimentoRequest):
    """
    Crea un trasferimento tra due conti in modo atomico.
    
    Crea due movimenti collegati:
    - Uscita dal conto origine (tipo='uscita')
    - Entrata nel conto destinazione (tipo='entrata')
    
    Entrambi i movimenti hanno descrizione con tag [TRASFERIMENTO]
    """
    if trasferimento.conto_origine_id == trasferimento.conto_destinazione_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Il conto origine e destinazione devono essere diversi"
        )
    
    if trasferimento.importo <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'importo deve essere maggiore di zero"
        )
    
    data_movimento = trasferimento.data or datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with get_db_connection() as conn:
        # Verifica esistenza conti
        cursor = conn.execute(
            "SELECT id, nome FROM conti WHERE id IN (?, ?) AND attivo = 1",
            (trasferimento.conto_origine_id, trasferimento.conto_destinazione_id)
        )
        conti = cursor.fetchall()
        
        if len(conti) != 2:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uno o entrambi i conti non esistono o non sono attivi"
            )
        
        try:
            # Movimento USCITA dal conto origine
            cursor_uscita = conn.execute(
                """
                INSERT INTO movimenti (data, importo, tipo, conto_id, descrizione)
                VALUES (?, ?, 'uscita', ?, ?)
                """,
                (
                    data_movimento,
                    -abs(trasferimento.importo),
                    trasferimento.conto_origine_id,
                    f"[TRASFERIMENTO] {trasferimento.descrizione}"
                )
            )
            movimento_uscita_id = cursor_uscita.lastrowid
            
            # Movimento ENTRATA nel conto destinazione
            cursor_entrata = conn.execute(
                """
                INSERT INTO movimenti (data, importo, tipo, conto_id, descrizione)
                VALUES (?, ?, 'entrata', ?, ?)
                """,
                (
                    data_movimento,
                    abs(trasferimento.importo),
                    trasferimento.conto_destinazione_id,
                    f"[TRASFERIMENTO] {trasferimento.descrizione}"
                )
            )
            movimento_entrata_id = cursor_entrata.lastrowid
            
            # Aggiorna saldi
            conn.execute(
                "UPDATE conti SET saldo = saldo - ? WHERE id = ?",
                (abs(trasferimento.importo), trasferimento.conto_origine_id)
            )
            conn.execute(
                "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                (abs(trasferimento.importo), trasferimento.conto_destinazione_id)
            )
            
            conn.commit()
            
            return {
                "success": True,
                "movimento_uscita_id": movimento_uscita_id,
                "movimento_entrata_id": movimento_entrata_id,
                "importo": trasferimento.importo,
                "conto_origine_id": trasferimento.conto_origine_id,
                "conto_destinazione_id": trasferimento.conto_destinazione_id
            }
            
        except Exception as e:
            conn.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore durante la creazione del trasferimento: {str(e)}"
            )


@router.get("/{conto_id}/saldo-storico")
async def saldo_storico(
    conto_id: int,
    periodo: str = Query('30d', regex='^(7d|30d|90d|365d|all)$')
):
    """
    Ottiene lo storico del saldo di un conto per creare un grafico.
    
    Parametri:
    - periodo: '7d', '30d', '90d', '365d', 'all'
    
    Restituisce array di punti [data, saldo]
    """
    with get_db_connection() as conn:
        # Verifica esistenza conto
        cursor = conn.execute(
            "SELECT saldo FROM conti WHERE id = ?",
            (conto_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conto {conto_id} non trovato"
            )
        
        saldo_corrente = row[0]
        
        # Calcola data iniziale in base al periodo
        if periodo == 'all':
            data_inizio = '2000-01-01'
        else:
            giorni_map = {'7d': 7, '30d': 30, '90d': 90, '365d': 365}
            giorni = giorni_map.get(periodo, 30)
            data_inizio = (datetime.now() - timedelta(days=giorni)).strftime('%Y-%m-%d')
        
        # Query per ottenere movimenti del periodo
        cursor = conn.execute(
            """
            SELECT DATE(data) as giorno, SUM(importo) as variazione
            FROM movimenti
            WHERE conto_id = ? AND data >= ?
            GROUP BY DATE(data)
            ORDER BY giorno ASC
            """,
            (conto_id, data_inizio)
        )
        
        movimenti_giornalieri = cursor.fetchall()
        
        # Costruisci lo storico partendo dal saldo corrente e andando indietro
        storico = []
        saldo_temp = saldo_corrente
        
        # Aggiungi punto corrente
        storico.append({
            "data": datetime.now().strftime('%Y-%m-%d'),
            "saldo": round(saldo_corrente, 2)
        })
        
        # Ricostruisci storico andando indietro
        for giorno, variazione in reversed(movimenti_giornalieri):
            saldo_temp -= variazione
            storico.insert(0, {
                "data": giorno,
                "saldo": round(saldo_temp, 2)
            })
        
        return {
            "conto_id": conto_id,
            "periodo": periodo,
            "saldo_corrente": saldo_corrente,
            "punti": storico
        }


@router.get("/{conto_id}/movimenti")
async def movimenti_per_conto(
    conto_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    tipo: Optional[str] = Query(None, regex='^(entrata|uscita)$')
):
    """
    Ottiene i movimenti di un conto specifico con paginazione.
    
    Parametri:
    - page: numero pagina (default 1)
    - per_page: risultati per pagina (default 20, max 100)
    - tipo: filtro per tipo movimento ('entrata' o 'uscita')
    """
    with get_db_connection() as conn:
        # Verifica esistenza conto
        cursor = conn.execute(
            "SELECT id, nome FROM conti WHERE id = ?",
            (conto_id,)
        )
        conto = cursor.fetchone()
        
        if not conto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conto {conto_id} non trovato"
            )
        
        # Build query
        where_clause = "WHERE m.conto_id = ?"
        params = [conto_id]
        
        if tipo:
            where_clause += " AND m.tipo = ?"
            params.append(tipo)
        
        # Count totale
        count_query = f"""
            SELECT COUNT(*) FROM movimenti m {where_clause}
        """
        cursor = conn.execute(count_query, params)
        total = cursor.fetchone()[0]
        
        # Query movimenti
        offset = (page - 1) * per_page
        query = f"""
            SELECT 
                m.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                co.nome as conto_nome
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            LEFT JOIN conti co ON m.conto_id = co.id
            {where_clause}
            ORDER BY m.data DESC
            LIMIT ? OFFSET ?
        """
        
        cursor = conn.execute(query, params + [per_page, offset])
        movimenti = [dict_from_row(row) for row in cursor.fetchall()]
        
        return {
            "conto_id": conto_id,
            "conto_nome": conto[1],
            "items": movimenti,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }
