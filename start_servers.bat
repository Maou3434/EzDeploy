@echo off
setlocal

echo ==========================================
echo    Mini Heroku - Server Starter
echo ==========================================

:: Change directory to the script's location
cd /d "%~dp0"

:: Check for Ollama
echo [0/2] Verifying AI Infrastructure (Ollama)...
ollama --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Ollama is not installed or not in PATH. AI Build Medic will be disabled.
) else (
    echo [OK] Ollama found.
)

:: Start Backend
echo [1/2] Starting Flask Backend (Port 5000)...
start "Mini Heroku Backend" cmd /k "cd mini_heroku\backend && python api.py"

:: Give the backend a second to initialize the DB if needed
timeout /t 2 /nobreak > nul

:: Start Frontend
echo [2/2] Starting Vite Frontend...
start "Mini Heroku Frontend" cmd /k "cd mini_heroku\frontend && npm run dev"

echo.
echo ==========================================
echo    All servers are starting in new windows.
echo    Backend: http://localhost:5000
echo    Frontend: Check Vite output (usually http://localhost:5173)
echo ==========================================
echo.
pause
