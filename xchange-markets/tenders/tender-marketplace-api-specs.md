# XCHANGE TENDER MARKETPLACE - API SPECIFICATIONS
# مواصفات واجهة برمجة التطبيقات لسوق المناقصات

## Base URL
```
Production: https://api.xchange.eg/v1/tenders
Development: http://localhost:3000/api/v1/tenders
```

## Authentication
All authenticated endpoints require JWT token:
```
Authorization: Bearer <token>
```

## Language Header
```
Accept-Language: ar | en
```

---

# 🎯 TENDER MANAGEMENT (إدارة المناقصات)

## POST /tenders
Create new tender

**Auth:** Required
**Permission:** Any registered user

**Body:**
```json
{
  "title": "مناقصة توريد أجهزة حاسب آلي",
  "titleAr": "مناقصة توريد أجهزة حاسب آلي",
  "description": "توريد 500 جهاز حاسب آلي للوزارة...",
  "descriptionAr": "توريد 500 جهاز حاسب آلي للوزارة...",

  "tenderType": "OPEN",
  "category": "IT_HARDWARE",
  "subcategory": "computers",
  "businessType": "G2B",

  "budgetType": "RANGE",
  "budgetMin": 2000000,
  "budgetMax": 2500000,
  "currency": "EGP",
  "showBudget": true,

  "submissionDeadline": "2025-02-15T23:59:59Z",
  "questionDeadline": "2025-02-01T23:59:59Z",
  "awardDate": "2025-02-28T00:00:00Z",
  "projectStartDate": "2025-03-15T00:00:00Z",
  "projectEndDate": "2025-04-15T00:00:00Z",

  "governorate": "القاهرة",
  "city": "مدينة نصر",
  "isRemote": false,

  "requirements": "- خبرة لا تقل عن 5 سنوات\n- سابقة أعمال مماثلة",
  "qualifications": ["ISO 9001", "Commercial Register"],
  "experience": "5 years minimum",

  "visibility": "PUBLIC",
  "isNegotiable": false,
  "allowPartialBids": false,
  "requireDeposit": true,
  "depositPercentage": 5,

  "evaluationMethod": "BEST_VALUE",
  "evaluationCriteria": [
    { "name": "السعر", "weight": 40, "maxScore": 100 },
    { "name": "الجودة الفنية", "weight": 30, "maxScore": 100 },
    { "name": "سابقة الأعمال", "weight": 20, "maxScore": 100 },
    { "name": "فترة الضمان", "weight": 10, "maxScore": 100 }
  ],

  "hasReverseAuction": false
}
```

**Response:**
```json
{
  "id": "tender_abc123",
  "referenceNumber": "TND-2025-001234",
  "status": "DRAFT",
  "createdAt": "2025-01-15T10:00:00Z",
  "message": "تم إنشاء المناقصة بنجاح. يمكنك الآن إضافة المستندات ونشرها."
}
```

---

## GET /tenders
Browse/search tenders

**Auth:** Optional (more results for authenticated users)

**Query Params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20, max: 100) |
| `search` | string | Search in title & description |
| `category` | TenderCategory | Filter by category |
| `categories` | string[] | Multiple categories |
| `businessType` | BusinessType | G2B, B2B, C2C, etc. |
| `tenderType` | TenderType | OPEN, RFQ, RFP, etc. |
| `status` | TenderStatus | ACTIVE, EVALUATION, etc. |
| `governorate` | string | Filter by governorate |
| `city` | string | Filter by city |
| `budgetMin` | float | Minimum budget |
| `budgetMax` | float | Maximum budget |
| `deadlineFrom` | date | Deadline from date |
| `deadlineTo` | date | Deadline to date |
| `hasReverseAuction` | boolean | Has reverse auction |
| `featured` | boolean | Featured tenders only |
| `isRemote` | boolean | Remote work allowed |
| `sortBy` | string | deadline, budget, createdAt, bids |
| `sortOrder` | string | asc, desc |

