"""API endpoints per gestione movimenti ricorrenti"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date, timedelta

from ..database import get_db_connection, dict_from_row
from ..models import MovimentoRicorrente, FrequenzaRicorrenza

router = APIRouter(prefix="/ricorrenze", tags=["Ricorrenze"])


def calcola_prossima_data(ricorrenza: MovimentoRicorrente, data_base: date = None) -> date:
    """
    Calcola la prossima data di esecuzione basandosi sulla frequenza.
    
    Args:
        ricorrenza: Oggetto ricorrenza
        data_base: Data di partenza per calcolo (default: oggi)
    
    Returns:
        Prossima data di esecuzione
    """
    if data_base is None:
        data_base = date.today()
    
    if ricorrenza.frequenza == FrequenzaRicorrenza.GIORNALIERA:
        return data_base + timedelta(days=1)
    
    elif ricorrenza.frequenza == FrequenzaRicorrenza.SETTIMANALE:
        if ricorrenza.giorno_settimana is None:
            raise ValueError("giorno_settimana richiesto per frequenza settimanale")
        giorni_da_aggiungere = (ricorrenza.giorno_settimana - data_base.weekday()) % 7
        if giorni_da_aggiungere == 0:
            giorni_da_aggiungere = 7
        return data_base + timedelta(days=giorni_da_aggiungere)
    
    elif ricorrenza.frequenza == FrequenzaRicorrenza.MENSILE:
        if ricorrenza.giorno_mese is None:
            raise ValueError("giorno_mese richiesto per frequenza mensile")
        
        prossimo_mese = data_base.month + 1
        prossimo_anno = data_base.year
        if prossimo_mese > 12:
            prossimo_mese = 1
            prossimo_anno += 1
        
        # Gestisci mesi con meno giorni
        giorno = min(ricorrenza.giorno_mese, 28)  # Sicuro per tutti i mesi
        if prossimo_mese in [1, 3, 5, 7, 8, 10, 12]:
            giorno = min(ricorrenza.giorno_mese, 31)
        elif prossimo_mese == 2:
            # Anno bisestile
            if prossimo_anno % 4 == 0 and (prossimo_anno % 100 != 0 or prossimo_anno % 400 == 0):
                giorno = min(ricorrenza.giorno_mese, 29)
            else:
                giorno = min(ricorrenza.giorno_mese, 28)
        else:
            giorno = min(ricorrenza.giorno_mese, 30)
        
        return date(prossimo_anno, prossimo_mese, giorno)
    
    elif ricorrenza.frequenza == FrequenzaRicorrenza.ANNUALE:
        if ricorrenza.giorno_mese is None or ricorrenza.mese is None:
            raise ValueError("giorno_mese e mese richiesti per frequenza annuale")
        
        prossimo_anno = data_base.year + 1
        return date(prossimo_anno, ricorrenza.mese, ricorrenza.giorno_mese)
    
    return data_base


@router.get("", response_model=List[dict])
async def lista_ricorrenze(
    attivo: Optional[bool] = None,
    tipo: Optional[str] = None,
    frequenza: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """
    Ottiene la lista dei movimenti ricorrenti con filtri opzionali.
    """
    with get_db_connection() as conn:
        # Build query
        where_clauses = []
        params = []
        
        if attivo is not None:
            where_clauses.append("r.attivo = ?")
            params.append(1 if attivo else 0)
        
        if tipo:
            where_clauses.append("r.tipo = ?")
            params.append(tipo)
        
        if frequenza:
            where_clauses.append("r.frequenza = ?")
            params.append(frequenza)
        
        where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # Count totale
        count_query = f"SELECT COUNT(*) FROM movimenti_ricorrenti r WHERE {where_clause}"
        cursor = conn.execute(count_query, params)
        total = cursor.fetchone()[0]
        
        # Query principale con join
        offset = (page - 1) * per_page
        query = f"""
            SELECT 
                r.*,
                c.nome as conto_nome,
                cat.nome as categoria_nome,
                cat.icona as categoria_icona
            FROM movimenti_ricorrenti r
            LEFT JOIN conti c ON r.conto_id = c.id
            LEFT JOIN categorie cat ON r.categoria_id = cat.id
            WHERE {where_clause}
            ORDER BY r.prossima_data ASC, r.data_creazione DESC
            LIMIT ? OFFSET ?
        """
        
        cursor = conn.execute(query, params + [per_page, offset])
        ricorrenze = [dict_from_row(row) for row in cursor.fetchall()]
        
        return ricorrenze


@router.get("/{ricorrenza_id}")
async def dettaglio_ricorrenza(ricorrenza_id: int):
    """Ottiene i dettagli di una ricorrenza specifica"""
    with get_db_connection() as conn:
        query = """
            SELECT 
                r.*,
                c.nome as conto_nome,
                cat.nome as categoria_nome,
                cat.icona as categoria_icona
            FROM movimenti_ricorrenti r
            LEFT JOIN conti c ON r.conto_id = c.id
            LEFT JOIN categorie cat ON r.categoria_id = cat.id
            WHERE r.id = ?
        """
        cursor = conn.execute(query, (ricorrenza_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ricorrenza {ricorrenza_id} non trovata"
            )
        
        return dict_from_row(row)


@router.post("", status_code=status.HTTP_201_CREATED)
async def crea_ricorrenza(ricorrenza: MovimentoRicorrente):
    """Crea una nuova ricorrenza"""
    # Validazione campi obbligatori per frequenza
    if ricorrenza.frequenza == FrequenzaRicorrenza.SETTIMANALE and ricorrenza.giorno_settimana is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="giorno_settimana richiesto per frequenza settimanale"
        )
    
    if ricorrenza.frequenza == FrequenzaRicorrenza.MENSILE and ricorrenza.giorno_mese is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="giorno_mese richiesto per frequenza mensile"
        )
    
    if ricorrenza.frequenza == FrequenzaRicorrenza.ANNUALE:
        if ricorrenza.giorno_mese is None or ricorrenza.mese is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="giorno_mese e mese richiesti per frequenza annuale"
            )
    
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO movimenti_ricorrenti (
                descrizione, importo, tipo, frequenza,
                giorno_mese, giorno_settimana, mese,
                data_inizio, data_fine, prossima_data,
                attivo, conto_id, categoria_id, budget_id,
                obiettivo_id, bene_id, note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ricorrenza.descrizione,
                ricorrenza.importo,
                ricorrenza.tipo.value,
                ricorrenza.frequenza.value,
                ricorrenza.giorno_mese,
                ricorrenza.giorno_settimana,
                ricorrenza.mese,
                ricorrenza.data_inizio.isoformat() if ricorrenza.data_inizio else None,
                ricorrenza.data_fine.isoformat() if ricorrenza.data_fine else None,
                ricorrenza.prossima_data.isoformat() if ricorrenza.prossima_data else None,
                ricorrenza.attivo,
                ricorrenza.conto_id,
                ricorrenza.categoria_id,
                ricorrenza.budget_id,
                ricorrenza.obiettivo_id,
                ricorrenza.bene_id,
                ricorrenza.note
            )
        )
        
        conn.commit()
        ricorrenza_id = cursor.lastrowid
        
        # Recupera ricorrenza creata
        cursor = conn.execute(
            "SELECT * FROM movimenti_ricorrenti WHERE id = ?",
            (ricorrenza_id,)
        )
        row = cursor.fetchone()
        
        return dict_from_row(row)


@router.put("/{ricorrenza_id}")
async def aggiorna_ricorrenza(ricorrenza_id: int, ricorrenza: MovimentoRicorrente):
    """Aggiorna una ricorrenza esistente"""
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute(
            "SELECT id FROM movimenti_ricorrenti WHERE id = ?",
            (ricorrenza_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ricorrenza {ricorrenza_id} non trovata"
            )
        
        # Aggiorna
        conn.execute(
            """
            UPDATE movimenti_ricorrenti
            SET descrizione = ?, importo = ?, tipo = ?, frequenza = ?,
                giorno_mese = ?, giorno_settimana = ?, mese = ?,
                data_inizio = ?, data_fine = ?, prossima_data = ?,
                attivo = ?, conto_id = ?, categoria_id = ?, budget_id = ?,
                obiettivo_id = ?, bene_id = ?, note = ?
            WHERE id = ?
            """,
            (
                ricorrenza.descrizione,
                ricorrenza.importo,
                ricorrenza.tipo.value,
                ricorrenza.frequenza.value,
                ricorrenza.giorno_mese,
                ricorrenza.giorno_settimana,
                ricorrenza.mese,
                ricorrenza.data_inizio.isoformat() if ricorrenza.data_inizio else None,
                ricorrenza.data_fine.isoformat() if ricorrenza.data_fine else None,
                ricorrenza.prossima_data.isoformat() if ricorrenza.prossima_data else None,
                ricorrenza.attivo,
                ricorrenza.conto_id,
                ricorrenza.categoria_id,
                ricorrenza.budget_id,
                ricorrenza.obiettivo_id,
                ricorrenza.bene_id,
                ricorrenza.note,
                ricorrenza_id
            )
        )
        
        conn.commit()
        
        # Recupera aggiornata
        cursor = conn.execute(
            "SELECT * FROM movimenti_ricorrenti WHERE id = ?",
            (ricorrenza_id,)
        )
        row = cursor.fetchone()
        
        return dict_from_row(row)


@router.delete("/{ricorrenza_id}", status_code=status.HTTP_204_NO_CONTENT)
async def elimina_ricorrenza(ricorrenza_id: int):
    """Elimina una ricorrenza"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT id FROM movimenti_ricorrenti WHERE id = ?",
            (ricorrenza_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ricorrenza {ricorrenza_id} non trovata"
            )
        
        conn.execute(
            "DELETE FROM movimenti_ricorrenti WHERE id = ?",
            (ricorrenza_id,)
        )
        conn.commit()


