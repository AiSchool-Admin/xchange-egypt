# Bundle & Preference Barter API Documentation

**Version:** 2.0 - Advanced Bundle Support
**Last Updated:** January 2025

---

## 🎯 Overview

The Bundle & Preference Barter System is **the world's most advanced multi-item trading platform**, supporting:

- **Multi-Item Bundles**: Offer multiple items (up to 20) in one bundle
- **Alternative Preferences**: Specify up to 10 alternative bundles you want, ranked by priority
- **Smart Matching**: AI automatically finds users who own items matching your preferences
- **Flexible Trading**: Mix and match - bundle for bundle, bundle for single item, or any combination

### Revolutionary Features ✨

- 🎁 **Bundle Trading**: Trade multiple items at once
- 🎯 **Priority Preferences**: Rank your wanted items by priority
- 🤖 **Auto-Matching**: System finds who owns what you want
- ⚖️ **Balance Validation**: Automatic value fairness checking (±30%)
- 🔄 **Open Offers**: Create offers open to anyone with matching items

---

## 📖 Key Concepts

### 1. Multi-Item Bundles

**What is it?**
Instead of trading one item for one item, you can trade **multiple items for multiple items**.

**Example:**
```
Ahmed offers:
- iPhone 13 (15,000 EGP)
- AirPods Pro (3,000 EGP)
- Apple Watch (4,000 EGP)
Total: 22,000 EGP

Wants: MacBook Air M1 (20,000 EGP)

This is balanced! (±10% difference)
```

---

### 2. Alternative Preferences

**What is it?**
You can specify **multiple alternatives** of what you want, ranked by priority. The system will match you with the first available option.

**Example:**
```
Sara offers: Canon Camera (8,000 EGP)

Preferences (ranked):
1. iPhone 13 (First choice - 7,500 EGP)
2. Samsung S23 (Second choice - 7,000 EGP)
3. iPad 9th Gen (Third choice - 6,500 EGP)

System searches for all three!
First match = successful trade
```

---

### 3. Preference Sets (Bundles as Alternatives)

**What is it?**
Each preference can be a **bundle** of items. You're saying: "I'll accept bundle A, or bundle B, or bundle C..."

**Example:**
```
Mohamed offers:
- PS5 (10,000 EGP)
- 2 Controllers (1,500 EGP)
Total: 11,500 EGP

Preference Sets (ranked):
1. Gaming Laptop alone (12,000 EGP)
2. iPad Pro + Apple Pencil (9,000 + 2,000 = 11,000 EGP)
3. iPhone 12 + AirPods (8,000 + 2,500 = 10,500 EGP)

Flexible! Any of these works for him.
```

---

## 🔌 API Endpoints

### Base URL
```
/api/v1/barter
```

---

## 1. Create Bundle Offer

