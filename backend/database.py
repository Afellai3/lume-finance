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
        # Verifica se database esiste e ha tabelle
        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='conti'"
        )
        db_exists = cursor.fetchone() is not None
        
        if not db_exists:
            # Database nuovo, esegui schema completo
            print("Creating new database...")
            with open("database/schema.sql") as f:
                conn.executescript(f.read())
            print("  ✓ Schema created")
        else:
            print("Database already exists, skipping schema")
        
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
                    error_msg = str(e).lower()
                    # Ignora errori per elementi già esistenti
                    if any(phrase in error_msg for phrase in [
                        "duplicate column name",
                        "already exists",
                        "table", 
                        "index"
                    ]):
                        print(f"  → {migration_file.name} already applied")
                    else:
                        print(f"  ✗ Error in {migration_file.name}: {e}")
                        raise
        
        # Verifica se database è vuoto (nessun dato)
        cursor = conn.execute("SELECT COUNT(*) FROM conti")
        if cursor.fetchone()[0] == 0:
            # Esegui seed solo se vuoto
            print("Database is empty, loading seed data...")
            with open("database/seed_data.sql") as f:
                conn.executescript(f.read())
            print("  ✓ Seed data loaded")
        else:
            print("Database has data, skipping seed")
        
        conn.commit()
        print("✓ Database initialized successfully")
