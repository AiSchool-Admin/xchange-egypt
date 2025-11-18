#!/bin/bash

# Test Registration Endpoints
# Make sure to replace RAILWAY_URL with your actual Railway deployment URL

RAILWAY_URL="https://your-app.railway.app"
API_BASE="${RAILWAY_URL}/api/v1"

echo "========================================"
echo "Testing Registration Endpoints"
echo "========================================"
echo ""

# Test 1: Register Individual User
echo "1. Testing Individual Registration..."
curl -X POST "${API_BASE}/auth/register/individual" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.individual@example.com",
    "password": "TestPass123",
    "fullName": "Test Individual User",
    "phone": "+201234567890",
    "city": "Cairo",
    "governorate": "Cairo"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' || echo "Response not JSON"

echo ""
echo "========================================"
echo ""

# Test 2: Register Business User
echo "2. Testing Business Registration..."
curl -X POST "${API_BASE}/auth/register/business" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.business@example.com",
    "password": "TestPass123",
    "fullName": "Business Owner",
    "phone": "+201234567891",
    "businessName": "Test Business LLC",
    "taxId": "123456789",
    "commercialRegNo": "CR123456",
    "city": "Alexandria",
    "governorate": "Alexandria"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' || echo "Response not JSON"

echo ""
echo "========================================"
echo ""

# Test 3: Test Duplicate Email (should fail)
echo "3. Testing Duplicate Email (should return 409 Conflict)..."
curl -X POST "${API_BASE}/auth/register/individual" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.individual@example.com",
    "password": "TestPass123",
    "fullName": "Another User"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' || echo "Response not JSON"

echo ""
echo "========================================"
echo ""

# Test 4: Test Invalid Password (should fail)
echo "4. Testing Invalid Password (should return 400 Bad Request)..."
curl -X POST "${API_BASE}/auth/register/individual" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak.password@example.com",
    "password": "weak",
    "fullName": "Weak Password User"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' || echo "Response not JSON"

echo ""
echo "========================================"
echo ""

# Test 5: Test Invalid Phone Number (should fail)
echo "5. Testing Invalid Phone Number (should return 400 Bad Request)..."
curl -X POST "${API_BASE}/auth/register/individual" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid.phone@example.com",
    "password": "TestPass123",
    "fullName": "Invalid Phone User",
    "phone": "1234567890"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' || echo "Response not JSON"

echo ""
echo "========================================"
echo "Testing Complete!"
echo "========================================"
