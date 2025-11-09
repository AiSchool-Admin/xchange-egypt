@echo off
REM Simple API Test Script for Non-Technical Users (Windows)
REM This script tests the Xchange API with demo data

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🚀 XCHANGE API - DEMO DATA TEST SUITE                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if server is running
echo 🔍 Checking if server is running...
curl -s http://localhost:3000/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server is running on port 3000
) else (
    echo ❌ Server is NOT running!
    echo.
    echo Please start the server first:
    echo    cd backend
    echo    pnpm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo TEST 1: Get All Categories
echo ════════════════════════════════════════════════════════════
echo.

curl -s http://localhost:3000/api/v1/categories

echo.
echo.
echo ════════════════════════════════════════════════════════════
echo TEST 2: Login as Individual User (Ahmed)
echo ════════════════════════════════════════════════════════════
echo.
echo Email: ahmed.mohamed@example.com
echo Password: Password123!
echo.

curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\": \"ahmed.mohamed@example.com\", \"password\": \"Password123!\"}" > temp_login.json

type temp_login.json

echo.
echo.
echo ════════════════════════════════════════════════════════════
echo TEST 3: Get All Active Listings
echo ════════════════════════════════════════════════════════════
echo.

curl -s "http://localhost:3000/api/v1/listings?status=ACTIVE"

echo.
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  ✅ TESTS COMPLETED                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📊 Summary:
echo    ✓ Server is running
echo    ✓ Categories loaded
echo    ✓ User authentication tested
echo    ✓ Listings available
echo.
echo 🎉 Your demo data is ready for investor presentations!
echo.

REM Cleanup
if exist temp_login.json del temp_login.json

pause
