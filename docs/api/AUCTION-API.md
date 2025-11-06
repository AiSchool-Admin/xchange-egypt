# Auction System API Documentation

Complete API documentation for the Xchange Auction System.

---

## Overview

The Auction System allows sellers to create time-limited auctions for their items. Bidders can place bids, and the highest bidder wins when the auction ends. The system includes:

- **Real-time bidding** - Place bids during active auctions
- **Auto-bidding** (Proxy bidding) - Set maximum bid and let the system bid for you
- **Buy Now** option - Instant purchase at fixed price
- **Auto-extension** - Auction extends automatically if bid placed near end
- **Reserve price** - Minimum price seller will accept

---

## Base URL

```
Production: https://api.xchange.eg/api/v1
Development: http://localhost:3000/api/v1
```

---

## Authentication

Most endpoints require authentication using JWT tokens.

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Create Auction

Create a new auction for an item.

**Endpoint:** `POST /auctions`

**Authentication:** Required

**Request Body:**
```json
{
  "itemId": "uuid",
  "startingPrice": 1000.00,
  "buyNowPrice": 5000.00,         // Optional
  "reservePrice": 3000.00,        // Optional
  "minBidIncrement": 50.00,       // Default: 1.0
  "startTime": "2025-01-20T10:00:00Z",
  "endTime": "2025-01-27T10:00:00Z",
  "autoExtend": true,             // Default: true
  "extensionMinutes": 5,          // Default: 5
  "extensionThreshold": 5,        // Default: 5 (minutes before end)
  "maxExtensions": 3              // Default: 3
}
```

