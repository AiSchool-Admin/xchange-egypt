# Advanced Search API Documentation

Complete API documentation for the Xchange Advanced Search System with AI-powered features.

## Table of Contents

- [Overview](#overview)
- [Main Search](#main-search)
- [AI-Powered Search](#ai-powered-search)
- [Search History](#search-history)
- [Popular & Trending Searches](#popular--trending-searches)
- [Saved Searches](#saved-searches)
- [Search Suggestions](#search-suggestions)
- [Autocomplete](#autocomplete)
- [Best Practices](#best-practices)

---

## Overview

The Advanced Search System provides comprehensive search capabilities including:

- **Advanced Filtering**: 20+ filter criteria
- **Full-Text Search**: Search across titles and descriptions
- **AI-Powered Search**: Semantic search with keyword expansion
- **Search History**: Track user searches
- **Popular Searches**: Trending search terms
- **Saved Searches**: Save and reuse search criteria
- **Autocomplete**: Real-time search suggestions
- **Multi-Category Search**: Search across multiple categories

### Features

✅ **20+ Search Filters**
✅ **AI Semantic Search**
✅ **Autocomplete Suggestions**
✅ **Search History Tracking**
✅ **Popular & Trending Searches**
✅ **Saved Searches with Notifications**
✅ **Multi-Category Search**
✅ **Relevance Scoring**

---

## Main Search

### Advanced Search

Comprehensive search with 20+ filter options.

**Endpoint:** `GET /api/v1/search`

**Authentication:** Optional (enhanced results for authenticated users)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Search text (min 1 char) |
| categoryId | UUID | Filter by category ID |
| categorySlug | string | Filter by category slug |
| minPrice | number | Minimum price filter |
| maxPrice | number | Maximum price filter |
| condition | string/array | Item condition (NEW, LIKE_NEW, GOOD, FAIR, POOR) |
| status | string/array | Item status (ACTIVE, SOLD, TRADED) |
| location | string | Location filter |
| governorate | string | Governorate filter |
| latitude | number | Latitude for location search |
| longitude | number | Longitude for location search |
| radius | number | Search radius in km |
| sellerId | UUID | Filter by seller |
| userType | enum | INDIVIDUAL or BUSINESS |
| minRating | number | Minimum seller rating (0-5) |
| listingType | string/array | DIRECT_SALE, AUCTION, REVERSE_AUCTION, BARTER |
| activeAuctions | boolean | Only active auctions |
| endingSoon | boolean | Auctions ending within 24h |
| activeReverseAuctions | boolean | Only active reverse auctions |
| createdAfter | date | Items created after date |
| createdBefore | date | Items created before date |
| verifiedSellers | boolean | Only verified sellers |
| page | number | Page number (default: 1) |
| limit | number | Items per page (max: 100, default: 20) |
| sortBy | enum | relevance, price_low, price_high, newest, oldest, popular, rating |

**Example Request:**

```
GET /api/v1/search?query=iphone&minPrice=5000&maxPrice=15000&condition=NEW&location=Cairo&sortBy=price_low&page=1&limit=20
```

**Response:**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "iPhone 14 Pro Max 256GB",
        "description": "Brand new, sealed...",
        "estimatedValue": 12000,
        "condition": "NEW",
        "images": ["https://..."],
        "status": "ACTIVE",
        "views": 45,
        "createdAt": "2025-11-07T10:00:00.000Z",
        "seller": {
          "id": "uuid",
          "fullName": "Ahmed Hassan",
          "avatar": "https://...",
          "rating": 4.8,
          "totalReviews": 35,
          "emailVerified": true,
          "userType": "BUSINESS",
          "city": "Cairo",
          "governorate": "Cairo"
        },
        "category": {
          "id": "uuid",
          "nameEn": "Mobile Phones",
          "nameAr": "هواتف محمولة",
          "slug": "mobile-phones"
        }
      }
    ],
    "listings": [],
    "auctions": [],
    "reverseAuctions": [],
    "total": 48,
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 3
    },
    "suggestions": [
      "iphone 14",
      "iphone 14 pro",
      "iphone 14 pro max"
    ]
  }
}
```

---

## AI-Powered Search

### Semantic Search

AI-powered search with keyword expansion and relevance scoring.

**Endpoint:** `GET /api/v1/search/ai`

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query (min 3 chars) |
| limit | number | No | Max results (default: 20, max: 50) |

**Example Request:**

```
GET /api/v1/search/ai?query=laptop for gaming&limit=10
```

**Response:**

```json
{
  "success": true,
  "message": "AI search completed successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Gaming Laptop - RTX 3070",
      "description": "High performance gaming notebook...",
      "estimatedValue": 25000,
      "relevanceScore": 145.5,
      "images": ["https://..."],
      "seller": {
        "id": "uuid",
        "fullName": "Mohamed Ali",
        "avatar": "https://...",
        "rating": 4.9,
        "totalReviews": 82
      },
      "category": {
        "id": "uuid",
        "nameEn": "Laptops",
        "slug": "laptops"
      }
    }
  ]
}
```

**How AI Search Works:**

1. **Keyword Extraction**: Extract meaningful keywords from query
2. **Term Expansion**: Add synonyms (e.g., "laptop" → "notebook", "computer", "pc")
3. **Relevance Scoring**: Calculate match quality based on:
   - Exact matches in title (100 points)
   - Exact matches in description (50 points)
   - Keyword matches (10-20 points)
   - Seller verification (+10 points)
   - High ratings (+15 points)
   - New items (+10 points)
   - Popularity/views (up to +20 points)
4. **Result Ranking**: Sort by relevance score

---

## Search History

### Get Search History

Get user's recent searches.

**Endpoint:** `GET /api/v1/search/history`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max results (default: 20, max: 100) |

**Response:**

```json
{
  "success": true,
  "message": "Search history retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "query": "iphone 14",
      "filters": {
        "minPrice": 5000,
        "maxPrice": 15000,
        "condition": "NEW"
      },
      "resultsCount": 48,
      "category": null,
      "location": "Cairo",
      "createdAt": "2025-11-07T10:00:00.000Z"
    }
  ]
}
```

---

### Clear Search History

Delete all user's search history.

**Endpoint:** `DELETE /api/v1/search/history`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Search history cleared successfully",
  "data": null
}
```