@router.post("/{ricorrenza_id}/toggle")
async def toggle_ricorrenza(ricorrenza_id: int):
    """
    Attiva/Disattiva una ricorrenza (pausa/riprendi).
    """
    with get_db_connection() as conn:
        # Ottieni stato corrente
        cursor = conn.execute(
            "SELECT attivo FROM movimenti_ricorrenti WHERE id = ?",
            (ricorrenza_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ricorrenza {ricorrenza_id} non trovata"
            )
        
        nuovo_stato = not bool(row[0])
        
        # Aggiorna stato
        conn.execute(
            "UPDATE movimenti_ricorrenti SET attivo = ? WHERE id = ?",
            (nuovo_stato, ricorrenza_id)
        )
        conn.commit()
        
        return {
            "id": ricorrenza_id,
            "attivo": nuovo_stato,
            "message": "Ricorrenza attivata" if nuovo_stato else "Ricorrenza disattivata"
        }


@router.post("/{ricorrenza_id}/esegui")
async def esegui_ricorrenza_manuale(ricorrenza_id: int):
    """
    Esegue manualmente una ricorrenza (crea movimento e aggiorna prossima_data).
    """
    with get_db_connection() as conn:
        # Ottieni ricorrenza
        cursor = conn.execute(
            "SELECT * FROM movimenti_ricorrenti WHERE id = ?",
            (ricorrenza_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ricorrenza {ricorrenza_id} non trovata"
            )
        
        ric_dict = dict_from_row(row)
        
        # Crea movimento
        importo_movimento = ric_dict['importo'] if ric_dict['tipo'] == 'entrata' else -abs(ric_dict['importo'])
        
        cursor = conn.execute(
            """
            INSERT INTO movimenti (
                data, importo, tipo, conto_id, categoria_id,
                budget_id, obiettivo_id, bene_id, descrizione, note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.now().isoformat(),
                importo_movimento,
                ric_dict['tipo'],
                ric_dict['conto_id'],
                ric_dict['categoria_id'],
                ric_dict['budget_id'],
                ric_dict['obiettivo_id'],
                ric_dict['bene_id'],
                f"[AUTO] {ric_dict['descrizione']}",
                ric_dict['note']
            )
        )
        movimento_id = cursor.lastrowid
        
        # Aggiorna saldo conto se presente
        if ric_dict['conto_id']:
            conn.execute(
                "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                (importo_movimento, ric_dict['conto_id'])
            )
        
        # Calcola prossima data
        ric_obj = MovimentoRicorrente(**ric_dict)
        prossima = calcola_prossima_data(ric_obj, date.today())
        
        # Aggiorna ricorrenza
        conn.execute(
            "UPDATE movimenti_ricorrenti SET prossima_data = ? WHERE id = ?",
            (prossima.isoformat(), ricorrenza_id)
        )
        
        conn.commit()
        
        return {
            "success": True,
            "movimento_id": movimento_id,
            "prossima_data": prossima.isoformat(),
            "message": "Movimento creato con successo"
        }
