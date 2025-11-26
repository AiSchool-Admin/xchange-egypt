# XChange Egypt - AI Features Testing Guide

## 🚀 Quick Start

Your Vercel deployment is live at:
```
https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app
```

## 📋 Overview

This guide covers testing **14 AI endpoints** across 3 main features:

1. **Intelligent Barter Ranking** (3 endpoints) - Multi-factor cycle scoring
2. **Fraud Detection** (3 endpoints) - Egyptian market-specific checks
3. **Price Estimation** (3 endpoints) - Statistical 90-day analysis
4. **Auto-Categorization** (3 endpoints) - Smart item categorization
5. **Smart Search** (1 endpoint) - Arabic/English search terms
6. **AI Status** (1 endpoint) - Feature status and stats

---

## 🧪 Testing Methods

### Method 1: Automated Test Scripts (Recommended)

We've created two bash scripts for testing:

#### A. Test Public Endpoints (No Authentication)

```bash
# Make script executable
chmod +x test-ai-endpoints.sh

# Run tests
./test-ai-endpoints.sh
```

This tests:
- ✅ Health checks
- ✅ Price estimation (3 endpoints)
- ✅ Auto-categorization (3 endpoints)
- ✅ Smart search
- ✅ AI status
- ✅ Fraud detection (public endpoint)

#### B. Test Authenticated Endpoints

```bash
# 1. First, get a JWT token (register or login)
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User",
    "userType": "INDIVIDUAL"
  }'

# 2. Copy the token from the response
# 3. Set it as environment variable
export JWT_TOKEN="your-token-here"

# 4. Make authenticated test script executable
chmod +x test-ai-authenticated.sh

# 5. Run authenticated tests
./test-ai-authenticated.sh
```

This tests:
- 🔐 Fraud detection (user behavior, transactions)
- 🔐 Barter ranking (single cycle, multiple cycles)
- 🔐 Barter recommendations

---

### Method 2: Manual Testing with curl

#### 1. Health Check

```bash
curl https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "XChange Egypt API is running",
  "timestamp": "2025-11-26T18:00:00.000Z"
}
```

---

#### 2. AI Status

```bash
curl https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/status
```

**Expected Response:**
```json
{
  "success": true,
  "features": {
    "categorization": "active",
    "priceEstimation": "active",
    "fraudDetection": "active",
    "smartSearch": "active",
    "barterRanking": "active"
  },
  "statistics": {
    "totalRequests": 0,
    "activeModels": 5
  }
}
```

---

#### 3. Estimate Item Price (Public)

```bash
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/estimate-price \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "iPhone 12 Pro Max 256GB",
    "description": "Used iPhone in good condition, minor scratches",
    "categoryId": "electronics-smartphones",
    "condition": "GOOD",
    "estimatedValue": 15000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "estimation": {
    "estimatedPrice": 15250,
    "confidence": 0.85,
    "priceRange": {
      "min": 13000,
      "max": 17500
    },
    "marketTrend": "stable",
    "comparableItems": 42
  }
}
```

---

#### 4. Categorize Item (Public)

```bash
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/categorize \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "iPhone 12 Pro Max 256GB Blue",
    "description": "Latest Apple smartphone with excellent camera"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "category": {
    "id": "electronics-smartphones",
    "name": "Smartphones",
    "confidence": 0.95,
    "parentCategory": "Electronics"
  },
  "alternatives": [
    {"id": "electronics-mobile", "name": "Mobile Devices", "confidence": 0.82}
  ]
}
```

---

#### 5. Check Listing for Fraud (Public)

```bash
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/check-listing \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "iPhone 13 Pro Max Brand New Sealed",
    "description": "100% original, lowest price guaranteed, limited offer!",
    "price": 5000,
    "categoryId": "electronics-smartphones",
    "images": ["image1.jpg"],
    "sellerId": "test-seller-123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "fraudScore": 0.75,
  "riskLevel": "HIGH",
  "flags": [
    "price_too_low",
    "suspicious_keywords",
    "limited_images"
  ],
  "recommendation": "REVIEW_REQUIRED",
  "details": {
    "priceDeviation": -70,
    "suspiciousKeywords": ["guaranteed", "limited offer"],
    "imageCount": 1
  }
}
```

---

#### 6. Smart Search Terms (Public)

```bash
curl 'https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/search-terms?query=mobile&language=ar'
```

**Expected Response:**
```json
{
  "success": true,
  "terms": {
    "original": "mobile",
    "expanded": ["mobile", "phone", "smartphone", "هاتف", "موبايل"],
    "synonyms": ["cell phone", "handset"],
    "arabicTerms": ["موبايل", "هاتف محمول", "جوال"]
  }
}
```

---

#### 7. Get Price Trends (Public)

```bash
curl https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/price-trends/electronics-smartphones
```

**Expected Response:**
```json
{
  "success": true,
  "categoryId": "electronics-smartphones",
  "trends": {
    "averagePrice": 12500,
    "medianPrice": 11000,
    "priceChange30Days": 2.5,
    "priceChange90Days": -5.2,
    "trend": "declining",
    "totalListings": 342,
    "activePeriod": "2025-08-26 to 2025-11-26"
  },
  "distribution": {
    "NEW": 18500,
    "LIKE_NEW": 15000,
    "GOOD": 11000,
    "FAIR": 8000,
    "POOR": 5000
  }
}
```

---

### Method 3: Testing with Postman/Insomnia

1. Import the collection:
   - Create new request
   - Set method (GET/POST)
   - Set URL: `https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/<endpoint>`
   - Add headers: `Content-Type: application/json`
   - For authenticated endpoints: Add `Authorization: Bearer <token>`
   - Add body (for POST requests)

