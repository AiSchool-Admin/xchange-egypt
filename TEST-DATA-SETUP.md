# 🧪 Test Data Setup - Live Testing

Complete test data setup for testing AI features in production.

---

## 🎯 **Test Scenario Overview**

We'll create a realistic test scenario with:
- **3 Users** (different trust levels)
- **6 Items** (for bartering)
- **3 Barter Cycles** (to test ranking)

---

## 👥 **Test Users to Create**

### **User 1: Ahmed (High Trust - Experienced)**
```json
{
  "email": "ahmed.test@xchange.com",
  "password": "Test123!@#",
  "fullName": "Ahmed Hassan",
  "phone": "+201012345678",
  "userType": "INDIVIDUAL",
  "governorate": "Cairo",
  "city": "Nasr City"
}
```

**After Creation:**
- Manually set `rating: 4.8`
- Set `total_transactions: 25`
- Set `email_verified: true`
- Set `phone_verified: true`

### **User 2: Sara (Medium Trust)**
```json
{
  "email": "sara.test@xchange.com",
  "password": "Test123!@#",
  "fullName": "Sara Mohamed",
  "phone": "+201098765432",
  "userType": "INDIVIDUAL",
  "governorate": "Cairo",
  "city": "Maadi"
}
```

**After Creation:**
- Set `rating: 4.2`
- Set `total_transactions: 8`
- Set `email_verified: true`
- Set `phone_verified: false`

### **User 3: Mohamed (Low Trust - New User)**
```json
{
  "email": "mohamed.test@xchange.com",
  "password": "Test123!@#",
  "fullName": "Mohamed Ali",
  "phone": "+201555555555",
  "userType": "INDIVIDUAL",
  "governorate": "Alexandria",
  "city": "Smouha"
}
```

**After Creation:**
- Leave as new user (rating: 0, transactions: 0)
- Set `email_verified: false`
- Set `phone_verified: false`

---

## 📱 **Test Items to Create**

### **Items for Ahmed**

**Item 1: iPhone 14 Pro**
```json
{
  "title": "iPhone 14 Pro 256GB",
  "description": "حالة ممتازة، استعمال 6 شهور فقط، جميع الملحقات متوفرة",
  "categoryId": "<smartphones-category-id>",
  "condition": "EXCELLENT",
  "estimatedValue": 30000,
  "quantity": 1,
  "unit": "piece",
  "locationGovernorate": "Cairo",
  "locationCity": "Nasr City",
  "isActive": true
}
```

**Item 2: MacBook Air M2**
```json
{
  "title": "MacBook Air M2 2023",
  "description": "لاب توب ابل جديد، 256GB SSD، 8GB RAM، الكرتونة والشاحن الأصلي",
  "categoryId": "<laptops-category-id>",
  "condition": "LIKE_NEW",
  "estimatedValue": 45000,
  "quantity": 1,
  "unit": "piece",
  "locationGovernorate": "Cairo",
  "locationCity": "Nasr City",
  "isActive": true
}
```

### **Items for Sara**

**Item 3: Samsung Galaxy S23**
```json
{
  "title": "Samsung Galaxy S23 Ultra 512GB",
  "description": "سامسونج جالاكسي جديد، لم يستخدم، في الكرتونة الأصلية",
  "categoryId": "<smartphones-category-id>",
  "condition": "NEW",
  "estimatedValue": 35000,
  "quantity": 1,
  "unit": "piece",
  "locationGovernorate": "Cairo",
  "locationCity": "Maadi",
  "isActive": true
}
```

**Item 4: iPad Pro 11**
```json
{
  "title": "iPad Pro 11 inch 2023 256GB",
  "description": "ايباد برو حالة ممتازة، مع قلم ابل وكيبورد",
  "categoryId": "<tablets-category-id>",
  "condition": "EXCELLENT",
  "estimatedValue": 28000,
  "quantity": 1,
  "unit": "piece",
  "locationGovernorate": "Cairo",
  "locationCity": "Maadi",
  "isActive": true
}
```

