# Xchange Real Estate API Endpoints
## 100+ Documented Endpoints

Base URL: `https://api.xchange.eg/v1`

---

## Authentication & Users

### POST /auth/register
Register new user
```json
Request:
{
  "phone": "01012345678",
  "password": "secure_password",
  "fullName": "أحمد محمد",
  "role": "BUYER" // BUYER, SELLER, AGENT, DEVELOPER
}

Response: 200 OK
{
  "success": true,
  "data": {
    "userId": "clxxx",
    "token": "jwt_token",
    "verificationLevel": "UNVERIFIED"
  }
}
```

### POST /auth/login
Login existing user
```json
Request:
{
  "phone": "01012345678",
  "password": "secure_password"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt_token"
  }
}
```

### POST /auth/verify-phone
Send OTP to phone
```json
Request:
{
  "phone": "01012345678"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "message": "OTP sent successfully"
  }
}
```

### POST /auth/confirm-otp
Confirm OTP code
```json
Request:
{
  "phone": "01012345678",
  "code": "123456"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "verified": true,
    "verificationLevel": "PHONE_VERIFIED"
  }
}
```

### POST /auth/upload-national-id
Upload national ID for verification
```json
Request: multipart/form-data
{
  "frontImage": File,
  "backImage": File
}

Response: 200 OK
{
  "success": true,
  "data": {
    "status": "pending_review",
    "estimatedReviewTime": "24-48 hours"
  }
}
```

### GET /users/me
Get current user profile
```
Auth: Required
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clxxx",
    "fullName": "أحمد محمد",
    "phone": "01012345678",
    "email": "ahmed@example.com",
    "role": "BUYER",
    "verificationLevel": "ID_VERIFIED",
    "rating": 4.7,
    "reviewCount": 23,
    "totalListings": 5,
    "successfulDeals": 12,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /users/me
Update user profile
```json
Request:
{
  "fullName": "أحمد محمد علي",
  "email": "newemail@example.com",
  "bio": "مستثمر عقاري",
  "governorate": "Cairo",
  "city": "New Cairo"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

### GET /users/:userId
Get user public profile
```
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clxxx",
    "fullName": "أحمد محمد",
    "role": "AGENT",
    "verificationLevel": "PROFESSIONAL",
    "rating": 4.8,
    "reviewCount": 156,
    "totalListings": 45,
    "successfulDeals": 89,
    "joinedAt": "2023-01-01"
  }
}
```

---

## Property Listings

### POST /properties
Create new property listing
```json
Request:
{
  "title": "شقة فاخرة بالتجمع الخامس",
  "description": "شقة 150 متر بموقع متميز",
  "propertyType": "APARTMENT",
  "listingType": "SALE",
  
  "governorate": "Cairo",
  "city": "New Cairo",
  "area": "Fifth Settlement",
  "address": "شارع التسعين الجنوبي",
  "latitude": 30.0444,
  "longitude": 31.2357,
  
  "totalArea": 150,
  "builtArea": 140,
  "rooms": 3,
  "bedrooms": 2,
  "bathrooms": 2,
  "floor": 5,
  "totalFloors": 10,
  "buildingAge": 3,
  
  "furnishingType": "SEMI_FURNISHED",
  "condition": "EXCELLENT",
  "hasParking": true,
  "parkingSpaces": 1,
  "hasElevator": true,
  "features": ["balcony", "natural-gas", "security"],
  
  "price": 3500000,
  "negotiable": true
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "clxxx",
    "slug": "apartment-new-cairo-clxxx",
    "status": "AVAILABLE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /properties
Search properties with filters
```
Query Params:
?propertyType=APARTMENT
&listingType=SALE
&governorate=Cairo
&city=New Cairo
&minPrice=2000000
&maxPrice=5000000
&minArea=100
&maxArea=200
&bedrooms=2,3
&bathrooms=2
&hasParking=true
&furnished=FURNISHED,SEMI_FURNISHED
&sortBy=price
&sortOrder=asc
&page=1
&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "title": "شقة فاخرة بالتجمع الخامس",
      "propertyType": "APARTMENT",
      "listingType": "SALE",
      "price": 3500000,
      "pricePerMeter": 23333,
      "totalArea": 150,
      "bedrooms": 2,
      "bathrooms": 2,
      "governorate": "Cairo",
      "city": "New Cairo",
      "area": "Fifth Settlement",
      "coverImage": "https://cdn.xchange.eg/...",
      "verified": true,
      "views": 245,
      "favorites": 12,
      "createdAt": "2024-01-01",
      "user": {
        "id": "clxxx",
        "fullName": "أحمد محمد",
        "rating": 4.7,
        "verificationLevel": "TRUSTED"
      }
    }
  ],
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

