"""Servizio per calcolo scomposizione costi dettagliati"""

from typing import Dict, List, Optional
from datetime import datetime, date
import sqlite3


class CostCalculator:
    """Calcolatore costi per veicoli ed elettrodomestici"""
    
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn
    
    def calcola_costo_veicolo(
        self,
        bene_id: int,
        km_percorsi: float,
        costo_carburante: float,
        prezzo_carburante_al_litro: Optional[float] = None
    ) -> Dict:
        """Calcola scomposizione costi per utilizzo veicolo"""
        
        # Recupera dati veicolo
        cursor = self.conn.execute(
            """
            SELECT 
                nome,
                prezzo_acquisto,
                data_acquisto,
                veicolo_tipo_carburante,
                veicolo_consumo_medio,
                veicolo_costo_manutenzione_per_km,
                durata_anni_stimata,
                tasso_ammortamento
            FROM beni
            WHERE id = ? AND tipo = 'veicolo'
            """,
            (bene_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise ValueError("Veicolo non trovato")
        
        (
            nome,
            prezzo_acquisto,
            data_acquisto,
            tipo_carburante,
            consumo_medio,
            costo_manutenzione_per_km,
            durata_anni,
            tasso_ammortamento
        ) = row
        
        scomposizione = []
        
        # 1. COSTO CARBURANTE
        scomposizione.append({
            "tipo": "carburante",
            "descrizione": f"Carburante ({tipo_carburante})",
            "importo": round(costo_carburante, 2),
            "dettagli": {
                "km_percorsi": km_percorsi,
                "consumo_medio": consumo_medio,
                "tipo_carburante": tipo_carburante,
                "litri_consumati": round((km_percorsi * consumo_medio) / 100, 2) if consumo_medio else None,
                "prezzo_al_litro": prezzo_carburante_al_litro
            }
        })
        
        # 2. USURA E MANUTENZIONE
        costo_usura = km_percorsi * (costo_manutenzione_per_km or 0.08)
        scomposizione.append({
            "tipo": "usura",
            "descrizione": "Usura e manutenzione",
            "importo": round(costo_usura, 2),
            "dettagli": {
                "km_percorsi": km_percorsi,
                "costo_per_km": costo_manutenzione_per_km or 0.08,
                "include": [
                    "Cambio olio",
                    "Filtri",
                    "Pneumatici",
                    "Freni",
                    "Revisioni"
                ]
            }
        })
        
        # 3. AMMORTAMENTO
        anni_utilizzo = (datetime.now().date() - datetime.fromisoformat(data_acquisto).date()).days / 365.25
        costo_ammortamento_annuo = prezzo_acquisto * ((tasso_ammortamento or 15) / 100)
        costo_ammortamento_per_km = costo_ammortamento_annuo / 15000  # Media 15.000 km/anno
        costo_ammortamento = km_percorsi * costo_ammortamento_per_km
        
        valore_residuo = prezzo_acquisto * (1 - ((tasso_ammortamento or 15) / 100) * anni_utilizzo)
        valore_residuo = max(valore_residuo, prezzo_acquisto * 0.15)  # Minimo 15% valore iniziale
        
        scomposizione.append({
            "tipo": "ammortamento",
            "descrizione": "Ammortamento veicolo",
            "importo": round(costo_ammortamento, 2),
            "dettagli": {
                "prezzo_acquisto": prezzo_acquisto,
                "valore_residuo": round(valore_residuo, 2),
                "anni_utilizzo": round(anni_utilizzo, 2),
                "tasso_annuo": tasso_ammortamento or 15,
                "km_percorsi": km_percorsi
            }
        })
        
        # Totale
        totale = sum(item["importo"] for item in scomposizione)
        
        return {
            "bene_id": bene_id,
            "bene_nome": nome,
            "bene_tipo": "veicolo",
            "costo_diretto": costo_carburante,
            "costo_totale": round(totale, 2),
            "costo_nascosto": round(totale - costo_carburante, 2),
            "scomposizione": scomposizione,
            "riepilogo": {
                "costo_per_km": round(totale / km_percorsi, 2) if km_percorsi > 0 else 0
            }
        }
    
    def calcola_costo_elettrodomestico(
        self,
        bene_id: int,
        ore_utilizzo: float,
        tariffa_kwh: float = 0.25
    ) -> Dict:
        """Calcola scomposizione costi per utilizzo elettrodomestico"""
        
        # Recupera dati elettrodomestico
        cursor = self.conn.execute(
            """
            SELECT 
                nome,
                prezzo_acquisto,
                data_acquisto,
                elettrodomestico_potenza,
                elettrodomestico_ore_medie_giorno,
                durata_anni_stimata
            FROM beni
            WHERE id = ? AND tipo = 'elettrodomestico'
            """,
            (bene_id,)
        )
        
        row = cursor.fetchone()
        if not row:
            raise ValueError("Elettrodomestico non trovato")
        
        (
            nome,
            prezzo_acquisto,
            data_acquisto,
            potenza_watt,
            ore_medie_giorno,
            durata_anni
        ) = row
        
        scomposizione = []
        
        # 1. CONSUMO ENERGETICO
        kwh_consumati = (potenza_watt * ore_utilizzo) / 1000
        costo_energia = kwh_consumati * tariffa_kwh
        
        scomposizione.append({
            "tipo": "energia",
            "descrizione": "Consumo elettrico",
            "importo": round(costo_energia, 2),
            "dettagli": {
                "potenza_watt": potenza_watt,
                "ore_utilizzo": ore_utilizzo,
                "kwh_consumati": round(kwh_consumati, 2),
                "tariffa_kwh": tariffa_kwh
            }
        })
        
        # 2. AMMORTAMENTO
        anni_utilizzo = (datetime.now().date() - datetime.fromisoformat(data_acquisto).date()).days / 365.25
        ore_vita_totale = (durata_anni or 10) * 365 * (ore_medie_giorno or 1)
        costo_per_ora = prezzo_acquisto / ore_vita_totale
        costo_ammortamento = ore_utilizzo * costo_per_ora
        
        ore_utilizzo_totali = anni_utilizzo * 365 * (ore_medie_giorno or 1)
        percentuale_vita = min((ore_utilizzo_totali / ore_vita_totale) * 100, 100)
        
        scomposizione.append({
            "tipo": "ammortamento",
            "descrizione": "Ammortamento elettrodomestico",
            "importo": round(costo_ammortamento, 2),
            "dettagli": {
                "prezzo_acquisto": prezzo_acquisto,
                "durata_stimata_anni": durata_anni or 10,
                "ore_vita_totale": round(ore_vita_totale, 0),
                "percentuale_vita_utilizzata": round(percentuale_vita, 1),
                "ore_utilizzo": ore_utilizzo
            }
        })
        
        # Totale
        totale = sum(item["importo"] for item in scomposizione)
        
        return {
            "bene_id": bene_id,
            "bene_nome": nome,
            "bene_tipo": "elettrodomestico",
            "costo_diretto": round(costo_energia, 2),
            "costo_totale": round(totale, 2),
            "costo_nascosto": round(totale - costo_energia, 2),
            "scomposizione": scomposizione,
            "riepilogo": {
                "costo_per_ora": round(totale / ore_utilizzo, 4) if ore_utilizzo > 0 else 0,
                "consumo_mensile_stimato": round(kwh_consumati * 30 / ore_utilizzo, 2) if ore_utilizzo > 0 and ore_medie_giorno else 0
            }
        }