**Validation Rules:**
- `startingPrice` must be positive
- `endTime` must be after `startTime`
- `startTime` must be in the future
- `reservePrice` >= `startingPrice` (if provided)
- `buyNowPrice` > `startingPrice` (if provided)
- Item must belong to authenticated user
- Item must not have an active listing

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Auction created successfully",
  "data": {
    "id": "auction-uuid",
    "listingId": "listing-uuid",
    "startingPrice": 1000.00,
    "currentPrice": 1000.00,
    "buyNowPrice": 5000.00,
    "reservePrice": 3000.00,
    "minBidIncrement": 50.00,
    "startTime": "2025-01-20T10:00:00Z",
    "endTime": "2025-01-27T10:00:00Z",
    "actualEndTime": null,
    "autoExtend": true,
    "extensionMinutes": 5,
    "extensionThreshold": 5,
    "timesExtended": 0,
    "maxExtensions": 3,
    "status": "SCHEDULED",
    "totalBids": 0,
    "uniqueBidders": 0,
    "views": 0,
    "winnerId": null,
    "winningBidId": null,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "listing": { ... },
    "bids": []
  }
}
```

**Auction Status:**
- `DRAFT` - Created but not published
- `SCHEDULED` - Published, waiting for start time
- `ACTIVE` - Currently accepting bids
- `ENDED` - Time expired, determining winner
- `CANCELLED` - Cancelled by seller (before bids)
- `COMPLETED` - Winner selected, transaction created

---

### 2. List Auctions

Get list of auctions with filters and pagination.

**Endpoint:** `GET /auctions`

**Authentication:** Not required

**Query Parameters:**
```
status          - DRAFT, SCHEDULED, ACTIVE, ENDED, CANCELLED, COMPLETED
categoryId      - Filter by category UUID
minPrice        - Minimum current price
maxPrice        - Maximum current price
sortBy          - price, endTime, bids, createdAt (default: createdAt)
sortOrder       - asc, desc (default: desc)
page            - Page number (default: 1)
limit           - Items per page (default: 20, max: 100)
```

**Example Request:**
```
GET /auctions?status=ACTIVE&categoryId=cat-uuid&minPrice=500&maxPrice=5000&sortBy=endTime&sortOrder=asc&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Auctions retrieved successfully",
  "data": {
    "auctions": [
      {
        "id": "auction-uuid",
        "currentPrice": 1500.00,
        "buyNowPrice": 5000.00,
        "startTime": "2025-01-20T10:00:00Z",
        "endTime": "2025-01-27T10:00:00Z",
        "status": "ACTIVE",
        "totalBids": 5,
        "uniqueBidders": 3,
        "views": 150,
        "listing": {
          "item": {
            "id": "item-uuid",
            "title": "iPhone 14 Pro Max",
            "images": ["url1", "url2"],
            "category": {
              "id": "cat-uuid",
              "nameEn": "Mobile Phones",
              "nameAr": "الهواتف المحمولة"
            },
            "seller": {
              "id": "user-uuid",
              "fullName": "Ahmed Mohamed",
              "rating": 4.8,
              "totalReviews": 25
            }
          }
        },
        "bids": [
          {
            "id": "bid-uuid",
            "bidAmount": 1500.00,
            "createdAt": "2025-01-21T14:30:00Z",
            "bidder": {
              "id": "bidder-uuid",
              "fullName": "Fatma Ali"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

### 3. Get Auction by ID

Get detailed information about a specific auction.

**Endpoint:** `GET /auctions/:id`

**Authentication:** Not required (but affects what data is shown)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Auction retrieved successfully",
  "data": {
    "id": "auction-uuid",
    "listingId": "listing-uuid",
    "startingPrice": 1000.00,
    "currentPrice": 1500.00,
    "buyNowPrice": 5000.00,
    "reservePrice": 3000.00,
    "minBidIncrement": 50.00,
    "startTime": "2025-01-20T10:00:00Z",
    "endTime": "2025-01-27T10:00:00Z",
    "autoExtend": true,
    "extensionMinutes": 5,
    "timesExtended": 1,
    "maxExtensions": 3,
    "status": "ACTIVE",
    "totalBids": 5,
    "uniqueBidders": 3,
    "views": 151,
    "listing": {
      "id": "listing-uuid",
      "item": {
        "id": "item-uuid",
        "title": "iPhone 14 Pro Max",
        "description": "Brand new, sealed box",
        "condition": "NEW",
        "images": ["url1", "url2", "url3"],
        "location": "Cairo",
        "category": {
          "id": "cat-uuid",
          "nameEn": "Mobile Phones",
          "nameAr": "الهواتف المحمولة"
        },
        "seller": {
          "id": "user-uuid",
          "fullName": "Ahmed Mohamed",
          "avatar": "avatar-url",
          "rating": 4.8,
          "totalReviews": 25,
          "governorate": "Cairo"
        }
      }
    },
    "bids": [
      {
        "id": "bid-uuid",
        "bidAmount": 1500.00,
        "isAutoBid": true,
        "maxAutoBid": null,        // Hidden for other users
        "status": "WINNING",
        "createdAt": "2025-01-21T14:30:00Z",
        "bidder": {
          "id": "bidder-uuid",
          "fullName": "Fatma Ali"
        }
      }
    ],
    "winningBid": null
  }
}
```

**Note:** `maxAutoBid` is only visible to the bidder who placed the bid.

---

### 4. Place Bid

Place a bid on an active auction.

**Endpoint:** `POST /auctions/:id/bids`

**Authentication:** Required

**Request Body:**
```json
{
  "bidAmount": 1550.00,
  "maxAutoBid": 2500.00      // Optional - for auto-bidding
}
```

**How Auto-Bidding Works:**
1. You set your maximum bid (e.g., 2500 EGP)
2. System bids the minimum amount needed to win (current price + increment)
3. If someone outbids you, system automatically bids again (up to your max)
4. Saves you from constantly monitoring the auction

**Example with Auto-Bid:**
```json
{
  "bidAmount": 1550.00,      // Your initial bid
  "maxAutoBid": 2500.00      // Maximum you're willing to pay
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "id": "bid-uuid",
    "auctionId": "auction-uuid",
    "listingId": "listing-uuid",
    "bidderId": "user-uuid",
    "bidAmount": 1550.00,
    "previousBid": 1450.00,
    "isAutoBid": true,
    "maxAutoBid": 2500.00,
    "status": "WINNING",
    "createdAt": "2025-01-21T15:00:00Z",
    "bidder": {
      "id": "user-uuid",
      "fullName": "Your Name"
    }
  }
}
```

**Validation Rules:**
- Auction must be ACTIVE
- Current time must be between startTime and endTime
- Cannot bid on your own auction
- Bid must be >= currentPrice + minBidIncrement
- If maxAutoBid provided, must be >= bidAmount

**Auto-Extension:**
If bid is placed within `extensionThreshold` minutes of end time:
- Auction endTime extends by `extensionMinutes`
- Can extend up to `maxExtensions` times
- Prevents last-second sniping

**Error Responses:**
- `400` - Auction not active, bid too low, invalid amount
- `403` - Cannot bid on own auction
- `404` - Auction not found

---

### 5. Buy Now

Purchase item instantly at buy now price.

**Endpoint:** `POST /auctions/:id/buy-now`

**Authentication:** Required

**Request Body:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item purchased successfully via buy now",
  "data": {
    "auction": {
      "id": "auction-uuid",
      "status": "COMPLETED",
      "winnerId": "user-uuid",
      "actualEndTime": "2025-01-21T15:10:00Z"
    },
    "winningBid": {
      "id": "bid-uuid",
      "bidAmount": 5000.00,
      "status": "WON"
    },
    "transaction": {
      "id": "transaction-uuid",
      "amount": 5000.00,
      "paymentStatus": "PENDING",
      "deliveryStatus": "PENDING",
      "createdAt": "2025-01-21T15:10:00Z"
    }
  }
}
```

**What Happens:**
1. Auction immediately ends (status → COMPLETED)
2. You become the winner
3. Item status → SOLD
4. Transaction created for payment
5. All other bids marked as LOST

**Validation Rules:**
- Auction must have buyNowPrice set
- Auction must be ACTIVE
- Cannot buy your own item
- Immediately completes the auction

---

### 6. Get Auction Bids

Get all bids for a specific auction.

**Endpoint:** `GET /auctions/:id/bids`

**Authentication:** Not required

**Query Parameters:**
```
page   - Page number (default: 1)
limit  - Items per page (default: 50, max: 200)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Auction bids retrieved successfully",
  "data": {
    "bids": [
      {
        "id": "bid-uuid",
        "bidAmount": 1550.00,
        "previousBid": 1450.00,
        "isAutoBid": true,
        "maxAutoBid": null,        // Hidden
        "status": "WINNING",
        "createdAt": "2025-01-21T15:00:00Z",
        "bidder": {
          "id": "bidder-uuid",
          "fullName": "Fatma Ali",
          "rating": 4.5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "pages": 1
    }
  }
}
```

**Bid Status:**
- `ACTIVE` - Bid is valid but not winning
- `OUTBID` - Was winning but got outbid
- `WINNING` - Currently winning the auction
- `WON` - Won the auction
- `LOST` - Lost the auction
- `CANCELLED` - Bid cancelled

---

### 7. Update Auction

Update auction details (limited fields, before auction starts or has bids).

**Endpoint:** `PATCH /auctions/:id`

**Authentication:** Required (Seller only)

**Request Body:**
```json
{
  "buyNowPrice": 4500.00,
  "reservePrice": 2500.00,
  "endTime": "2025-01-28T10:00:00Z",
  "autoExtend": false,
  "extensionMinutes": 10,
  "maxExtensions": 5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Auction updated successfully",
  "data": { ... }
}
```

**Validation Rules:**
- Can only update your own auctions
- Cannot update after bids are placed (if ACTIVE)
- Can update DRAFT or SCHEDULED auctions freely

---

### 8. Cancel Auction

Cancel an auction (before any bids are placed).

**Endpoint:** `DELETE /auctions/:id`

**Authentication:** Required (Seller only)

**Request Body:**
```json
{
  "reason": "Item no longer available"    // Optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Auction cancelled successfully",
  "data": {
    "message": "Auction cancelled successfully",
    "reason": "Item no longer available"
  }
}
```

**Validation Rules:**
- Can only cancel your own auctions
- Cannot cancel if status is COMPLETED or ENDED
- Cannot cancel if totalBids > 0

---

### 9. Get My Auctions

Get all auctions created by authenticated user.

**Endpoint:** `GET /auctions/my/auctions`

**Authentication:** Required

**Query Parameters:**
```
status - Filter by status (optional)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "My auctions retrieved successfully",
  "data": [
    {
      "id": "auction-uuid",
      "status": "ACTIVE",
      "currentPrice": 1500.00,
      "totalBids": 5,
      "uniqueBidders": 3,
      "listing": { ... }
    }
  ]
}
```

---

### 10. Get My Bids

Get all bids placed by authenticated user, grouped by auction.

**Endpoint:** `GET /auctions/my/bids`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "My bids retrieved successfully",
  "data": [
    {
      "auction": {
        "id": "auction-uuid",
        "currentPrice": 1550.00,
        "status": "ACTIVE",
        "listing": {
          "item": {
            "title": "iPhone 14 Pro Max",
            "images": ["url"]
          }
        }
      },
      "bids": [
        {
          "id": "bid-1",
          "bidAmount": 1500.00,
          "status": "OUTBID",
          "createdAt": "2025-01-21T14:00:00Z"
        },
        {
          "id": "bid-2",
          "bidAmount": 1550.00,
          "status": "WINNING",
          "maxAutoBid": 2500.00,     // Your own max bid is visible
          "createdAt": "2025-01-21T15:00:00Z"
        }
      ],
      "latestBid": { ... },
      "totalBids": 2
    }
  ]
}
```

---

### 11. End Auction (Admin)

Manually end an auction (usually done by scheduled job).

**Endpoint:** `POST /auctions/:id/end`

**Authentication:** Required (Admin only)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Auction ended successfully",
  "data": {
    "message": "Auction completed successfully",
    "hasWinner": true,
    "winner": {
      "id": "bid-uuid",
      "bidAmount": 3200.00,
      "bidderId": "winner-uuid",
      "status": "WON"
    },
    "transaction": {
      "id": "transaction-uuid",
      "amount": 3200.00,
      "buyerId": "winner-uuid",
      "sellerId": "seller-uuid"
    }
  }
}
```

**Scenarios:**

**With Winner (Reserve Met):**
```json
{
  "message": "Auction completed successfully",
  "hasWinner": true,
  "winner": { ... },
  "transaction": { ... }
}
```

**No Winner (Reserve Not Met):**
```json
{
  "message": "Auction ended - reserve price not met",
  "hasWinner": false
}
```

**No Winner (No Bids):**
```json
{
  "message": "Auction ended - no bids received",
  "hasWinner": false
}
```

---

## Auction Workflow

### Seller's Journey:

1. **Create Auction** - Set starting price, duration, options
2. **Auction Goes Live** - At startTime, status → ACTIVE
3. **Monitor Bids** - Watch bids come in
4. **Auction Ends** - At endTime (or extended time)
5. **Winner Selected** - Highest bid wins (if reserve met)
6. **Transaction Created** - Buyer and seller connected

### Bidder's Journey:

1. **Browse Auctions** - Find interesting auctions
2. **Place Bid** - Bid amount or set max auto-bid
3. **Monitor Status** - Check if still winning
4. **Auto-Bidding** - System bids for you automatically
5. **Win Auction** - Become highest bidder at end
6. **Complete Transaction** - Pay and receive item

---

## Best Practices

### For Sellers:

1. **Set Realistic Starting Price** - Too high discourages bids
2. **Use Reserve Price** - Protects you from selling too cheap
3. **Enable Auto-Extension** - Prevents last-second sniping
4. **Offer Buy Now** - Gives buyers option to end early
5. **Good Photos** - Attract more bidders

### For Bidders:

1. **Use Auto-Bidding** - Don't watch auction 24/7
2. **Set Maximum Truthfully** - System won't exceed it
3. **Bid Early** - Shows interest, may trigger auto-extensions
4. **Check Seller Rating** - Verify seller reliability
5. **Read Description** - Understand item condition

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

**Common Error Codes:**

- `400 Bad Request` - Invalid input, validation failed
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not authorized for this action
- `404 Not Found` - Auction not found
- `409 Conflict` - Cannot perform action (e.g., auction has bids)
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- API calls are rate-limited per IP address
- Default: 100 requests per 15 minutes
- Exceeded limits return `429 Too Many Requests`

---

## Webhooks (Future)

Planned webhook events:

- `auction.created`
- `auction.started`
- `bid.placed`
- `auction.extended`
- `auction.ended`
- `auction.completed`

---

## Testing

### Test Credentials:

```
Seller:
Email: ahmed.mohamed@example.com
Password: Password123!

Bidder 1:
Email: fatma.ali@example.com
Password: Password123!

Bidder 2:
Email: khaled.hassan@example.com
Password: Password123!
```

### Postman Collection:

[Download Postman Collection](./postman/xchange-auctions.json)

---

## Support

For API support or questions:

- **Documentation:** https://docs.xchange.eg
- **Email:** api-support@xchange.eg
- **GitHub Issues:** https://github.com/xchange/api/issues

---

**Last Updated:** January 2025

**API Version:** 1.0.0