**Response:**
```json
{
  "tenders": [
    {
      "id": "tender_abc123",
      "referenceNumber": "TND-2025-001234",
      "title": "مناقصة توريد أجهزة حاسب آلي",
      "tenderType": "OPEN",
      "category": "IT_HARDWARE",
      "businessType": "G2B",

      "budgetType": "RANGE",
      "budgetMin": 2000000,
      "budgetMax": 2500000,
      "currency": "EGP",

      "submissionDeadline": "2025-02-15T23:59:59Z",
      "timeRemaining": "30 يوم و 5 ساعات",

      "governorate": "القاهرة",
      "city": "مدينة نصر",

      "status": "ACTIVE",
      "bidCount": 12,
      "viewCount": 234,
      "watchlistCount": 45,

      "owner": {
        "id": "user_xyz",
        "fullName": "وزارة الاتصالات",
        "userType": "GOVERNMENT",
        "trustLevel": "ELITE",
        "avatar": "url"
      },

      "hasReverseAuction": false,
      "isFeatured": true,

      "createdAt": "2025-01-15T10:00:00Z",
      "publishedAt": "2025-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "filters": {
    "categories": {
      "IT_HARDWARE": 45,
      "CONSTRUCTION": 34,
      "CONSULTING": 23
    },
    "businessTypes": {
      "G2B": 56,
      "B2B": 78,
      "C2C": 22
    },
    "governorates": {
      "القاهرة": 89,
      "الجيزة": 34,
      "الإسكندرية": 23
    }
  },
  "stats": {
    "totalActive": 156,
    "closingToday": 5,
    "closingThisWeek": 23,
    "newToday": 12
  }
}
```

---

## GET /tenders/:id
Get tender details

**Auth:** Optional

**Response:**
```json
{
  "id": "tender_abc123",
  "referenceNumber": "TND-2025-001234",

  "title": "مناقصة توريد أجهزة حاسب آلي",
  "titleAr": "مناقصة توريد أجهزة حاسب آلي",
  "description": "توريد 500 جهاز حاسب آلي للوزارة...",
  "descriptionAr": "توريد 500 جهاز حاسب آلي للوزارة...",

  "tenderType": "OPEN",
  "category": "IT_HARDWARE",
  "subcategory": "computers",
  "businessType": "G2B",

  "budgetType": "RANGE",
  "budgetMin": 2000000,
  "budgetMax": 2500000,
  "currency": "EGP",
  "showBudget": true,

  "timeline": {
    "publishDate": "2025-01-15T12:00:00Z",
    "submissionDeadline": "2025-02-15T23:59:59Z",
    "questionDeadline": "2025-02-01T23:59:59Z",
    "awardDate": "2025-02-28T00:00:00Z",
    "projectStartDate": "2025-03-15T00:00:00Z",
    "projectEndDate": "2025-04-15T00:00:00Z",
    "projectDuration": "شهر واحد"
  },

  "timeRemaining": {
    "days": 30,
    "hours": 5,
    "minutes": 23,
    "formatted": "30 يوم و 5 ساعات"
  },

  "location": {
    "governorate": "القاهرة",
    "city": "مدينة نصر",
    "district": "الحي الثامن",
    "fullAddress": "شارع مصطفى النحاس",
    "isRemote": false
  },

  "requirements": "- خبرة لا تقل عن 5 سنوات\n- سابقة أعمال مماثلة",
  "qualifications": ["ISO 9001", "Commercial Register"],
  "experience": "5 years minimum",
  "termsAndConditions": "...",

  "documents": [
    {
      "id": "doc_1",
      "name": "كراسة الشروط",
      "type": "SPECIFICATIONS",
      "url": "https://...",
      "size": 2456789,
      "downloadCount": 45
    },
    {
      "id": "doc_2",
      "name": "جدول الكميات",
      "type": "BOQ",
      "url": "https://...",
      "size": 123456
    }
  ],

  "evaluationMethod": "BEST_VALUE",
  "evaluationCriteria": [
    { "name": "السعر", "weight": 40, "maxScore": 100 },
    { "name": "الجودة الفنية", "weight": 30, "maxScore": 100 },
    { "name": "سابقة الأعمال", "weight": 20, "maxScore": 100 },
    { "name": "فترة الضمان", "weight": 10, "maxScore": 100 }
  ],

  "settings": {
    "visibility": "PUBLIC",
    "isNegotiable": false,
    "allowPartialBids": false,
    "requireDeposit": true,
    "depositAmount": null,
    "depositPercentage": 5
  },

  "status": "ACTIVE",

  "owner": {
    "id": "user_xyz",
    "fullName": "وزارة الاتصالات وتكنولوجيا المعلومات",
    "userType": "GOVERNMENT",
    "trustLevel": "ELITE",
    "avatar": "url",
    "verified": true,
    "responseTime": "2 ساعات",
    "totalTenders": 45
  },

  "statistics": {
    "viewCount": 234,
    "bidCount": 12,
    "watchlistCount": 45,
    "questionCount": 8
  },

  "hasReverseAuction": true,
  "reverseAuction": {
    "id": "auction_xyz",
    "startTime": "2025-02-16T10:00:00Z",
    "endTime": "2025-02-16T14:00:00Z",
    "status": "SCHEDULED",
    "startingPrice": 2500000,
    "minimumDecrement": 10000,
    "requireDeposit": true,
    "depositPercentage": 5
  },

  "isFeatured": true,

  "myBid": {
    "id": "bid_abc",
    "status": "SUBMITTED",
    "totalPrice": 2100000,
    "submittedAt": "2025-01-20T10:00:00Z"
  },

  "isWatching": true,

  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-16T08:00:00Z",
  "publishedAt": "2025-01-15T12:00:00Z"
}
```

