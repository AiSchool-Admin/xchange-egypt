# Xchange Cars API Endpoints - Complete Documentation

BASE_URL: https://api.xchange.eg/v1

## 🔐 AUTHENTICATION

### POST /auth/register
Register new user
```json
Body: {
  "phone": "01012345678",
  "password": "********",
  "firstName": "محمد",
  "lastName": "أحمد",
  "governorate": "Cairo",
  "city": "Nasr City"
}
Response: {
  "user": {...},
  "token": "jwt_token"
}
```

### POST /auth/login
Login
```json
Body: {
  "phone": "01012345678",
  "password": "********"
}
Response: {
  "user": {...},
  "token": "jwt_token"
}
```

### POST /auth/verify-phone
Send OTP to verify phone
```json
Body: {
  "phone": "01012345678"
}
Response: {
  "otpSent": true,
  "expiresIn": 300
}
```

### POST /auth/confirm-otp
Confirm OTP code
```json
Body: {
  "phone": "01012345678",
  "otp": "123456"
}
Response: {
  "verified": true
}
```

### POST /auth/upload-national-id
Upload national ID for verification
```json
Body: FormData {
  "frontImage": File,
  "backImage": File,
  "selfie": File
}
Response: {
  "uploaded": true,
  "verificationStatus": "PENDING"
}
```

---

## 👤 USER MANAGEMENT

### GET /users/me
Get current user profile
```json
Response: {
  "id": "...",
  "phone": "01012345678",
  "firstName": "محمد",
  "rating": 4.7,
  "totalReviews": 15,
  "verificationLevel": "ID_VERIFIED"
}
```

### PATCH /users/me
Update profile
```json
Body: {
  "firstName": "محمد",
  "governorate": "Giza",
  "bankName": "CIB",
  "accountNumber": "123456789"
}
Response: {
  "updated": true,
  "user": {...}
}
```

### GET /users/:id
Get public user profile
```json
Response: {
  "id": "...",
  "firstName": "محمد",
  "rating": 4.7,
  "totalReviews": 15,
  "successfulSales": 8,
  "memberSince": "2024-01-15"
}
```

### GET /users/:id/reviews
Get user reviews
```json
Query: ?page=1&limit=10
Response: {
  "reviews": [...],
  "total": 15,
  "averageRating": 4.7
}
```

---

## 🚗 VEHICLE DATABASE

### GET /vehicles/search
Search for vehicle specs (for auto-complete)
```json
Query: ?make=Toyota&model=Cor
Response: {
  "suggestions": [
    {
      "make": "Toyota",
      "model": "Corolla",
      "years": [2020, 2021, 2022, 2023, 2024]
    }
  ]
}
```

### GET /vehicles/makes
Get all car makes
```json
Response: {
  "makes": [
    "Toyota",
    "Hyundai",
    "Nissan",
    "Chevrolet",
    ...
  ]
}
```

### GET /vehicles/models/:make
Get models for a make
```json
Response: {
  "make": "Toyota",
  "models": [
    "Corolla",
    "Camry",
    "RAV4",
    ...
  ]
}
```

### POST /vehicles/vin-decode
Decode VIN number
```json
Body: {
  "vin": "1HGBH41JXMN109186"
}
Response: {
  "make": "Toyota",
  "model": "Corolla",
  "year": 2021,
  "engineSize": 1.6,
  "fuelType": "GASOLINE"
}
```

---

## 📝 LISTINGS

### POST /listings
Create new listing
```json
Body: {
  "title": "تويوتا كورولا 2021 فابريكا بالكامل",
  "description": "سيارة بحالة ممتازة...",
  "vehicle": {
    "make": "Toyota",
    "model": "Corolla",
    "year": 2021,
    "mileage": 45000,
    "condition": "USED_EXCELLENT",
    "color": "أبيض",
    ...
  },
  "askingPrice": 480000,
  "negotiable": true,
  "governorate": "Cairo",
  "city": "Nasr City",
  "acceptsTradeIn": true,
  "acceptsBarter": true
}
Response: {
  "listing": {...},
  "id": "listing_id"
}
```

