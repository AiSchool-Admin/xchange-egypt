#!/bin/bash

# Test Script for Featured/Luxury Market Features
# Usage: ./test-featured-luxury.sh [BASE_URL]
# Example: ./test-featured-luxury.sh http://localhost:5000
#          ./test-featured-luxury.sh https://your-api.railway.app

BASE_URL="${1:-http://localhost:5000}"
API_URL="$BASE_URL/api/v1"

echo "🧪 Featured/Luxury Market Feature Tests"
echo "========================================"
echo "API URL: $API_URL"
echo "========================================"

PASS=0
FAIL=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"

    echo -e "\n📌 Testing: $name"

    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" -H "Content-Type: application/json")
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" == "$expected_status" ]; then
        echo "   ✅ PASSED (Status: $status_code)"
        PASS=$((PASS + 1))
    else
        echo "   ❌ FAILED (Expected: $expected_status, Got: $status_code)"
        echo "   Response: $body"
        FAIL=$((FAIL + 1))
    fi
}

# Test 1: Health check
echo -e "\n🏥 Checking server health..."
health=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$health" == "200" ]; then
    echo "   ✅ Server is healthy"
else
    echo "   ⚠️  Warning: Health check returned $health"
fi

# Test 2: Get Featured Items
test_endpoint "GET /items/featured" "GET" "/items/featured" "200"

# Test 3: Get Featured Items with limit
test_endpoint "GET /items/featured?limit=5" "GET" "/items/featured?limit=5" "200"

# Test 4: Get Featured Items with minTier
test_endpoint "GET /items/featured?minTier=GOLD" "GET" "/items/featured?minTier=GOLD" "200"

# Test 5: Get Luxury Items
test_endpoint "GET /items/luxury" "GET" "/items/luxury" "200"

# Test 6: Get Luxury Items with minPrice
test_endpoint "GET /items/luxury?minPrice=50000" "GET" "/items/luxury?minPrice=50000" "200"

# Test 7: Get Luxury Items sorted by price_high
test_endpoint "GET /items/luxury?sortBy=price_high" "GET" "/items/luxury?sortBy=price_high" "200"

# Test 8: Get Luxury Items sorted by price_low
test_endpoint "GET /items/luxury?sortBy=price_low" "GET" "/items/luxury?sortBy=price_low" "200"

# Test 9: Promote item without auth (should fail)
test_endpoint "POST /items/:id/promote (no auth)" "POST" "/items/test-id/promote" "401"

# Test 10: Check database fields in search results
echo -e "\n🗃️  Checking database fields..."
search_response=$(curl -s "$API_URL/items/search?limit=1")

if echo "$search_response" | grep -q '"isFeatured"'; then
    echo "   ✅ isFeatured field present"
    PASS=$((PASS + 1))
else
    echo "   ❌ isFeatured field missing"
    FAIL=$((FAIL + 1))
fi

if echo "$search_response" | grep -q '"promotionTier"'; then
    echo "   ✅ promotionTier field present"
    PASS=$((PASS + 1))
else
    echo "   ❌ promotionTier field missing"
    FAIL=$((FAIL + 1))
fi

# Summary
echo -e "\n========================================"
echo "📊 TEST RESULTS SUMMARY"
echo "========================================"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "Total: $((PASS + FAIL))"
echo "========================================"

if [ $FAIL -gt 0 ]; then
    echo -e "\n⚠️  Some tests failed. Please check:"
    echo "   1. Is the database migration applied?"
    echo "   2. Is the server running?"
    echo "   3. Are there any items in the database?"
    exit 1
else
    echo -e "\n🎉 All tests passed!"
    exit 0
fi