---

## PUT /tenders/:id
Update tender

**Auth:** Required (owner only)
**Note:** Cannot update if bids already submitted

**Body:** Partial update allowed

---

## POST /tenders/:id/publish
Publish tender

**Auth:** Required (owner only)

**Response:**
```json
{
  "id": "tender_abc123",
  "status": "PENDING_APPROVAL",
  "message": "تم إرسال المناقصة للمراجعة. سيتم النشر خلال 24 ساعة."
}
```

---

## DELETE /tenders/:id
Cancel/delete tender

**Auth:** Required (owner only)
**Note:** Can only cancel if no bids OR with valid reason

**Body:**
```json
{
  "reason": "تغيير في المتطلبات"
}
```

---

## POST /tenders/:id/documents
Upload tender document

**Auth:** Required (owner only)

**Body (multipart/form-data):**
```
file: <binary>
name: كراسة الشروط
type: SPECIFICATIONS
isPublic: true
```

---

# 💰 BID MANAGEMENT (إدارة العروض)

## POST /tenders/:id/bids
Submit bid on tender

**Auth:** Required
**Permission:** Verified vendors

**Body:**
```json
{
  "totalPrice": 2100000,
  "currency": "EGP",
  "priceBreakdown": {
    "items": [
      { "description": "أجهزة حاسب آلي", "quantity": 500, "unitPrice": 3800, "total": 1900000 },
      { "description": "التوصيل والتركيب", "quantity": 1, "unitPrice": 100000, "total": 100000 },
      { "description": "التدريب", "quantity": 1, "unitPrice": 100000, "total": 100000 }
    ],
    "subtotal": 2100000,
    "vat": 0,
    "total": 2100000
  },

  "proposedStartDate": "2025-03-15T00:00:00Z",
  "proposedEndDate": "2025-04-10T00:00:00Z",
  "proposedDuration": "25 يوم",
  "deliveryTime": "25 يوم عمل",

  "warrantyPeriod": "سنتان",
  "supportTerms": "دعم فني مجاني لمدة سنة",

  "technicalProposal": "نقدم أجهزة Dell OptiPlex 7090...",
  "methodology": "سيتم التوريد على مراحل...",
  "teamDescription": "فريق من 10 مهندسين متخصصين...",

  "asDraft": false
}
```

**Response:**
```json
{
  "id": "bid_xyz789",
  "referenceNumber": "BID-2025-001234",
  "status": "SUBMITTED",
  "totalPrice": 2100000,
  "rank": 3,
  "submittedAt": "2025-01-20T10:00:00Z",
  "message": "تم تقديم عرضك بنجاح",
  "nextSteps": [
    "سيتم إعلامك عند بدء مرحلة التقييم",
    "يمكنك تعديل عرضك حتى موعد الإغلاق"
  ]
}
```

---

## GET /tenders/:id/bids
Get bids for tender (owner only) OR my bid

**Auth:** Required

**Query:**
- For owner: Returns all bids
- For bidders: Returns only their bid

**Response (for owner):**
```json
{
  "bids": [
    {
      "id": "bid_1",
      "referenceNumber": "BID-2025-001234",
      "vendor": {
        "id": "vendor_abc",
        "companyName": "شركة التقنية المتقدمة",
        "trustScore": 92,
        "averageRating": 4.8,
        "completedProjects": 45,
        "verified": true
      },
      "totalPrice": 2100000,
      "proposedDuration": "25 يوم",
      "warrantyPeriod": "سنتان",
      "status": "SUBMITTED",
      "rank": 1,
      "submittedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "statistics": {
    "totalBids": 12,
    "lowestPrice": 1950000,
    "highestPrice": 2400000,
    "averagePrice": 2150000
  }
}
```

