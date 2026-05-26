@echo off
setlocal

cd /d "%~dp0"
set "PORT=5173"

if not exist node_modules (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 goto :fail
)

echo Starting the development server...
set "DEV_CMD=cd /d ""%~dp0"" && npm run dev -- --host 0.0.0.0 --port %PORT%"
start "Movie Recommender System" cmd /k "%DEV_CMD%"

timeout /t 4 /nobreak >nul
start "" http://localhost:%PORT%
exit /b 0

:fail
echo.
echo Failed to start the project.
pause
exit /b 1