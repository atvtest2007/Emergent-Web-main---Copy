@echo off
:: Request Administrative Privileges
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges to update Windows Firewall...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
)

echo ===================================================
echo     MaxxPlayer Windows Firewall Fix
echo ===================================================
echo.
echo Adding inbound allow rule for Backend (Port 8000)...
netsh advfirewall firewall add rule name="MaxxPlayer Backend" dir=in action=allow protocol=TCP localport=8000

echo.
echo Adding inbound allow rule for Frontend (Port 3000)...
netsh advfirewall firewall add rule name="MaxxPlayer Frontend" dir=in action=allow protocol=TCP localport=3000

echo.
echo ===================================================
echo SUCCESS! Your firewall now allows incoming connections.
echo You may now access the app from your mobile device.
echo ===================================================
pause