---

## PUT /tenders/:id/bids/:bidId
Update bid

**Auth:** Required (bidder only)
**Note:** Only before deadline

---

## POST /tenders/:id/bids/:bidId/withdraw
Withdraw bid

**Auth:** Required (bidder only)

**Body:**
```json
{
  "reason": "تغيير في ظروف الشركة"
}
```

---

## POST /tenders/:id/bids/:bidId/evaluate
Evaluate bid (owner only)

**Auth:** Required (owner only)

**Body:**
```json
{
  "technicalScore": 85,
  "financialScore": 90,
  "criteriaScores": [
    { "criteriaId": "crit_1", "score": 90 },
    { "criteriaId": "crit_2", "score": 85 },
    { "criteriaId": "crit_3", "score": 80 },
    { "criteriaId": "crit_4", "score": 95 }
  ],
  "notes": "عرض فني ممتاز مع سعر تنافسي"
}
```

---

## POST /tenders/:id/award
Award tender to winning bid

**Auth:** Required (owner only)

**Body:**
```json
{
  "winningBidId": "bid_xyz789",
  "awardNotes": "تم اختيار العرض بناءً على أعلى مجموع نقاط"
}
```

**Response:**
```json
{
  "tenderId": "tender_abc123",
  "winningBidId": "bid_xyz789",
  "status": "AWARDED",
  "contract": {
    "id": "contract_new123",
    "status": "PENDING_SIGNATURES"
  },
  "message": "تم ترسية المناقصة بنجاح. تم إنشاء مسودة العقد."
}
```

---

# 🔄 REVERSE AUCTION (المزاد العكسي)

## POST /tenders/:id/reverse-auction
Create reverse auction for tender

**Auth:** Required (owner only)

**Body:**
```json
{
  "startTime": "2025-02-16T10:00:00Z",
  "endTime": "2025-02-16T14:00:00Z",
  "startingPrice": 2500000,
  "reservePrice": 1800000,
  "minimumDecrement": 10000,
  "extendOnBid": true,
  "extensionMinutes": 3,
  "maxExtensions": 10,
  "requireDeposit": true,
  "depositPercentage": 5
}
```

---

## GET /tenders/:id/reverse-auction
Get reverse auction details

**Response:**
```json
{
  "id": "auction_xyz",
  "tenderId": "tender_abc123",

  "startTime": "2025-02-16T10:00:00Z",
  "endTime": "2025-02-16T14:00:00Z",
  "timeRemaining": {
    "hours": 2,
    "minutes": 30,
    "seconds": 15,
    "formatted": "2:30:15"
  },

  "startingPrice": 2500000,
  "currentPrice": 2150000,
  "reservePrice": null,
  "reserveMet": true,
  "minimumDecrement": 10000,
  "nextMinimumBid": 2140000,

  "status": "ACTIVE",
  "totalBids": 45,
  "uniqueBidders": 8,
  "priceDropPercentage": 14,

  "currentWinner": {
    "id": "vendor_abc",
    "companyName": "شركة ***",
    "bidAmount": 2150000
  },

  "leaderboard": [
    { "rank": 1, "vendorName": "شركة ***", "amount": 2150000, "time": "14:25:30" },
    { "rank": 2, "vendorName": "مؤسسة ***", "amount": 2160000, "time": "14:23:15" },
    { "rank": 3, "vendorName": "شركة ***", "amount": 2170000, "time": "14:20:00" }
  ],

  "bidHistory": [
    { "vendorName": "شركة ***", "amount": 2150000, "timestamp": "2025-02-16T14:25:30Z" },
    { "vendorName": "مؤسسة ***", "amount": 2160000, "timestamp": "2025-02-16T14:23:15Z" }
  ],

  "myParticipation": {
    "hasDeposit": true,
    "depositAmount": 125000,
    "myLowestBid": 2200000,
    "currentRank": 5,
    "totalBids": 3
  },

  "rules": {
    "extendOnBid": true,
    "extensionMinutes": 3,
    "maxExtensions": 10,
    "currentExtensions": 2,
    "extensionsRemaining": 8
  }
}
```

---

## POST /tenders/:id/reverse-auction/deposit
Pay auction deposit

**Auth:** Required

