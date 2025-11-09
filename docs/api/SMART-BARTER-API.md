# Smart Barter System API Documentation

**Version:** 1.0
**Last Updated:** January 2025

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Key Concepts](#key-concepts)
4. [API Endpoints](#api-endpoints)
   - [2-Party Barter (Simple)](#2-party-barter-simple)
   - [Multi-Party Barter (Smart)](#multi-party-barter-smart)
5. [Algorithms Explained](#algorithms-explained)
6. [Workflows](#workflows)
7. [Examples](#examples)
8. [Error Handling](#error-handling)

---

## Overview

The Smart Barter System is an **advanced multi-party trading platform** that enables:
- **Simple 2-Party Barter**: Direct item exchange between two users
- **Multi-Party Cycles**: Circular exchanges (A→B→C→A) where everyone gets what they want
- **Multi-Party Chains**: Linear exchanges (A→B→C→D) forming a value chain

### Unique Features ✨

- **AI-Powered Matching**: Graph algorithms detect optimal barter opportunities
- **Cycle Detection**: Automatically finds circular trading loops
- **Chain Detection**: Discovers linear trading sequences
- **Match Scoring**: Ranks opportunities by compatibility
- **Atomic Execution**: All-or-nothing transaction guarantees

---

## System Architecture

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Routes  │
    └────┬────┘
         │
    ┌────▼──────────┐
    │ Validation    │
    └────┬──────────┘
         │
    ┌────▼──────────┐
    │ Controllers   │
    └────┬──────────┘
         │
    ┌────▼──────────────────────┐
    │ Service Layer             │
    │ ┌──────────────────────┐  │
    │ │ barter.service.ts    │  │ ← 2-party barter
    │ └──────────────────────┘  │
    │ ┌──────────────────────┐  │
    │ │ barter-chain.service │  │ ← Multi-party management
    │ └──────────────────────┘  │
    │ ┌──────────────────────┐  │
    │ │ barter-matching.serv │  │ ← Smart algorithms
    │ └──────────────────────┘  │
    └────┬──────────────────────┘
         │
    ┌────▼────┐
    │ Prisma  │
    └────┬────┘
         │
    ┌────▼─────────┐
    │ PostgreSQL   │
    └──────────────┘
```

### Database Models

```prisma
// Simple 2-party barter
BarterOffer {
  initiator → recipient
  offeredItem ↔ requestedItem
  status: PENDING | COUNTER_OFFERED | ACCEPTED | REJECTED | EXPIRED | COMPLETED
}

// Multi-party smart barter
BarterChain {
  chainType: CYCLE | CHAIN
  participantCount: 3-10
  matchScore: 0-1
  status: PROPOSED | PENDING | ACCEPTED | REJECTED | COMPLETED
}

BarterParticipant {
  user
  givingItem → receivingItem
  position: 0, 1, 2, ...
  status: PENDING | ACCEPTED | REJECTED | COMPLETED
}
```

---

## Key Concepts

### 1. Simple Barter (2-Party)

**How it works:**
```
User A has: iPhone 13
User B has: PS5

User A → offers iPhone 13 → wants PS5 from User B
User B → accepts or rejects or counter-offers

If accepted: Trade happens!
```

**Features:**
- Direct item-for-item exchange
- Counter-offer support
- Expiration dates
- Notes and messages

---

### 2. Multi-Party Cycle

**How it works:**
```
User A has iPhone, wants Laptop
User B has Laptop, wants PS5
User C has PS5, wants iPhone

Smart Algorithm detects cycle:
A → B → C → A

Result: Everyone gets what they want! 🎉
```

**Real-world example:**
```
Ahmed (Cairo) has: Samsung S23 → wants: MacBook Air
Sara (Alex) has: MacBook Air → wants: Canon Camera
Mohamed (Giza) has: Canon Camera → wants: Samsung S23

System proposes 3-way cycle!
```

---

### 3. Multi-Party Chain

**How it works:**
```
User A has Laptop, wants Phone
User B has Phone, wants Tablet
User C has Tablet, wants Watch
User D has Watch, wants (anything)

Chain: A → B → C → D

User D receives without giving (lucky!)
```

**Use case:**
Useful when there's no perfect cycle, but a sequence satisfies most participants.

---

## API Endpoints

### Base URL
```
/api/v1/barter
```

---

## 2-Party Barter (Simple)

### 1. Create Barter Offer

Create a direct barter offer to another user.

**Endpoint:**
```
POST /api/v1/barter/offers
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "offeredItemId": "uuid",
  "requestedItemId": "uuid",
  "notes": "I think this is a fair trade!",
  "expiresAt": "2025-02-01T00:00:00Z"  // Optional, default 7 days
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Barter offer created successfully",
  "data": {
    "id": "uuid",
    "initiatorId": "uuid",
    "recipientId": "uuid",
    "offeredItem": { ... },
    "requestedItem": { ... },
    "status": "PENDING",
    "notes": "I think this is a fair trade!",
    "expiresAt": "2025-02-01T00:00:00Z",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400`: Items are the same / Item has active listing
- `403`: Item doesn't belong to you
- `404`: Item not found

---

### 2. Accept Barter Offer

Accept a pending barter offer.

**Endpoint:**
```
POST /api/v1/barter/offers/:offerId/accept
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Barter offer accepted successfully",
  "data": {
    "id": "uuid",
    "status": "ACCEPTED",
    ...
  }
}
```

---

### 3. Reject Barter Offer

Reject a pending barter offer.

**Endpoint:**
```
POST /api/v1/barter/offers/:offerId/reject
```

**Request Body:**
```json
{
  "reason": "Not interested in this trade anymore"  // Optional
}
```

**Response:** `200 OK`

---

### 4. Create Counter Offer

Propose an alternative item instead of the requested one.

**Endpoint:**
```
POST /api/v1/barter/offers/:offerId/counter
```

**Request Body:**
```json
{
  "counterOfferItemId": "uuid",
  "notes": "How about this item instead?"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Counter offer created successfully",
  "data": {
    "id": "uuid",
    "status": "COUNTER_OFFERED",
    "counterOfferItem": { ... },
    ...
  }
}
```

---

### 5. Cancel Barter Offer

Cancel your own barter offer (only if not accepted yet).

**Endpoint:**
```
POST /api/v1/barter/offers/:offerId/cancel
```

**Response:** `200 OK`

---

### 6. Get My Barter Offers

List all your barter offers (sent and received).

**Endpoint:**
```
GET /api/v1/barter/offers/my
```

**Query Parameters:**
```
type: sent | received | all (default: all)
status: PENDING | ACCEPTED | REJECTED | ... (optional)
page: 1 (default)
limit: 20 (default, max 100)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Barter offers retrieved successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

---

### 7. Search Barterable Items

Find items available for barter.

**Endpoint:**
```
GET /api/v1/barter/items
```

**Query Parameters:**
```
search: "laptop" (optional)
categoryId: uuid (optional)
condition: NEW | LIKE_NEW | GOOD | ... (optional)
governorate: "Cairo" (optional)
excludeMyItems: true (default)
page: 1
limit: 20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "iPhone 13 Pro",
        "estimatedValue": 15000,
        "condition": "LIKE_NEW",
        "seller": {
          "id": "uuid",
          "fullName": "Ahmed Ali"
        },
        ...
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 8. Find Simple Matches

Find 2-party barter matches for your item.

**Endpoint:**
```
GET /api/v1/barter/matches/:itemId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "MacBook Air M1",
      "estimatedValue": 16000,
      "seller": {
        "id": "uuid",
        "fullName": "Sara Mohamed",
        "items": [ ... ]  // Their other items
      },
      "matchReason": "Same category, similar value"
    }
  ]
}
```

---

### 9. Complete Barter Exchange

Mark a barter as completed (both parties confirm).

**Endpoint:**
```
POST /api/v1/barter/offers/:offerId/complete
```

**Request Body:**
```json
{
  "confirmationNotes": "Received item in great condition!" // Optional
}
```

**Response:** `200 OK`

---

## Multi-Party Barter (Smart)

### 10. Discover Smart Opportunities

Let the AI find multi-party barter opportunities for your item.

**Endpoint:**
```
GET /api/v1/barter/opportunities/:itemId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Barter opportunities discovered successfully",
  "data": {
    "item": {
      "id": "uuid",
      "title": "iPhone 13",
      ...
    },
    "opportunities": {
      "cycles": [
        {
          "type": "CYCLE",
          "participants": 3,
          "matchScore": 0.87,
          "preview": [
            {
              "userId": "user-a",
              "givingItemId": "iphone-13",
              "receivingItemId": "macbook-air"
            },
            {
              "userId": "user-b",
              "givingItemId": "macbook-air",
              "receivingItemId": "ps5"
            },
            {
              "userId": "user-c",
              "givingItemId": "ps5",
              "receivingItemId": "iphone-13"
            }
          ]
        }
      ],
      "chains": [
        {
          "type": "CHAIN",
          "participants": 4,
          "matchScore": 0.72,
          "preview": [ ... ]
        }
      ],
      "total": 12
    }
  }
}
```

**Explanation:**
- **matchScore**: 0-1, higher is better
  - 0.9-1.0: Excellent match
  - 0.7-0.9: Good match
  - 0.5-0.7: Fair match
  - <0.5: Not shown

- **Cycles vs Chains**:
  - **Cycles**: Everyone trades (circular)
  - **Chains**: Linear sequence

---

### 11. Create Smart Proposal

Create a multi-party barter proposal based on AI matching.

**Endpoint:**
```
POST /api/v1/barter/chains
```

**Request Body:**
```json
{
  "itemId": "uuid",
  "maxParticipants": 5,      // Optional, default 5, max 10
  "preferCycles": true        // Optional, prefer cycles over chains
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Smart barter proposal created successfully",
  "data": {
    "id": "chain-uuid",
    "chainType": "CYCLE",
    "participantCount": 3,
    "matchScore": 0.87,
    "description": "Cycle: User abc1234 → User def5678 → User ghi9012 → User abc1234 (3 parties)",
    "status": "PROPOSED",
    "expiresAt": "2025-01-22T10:30:00Z",  // 7 days from now
    "participants": [
      {
        "id": "participant-uuid",
        "user": {
          "id": "uuid",
          "fullName": "Ahmed Ali",
          "avatar": "url"
        },
        "givingItem": {
          "id": "uuid",
          "title": "iPhone 13",
          "images": ["url"],
          "estimatedValue": 15000
        },
        "receivingItem": {
          "id": "uuid",
          "title": "MacBook Air",
          "images": ["url"],
          "estimatedValue": 16000
        },
        "position": 0,
        "status": "PENDING"
      },
      {
        "position": 1,
        ...
      },
      {
        "position": 2,
        ...
      }
    ],
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Notes:**
- Algorithm automatically finds best matches
- All participants notified
- Each must accept within 7 days
- If one rejects, proposal fails

---

### 12. Get Barter Chain Details

Get full details of a barter chain.

**Endpoint:**
```
GET /api/v1/barter/chains/:chainId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "chainType": "CYCLE",
    "participantCount": 3,
    "matchScore": 0.87,
    "status": "PENDING",
    "participants": [ ... ],
    ...
  }
}
```

---

### 13. Respond to Chain Proposal

Accept or reject a multi-party barter proposal.

**Endpoint:**
```
POST /api/v1/barter/chains/:chainId/respond
```

**Request Body:**
```json
{
  "accept": true,
  "message": "Sounds good to me!" // Optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Proposal accepted successfully",
  "data": {
    "id": "uuid",
    "status": "PENDING",  // or "ACCEPTED" if all accepted, "REJECTED" if anyone rejected
    "participants": [
      {
        "status": "ACCEPTED",  // Your status updated
        "respondedAt": "2025-01-15T11:00:00Z",
        ...
      },
      {
        "status": "PENDING",  // Others still pending
        ...
      }
    ]
  }
}
```

**Status Transitions:**
- **PROPOSED** → **PENDING** (first person responds)
- **PENDING** → **ACCEPTED** (all accept)
- **PENDING** → **REJECTED** (anyone rejects)

---

### 14. Execute Barter Chain

Confirm you've completed your part of the exchange.

**Endpoint:**
```
POST /api/v1/barter/chains/:chainId/execute
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Barter chain execution confirmed",
  "data": {
    "status": "ACCEPTED",  // or "COMPLETED" if all confirmed
    "participants": [
      {
        "status": "COMPLETED",  // You confirmed
        ...
      },
      {
        "status": "ACCEPTED",   // Others haven't confirmed yet
        ...
      }
    ]
  }
}
```

**Flow:**
1. Chain must be **ACCEPTED** by all first
2. Each participant confirms completion
3. When all confirm → Chain marked **COMPLETED**

---

### 15. Cancel Barter Chain

Cancel a barter chain proposal (initiator only).

**Endpoint:**
```
DELETE /api/v1/barter/chains/:chainId
```

**Response:** `200 OK`

**Rules:**
- Only first participant (initiator) can cancel
- Cannot cancel if **COMPLETED**
- Can cancel if **PROPOSED**, **PENDING**, or **ACCEPTED**

---

### 16. Get My Barter Chains

List all multi-party barter chains you're involved in.

**Endpoint:**
```
GET /api/v1/barter/chains/my
```

**Query Parameters:**
```
status: PROPOSED | PENDING | ACCEPTED | ... (optional)
page: 1
limit: 20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "chainType": "CYCLE",
        "participantCount": 3,
        "matchScore": 0.87,
        "status": "PENDING",
        "participants": [ ... ],
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 17. Get Pending Proposals

Get all barter chain proposals awaiting your response.

**Endpoint:**
```
GET /api/v1/barter/chains/pending
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "chainType": "CYCLE",
      "participantCount": 4,
      "matchScore": 0.82,
      "status": "PROPOSED",
      "expiresAt": "2025-01-22T10:30:00Z",
      "participants": [
        {
          "user": { ... },
          "givingItem": { ... },
          "receivingItem": { ... },
          "status": "PENDING"  // You haven't responded
        },
        ...
      ]
    }
  ]
}
```

---

### 18. Get Barter Chain Statistics

Get your barter chain statistics.

**Endpoint:**
```
GET /api/v1/barter/chains/stats
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 24,
    "proposed": 3,
    "pending": 5,
    "accepted": 2,
    "completed": 12,
    "rejected": 2,
    "successRate": "50.0"  // completed / total * 100
  }
}
```

---

## Algorithms Explained

### 1. Cycle Detection Algorithm

**Based on:** Depth-First Search (DFS) with backtracking

**How it works:**
```
1. Build directed graph:
   - Nodes = Users
   - Edges = "User A wants User B's item"

2. For each node:
   - Start DFS
   - Track visited nodes
   - If we return to start node → CYCLE FOUND!

3. Calculate match score for each cycle

4. Return top-scored cycles
```

**Example:**
```
Graph:
A → B (A wants B's item, score 0.8)
B → C (B wants C's item, score 0.9)
C → A (C wants A's item, score 0.7)

DFS from A:
A → B → C → A (CYCLE!)

Average score: (0.8 + 0.9 + 0.7) / 3 = 0.8
```

**Complexity:** O(V + E) where V = users, E = potential trades

---

### 2. Chain Detection Algorithm

**Based on:** DFS without cycle requirement

**How it works:**
```
1. Build same directed graph

2. For each node:
   - Start DFS
   - Continue until no more edges
   - Record all paths of length >= 3

3. Score each chain

4. Remove duplicates

5. Return top chains
```

**Example:**
```
Graph:
A → B → C → D

Chain: A gives to B, B gives to C, C gives to D, D gets without giving

Average score: (A→B + B→C + C→D) / 3
```

---

### 3. Match Score Calculation

**Factors (weighted):**

```typescript
score = 0

// Category similarity (40%)
if (sameCategory) score += 0.4
else if (sameParentCategory) score += 0.2

// Value similarity (40%)
valueDiff = |valueA - valueB|
avgValue = (valueA + valueB) / 2
valueScore = max(0, 1 - valueDiff / avgValue)
score += valueScore * 0.4

// Condition match (20%)
if (sameCondition) score += 0.2
else if (bothNew) score += 0.1
else score += 0.14

return min(1, score)
```

**Examples:**
```
iPhone 13 Pro (NEW, 20000 EGP) vs MacBook Air (NEW, 22000 EGP)
→ Same parent category (Electronics)
→ Similar value (diff = 2000, avg = 21000, valueScore = 0.9)
→ Same condition (NEW)
→ Score = 0.2 + 0.36 + 0.2 = 0.76 (Good match)

Samsung Phone (GOOD, 5000 EGP) vs Gaming Chair (NEW, 3000 EGP)
→ Different categories (Electronics vs Furniture)
→ Different values (diff = 2000, avg = 4000, valueScore = 0.5)
→ Different conditions
→ Score = 0 + 0.2 + 0.14 = 0.34 (Poor match, won't show)
```

---

## Workflows

### Workflow 1: Simple 2-Party Barter

```
┌─────────┐                                    ┌─────────┐
│ User A  │                                    │ User B  │
└────┬────┘                                    └────┬────┘
     │                                              │
     │ 1. POST /barter/offers                      │
     │    (offer iPhone for PS5)                   │
     ├─────────────────────────────────────────────►│
     │                                              │
     │                                              │ 2. GET /barter/offers/my
     │                                              │    (sees pending offer)
     │                                              │
     │                                              │ 3. POST /barter/offers/:id/accept
     │◄─────────────────────────────────────────────┤
     │                                              │
     │ 4. Notification: Offer accepted!            │
     │                                              │
     │ 5. Exchange items offline                   │
     │◄────────────────────────────────────────────►│
     │                                              │
     │ 6. POST /barter/offers/:id/complete         │
     ├─────────────────────────────────────────────►│
     │                                              │
     │                                              │ 7. POST /barter/offers/:id/complete
     │◄─────────────────────────────────────────────┤
     │                                              │
     │ ✅ Trade completed!                         │
     │                                              │
```

---

### Workflow 2: Multi-Party Smart Barter (Cycle)

```
┌────────┐        ┌────────┐        ┌────────┐
│ User A │        │ User B │        │ User C │
│(iPhone)│        │(Laptop)│        │ (PS5)  │
└───┬────┘        └───┬────┘        └───┬────┘
    │                 │                 │
    │ 1. GET /barter/opportunities/:itemId
    │    (discovers 3-way cycle)
    │                 │                 │
    │ 2. POST /barter/chains
    │    (creates proposal)
    ├────────────────►├────────────────►│
    │                 │                 │
    │                 │ 3. Notifications sent to all
    │                 │                 │
    │                 │ 4. POST /chains/:id/respond (accept)
    │                 ├────────────────►│
    │                 │                 │
    │                 │                 │ 5. POST /chains/:id/respond (accept)
    │◄────────────────┤◄────────────────┤
    │                 │                 │
    │ 6. All accepted! Status → ACCEPTED
    │                 │                 │
    │ 7. Coordinate exchange (meet up, ship, etc.)
    │◄───────────────►│◄───────────────►│
    │                 │                 │
    │ 8. POST /chains/:id/execute
    ├────────────────►│                 │
    │                 │ 9. POST /chains/:id/execute
    │                 ├────────────────►│
    │                 │                 │ 10. POST /chains/:id/execute
    │◄────────────────┤◄────────────────┤
    │                 │                 │
    │ ✅ All confirmed! Status → COMPLETED
    │                 │                 │
```

---

## Examples

### Example 1: Create Simple Barter Offer

**Request:**
```bash
curl -X POST https://api.xchange.com/api/v1/barter/offers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offeredItemId": "abc123",
    "requestedItemId": "def456",
    "notes": "Fair trade, let me know!",
    "expiresAt": "2025-02-01T00:00:00Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Barter offer created successfully",
  "data": {
    "id": "offer-xyz",
    "status": "PENDING",
    "offeredItem": {
      "title": "iPhone 13",
      "estimatedValue": 15000
    },
    "requestedItem": {
      "title": "MacBook Air",
      "estimatedValue": 16000
    },
    "expiresAt": "2025-02-01T00:00:00Z"
  }
}
```

---

### Example 2: Discover Smart Opportunities

**Request:**
```bash
curl https://api.xchange.com/api/v1/barter/opportunities/abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "abc123",
      "title": "iPhone 13",
      "estimatedValue": 15000
    },
    "opportunities": {
      "cycles": [
        {
          "type": "CYCLE",
          "participants": 3,
          "matchScore": 0.87,
          "preview": [
            {
              "userId": "user-1",
              "givingItemId": "iphone-13",
              "receivingItemId": "macbook-air"
            },
            {
              "userId": "user-2",
              "givingItemId": "macbook-air",
              "receivingItemId": "ps5"
            },
            {
              "userId": "user-3",
              "givingItemId": "ps5",
              "receivingItemId": "iphone-13"
            }
          ]
        }
      ],
      "total": 5
    }
  }
}
```

---

### Example 3: Create Smart Proposal

**Request:**
```bash
curl -X POST https://api.xchange.com/api/v1/barter/chains \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "abc123",
    "maxParticipants": 4,
    "preferCycles": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Smart barter proposal created successfully",
  "data": {
    "id": "chain-xyz",
    "chainType": "CYCLE",
    "participantCount": 3,
    "matchScore": 0.87,
    "status": "PROPOSED",
    "participants": [
      {
        "position": 0,
        "user": { "fullName": "Ahmed" },
        "givingItem": { "title": "iPhone 13" },
        "receivingItem": { "title": "MacBook Air" },
        "status": "PENDING"
      },
      {
        "position": 1,
        "user": { "fullName": "Sara" },
        "givingItem": { "title": "MacBook Air" },
        "receivingItem": { "title": "PS5" },
        "status": "PENDING"
      },
      {
        "position": 2,
        "user": { "fullName": "Mohamed" },
        "givingItem": { "title": "PS5" },
        "receivingItem": { "title": "iPhone 13" },
        "status": "PENDING"
      }
    ]
  }
}
```

---

## Error Handling

### Common Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 400 | Bad Request | Invalid input (e.g., same item offered and requested) |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not allowed (e.g., not your item, not a participant) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate offer exists |
| 500 | Server Error | Something went wrong on our end |

### Error Response Format

```json
{
  "success": false,
  "message": "You cannot offer and request the same item",
  "error": {
    "code": "INVALID_REQUEST",
    "field": "requestedItemId"
  }
}
```

### Specific Errors

#### 2-Party Barter Errors
```json
// Cannot barter own item
{
  "success": false,
  "message": "You cannot barter with yourself"
}

