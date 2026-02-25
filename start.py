#!/usr/bin/env python3
"""Script Python multipiattaforma per avviare Lume Finance"""

import subprocess
import sys
import time
import webbrowser
import os
from pathlib import Path

def print_banner():
    print("="*50)
    print("   💡 LUME FINANCE - AVVIO RAPIDO")
    print("="*50)
    print()

def check_command(command, name):
    """Verifica se un comando è disponibile"""
    try:
        result = subprocess.run(
            [command, "--version"],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False

def main():
    print_banner()
    
    # Verifica prerequisiti
    print("[1/3] Verifica prerequisiti...")
    
    if not check_command("python", "Python"):
        print("❌ Python non trovato! Installa Python 3.10+ da python.org")
        sys.exit(1)
    
    if not check_command("npm", "Node.js"):
        print("❌ Node.js non trovato! Installa Node.js da nodejs.org")
        sys.exit(1)
    
    print("✅ Python e Node.js trovati")
    print()
    
    # Avvia backend
    print("[2/3] Avvio Backend (Python/FastAPI)...")
    
    backend_env = os.environ.copy()
    
    if sys.platform == "win32":
        # Windows: crea nuova finestra cmd
        backend_process = subprocess.Popen(
            ["python", "run.py"],
            creationflags=subprocess.CREATE_NEW_CONSOLE,
            env=backend_env
        )
    else:
        # macOS/Linux: usa terminal emulator
        if sys.platform == "darwin":
            # macOS
            script = f'tell application "Terminal" to do script "cd {Path.cwd()} && python run.py"'
            subprocess.Popen(["osascript", "-e", script])
        else:
            # Linux
            terminals = ["gnome-terminal", "xterm", "konsole"]
            for term in terminals:
                if check_command(term, term):
                    subprocess.Popen([
                        term, "--", "bash", "-c",
                        f"cd {Path.cwd()} && python run.py; exec bash"
                    ])
                    break
    
    print("Attendo avvio backend...")
    time.sleep(3)
    print("✅ Backend avviato su http://localhost:8000")
    print()
    
    # Avvia frontend
    print("[3/3] Avvio Frontend (React)...")
    
    frontend_dir = Path("frontend")
    
    if sys.platform == "win32":
        # Windows
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        # macOS/Linux
        if sys.platform == "darwin":
            script = f'tell application "Terminal" to do script "cd {frontend_dir.absolute()} && npm run dev"'
            subprocess.Popen(["osascript", "-e", script])
        else:
            for term in terminals:
                if check_command(term, term):
                    subprocess.Popen([
                        term, "--", "bash", "-c",
                        f"cd {frontend_dir.absolute()} && npm run dev; exec bash"
                    ])
                    break
    
    print("Attendo compilazione frontend...")
    time.sleep(5)
    print("✅ Frontend avviato su http://localhost:3000")
    print()
    
    print("="*50)
    print("   🎉 LUME FINANCE È PRONTO!")
    print("="*50)
    print()
    
    # Apri browser
    print("📱 Apertura browser automatica...")
    webbrowser.open("http://localhost:3000")
    
    print()
    print("ℹ️  I server sono in esecuzione in finestre separate")
    print("   Per fermarli, chiudi le rispettive finestre o premi Ctrl+C")
    print()
    print("📚 Documentazione API: http://localhost:8000/docs")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⛔ Avvio interrotto dall'utente")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        sys.exit(1)
