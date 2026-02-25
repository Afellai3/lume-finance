@echo off
title Lume Finance - Avvio Automatico

echo ========================================
echo    💡 LUME FINANCE - AVVIO RAPIDO
echo ========================================
echo.

echo [1/3] Verifica prerequisiti...

:: Verifica Python (prova diverse varianti)
set PYTHON_CMD=

py --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
    goto :python_found
)

python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python3
    goto :python_found
)

python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    goto :python_found
)

echo ❌ Python non trovato!
echo.
echo Per installare Python:
echo 1. Vai su https://python.org/downloads
echo 2. Scarica Python 3.10 o superiore
echo 3. IMPORTANTE: Spunta "Add Python to PATH" durante l'installazione
echo.
pause
exit /b 1

:python_found
echo ✅ Python trovato (%PYTHON_CMD%)

:: Verifica Node.js
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non trovato! Installa Node.js da nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js trovato
echo.

echo [2/3] Avvio Backend (Python/FastAPI)...
start "Lume Backend" cmd /k "%PYTHON_CMD% run.py"

:: Attendi 3 secondi per far partire il backend
echo Attendo avvio backend...
timeout /t 3 /nobreak >nul

echo ✅ Backend avviato su http://localhost:8000
echo.

echo [3/3] Avvio Frontend (React)...
cd frontend

:: Verifica se node_modules esiste
if not exist "node_modules" (
    echo 📦 Prima esecuzione: installazione dipendenze...
    call npm install
    echo.
)

start "Lume Frontend" cmd /k "npm run dev"
cd ..

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
echo 📚 Documentazione API: http://localhost:8000/docs
echo.
echo ℹ️  Per fermare i server, chiudi le finestre:
echo    - "Lume Backend" (finestra nera con Python)
echo    - "Lume Frontend" (finestra con Vite)
echo.
echo ⚠️  NON chiudere questa finestra se vuoi tenere
echo    il browser aperto. Puoi minimizzarla.
echo.
echo Premi un tasto per chiudere questo terminale launcher...
pause >nul
