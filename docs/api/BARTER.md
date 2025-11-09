# Barter System API Documentation

Complete API documentation for the Barter Trading System in the Xchange platform.

## Overview

The Barter System enables users to exchange items directly without money. Features include 2-party barter matching, counter-offer negotiations, and smart matching algorithms to find compatible trade opportunities.

## Table of Contents

- [Barter Offer Statuses](#barter-offer-statuses)
- [Create Barter Offer](#create-barter-offer)
- [Offer Management](#offer-management)
- [Counter Offers](#counter-offers)
- [Matching Algorithm](#matching-algorithm)
- [Complete Exchange](#complete-exchange)

---

## Barter Offer Statuses

- `PENDING` - Offer sent, awaiting response
- `ACCEPTED` - Offer accepted, ready for exchange
- `REJECTED` - Offer rejected by recipient
- `COUNTER_OFFERED` - Recipient countered with different item
- `COMPLETED` - Exchange completed
- `CANCELLED` - Cancelled by initiator
- `EXPIRED` - Offer expired (default 7 days)

---

## Create Barter Offer

Create a barter offer to exchange your item for someone else's item.

**Endpoint:** `POST /api/v1/barter/offers`

**Authentication:** Required

**Request Body:**
```json
{
  "offeredItemId": "your-item-uuid",
  "requestedItemId": "their-item-uuid",
  "notes": "I'm interested in exchanging my laptop for your camera",
  "expiresAt": "2025-01-22T10:00:00Z"
}
```

**Validations:**
- Both items must exist
- You must own the offered item
- Cannot barter with yourself
- Items cannot have active sale listings
- Cannot offer and request the same item
- No existing pending offers between same items

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "offer-uuid",
    "initiatorId": "your-user-id",
    "recipientId": "their-user-id",
    "offeredItemId": "your-item-uuid",
    "requestedItemId": "their-item-uuid",
    "status": "PENDING",
    "notes": "I'm interested in exchanging...",
    "expiresAt": "2025-01-22T10:00:00Z",
    "initiator": {...},
    "recipient": {...},
    "offeredItem": {...},
    "requestedItem": {...}
  }
}
```

---

## Offer Management

### Get My Barter Offers

**GET** `/api/v1/barter/offers/my`

**Query Parameters:**
- `type` - sent | received | all (default: all)
- `status` - Filter by status
- `page`, `limit` - Pagination

**Example:**
```bash
GET /api/v1/barter/offers/my?type=received&status=PENDING
```

### Get Offer by ID

**GET** `/api/v1/barter/offers/:offerId`

Only initiator or recipient can view.

### Accept Offer

**POST** `/api/v1/barter/offers/:offerId/accept`

Recipient accepts the barter offer.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "offer-uuid",
    "status": "ACCEPTED",
    ...
  }
}
```

### Reject Offer

**POST** `/api/v1/barter/offers/:offerId/reject`

Recipient rejects the offer with optional reason.

**Request Body:**
```json
{
  "reason": "I'm looking for a different item"
}
```

### Cancel Offer

**POST** `/api/v1/barter/offers/:offerId/cancel`

Initiator cancels the offer (before acceptance).

---

## Counter Offers

Recipient can counter with a different item instead of the one requested.

**Endpoint:** `POST /api/v1/barter/offers/:offerId/counter`

**Request Body:**
```json
{
  "counterOfferItemId": "different-item-uuid",
  "notes": "How about my tablet instead?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "offer-uuid",
    "status": "COUNTER_OFFERED",
    "counterOfferItemId": "different-item-uuid",
    "counterOfferItem": {...},
    ...
  }
}
```

**Counter Offer Flow:**
1. Recipient counters with different item
2. Original initiator can:
   - Accept the counter offer
   - Reject the counter offer
   - Counter again with yet another item

---

## Matching Algorithm

### Search Barterable Items

Find items available for barter (no active sale listings).

**Endpoint:** `GET /api/v1/barter/items`

**Query Parameters:**
- `search` - Search term
- `categoryId` - Filter by category
- `condition` - Item condition
- `governorate` - Location
- `excludeMyItems` - Exclude own items (default: true)
- `page`, `limit` - Pagination

**Example:**
```bash
GET /api/v1/barter/items?categoryId=electronics&condition=EXCELLENT&governorate=Cairo
```

### Find Barter Matches

Find potential 2-party barter matches for your item.

**Endpoint:** `GET /api/v1/barter/matches/:itemId`

**Authentication:** Required

**Query Parameters:**
- `categoryId` - Target category (default: same as your item)
- `maxDistance` - Max distance in km (future feature)

**Algorithm:**
The matching algorithm finds:
1. Users who have items in your desired category
2. Who also have items in your item's category (potential interest)
3. Excludes items with active sale listings
4. Returns up to 20 best matches

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-uuid",
      "titleAr": "كاميرا كانون",
      "titleEn": "Canon Camera",
      "condition": "EXCELLENT",
      "images": [...],
      "seller": {
        "id": "seller-uuid",
        "fullName": "Mohamed Ali",
        "avatar": "...",
        "items": [
          // Other items this user has
        ]
      },
      "category": {...}
    }
  ]
}
```

---

## Complete Exchange

Mark barter exchange as completed after physical exchange.

**Endpoint:** `POST /api/v1/barter/offers/:offerId/complete`

**Authentication:** Required (either party)

**Request Body:**
```json
{
  "confirmationNotes": "Items exchanged successfully in Nasr City"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "offer-uuid",
    "status": "COMPLETED",
    ...
  }
}
```

---

## Complete Barter Flow Example

**Simple 2-Party Barter:**

```
1. User A creates offer:
   POST /barter/offers
   {
     "offeredItemId": "laptop-uuid",
     "requestedItemId": "camera-uuid"
   }
   → Status: PENDING

