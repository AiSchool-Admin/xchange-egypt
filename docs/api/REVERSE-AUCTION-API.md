# Reverse Auction API Documentation

## 📋 Overview

The Reverse Auction System is a revolutionary feature where:
- **Buyers** create requests for items they want to purchase
- **Sellers** compete by bidding **DOWN** (lowering prices)
- **Winner** = Lowest price (or best overall value)

This is the **opposite** of traditional auctions where buyers bid UP to compete.

### Key Concepts

1. **Reverse Auction**: A request created by a buyer specifying what they want
2. **Bid**: An offer from a seller to provide the item at a certain price
3. **Bidding Down**: Each new bid must be LOWER than previous bids
4. **Award**: Buyer selects a winning bid
5. **Completion**: Transaction is finalized

### Benefits

**For Buyers:**
- Get best prices through competition
- Receive multiple offers to compare
- Choose based on price, quality, delivery, seller rating

**For Sellers:**
- Discover buying opportunities
- Compete fairly for customers
- Close deals faster

---

## 🎯 User Roles

### Buyer (Request Creator)
- Creates reverse auction requests
- Reviews bids from sellers
- Selects winner
- Can cancel before awarding

### Seller (Bidder)
- Browses active requests
- Submits competitive bids
- Can update or withdraw bids
- Wins if selected by buyer

---

## 📊 Auction Statuses

### Reverse Auction Statuses

| Status | Description |
|--------|-------------|
| `DRAFT` | Being created, not published yet |
| `ACTIVE` | Published and accepting bids |
| `ENDED` | Time expired, awaiting buyer decision |
| `AWARDED` | Winner selected by buyer |
| `COMPLETED` | Transaction completed |
| `CANCELLED` | Cancelled by buyer |
| `EXPIRED` | Ended without any bids |

### Bid Statuses

| Status | Description |
|--------|-------------|
| `ACTIVE` | Valid bid, not lowest |
| `OUTBID` | Another seller bid lower |
| `WINNING` | Currently the lowest bid |
| `WON` | Selected as winner |
| `LOST` | Not selected as winner |
| `WITHDRAWN` | Seller withdrew their bid |
| `REJECTED` | Buyer rejected this bid |

---

## 🔗 API Endpoints

### Summary

**Total Endpoints:** 14

| Category | Endpoints |
|----------|-----------|
| Reverse Auction Management | 7 |
| Bidding | 5 |
| Statistics | 1 |
| Award/Complete | 2 (included in management) |

---

## 📝 Reverse Auction Management (Buyer Side)

### 1. Create Reverse Auction

**Endpoint:** `POST /api/v1/reverse-auctions`
**Auth:** Required (Buyer)
**Description:** Create a new request for an item

**Request Body:**
```json
{
  "title": "iPhone 14 Pro Max 256GB - Like New",
  "description": "Looking for iPhone 14 Pro Max, 256GB storage, preferably in black or blue. Must be in excellent condition with original box and accessories.",
  "categoryId": "uuid-of-electronics-category",
  "condition": "LIKE_NEW",
  "specifications": {
    "storage": "256GB",
    "color": "Black or Blue",
    "unlocked": true,
    "originalBox": true
  },
  "quantity": 1,
  "location": "Cairo, Egypt",
  "deliveryPreference": "BOTH",
  "maxBudget": 25000,
  "targetPrice": 22000,
  "endDate": "2025-11-14T23:59:59Z",
  "publicNotes": "Please include clear photos of the device. Priority given to sellers with high ratings.",
  "buyerNotes": "Private notes for myself"
}
```