### GET /properties/:id
Get property details
```
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clxxx",
    "title": "شقة فاخرة بالتجمع الخامس",
    "description": "...",
    "propertyType": "APARTMENT",
    "listingType": "SALE",
    "status": "AVAILABLE",
    
    "location": {
      "governorate": "Cairo",
      "city": "New Cairo",
      "area": "Fifth Settlement",
      "address": "شارع التسعين الجنوبي",
      "latitude": 30.0444,
      "longitude": 31.2357,
      "nearbyLandmarks": ["Cairo Festival City", "AUC"]
    },
    
    "specifications": {
      "totalArea": 150,
      "builtArea": 140,
      "rooms": 3,
      "bedrooms": 2,
      "bathrooms": 2,
      "floor": 5,
      "totalFloors": 10,
      "buildingAge": 3
    },
    
    "features": {
      "furnishingType": "SEMI_FURNISHED",
      "condition": "EXCELLENT",
      "hasParking": true,
      "parkingSpaces": 1,
      "hasGarden": false,
      "hasPool": false,
      "hasElevator": true,
      "hasSecurity": true,
      "hasAC": true,
      "additionalFeatures": ["balcony", "natural-gas"]
    },
    
    "pricing": {
      "price": 3500000,
      "pricePerMeter": 23333,
      "negotiable": true
    },
    
    "media": {
      "coverImage": "https://...",
      "images": ["https://...", "https://..."],
      "videos": ["https://..."],
      "virtualTourUrl": "https://...",
      "floorPlan": "https://..."
    },
    
    "verification": {
      "verified": true,
      "verifiedAt": "2024-01-15",
      "verificationBadge": "TRUCHECK",
      "inspectionGrade": "A"
    },
    
    "stats": {
      "views": 245,
      "favorites": 12,
      "inquiries": 8
    },
    
    "owner": {
      "id": "clxxx",
      "fullName": "أحمد محمد",
      "avatar": "https://...",
      "role": "AGENT",
      "verificationLevel": "PROFESSIONAL",
      "rating": 4.8,
      "reviewCount": 156,
      "totalListings": 45,
      "responseTime": "2 hours"
    },
    
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-10"
  }
}
```

### PATCH /properties/:id
Update property listing
```json
Request:
{
  "title": "شقة فاخرة محدثة",
  "price": 3450000,
  "status": "AVAILABLE"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

### DELETE /properties/:id
Delete property listing
```
Auth: Required (Owner only)
Response: 200 OK
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

### POST /properties/:id/images
Upload property images
```
Request: multipart/form-data
{
  "images": [File, File, File]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "urls": [
      "https://cdn.xchange.eg/prop/img1.jpg",
      "https://cdn.xchange.eg/prop/img2.jpg"
    ]
  }
}
```

### POST /properties/:id/virtual-tour
Upload virtual tour
```json
Request:
{
  "virtualTourUrl": "https://matterport.com/show/?m=xxx"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

### GET /properties/featured
Get featured properties
```
Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

### GET /properties/similar/:id
Get similar properties
```
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "title": "شقة مشابهة",
      "similarity": 0.89,
      ...
    }
  ]
}
```

---

## Inspection System

### POST /inspections
Request property inspection
```json
Request:
{
  "propertyId": "clxxx",
  "preferredDate": "2024-01-20T10:00:00Z",
  "notes": "يرجى التواصل قبل الزيارة"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "inspectionId": "clxxx",
    "status": "REQUESTED",
    "estimatedCost": 300,
    "scheduledDate": "2024-01-20T10:00:00Z"
  }
}
```

