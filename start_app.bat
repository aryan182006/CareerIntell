@echo off
title CareerIntell - Server Launcher
echo =======================================================
echo          Starting CareerIntell System Servers
echo =======================================================
echo.

echo 1. Starting Backend FastAPI Server on http://127.0.0.1:8000 ...
start "CareerIntell Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo 2. Starting Frontend React + Vite Server on http://localhost:5173 ...
start "CareerIntell Frontend (Vite)" cmd /k "cd /d %~dp0 && npm.cmd run dev"

timeout /t 3 /nobreak >nul

echo.
echo 3. Opening Application in your default browser...
start http://localhost:5173

echo.
echo Both servers have been launched!
echo - Web Application: http://localhost:5173
echo - Access Hub:       file:///%~dp0launch.html
echo - Backend Docs:     http://127.0.0.1:8001/docs
echo.
pause
