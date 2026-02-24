"""API endpoints per gestione movimenti con scomposizione costi automatica"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field

from ..database import get_db_connection, dict_from_row
from ..models import Movimento, TipoMovimento, ScomposizioneCosto
from ..services.calcolatore_costi import (
    CalcolatoreVeicolo, 
    CalcolatoreElettrodomestico,
    RisultatoScomposizione
)

router = APIRouter(prefix="/movimenti", tags=["Movimenti"])


class MovimentoConScomposizione(BaseModel):
    """Movimento con opzioni per scomposizione automatica"""
    movimento: Movimento
    
    # Parametri opzionali per scomposizione automatica
    bene_id: Optional[int] = None
    km_percorsi: Optional[float] = None
    prezzo_carburante: Optional[float] = None
    ore_utilizzo: Optional[float] = None
    prezzo_kwh: Optional[float] = None
    giorni_periodo: Optional[int] = None


@router.get("", response_model=List[Movimento])
async def lista_movimenti(
    conto_id: Optional[int] = None,
    tipo: Optional[TipoMovimento] = None,
    categoria_id: Optional[int] = None,
    data_da: Optional[date] = None,
    data_a: Optional[date] = None,
    limite: int = Query(default=100, le=1000)
):
    """Ottiene la lista dei movimenti con filtri opzionali"""
    with get_db_connection() as conn:
        query = "SELECT * FROM movimenti WHERE 1=1"
        params = []
        
        if conto_id:
            query += " AND conto_id = ?"
            params.append(conto_id)
        
        if tipo:
            query += " AND tipo = ?"
            params.append(tipo.value)
        
        if categoria_id:
            query += " AND categoria_id = ?"
            params.append(categoria_id)
        
        if data_da:
            query += " AND date(data) >= ?"
            params.append(data_da.isoformat())
        
        if data_a:
            query += " AND date(data) <= ?"
            params.append(data_a.isoformat())
        
        query += " ORDER BY data DESC LIMIT ?"
        params.append(limite)
        
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        
        return [dict_from_row(row) for row in rows]


@router.get("/{movimento_id}", response_model=Movimento)
async def dettaglio_movimento(movimento_id: int):
    """Ottiene i dettagli di un movimento specifico"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM movimenti WHERE id = ?", 
            (movimento_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Movimento {movimento_id} non trovato"
            )
        
        return dict_from_row(row)