---

## Popular & Trending Searches

### Get Popular Searches

Get most searched terms across platform.

**Endpoint:** `GET /api/v1/search/popular`

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max results (default: 10, max: 50) |

**Response:**

```json
{
  "success": true,
  "message": "Popular searches retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "query": "iphone",
      "searchCount": 1253,
      "trend": 145.2,
      "lastSearchedAt": "2025-11-07T10:00:00.000Z",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-11-07T10:00:00.000Z"
    }
  ]
}
```

---

### Get Trending Searches

Get trending searches (popular in last 24 hours).

**Endpoint:** `GET /api/v1/search/trending`

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max results (default: 10, max: 50) |

**Response:**

```json
{
  "success": true,
  "message": "Trending searches retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "query": "playstation 5",
      "searchCount": 89,
      "trend": 234.5,
      "lastSearchedAt": "2025-11-07T09:50:00.000Z"
    }
  ]
}
```

**Trend Score Formula:**
```
trend = searchCount / hoursSinceLastSearch
```

Higher trend score = more popular recently.

---

## Saved Searches

### Save a Search

Save search criteria for later use.

**Endpoint:** `POST /api/v1/search/saved`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "New iPhones under 15k",
  "query": "iphone",
  "filters": {
    "minPrice": 5000,
    "maxPrice": 15000,
    "condition": "NEW",
    "location": "Cairo"
  },
  "notifyOnNew": true
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User-friendly name (1-100 chars) |
| query | string | No | Text search query |
| filters | object | Yes | All search filters |
| notifyOnNew | boolean | No | Notify when new matches (default: false) |

**Response:**

```json
{
  "success": true,
  "message": "Search saved successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "name": "New iPhones under 15k",
    "query": "iphone",
    "filters": {
      "minPrice": 5000,
      "maxPrice": 15000,
      "condition": "NEW"
    },
    "notifyOnNew": true,
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z",
    "lastUsedAt": null
  }
}
```

---

### Get Saved Searches

Get all user's saved searches.