### POST /listings/:id/images
Upload listing images
```json
Body: FormData {
  "images": [File, File, File, ...]
}
Response: {
  "uploaded": 5,
  "images": [
    {
      "id": "...",
      "url": "https://...",
      "thumbnail": "https://..."
    }
  ]
}
```

### GET /listings
Search listings
```json
Query: ?make=Toyota&priceMax=500000&governorate=Cairo&page=1&limit=20&sort=price_asc
Response: {
  "listings": [...],
  "total": 156,
  "page": 1,
  "totalPages": 8,
  "filters": {
    "makeOptions": ["Toyota", "Hyundai", ...],
    "priceRange": {min: 200000, max: 2000000},
    "yearRange": {min: 2015, max: 2024}
  }
}
```

### GET /listings/:id
Get single listing
```json
Response: {
  "listing": {
    "id": "...",
    "title": "...",
    "vehicle": {...},
    "seller": {
      "id": "...",
      "firstName": "محمد",
      "rating": 4.7,
      "verificationLevel": "ID_VERIFIED"
    },
    "inspection": {...},  // if certified
    "images": [...],
    "views": 234,
    "favorites": 12
  },
  "similarListings": [...]
}
```

### PATCH /listings/:id
Update listing
```json
Body: {
  "askingPrice": 470000,
  "description": "Updated description..."
}
Response: {
  "updated": true
}
```

### DELETE /listings/:id
Delete listing
```json
Response: {
  "deleted": true
}
```

### POST /listings/:id/favorite
Add to favorites
```json
Response: {
  "favorited": true
}
```

### DELETE /listings/:id/favorite
Remove from favorites
```json
Response: {
  "removed": true
}
```

### POST /listings/:id/report
Report listing
```json
Body: {
  "reason": "FAKE_LISTING",
  "details": "السيارة غير موجودة"
}
Response: {
  "reported": true
}
```

---

## 🔍 INSPECTION

### POST /inspections/schedule
Schedule inspection
```json
Body: {
  "listingId": "...",
  "preferredDate": "2024-12-20T10:00:00Z",
  "address": "شارع..."
}
Response: {
  "inspection": {
    "id": "...",
    "scheduledAt": "...",
    "status": "SCHEDULED"
  }
}
```

### GET /inspections/:id
Get inspection report
```json
Response: {
  "inspection": {
    "id": "...",
    "overallGrade": "A",
    "overallScore": 92,
    "exteriorScore": 95,
    "interiorScore": 90,
    "mechanicalScore": 88,
    "hasCriticalIssues": false,
    "checklistResults": {...},
    "inspectorNotes": "...",
    "certificationCode": "XCHG-INS-12345"
  }
}
```

### POST /inspections/:id/complete
Complete inspection (Inspector only)
```json
Body: {
  "overallGrade": "A",
  "overallScore": 92,
  "checklistResults": {...},
  "paintThickness": {...},
  "odbCodes": [],
  "batteryHealth": 95,
  "inspectorNotes": "..."
}
Response: {
  "completed": true,
  "certificationCode": "XCHG-INS-12345"
}
```

---

## 💰 TRANSACTIONS

### POST /transactions/initiate
Initiate purchase
```json
Body: {
  "listingId": "...",
  "offeredPrice": 475000,
  "paymentMethod": "BANK_TRANSFER",
  "requiresDelivery": true,
  "deliveryAddress": "...",
  "requestFinancing": true
}
Response: {
  "transaction": {
    "id": "...",
    "transactionCode": "XCHG-TXN-12345",
    "status": "INITIATED",
    "totalAmount": 480000
  }
}
```

