# 📚 API Documentation - Xchange Scrap Marketplace

## OpenAPI Specification v3.0

---

## 📋 الفهرس

1. [معلومات عامة](#1-معلومات-عامة)
2. [المصادقة](#2-المصادقة)
3. [الأسعار](#3-الأسعار)
4. [طلبات الجمع](#4-طلبات-الجمع)
5. [الإعلانات](#5-الإعلانات)
6. [التجار](#6-التجار)
7. [المستخدمين](#7-المستخدمين)
8. [أكواد الخطأ](#8-أكواد-الخطأ)

---

## 1. معلومات عامة

### Base URL

```
Production: https://api.xchange.com.eg/v1
Staging:    https://api-staging.xchange.com.eg/v1
Local:      http://localhost:3001/api
```

### Headers

```http
Content-Type: application/json
Accept: application/json
Accept-Language: ar  # or 'en'
Authorization: Bearer <token>
```

### Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "رقم الموبايل غير صحيح",
    "details": { ... }
  }
}
```

---

## 2. المصادقة

### 2.1 إرسال OTP

```yaml
POST /auth/send-otp

Description: إرسال رمز التحقق لرقم الموبايل

Request Body:
  phone: string (required)
    - Egyptian phone number
    - Format: +201XXXXXXXXX or 01XXXXXXXXX
    - Example: "+201012345678"

Response 200:
  success: true
  data:
    message: "تم إرسال رمز التحقق"
    expiresIn: 300  # seconds
    canResendAt: "2024-12-13T10:05:00Z"

Response 400:
  error:
    code: "INVALID_PHONE"
    message: "رقم الموبايل غير صحيح"

Response 429:
  error:
    code: "RATE_LIMIT"
    message: "يرجى الانتظار قبل طلب رمز جديد"
    retryAfter: 60

Example:
  curl -X POST https://api.xchange.com.eg/v1/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"phone": "+201012345678"}'
```

### 2.2 التحقق من OTP

```yaml
POST /auth/verify-otp

Description: التحقق من رمز OTP وتسجيل الدخول

Request Body:
  phone: string (required)
  otp: string (required)
    - 6 digits
    - Example: "123456"

Response 200:
  success: true
  data:
    accessToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
    refreshToken: "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
    expiresIn: 3600
    user:
      id: "uuid"
      phone: "+201012345678"
      name: "أحمد محمد"
      userType: "individual"
      isVerified: true
    isNewUser: false

Response 400:
  error:
    code: "INVALID_OTP"
    message: "رمز التحقق غير صحيح"
    attemptsRemaining: 2

Response 410:
  error:
    code: "OTP_EXPIRED"
    message: "انتهت صلاحية رمز التحقق"
```

### 2.3 تحديث Token

```yaml
POST /auth/refresh

Description: الحصول على access token جديد

Request Body:
  refreshToken: string (required)

Response 200:
  success: true
  data:
    accessToken: "new_access_token"
    expiresIn: 3600
```

### 2.4 تسجيل مستخدم جديد

```yaml
POST /auth/register

Description: إكمال تسجيل مستخدم جديد

Headers:
  Authorization: Bearer <token>

Request Body:
  name: string (required)
    - Min: 2, Max: 100
  userType: enum (required)
    - Values: "individual", "collector", "dealer", "company"
  governorate: string (required)
  city: string (required)
  companyName: string (optional, required if userType is company)
  commercialRegister: string (optional)
  taxId: string (optional)

Response 200:
  success: true
  data:
    user:
      id: "uuid"
      phone: "+201012345678"
      name: "أحمد محمد"
      userType: "individual"
      addressGovernorate: "القاهرة"
      addressCity: "مدينة نصر"
      isVerified: false
      createdAt: "2024-12-13T10:00:00Z"
```

---

## 3. الأسعار

### 3.1 الحصول على الأسعار

```yaml
GET /prices

Description: الحصول على أسعار الخردة الحالية

Query Parameters:
  categoryId: string (optional)
    - Filter by category
  materialTypeId: string (optional)
    - Filter by specific material
  governorate: string (optional)
    - Get regional prices
  search: string (optional)
    - Search by name

Response 200:
  success: true
  data:
    prices:
      - id: "uuid"
        materialType:
          id: "uuid"
          nameAr: "حديد خردة"
          nameEn: "Iron Scrap"
          slug: "iron-scrap"
          category:
            id: "uuid"
            nameAr: "معادن حديدية"
            slug: "ferrous-metals"
        qualityGrade: "standard"
        pricePerKg: 40.00
        pricePerTon: 40000.00
        change24h: 2.5  # percentage
        trend: "up"  # up, down, stable
        updatedAt: "2024-12-13T10:00:00Z"
    lastUpdated: "2024-12-13T10:00:00Z"
    source: "market"

Example:
  curl https://api.xchange.com.eg/v1/prices?categoryId=xxx&governorate=القاهرة
```

### 3.2 حاسبة القيمة

```yaml
POST /prices/calculate

Description: حساب قيمة الخردة بناءً على المواد والأوزان

Request Body:
  materials: array (required)
    - materialTypeId: string (required)
    - weightKg: number (required, min: 0.1)
    - qualityGrade: enum (optional)
        - Values: "premium", "standard", "mixed", "low"
        - Default: "standard"
  governorate: string (optional)

Response 200:
  success: true
  data:
    items:
      - materialType:
          id: "uuid"
          nameAr: "نحاس أحمر"
        weightKg: 5.0
        qualityGrade: "standard"
        pricePerKg: 588.00
        subtotal: 2940.00
    total: 2940.00
    estimatedRange:
      min: 2646.00  # -10%
      max: 3234.00  # +10%
    validUntil: "2024-12-13T10:30:00Z"

Example:
  curl -X POST https://api.xchange.com.eg/v1/prices/calculate \
    -H "Content-Type: application/json" \
    -d '{
      "materials": [
        {"materialTypeId": "xxx", "weightKg": 5, "qualityGrade": "standard"}
      ],
      "governorate": "القاهرة"
    }'
```

### 3.3 تاريخ الأسعار

```yaml
GET /prices/history/:materialTypeId

Description: الحصول على تاريخ أسعار مادة معينة

Path Parameters:
  materialTypeId: string (required)

Query Parameters:
  period: enum (optional)
    - Values: "7d", "30d", "90d", "1y"
    - Default: "30d"
  governorate: string (optional)

Response 200:
  success: true
  data:
    materialType:
      id: "uuid"
      nameAr: "نحاس أحمر"
    history:
      - date: "2024-12-01"
        price: 580.00
      - date: "2024-12-02"
        price: 585.00
      - date: "2024-12-03"
        price: 588.00
    statistics:
      min: 570.00
      max: 595.00
      avg: 583.50
      change: 1.4  # percentage
```

### 3.4 تنبيهات الأسعار

```yaml
GET /prices/alerts

Description: الحصول على تنبيهات الأسعار للمستخدم

Headers:
  Authorization: Bearer <token>

Response 200:
  success: true
  data:
    alerts:
      - id: "uuid"
        materialType:
          id: "uuid"
          nameAr: "نحاس أحمر"
        alertType: "above"
        threshold: 600.00
        isActive: true
        lastTriggeredAt: null
        createdAt: "2024-12-01T10:00:00Z"

---

POST /prices/alerts

Description: إنشاء تنبيه سعر جديد

Headers:
  Authorization: Bearer <token>

Request Body:
  materialTypeId: string (required)
  alertType: enum (required)
    - Values: "above", "below", "change_percent"
  threshold: number (required)
    - For above/below: price value
    - For change_percent: percentage (e.g., 5 for 5%)

Response 201:
  success: true
  data:
    alert:
      id: "uuid"
      ...

---

DELETE /prices/alerts/:id

Description: حذف تنبيه سعر

Headers:
  Authorization: Bearer <token>

Response 200:
  success: true
  data:
    message: "تم حذف التنبيه"
```

---

## 4. طلبات الجمع

### 4.1 إنشاء طلب جمع

```yaml
POST /pickups

Description: إنشاء طلب جمع خردة من الباب

Headers:
  Authorization: Bearer <token>

Request Body:
  materials: array (required)
    - materialTypeId: string (required)
    - estimatedKg: number (required, min: 0.5)
    - qualityGrade: enum (optional, default: "standard")
  address: object (required)
    governorate: string (required)
    city: string (required)
    street: string (required)
    building: string (optional)
    floor: string (optional)
    landmark: string (optional)
    lat: number (optional)
    lng: number (optional)
  preferredDate: string (required)
    - Format: YYYY-MM-DD
    - Must be today or future
  preferredTimeSlot: enum (required)
    - Values: "morning", "afternoon", "evening"
  notes: string (optional, max: 500)

Response 201:
  success: true
  data:
    pickup:
      id: "uuid"
      requestNumber: "XSP-2024-000123"
      status: "pending"
      materials: [...]
      totalEstimatedKg: 10.0
      estimatedPrice: 1000.00
      address: {...}
      preferredDate: "2024-12-15"
      preferredTimeSlot: "morning"
      createdAt: "2024-12-13T10:00:00Z"

Response 400:
  error:
    code: "INVALID_DATE"
    message: "لا يمكن اختيار تاريخ في الماضي"
```

### 4.2 الحصول على طلباتي

```yaml
GET /pickups

Description: الحصول على طلبات الجمع للمستخدم

Headers:
  Authorization: Bearer <token>

Query Parameters:
  status: enum (optional)
    - Values: "pending", "assigned", "completed", "cancelled"
  page: number (optional, default: 1)
  limit: number (optional, default: 20)

Response 200:
  success: true
  data:
    pickups:
      - id: "uuid"
        requestNumber: "XSP-2024-000123"
        status: "assigned"
        collector:
          id: "uuid"
          name: "محمد حسن"
          phone: "+201098765432"
          rating: 4.8
        estimatedPrice: 1000.00
        preferredDate: "2024-12-15"
        preferredTimeSlot: "morning"
    meta:
      page: 1
      limit: 20
      total: 5
```

### 4.3 تفاصيل طلب

```yaml
GET /pickups/:id

Description: الحصول على تفاصيل طلب جمع

Headers:
  Authorization: Bearer <token>

Response 200:
  success: true
  data:
    pickup:
      id: "uuid"
      requestNumber: "XSP-2024-000123"
      status: "on_the_way"
      materials:
        - materialType:
            id: "uuid"
            nameAr: "نحاس أحمر"
          estimatedKg: 5.0
          qualityGrade: "standard"
      totalEstimatedKg: 10.0
      estimatedPrice: 1000.00
      address:
        governorate: "القاهرة"
        city: "مدينة نصر"
        street: "شارع مصطفى النحاس"
        ...
      collector:
        id: "uuid"
        name: "محمد حسن"
        phone: "+201098765432"
        rating: 4.8
        vehicleType: "tricycle"
        currentLocation:
          lat: 30.05
          lng: 31.24
        eta: 15  # minutes
      timeline:
        - status: "pending"
          at: "2024-12-13T10:00:00Z"
        - status: "assigned"
          at: "2024-12-13T10:05:00Z"
        - status: "on_the_way"
          at: "2024-12-13T10:30:00Z"
```

### 4.4 إلغاء طلب

```yaml
POST /pickups/:id/cancel

Description: إلغاء طلب جمع

Headers:
  Authorization: Bearer <token>

Request Body:
  reason: string (required, min: 10)

Response 200:
  success: true
  data:
    message: "تم إلغاء الطلب"

Response 400:
  error:
    code: "CANNOT_CANCEL"
    message: "لا يمكن إلغاء الطلب بعد وصول الجامع"
```

---

## 5. الإعلانات

### 5.1 تصفح الإعلانات

```yaml
GET /listings

Description: تصفح إعلانات البيع والشراء

Query Parameters:
  listingType: enum (optional)
    - Values: "sell", "buy"
  categoryId: string (optional)
  materialTypeId: string (optional)
  governorate: string (optional)
  minQuantity: number (optional)
  maxQuantity: number (optional)
  minPrice: number (optional)
  maxPrice: number (optional)
  sortBy: enum (optional)
    - Values: "price", "quantity", "date", "rating"
    - Default: "date"
  sortOrder: enum (optional)
    - Values: "asc", "desc"
    - Default: "desc"
  page: number (optional)
  limit: number (optional)

Response 200:
  success: true
  data:
    listings:
      - id: "uuid"
        listingType: "sell"
        title: "حديد خردة ممتاز - 500 كيلو"
        materialType:
          id: "uuid"
          nameAr: "حديد خردة"
        qualityGrade: "premium"
        quantityKg: 500.0
        pricePerKg: 42.00
        priceTotal: 21000.00
        priceNegotiable: true
        images: ["url1", "url2"]
        addressGovernorate: "الجيزة"
        seller:
          id: "uuid"
          name: "أحمد"
          rating: 4.5
          isVerified: true
        viewsCount: 120
        createdAt: "2024-12-10T10:00:00Z"
```

### 5.2 إنشاء إعلان

```yaml
POST /listings

Description: إنشاء إعلان بيع أو شراء

Headers:
  Authorization: Bearer <token>

Request Body:
  listingType: enum (required)
    - Values: "sell", "buy"
  materialTypeId: string (required)
  title: string (required, min: 10, max: 100)
  description: string (optional, max: 1000)
  qualityGrade: enum (optional, default: "standard")
  quantityKg: number (required, min: 1)
  pricePerKg: number (optional)
  priceNegotiable: boolean (optional, default: true)
  images: array of strings (optional, max: 5)
  address: object (required)
    governorate: string (required)
    city: string (optional)
    details: string (optional)
  pickupAvailable: boolean (optional, default: true)
  deliveryAvailable: boolean (optional, default: false)

Response 201:
  success: true
  data:
    listing:
      id: "uuid"
      status: "pending"  # needs approval
      ...
```

### 5.3 تفاصيل إعلان

```yaml
GET /listings/:id

Description: الحصول على تفاصيل إعلان

Response 200:
  success: true
  data:
    listing:
      id: "uuid"
      ...
    similarListings: [...]
    currentMarketPrice: 40.00  # للمقارنة
```

---

## 6. التجار

### 6.1 قائمة التجار

```yaml
GET /dealers

Description: البحث عن تجار الخردة

Query Parameters:
  governorate: string (optional)
  city: string (optional)
  materialTypeId: string (optional)
  businessType: enum (optional)
    - Values: "shop", "warehouse", "factory", "recycler"
  hasScale: boolean (optional)
  offersPickup: boolean (optional)
  isVerified: boolean (optional)
  lat: number (optional)
  lng: number (optional)
  radiusKm: number (optional, default: 10)
  sortBy: enum (optional)
    - Values: "distance", "rating", "transactions"
    - Default: "distance"
  page: number (optional)
  limit: number (optional)

Response 200:
  success: true
  data:
    dealers:
      - id: "uuid"
        businessName: "مخازن الأمل للخردة"
        businessType: "warehouse"
        specializations: ["حديد", "نحاس", "ألومنيوم"]
        address:
          governorate: "القاهرة"
          city: "السبتية"
          lat: 30.05
          lng: 31.24
        distance: 2.5  # km (if location provided)
        rating: 4.7
        totalTransactions: 500
        hasScale: true
        scaleCapacityKg: 5000
        offersPickup: true
        workingHours:
          today: "09:00 - 20:00"
          isOpen: true
        isVerified: true
        isFeatured: true
```

### 6.2 تفاصيل تاجر

```yaml
GET /dealers/:id

Description: الحصول على تفاصيل تاجر

Response 200:
  success: true
  data:
    dealer:
      id: "uuid"
      businessName: "مخازن الأمل للخردة"
      businessType: "warehouse"
      specializations: [...]
      address: {...}
      phone: "+201111222333"
      whatsapp: "+201111222333"
      workingHours:
        saturday: {start: "09:00", end: "20:00"}
        sunday: {start: "09:00", end: "20:00"}
        ...
      facilities:
        hasScale: true
        scaleCapacityKg: 5000
        hasLoadingEquipment: true
        acceptsSmallQuantities: true
        minQuantityKg: 10
      services:
        offersPickup: true
        pickupFeePerKm: 5.00
      stats:
        totalTransactions: 500
        totalWeightKg: 150000
        rating: 4.7
        reviewsCount: 85
      prices:  # إن وجدت
        - materialType: {...}
          buyPricePerKg: 38.00
      reviews:
        - id: "uuid"
          reviewer:
            name: "أحمد"
          rating: 5
          comment: "تعامل ممتاز"
          createdAt: "2024-12-01"
      images: [...]
      isVerified: true
```

---

## 7. المستخدمين

### 7.1 الملف الشخصي

```yaml
GET /users/me

Description: الحصول على الملف الشخصي

Headers:
  Authorization: Bearer <token>

Response 200:
  success: true
  data:
    user:
      id: "uuid"
      phone: "+201012345678"
      name: "أحمد محمد"
      userType: "individual"
      addressGovernorate: "القاهرة"
      addressCity: "مدينة نصر"
      rating: 4.5
      totalTransactions: 10
      walletBalance: 500.00
      isVerified: true
      createdAt: "2024-01-01T10:00:00Z"
```

### 7.2 تحديث الملف الشخصي

```yaml
PATCH /users/me

Description: تحديث الملف الشخصي

Headers:
  Authorization: Bearer <token>

Request Body:
  name: string (optional)
  addressGovernorate: string (optional)
  addressCity: string (optional)
  addressStreet: string (optional)

Response 200:
  success: true
  data:
    user: {...}
```

### 7.3 إحصائياتي

```yaml
GET /users/me/stats

Description: إحصائيات المستخدم

Headers:
  Authorization: Bearer <token>

Response 200:
  success: true
  data:
    stats:
      totalTransactions: 10
      totalWeightKg: 150.5
      totalEarnings: 5000.00
      thisMonth:
        transactions: 3
        weightKg: 45.0
        earnings: 1500.00
      byMaterial:
        - materialType: "نحاس"
          weightKg: 50.0
          earnings: 2500.00
        - materialType: "حديد"
          weightKg: 100.5
          earnings: 2500.00
```

---

## 8. أكواد الخطأ

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limit |
| 500 | Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PHONE` | رقم الموبايل غير صحيح |
| `INVALID_OTP` | رمز التحقق غير صحيح |
| `OTP_EXPIRED` | انتهت صلاحية الرمز |
| `RATE_LIMIT` | تجاوز عدد المحاولات |
| `UNAUTHORIZED` | غير مصرح |
| `TOKEN_EXPIRED` | انتهت صلاحية الـ token |
| `NOT_FOUND` | غير موجود |
| `VALIDATION_ERROR` | خطأ في البيانات |
| `CANNOT_CANCEL` | لا يمكن الإلغاء |
| `INSUFFICIENT_BALANCE` | رصيد غير كافي |

---

## 📝 Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/send-otp` | 5/hour per phone |
| `/auth/verify-otp` | 10/hour per phone |
| General API | 100/minute per user |
| Unauthenticated | 30/minute per IP |

---

## 🔐 Authentication

All authenticated endpoints require:

```http
Authorization: Bearer <access_token>
```

Token expiry: 1 hour
Refresh token expiry: 30 days

---

*آخر تحديث: ديسمبر 2024*
*Xchange Scrap API v1.0*