**Body:**
```json
{
  "paymentMethod": "CARD"
}
```

**Response:**
```json
{
  "depositId": "deposit_abc",
  "amount": 125000,
  "paymentUrl": "https://payment.paymob.com/...",
  "refundPolicy": "سيتم استرداد الوديعة خلال 3-5 أيام عمل إذا لم تفز بالمزاد"
}
```

---

## POST /tenders/:id/reverse-auction/bid
Place bid in reverse auction

**Auth:** Required
**Note:** Must have paid deposit

**Body:**
```json
{
  "amount": 2140000
}
```

**Response:**
```json
{
  "bidId": "abid_xyz",
  "amount": 2140000,
  "status": "WINNING",
  "rank": 1,
  "nextMinimumBid": 2130000,
  "auctionExtended": true,
  "newEndTime": "2025-02-16T14:28:30Z",
  "message": "تهانينا! أنت الآن في المركز الأول"
}
```

---

## WebSocket: /ws/reverse-auction/:id
Real-time auction updates

**Connection:**
```javascript
const socket = io('wss://api.xchange.eg/ws/reverse-auction/auction_xyz', {
  auth: { token: 'Bearer ...' }
});
```

**Events (Server → Client):**

**new_bid**
```json
{
  "auctionId": "auction_xyz",
  "newPrice": 2140000,
  "bidderName": "شركة ***",
  "rank": 1,
  "totalBids": 46,
  "nextMinimumBid": 2130000,
  "timestamp": "2025-02-16T14:25:30Z"
}
```

**auction_extended**
```json
{
  "auctionId": "auction_xyz",
  "newEndTime": "2025-02-16T14:28:30Z",
  "extensionCount": 3,
  "extensionsRemaining": 7
}
```

**you_are_outbid**
```json
{
  "auctionId": "auction_xyz",
  "yourBid": 2150000,
  "currentBid": 2140000,
  "yourRank": 2
}
```

**auction_ending_soon**
```json
{
  "auctionId": "auction_xyz",
  "secondsRemaining": 30
}
```

**auction_ended**
```json
{
  "auctionId": "auction_xyz",
  "finalPrice": 2100000,
  "winnerId": "vendor_abc",
  "winnerName": "شركة التقنية المتقدمة",
  "totalBids": 67,
  "priceDropPercentage": 16
}
```

---

# 🛠️ SERVICE REQUESTS (طلبات الخدمات - C2C/C2B)

## POST /service-requests
Create service request

**Auth:** Required

**Body:**
```json
{
  "title": "تجديد شقة 150 متر",
  "titleAr": "تجديد شقة 150 متر",
  "description": "أحتاج تجديد شقة كاملة شامل السباكة والكهرباء والدهانات...",
  "descriptionAr": "أحتاج تجديد شقة كاملة شامل السباكة والكهرباء والدهانات...",

  "category": "HOME_SERVICES",
  "subcategory": "renovation",

  "budgetType": "RANGE",
  "budgetMin": 50000,
  "budgetMax": 80000,

  "governorate": "القاهرة",
  "city": "مدينة نصر",
  "district": "الحي السابع",

  "urgency": "NORMAL",
  "preferredDate": "2025-02-01T00:00:00Z",
  "preferredTimeSlot": "morning",
  "flexibleDate": true,

  "requirements": "- خبرة في التشطيبات\n- ضمان سنة",
  "photos": ["url1", "url2"],

  "autoMatch": true,
  "maxQuotes": 5
}
```

**Response:**
```json
{
  "id": "sr_abc123",
  "referenceNumber": "SR-2025-001234",
  "status": "OPEN",
  "matchedProviders": 12,
  "message": "تم نشر طلبك بنجاح. سيتم إرساله لمقدمي الخدمات المناسبين."
}
```

---

## GET /service-requests
Browse service requests (for providers)

**Auth:** Required (verified providers)

**Query Params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | TenderCategory | Filter by category |
| `governorate` | string | Filter by governorate |
| `city` | string | Filter by city |
| `urgency` | ServiceUrgency | Filter by urgency |
| `budgetMin` | float | Minimum budget |
| `budgetMax` | float | Maximum budget |

---

## GET /service-requests/:id
Get service request details

---

## POST /service-requests/:id/quotes
Submit quote

**Auth:** Required (service provider)