// Item has active listing
{
  "success": false,
  "message": "Cannot barter items that have active sale listings. Please close the listing first."
}

// Offer expired
{
  "success": false,
  "message": "This offer has expired"
}
```

#### Multi-Party Barter Errors
```json
// Not a participant
{
  "success": false,
  "message": "You are not a participant in this barter chain"
}

// Chain expired
{
  "success": false,
  "message": "This barter chain has expired"
}

// Already responded
{
  "success": false,
  "message": "You have already responded to this proposal"
}

// No matches found
{
  "success": false,
  "message": "No suitable barter matches found for this item"
}
```

---

## Best Practices

### For Users

1. **Set reasonable expiration dates** (7-14 days recommended)
2. **Include detailed notes** explaining why it's a fair trade
3. **Respond promptly** to proposals to keep chains moving
4. **Verify item condition** before accepting
5. **Use smart matching** for better opportunities

### For Developers

1. **Check item availability** before creating offers
2. **Handle expired offers** gracefully
3. **Implement real-time notifications** for chain updates
4. **Show match scores** to help users decide
5. **Add retry logic** for network failures

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Create offer/chain | 10 per hour |
| Search/Discovery | 100 per hour |
| Read operations | 1000 per hour |

---

## Support

**Questions?** Contact: support@xchange.com
**Found a bug?** Report: bugs@xchange.com

---

**🎉 Happy Bartering!**
