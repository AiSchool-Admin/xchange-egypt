#!/bin/bash

# ============================================
# XChange Egypt - Authenticated AI Endpoints Test Script
# ============================================

BASE_URL="https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app"
API_BASE="${BASE_URL}/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if JWT token is provided
if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}Error: JWT_TOKEN environment variable is not set${NC}"
    echo ""
    echo "To get a token, first register/login:"
    echo ""
    echo -e "${YELLOW}1. Register a new user:${NC}"
    echo "curl -X POST ${API_BASE}/auth/register \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{"
    echo "    \"email\": \"test@example.com\","
    echo "    \"password\": \"SecurePass123!\","
    echo "    \"fullName\": \"Test User\","
    echo "    \"userType\": \"INDIVIDUAL\""
    echo "  }'"
    echo ""
    echo -e "${YELLOW}2. Or login:${NC}"
    echo "curl -X POST ${API_BASE}/auth/login \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{"
    echo "    \"email\": \"test@example.com\","
    echo "    \"password\": \"SecurePass123!\""
    echo "  }'"
    echo ""
    echo -e "${YELLOW}3. Set the token:${NC}"
    echo "export JWT_TOKEN=\"<your-token-here>\""
    echo ""
    echo -e "${YELLOW}4. Run this script again:${NC}"
    echo "./test-ai-authenticated.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ JWT Token found${NC}\n"

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

# Function to run authenticated test
run_test() {
    local test_name="$1"
    local curl_command="$2"
    local expected_status="${3:-200}"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Test $TOTAL_TESTS: ${test_name}${NC}"

    # Add authentication header and execute
    response=$(eval "$curl_command -H 'Authorization: Bearer $JWT_TOKEN' -w '\n%{http_code}' -s")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

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
# 1. FRAUD DETECTION (Authenticated)
# ============================================

print_header "1. FRAUD DETECTION ENDPOINTS"

# Note: You'll need to replace these IDs with real ones from your database
USER_ID="test-user-id"
CATEGORY_ID="test-category-id"

run_test "Check User Behavior for Fraud" \
    "curl ${API_BASE}/ai/check-user/${USER_ID}" \
    200

run_test "Check Transaction for Fraud" \
    "curl -X POST ${API_BASE}/ai/check-transaction \
    -H 'Content-Type: application/json' \
    -d '{
        \"buyerId\": \"${USER_ID}\",
        \"sellerId\": \"another-user-id\",
        \"itemIds\": [\"item-1\", \"item-2\"],
        \"totalValue\": 10000,
        \"transactionType\": \"DIRECT\"
    }'" \
    200

# ============================================
# 2. BARTER RANKING (Authenticated)
# ============================================

print_header "2. INTELLIGENT BARTER RANKING"

run_test "Rank Single Barter Cycle" \
    "curl -X POST ${API_BASE}/ai/rank-barter-cycle \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycle\": [
            {
                \"userId\": \"user1\",
                \"offeredItemId\": \"item1\",
                \"requestedItemId\": \"item2\"
            },
            {
                \"userId\": \"user2\",
                \"offeredItemId\": \"item2\",
                \"requestedItemId\": \"item3\"
            },
            {
                \"userId\": \"user3\",
                \"offeredItemId\": \"item3\",
                \"requestedItemId\": \"item1\"
            }
        ]
    }'" \
    200

run_test "Rank Multiple Barter Cycles" \
    "curl -X POST ${API_BASE}/ai/rank-barter-cycles \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycles\": [
            {
                \"cycleId\": \"cycle1\",
                \"participants\": [
                    {\"userId\": \"user1\", \"offeredItemId\": \"item1\", \"requestedItemId\": \"item2\"},
                    {\"userId\": \"user2\", \"offeredItemId\": \"item2\", \"requestedItemId\": \"item1\"}
                ]
            },
            {
                \"cycleId\": \"cycle2\",
                \"participants\": [
                    {\"userId\": \"user3\", \"offeredItemId\": \"item3\", \"requestedItemId\": \"item4\"},
                    {\"userId\": \"user4\", \"offeredItemId\": \"item4\", \"requestedItemId\": \"item5\"},
                    {\"userId\": \"user5\", \"offeredItemId\": \"item5\", \"requestedItemId\": \"item3\"}
                ]
            }
        ]
    }'" \
    200

run_test "Get Barter Recommendations" \
    "curl ${API_BASE}/ai/barter-recommendations/${USER_ID}" \
    200

# ============================================
# TEST SUMMARY
# ============================================

print_header "TEST SUMMARY"

echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All authenticated tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi
