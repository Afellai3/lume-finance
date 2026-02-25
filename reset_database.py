#!/usr/bin/env python3
"""Script per resettare e ricaricare il database con dati di esempio"""

import sqlite3
from pathlib import Path
import sys

def reset_database():
    """Resetta il database e ricarica schema + dati esempio"""
    
    db_path = Path("database/lume.db")
    schema_path = Path("database/schema.sql")
    seed_path = Path("database/seed_data.sql")
    
    # Verifica che i file esistano
    if not schema_path.exists():
        print(f"❌ Errore: {schema_path} non trovato")
        sys.exit(1)
    
    if not seed_path.exists():
        print(f"❌ Errore: {seed_path} non trovato")
        sys.exit(1)
    
    print("="*50)
    print("  🔄 RESET DATABASE LUME FINANCE")
    print("="*50)
    print()
    
    # Elimina database esistente
    if db_path.exists():
        print("🗑️  Eliminazione database esistente...")
        db_path.unlink()
        print("✅ Database eliminato")
    else:
        print("🆕 Nessun database esistente")
    
    print()
    print("📊 Creazione nuovo database...")
    
    # Crea nuovo database con schema
    conn = sqlite3.connect(db_path)
    
    print("📝 Caricamento schema...")
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
        conn.executescript(schema_sql)
    
    print("✅ Schema caricato")
    
    print()
    print("📦 Caricamento dati di esempio...")
    
    # Carica dati di esempio
    with open(seed_path, 'r', encoding='utf-8') as f:
        seed_sql = f.read()
        conn.executescript(seed_sql)
    
    conn.commit()
    print("✅ Dati caricati")
    
    print()
    print("📊 Riepilogo database:")
    print()
    
    # Mostra statistiche
    cursor = conn.cursor()
    
    tables = [
        ('conti', '🏦'),
        ('beni', '🚗'),
        ('categorie', '📊'),
        ('movimenti', '💸'),
        ('budget', '🎯'),
        ('obiettivi_risparmio', '💰'),
        ('centri_costo', '🏢')
    ]
    
    for table, icon in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  {icon} {table.replace('_', ' ').title()}: {count}")
    
    # Mostra conti con saldi
    print()
    print("💳 Conti creati:")
    cursor.execute("SELECT nome, tipo, saldo, valuta FROM conti ORDER BY id")
    for nome, tipo, saldo, valuta in cursor.fetchall():
        print(f"  - {nome} ({tipo}): {saldo:.2f} {valuta}")
    
    # Mostra beni
    print()
    print("🚗 Beni creati:")
    cursor.execute("SELECT nome, tipo FROM beni ORDER BY id")
    for nome, tipo in cursor.fetchall():
        print(f"  - {nome} ({tipo})")
    
    conn.close()
    
    print()
    print("="*50)
    print("  ✅ DATABASE PRONTO!")
    print("="*50)
    print()
    print("🌐 Ricarica il browser su http://localhost:3000")
    print("   per vedere i dati aggiornati!")
    print()

if __name__ == "__main__":
    try:
        reset_database()
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        sys.exit(1)
