#!/bin/bash
# Script avvio Lume Finance per macOS/Linux

echo "=========================================="
echo "   💡 LUME FINANCE - AVVIO RAPIDO"
echo "=========================================="
echo ""

echo "[1/3] Verifica prerequisiti..."

# Verifica Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python non trovato! Installa Python 3.10+"
    exit 1
fi

# Verifica Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js non trovato! Installa Node.js da nodejs.org"
    exit 1
fi

echo "✅ Python e Node.js trovati"
echo ""

echo "[2/3] Avvio Backend (Python/FastAPI)..."

# Avvia backend in background
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: usa Terminal.app
    osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && python3 run.py"'
else
    # Linux: prova gnome-terminal, altrimenti xterm
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "python3 run.py; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "python3 run.py" &
    else
        python3 run.py &
        BACKEND_PID=$!
    fi
fi

echo "Attendo avvio backend..."
sleep 3
echo "✅ Backend avviato su http://localhost:8000"
echo ""

echo "[3/3] Avvio Frontend (React)..."
cd frontend

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'
else
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "npm run dev" &
    else
        npm run dev &
        FRONTEND_PID=$!
    fi
fi

echo "Attendo compilazione frontend..."
sleep 5
echo "✅ Frontend avviato su http://localhost:3000"
echo ""

echo "=========================================="
echo "   🎉 LUME FINANCE È PRONTO!"
echo "=========================================="
echo ""
echo "📱 Apertura browser automatica..."

# Apri browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 2>/dev/null || echo "Apri manualmente: http://localhost:3000"
fi

echo ""
echo "ℹ️  I server sono in esecuzione in finestre separate"
echo "   Per fermarli, chiudi le rispettive finestre o premi Ctrl+C"
echo ""
echo "📚 Documentazione API: http://localhost:8000/docs"
echo ""
