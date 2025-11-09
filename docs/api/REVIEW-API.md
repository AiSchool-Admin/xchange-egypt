# Review & Rating API Documentation

Complete API documentation for the Xchange Review and Rating System.

## Table of Contents

- [Overview](#overview)
- [Review CRUD Operations](#review-crud-operations)
- [Review Responses](#review-responses)
- [Review Voting](#review-voting)
- [Review Reporting](#review-reporting)
- [Statistics & Analytics](#statistics--analytics)
- [Data Models](#data-models)
- [Best Practices](#best-practices)

---

## Overview

The Review & Rating System allows users to provide feedback on transactions and other users. It includes:

- **Comprehensive Reviews**: Star ratings with detailed criteria
- **Verified Purchase Badges**: Distinguish real buyers
- **Seller Responses**: Allow sellers to respond to feedback
- **Helpful Voting**: Community-driven review quality
- **Moderation**: Report and flag inappropriate reviews
- **Analytics**: Detailed statistics and insights

### Review Types

- `SELLER_REVIEW` - Review of a seller/vendor (default)
- `BUYER_REVIEW` - Review of a buyer
- `ITEM_REVIEW` - Review of an item/product

### Review Status

- `PENDING` - Awaiting moderation (optional)
- `APPROVED` - Approved and visible (default)
- `REJECTED` - Rejected by moderator
- `FLAGGED` - Flagged for review (auto-flagged at 3+ reports)
- `HIDDEN` - Hidden by admin

### Rating Criteria

All ratings are on a **1-5 star scale**:

- **Overall Rating** (required) - Overall experience
- **Item as Described** (optional) - Item matched description
- **Communication** (optional) - Seller communication quality
- **Shipping Speed** (optional) - How quickly item arrived
- **Packaging** (optional) - Item packaging quality

---

## Review CRUD Operations

### 1. Create Review

Create a new review for a transaction.

**Endpoint:** `POST /api/v1/reviews`

**Authentication:** Required

**Request Body:**

```json
{
  "transactionId": "uuid",
  "reviewedId": "uuid",
  "reviewType": "SELLER_REVIEW",
  "overallRating": 5,
  "itemAsDescribed": 5,
  "communication": 5,
  "shippingSpeed": 4,
  "packaging": 5,
  "title": "Excellent seller!",
  "comment": "Fast shipping, item exactly as described. Would buy again!",
  "images": [
    "https://example.com/review-image-1.jpg",
    "https://example.com/review-image-2.jpg"
  ]
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transactionId | string (UUID) | Yes | Transaction being reviewed |
| reviewedId | string (UUID) | Yes | User being reviewed |
| reviewType | enum | No | Type of review (default: SELLER_REVIEW) |
| overallRating | number (1-5) | Yes | Overall star rating |
| itemAsDescribed | number (1-5) | No | Item description accuracy |
| communication | number (1-5) | No | Communication quality |
| shippingSpeed | number (1-5) | No | Shipping speed |
| packaging | number (1-5) | No | Packaging quality |
| title | string | No | Review headline (3-100 chars) |
| comment | string | No | Review text (10-2000 chars) |
| images | array | No | Review images (max 5) |

**Response:**

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "uuid",
    "transactionId": "uuid",
    "reviewerId": "uuid",
    "reviewedId": "uuid",
    "reviewType": "SELLER_REVIEW",
    "overallRating": 5,
    "itemAsDescribed": 5,
    "communication": 5,
    "shippingSpeed": 4,
    "packaging": 5,
    "title": "Excellent seller!",
    "comment": "Fast shipping, item exactly as described. Would buy again!",
    "images": ["https://example.com/review-image-1.jpg"],
    "isVerifiedPurchase": true,
    "status": "APPROVED",
    "helpfulCount": 0,
    "notHelpfulCount": 0,
    "reportCount": 0,
    "isEdited": false,
    "editedAt": null,
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z",
    "reviewer": {
      "id": "uuid",
      "fullName": "Ahmed Hassan",
      "avatar": "https://example.com/avatar.jpg"
    },
    "reviewed": {
      "id": "uuid",
      "fullName": "Mohamed Ali"
    }
  }
}
```

**Validation:**

- User must be part of the transaction (buyer or seller)
- User can only review each transaction once
- Transaction must be completed (delivered)
- All ratings must be 1-5
- Verified purchase is auto-detected based on payment status

**Notifications:**

- Reviewed user receives notification of new review

---

### 2. Get Reviews

Get a paginated list of reviews with filters.

**Endpoint:** `GET /api/v1/reviews`

**Authentication:** Optional (filters by status if not authenticated)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| reviewedId | UUID | Filter by user being reviewed |
| reviewerId | UUID | Filter by reviewer |
| transactionId | UUID | Filter by transaction |
| reviewType | enum | Filter by review type |
| status | enum | Filter by status (default: APPROVED for public) |
| minRating | number | Minimum rating (1-5) |
| maxRating | number | Maximum rating (1-5) |
| isVerifiedPurchase | boolean | Filter verified purchases only |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| sortBy | enum | Sort order: recent, rating_high, rating_low, helpful |

**Example Request:**

```
GET /api/v1/reviews?reviewedId=user-uuid&minRating=4&sortBy=helpful&page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "overallRating": 5,
        "title": "Excellent seller!",
        "comment": "Fast shipping...",
        "images": ["https://..."],
        "isVerifiedPurchase": true,
        "helpfulCount": 12,
        "notHelpfulCount": 1,
        "createdAt": "2025-11-07T10:00:00.000Z",
        "reviewer": {
          "id": "uuid",
          "fullName": "Ahmed Hassan",
          "avatar": "https://...",
          "rating": 4.8,
          "totalReviews": 45
        },
        "response": {
          "id": "uuid",
          "message": "Thank you for the kind words!",
          "createdAt": "2025-11-07T11:00:00.000Z"
        },
        "_count": {
          "votes": 13
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 48,
      "totalPages": 5
    }
  }
}
```

---

### 3. Get Single Review

Get detailed information about a specific review.

**Endpoint:** `GET /api/v1/reviews/:id`

**Authentication:** Optional

**Response:**

```json
{
  "success": true,
  "message": "Review retrieved successfully",
  "data": {
    "id": "uuid",
    "transactionId": "uuid",
    "reviewerId": "uuid",
    "reviewedId": "uuid",
    "reviewType": "SELLER_REVIEW",
    "overallRating": 5,
    "itemAsDescribed": 5,
    "communication": 5,
    "shippingSpeed": 4,
    "packaging": 5,
    "title": "Excellent seller!",
    "comment": "Fast shipping, item exactly as described...",
    "images": ["https://..."],
    "isVerifiedPurchase": true,
    "status": "APPROVED",
    "helpfulCount": 12,
    "notHelpfulCount": 1,
    "reportCount": 0,
    "isEdited": false,
    "editedAt": null,
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z",
    "reviewer": {
      "id": "uuid",
      "fullName": "Ahmed Hassan",
      "avatar": "https://...",
      "rating": 4.8,
      "totalReviews": 45
    },
    "reviewed": {
      "id": "uuid",
      "fullName": "Mohamed Ali",
      "avatar": "https://...",
      "rating": 4.9
    },
    "transaction": {
      "id": "uuid",
      "transactionType": "DIRECT_SALE",
      "createdAt": "2025-11-01T10:00:00.000Z"
    },
    "response": {
      "id": "uuid",
      "responderId": "uuid",
      "message": "Thank you for the kind words!",
      "isEdited": false,
      "editedAt": null,
      "createdAt": "2025-11-07T11:00:00.000Z",
      "updatedAt": "2025-11-07T11:00:00.000Z"
    },
    "votes": [
      {
        "id": "uuid",
        "userId": "uuid",
        "isHelpful": true
      }
    ]
  }
}
```

---

### 4. Update Review

Update an existing review (only by the reviewer).

**Endpoint:** `PATCH /api/v1/reviews/:id`

**Authentication:** Required

**Request Body:**

```json
{
  "overallRating": 4,
  "title": "Updated title",
  "comment": "Updated comment with more details...",
  "itemAsDescribed": 5,
  "communication": 4
}
```

**Response:**

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "uuid",
    "overallRating": 4,
    "title": "Updated title",
    "comment": "Updated comment...",
    "isEdited": true,
    "editedAt": "2025-11-07T12:00:00.000Z",
    // ... other fields
  }
}
```

**Notes:**

- Only the reviewer can update their review
- `isEdited` is set to `true` and `editedAt` is updated
- User's average rating is recalculated if overall rating changed

---

### 5. Delete Review

Delete a review (only by the reviewer).

**Endpoint:** `DELETE /api/v1/reviews/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null
}
```

**Notes:**

- Only the reviewer can delete their review
- User's average rating is recalculated
- All associated data (votes, reports, response) are deleted

---

## Review Responses

### 1. Add Response to Review

Allow the reviewed user to respond to a review.

**Endpoint:** `POST /api/v1/reviews/:id/response`

**Authentication:** Required

**Request Body:**

```json
{
  "message": "Thank you for the kind words! I'm glad you enjoyed your purchase."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "id": "uuid",
    "reviewId": "uuid",
    "responderId": "uuid",
    "message": "Thank you for the kind words!...",
    "isEdited": false,
    "editedAt": null,
    "createdAt": "2025-11-07T11:00:00.000Z",
    "updatedAt": "2025-11-07T11:00:00.000Z"
  }
}
```

**Validation:**

- Only the reviewed person can respond
- Only one response per review
- Message must be 10-1000 characters

---

### 2. Update Response

Update an existing response.

**Endpoint:** `PATCH /api/v1/reviews/responses/:id`

**Authentication:** Required

**Request Body:**

```json
{
  "message": "Updated response message..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Response updated successfully",
  "data": {
    "id": "uuid",
    "message": "Updated response message...",
    "isEdited": true,
    "editedAt": "2025-11-07T13:00:00.000Z",
    // ... other fields
  }
}
```

---

### 3. Delete Response

Delete a response.

**Endpoint:** `DELETE /api/v1/reviews/responses/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Response deleted successfully",
  "data": null
}
```

---

## Review Voting

### 1. Vote on Review

Vote a review as helpful or not helpful.

**Endpoint:** `POST /api/v1/reviews/:id/vote`

**Authentication:** Required

**Request Body:**

```json
{
  "isHelpful": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "id": "uuid",
    "reviewId": "uuid",
    "userId": "uuid",
    "isHelpful": true,
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

**Notes:**

- Users can vote once per review
- Changing vote updates counts automatically
- Review's `helpfulCount` or `notHelpfulCount` is updated

---

### 2. Remove Vote

Remove your vote from a review.

**Endpoint:** `DELETE /api/v1/reviews/:id/vote`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Vote removed successfully",
  "data": null
}
```

---

## Review Reporting

### 1. Report Review

Report an inappropriate review.

**Endpoint:** `POST /api/v1/reviews/:id/report`

**Authentication:** Required

**Request Body:**

```json
{
  "reason": "SPAM",
  "description": "This review is clearly spam and unrelated to the product."
}
```

**Report Reasons:**

- `SPAM` - Spam or promotional content
- `OFFENSIVE_LANGUAGE` - Contains offensive language
- `FAKE_REVIEW` - Suspected fake review
- `IRRELEVANT` - Irrelevant to the product/transaction
- `PERSONAL_INFORMATION` - Contains personal information
- `OTHER` - Other reason (description required)

**Response:**

```json
{
  "success": true,
  "message": "Review reported successfully",
  "data": {
    "id": "uuid",
    "reviewId": "uuid",
    "reporterId": "uuid",
    "reason": "SPAM",
    "description": "This review is clearly spam...",
    "isResolved": false,
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

**Notes:**

- Users can report each review once
- Review is auto-flagged at 3+ reports
- `reportCount` is incremented

---

### 2. Get Review Reports

Get all reports for a review (Admin/Moderation).

**Endpoint:** `GET /api/v1/reviews/:id/reports`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "reviewId": "uuid",
      "reporterId": "uuid",
      "reason": "SPAM",
      "description": "This review is clearly spam...",
      "isResolved": false,
      "resolvedAt": null,
      "resolvedBy": null,
      "resolution": null,
      "createdAt": "2025-11-07T10:00:00.000Z"
    }
  ]
}
```

---

## Statistics & Analytics

### 1. Get User Review Statistics

Get comprehensive review statistics for a user.

**Endpoint:** `GET /api/v1/reviews/users/:userId/stats`

**Authentication:** Optional

**Response:**

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalReviews": 48,
    "averageRating": 4.8,
    "ratingBreakdown": {
      "1": 1,
      "2": 2,
      "3": 5,
      "4": 15,
      "5": 25
    },
    "verifiedPurchasePercentage": 92,
    "detailedRatings": {
      "itemAsDescribed": 4.9,
      "communication": 4.8,
      "shippingSpeed": 4.7,
      "packaging": 4.8
    }
  }
}
```

**Fields:**

- **totalReviews**: Total number of approved reviews
- **averageRating**: Average overall rating (rounded to 1 decimal)
- **ratingBreakdown**: Count of each star rating (1-5)
- **verifiedPurchasePercentage**: % of verified purchases
- **detailedRatings**: Average of detailed criteria

---

### 2. Check if User Can Review

Check if a user can review a transaction.

**Endpoint:** `GET /api/v1/reviews/transactions/:transactionId/can-review`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Check completed successfully",
  "data": {
    "canReview": true
  }
}
```

**Or if cannot review:**

```json
{
  "success": true,
  "message": "Check completed successfully",
  "data": {
    "canReview": false,
    "reason": "Transaction must be completed before reviewing"
  }
}
```

**Possible Reasons:**

- "Transaction not found"
- "You are not part of this transaction"
- "You have already reviewed this transaction"
- "Transaction must be completed before reviewing"

---

## Data Models

### Review Object

```typescript
{
  id: string;                    // UUID
  transactionId: string;         // UUID
  reviewerId: string;            // UUID
  reviewedId: string;            // UUID
  reviewType: ReviewType;        // SELLER_REVIEW | BUYER_REVIEW | ITEM_REVIEW

  // Ratings (1-5)
  overallRating: number;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
  packaging?: number;

  // Content
  title?: string;
  comment?: string;
  images: string[];              // Array of URLs

  // Verification
  isVerifiedPurchase: boolean;

  // Status
  status: ReviewStatus;          // PENDING | APPROVED | REJECTED | FLAGGED | HIDDEN

  // Engagement
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;

  // Edit tracking
  isEdited: boolean;
  editedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations
  reviewer: User;
  reviewed: User;
  transaction: Transaction;
  response?: ReviewResponse;
  votes: ReviewVote[];
  reports: ReviewReport[];
}
```

### ReviewResponse Object

```typescript
{
  id: string;
  reviewId: string;
  responderId: string;
  message: string;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### ReviewVote Object

```typescript
{
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;           // true = helpful, false = not helpful
  createdAt: Date;
}
```

### ReviewReport Object

```typescript
{
  id: string;
  reviewId: string;
  reporterId: string;
  reason: ReportReason;
  description?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  createdAt: Date;
}
```

---

## Best Practices

### For Reviewers

1. **Be Honest**: Provide truthful feedback based on your experience
2. **Be Specific**: Detail what you liked or didn't like
3. **Add Photos**: Include photos of the item received
4. **Wait for Delivery**: Only review after receiving the item
5. **Update if Needed**: Edit your review if situation changes

### For Sellers (Responding)

1. **Be Professional**: Keep responses professional and courteous
2. **Thank Reviewers**: Thank customers for positive reviews
3. **Address Issues**: For negative reviews, acknowledge concerns
4. **Don't Argue**: Never argue or be defensive
5. **Offer Solutions**: Suggest solutions for problems mentioned

### For Implementation

1. **Auto-Approval**: Reviews are auto-approved by default
2. **Moderation Queue**: Implement manual moderation for flagged reviews
3. **Email Notifications**: Notify users of new reviews
4. **Badges**: Show verified purchase badges prominently
5. **Helpful Sorting**: Default sort by "most helpful"
6. **Response Time**: Track and display average response time
7. **Review Reminders**: Send email reminders to leave reviews
8. **Incentives**: Consider offering incentives for detailed reviews

### Moderation Guidelines

1. **Review Flagged Items**: Check flagged reviews daily
2. **Ban Patterns**: Look for spam patterns (same text, multiple reviews)
3. **Fake Reviews**: Check for fake reviews from new accounts
4. **Personal Info**: Remove reviews containing personal information
5. **Keep Record**: Log all moderation actions

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | You have already reviewed this transaction | Duplicate review attempt |
| 400 | Overall rating must be between 1 and 5 | Invalid rating value |
| 400 | Response already exists. Use update instead. | Duplicate response |
| 403 | You can only review transactions you are part of | Not authorized |
| 403 | You can only update your own reviews | Not authorized |
| 403 | You can only respond to reviews about you | Not authorized |
| 404 | Review not found | Review doesn't exist |
| 404 | Transaction not found | Transaction doesn't exist |

---

## Example Workflows

### Complete Review Flow

```javascript
// 1. Check if user can review
GET /api/v1/reviews/transactions/txn-123/can-review
// Response: { canReview: true }

// 2. Create review
POST /api/v1/reviews
{
  "transactionId": "txn-123",
  "reviewedId": "seller-456",
  "overallRating": 5,
  "comment": "Great seller!",
  "itemAsDescribed": 5,
  "communication": 5
}

// 3. Seller receives notification and responds
POST /api/v1/reviews/review-789/response
{
  "message": "Thank you for the kind words!"
}

// 4. Other users vote on helpfulness
POST /api/v1/reviews/review-789/vote
{
  "isHelpful": true
}
```

### Getting User's Reviews

```javascript
// Get all reviews for a seller
GET /api/v1/reviews?reviewedId=seller-456&sortBy=helpful&limit=20

// Get only 5-star reviews
GET /api/v1/reviews?reviewedId=seller-456&minRating=5

// Get verified purchases only
GET /api/v1/reviews?reviewedId=seller-456&isVerifiedPurchase=true
```

---

## Summary

The Review & Rating System provides:

- ✅ **16 API Endpoints** for complete review management
- ✅ **Comprehensive Ratings** with 5 detailed criteria
- ✅ **Verified Purchase** badges for authenticity
- ✅ **Seller Responses** for customer engagement
- ✅ **Community Voting** for review quality
- ✅ **Moderation Tools** for content control
- ✅ **Rich Analytics** for insights and trust

This system builds trust, transparency, and accountability in the marketplace.
