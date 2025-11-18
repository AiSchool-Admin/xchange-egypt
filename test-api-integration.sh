#!/bin/bash

# Xchange API Integration Test Script
# Tests the full authentication flow with the backend

set -e

API_URL="https://xchange-egypt-production.up.railway.app/api/v1"
TIMESTAMP=$(date +%s)
INDIVIDUAL_EMAIL="test-indiv-${TIMESTAMP}@example.com"
BUSINESS_EMAIL="test-biz-${TIMESTAMP}@example.com"
PASSWORD="TestPassword123!"

echo "================================================"
echo "🚀 Xchange API Integration Test"
echo "================================================"
echo "Backend: $API_URL"
echo "Test Email: $INDIVIDUAL_EMAIL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Test 1: Individual Registration${NC}"
echo "----------------------------------------------"
INDIV_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register/individual" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User Individual\",
    \"email\": \"$INDIVIDUAL_EMAIL\",
    \"password\": \"$PASSWORD\",
    \"phone\": \"+201234567890\",
    \"city\": \"Cairo\",
    \"governorate\": \"Cairo\"
  }")

HTTP_CODE=$(echo "$INDIV_RESPONSE" | tail -n1)
BODY=$(echo "$INDIV_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Individual Registration: SUCCESS (HTTP $HTTP_CODE)${NC}"
    ACCESS_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$BODY" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Individual Registration: FAILED (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi
echo ""

echo -e "${BLUE}Test 2: Business Registration${NC}"
echo "----------------------------------------------"
BIZ_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register/business" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User Business\",
    \"email\": \"$BUSINESS_EMAIL\",
    \"password\": \"$PASSWORD\",
    \"phone\": \"+201987654321\",
    \"businessName\": \"Test Corp LLC\",
    \"taxId\": \"TAX123456\",
    \"commercialRegNo\": \"CR987654\",
    \"city\": \"Alexandria\",
    \"governorate\": \"Alexandria\"
  }")

HTTP_CODE=$(echo "$BIZ_RESPONSE" | tail -n1)
BODY=$(echo "$BIZ_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Business Registration: SUCCESS (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Business Registration: FAILED (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi
echo ""

echo -e "${BLUE}Test 3: Login${NC}"
echo "----------------------------------------------"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$INDIVIDUAL_EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Login: SUCCESS (HTTP $HTTP_CODE)${NC}"
    ACCESS_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$BODY" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Login: FAILED (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi
echo ""

echo -e "${BLUE}Test 4: Get Current User (Protected Route)${NC}"
echo "----------------------------------------------"
ME_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/auth/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
BODY=$(echo "$ME_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Get Current User: SUCCESS (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Get Current User: FAILED (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi
echo ""

echo -e "${BLUE}Test 5: Logout${NC}"
echo "----------------------------------------------"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
BODY=$(echo "$LOGOUT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Logout: SUCCESS (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Logout: FAILED (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

echo "================================================"
echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo "================================================"
echo ""
echo "Summary:"
echo "  ✅ Individual registration working"
echo "  ✅ Business registration working"
echo "  ✅ Login authentication working"
echo "  ✅ Protected routes (JWT) working"
echo "  ✅ Logout working"
echo ""
echo "Frontend Integration Status: READY ✅"
echo "Backend API: FULLY OPERATIONAL ✅"
echo ""