Create a barter offer with bundles and alternative preferences.

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
  "offeredItemIds": [
    "iphone-13-uuid",
    "airpods-uuid",
    "apple-watch-uuid"
  ],
  "preferenceSets": [
    {
      "priority": 1,
      "itemIds": ["macbook-air-uuid"],
      "description": "MacBook Air M1"
    },
    {
      "priority": 2,
      "itemIds": ["ipad-pro-uuid", "apple-pencil-uuid"],
      "description": "iPad Pro + Apple Pencil"
    },
    {
      "priority": 3,
      "itemIds": ["ps5-uuid", "controller-1-uuid", "controller-2-uuid"],
      "description": "PS5 Bundle"
    }
  ],
  "recipientId": "user-uuid",  // Optional - specific user
  "isOpenOffer": false,        // Optional - open to anyone
  "notes": "Fair trade, all items in excellent condition",
  "expiresAt": "2025-02-15T00:00:00Z"  // Optional, default 14 days
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Barter offer created successfully",
  "data": {
    "id": "offer-uuid",
    "initiatorId": "user-uuid",
    "recipientId": "recipient-uuid",
    "offeredItemIds": ["iphone-13-uuid", "airpods-uuid", "apple-watch-uuid"],
    "offeredBundleValue": 22000,
    "preferenceSets": [
      {
        "id": "pref-set-1-uuid",
        "priority": 1,
        "totalValue": 20000,
        "valueDifference": -2000,  // They want 2000 less
        "isBalanced": true,         // Within ±30%
        "description": "MacBook Air M1",
        "items": [
          {
            "item": {
              "id": "macbook-air-uuid",
              "title": "MacBook Air M1",
              "estimatedValue": 20000,
              "condition": "LIKE_NEW",
              "images": ["url1", "url2"]
            }
          }
        ]
      },
      {
        "id": "pref-set-2-uuid",
        "priority": 2,
        "totalValue": 11000,
        "valueDifference": -11000,
        "isBalanced": false,  // More than ±30%
        "description": "iPad Pro + Apple Pencil",
        "items": [
          {
            "item": {
              "id": "ipad-pro-uuid",
              "title": "iPad Pro 11",
              "estimatedValue": 9000
            }
          },
          {
            "item": {
              "id": "apple-pencil-uuid",
              "title": "Apple Pencil 2nd Gen",
              "estimatedValue": 2000
            }
          }
        ]
      }
    ],
    "status": "PENDING",
    "isOpenOffer": false,
    "createdAt": "2025-01-15T10:30:00Z",
    "expiresAt": "2025-02-15T00:00:00Z"
  }
}
```

**Validation Rules:**
- Must offer 1-20 items
- Must specify 1-10 preference sets
- Priorities must be unique (1, 2, 3, ...)
- Cannot offer items you're requesting
- All offered items must belong to you
- All offered items must not have active listings
- If recipientId specified, they must own at least one requested item

---

## 2. Get Matching Offers

Find offers where you own items that match their preferences.

**Use Case:** "Show me all offers I can fulfill with my items"

**Endpoint:**
```
GET /api/v1/barter/offers/matching
```

**Query Parameters:**
```
page: 1 (default)
limit: 20 (default, max 100)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Matching offers found successfully",
  "data": {
    "items": [
      {
        "id": "offer-uuid",
        "initiator": {
          "id": "user-uuid",
          "fullName": "Ahmed Ali",
          "avatar": "url"
        },
        "offeredItemIds": ["iphone-uuid", "airpods-uuid"],
        "offeredBundleValue": 18000,
        "preferenceSets": [
          {
            "priority": 1,
            "items": [
              {
                "item": {
                  "id": "macbook-uuid",
                  "title": "MacBook Air",
                  "estimatedValue": 20000
                }
              }
            ],
            "totalValue": 20000,
            "isBalanced": true
          }
        ],
        "status": "PENDING",
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1,
      "hasMore": false
    }
  }
}
```

**How it works:**
1. System gets your items
2. Finds preference items that match your items
3. Returns offers containing those preferences
4. You see only offers you can fulfill!

---

## 3. Get Best Match for Offer

For a specific offer, find the best preference set you can fulfill.

**Use Case:** "Which of their preferences can I fulfill?"

**Endpoint:**
```
GET /api/v1/barter/offers/:offerId/best-match
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Best match found successfully",
  "data": {
    "preferenceSetId": "pref-set-uuid",
    "priority": 1,  // This is their first choice!
    "items": [
      {
        "itemId": "macbook-uuid",
        "title": "MacBook Air M1",
        "estimatedValue": 20000,
        "condition": "LIKE_NEW"
      }
    ],
    "totalValue": 20000,
    "valueDifference": -2000,  // They offered 22000, want 20000
    "isBalanced": true,
    "matchScore": 0.92  // 0-1, higher is better
  }
}
```

**Match Score Calculation:**
```
priorityScore = 1 - (priority - 1) * 0.1
  Priority 1 = 1.0
  Priority 2 = 0.9
  Priority 3 = 0.8
  ...

balanceScore = 1 - (valueDifference / offeredValue)
  Perfect balance = 1.0
  Larger difference = lower score

matchScore = priorityScore * 0.4 + balanceScore * 0.6