2. User B accepts:
   POST /barter/offers/:id/accept
   → Status: ACCEPTED

3. After physical exchange, either party confirms:
   POST /barter/offers/:id/complete
   → Status: COMPLETED
```

**With Counter Offer:**

```
1. User A offers laptop for camera:
   POST /barter/offers
   → Status: PENDING

2. User B counters with tablet instead:
   POST /barter/offers/:id/counter
   {
     "counterOfferItemId": "tablet-uuid"
   }
   → Status: COUNTER_OFFERED

3. User A accepts the counter:
   POST /barter/offers/:id/accept
   → Status: ACCEPTED

4. After exchange:
   POST /barter/offers/:id/complete
   → Status: COMPLETED
```

---

## Business Rules

**Item Eligibility:**
- Items must not have active sale listings
- Items must be owned by the trading parties
- Items must exist and be available

**Trading Rules:**
- Cannot barter with yourself
- Only one pending offer between same items
- Only recipient can accept/reject/counter
- Only initiator can cancel (before acceptance)
- Either party can mark as completed

**Status Transitions:**
- PENDING → ACCEPTED (by recipient)
- PENDING → REJECTED (by recipient)
- PENDING → COUNTER_OFFERED (by recipient)
- PENDING → CANCELLED (by initiator)
- PENDING → EXPIRED (automatic after expiry date)
- COUNTER_OFFERED → ACCEPTED (by original initiator)
- ACCEPTED → COMPLETED (by either party)

**Expiration:**
- Default: 7 days from creation
- Can be customized when creating offer
- Expired offers automatically change status
- Expired offers cannot be accepted

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "message": "Cannot barter items that have active sale listings"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "You can only offer your own items"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Barter offer not found"
  }
}
```

---

## Future Enhancements

**Multi-Party Barter (Planned):**
- Smart algorithm to find 3+ party circular trades
- Example: A wants what B has, B wants what C has, C wants what A has
- Complex matching algorithm with graph theory
- Automatic proposal generation

**Additional Features:**
- Barter value estimation
- Trust scores and ratings
- Escrow service for secure exchanges
- Location-based matching
- Category preference learning
- Barter history and statistics

---

## API Endpoints Summary

**Public:**
- `GET /api/v1/barter/items` - Search barterable items

**Protected:**
- `POST /api/v1/barter/offers` - Create offer
- `GET /api/v1/barter/offers/my` - Get my offers
- `GET /api/v1/barter/offers/:offerId` - Get offer details
- `POST /api/v1/barter/offers/:offerId/accept` - Accept offer
- `POST /api/v1/barter/offers/:offerId/reject` - Reject offer
- `POST /api/v1/barter/offers/:offerId/counter` - Counter offer
- `POST /api/v1/barter/offers/:offerId/cancel` - Cancel offer
- `POST /api/v1/barter/offers/:offerId/complete` - Complete exchange
- `GET /api/v1/barter/matches/:itemId` - Find matches

---

For questions or issues, contact the development team.
