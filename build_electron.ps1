$ErrorActionPreference = "Stop"

Write-Host "=== Phase 1: Compiling Python Backend ===" -ForegroundColor Cyan
Push-Location backend
# Clean old builds if they exist
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }

$separator = ";"
# Compile server.exe
pyinstaller --name "server" `
            --windowed `
            --onefile `
            --add-data ".env${separator}." `
            runner.py

Pop-Location

Write-Host "`n=== Phase 2: Building React Frontend ===" -ForegroundColor Cyan
Push-Location frontend
npm run build

Write-Host "`n=== Phase 3: Packaging Electron Application ===" -ForegroundColor Cyan
# Run electron builder to package the windows installer
npx electron-builder --win

Pop-Location

Write-Host "`n=== Electron Build Complete! ===" -ForegroundColor Green
Write-Host "You can find your packaged executable in the frontend/dist folder." -ForegroundColor Yellow
