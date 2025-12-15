# XCHANGE AUCTION MARKETPLACE - API ENDPOINTS SPECIFICATION

## Base URL
```
Production: https://api.xchange.eg/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All authenticated endpoints require JWT token:
```
Authorization: Bearer <token>
```

---

## 🎯 AUCTION MANAGEMENT

### POST /auctions
Create new auction

**Auth:** Required  
**Body:**
```json
{
  "itemType": "CARS",
  "itemId": "car_123",
  "title": "مرسيدس E200 موديل 2018",
  "description": "سيارة بحالة ممتازة...",
  "images": ["url1", "url2", "url3"],
  "auctionType": "ENGLISH",
  "startTime": "2024-12-20T10:00:00Z",
  "endTime": "2024-12-27T22:00:00Z",
  "startingPrice": 250000,
  "reservePrice": 280000,
  "buyNowPrice": 320000,
  "depositRequired": 25000,
  "allowInspection": true,
  "inspectionAddressId": "addr_xyz",
  "shippingAvailable": false,
  "pickupOnly": true
}
```

**Response:**
```json
{
  "id": "auction_abc123",
  "status": "PENDING_APPROVAL",
  "estimatedApprovalTime": "24 hours",
  "depositInfo": {
    "required": true,
    "amount": 25000,
    "percentage": 10
  },
  "fees": {
    "listingFee": 0,
    "featuredFee": 500,
    "estimatedSellerPremium": 12500,
    "estimatedBuyerPremium": 12500
  },
  "createdAt": "2024-12-15T10:00:00Z"
}
```

---

### GET /auctions
Browse/search auctions

**Auth:** No  
**Query Params:**
- `page`: int (default: 1)
- `limit`: int (default: 20, max: 100)
- `category`: AuctionCategory
- `status`: ACTIVE|ENDING_SOON|SCHEDULED
- `auctionType`: ENGLISH|SEALED_BID
- `minPrice`: float
- `maxPrice`: float
- `city`: string
- `endingSoon`: boolean (auctions ending in <24h)
- `featured`: boolean
- `search`: string
- `sortBy`: endTime|currentPrice|bids|createdAt
- `sortOrder`: asc|desc

**Response:**
```json
{
  "auctions": [
    {
      "id": "auction_abc123",
      "title": "مرسيدس E200 موديل 2018",
      "itemType": "CARS",
      "auctionType": "ENGLISH",
      "status": "ACTIVE",
      "startingPrice": 250000,
      "currentPrice": 275000,
      "reserveMet": false,
      "totalBids": 12,
      "uniqueBidders": 5,
      "startTime": "2024-12-20T10:00:00Z",
      "endTime": "2024-12-27T22:00:00Z",
      "timeRemaining": "5d 12h 30m",
      "images": ["url1", "url2"],
      "seller": {
        "id": "user123",
        "fullName": "أحمد محمد",
        "trustLevel": "TRUSTED",
        "auctionReputation": 95.5
      },
      "watchlistCount": 23,
      "isFeatured": true
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
      "CARS": 45,
      "REAL_ESTATE": 23,
      "LUXURY_GOODS": 12
    },
    "activeCount": 89,
    "endingSoonCount": 15
  }
}
```

---

### GET /auctions/:id
Get auction details

**Auth:** No  
**Response:**
```json
{
  "id": "auction_abc123",
  "title": "مرسيدس E200 موديل 2018",
  "description": "سيارة بحالة ممتازة...",
  "itemType": "CARS",
  "itemId": "car_123",
  "auctionType": "ENGLISH",
  "status": "ACTIVE",
  
  "startingPrice": 250000,
  "currentPrice": 275000,
  "reservePrice": null,
  "reserveMet": false,
  "buyNowPrice": 320000,
  "minimumIncrement": 5000,
  
  "startTime": "2024-12-20T10:00:00Z",
  "endTime": "2024-12-27T22:00:00Z",
  "timeRemaining": {
    "days": 5,
    "hours": 12,
    "minutes": 30,
    "seconds": 15
  },
  
  "totalBids": 12,
  "uniqueBidders": 5,
  "currentWinnerId": "user456",
  
  "depositRequired": 25000,
  "depositPercentage": 10,
  
  "images": ["url1", "url2", "url3", "url4"],
  "videos": ["url5"],
  
  "seller": {
    "id": "user123",
    "fullName": "أحمد محمد",
    "trustLevel": "TRUSTED",
    "auctionReputation": 95.5,
    "totalAuctionsCompleted": 47,
    "averageRating": 4.8,
    "responseTime": "2 hours"
  },
  
  "inspection": {
    "allowed": true,
    "address": {
      "city": "القاهرة",
      "district": "مدينة نصر"
    },
    "notes": "المعاينة متاحة من 10 صباحاً حتى 5 مساءً"
  },
  
  "shipping": {
    "available": false,
    "pickupOnly": true
  },
  
  "viewCount": 234,
  "watchlistCount": 23,
  
  "bidHistory": [
    {
      "amount": 275000,
      "bidderName": "م***د",
      "timestamp": "2024-12-22T14:30:00Z",
      "isWinning": true
    },
    {
      "amount": 270000,
      "bidderName": "خ***ف",
      "timestamp": "2024-12-22T12:15:00Z",
      "isWinning": false
    }
  ],
  
  "fees": {
    "sellerPremium": 5,
    "buyerPremium": 5,
    "estimatedTotal": 288750
  }
}
```

---

### PUT /auctions/:id
Update auction (before it starts)

**Auth:** Required (seller only)  
**Body:** Partial update allowed

---

### DELETE /auctions/:id
Cancel auction

**Auth:** Required (seller only)  
**Note:** Can only cancel if no bids placed

---

## 💰 BIDDING SYSTEM

### POST /auctions/:id/bids
Place a bid

**Auth:** Required  
**Body:**
```json
{
  "amount": 280000,
  "isProxyBid": false
}
```

**Response:**
```json
{
  "bidId": "bid_xyz789",
  "amount": 280000,
  "status": "WINNING",
  "currentPrice": 280000,
  "nextMinimumBid": 285000,
  "isLeading": true,
  "outbidCount": 0,
  "message": "تهانينا! أنت الآن في الصدارة"
}
```

**Error Cases:**
```json
{
  "error": {
    "code": "BID_TOO_LOW",
    "message": "العرض يجب أن يكون على الأقل 285,000 ج.م",
    "minimumRequired": 285000
  }
}
```

---

### POST /auctions/:id/proxy-bid
Set auto proxy bid

**Auth:** Required  
**Body:**
```json
{
  "maxAmount": 300000
}
```

**Response:**
```json
{
  "proxyId": "proxy_123",
  "maxAmount": 300000,
  "currentBid": 280000,
  "active": true,
  "message": "سنزايد نيابة عنك حتى 300,000 ج.م"
}
```

---

### POST /auctions/:id/buy-now
Buy instantly at Buy Now price

**Auth:** Required  
**Response:**
```json
{
  "auctionId": "auction_abc123",
  "price": 320000,
  "status": "SOLD",
  "paymentDue": "2024-12-23T00:00:00Z",
  "totalAmount": 336000,
  "breakdown": {
    "price": 320000,
    "buyerPremium": 16000,
    "total": 336000
  }
}
```

---

### GET /auctions/:id/my-bids
Get my bids on this auction

**Auth:** Required  
**Response:**
```json
{
  "totalBids": 5,
  "highestBid": 280000,
  "isWinning": true,
  "proxyBid": {
    "active": true,
    "maxAmount": 300000
  },
  "bids": [
    {
      "id": "bid_1",
      "amount": 280000,
      "timestamp": "2024-12-22T14:30:00Z",
      "isWinning": true,
      "isOutbid": false
    }
  ]
}
```

---

## 📋 WATCHLIST

### POST /auctions/:id/watchlist
Add to watchlist

**Auth:** Required  
**Body:**
```json
{
  "notifyOnBid": true,
  "notifyBeforeEnd": true,
  "notifyMinutes": 60
}
```

---

### DELETE /auctions/:id/watchlist
Remove from watchlist

**Auth:** Required

---

### GET /users/me/watchlist
Get my watchlist

**Auth:** Required  
**Response:**
```json
{
  "items": [
    {
      "auction": {
        "id": "auction_abc123",
        "title": "...",
        "currentPrice": 275000,
        "endTime": "2024-12-27T22:00:00Z"
      },
      "addedAt": "2024-12-15T10:00:00Z",
      "notifications": {
        "onBid": true,
        "beforeEnd": true,
        "minutes": 60
      }
    }
  ]
}
```

---

## 💳 DEPOSITS & PAYMENTS

### POST /auctions/:id/deposit
Pay auction deposit

**Auth:** Required  
**Body:**
```json
{
  "amount": 25000,
  "paymentMethod": "CARD"
}
```

**Response:**
```json
{
  "depositId": "deposit_abc",
  "amount": 25000,
  "status": "PAID",
  "paymentUrl": "https://payment.paymob.com/...",
  "refundPolicy": "سيتم استرداد الوديعة خلال 3-5 أيام عمل إذا لم تفز بالمزاد"
}
```

---

### POST /auctions/:id/payment
Pay for won auction

**Auth:** Required (winner only)  
**Body:**
```json
{
  "paymentMethod": "BANK_TRANSFER",
  "useDeposit": true
}
```

**Response:**
```json
{
  "totalAmount": 288750,
  "breakdown": {
    "winningBid": 275000,
    "buyerPremium": 13750,
    "depositApplied": -25000,
    "remaining": 263750
  },
  "paymentDueDate": "2024-12-30T23:59:59Z",
  "paymentInstructions": {
    "bankName": "البنك الأهلي المصري",
    "accountNumber": "123456789",
    "reference": "AUC-ABC123"
  }
}
```

---

## 🚚 DELIVERY & COMPLETION

### POST /auctions/:id/ship
Mark item as shipped (seller)

**Auth:** Required (seller only)  
**Body:**
```json
{
  "trackingNumber": "BOSTA-12345",
  "carrier": "BOSTA",
  "estimatedDelivery": "2024-12-25T00:00:00Z"
}
```

---

### POST /auctions/:id/confirm-delivery
Confirm receipt (buyer)

**Auth:** Required (winner only)  
**Body:**
```json
{
  "itemAsDescribed": true,
  "qualitySatisfactory": true,
  "notes": "السيارة مطابقة للوصف تماماً"
}
```

---

### POST /auctions/:id/dispute
Open dispute

**Auth:** Required (buyer or seller)  
**Body:**
```json
{
  "reason": "ITEM_NOT_AS_DESCRIBED",
  "description": "السيارة بها أضرار لم تُذكر",
  "evidence": ["photo1", "photo2"]
}
```

---

## ⭐ REVIEWS

### POST /auctions/:id/review
Submit review after completion

**Auth:** Required  
**Body:**
```json
{
  "reviewedUserId": "user123",
  "rating": 5,
  "accuracyRating": 5,
  "communicationRating": 5,
  "paymentSpeedRating": 5,
  "comment": "بائع ممتاز، السيارة كما في الوصف"
}
```

---

## 📊 ANALYTICS & STATS

### GET /auctions/stats
Get auction statistics

**Auth:** No  
**Response:**
```json
{
  "totalActiveAuctions": 89,
  "endingToday": 15,
  "totalBidsToday": 1247,
  "averageBidsPerAuction": 8.5,
  "categories": {
    "CARS": {
      "active": 45,
      "averagePrice": 185000,
      "totalBids": 567
    }
  },
  "hotAuctions": [
    {
      "id": "auction_xyz",
      "title": "...",
      "bids": 45,
      "timeRemaining": "2h 15m"
    }
  ]
}
```

---

### GET /users/me/auction-activity
Get my auction activity

**Auth:** Required  
**Response:**
```json
{
  "summary": {
    "totalBidsPlaced": 47,
    "totalAuctionsWon": 12,
    "totalAuctionsLost": 35,
    "winRate": 25.5,
    "totalSpent": 2450000,
    "averageWinningBid": 204166
  },
  "active": {
    "bidding": [
      {
        "auction": {...},
        "myHighestBid": 280000,
        "isWinning": true
      }
    ],
    "selling": [
      {
        "auction": {...},
        "currentPrice": 275000,
        "totalBids": 12
      }
    ]
  },
  "completed": {
    "won": [...],
    "sold": [...]
  }
}
```

---

## 🚨 FRAUD DETECTION

### POST /auctions/:id/report
Report suspicious activity

**Auth:** Required  
**Body:**
```json
{
  "type": "SHILL_BIDDING",
  "description": "مزايدة وهمية من حسابات متعددة",
  "evidence": {
    "suspectedUserIds": ["user789", "user012"],
    "pattern": "نفس التوقيت والمبالغ"
  }
}
```

---

## 🔔 NOTIFICATIONS

### GET /users/me/notifications
Get my notifications

**Auth:** Required  
**Query:**
- `unreadOnly`: boolean
- `type`: NotificationType
- `limit`: int

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "OUTBID",
      "title": "تم المزايدة عليك!",
      "message": "عرضك على مرسيدس E200 لم يعد الأعلى",
      "relatedId": "auction_abc123",
      "actionUrl": "/auctions/auction_abc123",
      "isRead": false,
      "createdAt": "2024-12-22T14:35:00Z"
    }
  ],
  "unreadCount": 5
}
```

