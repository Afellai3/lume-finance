@echo off
title Lume Finance

echo ==========================================
echo    LUME FINANCE - AVVIO RAPIDO
echo ==========================================
echo.

echo [1/3] Verifica Python...
py --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Errore: Python non trovato
    echo Installa Python da python.org
    pause
    exit /b 1
)
echo OK Python trovato

echo.
echo [2/3] Avvio Backend...
start "Lume Backend" cmd /k "py run.py"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Avvio Frontend...
cd frontend
start "Lume Frontend" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo    LUME FINANCE E' PRONTO!
echo ==========================================
echo.
start http://localhost:3000
echo.
echo Chiudi le 2 finestre aperte per fermare i server
pause
