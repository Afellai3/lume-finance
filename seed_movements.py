#!/usr/bin/env python3
"""Script per aggiungere movimenti di esempio al database"""

import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
import random

def seed_movements():
    """Aggiunge movimenti di esempio per febbraio 2026"""
    
    db_path = Path("database/lume.db")
    
    if not db_path.exists():
        print("❌ Database non trovato! Esegui prima reset_database.py")
        return
    
    print("="*60)
    print("  📊 AGGIUNTA MOVIMENTI DI ESEMPIO")
    print("="*60)
    print()
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Recupera IDs necessari
    cursor.execute("SELECT id FROM conti WHERE nome = 'Conto Corrente Principale'")
    conto_corrente_id = cursor.fetchone()[0]
    
    cursor.execute("SELECT id FROM conti WHERE nome = 'Portafoglio Contanti'")
    conto_contanti_id = cursor.fetchone()[0]
    
    cursor.execute("SELECT id FROM conti WHERE nome = 'Carta di Credito'")
    carta_credito_id = cursor.fetchone()[0]
    
    # Recupera categorie
    cursor.execute("SELECT id, nome FROM categorie")
    categorie = {nome: id for id, nome in cursor.fetchall()}
    
    # Movimenti di esempio per Febbraio 2026
    movimenti = [
        # ENTRATE
        {
            "data": "2026-02-01T09:00:00",
            "importo": 2500.00,
            "tipo": "entrata",
            "categoria_id": categorie.get("Stipendio"),
            "conto_id": conto_corrente_id,
            "descrizione": "Stipendio Febbraio 2026",
            "ricorrente": True
        },
        {
            "data": "2026-02-15T14:30:00",
            "importo": 350.00,
            "tipo": "entrata",
            "categoria_id": categorie.get("Freelance"),
            "conto_id": conto_corrente_id,
            "descrizione": "Consulenza progetto web",
            "ricorrente": False
        },
        
        # SPESE CASA E UTENZE
        {
            "data": "2026-02-05T10:00:00",
            "importo": 750.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Casa"),
            "conto_id": conto_corrente_id,
            "descrizione": "Affitto Febbraio",
            "ricorrente": True
        },
        {
            "data": "2026-02-10T11:30:00",
            "importo": 85.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Elettricità"),
            "conto_id": conto_corrente_id,
            "descrizione": "Bolletta Enel - Gennaio",
            "ricorrente": True
        },
        {
            "data": "2026-02-10T11:35:00",
            "importo": 45.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Gas"),
            "conto_id": conto_corrente_id,
            "descrizione": "Bolletta Gas - Gennaio",
            "ricorrente": True
        },
        {
            "data": "2026-02-12T09:00:00",
            "importo": 35.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Internet"),
            "conto_id": conto_corrente_id,
            "descrizione": "Abbonamento Fibra",
            "ricorrente": True
        },
        
        # TRASPORTI
        {
            "data": "2026-02-03T08:15:00",
            "importo": 55.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Carburante"),
            "conto_id": carta_credito_id,
            "descrizione": "Rifornimento Esso",
            "ricorrente": False
        },
        {
            "data": "2026-02-14T08:30:00",
            "importo": 60.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Carburante"),
            "conto_id": carta_credito_id,
            "descrizione": "Rifornimento Q8",
            "ricorrente": False
        },
        {
            "data": "2026-02-20T16:00:00",
            "importo": 25.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Parcheggio"),
            "conto_id": conto_contanti_id,
            "descrizione": "Parcheggio centro",
            "ricorrente": False
        },
        
        # CIBO E RISTORAZIONE
        {
            "data": "2026-02-02T11:00:00",
            "importo": 85.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Spesa Alimentare"),
            "conto_id": carta_credito_id,
            "descrizione": "Spesa settimanale Carrefour",
            "ricorrente": False
        },
        {
            "data": "2026-02-09T10:30:00",
            "importo": 92.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Spesa Alimentare"),
            "conto_id": carta_credito_id,
            "descrizione": "Spesa settimanale Esselunga",
            "ricorrente": False
        },
        {
            "data": "2026-02-16T11:15:00",
            "importo": 78.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Spesa Alimentare"),
            "conto_id": carta_credito_id,
            "descrizione": "Spesa settimanale Conad",
            "ricorrente": False
        },
        {
            "data": "2026-02-22T10:45:00",
            "importo": 88.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Spesa Alimentare"),
            "conto_id": carta_credito_id,
            "descrizione": "Spesa settimanale Carrefour",
            "ricorrente": False
        },
        {
            "data": "2026-02-06T13:00:00",
            "importo": 35.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Ristoranti"),
            "conto_id": conto_contanti_id,
            "descrizione": "Pranzo pizzeria",
            "ricorrente": False
        },
        {
            "data": "2026-02-14T20:00:00",
            "importo": 65.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Ristoranti"),
            "conto_id": carta_credito_id,
            "descrizione": "Cena San Valentino",
            "ricorrente": False
        },
        {
            "data": "2026-02-18T12:30:00",
            "importo": 28.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Ristoranti"),
            "conto_id": conto_contanti_id,
            "descrizione": "Pranzo sushi",
            "ricorrente": False
        },
        {
            "data": "2026-02-04T08:30:00",
            "importo": 4.50,
            "tipo": "uscita",
            "categoria_id": categorie.get("Caffè e Snack"),
            "conto_id": conto_contanti_id,
            "descrizione": "Colazione bar",
            "ricorrente": False
        },
        {
            "data": "2026-02-11T09:00:00",
            "importo": 5.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Caffè e Snack"),
            "conto_id": conto_contanti_id,
            "descrizione": "Cappuccino e cornetto",
            "ricorrente": False
        },
        {
            "data": "2026-02-19T15:30:00",
            "importo": 3.50,
            "tipo": "uscita",
            "categoria_id": categorie.get("Caffè e Snack"),
            "conto_id": conto_contanti_id,
            "descrizione": "Caffè e brioche",
            "ricorrente": False
        },
        
        # SHOPPING
        {
            "data": "2026-02-08T15:00:00",
            "importo": 45.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Shopping"),
            "conto_id": carta_credito_id,
            "descrizione": "Maglietta e calzini Zara",
            "ricorrente": False
        },
        {
            "data": "2026-02-17T16:30:00",
            "importo": 89.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Shopping"),
            "conto_id": carta_credito_id,
            "descrizione": "Scarpe Nike",
            "ricorrente": False
        },
        
        # INTRATTENIMENTO
        {
            "data": "2026-02-07T21:00:00",
            "importo": 18.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Intrattenimento"),
            "conto_id": carta_credito_id,
            "descrizione": "Cinema - 2 biglietti",
            "ricorrente": False
        },
        {
            "data": "2026-02-15T10:00:00",
            "importo": 15.99,
            "tipo": "uscita",
            "categoria_id": categorie.get("Intrattenimento"),
            "conto_id": conto_corrente_id,
            "descrizione": "Abbonamento Netflix",
            "ricorrente": True
        },
        {
            "data": "2026-02-15T10:05:00",
            "importo": 11.99,
            "tipo": "uscita",
            "categoria_id": categorie.get("Intrattenimento"),
            "conto_id": conto_corrente_id,
            "descrizione": "Abbonamento Spotify",
            "ricorrente": True
        },
        
        # SALUTE
        {
            "data": "2026-02-13T11:00:00",
            "importo": 65.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Salute"),
            "conto_id": conto_corrente_id,
            "descrizione": "Visita dentista",
            "ricorrente": False
        },
        {
            "data": "2026-02-21T09:30:00",
            "importo": 22.50,
            "tipo": "uscita",
            "categoria_id": categorie.get("Salute"),
            "conto_id": conto_contanti_id,
            "descrizione": "Farmacia - medicinali",
            "ricorrente": False
        },
        
        # CURA PERSONALE
        {
            "data": "2026-02-11T15:00:00",
            "importo": 25.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Cura Personale"),
            "conto_id": conto_contanti_id,
            "descrizione": "Parrucchiere",
            "ricorrente": False
        },
        
        # RISPARMIO
        {
            "data": "2026-02-01T12:00:00",
            "importo": 300.00,
            "tipo": "uscita",
            "categoria_id": categorie.get("Risparmi"),
            "conto_id": conto_corrente_id,
            "descrizione": "Accantonamento mensile fondo emergenze",
            "ricorrente": True
        },
    ]
    
    print("📝 Inserimento movimenti...\n")
    
    inserted = 0
    for movimento in movimenti:
        try:
            cursor.execute(
                """
                INSERT INTO movimenti 
                (data, importo, tipo, categoria_id, conto_id, descrizione, ricorrente)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    movimento["data"],
                    movimento["importo"],
                    movimento["tipo"],
                    movimento["categoria_id"],
                    movimento["conto_id"],
                    movimento["descrizione"],
                    movimento["ricorrente"]
                )
            )
            inserted += 1
            
            # Aggiorna saldo conto
            if movimento["tipo"] == "entrata":
                cursor.execute(
                    "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                    (movimento["importo"], movimento["conto_id"])
                )
            else:
                cursor.execute(
                    "UPDATE conti SET saldo = saldo - ? WHERE id = ?",
                    (movimento["importo"], movimento["conto_id"])
                )
            
            print(f"  ✅ {movimento['descrizione']} ({movimento['importo']:.2f} €)")
            
        except Exception as e:
            print(f"  ❌ Errore: {movimento['descrizione']} - {e}")
    
    conn.commit()
    
    print(f"\n{'='*60}")
    print(f"  ✅ {inserted} MOVIMENTI INSERITI")
    print(f"{'='*60}\n")
    
    # Statistiche finali
    cursor.execute("SELECT COUNT(*) FROM movimenti WHERE tipo = 'entrata'")
    entrate_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM movimenti WHERE tipo = 'uscita'")
    uscite_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(importo) FROM movimenti WHERE tipo = 'entrata'")
    entrate_totale = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT SUM(importo) FROM movimenti WHERE tipo = 'uscita'")
    uscite_totale = cursor.fetchone()[0] or 0
    
    print("📊 Riepilogo Movimenti Febbraio 2026:\n")
    print(f"  💰 Entrate: {entrate_count} movimenti = {entrate_totale:.2f} €")
    print(f"  💸 Uscite: {uscite_count} movimenti = {uscite_totale:.2f} €")
    print(f"  {'='*50}")
    print(f"  📈 Saldo: {entrate_totale - uscite_totale:.2f} €\n")
    
    # Saldi conti aggiornati
    cursor.execute("SELECT nome, saldo, valuta FROM conti ORDER BY id")
    print("💳 Saldi Conti Aggiornati:\n")
    for nome, saldo, valuta in cursor.fetchall():
        print(f"  {nome}: {saldo:.2f} {valuta}")
    
    conn.close()
    
    print(f"\n{'='*60}")
    print("  🎉 DATABASE POPOLATO CON SUCCESSO!")
    print(f"{'='*60}")
    print("\n🌐 Ricarica http://localhost:3000 per vedere la dashboard piena!\n")

if __name__ == "__main__":
    try:
        seed_movements()
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        import traceback
        traceback.print_exc()
