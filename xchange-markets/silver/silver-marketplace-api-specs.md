# XCHANGE SILVER MARKETPLACE - API ENDPOINTS SPECIFICATION

## Base URL
```
Production: https://api.xchange.eg/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 📊 MARKET DATA & PRICING

### GET /silver/prices/current
Get current silver prices for all purities in Egypt

**Auth:** No  
**Response:**
```json
{
  "timestamp": "2024-12-14T10:30:00Z",
  "spotPrice": { "usd": 31.50, "egp": 1544.25 },
  "egypt": {
    "pure999": { "perGram": 107.00, "perOunce": 3330.00 },
    "sterling925": { "perGram": 99.00, "perOunce": 3080.00 },
    "grade900": { "perGram": 96.50, "perOunce": 3002.00 },
    "grade800": { "perGram": 86.00, "perOunce": 2675.00 }
  },
  "source": "Metals-API",
  "nextUpdate": "2024-12-14T11:00:00Z"
}
```

### GET /silver/prices/history
Get historical silver prices

**Auth:** No  
**Query params:**
- `from`: ISO date (required)
- `to`: ISO date (required)
- `purity`: 999|925|900|800 (optional, default: all)
- `interval`: hour|day|week|month (optional, default: day)

**Response:**
```json
{
  "data": [
    {
      "date": "2024-12-01",
      "pure999": 105.50,
      "sterling925": 97.50,
      "grade900": 95.00,
      "grade800": 84.50
    }
  ],
  "stats": {
    "min": 95.00,
    "max": 107.00,
    "avg": 101.25,
    "change": "+2.3%"
  }
}
```

---

## 👤 AUTHENTICATION & USERS

### POST /auth/register
Register new user

**Auth:** No  
**Body:**
```json
{
  "email": "user@example.com",
  "phone": "+201234567890",
  "password": "SecureP@ssw0rd",
  "fullName": "أحمد محمد",
  "dateOfBirth": "1995-03-15",
  "city": "القاهرة",
  "district": "مدينة نصر"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxyz123",
    "email": "user@example.com",
    "fullName": "أحمد محمد",
    "trustLevel": "NEW"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### POST /auth/login
User login

**Auth:** No  
**Body:**
```json
{
  "emailOrPhone": "user@example.com",
  "password": "SecureP@ssw0rd"
}
```

**Response:** Same as register

### POST /auth/verify-national-id
Upload and verify Egyptian National ID

**Auth:** Required  
**Body (multipart/form-data):**
```
frontImage: File
backImage: File
selfieImage: File
nationalId: "29503151234567"
```

**Response:**
```json
{
  "status": "UNDER_REVIEW",
  "message": "تم رفع مستنداتك بنجاح. سيتم المراجعة خلال 24-48 ساعة",
  "estimatedReviewTime": "2024-12-16T10:00:00Z"
}
```

### GET /users/me
Get current user profile

**Auth:** Required  
**Response:**
```json
{
  "id": "clxyz123",
  "email": "user@example.com",
  "phone": "+201234567890",
  "fullName": "أحمد محمد",
  "avatar": "https://cdn.xchange.eg/avatars/xyz.jpg",
  "trustLevel": "VERIFIED",
  "kycStatus": "APPROVED",
  "stats": {
    "totalListings": 12,
    "activeListing": 5,
    "soldItems": 7,
    "purchasedItems": 3,
    "averageRating": 4.8,
    "totalReviews": 15
  },
  "createdAt": "2024-01-15T08:30:00Z"
}
```

### PUT /users/me
Update user profile

**Auth:** Required  
**Body:**
```json
{
  "fullName": "أحمد محمد علي",
  "avatar": "base64_image_string_or_url",
  "city": "الإسكندرية",
  "notificationPrefs": {
    "email": true,
    "sms": false,
    "push": true
  }
}
```

---

## 📝 LISTINGS (الإعلانات)

### POST /silver/listings
Create new silver listing

**Auth:** Required  
**Body:**
```json
{
  "title": "خاتم فضة عيار 925 بفص عقيق يمني",
  "description": "خاتم فضة استرليني أصلي، مشترى من محل الصفوة بخان الخليلي منذ سنتين...",
  "category": "JEWELRY_MENS",
  "subcategory": "خاتم رجالي",
  
  "purity": "STERLING_925",
  "weight": 12.5,
  "craftingCost": 400,
  "originalPrice": 1637.50,
  "purchaseDate": "2022-12-20",
  
  "condition": "EXCELLENT",
  "conditionNotes": "استعمال خفيف جداً، بدون خدوش",
  "hasHallmark": true,
  "hallmarkDetails": "دمغة مصلحة الدمغ المصرية - 925",
  
  "askingPrice": 1400,
  "minimumPrice": 1200,
  "priceType": "NEGOTIABLE",
  
  "images": [
    "base64_or_url_1",
    "base64_or_url_2",
    "base64_or_url_3"
  ]
}
```

**Response:**
```json
{
  "id": "listing_abc123",
  "status": "PENDING_REVIEW",
  "moderationMessage": "سيتم مراجعة إعلانك خلال 2-4 ساعات",
  "suggestedPrice": 1320,
  "suggestedPriceBreakdown": {
    "rawSilverValue": 1237.50,
    "craftingValue": 82.50,
    "total": 1320,
    "explanation": "قيمة الفضة الخام (12.5 جرام × 99 ج.م) + 20% من قيمة الصنعة الأصلية للحالة الممتازة"
  },
  "createdAt": "2024-12-14T11:00:00Z"
}
```

### GET /silver/listings
Search/browse silver listings

**Auth:** No  
**Query params:**
- `page`: int (default: 1)
- `limit`: int (default: 20, max: 100)
- `category`: SilverCategory
- `purity`: SilverPurity
- `condition`: ItemCondition
- `minWeight`: float
- `maxWeight`: float
- `minPrice`: float
- `maxPrice`: float
- `hasHallmark`: boolean
- `hasCertificate`: boolean
- `city`: string
- `search`: string (full-text search)
- `sortBy`: price|date|weight|rating (default: date)
- `sortOrder`: asc|desc (default: desc)

**Response:**
```json
{
  "listings": [
    {
      "id": "listing_abc123",
      "title": "خاتم فضة عيار 925 بفص عقيق يمني",
      "category": "JEWELRY_MENS",
      "purity": "STERLING_925",
      "weight": 12.5,
      "askingPrice": 1400,
      "condition": "EXCELLENT",
      "hasHallmark": true,
      "hasCertificate": false,
      "images": ["url1", "url2"],
      "seller": {
        "id": "user123",
        "fullName": "أحمد محمد",
        "trustLevel": "VERIFIED",
        "rating": 4.8,
        "totalSales": 7
      },
      "createdAt": "2024-12-14T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "filters": {
    "categories": {"JEWELRY_MENS": 45, "JEWELRY_WOMENS": 67, "BULLION": 23},
    "purities": {"STERLING_925": 112, "PURE_999": 28, "GRADE_800": 16},
    "priceRanges": {
      "0-500": 12,
      "500-1000": 45,
      "1000-2000": 67,
      "2000+": 32
    }
  }
}
```

### GET /silver/listings/:id
Get single listing details

**Auth:** No  
**Response:**
```json
{
  "id": "listing_abc123",
  "title": "خاتم فضة عيار 925 بفص عقيق يمني",
  "description": "خاتم فضة استرليني أصلي...",
  "category": "JEWELRY_MENS",
  "subcategory": "خاتم رجالي",
  
  "purity": "STERLING_925",
  "weight": 12.5,
  "craftingCost": 400,
  "originalPrice": 1637.50,
  "purchaseDate": "2022-12-20",
  
  "condition": "EXCELLENT",
  "conditionNotes": "استعمال خفيف جداً...",
  "hasHallmark": true,
  "hallmarkDetails": "دمغة مصلحة الدمغ المصرية - 925",
  "hasCertificate": false,
  
  "askingPrice": 1400,
  "minimumPrice": 1200,
  "priceType": "NEGOTIABLE",
  
  "rawSilverValue": 1237.50,
  "suggestedPrice": 1320,
  "craftingValueRatio": 20,
  
  "images": ["url1", "url2", "url3", "url4"],
  "videos": [],
  
  "status": "ACTIVE",
  "publishedAt": "2024-12-14T13:00:00Z",
  
  "seller": {
    "id": "user123",
    "fullName": "أحمد محمد",
    "avatar": "url",
    "trustLevel": "VERIFIED",
    "city": "القاهرة",
    "memberSince": "2024-01-15",
    "stats": {
      "totalSales": 7,
      "averageRating": 4.8,
      "totalReviews": 15,
      "responseRate": 95,
      "responseTime": "2 ساعات"
    }
  },
  
  "viewCount": 67,
  "favoriteCount": 12,
  "inquiryCount": 5,
  
  "createdAt": "2024-12-14T11:00:00Z",
  "updatedAt": "2024-12-14T11:30:00Z"
}
```

### PUT /silver/listings/:id
Update listing

**Auth:** Required (owner only)  
**Body:** Same as POST, partial update allowed

### DELETE /silver/listings/:id
Remove listing

**Auth:** Required (owner only)

### POST /silver/listings/:id/publish
Publish draft listing

**Auth:** Required (owner only)

---

## 💰 VALUATIONS (التقييم)

### POST /silver/valuations/request
Request professional valuation

**Auth:** Required  
**Body:**
```json
{
  "listingId": "listing_abc123",
  "tier": "ADVANCED",
  "notes": "أريد تقييم دقيق لهذه القطعة قبل البيع"
}
```

**Response:**
```json
{
  "id": "valuation_xyz789",
  "tier": "ADVANCED",
  "fee": 525,
  "estimatedCompletion": "2024-12-15T14:00:00Z",
  "status": "PENDING",
  "paymentUrl": "https://payment.xchange.eg/xyz789",
  "instructions": "الرجاء الدفع لبدء التقييم. سيتم التواصل معك خلال 24 ساعة لتنسيق موعد الفحص."
}
```

### GET /silver/valuations/:id
Get valuation status/results

**Auth:** Required (owner only)  
**Response:**
```json
{
  "id": "valuation_xyz789",
  "status": "COMPLETED",
  "tier": "ADVANCED",
  
  "results": {
    "weight": 12.48,
    "purity": "STERLING_925",
    "purityExact": 92.7,
    
    "rawValue": 1235.52,
    "craftingValue": 85,
    "totalValue": 1320.52,
    
    "visualGrade": "A",
    "hasHallmark": true,
    "hallmarkAuthentic": true,
    
    "expertNotes": "القطعة في حالة ممتازة. الفص عقيق يمني أصلي. الدمغة أصلية وواضحة. الصنعة متقنة وتستحق القيمة المضافة.",
    
    "tests": {
      "xrf": true,
      "density": true,
      "visual": true
    },
    
    "photos360": ["url1", "url2", "url3", "url4"],
    "testPhotos": ["url5", "url6"]
  },
  
  "certificateGenerated": true,
  "certificateId": "cert_abc456",
  "certificateUrl": "https://xchange.eg/certificates/cert_abc456",
  
  "completedAt": "2024-12-15T16:30:00Z"
}
```

### POST /silver/valuations/:id/generate-certificate
Generate certificate from completed valuation

**Auth:** Required (owner only)

---

## 📜 CERTIFICATES (الشهادات)

### GET /silver/certificates/:certificateNumber
Get certificate by number (public verification)

**Auth:** No  
**Response:**
```json
{
  "certificateNumber": "XCH-SLV-2024-001234",
  "issuedAt": "2024-12-15T16:30:00Z",
  "expiresAt": "2025-06-15T16:30:00Z",
  "status": "VALID",
  
  "item": {
    "category": "JEWELRY_MENS",
    "description": "خاتم فضة استرليني بفص عقيق",
    "weight": 12.48,
    "purity": "STERLING_925",
    "purityExact": 92.7,
    "visualGrade": "A"
  },
  
  "valuation": {
    "rawSilverValue": 1235.52,
    "craftingValue": 85,
    "totalEstimate": 1320.52,
    "valuationDate": "2024-12-15"
  },
  
  "tests": {
    "xrf": true,
    "density": true,
    "visual": true,
    "hallmarkVerified": true
  },
  
  "photos": {
    "360": ["url1", "url2", "url3", "url4"],
    "tests": ["url5", "url6"]
  },
  
  "qrCode": "data:image/png;base64,..."
}
```

---

## 🛒 PURCHASES (المشتريات)

### POST /silver/purchases
Initiate purchase

**Auth:** Required  
**Body:**
```json
{
  "listingId": "listing_abc123",
  "offeredPrice": 1350,
  "paymentMethod": "CARD",
  "deliveryMethod": "BOSTA",
  "deliveryAddressId": "addr_xyz789",
  "message": "هل يمكن التفاوض على السعر؟"
}
```

**Response:**
```json
{
  "id": "purchase_def456",
  "status": "PENDING",
  "agreedPrice": 1350,
  "platformFee": 67.50,
  "shippingFee": 50,
  "total": 1467.50,
  
  "paymentUrl": "https://payment.paymob.com/...",
  "expiresAt": "2024-12-14T23:59:59Z",
  
  "message": "سيتم التواصل مع البائع. إذا وافق، سيتم الدفع عبر Escrow وحماية المبلغ حتى استلامك للمنتج."
}
```

### GET /silver/purchases/:id
Get purchase details

**Auth:** Required (buyer or seller)

### POST /silver/purchases/:id/confirm-delivery
Buyer confirms receiving item

**Auth:** Required (buyer only)  
**Body:**
```json
{
  "itemAsDescribed": true,
  "qualitySatisfactory": true,
  "notes": "وصلت القطعة بحالة ممتازة، مطابقة للوصف تماماً"
}
```

### POST /silver/purchases/:id/open-dispute
Open dispute for problematic purchase

**Auth:** Required (buyer or seller)  
**Body:**
```json
{
  "reason": "ITEM_NOT_AS_DESCRIBED",
  "description": "القطعة ليست فضة أصلية كما هو معلن",
  "evidence": ["photo1", "photo2", "photo3"]
}
```

---

## 🔄 TRADE-IN (الاستبدال)

### POST /silver/trade-in/request
Request trade-in evaluation

**Auth:** Required  
**Body:**
```json
{
  "oldItemDescription": "سلسلة فضة 925، وزن تقريبي 25 جرام",
  "oldItemWeight": 25,
  "oldItemPurity": "STERLING_925",
  "oldItemImages": ["url1", "url2", "url3"],
  
  "targetListingId": "listing_new789",
  "additionalNotes": "أريد استبدال سلسلتي القديمة بالخاتم الجديد"
}
```

**Response:**
```json
{
  "id": "tradein_ghi789",
  "status": "PENDING",
  "estimatedValue": "2200-2400 EGP",
  "message": "سيتم تقييم قطعتك القديمة خلال 24 ساعة. سنتواصل معك لتنسيق الاستلام.",
  "expectedCredit": "1760-1920 EGP (80% من القيمة)"
}
```

### GET /silver/trade-in/:id
Get trade-in status

**Auth:** Required (owner only)

### POST /silver/trade-in/:id/accept
Accept trade-in offer

**Auth:** Required (owner only)

---

## 💎 SAVINGS PROGRAM (برنامج الادخار)

### POST /silver/savings/accounts
Create savings account

**Auth:** Required  
**Body:**
```json
{
  "accountName": "حساب ادخار الزواج",
  "targetAmount": 50000,
  "autoInvestEnabled": true,
  "autoInvestAmount": 500,
  "autoInvestFrequency": "monthly",
  "physicalStorage": false
}
```

**Response:**
```json
{
  "id": "savings_jkl012",
  "accountName": "حساب ادخار الزواج",
  "currentBalance": 0,
  "equivalentGrams": 0,
  "targetAmount": 50000,
  "targetGrams": 505.05,
  "progress": 0,
  "nextAutoInvestAt": "2025-01-14T00:00:00Z",
  "status": "ACTIVE"
}
```

### POST /silver/savings/:id/deposit
Make deposit

**Auth:** Required  
**Body:**
```json
{
  "amount": 1000,
  "paymentMethod": "CARD"
}
```

**Response:**
```json
{
  "depositId": "dep_mno345",
  "amount": 1000,
  "silverPriceAt": 99,
  "gramsAdded": 10.10,
  "newBalance": 1000,
  "newGrams": 10.10,
  "paymentUrl": "https://payment.paymob.com/..."
}
```

### POST /silver/savings/:id/withdraw
Request withdrawal

**Auth:** Required  
**Body:**
```json
{
  "amount": 5000,
  "type": "PHYSICAL",
  "deliveryAddressId": "addr_xyz789",
  "preferredItems": ["سبيكة 50 جرام", "سبيكة 50 جرام"]
}
```

### GET /silver/savings/:id/history
Get account transaction history

**Auth:** Required

---

## ⭐ REVIEWS (التقييمات)

### POST /silver/reviews
Submit review

**Auth:** Required  
**Body:**
```json
{
  "purchaseId": "purchase_def456",
  "reviewedUserId": "user123",
  "rating": 5,
  "accuracyRating": 5,
  "communicationRating": 5,
  "packagingRating": 4,
  "speedRating": 5,
  "comment": "بائع ممتاز، القطعة مطابقة للوصف تماماً، التغليف جيد جداً"
}
```

### GET /users/:userId/reviews
Get user reviews

**Auth:** No  
**Response:**
```json
{
  "summary": {
    "averageRating": 4.8,
    "totalReviews": 15,
    "ratingDistribution": {
      "5": 12,
      "4": 2,
      "3": 1,
      "2": 0,
      "1": 0
    },
    "averageByCategory": {
      "accuracy": 4.9,
      "communication": 4.8,
      "packaging": 4.7,
      "speed": 4.6
    }
  },
  "reviews": [
    {
      "id": "review_pqr678",
      "rating": 5,
      "comment": "بائع ممتاز...",
      "reviewer": {
        "fullName": "محمد أحمد",
        "avatar": "url",
        "trustLevel": "VERIFIED"
      },
      "createdAt": "2024-12-10T15:00:00Z",
      "response": "شكراً لك أخي الكريم",
      "respondedAt": "2024-12-10T17:00:00Z"
    }
  ]
}
```

---

## 🔍 SEARCH & DISCOVERY

### GET /silver/search/suggestions
Get search suggestions/autocomplete

**Auth:** No  
**Query:** `q=خاتم`

**Response:**
```json
{
  "suggestions": [
    "خاتم فضة 925",
    "خاتم فضة رجالي",
    "خاتم فضة بفص عقيق",
    "خاتم فضة إيطالي"
  ],
  "trending": [
    "سبائك فضة",
    "سلاسل فضة نسائي",
    "عملات فضة"
  ]
}
```

### GET /silver/featured
Get featured/promoted listings

**Auth:** No

---

## 📊 ANALYTICS & STATS

### GET /silver/market/stats
Get market statistics

**Auth:** No  
**Response:**
```json
{
  "totalActiveListings": 1247,
  "totalTransactionsMonth": 156,
  "averagePrice": {
    "JEWELRY_MENS": 850,
    "JEWELRY_WOMENS": 1200,
    "BULLION": 5400,
    "COINS": 650
  },
  "popularCategories": [
    {"category": "JEWELRY_WOMENS", "count": 478},
    {"category": "JEWELRY_MENS", "count": 312},
    {"category": "BULLION", "count": 178}
  ],
  "priceChange7Days": "+2.3%",
  "priceChange30Days": "+5.7%"
}
```

---

## 🚨 ERROR RESPONSES

All errors follow this format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "بيانات غير صحيحة",
    "details": {
      "weight": "الوزن يجب أن يكون أكبر من صفر",
      "purity": "العيار المدخل غير صحيح"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_REQUIRED`: Not logged in
- `UNAUTHORIZED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `LISTING_NOT_AVAILABLE`: Listing sold/removed
- `PAYMENT_FAILED`: Payment processing error
- `ESCROW_ERROR`: Escrow transaction issue
- `TRUST_LEVEL_INSUFFICIENT`: User trust level too low
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## 📱 WEBHOOKS (للتكامل مع خدمات خارجية)

### Payment Webhooks
```
POST /webhooks/paymob
POST /webhooks/fawry
```

### Shipping Webhooks
```
POST /webhooks/bosta
POST /webhooks/aramex
```

---

## 🔐 RATE LIMITING

- Unauthenticated: 100 requests/hour
- Authenticated (NEW): 500 requests/hour
- Authenticated (VERIFIED+): 2000 requests/hour
- Authenticated (PROFESSIONAL): 10000 requests/hour
