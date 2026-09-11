# ==============================================================================
# SentinelVision AI — Windows PowerShell Development Launcher
# ==============================================================================

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " SentinelVision AI — Command Center Local Launcher" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
Set-Location $WorkspaceRoot

# 1. Virtual Environment Setup
if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "[1/3] Creating Python 3.13 Virtual Environment (venv)..." -ForegroundColor Yellow
    py -3.13 -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Fallback: Attempting default python virtual environment creation..." -ForegroundColor Yellow
        python -m venv venv
    }
} else {
    Write-Host "[1/3] Virtual environment (venv) detected." -ForegroundColor Green
}

# 2. Dependencies
Write-Host "[2/3] Verifying Python & Frontend dependencies..." -ForegroundColor Yellow
.\venv\Scripts\pip install -q -r backend\requirements.txt

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
}

# 3. Launch Servers
Write-Host "[3/3] Launching SentinelVision AI Services..." -ForegroundColor Green
Write-Host "  Backend  -> http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  Frontend -> http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Docs API -> http://127.0.0.1:8000/docs" -ForegroundColor Cyan

$BackendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot'; `$env:PYTHONPATH='.'; .\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

$FrontendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\frontend'; npm run dev" -PassThru

Write-Host "`nBoth services launched in synchronized development mode." -ForegroundColor Green
Write-Host "Press any key to exit this launcher window (subprocesses remain active)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
