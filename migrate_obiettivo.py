#!/usr/bin/env python3
"""
Universal Database Migration Script
Adds obiettivo_id column to movimenti table

Supports: SQLite, PostgreSQL, MySQL
"""

import os
import sys
import glob
from pathlib import Path

def find_sqlite_databases():
    """Find all SQLite database files in the project."""
    print("🔍 Searching for SQLite databases...\n")
    
    project_root = Path.cwd()
    patterns = [
        "database/**/*.db",
        "database/**/*.sqlite",
        "database/**/*.sqlite3",
        "backend/**/*.db",
        "**/*.db"
    ]
    
    found_dbs = []
    for pattern in patterns:
        found_dbs.extend(project_root.glob(pattern))
    
    # Remove duplicates
    found_dbs = list(set(found_dbs))
    
    if found_dbs:
        print(f"✅ Found {len(found_dbs)} database file(s):\n")
        for i, db in enumerate(found_dbs, 1):
            size = db.stat().st_size if db.exists() else 0
            print(f"  [{i}] {db}")
            print(f"      Size: {size:,} bytes")
            print()
    else:
        print("❌ No SQLite databases found.")
        print("\n💡 Tips:")
        print("  - Make sure you've run the backend at least once")
        print("  - Check if you're using PostgreSQL/MySQL instead")
        print("  - The database might be in a different location")
    
    return found_dbs

def migrate_sqlite(db_path):
    """Apply migration to SQLite database."""
    import sqlite3
    
    try:
        print(f"\n🔧 Migrating: {db_path}")
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if movimenti table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='movimenti'
        """)
        
        if not cursor.fetchone():
            print("⚠️  Table 'movimenti' not found in this database")
            conn.close()
            return False
        
        # Check if obiettivo_id already exists
        cursor.execute("PRAGMA table_info(movimenti)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'obiettivo_id' in columns:
            print("✅ Column 'obiettivo_id' already exists!")
            conn.close()
            return True
        
        # Add obiettivo_id column
        print("   ➕ Adding obiettivo_id column...")
        cursor.execute("""
            ALTER TABLE movimenti 
            ADD COLUMN obiettivo_id INTEGER
        """)
        
        # Create index
        print("   📊 Creating index...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_movimenti_obiettivo 
            ON movimenti(obiettivo_id)
        """)
        
        conn.commit()
        
        # Verify
        cursor.execute("PRAGMA table_info(movimenti)")
        columns_after = [col[1] for col in cursor.fetchall()]
        
        if 'obiettivo_id' in columns_after:
            print("   ✅ Migration successful!")
            success = True
        else:
            print("   ❌ Migration failed")
            success = False
        
        conn.close()
        return success
        
    except sqlite3.Error as e:
        print(f"   ❌ Error: {e}")
        return False

def migrate_postgresql():
    """Apply migration to PostgreSQL database."""
    try:
        import psycopg2
        from dotenv import load_dotenv
        
        load_dotenv()
        
        print("\n🐘 Connecting to PostgreSQL...")
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'lume_finance'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '')
        )
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='movimenti' AND column_name='obiettivo_id'
        """)
        
        if cursor.fetchone():
            print("✅ Column 'obiettivo_id' already exists!")
            conn.close()
            return True
        
        # Add column
        print("   ➕ Adding obiettivo_id column...")
        cursor.execute("""
            ALTER TABLE movimenti 
            ADD COLUMN obiettivo_id INTEGER REFERENCES obiettivi_risparmio(id)
        """)
        
        # Create index
        print("   📊 Creating index...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_movimenti_obiettivo 
            ON movimenti(obiettivo_id)
        """)
        
        conn.commit()
        conn.close()
        
        print("   ✅ Migration successful!")
        return True
        
    except ImportError:
        print("⚠️  psycopg2 not installed. Run: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("="*60)
    print("🚀 Lume Finance - Database Migration")
    print("   Adding obiettivo_id to movimenti table")
    print("="*60)
    print()
    
    # Try SQLite first
    sqlite_dbs = find_sqlite_databases()
    
    if sqlite_dbs:
        print("\n" + "="*60)
        
        if len(sqlite_dbs) == 1:
            # Auto-migrate the only database found
            db = sqlite_dbs[0]
            success = migrate_sqlite(db)
        else:
            # Let user choose
            print("\nMultiple databases found. Which one to migrate?")
            choice = input("Enter number (or 'all'): ").strip().lower()
            
            if choice == 'all':
                success = all(migrate_sqlite(db) for db in sqlite_dbs)
            else:
                try:
                    idx = int(choice) - 1
                    success = migrate_sqlite(sqlite_dbs[idx])
                except (ValueError, IndexError):
                    print("❌ Invalid choice")
                    return
        
        if success:
            print("\n" + "="*60)
            print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
            print("="*60)
            print("\n📋 Next steps:")
            print("  1. Pull latest backend code from GitHub")
            print("  2. Restart your backend server")
            print("  3. Test creating an income with obiettivo")
            print()
        
    else:
        # Try PostgreSQL
        print("\n🤔 No SQLite databases found. Trying PostgreSQL...\n")
        
        choice = input("Are you using PostgreSQL? (y/n): ").strip().lower()
        if choice == 'y':
            migrate_postgresql()
        else:
            print("\n❌ Could not find database.")
            print("\nPlease:")
            print("  1. Run the backend at least once to create the database")
            print("  2. Check if the database is in a different location")
            print("  3. Or provide the database path manually")
            print()
            manual_path = input("Enter database path (or press Enter to exit): ").strip()
            if manual_path and os.path.exists(manual_path):
                migrate_sqlite(Path(manual_path))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Migration cancelled by user")
        sys.exit(1)