**Validation Rules:**
- `title`: 5-200 characters
- `description`: 20-2000 characters
- `condition`: NEW, LIKE_NEW, GOOD, FAIR, POOR
- `quantity`: 1-1000
- `maxBudget`: Optional, max 10,000,000 EGP
- `targetPrice`: Optional, must not exceed maxBudget
- `endDate`: Must be in future, max 90 days from now
- `deliveryPreference`: PICKUP, DELIVERY, BOTH

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Reverse auction created successfully",
  "data": {
    "id": "auction-uuid",
    "buyerId": "buyer-uuid",
    "title": "iPhone 14 Pro Max 256GB - Like New",
    "description": "...",
    "categoryId": "category-uuid",
    "condition": "LIKE_NEW",
    "specifications": {...},
    "quantity": 1,
    "location": "Cairo, Egypt",
    "deliveryPreference": "BOTH",
    "maxBudget": 25000,
    "targetPrice": 22000,
    "startDate": "2025-11-07T10:00:00Z",
    "endDate": "2025-11-14T23:59:59Z",
    "status": "ACTIVE",
    "totalBids": 0,
    "uniqueBidders": 0,
    "lowestBid": null,
    "views": 0,
    "publicNotes": "...",
    "createdAt": "2025-11-07T10:00:00Z",
    "buyer": {
      "id": "buyer-uuid",
      "fullName": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "avatar": "avatar-url",
      "rating": 4.8,
      "totalReviews": 25
    },
    "category": {
      "id": "category-uuid",
      "nameAr": "الكترونيات",
      "nameEn": "Electronics",
      "slug": "electronics"
    }
  }
}
```

---

### 2. Get All Reverse Auctions

**Endpoint:** `GET /api/v1/reverse-auctions`
**Auth:** Not required
**Description:** Browse all active reverse auctions with filters

**Query Parameters:**
- `status` (optional): ACTIVE, ENDED, AWARDED, etc.
- `categoryId` (optional): Filter by category
- `condition` (optional): Filter by required condition
- `minBudget` (optional): Minimum budget
- `maxBudget` (optional): Maximum budget
- `location` (optional): Filter by location (contains)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Results per page

**Example Request:**
```
GET /api/v1/reverse-auctions?categoryId=electronics-uuid&condition=LIKE_NEW&maxBudget=30000&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reverse auctions retrieved successfully",
  "data": {
    "items": [
      {
        "id": "auction-uuid",
        "title": "iPhone 14 Pro Max 256GB",
        "condition": "LIKE_NEW",
        "maxBudget": 25000,
        "targetPrice": 22000,
        "endDate": "2025-11-14T23:59:59Z",
        "status": "ACTIVE",
        "totalBids": 5,
        "uniqueBidders": 3,
        "lowestBid": 21500,
        "views": 45,
        "buyer": {
          "id": "buyer-uuid",
          "fullName": "Ahmed Hassan",
          "avatar": "avatar-url",
          "rating": 4.8,
          "totalReviews": 25
        },
        "category": {
          "id": "category-uuid",
          "nameEn": "Electronics",
          "nameAr": "الكترونيات",
          "slug": "electronics"
        },
        "_count": {
          "bids": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 3. Get Single Reverse Auction

**Endpoint:** `GET /api/v1/reverse-auctions/:id`
**Auth:** Not required (but recommended for buyerNotes visibility)
**Description:** Get detailed auction info with all bids

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reverse auction retrieved successfully",
  "data": {
    "id": "auction-uuid",
    "buyerId": "buyer-uuid",
    "title": "iPhone 14 Pro Max 256GB",
    "description": "...",
    "condition": "LIKE_NEW",
    "specifications": {...},
    "maxBudget": 25000,
    "targetPrice": 22000,
    "endDate": "2025-11-14T23:59:59Z",
    "status": "ACTIVE",
    "totalBids": 5,
    "uniqueBidders": 3,
    "lowestBid": 21500,
    "views": 46,
    "buyer": {
      "id": "buyer-uuid",
      "fullName": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "avatar": "avatar-url",
      "rating": 4.8,
      "totalReviews": 25,
      "city": "Cairo",
      "governorate": "Cairo"
    },
    "category": {...},
    "bids": [
      {
        "id": "bid-uuid-1",
        "bidAmount": 21500,
        "itemCondition": "LIKE_NEW",
        "itemDescription": "iPhone 14 Pro Max 256GB Black, excellent condition",
        "itemImages": ["image1-url", "image2-url"],
        "deliveryOption": "BOTH",
        "deliveryDays": 2,
        "deliveryCost": 50,
        "status": "WINNING",
        "createdAt": "2025-11-07T15:30:00Z",
        "seller": {
          "id": "seller-uuid",
          "fullName": "Mohamed Ali",
          "avatar": "avatar-url",
          "rating": 4.9,
          "totalReviews": 150,
          "city": "Cairo",
          "governorate": "Cairo"
        }
      },
      {
        "id": "bid-uuid-2",
        "bidAmount": 22000,
        "status": "OUTBID",
        "createdAt": "2025-11-07T14:00:00Z",
        "seller": {...}
      }
    ]
  }
}
```

**Note:** `buyerNotes` field is only visible to the buyer who created the auction.

---

### 4. Update Reverse Auction

**Endpoint:** `PATCH /api/v1/reverse-auctions/:id`
**Auth:** Required (Buyer who created it)
**Description:** Update auction details (only if ACTIVE or DRAFT)

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "condition": "GOOD",
  "specifications": {...},
  "maxBudget": 27000,
  "targetPrice": 24000,
  "endDate": "2025-11-15T23:59:59Z",
  "publicNotes": "Updated notes",
  "buyerNotes": "Updated private notes"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reverse auction updated successfully",
  "data": {
    "id": "auction-uuid",
    ...updated fields...
  }
}
```

---

### 5. Cancel Reverse Auction

**Endpoint:** `POST /api/v1/reverse-auctions/:id/cancel`
**Auth:** Required (Buyer who created it)
**Description:** Cancel auction (only if ACTIVE or DRAFT)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reverse auction cancelled successfully",
  "data": {
    "id": "auction-uuid",
    "status": "CANCELLED",
    ...
  }
}
```

**Note:** All active bids will be marked as LOST.

---

### 6. Delete Reverse Auction

**Endpoint:** `DELETE /api/v1/reverse-auctions/:id`
**Auth:** Required (Buyer who created it)
**Description:** Delete auction (only if DRAFT, no bids)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reverse auction deleted successfully",
  "data": null
}
```

---

### 7. Get Statistics

**Endpoint:** `GET /api/v1/reverse-auctions/stats`
**Auth:** Required
**Description:** Get user's auction statistics

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "asBuyer": {
      "ACTIVE": 3,
      "ENDED": 2,
      "AWARDED": 5,
      "COMPLETED": 4,
      "CANCELLED": 1,
      "EXPIRED": 0
    },
    "asSeller": {
      "ACTIVE": 8,
      "WINNING": 2,
      "OUTBID": 4,
      "WON": 3,
      "LOST": 5,
      "WITHDRAWN": 1
    }
  }
}
```

---

## 💰 Bidding Management (Seller Side)

### 1. Submit Bid

**Endpoint:** `POST /api/v1/reverse-auctions/:id/bids`
**Auth:** Required (Seller)
**Description:** Submit a bid on an auction

**Request Body:**
```json
{
  "bidAmount": 21500,
  "itemId": "item-uuid",
  "itemCondition": "LIKE_NEW",
  "itemDescription": "iPhone 14 Pro Max 256GB Black, purchased 3 months ago, excellent condition with original box and all accessories",
  "itemImages": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "deliveryOption": "BOTH",
  "deliveryDays": 2,
  "deliveryCost": 50,
  "notes": "Can meet in Cairo or ship anywhere in Egypt"
}
```

**Validation Rules:**
- `bidAmount`: Must be positive, max 10,000,000 EGP
- Must not exceed buyer's `maxBudget` (if set)
- Must be lower than your previous bid (if exists)
- `itemId`: Optional, link to existing item
- `itemCondition`: Required
- `itemDescription`: 10-1000 characters (optional but recommended)
- `itemImages`: Max 10 images
- `deliveryOption`: PICKUP, DELIVERY, BOTH
- `deliveryDays`: 0-365
- `deliveryCost`: 0-10,000 EGP

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Bid submitted successfully",
  "data": {
    "id": "bid-uuid",
    "reverseAuctionId": "auction-uuid",
    "sellerId": "seller-uuid",
    "bidAmount": 21500,
    "previousBid": null,
    "itemId": "item-uuid",
    "itemCondition": "LIKE_NEW",
    "itemDescription": "...",
    "itemImages": ["..."],
    "deliveryOption": "BOTH",
    "deliveryDays": 2,
    "deliveryCost": 50,
    "notes": "...",
    "status": "WINNING",
    "createdAt": "2025-11-07T15:30:00Z",
    "seller": {
      "id": "seller-uuid",
      "fullName": "Mohamed Ali",
      "avatar": "avatar-url",
      "rating": 4.9,
      "totalReviews": 150
    }
  }
}
```

