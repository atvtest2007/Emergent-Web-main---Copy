$ErrorActionPreference = "Stop"

Write-Host "Installing Python requirements..." -ForegroundColor Cyan
pip install pywebview pyinstaller uvicorn fastapi httpx aiosqlite pydantic python-dotenv

Write-Host "`nBuilding React Frontend..." -ForegroundColor Cyan
Push-Location frontend
npm install
npm run build
Pop-Location

Write-Host "`nBuilding Windows Executable..." -ForegroundColor Cyan
Push-Location backend

# Ensure we use the correct separator for Windows add-data
$separator = ";"

# PyInstaller command:
# --name "MaxxPlayer"
# --windowed (no console window)
# --onefile (single executable)
# --add-data "frontend/build;frontend/build" (bundle the React build)
pyinstaller --name "MaxxPlayer" `
            --windowed `
            --onefile `
            --add-data "../frontend/build${separator}frontend/build" `
            --add-data ".env${separator}." `
            desktop.py

Pop-Location

Write-Host "`nBuild Complete!" -ForegroundColor Green
Write-Host "Executable is located at: backend/dist/MaxxPlayer.exe" -ForegroundColor Yellow