Example:
Priority 1 + 10% value diff = 1.0 * 0.4 + 0.9 * 0.6 = 0.94 (Excellent!)
Priority 3 + 25% value diff = 0.8 * 0.4 + 0.75 * 0.6 = 0.77 (Good)
```

**No Match Response:**
```json
{
  "success": true,
  "message": "No matching preference set found. You do not own the required items.",
  "data": null
}
```

---

## 4. Accept Bundle Offer

Accept an offer by selecting which preference set you'll fulfill.

**Endpoint:**
```
POST /api/v1/barter/offers/:offerId/accept
```

**Request Body:**
```json
{
  "preferenceSetId": "pref-set-uuid",  // Which preference you're fulfilling
  "offeredItemIds": ["macbook-uuid"]    // Your items (must match preference)
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Barter offer accepted successfully",
  "data": {
    "id": "offer-uuid",
    "status": "ACCEPTED",
    "matchedPreferenceSetId": "pref-set-uuid",
    "recipientId": "your-user-id",
    ...
  }
}
```

---

## 5. Get My Offers

List all your barter offers (sent and received).

**Endpoint:**
```
GET /api/v1/barter/offers/my
```

**Query Parameters:**
```
type: sent | received | all (default: all)
status: PENDING | ACCEPTED | ... (optional)
page: 1
limit: 20
```

**Response:** Same format as before, but with bundle data

---

## 📊 Real-World Examples

### Example 1: Simple Bundle for Single Item

```json
POST /api/v1/barter/offers

{
  "offeredItemIds": [
    "iphone-13",
    "airpods-pro"
  ],
  "preferenceSets": [
    {
      "priority": 1,
      "itemIds": ["macbook-air"]
    }
  ]
}
```

**Scenario:** Trade iPhone + AirPods for MacBook

---

### Example 2: Multiple Preferences

```json
{
  "offeredItemIds": ["canon-camera"],
  "preferenceSets": [
    {
      "priority": 1,
      "itemIds": ["iphone-13"],
      "description": "Best choice"
    },
    {
      "priority": 2,
      "itemIds": ["samsung-s23"],
      "description": "Good alternative"
    },
    {
      "priority": 3,
      "itemIds": ["ipad-9"],
      "description": "Acceptable"
    }
  ]
}
```

**Scenario:** Trade camera for phone, but flexible on which phone

---

### Example 3: Bundle for Bundle with Alternatives

```json
{
  "offeredItemIds": [
    "ps5",
    "controller-1",
    "controller-2",
    "game-1",
    "game-2"
  ],
  "preferenceSets": [
    {
      "priority": 1,
      "itemIds": ["gaming-laptop"],
      "description": "Gaming Laptop (best)"
    },
    {
      "priority": 2,
      "itemIds": ["macbook-pro", "external-gpu"],
      "description": "MacBook + eGPU"
    },
    {
      "priority": 3,
      "itemIds": ["ipad-pro", "keyboard", "apple-pencil"],
      "description": "iPad Pro bundle"
    }
  ]
}
```

**Scenario:** Trade gaming bundle for work/creative setup, with 3 alternatives

---

### Example 4: Open Offer

```json
{
  "offeredItemIds": ["macbook-air"],
  "preferenceSets": [
    {
      "priority": 1,
      "itemIds": ["iphone-14-pro"]
    },
    {
      "priority": 2,
      "itemIds": ["iphone-13-pro"]
    }
  ],
  "isOpenOffer": true,  // Anyone can accept!
  "recipientId": null
}
```

**Scenario:** Trade MacBook for iPhone, open to anyone who has one

---

## ⚖️ Balance Validation

The system automatically checks if bundles are balanced:

**Formula:**
```
valueDifference = requestedValue - offeredValue
percentageDiff = |valueDifference| / avgValue * 100

isBalanced = percentageDiff <= 30%
```

**Examples:**
```
Offered: 20,000 EGP
Requested: 22,000 EGP
Difference: 2,000 EGP (10%)
Status: ✅ Balanced

Offered: 10,000 EGP
Requested: 20,000 EGP
Difference: 10,000 EGP (67%)
Status: ❌ Not Balanced

Offered: 15,000 EGP
Requested: 14,000 EGP
Difference: 1,000 EGP (7%)
Status: ✅ Balanced
```

**Note:** Unbalanced trades are still allowed, but flagged for user awareness.

---

## 🔄 Workflow

### Seller's Journey (Creating Offer)

```
1. Seller selects items to offer (bundle)
   Items: iPhone, AirPods, Watch

