@echo off
echo.
echo ========================================
echo   EARNSURE - SECURE AUTH SYSTEM
echo ========================================
echo.
echo Starting backend with new authentication...
echo.

cd backend
start cmd /k "echo Backend Server && npm start"

timeout /t 3 /nobreak >nul

echo.
echo Backend started on port 5000
echo.
echo Default Admin Account:
echo   Email: admin@earnsure.com
echo   Password: admin123
echo.
echo To create worker account:
echo   1. Go to landing page
echo   2. Click "Get Protected"
echo   3. Click "Sign Up" tab
echo   4. Fill in email + password
echo.
echo Press any key to start frontend...
pause >nul

cd ..
npm run dev
