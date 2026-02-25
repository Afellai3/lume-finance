"""API endpoints per gestione beni (veicoli, immobili, attrezzature)"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from pydantic import BaseModel
import json

from ..database import get_db_connection, dict_from_row

router = APIRouter(prefix="/beni", tags=["Beni"])


class BeneCreate(BaseModel):
    nome: str
    tipo: str  # veicolo, immobile, attrezzatura, elettrodomestico, altro
    data_acquisto: str
    prezzo_acquisto: float
    
    # Common fields
    marca: Optional[str] = None
    modello: Optional[str] = None
    stato: Optional[str] = 'attivo'
    valore_residuo: Optional[float] = None
    foto_url: Optional[str] = None
    note: Optional[str] = None
    durata_anni_stimata: Optional[int] = None
    tasso_ammortamento: Optional[float] = None
    
    # Vehicle
    veicolo_targa: Optional[str] = None
    veicolo_km_iniziali: Optional[float] = None
    veicolo_km_attuali: Optional[float] = None
    veicolo_tipo_carburante: Optional[str] = None
    veicolo_consumo_medio: Optional[float] = None
    veicolo_costo_manutenzione_per_km: Optional[float] = None
    veicolo_ultima_revisione: Optional[str] = None
    veicolo_assicurazione_annuale: Optional[float] = None
    veicolo_bollo_annuale: Optional[float] = None
    
    # Property
    immobile_indirizzo: Optional[str] = None
    immobile_mq: Optional[float] = None
    immobile_valore_catastale: Optional[float] = None
    immobile_spese_condominiali_mensili: Optional[float] = None
    immobile_imu_annuale: Optional[float] = None
    
    # Equipment
    attrezzatura_serial_number: Optional[str] = None
    attrezzatura_ore_utilizzo: Optional[float] = None
    attrezzatura_costo_orario: Optional[float] = None
    
    # Legacy elettrodomestico
    elettrodomestico_potenza: Optional[float] = None
    elettrodomestico_ore_medie_giorno: Optional[float] = None


class BeneUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    data_acquisto: Optional[str] = None
    prezzo_acquisto: Optional[float] = None
    marca: Optional[str] = None
    modello: Optional[str] = None
    stato: Optional[str] = None
    valore_residuo: Optional[float] = None
    foto_url: Optional[str] = None
    note: Optional[str] = None
    durata_anni_stimata: Optional[int] = None
    tasso_ammortamento: Optional[float] = None
    veicolo_targa: Optional[str] = None
    veicolo_km_iniziali: Optional[float] = None
    veicolo_km_attuali: Optional[float] = None
    veicolo_tipo_carburante: Optional[str] = None
    veicolo_consumo_medio: Optional[float] = None
    veicolo_costo_manutenzione_per_km: Optional[float] = None
    veicolo_ultima_revisione: Optional[str] = None
    veicolo_assicurazione_annuale: Optional[float] = None
    veicolo_bollo_annuale: Optional[float] = None
    immobile_indirizzo: Optional[str] = None
    immobile_mq: Optional[float] = None
    immobile_valore_catastale: Optional[float] = None
    immobile_spese_condominiali_mensili: Optional[float] = None
    immobile_imu_annuale: Optional[float] = None
    attrezzatura_serial_number: Optional[str] = None
    attrezzatura_ore_utilizzo: Optional[float] = None
    attrezzatura_costo_orario: Optional[float] = None
    elettrodomestico_potenza: Optional[float] = None
    elettrodomestico_ore_medie_giorno: Optional[float] = None


@router.get("")
async def list_beni(
    tipo: Optional[str] = None,
    stato: Optional[str] = None,
    search: Optional[str] = None
):
    """Lista tutti i beni con filtri e metriche aggregate"""
    with get_db_connection() as conn:
        query = "SELECT * FROM beni WHERE 1=1"
        params = []
        
        if tipo:
            query += " AND tipo = ?"
            params.append(tipo)
        
        if stato:
            query += " AND stato = ?"
            params.append(stato)
        elif stato is None:
            # Default: solo attivi
            query += " AND (stato = 'attivo' OR stato IS NULL)"
        
        if search:
            query += " AND (nome LIKE ? OR marca LIKE ? OR modello LIKE ?)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        query += " ORDER BY data_acquisto DESC"
        
        cursor = conn.execute(query, params)
        beni = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Aggiungi metriche per ogni bene
        for bene in beni:
            bene_id = bene['id']
            
            # Età bene
            data_acq = datetime.fromisoformat(bene['data_acquisto']).date()
            oggi = date.today()
            bene['eta_anni'] = round((oggi - data_acq).days / 365.25, 1)
            
            # Totale spese
            cursor = conn.execute(
                "SELECT COALESCE(SUM(importo), 0) FROM movimenti WHERE bene_id = ? AND tipo = 'uscita'",
                (bene_id,)
            )
            bene['totale_spese'] = round(cursor.fetchone()[0], 2)
            
            # TCO totale (acquisto + spese + ammortamento - valore residuo)
            ammortamento = 0
            if bene['durata_anni_stimata'] and bene['prezzo_acquisto']:
                ammortamento = (bene['prezzo_acquisto'] / bene['durata_anni_stimata']) * bene['eta_anni']
            
            valore_residuo = bene.get('valore_residuo') or 0
            bene['tco_totale'] = round(
                bene['prezzo_acquisto'] + bene['totale_spese'] + ammortamento - valore_residuo,
                2
            )
            
            # Metriche specifiche
            if bene['tipo'] == 'veicolo' and bene.get('veicolo_km_attuali'):
                km_totali = bene['veicolo_km_attuali'] - (bene.get('veicolo_km_iniziali') or 0)
                if km_totali > 0:
                    bene['costo_per_km'] = round(bene['tco_totale'] / km_totali, 2)
                else:
                    bene['costo_per_km'] = 0
            elif bene['tipo'] == 'attrezzatura' and bene.get('attrezzatura_ore_utilizzo'):
                if bene['attrezzatura_ore_utilizzo'] > 0:
                    bene['costo_per_ora'] = round(bene['tco_totale'] / bene['attrezzatura_ore_utilizzo'], 2)
                else:
                    bene['costo_per_ora'] = 0
        
        return beni


@router.get("/{bene_id}")
async def get_bene(bene_id: int):
    """Ottiene dettagli completi di un bene"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        bene = dict_from_row(row)
        
        # Aggiungi età
        data_acq = datetime.fromisoformat(bene['data_acquisto']).date()
        oggi = date.today()
        bene['eta_anni'] = round((oggi - data_acq).days / 365.25, 1)
        bene['eta_mesi'] = round((oggi - data_acq).days / 30.44, 0)
        
        # Conta movimenti
        cursor = conn.execute(
            "SELECT COUNT(*) FROM movimenti WHERE bene_id = ?",
            (bene_id,)
        )
        bene['num_movimenti'] = cursor.fetchone()[0]
        
        return bene


