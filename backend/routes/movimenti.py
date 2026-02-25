"""API endpoints per gestione movimenti"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db_connection, dict_from_row
from ..services.cost_calculator import CostCalculator

router = APIRouter(prefix="/movimenti", tags=["Movimenti"])


class MovimentoCreate(BaseModel):
    data: str
    importo: float
    tipo: str
    categoria_id: Optional[int] = None
    conto_id: Optional[int] = None
    budget_id: Optional[int] = None
    obiettivo_id: Optional[int] = None  # NEW: Link to savings goal
    descrizione: str
    ricorrente: bool = False
    # Campi per scomposizione costi
    bene_id: Optional[int] = None
    km_percorsi: Optional[float] = None
    prezzo_carburante_al_litro: Optional[float] = None
    ore_utilizzo: Optional[float] = None
    tariffa_kwh: Optional[float] = None


class MovimentoUpdate(BaseModel):
    data: Optional[str] = None
    importo: Optional[float] = None
    tipo: Optional[str] = None
    categoria_id: Optional[int] = None
    conto_id: Optional[int] = None
    budget_id: Optional[int] = None
    obiettivo_id: Optional[int] = None  # NEW: Update goal link
    descrizione: Optional[str] = None
    ricorrente: Optional[bool] = None


@router.get("")
async def list_movimenti(
    page: int = Query(1, ge=1, description="Numero pagina (parte da 1)"),
    per_page: int = Query(50, ge=1, le=100, description="Elementi per pagina (max 100)"),
    order_by: Optional[str] = Query(None, description="Campo ordinamento: data, importo, categoria"),
    order_dir: Optional[str] = Query("desc", description="Direzione: asc o desc")
):
    """Lista movimenti con paginazione e ordinamento"""
    with get_db_connection() as conn:
        # Conteggio totale
        cursor = conn.execute("SELECT COUNT(*) FROM movimenti")
        total = cursor.fetchone()[0]
        
        # Calcola offset
        offset = (page - 1) * per_page
        
        # Costruisci ORDER BY
        order_clause = "m.data DESC"  # Default
        if order_by == "data":
            order_clause = f"m.data {order_dir.upper()}"
        elif order_by == "importo":
            order_clause = f"m.importo {order_dir.upper()}"
        elif order_by == "categoria":
            order_clause = f"c.nome {order_dir.upper()}"
        
        cursor = conn.execute(
            f"""
            SELECT 
                m.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                c.colore as categoria_colore,
                co.nome as conto_nome,
                b.nome as bene_nome,
                b.tipo as bene_tipo,
                bg.id as budget_id,
                cat_bg.nome as budget_categoria_nome,
                cat_bg.icona as budget_categoria_icona,
                ob.nome as obiettivo_nome,
                ob.importo_target as obiettivo_target
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            LEFT JOIN conti co ON m.conto_id = co.id
            LEFT JOIN beni b ON m.bene_id = b.id
            LEFT JOIN budget bg ON m.budget_id = bg.id
            LEFT JOIN categorie cat_bg ON bg.categoria_id = cat_bg.id
            LEFT JOIN obiettivi_risparmio ob ON m.obiettivo_id = ob.id
            ORDER BY {order_clause}
            LIMIT ? OFFSET ?
            """,
            (per_page, offset)
        )
        
        items = [dict_from_row(row) for row in cursor.fetchall()]
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }


@router.get("/export")
async def export_movimenti_csv():
    """Esporta tutti i movimenti in formato CSV"""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT 
                m.id,
                m.data,
                m.tipo,
                m.importo,
                c.nome as categoria,
                co.nome as conto,
                m.descrizione,
                m.ricorrente,
                b.nome as bene,
                ob.nome as obiettivo,
                m.km_percorsi,
                m.ore_utilizzo
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            LEFT JOIN conti co ON m.conto_id = co.id
            LEFT JOIN beni b ON m.bene_id = b.id
            LEFT JOIN obiettivi_risparmio ob ON m.obiettivo_id = ob.id
            ORDER BY m.data DESC
            """
        )
        
        rows = cursor.fetchall()
        
        # Crea CSV in memoria
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'ID', 'Data', 'Tipo', 'Importo (€)', 'Categoria', 
            'Conto', 'Descrizione', 'Ricorrente', 'Bene', 'Obiettivo',
            'Km Percorsi', 'Ore Utilizzo'
        ])
        
        # Dati
        for row in rows:
            writer.writerow([
                row[0],  # id
                row[1],  # data
                row[2].capitalize(),  # tipo
                f"{row[3]:.2f}",  # importo
                row[4] or '',  # categoria
                row[5] or '',  # conto
                row[6],  # descrizione
                'Sì' if row[7] else 'No',  # ricorrente
                row[8] or '',  # bene
                row[9] or '',  # obiettivo (NEW)
                f"{row[10]:.1f}" if row[10] else '',  # km
                f"{row[11]:.1f}" if row[11] else ''  # ore
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=movimenti_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )


@router.get("/categorie")
async def list_categorie(tipo: Optional[str] = None):
    """Lista tutte le categorie, opzionalmente filtrate per tipo"""
    with get_db_connection() as conn:
        if tipo:
            cursor = conn.execute(
                "SELECT * FROM categorie WHERE tipo = ? ORDER BY nome",
                (tipo,)
            )
        else:
            cursor = conn.execute("SELECT * FROM categorie ORDER BY tipo, nome")
        
        return [dict_from_row(row) for row in cursor.fetchall()]


@router.get("/{movimento_id}")
async def get_movimento(movimento_id: int):
    """Ottiene dettagli di un movimento specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT 
                m.*,
                c.nome as categoria_nome,
                c.icona as categoria_icona,
                co.nome as conto_nome,
                b.nome as bene_nome,
                b.tipo as bene_tipo,
                bg.id as budget_id,
                cat_bg.nome as budget_categoria_nome,
                ob.nome as obiettivo_nome,
                ob.importo_target as obiettivo_target
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            LEFT JOIN conti co ON m.conto_id = co.id
            LEFT JOIN beni b ON m.bene_id = b.id
            LEFT JOIN budget bg ON m.budget_id = bg.id
            LEFT JOIN categorie cat_bg ON bg.categoria_id = cat_bg.id
            LEFT JOIN obiettivi_risparmio ob ON m.obiettivo_id = ob.id
            WHERE m.id = ?
            """,
            (movimento_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Movimento non trovato")
        
        return dict_from_row(row)


@router.get("/{movimento_id}/scomposizione")
async def get_scomposizione(movimento_id: int):
    """Ottiene scomposizione costi di un movimento collegato a un bene"""
    with get_db_connection() as conn:
        # Recupera movimento
        cursor = conn.execute(
            "SELECT * FROM movimenti WHERE id = ?",
            (movimento_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Movimento non trovato")
        
        movimento = dict_from_row(row)
        
        if not movimento.get('bene_id'):
            raise HTTPException(
                status_code=400, 
                detail="Movimento non collegato a nessun bene"
            )
        
        # Recupera scomposizione salvata
        if movimento.get('scomposizione_json'):
            import json
            return json.loads(movimento['scomposizione_json'])
        
        raise HTTPException(
            status_code=404, 
            detail="Scomposizione non disponibile per questo movimento"
        )


@router.post("", status_code=201)
async def create_movimento(movimento: MovimentoCreate):
    """Crea un nuovo movimento con scomposizione automatica se collegato a bene"""
    
    # NEW: Validate obiettivo_id can only be used with 'entrata'
    if movimento.obiettivo_id and movimento.tipo != 'entrata':
        raise HTTPException(
            status_code=400,
            detail="obiettivo_id può essere usato solo con movimenti di tipo 'entrata'"
        )
    
    with get_db_connection() as conn:
        # Verifica budget se specificato
        if movimento.budget_id:
            cursor = conn.execute(
                "SELECT id, attivo FROM budget WHERE id = ?",
                (movimento.budget_id,)
            )
            budget_row = cursor.fetchone()
            
            if not budget_row:
                raise HTTPException(status_code=404, detail="Budget non trovato")
            
            if not budget_row[1]:
                raise HTTPException(
                    status_code=400,
                    detail="Il budget selezionato non è attivo"
                )
        
        # NEW: Verify obiettivo exists if specified
        if movimento.obiettivo_id:
            cursor = conn.execute(
                "SELECT id, completato FROM obiettivi_risparmio WHERE id = ?",
                (movimento.obiettivo_id,)
            )
            obiettivo_row = cursor.fetchone()
            
            if not obiettivo_row:
                raise HTTPException(status_code=404, detail="Obiettivo non trovato")
            
            if obiettivo_row[1]:  # completato
                raise HTTPException(
                    status_code=400,
                    detail="Non puoi allocare fondi a un obiettivo già completato"
                )
        
        scomposizione_data = None
        
        # Se collegato a bene, calcola scomposizione
        if movimento.bene_id:
            calculator = CostCalculator(conn)
            
            # Verifica tipo bene
            cursor = conn.execute(
                "SELECT tipo FROM beni WHERE id = ?",
                (movimento.bene_id,)
            )
            bene_row = cursor.fetchone()
            
            if not bene_row:
                raise HTTPException(status_code=404, detail="Bene non trovato")
            
            bene_tipo = bene_row[0]
            
            try:
                if bene_tipo == 'veicolo':
                    if not movimento.km_percorsi:
                        raise HTTPException(
                            status_code=400,
                            detail="km_percorsi richiesto per veicoli"
                        )
                    
                    scomposizione_data = calculator.calcola_costo_veicolo(
                        bene_id=movimento.bene_id,
                        km_percorsi=movimento.km_percorsi,
                        costo_carburante=movimento.importo,
                        prezzo_carburante_al_litro=movimento.prezzo_carburante_al_litro
                    )
                
                elif bene_tipo == 'elettrodomestico':
                    if not movimento.ore_utilizzo:
                        raise HTTPException(
                            status_code=400,
                            detail="ore_utilizzo richiesto per elettrodomestici"
                        )
                    
                    scomposizione_data = calculator.calcola_costo_elettrodomestico(
                        bene_id=movimento.bene_id,
                        ore_utilizzo=movimento.ore_utilizzo,
                        tariffa_kwh=movimento.tariffa_kwh or 0.25
                    )
            
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
        
        # Inserisci movimento (NEW: include obiettivo_id)
        import json
        cursor = conn.execute(
            """
            INSERT INTO movimenti 
            (data, importo, tipo, categoria_id, conto_id, budget_id, obiettivo_id, descrizione, ricorrente, 
             bene_id, km_percorsi, ore_utilizzo, scomposizione_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                movimento.data,
                movimento.importo,
                movimento.tipo,
                movimento.categoria_id,
                movimento.conto_id,
                movimento.budget_id,
                movimento.obiettivo_id,  # NEW
                movimento.descrizione,
                movimento.ricorrente,
                movimento.bene_id,
                movimento.km_percorsi,
                movimento.ore_utilizzo,
                json.dumps(scomposizione_data) if scomposizione_data else None
            )
        )
        
        conn.commit()
        movimento_id = cursor.lastrowid
        
        # Aggiorna saldo conto
        if movimento.conto_id:
            if movimento.tipo == 'entrata':
                conn.execute(
                    "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                    (movimento.importo, movimento.conto_id)
                )
            elif movimento.tipo == 'uscita':
                conn.execute(
                    "UPDATE conti SET saldo = saldo - ? WHERE id = ?",
                    (movimento.importo, movimento.conto_id)
                )
            conn.commit()
        
        # Ritorna movimento creato con scomposizione
        result = await get_movimento(movimento_id)
        if scomposizione_data:
            result['scomposizione'] = scomposizione_data
        
        return result


@router.put("/{movimento_id}")
async def update_movimento(movimento_id: int, movimento: MovimentoUpdate):
    """Aggiorna un movimento esistente"""
    
    # NEW: Validate obiettivo_id
    if movimento.obiettivo_id is not None and movimento.tipo and movimento.tipo != 'entrata':
        raise HTTPException(
            status_code=400,
            detail="obiettivo_id può essere usato solo con movimenti di tipo 'entrata'"
        )
    
    with get_db_connection() as conn:
        # Verifica esistenza
        cursor = conn.execute(
            "SELECT importo, tipo, conto_id FROM movimenti WHERE id = ?",
            (movimento_id,)
        )
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Movimento non trovato")
        
        old_importo, old_tipo, old_conto_id = existing
        
        # Verifica budget se specificato
        if movimento.budget_id:
            cursor = conn.execute(
                "SELECT id, attivo FROM budget WHERE id = ?",
                (movimento.budget_id,)
            )
            budget_row = cursor.fetchone()
            
            if not budget_row:
                raise HTTPException(status_code=404, detail="Budget non trovato")
            
            if not budget_row[1]:
                raise HTTPException(
                    status_code=400,
                    detail="Il budget selezionato non è attivo"
                )
        
        # NEW: Verify obiettivo if specified
        if movimento.obiettivo_id:
            cursor = conn.execute(
                "SELECT id, completato FROM obiettivi_risparmio WHERE id = ?",
                (movimento.obiettivo_id,)
            )
            obiettivo_row = cursor.fetchone()
            
            if not obiettivo_row:
                raise HTTPException(status_code=404, detail="Obiettivo non trovato")
        
        # Costruisci query update dinamica
        updates = []
        params = []
        
        if movimento.data is not None:
            updates.append("data = ?")
            params.append(movimento.data)
        
        if movimento.importo is not None:
            updates.append("importo = ?")
            params.append(movimento.importo)
        
        if movimento.tipo is not None:
            updates.append("tipo = ?")
            params.append(movimento.tipo)
        
        if movimento.categoria_id is not None:
            updates.append("categoria_id = ?")
            params.append(movimento.categoria_id)
        
        if movimento.conto_id is not None:
            updates.append("conto_id = ?")
            params.append(movimento.conto_id)
        
        if movimento.budget_id is not None:
            updates.append("budget_id = ?")
            params.append(movimento.budget_id)
        
        # NEW: Update obiettivo_id
        if movimento.obiettivo_id is not None:
            updates.append("obiettivo_id = ?")
            params.append(movimento.obiettivo_id)
        
        if movimento.descrizione is not None:
            updates.append("descrizione = ?")
            params.append(movimento.descrizione)
        
        if movimento.ricorrente is not None:
            updates.append("ricorrente = ?")
            params.append(movimento.ricorrente)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
        
        params.append(movimento_id)
        
        conn.execute(
            f"UPDATE movimenti SET {', '.join(updates)} WHERE id = ?",
            params
        )
        conn.commit()
        
        # Aggiorna saldi se necessario
        new_importo = movimento.importo if movimento.importo is not None else old_importo
        new_tipo = movimento.tipo if movimento.tipo is not None else old_tipo
        new_conto_id = movimento.conto_id if movimento.conto_id is not None else old_conto_id
        
        if old_conto_id and (movimento.importo is not None or movimento.tipo is not None):
            # Ripristina vecchio saldo
            if old_tipo == 'entrata':
                conn.execute(
                    "UPDATE conti SET saldo = saldo - ? WHERE id = ?",
                    (old_importo, old_conto_id)
                )
            elif old_tipo == 'uscita':
                conn.execute(
                    "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                    (old_importo, old_conto_id)
                )
            
            # Applica nuovo saldo
            if new_tipo == 'entrata':
                conn.execute(
                    "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                    (new_importo, new_conto_id)
                )
            elif new_tipo == 'uscita':
                conn.execute(
                    "UPDATE conti SET saldo = saldo - ? WHERE id = ?",
                    (new_importo, new_conto_id)
                )
            
            conn.commit()
        
        return await get_movimento(movimento_id)


@router.delete("/{movimento_id}")
async def delete_movimento(movimento_id: int):
    """Elimina un movimento"""
    
    with get_db_connection() as conn:
        # Recupera dati per aggiornare saldo
        cursor = conn.execute(
            "SELECT importo, tipo, conto_id FROM movimenti WHERE id = ?",
            (movimento_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Movimento non trovato")
        
        importo, tipo, conto_id = row
        
        # Elimina movimento
        conn.execute("DELETE FROM movimenti WHERE id = ?", (movimento_id,))
        conn.commit()
        
        # Aggiorna saldo conto
        if conto_id:
            if tipo == 'entrata':
                conn.execute(
                    "UPDATE conti SET saldo = saldo - ? WHERE id = ?",
                    (importo, conto_id)
                )
            elif tipo == 'uscita':
                conn.execute(
                    "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                    (importo, conto_id)
                )
            conn.commit()
        
        return {"message": "Movimento eliminato con successo"}
