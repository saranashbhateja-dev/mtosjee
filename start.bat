@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Starting Jee OS...
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22+ is required. Install Node.js and run this again.
  pause
  exit /b 1
)

rem Start the server as a separate minimized process.
start "Jee OS Server" /min cmd /c "cd /d ""%~dp0"" && node server.js"

rem Wait until the Jee OS health endpoint responds.
set "READY=0"
for /l %%i in (1,1,30) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3000/health' -TimeoutSec 1; if($r.StatusCode -eq 200){$ok=$true} } catch {}; if($ok){exit 0}else{exit 1}"
  if not errorlevel 1 (
    set "READY=1"
    goto ready
  )
  timeout /t 1 /nobreak >nul
)

if "%READY%"=="0" (
  echo.
  echo Jee OS did not become ready on http://127.0.0.1:3000
  echo Check the Jee OS Server window for the error.
  pause
  exit /b 1
)

:ready
echo Jee OS is ready. Opening browser...
rem Use Windows Explorer's URL handler so the default browser is opened reliably.
"%SystemRoot%\explorer.exe" "http://127.0.0.1:3000/"
exit /b 0