**Business Logic:**
- If this is the lowest bid, status = `WINNING`
- If not, status = `OUTBID`
- All previous `WINNING` bids are updated to `OUTBID`
- Auction stats (totalBids, uniqueBidders, lowestBid) are updated

---

### 2. Get All Bids for Auction

**Endpoint:** `GET /api/v1/reverse-auctions/:id/bids`
**Auth:** Not required
**Description:** View all bids for an auction

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bids retrieved successfully",
  "data": [
    {
      "id": "bid-uuid-1",
      "bidAmount": 21500,
      "itemCondition": "LIKE_NEW",
      "itemDescription": "...",
      "deliveryOption": "BOTH",
      "deliveryDays": 2,
      "deliveryCost": 50,
      "status": "WINNING",
      "createdAt": "2025-11-07T15:30:00Z",
      "seller": {
        "id": "seller-uuid",
        "fullName": "Mohamed Ali",
        "avatar": "avatar-url",
        "rating": 4.9,
        "totalReviews": 150
      },
      "item": {
        "id": "item-uuid",
        "title": "iPhone 14 Pro Max",
        "images": ["..."],
        "condition": "LIKE_NEW"
      }
    }
  ]
}
```

---

### 3. Get My Bids

**Endpoint:** `GET /api/v1/reverse-auctions/bids/my-bids`
**Auth:** Required (Seller)
**Description:** View all your bids

**Query Parameters:**
- `status` (optional): Filter by bid status
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bids retrieved successfully",
  "data": {
    "items": [
      {
        "id": "bid-uuid",
        "bidAmount": 21500,
        "status": "WINNING",
        "createdAt": "2025-11-07T15:30:00Z",
        "reverseAuction": {
          "id": "auction-uuid",
          "title": "iPhone 14 Pro Max 256GB",
          "status": "ACTIVE",
          "endDate": "2025-11-14T23:59:59Z",
          "buyer": {
            "id": "buyer-uuid",
            "fullName": "Ahmed Hassan",
            "avatar": "avatar-url",
            "rating": 4.8
          },
          "category": {...}
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

---

### 4. Update Bid

**Endpoint:** `PATCH /api/v1/reverse-auctions/bids/:bidId`
**Auth:** Required (Seller who created the bid)
**Description:** Update your bid (only if auction still ACTIVE)

**Request Body (all fields optional):**
```json
{
  "bidAmount": 21000,
  "itemDescription": "Updated description",
  "itemImages": ["new-images"],
  "deliveryOption": "DELIVERY",
  "deliveryDays": 1,
  "deliveryCost": 100,
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bid updated successfully",
  "data": {
    "id": "bid-uuid",
    ...updated fields...,
    "previousBid": 21500
  }
}
```

**Note:** If `bidAmount` is updated, new amount must be lower than current.

---

### 5. Withdraw Bid

**Endpoint:** `POST /api/v1/reverse-auctions/bids/:bidId/withdraw`
**Auth:** Required (Seller who created the bid)
**Description:** Withdraw your bid

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bid withdrawn successfully",
  "data": {
    "id": "bid-uuid",
    "status": "WITHDRAWN",
    ...
  }
}
```

