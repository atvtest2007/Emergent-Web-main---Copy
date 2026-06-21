@echo off
echo ===================================================
echo     Starting MaxxPlayer (Network Available Mode)
echo ===================================================

echo.
echo [1] Starting Backend API Server on 0.0.0.0:8000
echo This makes the API accessible to other devices on your local network.
start "MaxxPlayer Backend (Network)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn server:app --host 0.0.0.0 --port 8000"

echo.
echo [2] Starting Frontend Web App (Port 3000)...
start "MaxxPlayer Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both services have been launched!
echo To access from another device, use this computer's IPv4 Address.
echo.
pause
