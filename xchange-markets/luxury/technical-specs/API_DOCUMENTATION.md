# 📡 Xchange Luxury API Documentation

## REST API Reference v1.0

---

## 🔐 Authentication

### Base URL
```
Production: https://api.xchange.com.eg/v1
Staging: https://staging-api.xchange.com.eg/v1
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Rate Limits
- Authenticated: 100 requests/minute
- Unauthenticated: 20 requests/minute
- Pro Dealers: 500 requests/minute

---

## 📱 Auth Endpoints

### Send OTP
```http
POST /auth/send-otp
```

**Request Body:**
```json
{
  "phone": "+201001234567"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق",
  "expiresIn": 120
}
```

**Errors:**
- `400` - Invalid phone number
- `429` - Too many attempts (max 5/hour)

---

### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "phone": "+201001234567",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "phone": "+201001234567",
    "fullName": "أحمد محمد",
    "avatarUrl": "https://...",
    "sellerLevel": "verified",
    "sellerRating": 4.8,
    "isIdentityVerified": true
  },
  "isNewUser": false
}
```

**Errors:**
- `400` - Invalid OTP
- `401` - OTP expired
- `429` - Too many failed attempts

---

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

---

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## 👤 User Endpoints

### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "phone": "+201001234567",
  "email": "user@example.com",
  "fullName": "أحمد محمد",
  "avatarUrl": "https://...",
  "isPhoneVerified": true,
  "isEmailVerified": true,
  "isIdentityVerified": true,
  "sellerLevel": "verified",
  "sellerRating": 4.8,
  "totalSales": 15,
  "totalPurchases": 5,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Update Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "أحمد محمد علي",
  "email": "ahmed@example.com",
  "preferredLanguage": "ar"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "fullName": "أحمد محمد علي",
  "email": "ahmed@example.com",
  // ... full user object
}
```

---

### Upload Avatar
```http
POST /users/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
avatar: <file>
```

**Response (200):**
```json
{
  "avatarUrl": "https://cdn.xchange.com.eg/avatars/uuid.jpg"
}
```

---

### Verify Identity
```http
POST /users/me/verify-identity
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
idFront: <file>
idBack: <file>
selfieWithId: <file>
```

**Response (200):**
```json
{
  "status": "pending",
  "message": "تم استلام الطلب، سيتم المراجعة خلال 24 ساعة"
}
```

---

### Get User Public Profile
```http
GET /users/:userId/public
```

**Response (200):**
```json
{
  "id": "uuid",
  "fullName": "أحمد م.",
  "avatarUrl": "https://...",
  "sellerLevel": "verified",
  "sellerRating": 4.8,
  "totalSales": 15,
  "memberSince": "2024-01-15",
  "responseTime": "عادة يرد خلال ساعة"
}
```

---

## 📦 Products Endpoints

### List Products
```http
GET /products
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20, max: 50) |
| `category` | string | Category slug |
| `brands` | string[] | Brand IDs (comma-separated) |
| `priceMin` | number | Minimum price |
| `priceMax` | number | Maximum price |
| `condition` | string[] | Conditions (comma-separated) |
| `authStatus` | string[] | Authentication status |
| `sort` | string | Sort order (newest, price_asc, price_desc, popular) |
| `q` | string | Search query |