**Note:** Cannot withdraw winning bids.

---

## 🏆 Award & Complete

### 1. Award Auction

**Endpoint:** `POST /api/v1/reverse-auctions/:id/award`
**Auth:** Required (Buyer who created the auction)
**Description:** Select winning bid

**Request Body:**
```json
{
  "bidId": "bid-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Auction awarded successfully",
  "data": {
    "id": "auction-uuid",
    "status": "AWARDED",
    "winnerId": "seller-uuid",
    "winningBidId": "bid-uuid",
    "awardedAt": "2025-11-08T10:00:00Z",
    "buyer": {...},
    "winningBid": {
      "id": "bid-uuid",
      "bidAmount": 21500,
      "status": "WON",
      "seller": {
        "id": "seller-uuid",
        "fullName": "Mohamed Ali",
        "email": "mohamed@example.com",
        "phone": "+201234567890",
        ...
      }
    }
  }
}
```

**Business Logic:**
- Auction status → `AWARDED`
- Winning bid status → `WON`
- All other bids status → `LOST`

---

### 2. Complete Auction

**Endpoint:** `POST /api/v1/reverse-auctions/:id/complete`
**Auth:** Required (Buyer or Winner)
**Description:** Mark auction as completed

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Auction marked as completed",
  "data": {
    "id": "auction-uuid",
    "status": "COMPLETED",
    "completedAt": "2025-11-10T12:00:00Z",
    ...
  }
}
```

---

## 🎯 Real-World Scenarios

### Scenario 1: Buyer Finds Best Price

**Step 1: Buyer Creates Request**
```bash
POST /api/v1/reverse-auctions
{
  "title": "MacBook Pro M2 14-inch",
  "description": "Looking for MacBook Pro M2 14-inch, 16GB RAM, 512GB SSD",
  "condition": "LIKE_NEW",
  "maxBudget": 45000,
  "targetPrice": 40000,
  "endDate": "2025-11-14T23:59:59Z"
}
```

**Step 2: Sellers Submit Bids**
- Seller A: 42,000 EGP (WINNING)
- Seller B: 41,500 EGP (WINNING, Seller A → OUTBID)
- Seller C: 40,500 EGP (WINNING, Seller B → OUTBID)

**Step 3: Buyer Reviews Bids**
```bash
GET /api/v1/reverse-auctions/:id
```
Views all bids, checks seller ratings, delivery terms

**Step 4: Buyer Awards Winner**
```bash
POST /api/v1/reverse-auctions/:id/award
{
  "bidId": "seller-c-bid-uuid"
}
```

**Step 5: Transaction Completed**
```bash
POST /api/v1/reverse-auctions/:id/complete
```

**Result:** Buyer saved 4,500 EGP (10%) from max budget!

---

### Scenario 2: Seller Wins Contract

**Step 1: Seller Browses Opportunities**
```bash
GET /api/v1/reverse-auctions?categoryId=electronics&maxBudget=50000
```

**Step 2: Seller Finds Match**
Sees auction for item they have in stock

**Step 3: Seller Submits Competitive Bid**
```bash
POST /api/v1/reverse-auctions/:id/bids
{
  "bidAmount": 38000,
  "itemId": "my-item-uuid",
  "itemCondition": "NEW",
  "deliveryOption": "DELIVERY",
  "deliveryDays": 1,
  "deliveryCost": 0
}
```

**Step 4: Seller Monitors Status**
```bash
GET /api/v1/reverse-auctions/bids/my-bids
```

**Step 5: Seller Updates Bid (if needed)**
```bash
PATCH /api/v1/reverse-auctions/bids/:bidId
{
  "bidAmount": 37500
}
```

**Step 6: Seller Wins!**
Receives notification, auction status → WON

**Result:** Seller made a sale at competitive price!

---

## ⚙️ Auto-Expiration Logic

The system automatically handles auction expiration:

**Cron Job / Scheduled Task:**
```typescript
import { autoExpireAuctions } from './services/reverse-auction.service';

