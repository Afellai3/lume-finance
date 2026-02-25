@echo off
title Lume Finance - Avvio Automatico

echo ========================================
echo    💡 LUME FINANCE - AVVIO RAPIDO
echo ========================================
echo.

echo [1/3] Verifica prerequisiti...

:: Verifica Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python non trovato! Installa Python 3.10+ da python.org
    pause
    exit /b 1
)

:: Verifica Node.js
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non trovato! Installa Node.js da nodejs.org
    pause
    exit /b 1
)

echo ✅ Python e Node.js trovati
echo.

echo [2/3] Avvio Backend (Python/FastAPI)...
start "Lume Backend" cmd /k "python run.py"

:: Attendi 3 secondi per far partire il backend
echo Attendo avvio backend...
timeout /t 3 /nobreak >nul

echo ✅ Backend avviato su http://localhost:8000
echo.

echo [3/3] Avvio Frontend (React)...
cd frontend
start "Lume Frontend" cmd /k "npm run dev"

:: Attendi 5 secondi per far compilare Vite
echo Attendo compilazione frontend...
timeout /t 5 /nobreak >nul

echo ✅ Frontend avviato su http://localhost:3000
echo.
echo ========================================
echo    🎉 LUME FINANCE È PRONTO!
echo ========================================
echo.
echo 📱 Apertura browser automatica...
start http://localhost:3000

echo.
echo ℹ️  Per fermare i server, chiudi le finestre:
echo    - "Lume Backend"
echo    - "Lume Frontend"
echo.
echo Premi un tasto per chiudere questo terminale...
pause >nul
