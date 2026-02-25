#!/usr/bin/env python3
"""Script per reset completo del database con seed data"""

import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "lume.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"
SEED_PATH = Path(__file__).parent / "seed_data.sql"
MIGRATIONS_DIR = Path(__file__).parent / "migrations"

def reset_database():
    """Ricrea database da zero"""
    
    # Rimuovi database esistente
    if DB_PATH.exists():
        print(f"🗑️  Rimuovo database esistente: {DB_PATH}")
        os.remove(DB_PATH)
    
    # Crea nuovo database
    print(f"📦 Creo nuovo database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    
    # Applica schema
    print("🏗️  Applico schema...")
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
        conn.executescript(schema_sql)
    
    # Applica migrations (se esistono)
    if MIGRATIONS_DIR.exists():
        migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        for migration_file in migration_files:
            print(f"🔧 Applico migration: {migration_file.name}")
            with open(migration_file, 'r', encoding='utf-8') as f:
                try:
                    conn.executescript(f.read())
                except sqlite3.OperationalError as e:
                    # Ignora errori per colonne già esistenti
                    if "duplicate column name" not in str(e):
                        raise
    
    # Carica seed data
    print("🌱 Carico dati di esempio...")
    with open(SEED_PATH, 'r', encoding='utf-8') as f:
        seed_sql = f.read()
        conn.executescript(seed_sql)
    
    conn.commit()
    conn.close()
    
    print("✅ Database ricreato con successo!")
    print(f"📍 Path: {DB_PATH.absolute()}")

if __name__ == "__main__":
    reset_database()
