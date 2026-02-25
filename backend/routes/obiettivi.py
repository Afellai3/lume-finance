"""API endpoints per gestione obiettivi di risparmio"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/obiettivi", tags=["Obiettivi"])


class ObiettivoCreate(BaseModel):
    nome: str
    importo_target: float
    data_target: Optional[str] = None
    priorita: int = 3
    descrizione: Optional[str] = None
    categoria_id: Optional[int] = None


class ObiettivoUpdate(BaseModel):
    nome: Optional[str] = None
    importo_target: Optional[float] = None
    data_target: Optional[str] = None
    priorita: Optional[int] = None
    completato: Optional[bool] = None
    descrizione: Optional[str] = None
    categoria_id: Optional[int] = None


def calculate_obiettivo_stats(conn, obiettivo: dict) -> dict:
    """Calculate comprehensive stats for an obiettivo."""
    # Get importo_attuale from linked movements
    cursor = conn.execute(
        """
        SELECT COALESCE(SUM(importo), 0) FROM movimenti 
        WHERE obiettivo_id = ? AND tipo = 'entrata'
        """,
        (obiettivo['id'],)
    )
    importo_attuale = cursor.fetchone()[0]
    
    # Calculate progress
    percentuale_completamento = (
        (importo_attuale / obiettivo['importo_target'] * 100)
        if obiettivo['importo_target'] > 0 else 0
    )
    
    rimanente = obiettivo['importo_target'] - importo_attuale
    
    # Calculate giorni_rimanenti if data_target exists
    giorni_rimanenti = None
    scaduto = False
    
    if obiettivo['data_target']:
        try:
            target_date = datetime.fromisoformat(obiettivo['data_target'].replace('Z', '+00:00'))
            now = datetime.now()
            delta = target_date - now
            giorni_rimanenti = delta.days
            scaduto = giorni_rimanenti < 0
        except:
            pass
    
    # Calculate velocita_risparmio (average monthly contribution)
    cursor = conn.execute(
        """
        SELECT MIN(data) FROM movimenti 
        WHERE obiettivo_id = ? AND tipo = 'entrata'
        """,
        (obiettivo['id'],)
    )
    first_contrib = cursor.fetchone()[0]
    
    velocita_risparmio_mensile = 0
    if first_contrib and importo_attuale > 0:
        try:
            first_date = datetime.fromisoformat(first_contrib.replace('Z', '+00:00'))
            now = datetime.now()
            mesi_trascorsi = max(1, (now - first_date).days / 30)
            velocita_risparmio_mensile = importo_attuale / mesi_trascorsi
        except:
            pass
    
    # Estimate completion date based on current velocity
    data_completamento_stimata = None
    if velocita_risparmio_mensile > 0 and rimanente > 0:
        mesi_necessari = rimanente / velocita_risparmio_mensile
        data_completamento_stimata = (datetime.now() + timedelta(days=mesi_necessari * 30)).date().isoformat()
    
    return {
        **obiettivo,
        'importo_attuale': importo_attuale,
        'rimanente': rimanente,
        'percentuale_completamento': percentuale_completamento,
        'giorni_rimanenti': giorni_rimanenti,
        'scaduto': scaduto,
        'velocita_risparmio_mensile': velocita_risparmio_mensile,
        'data_completamento_stimata': data_completamento_stimata
    }


@router.get("")
async def list_obiettivi(completati: bool = False):
    """Lista tutti gli obiettivi con stats complete"""
    with get_db_connection() as conn:
        if completati:
            cursor = conn.execute(
                """
                SELECT o.*, c.nome as categoria_nome, c.icona as categoria_icona
                FROM obiettivi_risparmio o
                LEFT JOIN categorie c ON o.categoria_id = c.id
                ORDER BY o.data_creazione DESC
                """
            )
        else:
            cursor = conn.execute(
                """
                SELECT o.*, c.nome as categoria_nome, c.icona as categoria_icona
                FROM obiettivi_risparmio o
                LEFT JOIN categorie c ON o.categoria_id = c.id
                WHERE o.completato = 0
                ORDER BY o.priorita ASC, o.data_target ASC
                """
            )
        
        obiettivi = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Calculate stats for each obiettivo
        return [calculate_obiettivo_stats(conn, obj) for obj in obiettivi]


@router.get("/tutti")
async def list_obiettivi_tutti():
    """Lista tutti gli obiettivi (attivi e completati) con stats complete"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT o.*, c.nome as categoria_nome, c.icona as categoria_icona
            FROM obiettivi_risparmio o
            LEFT JOIN categorie c ON o.categoria_id = c.id
            ORDER BY o.completato ASC, o.priorita ASC, o.data_target ASC
            """
        )
        
        obiettivi = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Calculate stats for each obiettivo
        return [calculate_obiettivo_stats(conn, obj) for obj in obiettivi]


@router.get("/{obiettivo_id}")
async def get_obiettivo(obiettivo_id: int):
    """Ottiene dettagli di un obiettivo specifico con stats complete"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT o.*, c.nome as categoria_nome, c.icona as categoria_icona
            FROM obiettivi_risparmio o
            LEFT JOIN categorie c ON o.categoria_id = c.id
            WHERE o.id = ?
            """,
            (obiettivo_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        obiettivo = dict_from_row(row)
        
        # Calculate complete stats
        return calculate_obiettivo_stats(conn, obiettivo)


@router.get("/{obiettivo_id}/contributi")
async def get_contributi(obiettivo_id: int):
    """Ottiene lista contributi (movimenti) per un obiettivo"""
    with get_db_connection() as conn:
        # Verifica obiettivo esiste
        cursor = conn.execute(
            "SELECT id, nome FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        # Ottieni movimenti collegati
        cursor = conn.execute(
            """
            SELECT 
                m.*,
                c.nome as conto_nome,
                cat.nome as categoria_nome
            FROM movimenti m
            LEFT JOIN conti c ON m.conto_id = c.id
            LEFT JOIN categorie cat ON m.categoria_id = cat.id
            WHERE m.obiettivo_id = ?
            ORDER BY m.data DESC
            """,
            (obiettivo_id,)
        )
        
        contributi = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Calcola totale
        totale = sum(c['importo'] for c in contributi if c['tipo'] == 'entrata')
        
        return {
            'contributi': contributi,
            'totale': totale,
            'numero_contributi': len(contributi)
        }


@router.post("", status_code=201)
async def create_obiettivo(obiettivo: ObiettivoCreate):
    """Crea un nuovo obiettivo"""
    with get_db_connection() as conn:
        # Verifica categoria se specificata
        if obiettivo.categoria_id:
            cursor = conn.execute(
                "SELECT id FROM categorie WHERE id = ?",
                (obiettivo.categoria_id,)
            )
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Categoria non trovata")
        
        cursor = conn.execute(
            """
            INSERT INTO obiettivi_risparmio 
            (nome, importo_target, data_target, priorita, descrizione, categoria_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                obiettivo.nome,
                obiettivo.importo_target,
                obiettivo.data_target,
                obiettivo.priorita,
                obiettivo.descrizione,
                obiettivo.categoria_id
            )
        )
        
        conn.commit()
        obiettivo_id = cursor.lastrowid
        
        return await get_obiettivo(obiettivo_id)