### **Items for Mohamed**

**Item 5: Xiaomi 13 Pro**
```json
{
  "title": "Xiaomi 13 Pro 256GB",
  "description": "شاومي 13 برو، استعمال سنة، حالة جيدة",
  "categoryId": "<smartphones-category-id>",
  "condition": "GOOD",
  "estimatedValue": 18000,
  "quantity": 1,
  "unit": "piece",
  "locationGovernorate": "Alexandria",
  "locationCity": "Smouha",
  "isActive": true
}
```

**Item 6: Dell Laptop i7**
```json
{
  "title": "Dell Inspiron 15 i7 10th Gen",
  "description": "لاب توب ديل، معالج i7، 16GB RAM، استعمال خفيف",
  "categoryId": "<laptops-category-id>",
  "condition": "GOOD",
  "estimatedValue": 20000,
  "quantity": 1,
  "unit": "piece",
  "locationGovernorate": "Alexandria",
  "locationCity": "Smouha",
  "isActive": true
}
```

---

## 🧪 **Test Scenarios**

### **Scenario 1: High-Quality 2-Party Barter**

**Participants:**
- Ahmed (High Trust) offers iPhone 14 Pro (30,000 EGP)
- Sara (Medium Trust) offers Samsung S23 (35,000 EGP)

**Expected Ranking:**
```json
{
  "rankingScore": 85-90,
  "likelihood": "very_high",
  "recommendationStrength": "Highly Recommended",
  "factors": {
    "userTrustScore": 80-85,
    "locationScore": 100,
    "valueBalanceScore": 85-90,
    "conditionCompatibilityScore": 95
  },
  "estimatedTimeToComplete": "1-2 days"
}
```

**Why High Score:**
- ✅ Both in Cairo (same governorate)
- ✅ Ahmed has excellent rating
- ✅ Sara has good rating
- ✅ Similar values (30k vs 35k)
- ✅ Both excellent/new condition

---

### **Scenario 2: Medium-Quality 3-Party Barter**

**Participants:**
- Ahmed offers MacBook (45,000 EGP)
- Sara offers iPad (28,000 EGP)
- Mohamed offers Dell Laptop (20,000 EGP)

**Expected Ranking:**
```json
{
  "rankingScore": 60-70,
  "likelihood": "medium",
  "recommendationStrength": "Consider",
  "factors": {
    "userTrustScore": 50-60,
    "locationScore": 70-80,
    "valueBalanceScore": 50-60,
    "conditionCompatibilityScore": 80
  },
  "warnings": [
    "Significant value imbalance may require cash",
    "Some participants have low trust scores"
  ],
  "estimatedTimeToComplete": "3-5 days"
}
```

**Why Medium Score:**
- ⚠️ Value imbalance (45k, 28k, 20k)
- ⚠️ Mohamed is new user (low trust)
- ⚠️ Mohamed in different governorate
- ✅ Ahmed and Sara trusted
- ✅ Conditions compatible

---

### **Scenario 3: Low-Quality 2-Party Barter**

**Participants:**
- Ahmed (High Trust) offers MacBook (45,000 EGP)
- Mohamed (New User) offers Xiaomi (18,000 EGP)

**Expected Ranking:**
```json
{
  "rankingScore": 45-55,
  "likelihood": "low",
  "recommendationStrength": "Not Recommended",
  "factors": {
    "userTrustScore": 40-50,
    "locationScore": 40-50,
    "valueBalanceScore": 35-45,
    "conditionCompatibilityScore": 75
  },
  "warnings": [
    "Some participants have low trust scores",
    "Participants are geographically dispersed",
    "Significant value imbalance may require cash"
  ],
  "estimatedTimeToComplete": "5-10 days"
}
```

**Why Low Score:**
- ❌ Huge value imbalance (45k vs 18k)
- ❌ Mohamed is new user (no trust)
- ❌ Different governorates (Cairo vs Alexandria)
- ❌ Mohamed unverified

---

