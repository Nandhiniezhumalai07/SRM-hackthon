@echo off
title RoadWatch AI - Starting...
echo.
echo  ██████╗  ██████╗  █████╗ ██████╗ ██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗
echo  ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
echo  ██████╔╝██║   ██║███████║██║  ██║██║ █╗ ██║███████║   ██║   ██║     ███████║
echo  ██╔══██╗██║   ██║██╔══██║██║  ██║██║███╗██║██╔══██║   ██║   ██║     ██╔══██║
echo  ██║  ██║╚██████╔╝██║  ██║██████╔╝╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║
echo  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
echo.
echo  [*] Starting Backend  (FastAPI with Keep-Alive @ http://127.0.0.1:8000)
echo  [*] Starting Frontend (React   @ http://localhost:5175)
echo.

:: Start backend with keep-alive in a new window
start "RoadWatch Backend (Keep-Alive)" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0backend_keepalive.ps1"

:: Wait for backend to initialize
timeout /t 4 /nobreak >nul

:: Start frontend in a new window 
start "RoadWatch Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 5175"

:: Wait for frontend to load
timeout /t 5 /nobreak >nul

:: Open the browser
echo  [*] Opening app in browser...
start http://localhost:5175

echo.
echo  Both servers are running!
echo  Backend  : http://127.0.0.1:8000 (auto-restarts on crash)
echo  Frontend : http://localhost:5175
echo  API Docs : http://127.0.0.1:8000/docs
echo.
pause
