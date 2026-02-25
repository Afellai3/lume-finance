"""Gestione database SQLite"""

import sqlite3
import os
from pathlib import Path
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH", "data/lume.db")


@contextmanager
def get_db_connection():
    """Context manager per connessione database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def dict_from_row(row):
    """Converte sqlite3.Row in dizionario"""
    return {key: row[key] for key in row.keys()}


def init_db():
    """Inizializza il database con schema e seed data"""
    # Crea directory data se non esiste
    Path("data").mkdir(exist_ok=True)
    
    with get_db_connection() as conn:
        # Esegui schema
        with open("database/schema.sql") as f:
            conn.executescript(f.read())
        
        # Esegui migrations se esistono
        migrations_dir = Path("database/migrations")
        if migrations_dir.exists():
            migration_files = sorted(migrations_dir.glob("*.sql"))
            for migration_file in migration_files:
                print(f"Executing migration: {migration_file.name}")
                try:
                    with open(migration_file) as f:
                        conn.executescript(f.read())
                    print(f"  ✓ {migration_file.name} completed")
                except sqlite3.OperationalError as e:
                    # Ignora errori tipo "colonna già esistente"
                    if "duplicate column name" in str(e) or "already exists" in str(e):
                        print(f"  → {migration_file.name} already applied")
                    else:
                        raise
        
        # Verifica se database è vuoto
        cursor = conn.execute("SELECT COUNT(*) FROM conti")
        if cursor.fetchone()[0] == 0:
            # Esegui seed solo se vuoto
            with open("database/seed.sql") as f:
                conn.executescript(f.read())
        
        conn.commit()
        print("✓ Database initialized successfully")
