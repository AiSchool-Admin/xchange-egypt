#!/bin/bash

# ============================================
# XChange Egypt - AI Endpoints Test Script
# ============================================

BASE_URL="https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app"
API_BASE="${BASE_URL}/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test header
print_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
}

# Function to run a test
run_test() {
    local test_name="$1"
    local curl_command="$2"
    local expected_status="${3:-200}"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Test $TOTAL_TESTS: ${test_name}${NC}"

    # Execute curl command and capture response
    response=$(eval "$curl_command -w '\n%{http_code}' -s")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    # Check if test passed
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Response: $body"
    fi
    echo ""
}

# ============================================
# 1. BASIC HEALTH CHECKS
# ============================================

print_header "1. BASIC HEALTH CHECKS"

run_test "Backend Health Check" \
    "curl ${API_BASE}/health" \
    200

run_test "AI Status Check" \
    "curl ${API_BASE}/ai/status" \
    200

# ============================================
# 2. PRICE ESTIMATION ENDPOINTS (Public)
# ============================================

print_header "2. PRICE ESTIMATION ENDPOINTS"

# Get a category ID first (you'll need to replace this with a real category ID)
# For now, using a placeholder
CATEGORY_ID="placeholder-category-id"

run_test "Estimate Item Price" \
    "curl -X POST ${API_BASE}/ai/estimate-price \
    -H 'Content-Type: application/json' \
    -d '{
        \"title\": \"iPhone 12 Pro Max\",
        \"description\": \"Used iPhone in good condition\",
        \"categoryId\": \"${CATEGORY_ID}\",
        \"condition\": \"GOOD\",
        \"estimatedValue\": 15000
    }'" \
    200

run_test "Get Price Trends" \
    "curl ${API_BASE}/ai/price-trends/${CATEGORY_ID}" \
    200

run_test "Validate Price" \
    "curl -X POST ${API_BASE}/ai/validate-price \
    -H 'Content-Type: application/json' \
    -d '{
        \"categoryId\": \"${CATEGORY_ID}\",
        \"price\": 15000,
        \"condition\": \"GOOD\"
    }'" \
    200

# ============================================
# 3. AUTO-CATEGORIZATION ENDPOINTS (Public)
# ============================================

print_header "3. AUTO-CATEGORIZATION ENDPOINTS"

run_test "Categorize Single Item" \
    "curl -X POST ${API_BASE}/ai/categorize \
    -H 'Content-Type: application/json' \
    -d '{
        \"title\": \"iPhone 12 Pro Max 256GB\",
        \"description\": \"Latest iPhone model with excellent camera\"
    }'" \
    200

run_test "Batch Categorize Items" \
    "curl -X POST ${API_BASE}/ai/categorize/batch \
    -H 'Content-Type: application/json' \
    -d '{
        \"items\": [
            {\"title\": \"Samsung Galaxy S21\", \"description\": \"Android smartphone\"},
            {\"title\": \"MacBook Pro 2020\", \"description\": \"Laptop for professionals\"}
        ]
    }'" \
    200

run_test "Get Category Suggestions" \
    "curl '${API_BASE}/ai/categorize/suggestions?query=phone'" \
    200

# ============================================
# 4. SMART SEARCH ENDPOINT (Public)
# ============================================

print_header "4. SMART SEARCH ENDPOINT"

run_test "Get Smart Search Terms" \
    "curl '${API_BASE}/ai/search-terms?query=mobile+phone&language=ar'" \
    200

# ============================================
# 5. FRAUD DETECTION ENDPOINTS (Some Public)
# ============================================

print_header "5. FRAUD DETECTION ENDPOINTS (Public)"

run_test "Check Listing for Fraud (No Auth)" \
    "curl -X POST ${API_BASE}/ai/check-listing \
    -H 'Content-Type: application/json' \
    -d '{
        \"title\": \"iPhone 13 Pro Max Brand New\",
        \"description\": \"100% original, lowest price guaranteed!\",
        \"price\": 5000,
        \"categoryId\": \"${CATEGORY_ID}\",
        \"images\": [\"image1.jpg\"],
        \"sellerId\": \"test-seller-id\"
    }'" \
    200

# ============================================
# AUTHENTICATION REQUIRED ENDPOINTS
# ============================================

print_header "AUTHENTICATION REQUIRED ENDPOINTS"

echo -e "${YELLOW}The following endpoints require authentication:${NC}\n"
echo "1. POST /api/v1/ai/check-user/:userId - Check user behavior"
echo "2. POST /api/v1/ai/check-transaction - Check transaction fraud"
echo "3. POST /api/v1/ai/rank-barter-cycle - Rank barter cycle"
echo "4. POST /api/v1/ai/rank-barter-cycles - Rank multiple cycles"
echo "5. GET /api/v1/ai/barter-recommendations/:userId - Get recommendations"
echo ""
echo -e "${BLUE}To test these endpoints, you need to:${NC}"
echo "1. Register a user or login: POST /api/v1/auth/register or POST /api/v1/auth/login"
echo "2. Get the JWT token from the response"
echo "3. Add header: Authorization: Bearer <token>"
echo ""

# ============================================
# TEST SUMMARY
# ============================================

print_header "TEST SUMMARY"

echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi
