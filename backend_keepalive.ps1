# RoadWatch AI - Keep-Alive Backend Launcher
# This script restarts the backend automatically if it ever crashes.
Write-Host ""
Write-Host "  [*] RoadWatch AI Backend - Keep-Alive Mode" -ForegroundColor Cyan
Write-Host "  [*] Auto-restarts on crash. Press Ctrl+C twice to stop." -ForegroundColor Yellow
Write-Host ""

Set-Location "c:\road_hazard\backend"

while ($true) {
    Write-Host "  [START] Starting backend server..." -ForegroundColor Green
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
    Write-Host ""
    Write-Host "  [WARN] Backend stopped. Restarting in 2 seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 2
}
