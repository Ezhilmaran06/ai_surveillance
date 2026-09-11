@echo off
title AegisVision AI Command Center Launcher
color 0B

echo ======================================================================
echo           AEGISVISION AI SURVEILLANCE COMMAND CENTER
echo         Anonymous Crowd Analytics & Spatial Intelligence
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python Virtual Environment
if not exist "venv\Scripts\python.exe" (
    echo [*] Creating Python virtual environment...
    py -3.13 -m venv venv
    if errorlevel 1 (
        echo [!] Falling back to default python...
        python -m venv venv
    )
)

:: 2. Check Backend Dependencies
echo [*] Checking Backend Dependencies...
call .\venv\Scripts\activate.bat
pip install -r backend\requirements.txt

:: 3. Check Frontend Dependencies
echo [*] Checking Frontend Dependencies...
cd frontend
if not exist "node_modules\" (
    echo [*] Installing Node modules...
    call npm install
)
cd ..

:: 4. Start FastAPI Backend Server
echo.
echo [*] Launching FastAPI Surveillance Backend on http://127.0.0.1:8000 ...
start "AegisVision AI Backend" cmd /k "cd /d "%~dp0" && call .\venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 5. Start React + Vite Frontend Server
echo [*] Launching React Command Center UI on http://localhost:5173 ...
start "AegisVision AI Frontend" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

echo.
echo ======================================================================
echo [*] AegisVision AI Command Center is starting!
echo [*] Frontend: http://localhost:5173
echo [*] Backend API: http://127.0.0.1:8000/api
echo [*] API Documentation: http://127.0.0.1:8000/docs
echo ======================================================================
echo.
pause
