"""API endpoints per gestione categorie custom"""

from fastapi import APIRouter, HTTPException, status
from typing import Optional

from ..database import get_db_connection, dict_from_row
from ..models import Categoria

router = APIRouter(prefix="/categorie", tags=["Categorie"])


@router.get("")
async def list_categorie(
    tipo: Optional[str] = None,
    include_system: bool = True,
    include_usage: bool = False
):
    """
    Lista tutte le categorie con opzioni di filtro.
    
    Args:
        tipo: Filtra per tipo (entrata/uscita)
        include_system: Includi categorie di sistema (default: True)
        include_usage: Includi conteggio movimenti per categoria
    """
    with get_db_connection() as conn:
        where_clauses = []
        params = []
        
        if tipo:
            where_clauses.append("tipo = ?")
            params.append(tipo)
        
        if not include_system:
            where_clauses.append("is_system = 0")
        
        where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        if include_usage:
            query = f"""
                SELECT 
                    c.*,
                    COUNT(m.id) as movimento_count
                FROM categorie c
                LEFT JOIN movimenti m ON c.id = m.categoria_id
                WHERE {where_clause}
                GROUP BY c.id
                ORDER BY c.tipo, c.nome ASC
            """
        else:
            query = f"""
                SELECT * FROM categorie
                WHERE {where_clause}
                ORDER BY tipo, nome ASC
            """
        
        cursor = conn.execute(query, params)
        categorie = [dict_from_row(row) for row in cursor.fetchall()]
        return categorie


@router.get("/{categoria_id}")
async def get_categoria(categoria_id: int):
    """Ottiene dettagli di una categoria specifica con conteggio movimenti"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT 
                c.*,
                COUNT(m.id) as movimento_count
            FROM categorie c
            LEFT JOIN movimenti m ON c.id = m.categoria_id
            WHERE c.id = ?
            GROUP BY c.id
            """,
            (categoria_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria non trovata"
            )
        
        return dict_from_row(row)


@router.get("/{categoria_id}/usage")
async def get_categoria_usage(categoria_id: int):
    """
    Ottiene statistiche di utilizzo di una categoria.
    """
    with get_db_connection() as conn:
        # Verifica esistenza categoria
        cursor = conn.execute(
            "SELECT nome, tipo FROM categorie WHERE id = ?",
            (categoria_id,)
        )
        categoria = cursor.fetchone()
        
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria non trovata"
            )
        
        # Conta movimenti
        cursor = conn.execute(
            "SELECT COUNT(*) FROM movimenti WHERE categoria_id = ?",
            (categoria_id,)
        )
        movimento_count = cursor.fetchone()[0]
        
        # Conta budget
        cursor = conn.execute(
            "SELECT COUNT(*) FROM budget WHERE categoria_id = ?",
            (categoria_id,)
        )
        budget_count = cursor.fetchone()[0]
        
        # Conta ricorrenze
        cursor = conn.execute(
            "SELECT COUNT(*) FROM movimenti_ricorrenti WHERE categoria_id = ?",
            (categoria_id,)
        )
        ricorrenze_count = cursor.fetchone()[0]
        
        return {
            "categoria_id": categoria_id,
            "nome": categoria[0],
            "tipo": categoria[1],
            "movimento_count": movimento_count,
            "budget_count": budget_count,
            "ricorrenze_count": ricorrenze_count,
            "can_delete": movimento_count == 0 and budget_count == 0 and ricorrenze_count == 0
        }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_categoria(categoria: Categoria):
    """
    Crea una nuova categoria personalizzata.
    """
    with get_db_connection() as conn:
        # Verifica duplicati
        cursor = conn.execute(
            "SELECT id FROM categorie WHERE nome = ? AND tipo = ?",
            (categoria.nome, categoria.tipo.value)
        )
        
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Categoria '{categoria.nome}' già esistente per tipo '{categoria.tipo.value}'"
            )
        
        # Inserisci categoria
        cursor = conn.execute(
            """
            INSERT INTO categorie (
                nome, tipo, categoria_padre_id, icona, colore, descrizione, is_system
            )
            VALUES (?, ?, ?, ?, ?, ?, 0)
            """,
            (
                categoria.nome,
                categoria.tipo.value,
                categoria.categoria_padre_id,
                categoria.icona,
                categoria.colore,
                categoria.descrizione
            )
        )
        
        conn.commit()
        categoria_id = cursor.lastrowid
        
        # Recupera categoria creata
        cursor = conn.execute(
            "SELECT * FROM categorie WHERE id = ?",
            (categoria_id,)
        )
        
        return dict_from_row(cursor.fetchone())