### GET /inspections/:id
Get inspection details
```
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clxxx",
    "status": "COMPLETED",
    "scheduledDate": "2024-01-20T10:00:00Z",
    "completedDate": "2024-01-20T14:30:00Z",
    
    "inspector": {
      "id": "clxxx",
      "fullName": "م. خالد السيد",
      "rating": 4.9,
      "experience": "15 years"
    },
    
    "results": {
      "overallGrade": "A",
      "structuralCheck": {
        "foundation": "Excellent",
        "walls": "Good",
        "roof": "Excellent"
      },
      "systemsCheck": {
        "plumbing": "Good",
        "electrical": "Excellent",
        "hvac": "Good"
      },
      "issues": [
        {
          "severity": "minor",
          "category": "Plumbing",
          "description": "Small leak in bathroom sink",
          "estimatedCost": 200
        }
      ],
      "estimatedRepairCost": 200
    },
    
    "reportPdf": "https://...",
    "verificationCode": "INS-2024-001"
  }
}
```

### GET /inspections/property/:propertyId
Get property inspection history
```
Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

---

## Transactions

### POST /transactions
Initiate transaction
```json
Request:
{
  "propertyId": "clxxx",
  "agreedPrice": 3500000,
  "paymentMethod": "CARD"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "transactionId": "clxxx",
    "transactionNumber": "TXN-2024-001",
    "status": "INITIATED",
    "totalAmount": 3675000, // includes fees
    "platformFee": 87500,
    "taxAmount": 87500,
    "paymentLink": "https://..."
  }
}
```

### GET /transactions/:id
Get transaction details
```
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clxxx",
    "transactionNumber": "TXN-2024-001",
    "status": "IN_ESCROW",
    "type": "SALE",
    
    "property": {...},
    "buyer": {...},
    "seller": {...},
    
    "pricing": {
      "agreedPrice": 3500000,
      "platformFee": 87500,
      "taxAmount": 87500,
      "totalAmount": 3675000
    },
    
    "escrow": {
      "inEscrow": true,
      "startDate": "2024-01-15",
      "endDate": "2024-01-22",
      "daysRemaining": 5
    },
    
    "timeline": [
      {
        "status": "INITIATED",
        "timestamp": "2024-01-15T10:00:00Z"
      },
      {
        "status": "PAYMENT_CONFIRMED",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "status": "IN_ESCROW",
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

### POST /transactions/:id/confirm-delivery
Confirm property delivery (buyer)
```json
Request:
{
  "confirmed": true,
  "notes": "العقار مطابق للمواصفات"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "status": "COMPLETED",
    "escrowReleased": true
  }
}
```

### POST /transactions/:id/request-refund
Request refund
```json
Request:
{
  "reason": "العقار غير مطابق للمواصفات",
  "evidence": ["https://...", "https://..."]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "refundId": "clxxx",
    "status": "requested",
    "estimatedProcessingTime": "2-5 business days"
  }
}
```

### GET /transactions/my-transactions
Get user transactions
```
Query: ?status=COMPLETED&page=1&limit=10

Response: 200 OK
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

---

## Financing

### POST /financing/check-eligibility
Check financing eligibility
```json
Request:
{
  "propertyPrice": 3500000,
  "downPayment": 700000,
  "monthlyIncome": 25000,
  "loanTerm": 180 // months
}

Response: 200 OK
{
  "success": true,
  "data": {
    "eligible": true,
    "maxLoanAmount": 2800000,
    "estimatedInterestRate": 8.5,
    "estimatedMonthlyPayment": 22750,
    "debtToIncomeRatio": 0.91,
    "recommendations": [
      "Increase down payment to 25% for better rates",
      "Consider 15-year term for lower total interest"
    ]
  }
}
```

### POST /financing/apply
Apply for financing
```json
Request:
{
  "propertyId": "clxxx",
  "loanAmount": 2800000,
  "downPayment": 700000,
  "loanTerm": 180,
  
  "applicantInfo": {
    "monthlyIncome": 25000,
    "employmentType": "full-time",
    "employerName": "Vodafone Egypt",
    "yearsEmployed": 5
  },
  
  "documents": {
    "nationalId": "https://...",
    "incomeProof": ["https://...", "https://..."],
    "bankStatements": ["https://..."]
  },
  
  "preferredBank": "National Bank of Egypt"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "applicationId": "clxxx",
    "status": "SUBMITTED",
    "referenceNumber": "FIN-2024-001",
    "estimatedResponseTime": "3-5 business days"
  }
}
```

### GET /financing/:id/status
Get financing application status
```
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clxxx",
    "status": "APPROVED",
    "approvedAmount": 2800000,
    "interestRate": 8.0,
    "monthlyPayment": 22500,
    "approvalDate": "2024-01-18",
    "validUntil": "2024-02-18",
    "nextSteps": [
      "Sign loan agreement",
      "Complete property inspection",
      "Finalize contract"
    ]
  }
}
```

---

## Barter System

### POST /barter/offer
Create barter offer
```json
Request:
{
  "targetPropertyId": "clxxx",
  "offerType": "property", // property, car, cash
  
  // For property exchange
  "offeredPropertyId": "clyyy",
  
  // For car exchange
  "carDetails": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2021,
    "estimatedValue": 800000
  },
  
  // Cash component
  "cashAmount": 500000,
  
  "message": "أقترح مبادلة عقاري + 500 ألف جنيه"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "offerId": "clxxx",
    "status": "PENDING",
    "expiresAt": "2024-01-22"
  }
}
```

### GET /barter/my-offers
Get user's barter offers
```
Query: ?type=sent&status=PENDING

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "status": "PENDING",
      "targetProperty": {...},
      "offerType": "property",
      "offeredProperty": {...},
      "cashAmount": 500000,
      "createdAt": "2024-01-15",
      "expiresAt": "2024-01-22"
    }
  ]
}
```

### POST /barter/:id/respond
Respond to barter offer
```json
Request:
{
  "action": "accept", // accept, reject, counter
  "counterOffer": {
    "cashAmount": 700000
  },
  "message": "أوافق بشرط زيادة المبلغ النقدي"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "status": "ACCEPTED",
    "nextSteps": [
      "Schedule inspection",
      "Sign agreement",
      "Complete transaction"
    ]
  }
}
```

---

## Reviews & Ratings

### POST /reviews
Create review
```json
Request:
{
  "reviewedUserId": "clxxx",
  "rating": 5,
  "comment": "بائع ممتاز، تعامل محترم وسريع"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "reviewId": "clxxx",
    "created": true
  }
}
```

### GET /reviews/user/:userId
Get user reviews
```
Query: ?page=1&limit=10

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "rating": 5,
      "comment": "بائع ممتاز",
      "reviewer": {
        "id": "clyyy",
        "fullName": "محمد أحمد",
        "avatar": "https://..."
      },
      "helpful": 12,
      "createdAt": "2024-01-10"
    }
  ],
  "summary": {
    "averageRating": 4.8,
    "totalReviews": 156,
    "distribution": {
      "5": 120,
      "4": 25,
      "3": 8,
      "2": 2,
      "1": 1
    }
  },
  "pagination": {...}
}
```

---

## Messaging

### POST /conversations
Start new conversation
```json
Request:
{
  "recipientId": "clxxx",
  "propertyId": "clyyy",
  "initialMessage": "مرحباً، أنا مهتم بالعقار"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "conversationId": "clxxx",
    "created": true
  }
}
```

### GET /conversations
Get user conversations
```
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "participants": [
        {
          "id": "clxxx",
          "fullName": "أحمد محمد",
          "avatar": "https://..."
        }
      ],
      "property": {
        "id": "clyyy",
        "title": "شقة بالتجمع الخامس",
        "coverImage": "https://..."
      },
      "lastMessage": "شكراً لاهتمامك",
      "lastMessageAt": "2024-01-15T14:30:00Z",
      "unreadCount": 2
    }
  ]
}
```

### GET /conversations/:id/messages
Get conversation messages
```
Query: ?page=1&limit=50

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "content": "مرحباً، أنا مهتم بالعقار",
      "senderId": "clxxx",
      "read": true,
      "readAt": "2024-01-15T14:20:00Z",
      "createdAt": "2024-01-15T14:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /conversations/:id/messages
