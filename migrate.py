import sqlite3

# Trova il tuo database (prova questi path)
possible_paths = [
    "backend/lume_finance.db",
    "backend/app/lume_finance.db",
    "lume_finance.db",
    "backend/database.db"
]

for db_path in possible_paths:
    try:
        print(f"🔍 Trying {db_path}...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verifica se esiste la tabella movimenti
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='movimenti'")
        if cursor.fetchone():
            print(f"✅ Found database at {db_path}!")
            
            # Aggiungi colonna
            try:
                cursor.execute("ALTER TABLE movimenti ADD COLUMN obiettivo_id INTEGER")
                print("✅ Added obiettivo_id column")
            except sqlite3.OperationalError as e:
                if "duplicate" in str(e):
                    print("⚠️  Column already exists")
                else:
                    raise
            
            # Crea indice
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_movimenti_obiettivo ON movimenti(obiettivo_id)")
            print("✅ Created index")
            
            conn.commit()
            conn.close()
            
            print("\n🎉 MIGRATION COMPLETED!")
            exit(0)
            
    except Exception as e:
        continue

print("❌ Could not find database. Please check the path manually.")