@router.put("/{obiettivo_id}")
async def update_obiettivo(obiettivo_id: int, obiettivo: ObiettivoUpdate):
    """Aggiorna un obiettivo esistente"""
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute(
            "SELECT id FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        # Verifica categoria se specificata
        if obiettivo.categoria_id:
            cursor = conn.execute(
                "SELECT id FROM categorie WHERE id = ?",
                (obiettivo.categoria_id,)
            )
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Categoria non trovata")
        
        # Prepara update
        updates = []
        params = []
        
        for field, value in obiettivo.dict(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)
        
        if not updates:
            return await get_obiettivo(obiettivo_id)
        
        params.append(obiettivo_id)
        
        conn.execute(
            f"UPDATE obiettivi_risparmio SET {', '.join(updates)} WHERE id = ?",
            params
        )
        
        conn.commit()
        
        return await get_obiettivo(obiettivo_id)


@router.delete("/{obiettivo_id}")
async def delete_obiettivo(obiettivo_id: int):
    """Elimina un obiettivo"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT id FROM obiettivi_risparmio WHERE id = ?",
            (obiettivo_id,)
        )
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        # Note: This will leave orphaned movements with obiettivo_id set to NULL
        conn.execute("DELETE FROM obiettivi_risparmio WHERE id = ?", (obiettivo_id,))
        conn.commit()
        
        return {"message": "Obiettivo eliminato con successo"}