@router.put("/{categoria_id}")
async def update_categoria(categoria_id: int, categoria: Categoria):
    """
    Aggiorna una categoria personalizzata.
    Solo le categorie custom (is_system=0) possono essere modificate.
    """
    with get_db_connection() as conn:
        # Verifica esistenza e che non sia categoria di sistema
        cursor = conn.execute(
            "SELECT is_system FROM categorie WHERE id = ?",
            (categoria_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria non trovata"
            )
        
        if row[0] == 1:  # is_system = 1
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Le categorie di sistema non possono essere modificate"
            )
        
        # Verifica duplicati (esclusa la categoria corrente)
        cursor = conn.execute(
            "SELECT id FROM categorie WHERE nome = ? AND tipo = ? AND id != ?",
            (categoria.nome, categoria.tipo.value, categoria_id)
        )
        
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Categoria '{categoria.nome}' già esistente per tipo '{categoria.tipo.value}'"
            )
        
        # Aggiorna categoria
        conn.execute(
            """
            UPDATE categorie
            SET nome = ?, tipo = ?, categoria_padre_id = ?,
                icona = ?, colore = ?, descrizione = ?
            WHERE id = ?
            """,
            (
                categoria.nome,
                categoria.tipo.value,
                categoria.categoria_padre_id,
                categoria.icona,
                categoria.colore,
                categoria.descrizione,
                categoria_id
            )
        )
        
        conn.commit()
        
        # Recupera categoria aggiornata
        cursor = conn.execute(
            "SELECT * FROM categorie WHERE id = ?",
            (categoria_id,)
        )
        
        return dict_from_row(cursor.fetchone())


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_categoria(categoria_id: int):
    """
    Elimina una categoria personalizzata.
    Solo le categorie custom (is_system=0) e non in uso possono essere eliminate.
    """
    with get_db_connection() as conn:
        # Verifica esistenza e che non sia categoria di sistema
        cursor = conn.execute(
            "SELECT is_system, nome FROM categorie WHERE id = ?",
            (categoria_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria non trovata"
            )
        
        if row[0] == 1:  # is_system = 1
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Le categorie di sistema non possono essere eliminate"
            )
        
        # Verifica che non sia in uso
        cursor = conn.execute(
            "SELECT COUNT(*) FROM movimenti WHERE categoria_id = ?",
            (categoria_id,)
        )
        movimento_count = cursor.fetchone()[0]
        
        if movimento_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Impossibile eliminare: categoria in uso in {movimento_count} movimenti"
            )
        
        # Verifica budget
        cursor = conn.execute(
            "SELECT COUNT(*) FROM budget WHERE categoria_id = ?",
            (categoria_id,)
        )
        budget_count = cursor.fetchone()[0]
        
        if budget_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Impossibile eliminare: categoria associata a {budget_count} budget"
            )
        
        # Verifica ricorrenze
        cursor = conn.execute(
            "SELECT COUNT(*) FROM movimenti_ricorrenti WHERE categoria_id = ?",
            (categoria_id,)
        )
        ricorrenze_count = cursor.fetchone()[0]
        
        if ricorrenze_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Impossibile eliminare: categoria usata in {ricorrenze_count} ricorrenze"
            )
        
        # Elimina categoria
        conn.execute(
            "DELETE FROM categorie WHERE id = ?",
            (categoria_id,)
        )
        
        conn.commit()