**Example:**
```
GET /products?category=watches&brands=rolex,omega&priceMin=100000&sort=newest
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Rolex Submariner Date 116610LN",
      "price": 450000,
      "currency": "EGP",
      "condition": "excellent",
      "authenticationStatus": "fully_verified",
      "brand": {
        "id": "uuid",
        "name": "Rolex",
        "slug": "rolex"
      },
      "category": {
        "id": "uuid",
        "nameAr": "ساعات",
        "slug": "watches"
      },
      "primaryImage": "https://...",
      "seller": {
        "id": "uuid",
        "fullName": "أحمد م.",
        "sellerLevel": "trusted",
        "sellerRating": 4.8
      },
      "viewsCount": 234,
      "favoritesCount": 18,
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### Get Product Details
```http
GET /products/:productId
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Rolex Submariner Date 116610LN",
  "description": "ساعة روليكس صب مارينر سوداء...",
  "price": 450000,
  "originalRetailPrice": 380000,
  "currency": "EGP",
  "isNegotiable": true,
  "acceptsTrade": true,
  "condition": "excellent",
  "conditionNotes": "خدوش طفيفة جداً...",
  
  "brand": {
    "id": "uuid",
    "name": "Rolex",
    "slug": "rolex",
    "tier": "prestige"
  },
  "category": {
    "id": "uuid",
    "nameAr": "ساعات",
    "nameEn": "Watches",
    "slug": "watches"
  },
  
  "model": "Submariner Date",
  "referenceNumber": "116610LN",
  
  "watchDetails": {
    "movement": "automatic",
    "caseSize": "40mm",
    "caseMaterial": "Oystersteel",
    "dialColor": "Black",
    "braceletMaterial": "Oystersteel",
    "year": 2020,
    "boxPapers": true,
    "serviceHistory": "تم الصيانة في 2023"
  },
  
  "authentication": {
    "status": "fully_verified",
    "certificateUrl": "https://...",
    "aiResult": "authentic",
    "aiConfidence": 99.1,
    "expertVerified": true,
    "verifiedAt": "2024-12-01T12:00:00Z"
  },
  
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "isPrimary": true,
      "imageType": "main"
    }
  ],
  
  "seller": {
    "id": "uuid",
    "fullName": "أحمد م.",
    "avatarUrl": "https://...",
    "sellerLevel": "trusted",
    "sellerRating": 4.8,
    "totalSales": 15,
    "memberSince": "2024-01-15",
    "responseTime": "عادة يرد خلال ساعة"
  },
  
  "viewsCount": 234,
  "favoritesCount": 18,
  "status": "active",
  "createdAt": "2024-12-01T10:00:00Z",
  "publishedAt": "2024-12-01T12:00:00Z"
}
```

---

### Create Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "categoryId": "uuid",
  "brandId": "uuid",
  "title": "Rolex Submariner Date 116610LN",
  "description": "ساعة روليكس صب مارينر سوداء...",
  "model": "Submariner Date",
  "referenceNumber": "116610LN",
  "condition": "excellent",
  "conditionNotes": "خدوش طفيفة...",
  "price": 450000,
  "originalRetailPrice": 380000,
  "isNegotiable": true,
  "acceptsTrade": true,
  
  "watchMovement": "automatic",
  "watchCaseSize": "40mm",
  "watchCaseMaterial": "Oystersteel",
  "watchDialColor": "Black",
  "watchBraceletMaterial": "Oystersteel",
  "watchYear": 2020,
  "watchBoxPapers": true,
  "watchServiceHistory": "تم الصيانة في 2023"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "status": "draft",
  // ... full product object
}
```

---

### Upload Product Images
```http
POST /products/:productId/images
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
images[]: <file>
images[]: <file>
imageTypes[]: main
imageTypes[]: detail
```

**Response (200):**
```json
{
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "imageType": "main"
    }
  ]
}
```

---

### Update Product
```http
PUT /products/:productId
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (partial update allowed)
```json
{
  "price": 420000,
  "description": "وصف محدث..."
}
```

---

### Publish Product
```http
POST /products/:productId/publish
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "active",
  "publishedAt": "2024-12-01T12:00:00Z"
}
```

---

### Delete Product
```http
DELETE /products/:productId
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Record View
```http
POST /products/:productId/view
```

**Response (200):**
```json
{
  "viewsCount": 235
}
```

---

### Get Similar Products
```http
GET /products/:productId/similar
```

**Response (200):**
```json
{
  "data": [
    // Array of product objects
  ]
}
```

---

## 💰 Offers Endpoints

### Create Offer
```http
POST /offers
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (Cash Offer):**
```json
{
  "productId": "uuid",
  "offerType": "cash",
  "cashAmount": 400000,
  "message": "عرض جاد، جاهز للدفع فوراً",
  "expiresInHours": 48
}
```

**Request Body (Trade Offer):**
```json
{
  "productId": "uuid",
  "offerType": "trade",
  "tradeProductId": "uuid",
  "message": "أقترح مقايضة بساعتي"
}
```

**Request Body (Mixed Offer):**
```json
{
  "productId": "uuid",
  "offerType": "mixed",
  "tradeProductId": "uuid",
  "cashAmount": 50000,
  "message": "ساعتي + 50,000 فرق"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "offerType": "cash",
  "cashAmount": 400000,
  "status": "pending",
  "expiresAt": "2024-12-03T10:00:00Z",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

---

### Get Received Offers
```http
GET /offers/received
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | string | Filter by product |
| `status` | string | Filter by status |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "title": "Rolex Submariner",
        "price": 450000,
        "primaryImage": "https://..."
      },
      "buyer": {
        "id": "uuid",
        "fullName": "سارة أ.",
        "sellerRating": 4.5
      },
      "offerType": "cash",
      "cashAmount": 400000,
      "status": "pending",
      "message": "عرض جاد...",
      "expiresAt": "2024-12-03T10:00:00Z",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

---

### Get Sent Offers
```http
GET /offers/sent
Authorization: Bearer <token>
```

---

### Accept Offer
```http
PUT /offers/:offerId/accept
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "offer": {
    "id": "uuid",
    "status": "accepted"
  },
  "transaction": {
    "id": "uuid",
    "status": "pending_payment"
  }
}
```

---

### Reject Offer
```http
PUT /offers/:offerId/reject
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "السعر منخفض جداً"
}
```

---

### Counter Offer
```http
POST /offers/:offerId/counter
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "cashAmount": 420000,
  "message": "أقل سعر ممكن"
}
```

---

### Withdraw Offer
```http
DELETE /offers/:offerId
Authorization: Bearer <token>
```

---

## 💳 Transactions Endpoints

### Get My Transactions
```http
GET /transactions
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | "buyer" or "seller" |
| `status` | string | Transaction status |

---