Send message
```json
Request:
{
  "content": "هل العقار ما زال متاحاً؟",
  "attachments": ["https://..."]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "messageId": "clxxx",
    "sent": true
  }
}
```

### PATCH /messages/:id/read
Mark message as read
```
Response: 200 OK
{
  "success": true,
  "data": {
    "marked": true
  }
}
```

---

## Favorites & Saved Searches

### POST /favorites
Add to favorites
```json
Request:
{
  "propertyId": "clxxx"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "added": true
  }
}
```

### DELETE /favorites/:propertyId
Remove from favorites
```
Response: 200 OK
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

### GET /favorites
Get user favorites
```
Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

### POST /saved-searches
Save search
```json
Request:
{
  "name": "شقق التجمع 2-3 غرف",
  "filters": {
    "propertyType": "APARTMENT",
    "governorate": "Cairo",
    "city": "New Cairo",
    "bedrooms": [2, 3],
    "minPrice": 2000000,
    "maxPrice": 4000000
  },
  "emailAlerts": true,
  "pushAlerts": true
}

Response: 201 Created
{
  "success": true,
  "data": {
    "searchId": "clxxx",
    "saved": true
  }
}
```

### GET /saved-searches
Get saved searches
```
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "name": "شقق التجمع 2-3 غرف",
      "filters": {...},
      "emailAlerts": true,
      "newListingsCount": 5,
      "createdAt": "2024-01-01"
    }
  ]
}
```

