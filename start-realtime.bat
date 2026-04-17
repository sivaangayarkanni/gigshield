@echo off
echo.
echo ========================================
echo   EarnSure Real-Time System Launcher
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo [INSTALL] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo [OK] Backend dependencies installed
    echo.
)

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo [INSTALL] Installing frontend dependencies...
    call npm install
    echo [OK] Frontend dependencies installed
    echo.
)

echo [START] Starting backend server...
start "EarnSure Backend" cmd /k "cd backend && npm start"

echo [WAIT] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [START] Starting frontend...
start "EarnSure Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   EarnSure is now running!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:5173
echo.
echo Access Points:
echo   - Worker Portal:  Any 10-digit phone
echo   - Admin Portal:   Key: EARNSURE2026
echo   - Partner Portal: Key: ZOMATO2026
echo.
echo Close the terminal windows to stop services
echo ========================================
echo.
pause
