@echo off
echo ===================================================
echo             Starting MaxxPlayer Services
echo ===================================================

echo.
echo [1] Starting Backend API Server (Port 8000)...
start "MaxxPlayer Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn server:app --host 127.0.0.1 --port 8000"

echo.
echo [2] Starting Frontend Web App (Port 3000)...
start "MaxxPlayer Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both services have been launched in separate windows!
echo You can now use the Desktop app or open http://localhost:3000 in your browser.
echo.
pause