**Endpoint:** `GET /api/v1/search/saved`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Saved searches retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "New iPhones under 15k",
      "query": "iphone",
      "filters": {...},
      "notifyOnNew": true,
      "createdAt": "2025-11-07T10:00:00.000Z",
      "lastUsedAt": "2025-11-07T15:30:00.000Z"
    }
  ]
}
```

---

### Get Saved Search by ID

Get details of a specific saved search.

**Endpoint:** `GET /api/v1/search/saved/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Saved search retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "New iPhones under 15k",
    "query": "iphone",
    "filters": {...},
    "notifyOnNew": true,
    "createdAt": "2025-11-07T10:00:00.000Z",
    "lastUsedAt": "2025-11-07T15:30:00.000Z"
  }
}
```

---

### Update Saved Search

Update an existing saved search.

**Endpoint:** `PATCH /api/v1/search/saved/:id`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Updated name",
  "filters": {
    "minPrice": 6000
  },
  "notifyOnNew": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Saved search updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated name",
    "filters": {...},
    "notifyOnNew": false,
    "updatedAt": "2025-11-07T16:00:00.000Z"
  }
}
```

---

### Delete Saved Search

Delete a saved search.

**Endpoint:** `DELETE /api/v1/search/saved/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Saved search deleted successfully",
  "data": null
}
```

---

### Execute Saved Search

Run a saved search.

**Endpoint:** `GET /api/v1/search/saved/:id/execute`

**Authentication:** Required

**Response:**

