# XCHANGE BARTER MARKETPLACE - API SPECIFICATIONS
# مواصفات واجهة برمجة التطبيقات لسوق المقايضة

## Base URL
```
Production: https://api.xchange.eg/v1/barter
Development: http://localhost:3000/api/v1/barter
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

# 🔄 BARTER OFFERS (عروض المقايضة)

## POST /offers
Create new barter offer

**Auth:** Required

**Body:**
```json
{
  "offeredItemId": "item_abc123",
  "requestedItemId": "item_xyz789",
  "message": "أرغب في مقايضة جهازي بجهازك",
  "messageAr": "أرغب في مقايضة جهازي بجهازك",
  "cashTopUp": 500,
  "cashTopUpDirection": "OFFERED",
  "expiresAt": "2025-02-15T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "offer_abc123",
  "status": "PENDING",
  "offeredItem": {
    "id": "item_abc123",
    "title": "iPhone 14 Pro",
    "estimatedValue": 25000,
    "image": "url"
  },
  "requestedItem": {
    "id": "item_xyz789",
    "title": "Samsung Galaxy S23",
    "estimatedValue": 24500,
    "image": "url"
  },
  "cashTopUp": 500,
  "cashTopUpDirection": "OFFERED",
  "valueMatch": 98,
  "createdAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-02-15T23:59:59Z",
  "message": "تم إرسال عرض المقايضة بنجاح"
}
```

---

## GET /offers
Get my barter offers

**Auth:** Required

**Query Params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | sent, received, all |
| `status` | string | PENDING, ACCEPTED, REJECTED, COUNTERED, EXPIRED, COMPLETED |
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20) |

**Response:**
```json
{
  "offers": [
    {
      "id": "offer_abc123",
      "type": "sent",
      "status": "PENDING",
      "offeredItem": {
        "id": "item_abc123",
        "title": "iPhone 14 Pro",
        "estimatedValue": 25000,
        "image": "url"
      },
      "requestedItem": {
        "id": "item_xyz789",
        "title": "Samsung Galaxy S23",
        "estimatedValue": 24500,
        "image": "url"
      },
      "cashTopUp": 500,
      "cashTopUpDirection": "OFFERED",
      "valueMatch": 98,
      "otherParty": {
        "id": "user_xyz",
        "fullName": "أحمد محمد",
        "avatar": "url",
        "rating": 4.8
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "expiresAt": "2025-02-15T23:59:59Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## GET /offers/:id
Get offer details

**Auth:** Required

**Response:**
```json
{
  "id": "offer_abc123",
  "type": "sent",
  "status": "PENDING",
  "offeredItem": {
    "id": "item_abc123",
    "title": "iPhone 14 Pro",
    "description": "جهاز بحالة ممتازة...",
    "estimatedValue": 25000,
    "condition": "LIKE_NEW",
    "images": ["url1", "url2"],
    "governorate": "القاهرة"
  },
  "requestedItem": {
    "id": "item_xyz789",
    "title": "Samsung Galaxy S23",
    "description": "جهاز جديد...",
    "estimatedValue": 24500,
    "condition": "NEW",
    "images": ["url1", "url2"],
    "governorate": "القاهرة"
  },
  "cashTopUp": 500,
  "cashTopUpDirection": "OFFERED",
  "valueMatch": 98,
  "message": "أرغب في مقايضة جهازي بجهازك",
  "offeror": {
    "id": "user_abc",
    "fullName": "محمد أحمد",
    "avatar": "url",
    "rating": 4.5,
    "totalBarters": 12
  },
  "offeree": {
    "id": "user_xyz",
    "fullName": "أحمد محمد",
    "avatar": "url",
    "rating": 4.8,
    "totalBarters": 25
  },
  "history": [
    {
      "action": "CREATED",
      "by": "user_abc",
      "timestamp": "2025-01-15T10:00:00Z"
    }
  ],
  "createdAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-02-15T23:59:59Z"
}
```

---

## POST /offers/:id/accept
Accept barter offer

**Auth:** Required (offeree only)

**Response:**
```json
{
  "id": "offer_abc123",
  "status": "ACCEPTED",
  "escrow": {
    "id": "escrow_xyz",
    "status": "PENDING_ITEMS",
    "instructions": "يرجى تسليم المنتجات خلال 7 أيام"
  },
  "message": "تم قبول عرض المقايضة. يرجى متابعة خطوات التسليم."
}
```

---

## POST /offers/:id/reject
Reject barter offer

**Auth:** Required (offeree only)

**Body:**
```json
{
  "reason": "لا أرغب في المقايضة حالياً"
}
```

---

## POST /offers/:id/counter
Counter barter offer

**Auth:** Required (offeree only)

**Body:**
```json
{
  "counterItemId": "item_different",
  "cashTopUp": 1000,
  "cashTopUpDirection": "REQUESTED",
  "message": "أفضل هذا الجهاز بدلاً منه"
}
```

**Response:**
```json
{
  "id": "offer_counter123",
  "originalOfferId": "offer_abc123",
  "status": "PENDING",
  "message": "تم إرسال العرض المضاد بنجاح"
}
```

---

## DELETE /offers/:id
Cancel/withdraw offer

**Auth:** Required (offeror only, status must be PENDING)

---

# 🏊 BARTER POOLS (مجمعات المقايضة)

## POST /pools
Create barter pool

**Auth:** Required

**Body:**
```json
{
  "title": "مقايضة أجهزة إلكترونية",
  "description": "مجمع لتبادل الأجهزة الإلكترونية المستعملة",
  "targetDescription": "أبحث عن لابتوب ماك بوك",
  "targetCategoryId": "cat_electronics",
  "targetMinValue": 15000,
  "targetMaxValue": 20000,
  "maxParticipants": 10,
  "deadlineDays": 14,
  "initialContribution": {
    "itemId": "item_abc123"
  },
  "rules": "- يجب أن تكون المنتجات بحالة جيدة\n- التقييم النهائي بواسطة خبير"
}
```

**Response:**
```json
{
  "id": "pool_abc123",
  "status": "OPEN",
  "inviteCode": "BARTER2025",
  "shareUrl": "https://xchange.eg/pools/pool_abc123",
  "message": "تم إنشاء مجمع المقايضة بنجاح"
}
```

---

## GET /pools
Browse barter pools

**Auth:** Optional

**Query Params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | OPEN, MATCHING, CLOSED, COMPLETED |
| `categoryId` | string | Target category |
| `minValue` | float | Minimum target value |
| `maxValue` | float | Maximum target value |
| `governorate` | string | Filter by governorate |
| `page` | int | Page number |
| `limit` | int | Items per page |

**Response:**
```json
{
  "pools": [
    {
      "id": "pool_abc123",
      "title": "مقايضة أجهزة إلكترونية",
      "status": "OPEN",
      "targetDescription": "أبحث عن لابتوب ماك بوك",
      "targetValue": {
        "min": 15000,
        "max": 20000
      },
      "currentValue": 18500,
      "participants": 5,
      "maxParticipants": 10,
      "deadline": "2025-02-15T23:59:59Z",
      "timeRemaining": "7 أيام",
      "creator": {
        "id": "user_abc",
        "fullName": "محمد أحمد",
        "avatar": "url",
        "rating": 4.5
      },
      "contributions": [
        {
          "item": {
            "id": "item_1",
            "title": "iPhone 12",
            "estimatedValue": 12000,
            "image": "url"
          }
        }
      ],
      "matchScore": 85
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## GET /pools/:id
Get pool details

**Auth:** Optional

---

## POST /pools/:id/join
Join barter pool with contribution

**Auth:** Required

**Body:**
```json
{
  "itemId": "item_xyz789",
  "message": "أريد المشاركة بجهازي"
}
```

---

## POST /pools/:id/leave
Leave barter pool

**Auth:** Required (participant only)

---

## POST /pools/:id/close
Close pool for matching

**Auth:** Required (creator only)

---

# 🎯 MATCHING (المطابقة الذكية)

## GET /matching/suggestions
Get AI-powered barter suggestions for my items

**Auth:** Required

**Query Params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `itemId` | string | Specific item to match |
| `limit` | int | Number of suggestions |
| `minMatchScore` | int | Minimum match percentage (0-100) |

**Response:**
```json
{
  "suggestions": [
    {
      "myItem": {
        "id": "item_abc",
        "title": "iPhone 14 Pro",
        "estimatedValue": 25000
      },
      "matchedItem": {
        "id": "item_xyz",
        "title": "Samsung Galaxy S23 Ultra",
        "estimatedValue": 24000,
        "owner": {
          "id": "user_xyz",
          "fullName": "أحمد محمد",
          "rating": 4.8
        },
        "images": ["url"],
        "governorate": "القاهرة"
      },
      "matchScore": 95,
      "matchReasons": [
        "فئة متطابقة: إلكترونيات",
        "قيمة متقاربة (فرق 4%)",
        "نفس المحافظة",
        "كلاكما يبحث عن تبديل"
      ],
      "valueDifference": 1000,
      "suggestedCashTopUp": {
        "amount": 1000,
        "direction": "FROM_MATCH"
      }
    }
  ],
  "totalPotentialMatches": 45
}
```

---

## GET /matching/chains
Get multi-party barter chain opportunities

**Auth:** Required

**Response:**
```json
{
  "chains": [
    {
      "id": "chain_abc",
      "type": "TRIANGULAR",
      "participants": 3,
      "myPosition": 1,
      "chain": [
        {
          "position": 1,
          "gives": { "id": "item_a", "title": "iPhone 14", "value": 20000 },
          "receives": { "id": "item_c", "title": "MacBook Air", "value": 22000 },
          "user": { "id": "user_me", "name": "أنا" }
        },
        {
          "position": 2,
          "gives": { "id": "item_b", "title": "PS5", "value": 18000 },
          "receives": { "id": "item_a", "title": "iPhone 14", "value": 20000 },
          "user": { "id": "user_2", "name": "أحمد", "rating": 4.5 }
        },
        {
          "position": 3,
          "gives": { "id": "item_c", "title": "MacBook Air", "value": 22000 },
          "receives": { "id": "item_b", "title": "PS5", "value": 18000 },
          "user": { "id": "user_3", "name": "محمد", "rating": 4.8 }
        }
      ],
      "totalValue": 60000,
      "avgValueMatch": 92,
      "cashAdjustments": [
        { "from": "user_2", "to": "user_3", "amount": 4000 }
      ],
      "expiresAt": "2025-01-20T10:00:00Z",
      "status": "AWAITING_CONFIRMATION"
    }
  ]
}
```

---

## POST /matching/chains/:id/confirm
Confirm participation in barter chain

**Auth:** Required

---

# 📦 ESCROW (نظام الضمان)

## GET /escrow/:id
Get escrow details for barter transaction

**Auth:** Required (party to escrow)

**Response:**
```json
{
  "id": "escrow_xyz",
  "type": "BARTER",
  "status": "AWAITING_ITEMS",
  "barterOffer": {
    "id": "offer_abc",
    "offeredItem": { "id": "item_1", "title": "...", "status": "PENDING_DELIVERY" },
    "requestedItem": { "id": "item_2", "title": "...", "status": "PENDING_DELIVERY" }
  },
  "cashInEscrow": 500,
  "parties": [
    { "userId": "user_1", "role": "OFFEROR", "itemDelivered": false },
    { "userId": "user_2", "role": "OFFEREE", "itemDelivered": false }
  ],
  "timeline": {
    "created": "2025-01-15T10:00:00Z",
    "deadline": "2025-01-22T10:00:00Z",
    "daysRemaining": 5
  },
  "instructions": [
    "قم بتسليم المنتج إلى نقطة التبادل المتفق عليها",
    "سيقوم الطرف الآخر بفحص المنتج",
    "بعد التأكيد، سيتم إتمام المقايضة"
  ]
}
```

---

## POST /escrow/:id/confirm-delivery
Confirm item delivery

**Auth:** Required

**Body:**
```json
{
  "itemId": "item_abc",
  "deliveryMethod": "EXCHANGE_POINT",
  "exchangePointId": "point_123",
  "photos": ["url1", "url2"],
  "notes": "تم التسليم بحالة ممتازة"
}
```

---

## POST /escrow/:id/confirm-receipt
Confirm item receipt and approval

**Auth:** Required

**Body:**
```json
{
  "itemId": "item_xyz",
  "approved": true,
  "rating": 5,
  "notes": "المنتج مطابق للوصف"
}
```

---

## POST /escrow/:id/dispute
Open dispute

**Auth:** Required

**Body:**
```json
{
  "reason": "ITEM_NOT_AS_DESCRIBED",
  "description": "المنتج به خدوش لم يتم ذكرها",
  "evidence": ["photo1.jpg", "photo2.jpg"]
}
```

---

# 📊 STATISTICS (الإحصائيات)

## GET /stats
Get barter marketplace statistics

**Response:**
```json
{
  "overview": {
    "totalBarters": 15678,
    "activeBarters": 234,
    "totalValue": 125000000,
    "avgMatchTime": "2 يوم",
    "successRate": 87
  },
  "trending": {
    "categories": [
      { "id": "electronics", "name": "إلكترونيات", "count": 456 },
      { "id": "fashion", "name": "أزياء", "count": 321 }
    ],
    "items": [
      { "title": "iPhone", "barterCount": 89 },
      { "title": "PlayStation", "barterCount": 67 }
    ]
  },
  "geographic": {
    "topGovernorates": [
      { "name": "القاهرة", "count": 567 },
      { "name": "الجيزة", "count": 234 }
    ]
  }
}
```

---

## GET /stats/me
Get my barter statistics

**Auth:** Required

**Response:**
```json
{
  "summary": {
    "totalBarters": 25,
    "successfulBarters": 22,
    "successRate": 88,
    "totalValueExchanged": 450000,
    "avgResponseTime": "3 ساعات"
  },
  "breakdown": {
    "sent": 15,
    "received": 10,
    "accepted": 22,
    "rejected": 3
  },
  "badges": [
    { "name": "BARTER_PRO", "nameAr": "محترف المقايضة", "earnedAt": "..." }
  ],
  "rating": {
    "average": 4.8,
    "count": 22,
    "distribution": { "5": 18, "4": 3, "3": 1 }
  }
}
```

---

# 🛡️ ERROR CODES

| Code | Description AR | Description EN |
|------|----------------|----------------|
| `OFFER_NOT_FOUND` | العرض غير موجود | Offer not found |
| `OFFER_EXPIRED` | العرض منتهي الصلاحية | Offer expired |
| `ITEM_NOT_AVAILABLE` | المنتج غير متاح | Item not available |
| `ITEM_ALREADY_IN_BARTER` | المنتج في مقايضة أخرى | Item already in barter |
| `CANNOT_BARTER_OWN_ITEM` | لا يمكن مقايضة منتجك | Cannot barter own item |
| `POOL_FULL` | المجمع ممتلئ | Pool is full |
| `POOL_CLOSED` | المجمع مغلق | Pool is closed |
| `INSUFFICIENT_VALUE` | قيمة غير كافية | Insufficient value |
| `ESCROW_TIMEOUT` | انتهى وقت الضمان | Escrow timeout |
| `DELIVERY_FAILED` | فشل التسليم | Delivery failed |

---

# 🔗 WEBHOOKS

**Events:**
- `barter.offer.created` - New offer created
- `barter.offer.accepted` - Offer accepted
- `barter.offer.rejected` - Offer rejected
- `barter.offer.countered` - Counter offer received
- `barter.match.found` - AI match found
- `barter.chain.available` - Multi-party chain available
- `barter.escrow.started` - Escrow process started
- `barter.completed` - Barter successfully completed
- `barter.dispute.opened` - Dispute opened

---

# 📱 WEBSOCKET EVENTS

## Connection
```javascript
const socket = io('wss://api.xchange.eg/ws/barter', {
  auth: { token: 'Bearer ...' }
});
```

## Events

**new_offer**
```json
{
  "offerId": "offer_abc",
  "type": "received",
  "offeredItem": { ... },
  "requestedItem": { ... }
}
```

**offer_accepted**
```json
{
  "offerId": "offer_abc",
  "escrowId": "escrow_xyz"
}
```

**match_found**
```json
{
  "matchId": "match_abc",
  "matchScore": 95,
  "matchedItem": { ... }
}
```

**chain_available**
```json
{
  "chainId": "chain_abc",
  "participants": 3,
  "myBenefit": { ... }
}
```