---

### PUT /notifications/:id/read
Mark as read

**Auth:** Required

---

## 🔐 ADMIN ENDPOINTS

### PUT /auctions/:id/approve
Approve auction

**Auth:** Required (admin)

### PUT /auctions/:id/reject
Reject auction

**Auth:** Required (admin)  
**Body:**
```json
{
  "reason": "صور غير واضحة"
}
```

### GET /admin/suspicious-activities
Get flagged activities

**Auth:** Required (admin)

---

## 📱 WEBSOCKET EVENTS

### Connection
```javascript
const socket = io('wss://api.xchange.eg', {
  auth: { token: 'Bearer ...' }
});
```

### Events (Server → Client)

**bid_placed**
```json
{
  "auctionId": "auction_abc123",
  "newPrice": 280000,
  "nextMinimum": 285000,
  "totalBids": 13,
  "timeRemaining": "5d 12h 15m"
}
```

**auction_extended**
```json
{
  "auctionId": "auction_abc123",
  "newEndTime": "2024-12-27T22:02:00Z",
  "extensionCount": 3
}
```

**auction_ending_soon**
```json
{
  "auctionId": "auction_abc123",
  "minutesRemaining": 5
}
```

**you_are_outbid**
```json
{
  "auctionId": "auction_abc123",
  "yourBid": 275000,
  "currentBid": 280000
}
```

### Events (Client → Server)

**join_auction**
```json
{
  "auctionId": "auction_abc123"
}
```

**leave_auction**
```json
{
  "auctionId": "auction_abc123"
}
```

---

## ERROR CODES

| Code | Description |
|------|-------------|
| `AUCTION_NOT_FOUND` | المزاد غير موجود |
| `AUCTION_NOT_STARTED` | المزاد لم يبدأ بعد |
| `AUCTION_ENDED` | المزاد انتهى |
| `BID_TOO_LOW` | العرض أقل من الحد الأدنى |
| `DEPOSIT_REQUIRED` | يجب دفع الوديعة أولاً |
| `CANNOT_BID_OWN_AUCTION` | لا يمكن المزايدة على مزادك |
| `PAYMENT_OVERDUE` | تأخر في الدفع |
| `INSUFFICIENT_TRUST_LEVEL` | مستوى ثقة غير كافٍ |

---

## RATE LIMITING

| User Type | Rate Limit |
|-----------|------------|
| Unauthenticated | 100/hour |
| NEW | 500/hour |
| VERIFIED+ | 2000/hour |
| PROFESSIONAL | 10000/hour |

**Bid Rate Limiting:**
- Max 1 bid per 5 seconds per auction
- Max 100 bids per auction per user