### POST /transactions/:id/payment
Process payment
```json
Body: {
  "method": "CARD",
  "amount": 480000,
  "cardToken": "..."  // from Paymob
}
Response: {
  "paymentSuccessful": true,
  "escrowHeld": true,
  "status": "PAYMENT_HELD"
}
```

### POST /transactions/:id/confirm-delivery
Confirm delivery received (Buyer)
```json
Body: {
  "deliveryProof": "base64_image",
  "satisfaction": "SATISFIED"
}
Response: {
  "confirmed": true,
  "escrowReleased": true,
  "status": "COMPLETED"
}
```

### POST /transactions/:id/request-refund
Request refund
```json
Body: {
  "reason": "VEHICLE_MISMATCH",
  "details": "السيارة لا تطابق الوصف",
  "evidence": ["url1", "url2"]
}
Response: {
  "refundRequested": true,
  "disputeId": "..."
}
```

### GET /transactions/:id
Get transaction details
```json
Response: {
  "transaction": {
    "id": "...",
    "status": "PAYMENT_HELD",
    "listing": {...},
    "buyer": {...},
    "seller": {...},
    "timeline": [
      {
        "status": "INITIATED",
        "timestamp": "..."
      },
      ...
    ]
  }
}
```

---

## 💳 FINANCING

### POST /financing/check-eligibility
Check financing eligibility
```json
Body: {
  "vehiclePrice": 480000,
  "downPayment": 100000,
  "monthlyIncome": 15000
}
Response: {
  "eligible": true,
  "maxFinanceAmount": 380000,
  "suggestedTerms": [
    {
      "months": 36,
      "monthlyPayment": 12500,
      "interestRate": 22,
      "totalPayable": 450000
    },
    ...
  ]
}
```

### POST /financing/apply
Apply for financing
```json
Body: {
  "transactionId": "...",
  "partnerId": "CONTACT",
  "downPayment": 100000,
  "durationMonths": 36,
  "employmentDetails": {...},
  "documents": [...]
}
Response: {
  "applicationId": "...",
  "status": "PENDING",
  "estimatedDecisionTime": "24 hours"
}
```

### GET /financing/:id/status
Get financing status
```json
Response: {
  "status": "APPROVED",
  "approvedAmount": 380000,
  "monthlyPayment": 12500,
  "contractUrl": "..."
}
```

---

## 🔄 TRADE-IN

### POST /trade-in/request
Request trade-in quote
```json
Body: {
  "oldCar": {
    "make": "Toyota",
    "model": "Corolla",
    "year": 2015,
    "mileage": 120000,
    "condition": "USED_GOOD"
  },
  "images": ["url1", "url2", ...],
  "newCarListingId": "..."  // optional
}
Response: {
  "requestId": "...",
  "estimatedValue": 220000,
  "quoteValidUntil": "2024-12-25T23:59:59Z"
}
```

### POST /trade-in/:id/accept
Accept trade-in quote
```json
Response: {
  "accepted": true,
  "inspectionScheduled": true
}
```

### GET /trade-in/:id
Get trade-in request status
```json
Response: {
  "request": {
    "id": "...",
    "status": "QUOTE_PROVIDED",
    "estimatedValue": 220000,
    "oldCar": {...}
  }
}
```

---

## 🔀 BARTER (المقايضة)

### POST /barter/create-offer
Create barter offer
```json
Body: {
  "myListingId": "...",
  "interestedListingId": "...",  // optional
  "barterType": "CAR_FOR_CAR",
  "myItemValue": 480000,
  "theirItemValue": 520000,
  "cashDifference": 40000,
  "whoPays": "INITIATOR",
  "message": "مرحباً، هل تقبل المبادلة؟"
}
Response: {
  "offer": {
    "id": "...",
    "offerCode": "XCHG-BRT-12345",
    "status": "PROPOSED"
  }
}
```

