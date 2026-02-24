"""Configurazione database e connessione SQLite"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Optional
import os

# Path al database
DB_PATH = os.getenv("DATABASE_PATH", "../database/lume.db")


def get_db_path() -> Path:
    """Ottiene il path assoluto del database"""
    current_dir = Path(__file__).parent
    db_path = current_dir / DB_PATH
    return db_path


@contextmanager
def get_db_connection():
    """Context manager per connessione database con commit/rollback automatico"""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row  # Abilita accesso colonne per nome
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database():
    """Inizializza il database eseguendo lo schema"""
    db_path = get_db_path()
    
    # Controlla se il database esiste già
    if db_path.exists():
        print(f"Database già esistente: {db_path}")
        return
    
    # Crea directory se non esiste
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Esegue lo schema
    schema_path = db_path.parent / "schema.sql"
    
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema non trovato: {schema_path}")
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    with get_db_connection() as conn:
        conn.executescript(schema_sql)
    
    print(f"Database creato: {db_path}")
    
    # Carica dati di esempio se esistono
    seed_path = db_path.parent / "seed_data.sql"
    if seed_path.exists():
        with open(seed_path, 'r', encoding='utf-8') as f:
            seed_sql = f.read()
        
        with get_db_connection() as conn:
            conn.executescript(seed_sql)
        
        print("Dati di esempio caricati")


def dict_from_row(row: sqlite3.Row) -> dict:
    """Converte una Row SQLite in dizionario"""
    return {key: row[key] for key in row.keys()}


if __name__ == "__main__":
    # Test connessione
    print("Test connessione database...")
    init_database()
    
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"\nTabelle trovate ({len(tables)}):")
        for table in tables:
            print(f"  - {table[0]}")