@router.post("", status_code=201)
async def create_bene(bene: BeneCreate):
    """Crea un nuovo bene"""
    with get_db_connection() as conn:
        # Costruisci query dinamica
        fields = []
        values = []
        placeholders = []
        
        for field, value in bene.dict(exclude_none=True).items():
            fields.append(field)
            values.append(value)
            placeholders.append('?')
        
        query = f"""
            INSERT INTO beni ({', '.join(fields)})
            VALUES ({', '.join(placeholders)})
        """
        
        cursor = conn.execute(query, values)
        conn.commit()
        bene_id = cursor.lastrowid
        
        return await get_bene(bene_id)


@router.put("/{bene_id}")
async def update_bene(bene_id: int, bene: BeneUpdate):
    """Aggiorna un bene esistente"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        updates = []
        params = []
        
        for field, value in bene.dict(exclude_unset=True, exclude_none=False).items():
            updates.append(f"{field} = ?")
            params.append(value)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
        
        params.append(bene_id)
        
        conn.execute(
            f"UPDATE beni SET {', '.join(updates)} WHERE id = ?",
            params
        )
        conn.commit()
        
        return await get_bene(bene_id)


@router.delete("/{bene_id}")
async def delete_bene(bene_id: int):
    """Elimina un bene"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM beni WHERE id = ?", (bene_id,))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        conn.execute("DELETE FROM beni WHERE id = ?", (bene_id,))
        conn.commit()
        
        return {"message": "Bene eliminato con successo"}