## 🚀 **Deployment & Testing Commands**

### **Step 1: Deploy to Railway**

```bash
# Push to main branch (or merge PR)
git checkout main
git merge claude/phase-2-testing-admin-01YZVLQXx5YDHgakAamcGGz8
git push origin main

# Railway will auto-deploy
# Check deployment logs in Railway dashboard
```

### **Step 2: Get Railway URL**

```bash
# Find your Railway URL in dashboard
# Example: https://xchange-egypt-production.up.railway.app
```

### **Step 3: Create Test Users**

```bash
API_URL="https://your-railway-url.railway.app"

# Create User 1: Ahmed
curl -X POST $API_URL/api/v1/auth/register/individual \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed.test@xchange.com",
    "password": "Test123!@#",
    "fullName": "Ahmed Hassan",
    "phone": "+201012345678",
    "governorate": "Cairo",
    "city": "Nasr City"
  }'

# Save the returned user ID and token!
# AHMED_ID="..."
# AHMED_TOKEN="..."

# Create User 2: Sara
curl -X POST $API_URL/api/v1/auth/register/individual \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sara.test@xchange.com",
    "password": "Test123!@#",
    "fullName": "Sara Mohamed",
    "phone": "+201098765432",
    "governorate": "Cairo",
    "city": "Maadi"
  }'

# SARA_ID="..."
# SARA_TOKEN="..."

# Create User 3: Mohamed
curl -X POST $API_URL/api/v1/auth/register/individual \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mohamed.test@xchange.com",
    "password": "Test123!@#",
    "fullName": "Mohamed Ali",
    "phone": "+201555555555",
    "governorate": "Alexandria",
    "city": "Smouha"
  }'

# MOHAMED_ID="..."
# MOHAMED_TOKEN="..."
```

### **Step 4: Update User Trust Levels (Admin)**

**Option A: Using Supabase Dashboard**
1. Go to Supabase → Table Editor → users
2. Find Ahmed's user → Edit
   - Set `rating = 4.8`
   - Set `total_transactions = 25`
   - Set `email_verified = true`
   - Set `phone_verified = true`
3. Find Sara's user → Edit
   - Set `rating = 4.2`
   - Set `total_transactions = 8`
   - Set `email_verified = true`

**Option B: Using SQL**
```sql
-- Update Ahmed (replace with actual ID)
UPDATE users
SET rating = 4.8,
    total_transactions = 25,
    email_verified = true,
    phone_verified = true
WHERE email = 'ahmed.test@xchange.com';

-- Update Sara
UPDATE users
SET rating = 4.2,
    total_transactions = 8,
    email_verified = true,
    phone_verified = false
WHERE email = 'sara.test@xchange.com';
```

### **Step 5: Get Category IDs**

```bash
# Get all categories
curl $API_URL/api/v1/categories

# Find category IDs for:
# - smartphones
# - laptops
# - tablets

# Save them:
# SMARTPHONES_CAT="..."
# LAPTOPS_CAT="..."
# TABLETS_CAT="..."
```

### **Step 6: Create Test Items**

```bash
# Ahmed creates iPhone
curl -X POST $API_URL/api/v1/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AHMED_TOKEN" \
  -d '{
    "title": "iPhone 14 Pro 256GB",
    "description": "حالة ممتازة، استعمال 6 شهور فقط",
    "categoryId": "'$SMARTPHONES_CAT'",
    "condition": "EXCELLENT",
    "estimatedValue": 30000,
    "quantity": 1,
    "unit": "piece",
    "locationGovernorate": "Cairo",
    "locationCity": "Nasr City"
  }'

# Save item IDs as you create them
# AHMED_IPHONE="..."
# AHMED_MACBOOK="..."
# SARA_SAMSUNG="..."
# SARA_IPAD="..."
# MOHAMED_XIAOMI="..."
# MOHAMED_DELL="..."
```

### **Step 7: Test AI Features**