**Body:**
```json
{
  "price": 65000,
  "priceType": "FIXED",
  "priceBreakdown": "سباكة: 15000\nكهرباء: 12000\nدهانات: 20000\nتشطيبات: 18000",
  "description": "نقدم خدمة تجديد متكاملة بخامات عالية الجودة...",
  "estimatedDuration": "3 أسابيع",
  "availableDate": "2025-02-01T00:00:00Z",
  "availableTimeSlot": "morning",
  "message": "مرحباً، لدينا فريق متخصص وخبرة 10 سنوات..."
}
```

---

## GET /service-requests/:id/quotes
Get quotes for my request

**Auth:** Required (request owner)

**Response:**
```json
{
  "quotes": [
    {
      "id": "quote_1",
      "provider": {
        "id": "user_abc",
        "fullName": "أحمد محمد",
        "vendorProfile": {
          "companyName": "شركة الإتقان للتشطيبات",
          "trustScore": 92,
          "averageRating": 4.8,
          "completedProjects": 78,
          "responseTime": "30 دقيقة"
        }
      },
      "price": 65000,
      "priceType": "FIXED",
      "estimatedDuration": "3 أسابيع",
      "description": "...",
      "status": "PENDING",
      "createdAt": "2025-01-16T10:00:00Z"
    }
  ],
  "statistics": {
    "totalQuotes": 4,
    "lowestPrice": 55000,
    "highestPrice": 85000,
    "averagePrice": 67500
  }
}
```

---

## POST /service-requests/:id/quotes/:quoteId/accept
Accept quote

**Auth:** Required (request owner)

**Response:**
```json
{
  "serviceRequestId": "sr_abc123",
  "quoteId": "quote_1",
  "status": "ACCEPTED",
  "contract": {
    "id": "contract_new123",
    "status": "PENDING_SIGNATURES"
  },
  "message": "تم قبول العرض. يمكنك الآن التواصل مع مقدم الخدمة."
}
```

---

# 📝 CONTRACTS (العقود)

## GET /contracts
Get my contracts

**Auth:** Required

**Query:**
- `role`: buyer | vendor
- `status`: ContractStatus

---

## GET /contracts/:id
Get contract details

---

## POST /contracts/:id/sign
Sign contract

**Auth:** Required (party to contract)

---

## POST /contracts/:id/milestones/:milestoneId/complete
Mark milestone as complete (vendor)

**Body:**
```json
{
  "completionNotes": "تم التسليم بالكامل",
  "deliverables": ["photo1.jpg", "report.pdf"]
}
```

---

## POST /contracts/:id/milestones/:milestoneId/approve
Approve milestone (buyer)

---

## POST /contracts/:id/milestones/:milestoneId/reject
Reject milestone (buyer)

**Body:**
```json
{
  "reason": "العمل لا يطابق المواصفات المطلوبة"
}
```

---

# 💳 ESCROW & PAYMENTS

## POST /contracts/:id/escrow/fund
Fund escrow

**Auth:** Required (buyer)

**Body:**
```json
{
  "amount": 65000,
  "milestoneId": "milestone_1",
  "paymentMethod": "CARD"
}
```

---

## POST /contracts/:id/escrow/release
Release escrow funds

**Auth:** Required (buyer OR auto after approval)

---

# ⭐ REVIEWS

## POST /contracts/:id/review
Submit review after contract completion

**Auth:** Required (party to contract)

**Body:**
```json
{
  "overallRating": 5,
  "qualityRating": 5,
  "communicationRating": 5,
  "timelinessRating": 4,
  "valueRating": 5,
  "professionalismRating": 5,
  "title": "تجربة ممتازة",
  "comment": "عمل احترافي ودقيق في المواعيد. أنصح بالتعامل معهم.",
  "pros": ["جودة عالية", "التزام بالمواعيد", "تواصل ممتاز"],
  "cons": [],
  "wouldRecommend": true
}
```

---

# 🏢 VENDOR MANAGEMENT

## GET /vendors
Browse vendors

**Query:**
- `category`: TenderCategory
- `governorate`: string
- `minRating`: float
- `verified`: boolean
- `search`: string

---

## GET /vendors/:id
Get vendor profile

---

## POST /vendors/register
Register as vendor