// Run every 5 minutes
setInterval(async () => {
  const expired = await autoExpireAuctions();
  console.log(`Auto-expired ${expired} auctions`);
}, 5 * 60 * 1000);
```

**Logic:**
1. Find all `ACTIVE` auctions where `endDate <= now`
2. For each auction:
   - If has bids → status = `ENDED`
   - If no bids → status = `EXPIRED`
3. Update all active bids to allow buyer time to review

---

## 📏 Business Rules

### Auction Creation
- ✅ Title: 5-200 characters
- ✅ Description: 20-2000 characters
- ✅ End date: 1-90 days from now
- ✅ Max budget: Optional, max 10M EGP
- ✅ Target price ≤ Max budget

### Bidding Rules
- ✅ Must be lower than previous bid
- ✅ Cannot bid on own auction
- ✅ Cannot bid after auction ends
- ✅ Bid amount ≤ buyer's max budget
- ✅ Must provide item condition
- ✅ Can rebid (lower price only)

### Award Rules
- ✅ Only buyer can award
- ✅ Can award while ACTIVE or ENDED
- ✅ Cannot award CANCELLED or EXPIRED
- ✅ Selected bid must not be WITHDRAWN

---

## 🚨 Error Handling

### Common Errors

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Reverse auction not found"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "Only the buyer can cancel this auction"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "message": "Bid amount must be lower than your previous bid"
  }
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title must be at least 5 characters"
      },
      {
        "field": "endDate",
        "message": "End date must be in the future"
      }
    ]
  }
}
```

