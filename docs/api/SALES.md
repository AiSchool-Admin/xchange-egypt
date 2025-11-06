# Direct Sales System API Documentation

Complete API documentation for the Direct Sales System (Listings and Transactions) in the Xchange platform.

## Overview

The Direct Sales System enables users to list items for sale at fixed prices and complete purchase transactions with order management and tracking capabilities.

## Table of Contents

**Listings:**
- [Create Sale Listing](#create-sale-listing)
- [Search Listings](#search-listings)
- [Get Listing by ID](#get-listing-by-id)
- [Update Listing](#update-listing)
- [Listing Status Management](#listing-status-management)

**Transactions:**
- [Create Purchase](#create-purchase)
- [Get Transaction](#get-transaction)
- [Transaction Status Flow](#transaction-status-flow)
- [Payment & Shipping](#payment--shipping)

---

## Listing Status Values

- `DRAFT` - Listing is being prepared
- `ACTIVE` - Listing is live and accepting orders
- `SOLD` - All quantity sold
- `EXPIRED` - Listing expired
- `CANCELLED` - Cancelled by seller

## Transaction Status Values

- `PENDING` - Order created, awaiting confirmation
- `CONFIRMED` - Seller confirmed the order
- `PAYMENT_PENDING` - Waiting for payment
- `PAID` - Payment received
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled
- `REFUNDED` - Order refunded

## Payment Methods

- `CASH_ON_DELIVERY` - Pay when receiving
- `BANK_TRANSFER` - Bank transfer
- `MOBILE_WALLET` - Mobile payment (Vodafone Cash, Orange Money, etc.)
- `CREDIT_CARD` - Credit/Debit card (future integration)

---

# Listings API

## Create Sale Listing

Create a direct sale listing for an item.

**Endpoint:** `POST /api/v1/listings/sale`

**Authentication:** Required

**Request Body:**
```json
{
  "itemId": "uuid",
  "price": 5000,
  "quantity": 1,
  "startDate": "2025-01-15T10:00:00Z",
  "endDate": "2025-02-15T10:00:00Z",
  "notes": "Available for immediate delivery"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "listing-uuid",
    "itemId": "item-uuid",
    "type": "SALE",
    "status": "ACTIVE",
    "price": 5000,
    "quantity": 1,
    "startDate": "2025-01-15T10:00:00Z",
    "endDate": "2025-02-15T10:00:00Z",
    "notes": "Available for immediate delivery",
    "item": {
      "id": "item-uuid",
      "titleAr": "لابتوب ديل",
      "images": ["/uploads/items/..."],
      "seller": {...},
      "category": {...}
    }
  }
}
```

---

## Search Listings

Search active listings with filters.

**Endpoint:** `GET /api/v1/listings/search`

**Query Parameters:**
- `search` - Search term
- `categoryId` - Filter by category
- `minPrice`, `maxPrice` - Price range
- `governorate` - Location filter
- `status` - Listing status (default: ACTIVE)
- `page`, `limit` - Pagination
- `sortBy` - createdAt | price | endDate
- `sortOrder` - asc | desc

**Example:**
```bash
GET /api/v1/listings/search?minPrice=1000&maxPrice=10000&governorate=Cairo&sortBy=price
```

---

## Update Listing

Update listing details.

**Endpoint:** `PUT /api/v1/listings/:id`

**Authentication:** Required (owner only)

**Request Body:**
```json
{
  "price": 4500,
  "quantity": 2,
  "endDate": "2025-03-01T10:00:00Z"
}
```

---

## Listing Status Management

### Activate Listing
**POST** `/api/v1/listings/:id/activate`

### Cancel Listing
**POST** `/api/v1/listings/:id/cancel`

### Mark as Sold
**POST** `/api/v1/listings/:id/sold`

---

# Transactions API

## Create Purchase

Create a purchase order for a listing.

**Endpoint:** `POST /api/v1/transactions/purchase`

**Authentication:** Required

**Request Body:**
```json
{
  "listingId": "listing-uuid",
  "quantity": 1,
  "paymentMethod": "CASH_ON_DELIVERY",
  "shippingAddress": "123 Street, Nasr City, Cairo",
  "notes": "Please call before delivery"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "listingId": "listing-uuid",
    "buyerId": "buyer-uuid",
    "sellerId": "seller-uuid",
    "quantity": 1,
    "unitPrice": 5000,
    "totalAmount": 5000,
    "paymentMethod": "CASH_ON_DELIVERY",
    "shippingAddress": "123 Street, Nasr City, Cairo",
    "status": "PENDING",
    "buyer": {...},
    "seller": {...},
    "item": {...}
  }
}
```

---

## Get Transaction

Get transaction details.

**Endpoint:** `GET /api/v1/transactions/:id`

**Authentication:** Required (buyer or seller only)

---

## Get My Transactions

Get all transactions for authenticated user.

**Endpoint:** `GET /api/v1/transactions/my`

**Query Parameters:**
- `role` - buyer | seller (filter by role)
- `status` - Transaction status
- `page`, `limit` - Pagination

---

## Transaction Status Flow

### Update Status
**PUT** `/api/v1/transactions/:id/status`

**Allowed Transitions:**
1. PENDING → CONFIRMED (seller confirms)
2. CONFIRMED → PAYMENT_PENDING or PAID
3. PAID → SHIPPED (seller ships)
4. SHIPPED → DELIVERED
5. Any early status → CANCELLED

---

## Payment & Shipping

### Confirm Payment
**POST** `/api/v1/transactions/:id/confirm-payment`

Buyer confirms payment made.

**Request Body:**
```json
{
  "paymentReference": "TRX123456789"
}
```

### Mark as Shipped
**POST** `/api/v1/transactions/:id/ship`

Seller marks order as shipped.

**Request Body:**
```json
{
  "trackingNumber": "TRACK123456"
}
```

### Mark as Delivered
**POST** `/api/v1/transactions/:id/deliver`

Either party confirms delivery.

### Cancel Transaction
**POST** `/api/v1/transactions/:id/cancel`

Cancel transaction with reason.

**Request Body:**
```json
{
  "reason": "Item no longer available"
}
```

---

## Complete Purchase Flow Example

```
1. Buyer: POST /transactions/purchase
   → Status: PENDING

2. Seller: PUT /transactions/:id/status {status: "CONFIRMED"}
   → Status: CONFIRMED

3. Buyer: POST /transactions/:id/confirm-payment
   → Status: PAID

4. Seller: POST /transactions/:id/ship {trackingNumber: "..."}
   → Status: SHIPPED

5. Buyer: POST /transactions/:id/deliver
   → Status: DELIVERED
   → Listing quantity updated
   → Item quantity decremented
```

---

## Business Rules

**Listings:**
- One active listing per item at a time
- Listing quantity cannot exceed item quantity
- Cannot delete listings with active transactions
- Sold listings cannot be modified

**Transactions:**
- Buyers cannot purchase their own items
- Quantity must be available in listing
- Status transitions are validated
- Delivered transactions update inventory automatically
- Cancelled transactions can be refunded (future feature)

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "message": "Listing quantity exceeds item quantity"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "You can only update your own listings"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Listing not found"
  }
}
```

---

## Next Steps

- Payment gateway integration
- Real-time notifications
- Dispute resolution system
- Review and rating system
- Shipping partner integration

For questions or issues, contact the development team.