**Body:**
```json
{
  "companyName": "شركة التقنية المتقدمة",
  "companyNameAr": "شركة التقنية المتقدمة",
  "companySize": "MEDIUM",
  "yearEstablished": 2015,
  "employeeCount": "50-100",

  "bio": "شركة متخصصة في توريد أجهزة تكنولوجيا المعلومات...",

  "categories": ["IT_HARDWARE", "IT_SOFTWARE", "IT_SERVICES"],
  "specializations": ["أجهزة Dell", "أجهزة HP", "شبكات Cisco"],

  "headquarters": "القاهرة",
  "operatingGovernorate": ["القاهرة", "الجيزة", "الإسكندرية"]
}
```

---

# 🔔 NOTIFICATIONS

## GET /notifications
Get my notifications

**Query:**
- `unread`: boolean
- `type`: NotificationType

---

## PUT /notifications/:id/read
Mark as read

---

## PUT /notifications/read-all
Mark all as read

---

# 📊 ANALYTICS & STATS

## GET /tenders/stats
Get platform statistics

**Response:**
```json
{
  "overview": {
    "totalActiveTenders": 234,
    "totalActiveValue": 150000000,
    "closingToday": 12,
    "newToday": 45
  },
  "categories": {
    "CONSTRUCTION": { "count": 89, "value": 50000000 },
    "IT_HARDWARE": { "count": 45, "value": 30000000 }
  },
  "topGovernorate": [
    { "name": "القاهرة", "count": 120 },
    { "name": "الجيزة", "count": 45 }
  ],
  "trends": {
    "tenderGrowth": 15,
    "averageBidsPerTender": 8.5,
    "averageAwardTime": "14 يوم"
  }
}
```

---

## GET /users/me/dashboard
Get user dashboard

**Auth:** Required

**Response:**
```json
{
  "summary": {
    "activeTenders": 5,
    "pendingBids": 12,
    "activeContracts": 3,
    "completedContracts": 45
  },
  "recentActivity": [...],
  "upcomingDeadlines": [...],
  "notifications": {
    "unread": 8
  },
  "performance": {
    "winRate": 25,
    "averageRating": 4.8,
    "totalContractValue": 5000000
  }
}
```

---

# 🛡️ ERROR CODES

| Code | Description AR | Description EN |
|------|----------------|----------------|
| `TENDER_NOT_FOUND` | المناقصة غير موجودة | Tender not found |
| `TENDER_CLOSED` | المناقصة مغلقة | Tender closed |
| `TENDER_NOT_ACTIVE` | المناقصة غير نشطة | Tender not active |
| `BID_TOO_LOW` | العرض أقل من الحد الأدنى | Bid too low |
| `BID_DEADLINE_PASSED` | انتهى موعد تقديم العروض | Bid deadline passed |
| `DEPOSIT_REQUIRED` | يجب دفع الوديعة أولاً | Deposit required |
| `INSUFFICIENT_TRUST_LEVEL` | مستوى ثقة غير كافٍ | Insufficient trust level |
| `VENDOR_NOT_VERIFIED` | المورد غير موثق | Vendor not verified |
| `ALREADY_BID` | لديك عرض مقدم بالفعل | Already submitted bid |
| `CANNOT_BID_OWN_TENDER` | لا يمكن تقديم عرض على مناقصتك | Cannot bid on own tender |
| `AUCTION_NOT_STARTED` | المزاد لم يبدأ بعد | Auction not started |
| `AUCTION_ENDED` | المزاد انتهى | Auction ended |
| `CONTRACT_NOT_FOUND` | العقد غير موجود | Contract not found |
| `UNAUTHORIZED_ACTION` | غير مصرح بهذا الإجراء | Unauthorized action |

---

# 📱 RATE LIMITING

| Endpoint Type | Anonymous | Authenticated | Verified |
|--------------|-----------|---------------|----------|
| Read (GET) | 100/hour | 1000/hour | 5000/hour |
| Write (POST/PUT) | 10/hour | 100/hour | 500/hour |
| Auction Bids | N/A | 1/5sec | 1/3sec |
| Search | 50/hour | 500/hour | 2000/hour |

---

# 🔗 WEBHOOKS

Register webhooks to receive real-time notifications:

```
POST /webhooks
{
  "url": "https://your-server.com/webhook",
  "events": [
    "tender.created",
    "tender.awarded",
    "bid.received",
    "auction.ended",
    "contract.signed",
    "payment.received"
  ]
}
```

**Webhook Payload:**
```json
{
  "event": "tender.awarded",
  "timestamp": "2025-01-20T10:00:00Z",
  "data": {
    "tenderId": "tender_abc123",
    "winningBidId": "bid_xyz789",
    "contractId": "contract_new123"
  }
}
```
