@echo off
echo.
echo ========================================
echo   EarnSure Feature Test Suite
echo ========================================
echo.

set API_BASE=http://localhost:5000/api
set PASSED=0
set FAILED=0

echo [TEST] Testing Backend APIs
echo ----------------------------------------

echo Testing Weather API...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/realtime/weather?lat=28.6139&lon=77.2090"
echo.

echo Testing Traffic API...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/realtime/traffic?lat=28.6139&lon=77.2090"
echo.

echo Testing Geocoding API...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/realtime/geocode?lat=28.6139&lon=77.2090"
echo.

echo Testing Forecast API...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/realtime/forecast?lat=28.6139&lon=77.2090"
echo.

echo.
echo [TEST] Testing AI Chatbot
echo ----------------------------------------

echo Testing Chatbot Status...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/chatbot/status"
echo.

echo Testing Chatbot Message...
curl -s -X POST "%API_BASE%/chatbot/message" -H "Content-Type: application/json" -d "{\"userId\":\"test123\",\"message\":\"What is the weather?\",\"context\":{\"lat\":28.6139,\"lon\":77.2090}}"
echo.

echo.
echo [TEST] Testing Admin APIs
echo ----------------------------------------

echo Testing Get Users...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/admin/users"
echo.

echo Testing Get Policies...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/admin/policies"
echo.

echo Testing Get Claims...
curl -s -o nul -w "HTTP %%{http_code}" "%API_BASE%/admin/claims"
echo.

echo.
echo ========================================
echo   Test Complete
echo ========================================
echo.
echo Check the HTTP status codes above.
echo 200 = Success, 500 = Error
echo.
pause