### POST /barter/:id/counter-offer
Counter barter offer
```json
Body: {
  "myItemValue": 520000,
  "theirItemValue": 480000,
  "cashDifference": 30000,
  "whoPays": "RECEIVER",
  "message": "أقبل بفرق 30 ألف فقط"
}
Response: {
  "counterOffer": {
    "id": "..."
  }
}
```

### POST /barter/:id/accept
Accept barter offer
```json
Response: {
  "accepted": true,
  "transactionCreated": true,
  "transactionId": "..."
}
```

### GET /barter/my-offers
Get my barter offers
```json
Query: ?status=PROPOSED&page=1
Response: {
  "offers": [...],
  "total": 5
}
```

---

## ⚖️ DISPUTES

### POST /disputes/create
Create dispute
```json
Body: {
  "transactionId": "...",
  "reason": "VEHICLE_MISMATCH",
  "description": "السيارة بها أضرار لم تُذكر في الإعلان",
  "evidence": ["url1", "url2"]
}
Response: {
  "dispute": {
    "id": "...",
    "disputeCode": "XCHG-DSP-12345",
    "status": "OPEN"
  }
}
```

### GET /disputes/:id
Get dispute details
```json
Response: {
  "dispute": {
    "id": "...",
    "status": "UNDER_REVIEW",
    "transaction": {...},
    "evidence": [...],
    "resolution": null
  }
}
```

---

## ⭐ REVIEWS

### POST /reviews/create
Create review
```json
Body: {
  "targetUserId": "...",
  "transactionId": "...",
  "rating": 5,
  "communicationRating": 5,
  "accuracyRating": 4,
  "professionalismRating": 5,
  "title": "بائع ممتاز",
  "comment": "التعامل كان سلس جداً..."
}
Response: {
  "review": {
    "id": "..."
  }
}
```

### GET /reviews/user/:userId
Get user's reviews
```json
Query: ?page=1&limit=10
Response: {
  "reviews": [...],
  "averageRating": 4.7,
  "total": 15
}
```

---

## 💬 MESSAGING

### POST /messages/send
Send message
```json
Body: {
  "receiverId": "...",
  "listingId": "...",  // optional context
  "content": "هل السيارة متاحة؟",
  "attachments": []
}
Response: {
  "message": {
    "id": "...",
    "createdAt": "..."
  }
}
```

### GET /messages/conversations
Get all conversations
```json
Response: {
  "conversations": [
    {
      "user": {
        "id": "...",
        "firstName": "محمد"
      },
      "lastMessage": {
        "content": "...",
        "createdAt": "...",
        "isRead": false
      },
      "unreadCount": 2
    }
  ]
}
```

### GET /messages/conversation/:userId
Get conversation with user
```json
Query: ?listingId=...&page=1
Response: {
  "messages": [...],
  "total": 25
}
```

### PATCH /messages/:id/mark-read
Mark message as read
```json
Response: {
  "marked": true
}
```

---

## 🔔 NOTIFICATIONS

### GET /notifications
Get notifications
```json
Query: ?unreadOnly=true&page=1
Response: {
  "notifications": [
    {
      "id": "...",
      "type": "NEW_MESSAGE",
      "title": "رسالة جديدة",
      "message": "محمد أرسل لك رسالة",
      "actionUrl": "/messages/...",
      "isRead": false,
      "createdAt": "..."
    }
  ],
  "unreadCount": 5
}
```

### PATCH /notifications/:id/mark-read
Mark as read
```json
Response: {
  "marked": true
}
```

### PATCH /notifications/mark-all-read
Mark all as read
```json
Response: {
  "marked": true
}
```

---

## 📊 ANALYTICS & INSIGHTS

### GET /analytics/my-listings
Get my listings analytics
```json
Response: {
  "totalListings": 5,
  "activeListings": 3,
  "totalViews": 1250,
  "totalFavorites": 87,
  "averageViewsPerListing": 250,
  "topPerformingListing": {...}
}
```