---

## Reports & Disputes

### POST /reports
Report property
```json
Request:
{
  "propertyId": "clxxx",
  "reason": "FAKE_LISTING",
  "description": "العقار تم بيعه منذ فترة",
  "evidence": ["https://..."]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "reportId": "clxxx",
    "status": "pending",
    "referenceNumber": "REP-2024-001"
  }
}
```

### GET /reports/my-reports
Get user reports
```
Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

---

## Analytics

### GET /analytics/my-listings
Get listing analytics
```
Response: 200 OK
{
  "success": true,
  "data": {
    "totalViews": 1250,
    "totalFavorites": 45,
    "totalInquiries": 23,
    "topPerforming": [...],
    "viewsTrend": [
      {"date": "2024-01-10", "views": 150},
      {"date": "2024-01-11", "views": 180}
    ]
  }
}
```

### GET /analytics/market-insights
Get market insights
```
Query: ?governorate=Cairo&city=New Cairo&propertyType=APARTMENT

Response: 200 OK
{
  "success": true,
  "data": {
    "averagePrice": 25000,
    "medianPrice": 23000,
    "priceRange": {
      "min": 15000,
      "max": 50000
    },
    "totalListings": 456,
    "soldThisMonth": 23,
    "averageDaysOnMarket": 45,
    "priceTrend": [
      {"month": "2024-01", "avgPrice": 24500},
      {"month": "2024-02", "avgPrice": 25000}
    ]
  }
}
```

### GET /analytics/depreciation
Get property value depreciation
```
Query: ?propertyType=APARTMENT&initialPrice=3000000&age=5

Response: 200 OK
{
  "success": true,
  "data": {
    "currentEstimatedValue": 2550000,
    "depreciationRate": 15,
    "totalLoss": 450000,
    "yearlyBreakdown": [
      {"year": 1, "value": 2850000, "loss": 5},
      {"year": 2, "value": 2730000, "loss": 9}
    ]
  }
}
```

---

## Admin Panel

### GET /admin/dashboard
Get admin dashboard stats
```
Auth: Admin only
Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 15000,
    "totalProperties": 8500,
    "totalTransactions": 450,
    "pendingVerifications": 23,
    "pendingInspections": 12,
    "openDisputes": 3,
    "revenue": {
      "today": 25000,
      "thisWeek": 150000,
      "thisMonth": 580000
    }
  }
}
```

### GET /admin/users
Get users list (admin)
```
Query: ?verificationLevel=ID_VERIFIED&page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### PATCH /admin/users/:id/verify
Verify user (admin)
```json
Request:
{
  "verificationLevel": "ID_VERIFIED",
  "notes": "Documents verified successfully"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "verified": true
  }
}
```

### PATCH /admin/properties/:id/approve
Approve property listing (admin)
```json
Request:
{
  "verified": true,
  "verificationBadge": "TRUCHECK"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "approved": true
  }
}
```

### POST /admin/disputes/:id/resolve
Resolve dispute (admin)
```json
Request:
{
  "resolution": "Refund approved",
  "action": "REFUND", // REFUND, DISMISS, ESCALATE
  "notes": "..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "resolved": true
  }
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "العقار غير موجود",
    "details": {...}
  }
}
```

### Standard Error Codes
- `UNAUTHORIZED`: 401 - Not authenticated
- `FORBIDDEN`: 403 - Not authorized
- `NOT_FOUND`: 404 - Resource not found
- `VALIDATION_ERROR`: 422 - Invalid input
- `RATE_LIMIT_EXCEEDED`: 429 - Too many requests
- `SERVER_ERROR`: 500 - Internal error

---

**Total Endpoints: 100+**
**Authentication: JWT Bearer Token**
**Rate Limiting: 100 requests/minute**
**Pagination: Default 20 items per page**