2. Seller specifies preferences (what they want)
   Priority 1: MacBook Air
   Priority 2: iPad Pro + Pencil
   Priority 3: Gaming Laptop

3. System calculates values automatically
   Offered: 22,000 EGP
   Pref 1: 20,000 EGP (balanced ✅)
   Pref 2: 11,000 EGP (not balanced ⚠️)
   Pref 3: 25,000 EGP (balanced ✅)

4. Seller creates offer

5. System notifies potential matches
```

### Buyer's Journey (Responding to Offer)

```
1. Buyer sees offer in "Matching Offers"
   (They own MacBook Air - matches Pref 1)

2. Buyer checks best match
   GET /offers/:id/best-match
   Response: You can fulfill Priority 1! Score: 0.92

3. Buyer decides to accept
   POST /offers/:id/accept
   Body: { preferenceSetId: "pref-1", offeredItemIds: ["macbook-air"] }

4. Offer accepted!

5. Both parties exchange items offline

6. Both confirm completion
```

---

## 🚨 Error Handling

### Common Errors

```json
// Must offer at least one item
{
  "success": false,
  "message": "Must offer at least one item"
}

// Priorities not unique
{
  "success": false,
  "message": "Preference set priorities must be unique",
  "path": "preferenceSets"
}

// Offering items you're requesting
{
  "success": false,
  "message": "Cannot request items you are offering",
  "path": "preferenceSets"
}

// Items have active listings
{
  "success": false,
  "message": "Cannot barter items that have active sale listings"
}

// Don't own offered items
{
  "success": false,
  "message": "You can only offer your own items"
}

// Too many items
{
  "success": false,
  "message": "Maximum 20 items per bundle"
}

// Too many preference sets
{
  "success": false,
  "message": "Maximum 10 preference sets"
}
```

---

## 📈 Limits and Constraints

| Resource | Limit | Reason |
|----------|-------|--------|
| Offered Items | 1-20 | Prevent spam, ensure quality |
| Preference Sets | 1-10 | Balance flexibility & complexity |
| Items per Preference | 1-10 | Same as above |
| Priority Range | 1-10 | Matches max preference sets |
| Expiration | 14 days (default) | Bundle offers take longer |
| Value Difference | ±30% | Fair trade guideline |

---

## 💡 Best Practices

### For Sellers

1. **Use Multiple Preferences**: Increase success rate
2. **Order by True Priority**: Be honest about what you want most
3. **Include Descriptions**: Help buyers understand your preferences
4. **Bundle Smartly**: Group related items together
5. **Check Balance**: Aim for ±30% value difference

### For Buyers

1. **Check Best Match**: See which preference you can fulfill
2. **Review Match Score**: Higher score = better deal for both
3. **Verify Item Condition**: Check photos and descriptions
4. **Consider All Preferences**: Sometimes lower priority = better value

### For Developers

1. **Validate on Frontend**: Don't wait for server errors
2. **Show Balance Indicators**: Visual feedback on fairness
3. **Highlight Match Scores**: Help users make decisions
4. **Cache Bundle Values**: Calculate once, display everywhere
5. **Implement Real-Time**: Notify when matches found

---

## 🎯 Advanced Features

### Coming Soon

- **Auto-Bundling**: AI suggests optimal bundles
- **Price Recommendations**: AI suggests fair values
- **Bundle Templates**: Save common bundles
- **Bulk Preferences**: Import CSV of wanted items
- **Conditional Preferences**: "If I can't get A, then B+C"

---

## 🔗 Related APIs

- [Smart Multi-Party Barter](./SMART-BARTER-API.md) - Cycle & chain detection
- [Simple 2-Party Barter](./BARTER-API.md) - Traditional 1-for-1 trading

---

## 📞 Support

**Questions?** Contact: support@xchange.com
**Found a bug?** Report: bugs@xchange.com

---

**🎁 Happy Bundle Trading!**

*World's Most Advanced Multi-Item Trading Platform* 🇪🇬