@router.get("/{bene_id}/movimenti")
async def get_movimenti_bene(bene_id: int):
    """Ottiene tutti i movimenti collegati a un bene"""
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT id FROM beni WHERE id = ?", (bene_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
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
            WHERE m.bene_id = ?
            ORDER BY m.data DESC
            """,
            (bene_id,)
        )
        
        return [dict_from_row(row) for row in cursor.fetchall()]


@router.get("/{bene_id}/tco")
async def get_tco_breakdown(bene_id: int):
    """Calcola il TCO dettagliato di un bene
    
    Returns:
    {
      "costi_diretti": { "carburante": 5500, "manutenzione": 2800, ... },
      "ammortamento": 2720,
      "valore_residuo": 5000,
      "tco_totale": 12500,
      "metriche": { "costo_per_km": 5.75, "eta_anni": 4.2, ... }
    }
    """
    with get_db_connection() as conn:
        # Recupera bene
        cursor = conn.execute("SELECT * FROM beni WHERE id = ?", (bene_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        bene = dict_from_row(row)
        
        # Recupera tutti i movimenti
        cursor = conn.execute(
            """
            SELECT 
                m.*,
                c.nome as categoria_nome
            FROM movimenti m
            LEFT JOIN categorie c ON m.categoria_id = c.id
            WHERE m.bene_id = ? AND m.tipo = 'uscita'
            ORDER BY m.data
            """,
            (bene_id,)
        )
        movimenti = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Raggruppa costi per categoria
        costi_diretti = {}
        for mov in movimenti:
            categoria = mov.get('categoria_nome') or 'Altro'
            costi_diretti[categoria] = costi_diretti.get(categoria, 0) + mov['importo']
        
        # Arrotonda
        costi_diretti = {k: round(v, 2) for k, v in costi_diretti.items()}
        
        # Calcola ammortamento
        data_acq = datetime.fromisoformat(bene['data_acquisto']).date()
        oggi = date.today()
        eta_anni = (oggi - data_acq).days / 365.25
        
        ammortamento = 0
        if bene.get('durata_anni_stimata') and bene['prezzo_acquisto']:
            tasso = bene.get('tasso_ammortamento') or (1 / bene['durata_anni_stimata'])
            ammortamento = bene['prezzo_acquisto'] * tasso * eta_anni
        
        ammortamento = round(ammortamento, 2)
        
        # Costi fissi annuali (assicurazione, bollo, IMU, ecc.)
        costi_fissi_annuali = 0
        if bene['tipo'] == 'veicolo':
            if bene.get('veicolo_assicurazione_annuale'):
                costi_fissi_annuali += bene['veicolo_assicurazione_annuale']
            if bene.get('veicolo_bollo_annuale'):
                costi_fissi_annuali += bene['veicolo_bollo_annuale']
        elif bene['tipo'] == 'immobile':
            if bene.get('immobile_imu_annuale'):
                costi_fissi_annuali += bene['immobile_imu_annuale']
            if bene.get('immobile_spese_condominiali_mensili'):
                costi_fissi_annuali += bene['immobile_spese_condominiali_mensili'] * 12
        
        costi_fissi_totali = round(costi_fissi_annuali * eta_anni, 2)
        
        # Totale costi diretti
        totale_diretti = sum(costi_diretti.values())
        
        # Valore residuo
        valore_residuo = bene.get('valore_residuo') or 0
        
        # TCO totale
        tco_totale = round(
            bene['prezzo_acquisto'] + totale_diretti + ammortamento + costi_fissi_totali - valore_residuo,
            2
        )
        
        # Metriche
        metriche = {
            "eta_anni": round(eta_anni, 1),
            "prezzo_acquisto": bene['prezzo_acquisto'],
            "num_movimenti": len(movimenti)
        }
        
        if bene['tipo'] == 'veicolo' and bene.get('veicolo_km_attuali'):
            km_totali = bene['veicolo_km_attuali'] - (bene.get('veicolo_km_iniziali') or 0)
            metriche['km_totali'] = km_totali
            if km_totali > 0:
                metriche['costo_per_km'] = round(tco_totale / km_totali, 2)
        elif bene['tipo'] == 'attrezzatura' and bene.get('attrezzatura_ore_utilizzo'):
            metriche['ore_utilizzo'] = bene['attrezzatura_ore_utilizzo']
            if bene['attrezzatura_ore_utilizzo'] > 0:
                metriche['costo_per_ora'] = round(tco_totale / bene['attrezzatura_ore_utilizzo'], 2)
        elif bene['tipo'] == 'immobile':
            if bene.get('immobile_mq'):
                metriche['mq'] = bene['immobile_mq']
                metriche['costo_per_mq'] = round(tco_totale / bene['immobile_mq'], 2)
        
        return {
            "costi_diretti": costi_diretti,
            "costi_fissi": round(costi_fissi_totali, 2),
            "ammortamento": ammortamento,
            "valore_residuo": valore_residuo,
            "totale_costi_diretti": round(totale_diretti, 2),
            "tco_totale": tco_totale,
            "metriche": metriche
        }


@router.get("/{bene_id}/costi-tempo")
async def get_costi_tempo(
    bene_id: int,
    period: str = Query("6m", description="Periodo: 1m, 3m, 6m, 1y, all")
):
    """Ottiene la serie temporale dei costi di un bene
    
    Returns: [{ periodo: 'Gen 2026', costo: 450 }, ...]
    """
    with get_db_connection() as conn:
        # Verifica bene
        cursor = conn.execute("SELECT id FROM beni WHERE id = ?", (bene_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Bene non trovato")
        
        # Determina periodo
        period_map = {"1m": 1, "3m": 3, "6m": 6, "1y": 12, "all": 999}
        mesi = period_map.get(period, 6)
        
        query = """
            SELECT 
                strftime('%Y-%m', data) as mese,
                SUM(importo) as totale
            FROM movimenti
            WHERE bene_id = ? AND tipo = 'uscita'
        """
        
        params = [bene_id]
        
        if mesi < 999:
            query += " AND date(data) >= date('now', '-' || ? || ' months')"
            params.append(mesi)
        
        query += " GROUP BY mese ORDER BY mese ASC"
        
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        
        # Formatta risultati
        mesi_italiani = {
            1: 'Gen', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'Mag', 6: 'Giu',
            7: 'Lug', 8: 'Ago', 9: 'Set', 10: 'Ott', 11: 'Nov', 12: 'Dic'
        }
        
        risultati = []
        for row in rows:
            mese_str = row[0]
            anno, mese_num = mese_str.split('-')
            mese_nome = f"{mesi_italiani[int(mese_num)]} {anno}"
            
            risultati.append({
                "periodo": mese_nome,
                "costo": round(row[1], 2)
            })
        
        return risultati