@router.post("", status_code=status.HTTP_201_CREATED)
async def crea_movimento(dati: MovimentoConScomposizione):
    """Crea un nuovo movimento con scomposizione costi automatica se richiesta"""
    movimento = dati.movimento
    
    with get_db_connection() as conn:
        # Inserisce movimento
        cursor = conn.execute(
            """
            INSERT INTO movimenti (
                data, importo, tipo, categoria_id, conto_id, 
                conto_destinazione_id, descrizione, note, ricorrente
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                movimento.data, movimento.importo, movimento.tipo.value,
                movimento.categoria_id, movimento.conto_id, movimento.conto_destinazione_id,
                movimento.descrizione, movimento.note, movimento.ricorrente
            )
        )
        
        movimento_id = cursor.lastrowid
        
        # Scomposizione automatica se richiesta
        scomposizione_creata = False
        
        if dati.bene_id:
            # Recupera dati bene
            cursor = conn.execute(
                "SELECT * FROM beni WHERE id = ?", 
                (dati.bene_id,)
            )
            bene_row = cursor.fetchone()
            
            if bene_row:
                bene = dict_from_row(bene_row)
                risultato = None
                
                # Veicolo
                if bene['tipo'] == 'veicolo' and dati.km_percorsi and dati.prezzo_carburante:
                    calcolatore = CalcolatoreVeicolo(
                        nome_veicolo=bene['nome'],
                        tipo_carburante=bene['veicolo_tipo_carburante'],
                        consumo_medio_l_100km=bene['veicolo_consumo_medio'],
                        costo_manutenzione_per_km=bene['veicolo_costo_manutenzione_per_km'],
                        prezzo_acquisto=bene['prezzo_acquisto'],
                        data_acquisto=datetime.fromisoformat(bene['data_acquisto']).date(),
                        durata_anni_stimata=bene['durata_anni_stimata'] or 10,
                        tasso_ammortamento_annuo=bene['tasso_ammortamento'] or 15.0
                    )
                    
                    risultato = calcolatore.calcola_costo_viaggio(
                        km_percorsi=dati.km_percorsi,
                        prezzo_carburante_al_litro=dati.prezzo_carburante
                    )
                
                # Elettrodomestico
                elif bene['tipo'] == 'elettrodomestico' and dati.prezzo_kwh:
                    calcolatore = CalcolatoreElettrodomestico(
                        nome_elettrodomestico=bene['nome'],
                        potenza_watt=bene['elettrodomestico_potenza'],
                        ore_utilizzo_giorno=bene['elettrodomestico_ore_medie_giorno'],
                        prezzo_acquisto=bene['prezzo_acquisto'],
                        data_acquisto=datetime.fromisoformat(bene['data_acquisto']).date(),
                        durata_anni_stimata=bene['durata_anni_stimata'] or 10
                    )
                    
                    giorni = dati.giorni_periodo or 30
                    risultato = calcolatore.calcola_costo_periodo(
                        giorni=giorni,
                        prezzo_kwh=dati.prezzo_kwh,
                        ore_effettive_totali=dati.ore_utilizzo
                    )
                
                # Salva componenti scomposizione
                if risultato:
                    for componente in risultato.componenti:
                        conn.execute(
                            """
                            INSERT INTO scomposizione_costi (
                                movimento_id, bene_id, nome_componente,
                                valore_componente, unita, percentuale_totale,
                                metodo_calcolo, parametri_calcolo
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                movimento_id, dati.bene_id, componente.nome,
                                componente.valore, componente.unita, componente.percentuale,
                                componente.metodo_calcolo, str(componente.parametri)
                            )
                        )
                    scomposizione_creata = True
        
        # Recupera movimento creato
        cursor = conn.execute(
            "SELECT * FROM movimenti WHERE id = ?", 
            (movimento_id,)
        )
        movimento_creato = dict_from_row(cursor.fetchone())
        
        # Recupera scomposizioni se create
        componenti = []
        if scomposizione_creata:
            cursor = conn.execute(
                "SELECT * FROM scomposizione_costi WHERE movimento_id = ?",
                (movimento_id,)
            )
            componenti = [dict_from_row(row) for row in cursor.fetchall()]
        
        return {
            "movimento": movimento_creato,
            "scomposizione": componenti if componenti else None,
            "messaggio": "Movimento creato con scomposizione automatica" if scomposizione_creata else "Movimento creato"
        }


@router.get("/{movimento_id}/scomposizione", response_model=List[ScomposizioneCosto])
async def scomposizione_movimento(movimento_id: int):
    """Ottiene la scomposizione costi di un movimento"""
    with get_db_connection() as conn:
        # Verifica esistenza movimento
        cursor = conn.execute(
            "SELECT id FROM movimenti WHERE id = ?",
            (movimento_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Movimento {movimento_id} non trovato"
            )
        
        # Recupera scomposizioni
        cursor = conn.execute(
            "SELECT * FROM scomposizione_costi WHERE movimento_id = ?",
            (movimento_id,)
        )
        rows = cursor.fetchall()
        
        return [dict_from_row(row) for row in rows]


@router.delete("/{movimento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def elimina_movimento(movimento_id: int):
    """Elimina un movimento (e le sue scomposizioni grazie a CASCADE)"""
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT id FROM movimenti WHERE id = ?",
            (movimento_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Movimento {movimento_id} non trovato"
            )
        
        conn.execute("DELETE FROM movimenti WHERE id = ?", (movimento_id,))