---

## 💡 Best Practices

### For Buyers

1. **Clear Descriptions**: Provide detailed requirements
2. **Realistic Budget**: Set fair max budget
3. **Adequate Time**: Give sellers 3-7 days to bid
4. **Check Ratings**: Review seller ratings before awarding
5. **Communication**: Use publicNotes to clarify expectations

### For Sellers

1. **Competitive Pricing**: Start with reasonable bid
2. **Quality Photos**: Include clear, detailed images
3. **Accurate Descriptions**: Be honest about condition
4. **Fast Response**: Submit bids early
5. **Build Trust**: Maintain high rating

---

## 📊 Performance Considerations

### Indexing
All key fields are indexed for fast queries:
- `buyerId`, `categoryId`, `status`
- `lowestBid`, `endDate`
- `sellerId`, `bidAmount`

### Pagination
- Default: 20 items per page
- Max: 100 items per page
- Use `page` and `limit` for large datasets

### Caching (Future)
Consider caching:
- Active auctions list
- Category statistics
- User bid counts

---

## 🔒 Security

### Authorization
- Buyers can only edit/cancel their own auctions
- Sellers can only edit/withdraw their own bids
- Private notes (`buyerNotes`) only visible to auction creator

### Validation
- All inputs validated with Zod schemas
- SQL injection prevented by Prisma
- Rate limiting applied to all endpoints

### Audit Trail
- All bids include IP address and user agent
- Timestamps tracked for all actions
- Previous bid amounts stored for history

---

## 🎉 Summary

The Reverse Auction System provides:
- ✅ Complete buyer workflow (create, update, award)
- ✅ Complete seller workflow (browse, bid, update, withdraw)
- ✅ Auto-expiration logic
- ✅ Smart bid status management
- ✅ Comprehensive statistics
- ✅ Full validation and error handling
- ✅ **14 production-ready endpoints**

### Total API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reverse-auctions` | List all auctions |
| GET | `/api/v1/reverse-auctions/:id` | Get auction details |
| GET | `/api/v1/reverse-auctions/:id/bids` | Get auction bids |
| GET | `/api/v1/reverse-auctions/stats` | Get statistics |
| GET | `/api/v1/reverse-auctions/bids/my-bids` | Get my bids |
| POST | `/api/v1/reverse-auctions` | Create auction |
| POST | `/api/v1/reverse-auctions/:id/bids` | Submit bid |
| POST | `/api/v1/reverse-auctions/:id/cancel` | Cancel auction |
| POST | `/api/v1/reverse-auctions/:id/award` | Award winner |
| POST | `/api/v1/reverse-auctions/:id/complete` | Complete auction |
| POST | `/api/v1/reverse-auctions/bids/:bidId/withdraw` | Withdraw bid |
| PATCH | `/api/v1/reverse-auctions/:id` | Update auction |
| PATCH | `/api/v1/reverse-auctions/bids/:bidId` | Update bid |
| DELETE | `/api/v1/reverse-auctions/:id` | Delete auction |

**Status:** 🟢 **PRODUCTION-READY**

---

**Built for Xchange E-commerce Platform**
**Version:** 1.0.0
**Last Updated:** November 7, 2025
