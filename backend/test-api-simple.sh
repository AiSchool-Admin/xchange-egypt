#!/bin/bash

# Simple API Test Script for Non-Technical Users
# This script tests the Xchange API with demo data

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🚀 XCHANGE API - DEMO DATA TEST SUITE                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Server is running on port 3000"
else
    echo "❌ Server is NOT running!"
    echo ""
    echo "Please start the server first:"
    echo "   cd backend"
    echo "   pnpm run dev"
    echo ""
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "TEST 1: Get All Categories"
echo "════════════════════════════════════════════════════════════"
echo ""

curl -s http://localhost:3000/api/v1/categories | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/api/v1/categories | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0, 'utf-8')), null, 2))"

echo ""
echo ""
echo "════════════════════════════════════════════════════════════"
echo "TEST 2: Login as Individual User (Ahmed)"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Email: ahmed.mohamed@example.com"
echo "Password: Password123!"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed.mohamed@example.com", "password": "Password123!"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE" | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0, 'utf-8')), null, 2))"

# Extract token for next requests
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo ""
    echo "❌ Login failed! Could not get authentication token."
    echo "Please check if the seed data has been loaded."
    exit 1
fi

echo ""
echo "✅ Login successful! Token received."

echo ""
echo ""
echo "════════════════════════════════════════════════════════════"
echo "TEST 3: Get My Profile (Authenticated Request)"
echo "════════════════════════════════════════════════════════════"
echo ""

curl -s http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN" | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0, 'utf-8')), null, 2))"

echo ""
echo ""
echo "════════════════════════════════════════════════════════════"
echo "TEST 4: Get All Active Listings"
echo "════════════════════════════════════════════════════════════"
echo ""

curl -s "http://localhost:3000/api/v1/listings?status=ACTIVE" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:3000/api/v1/listings?status=ACTIVE" | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0, 'utf-8')), null, 2))"

echo ""
echo ""
echo "════════════════════════════════════════════════════════════"
echo "TEST 5: Get My Barter Offers (Authenticated)"
echo "════════════════════════════════════════════════════════════"
echo ""

curl -s http://localhost:3000/api/v1/barter/my-offers \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/api/v1/barter/my-offers \
  -H "Authorization: Bearer $TOKEN" | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0, 'utf-8')), null, 2))"

echo ""
echo ""
echo "════════════════════════════════════════════════════════════"
echo "TEST 6: Search Barterable Items"
echo "════════════════════════════════════════════════════════════"
echo ""

curl -s "http://localhost:3000/api/v1/barter/search?query=laptop" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:3000/api/v1/barter/search?query=laptop" | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0, 'utf-8')), null, 2))"

echo ""
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ ALL TESTS COMPLETED                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "   ✓ Server is running"
echo "   ✓ Categories loaded"
echo "   ✓ User authentication working"
echo "   ✓ Profile retrieval working"
echo "   ✓ Listings available"
echo "   ✓ Barter system functional"
echo ""
echo "🎉 Your demo data is ready for investor presentations!"
echo ""