2. Save as collection for reuse

---

## 🔐 Testing Authenticated Endpoints

### Step 1: Register/Login to Get Token

**Register:**
```bash
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User",
    "userType": "INDIVIDUAL",
    "phone": "+201234567890",
    "governorate": "Cairo",
    "city": "Nasr City"
  }'
```

**Or Login:**
```bash
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

### Step 2: Use Token in Requests

Add header to all authenticated requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Test Authenticated Endpoints

#### Check User Behavior (Fraud Detection)

```bash
curl https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/check-user/user-123 \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Expected Response:**
```json
{
  "success": true,
  "userId": "user-123",
  "fraudScore": 0.15,
  "riskLevel": "LOW",
  "flags": [],
  "details": {
    "accountAge": 30,
    "totalTransactions": 5,
    "successfulTransactions": 5,
    "suspiciousActivity": false,
    "emailVerified": true,
    "phoneVerified": true
  },
  "recommendation": "APPROVED"
}
```

#### Rank Barter Cycle

```bash
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/rank-barter-cycle \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "cycle": [
      {
        "userId": "user1",
        "offeredItemId": "item1",
        "requestedItemId": "item2"
      },
      {
        "userId": "user2",
        "offeredItemId": "item2",
        "requestedItemId": "item3"
      },
      {
        "userId": "user3",
        "offeredItemId": "item3",
        "requestedItemId": "item1"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "cycleId": "cycle-123",
  "score": 0.87,
  "rank": "EXCELLENT",
  "factors": {
    "valueBalance": 0.92,
    "userReliability": 0.85,
    "itemCondition": 0.88,
    "geographicFeasibility": 0.90,
    "timelineAlignment": 0.82
  },
  "recommendation": "HIGHLY_RECOMMENDED",
  "details": {
    "totalValue": 45000,
    "participants": 3,
    "estimatedCompletionDays": 7,
    "riskAssessment": "LOW"
  }
}
```

---

## 📊 Complete Endpoint List

### Public Endpoints (✅ No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Backend health check |
| GET | `/api/v1/ai/status` | AI features status |
| POST | `/api/v1/ai/estimate-price` | Estimate item price |
| GET | `/api/v1/ai/price-trends/:categoryId` | Get price trends |
| POST | `/api/v1/ai/validate-price` | Validate if price is reasonable |
| POST | `/api/v1/ai/categorize` | Auto-categorize single item |
| POST | `/api/v1/ai/categorize/batch` | Batch categorize items |
| GET | `/api/v1/ai/categorize/suggestions` | Get category suggestions |
| GET | `/api/v1/ai/search-terms` | Smart search term expansion |
| POST | `/api/v1/ai/check-listing` | Check listing for fraud (optional auth) |

### Authenticated Endpoints (🔐 Requires Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ai/check-user/:userId` | Check user fraud risk |
| POST | `/api/v1/ai/check-transaction` | Check transaction fraud |
| POST | `/api/v1/ai/rank-barter-cycle` | Rank single barter cycle |
| POST | `/api/v1/ai/rank-barter-cycles` | Rank multiple cycles |
| GET | `/api/v1/ai/barter-recommendations/:userId` | Get personalized recommendations |

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Missing or invalid JWT token

**Solution:**
```bash
# Get new token
curl -X POST https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'

# Use the token in header
curl https://xchange-egypt-izqou6183-mamdouh-ragabs-projects.vercel.app/api/v1/ai/check-user/user-123 \
  -H 'Authorization: Bearer NEW_TOKEN_HERE'
```

### Issue: 400 Bad Request

**Cause:** Invalid request body or missing required fields

**Solution:** Check the endpoint documentation and ensure all required fields are present

### Issue: 404 Not Found

**Cause:** Invalid endpoint URL or resource ID doesn't exist

**Solution:**
- Verify the URL is correct
- Ensure resource IDs (userId, categoryId, etc.) exist in database
- Use real IDs from your database, not placeholder IDs

### Issue: 500 Internal Server Error

**Cause:** Server-side error, possibly database connection or code issue

**Solution:**
- Check Railway logs for detailed error
- Verify database connection
- Ensure all environment variables are set

---

## 📈 Expected Test Results

After running the test scripts, you should see:

```
======================================
TEST SUMMARY
======================================
Total Tests: 10
Passed: 10
Failed: 0

🎉 All tests passed!
```

---

## 🎯 Next Steps After Testing

1. ✅ **Verify all public endpoints work** - Run `test-ai-endpoints.sh`
2. ✅ **Test authenticated endpoints** - Run `test-ai-authenticated.sh`
3. ✅ **Integration testing** - Test full user workflows
4. ✅ **Performance testing** - Check response times under load
5. ✅ **Frontend integration** - Connect frontend to AI endpoints
6. ✅ **User acceptance testing** - Get real user feedback

---

## 📝 Notes

- **Category IDs**: Replace `"test-category-id"` with actual category IDs from your database
- **User IDs**: Replace placeholder user IDs with real ones
- **Item IDs**: Use actual item IDs for barter ranking tests
- **JWT Tokens**: Tokens expire after 24 hours, get new ones as needed

---

## 🚀 Production Checklist

Before going live with real users:

- [ ] All 14 AI endpoints tested and working
- [ ] Authentication/authorization working properly
- [ ] Database has seed data (categories, test users)
- [ ] Error handling tested (invalid inputs, missing data)
- [ ] Rate limiting configured
- [ ] Logging and monitoring set up
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation complete

---

**Need help?** Check the Railway logs for detailed error messages:
```bash
# View Railway logs
railway logs --service xchange-egypt
```

**All tests passing? 🎉 Your AI features are live!**