### GET /analytics/market-insights
Get market insights (pricing data)
```json
Query: ?make=Toyota&model=Corolla&year=2021
Response: {
  "averagePrice": 485000,
  "priceRange": {
    "min": 420000,
    "max": 550000
  },
  "totalListings": 45,
  "averageDaysToSell": 28,
  "demandLevel": "HIGH",
  "priceHistory": [
    {
      "month": "2024-11",
      "averagePrice": 490000
    },
    ...
  ]
}
```

### GET /analytics/depreciation
Get depreciation estimate
```json
Query: ?make=Toyota&model=Corolla&purchaseYear=2021&purchasePrice=600000
Response: {
  "currentEstimatedValue": 480000,
  "totalDepreciation": 120000,
  "depreciationRate": 20,
  "yearlyDepreciation": [
    {
      "year": 2021,
      "value": 600000
    },
    {
      "year": 2022,
      "value": 540000
    },
    ...
  ]
}
```

---

## 🔖 FAVORITES & SAVED SEARCHES

### GET /favorites
Get favorite listings
```json
Response: {
  "favorites": [...]
}
```

### POST /saved-searches
Create saved search
```json
Body: {
  "name": "تويوتا كورولا حتى 500 ألف",
  "filters": {
    "make": "Toyota",
    "model": "Corolla",
    "priceMax": 500000
  },
  "notifyOnNewListings": true
}
Response: {
  "savedSearch": {
    "id": "..."
  }
}
```

### GET /saved-searches
Get saved searches
```json
Response: {
  "searches": [...]
}
```

---

## ⚙️ SYSTEM

### GET /config/payment-methods
Get available payment methods
```json
Response: {
  "methods": [
    {
      "id": "PAYMOB",
      "name": "بطاقة ائتمانية",
      "enabled": true,
      "fee": 2.75
    },
    {
      "id": "FAWRY",
      "name": "فوري",
      "enabled": true,
      "fee": 0
    }
  ]
}
```

### GET /config/financing-partners
Get financing partners
```json
Response: {
  "partners": [
    {
      "id": "CONTACT",
      "name": "كونتكت للتمويل",
      "minDownPayment": 10,
      "maxDuration": 60,
      "interestRates": {
        "36": 22,
        "48": 24,
        "60": 26
      }
    }
  ]
}
```

### GET /config/governorates
Get governorates and cities
```json
Response: {
  "governorates": [
    {
      "name": "Cairo",
      "nameAr": "القاهرة",
      "cities": ["Nasr City", "Heliopolis", ...]
    }
  ]
}
```

---

## 📈 ADMIN ENDPOINTS (Restricted)

### GET /admin/dashboard/stats
Get dashboard stats
```json
Response: {
  "totalUsers": 15420,
  "activeListings": 3250,
  "pendingInspections": 45,
  "monthlyRevenue": 850000,
  "transactionsToday": 12
}
```

### GET /admin/users
Get all users (with filters)
```json
Query: ?role=SELLER&verificationLevel=UNVERIFIED&page=1
Response: {
  "users": [...],
  "total": 245
}
```

### PATCH /admin/users/:id/verify
Verify user manually
```json
Body: {
  "verificationLevel": "ID_VERIFIED"
}
Response: {
  "verified": true
}
```

### PATCH /admin/listings/:id/approve
Approve listing
```json
Response: {
  "approved": true
}
```

### PATCH /admin/disputes/:id/resolve
Resolve dispute
```json
Body: {
  "resolution": "Refund issued to buyer",
  "refundAmount": 480000
}
Response: {
  "resolved": true
}
```

---

## 🔒 AUTHENTICATION HEADERS

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

## 📊 RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "رقم الهاتف أو كلمة المرور غير صحيحة",
    "details": {...}
  }
}
```

## 🔢 PAGINATION

Standard pagination for list endpoints:
```
Query: ?page=1&limit=20&sort=createdAt_desc
Response: {
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```