### Get Transaction Details
```http
GET /transactions/:transactionId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "transactionType": "sale",
  "status": "shipped",
  
  "product": {
    "id": "uuid",
    "title": "Rolex Submariner",
    "primaryImage": "https://..."
  },
  
  "seller": {
    "id": "uuid",
    "fullName": "أحمد م."
  },
  
  "buyer": {
    "id": "uuid",
    "fullName": "سارة أ."
  },
  
  "salePrice": 420000,
  "platformFee": 50400,
  "sellerPayout": 369600,
  
  "paymentMethod": "card",
  "paymentReference": "PAY-xxx",
  
  "shipping": {
    "provider": "Bosta",
    "trackingNumber": "BOSTA123456",
    "shippedAt": "2024-12-02T10:00:00Z"
  },
  
  "timeline": [
    {
      "status": "pending_payment",
      "timestamp": "2024-12-01T10:00:00Z"
    },
    {
      "status": "paid",
      "timestamp": "2024-12-01T10:30:00Z"
    },
    {
      "status": "shipped",
      "timestamp": "2024-12-02T10:00:00Z"
    }
  ],
  
  "inspectionEndsAt": "2024-12-16T10:00:00Z",
  
  "createdAt": "2024-12-01T10:00:00Z"
}
```

---

### Initiate Payment
```http
POST /transactions/:transactionId/pay
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentMethod": "card"
}
```

**Response (200):**
```json
{
  "paymentUrl": "https://accept.paymob.com/...",
  "iframeId": "123456"
}
```

---

### Confirm Shipment
```http
POST /transactions/:transactionId/ship
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shippingProvider": "Bosta",
  "trackingNumber": "BOSTA123456"
}
```

---

### Confirm Receipt
```http
POST /transactions/:transactionId/confirm
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "completed",
  "message": "تم تأكيد الاستلام وتحويل المبلغ للبائع"
}
```

---

### Open Dispute
```http
POST /transactions/:transactionId/dispute
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "item_not_as_described",
  "description": "الساعة بها خدوش كبيرة لم تُذكر في الوصف",
  "evidence": ["https://...image1.jpg", "https://...image2.jpg"]
}
```

---

## ⭐ Reviews Endpoints

### Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "transactionId": "uuid",
  "rating": 5,
  "itemAsDescribed": 5,
  "communication": 5,
  "shippingSpeed": 4,
  "comment": "بائع ممتاز، المنتج مطابق تماماً للوصف"
}
```

---

### Respond to Review
```http
PUT /reviews/:reviewId/respond
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "response": "شكراً لك، سعيد بتعاملك معنا"
}
```

---

## ❤️ Favorites Endpoints

### Get Favorites
```http
GET /favorites
Authorization: Bearer <token>
```

---

### Add to Favorites
```http
POST /favorites/:productId
Authorization: Bearer <token>
```

---

### Remove from Favorites
```http
DELETE /favorites/:productId
Authorization: Bearer <token>
```

---

## 🔔 Notifications Endpoints

### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `unreadOnly` | boolean | Only unread |

---

### Mark as Read
```http
PUT /notifications/:notificationId/read
Authorization: Bearer <token>
```

---

### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

---

## 📊 Metadata Endpoints

### Get Categories
```http
GET /categories
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nameAr": "ساعات",
      "nameEn": "Watches",
      "slug": "watches",
      "icon": "⌚",
      "productCount": 156
    }
  ]
}
```

---

### Get Brands
```http
GET /brands
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Category slug |

---

### Get Price Estimate
```http
POST /prices/estimate
Content-Type: application/json
```

**Request Body:**
```json
{
  "brandId": "uuid",
  "model": "Submariner Date",
  "referenceNumber": "116610LN",
  "condition": "excellent",
  "year": 2020,
  "boxPapers": true
}
```

**Response (200):**
```json
{
  "estimatedPrice": 450000,
  "priceRange": {
    "low": 400000,
    "high": 500000
  },
  "factors": {
    "brandPremium": 1.2,
    "conditionAdjustment": 0.95,
    "boxPapersBonus": 1.1
  },
  "comparables": [
    {
      "title": "Rolex Submariner 2019",
      "price": 430000,
      "soldAt": "2024-11-15"
    }
  ]
}
```

---

## 🔐 Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "البيانات المدخلة غير صحيحة",
    "details": [
      {
        "field": "price",
        "message": "السعر مطلوب"
      }
    ]
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Token missing or invalid |
| `FORBIDDEN` | 403 | Not allowed |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal error |

---

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('wss://api.xchange.com.eg', {
  auth: { token: accessToken }
});
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `offer:new` | Server → Client | New offer received |
| `offer:accepted` | Server → Client | Offer accepted |
| `offer:rejected` | Server → Client | Offer rejected |
| `transaction:paid` | Server → Client | Payment received |
| `transaction:shipped` | Server → Client | Item shipped |
| `message:new` | Server → Client | New message |
| `notification:new` | Server → Client | New notification |

---

*API Version: 1.0*
*Last Updated: December 2024*