Same as [Main Search](#main-search) response.

**Notes:**
- Updates `lastUsedAt` timestamp
- Applies saved filters automatically

---

## Search Suggestions

### Get Search Suggestions

Get suggestions based on partial query.

**Endpoint:** `GET /api/v1/search/suggestions`

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Partial query (min 2 chars) |
| limit | number | No | Max results (default: 10, max: 20) |

**Example:**

```
GET /api/v1/search/suggestions?query=iph&limit=10
```

**Response:**

```json
{
  "success": true,
  "message": "Suggestions retrieved successfully",
  "data": [
    "iphone 14",
    "iphone 14 pro",
    "iphone 14 pro max",
    "iphone 13",
    "iphone accessories"
  ]
}
```

**Sources:**
- Admin-created suggestions (priority-based)
- Popular search queries
- Deduplicated results

---

### Track Suggestion Click

Track when user clicks on a suggestion.

**Endpoint:** `POST /api/v1/search/suggestions/click`

**Authentication:** Not required

**Request Body:**

```json
{
  "keyword": "iphone 14"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Click tracked successfully",
  "data": null
}
```

**Purpose:** Helps improve suggestion relevance.

---

### Create Suggestion (Admin)

Create a search suggestion.

**Endpoint:** `POST /api/v1/search/suggestions`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "keyword": "iphone14",
  "displayText": "iPhone 14 Pro Max",
  "category": "Mobile Phones",
  "priority": 10
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keyword | string | Yes | Search keyword (lowercase) |
| displayText | string | Yes | Display text shown to users |
| category | string | No | Associated category |
| priority | number | No | Priority (0-100, default: 0) |

**Response:**

```json
{
  "success": true,
  "message": "Suggestion created successfully",
  "data": {
    "id": "uuid",
    "keyword": "iphone14",
    "displayText": "iPhone 14 Pro Max",
    "category": "Mobile Phones",
    "clickCount": 0,
    "isActive": true,
    "priority": 10,
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

---

## Autocomplete

### Get Autocomplete Results

Get comprehensive autocomplete with items and categories.

**Endpoint:** `GET /api/v1/search/autocomplete`

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Partial query (min 2 chars) |
| limit | number | No | Max results per type (default: 10) |

**Example:**

```
GET /api/v1/search/autocomplete?query=lapt&limit=5
```

**Response:**

```json
{
  "success": true,
  "message": "Autocomplete suggestions retrieved",
  "data": {
    "suggestions": [
      "laptop",
      "laptop gaming",
      "laptop dell",
      "laptop hp"
    ],
    "items": [
      {
        "id": "uuid",
        "title": "Gaming Laptop - RTX 3070",
        "images": ["https://..."],
        "estimatedValue": 25000
      }
    ],
    "categories": [
      {
        "id": "uuid",
        "nameEn": "Laptops",
        "nameAr": "لابتوبات",
        "slug": "laptops",
        "icon": "💻"
      }
    ]
  }
}
```

**Use Case:** Real-time autocomplete as user types.

---

## Multi-Category Search

### Search Multiple Categories

Search across multiple categories simultaneously.

**Endpoint:** `GET /api/v1/search/multi-category`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryIds | string | Yes | Comma-separated category IDs |
| query | string | No | Search text |
| minPrice | number | No | Minimum price |
| maxPrice | number | No | Maximum price |
| condition | string | No | Item condition |
| location | string | No | Location filter |
| page | number | No | Page number |
| limit | number | No | Items per page |
| sortBy | enum | No | Sort order |

**Example:**

```
GET /api/v1/search/multi-category?categoryIds=cat1,cat2,cat3&query=phone&minPrice=1000
```

**Response:**

Same as [Main Search](#main-search) response, with merged results from all categories.

---

## Best Practices

### For Frontend Implementation

1. **Debounce Search Input**: Wait 300-500ms after user stops typing
2. **Use Autocomplete**: Show suggestions as user types
3. **Cache Results**: Cache search results locally for 5 minutes
4. **Show Loading State**: Display skeleton/spinner during search
5. **Infinite Scroll**: Load more results as user scrolls
6. **Filter UI**: Use checkboxes, sliders for better UX
7. **Clear Filters**: Provide easy way to reset all filters

### For Search Optimization

1. **Use AI Search**: For natural language queries
2. **Use Main Search**: For filtered/structured queries
3. **Track Searches**: Enable search history for better UX
4. **Save Frequent Searches**: Encourage users to save searches
5. **Show Popular Searches**: On empty search page
6. **Monitor Trends**: Use trending searches for insights

### For Performance

1. **Limit Results**: Don't exceed 100 items per page
2. **Use Pagination**: Don't load all results at once
3. **Index Fields**: Ensure database indexes on searchable fields
4. **Cache Popular**: Cache popular search results
5. **Async Tracking**: Search tracking is non-blocking

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Query must be at least 2 characters | Query too short |
| 400 | Not authorized to access this saved search | Wrong owner |
| 404 | Saved search not found | Invalid saved search ID |

---

## Example Use Cases

### 1. Basic Text Search

```javascript
// Search for "iphone"
GET /api/v1/search?query=iphone

// With filters
GET /api/v1/search?query=iphone&minPrice=5000&condition=NEW
```

### 2. Advanced Filtered Search

```javascript
// Business sellers in Cairo with high ratings
GET /api/v1/search?location=Cairo&userType=BUSINESS&minRating=4.5&verifiedSellers=true
```

### 3. Auction Search

```javascript
// Auctions ending soon
GET /api/v1/search?activeAuctions=true&endingSoon=true&sortBy=newest
```

### 4. AI Search Flow

```javascript
// User types: "I need a laptop for gaming"
GET /api/v1/search/ai?query=I need a laptop for gaming&limit=20

// AI expands to: laptop, gaming, notebook, computer, pc
// Returns results sorted by relevance
```

### 5. Autocomplete Flow

```javascript
// User types: "lapt"
GET /api/v1/search/autocomplete?query=lapt

// Returns: suggestions, matching items, matching categories
```

### 6. Saved Search Flow

```javascript
// 1. Save search
POST /api/v1/search/saved
{
  "name": "Gaming Laptops",
  "filters": { "query": "gaming laptop", "minPrice": 10000 },
  "notifyOnNew": true
}

// 2. Later, execute saved search
GET /api/v1/search/saved/{id}/execute

// 3. Get notified when new matches appear (future feature)
```

---

## Summary

The Advanced Search System provides:

- ✅ **20 API Endpoints** for comprehensive search
- ✅ **20+ Filter Options** for precise results
- ✅ **AI-Powered Search** with keyword expansion
- ✅ **Autocomplete** with real-time suggestions
- ✅ **Search History** for user convenience
- ✅ **Saved Searches** with notifications
- ✅ **Popular & Trending** for discovery
- ✅ **Multi-Category** search support

This system provides enterprise-grade search functionality comparable to major e-commerce platforms.