```bash
# 1. Test Auto-Categorization
curl -X POST $API_URL/api/v1/ai/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ايفون 15 برو ماكس",
    "description": "حالة ممتازة 256 جيجا"
  }'

# 2. Test Arabic Search
curl "$API_URL/api/v1/ai/search-terms?query=موبايل سامسونج"

# 3. Test Price Estimation
curl -X POST $API_URL/api/v1/ai/estimate-price \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "'$SMARTPHONES_CAT'",
    "condition": "EXCELLENT"
  }'

# 4. Test Fraud Detection
curl -X POST $API_URL/api/v1/ai/check-listing \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$AHMED_ID'",
    "title": "iPhone 15",
    "description": "Excellent condition",
    "price": 35000,
    "condition": "EXCELLENT",
    "categoryId": "'$SMARTPHONES_CAT'",
    "images": 3
  }'
```

### **Step 8: Test Barter Ranking** ⭐

```bash
# Scenario 1: High-Quality 2-Party Barter
curl -X POST $API_URL/api/v1/ai/rank-barter-cycle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AHMED_TOKEN" \
  -d '{
    "participants": [
      {
        "userId": "'$AHMED_ID'",
        "userName": "Ahmed Hassan",
        "itemId": "'$AHMED_IPHONE'",
        "itemValue": 30000,
        "itemCondition": "EXCELLENT"
      },
      {
        "userId": "'$SARA_ID'",
        "userName": "Sara Mohamed",
        "itemId": "'$SARA_SAMSUNG'",
        "itemValue": 35000,
        "itemCondition": "NEW"
      }
    ],
    "originalMatchScore": 85
  }'

# Expected: rankingScore > 85, likelihood = "very_high"

# Scenario 2: Low-Quality Barter
curl -X POST $API_URL/api/v1/ai/rank-barter-cycle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AHMED_TOKEN" \
  -d '{
    "participants": [
      {
        "userId": "'$AHMED_ID'",
        "userName": "Ahmed Hassan",
        "itemId": "'$AHMED_MACBOOK'",
        "itemValue": 45000,
        "itemCondition": "LIKE_NEW"
      },
      {
        "userId": "'$MOHAMED_ID'",
        "userName": "Mohamed Ali",
        "itemId": "'$MOHAMED_XIAOMI'",
        "itemValue": 18000,
        "itemCondition": "GOOD"
      }
    ],
    "originalMatchScore": 65
  }'

# Expected: rankingScore < 60, likelihood = "low", warnings present
```

---

## ✅ **Verification Checklist**

### **Deployment**
- [ ] Railway deployment successful
- [ ] Health endpoint returns 200
- [ ] Database connected
- [ ] All migrations applied

### **AI Features**
- [ ] Auto-categorization works (Arabic)
- [ ] Auto-categorization works (English)
- [ ] Price estimation returns results
- [ ] Fraud detection flags suspicious items
- [ ] Arabic search expands terms
- [ ] AI status shows all features active

### **Barter Ranking**
- [ ] High-trust cycle scores 80+
- [ ] Low-trust cycle scores <60
- [ ] Same city gets locationScore = 100
- [ ] Different cities get locationScore < 60
- [ ] Value balance affects score
- [ ] Insights generated correctly
- [ ] Warnings shown for issues
- [ ] Time estimates reasonable

---

## 📊 **Expected Results Summary**

| Scenario | Ranking Score | Likelihood | Time Estimate |
|----------|---------------|------------|---------------|
| Ahmed ↔ Sara (High Quality) | 85-90 | very_high | 1-2 days |
| 3-Party (Medium Quality) | 60-70 | medium | 3-5 days |
| Ahmed ↔ Mohamed (Low Quality) | 45-55 | low | 5-10 days |

---

## 🎉 **Success!**

If all tests pass, you have successfully deployed and tested:
- ✅ 5 AI features (FREE, no API costs)
- ✅ 14 API endpoints
- ✅ Intelligent barter ranking
- ✅ Egyptian Arabic support
- ✅ Production-ready system

**Your platform is now LIVE with advanced AI capabilities!** 🚀
