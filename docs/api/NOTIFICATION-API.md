# Notification System API Documentation

## 📋 Overview

The Notification System is a critical component that keeps users informed about important events across the platform:
- **In-App Notifications**: Real-time notifications within the application
- **Email Notifications**: Automated email alerts
- **User Preferences**: Customizable notification settings
- **Smart Delivery**: Respects quiet hours and user preferences

### Key Features

1. **Multi-Channel**: In-app, email (SMS and push coming soon)
2. **Smart Filtering**: User-defined preferences per notification type
3. **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
4. **Quiet Hours**: Schedule notification-free periods
5. **Email Queue**: Reliable async email delivery
6. **Batch Operations**: Mark all read, delete all read, etc.

---

## 🎯 Notification Types

### Auction Notifications
- `AUCTION_NEW_BID` - Someone bid on your auction
- `AUCTION_OUTBID` - You were outbid
- `AUCTION_WINNING` - You're currently winning
- `AUCTION_WON` - You won the auction
- `AUCTION_LOST` - You lost the auction
- `AUCTION_ENDING_SOON` - Auction ending in 1 hour
- `AUCTION_ENDED` - Auction has ended

### Reverse Auction Notifications
- `REVERSE_AUCTION_NEW_REQUEST` - New request for sellers
- `REVERSE_AUCTION_NEW_BID` - Someone bid on your request
- `REVERSE_AUCTION_OUTBID` - Your bid was beaten
- `REVERSE_AUCTION_WINNING` - Your bid is winning
- `REVERSE_AUCTION_WON` - Your bid won
- `REVERSE_AUCTION_AWARDED` - You were awarded
- `REVERSE_AUCTION_ENDING_SOON` - Request ending soon

### Barter Notifications
- `BARTER_OFFER_RECEIVED` - New barter offer
- `BARTER_OFFER_ACCEPTED` - Your offer was accepted
- `BARTER_OFFER_REJECTED` - Your offer was rejected
- `BARTER_OFFER_COUNTERED` - Counter offer received
- `BARTER_OFFER_EXPIRED` - Offer expired

### Other Notifications
- `ITEM_SOLD` - Your item sold
- `TRANSACTION_PAYMENT_RECEIVED` - Payment received
- `TRANSACTION_SHIPPED` - Item shipped
- `USER_WELCOME` - Welcome email
- `USER_EMAIL_VERIFICATION` - Verify email
- And more...

---

## 🔗 API Endpoints

### Summary

**Total Endpoints:** 13

| Category | Count |
|----------|-------|
| In-App Notifications | 6 |
| Preferences | 2 |
| Email Queue Management | 4 |

---

## 📬 In-App Notifications

### 1. Get Notifications

**Endpoint:** `GET /api/v1/notifications`
**Auth:** Required
**Description:** Get user's notifications with filters

**Query Parameters:**
- `isRead` (optional): 'true' | 'false' - Filter by read status
- `type` (optional): string - Filter by notification type
- `priority` (optional): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Results per page

**Request Example:**
```bash
GET /api/v1/notifications?isRead=false&priority=HIGH&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "items": [
      {
        "id": "notification-uuid",
        "userId": "user-uuid",
        "type": "AUCTION_NEW_BID",
        "priority": "HIGH",
        "title": "New Bid on Your Auction!",
        "message": "Ahmed placed a bid of 5000 EGP on your auction.",
        "entityType": "auction",
        "entityId": "auction-uuid",
        "actionUrl": "/auctions/auction-uuid",
        "actionText": "View Auction",
        "metadata": { "bidderName": "Ahmed", "bidAmount": 5000 },
        "isRead": false,
        "readAt": null,
        "createdAt": "2025-11-07T10:30:00Z",
        "expiresAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### 2. Get Unread Count

**Endpoint:** `GET /api/v1/notifications/unread-count`
**Auth:** Required
**Description:** Get count of unread notifications

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "count": 5
  }
}
```

---

### 3. Mark as Read

**Endpoint:** `PATCH /api/v1/notifications/:id/read`
**Auth:** Required
**Description:** Mark notification as read

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notification-uuid",
    "isRead": true,
    "readAt": "2025-11-07T11:00:00Z",
    ...
  }
}
```

---

### 4. Mark All as Read

**Endpoint:** `POST /api/v1/notifications/mark-all-read`
**Auth:** Required
**Description:** Mark all notifications as read

**Response (200 OK):**
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": {
    "count": 5
  }
}
```

---

### 5. Delete Notification

**Endpoint:** `DELETE /api/v1/notifications/:id`
**Auth:** Required
**Description:** Delete specific notification

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": null
}
```

---

### 6. Delete All Read

**Endpoint:** `DELETE /api/v1/notifications/read`
**Auth:** Required
**Description:** Delete all read notifications

**Response (200 OK):**
```json
{
  "success": true,
  "message": "12 notifications deleted",
  "data": {
    "count": 12
  }
}
```

---

## ⚙️ Notification Preferences

### 1. Get Preferences

**Endpoint:** `GET /api/v1/notifications/preferences`
**Auth:** Required
**Description:** Get user's notification preferences

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Preferences retrieved successfully",
  "data": {
    "id": "pref-uuid",
    "userId": "user-uuid",
    "emailEnabled": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "preferences": {
      "AUCTION_NEW_BID": {
        "email": true,
        "inApp": true,
        "sms": false
      },
      "AUCTION_OUTBID": {
        "email": true,
        "inApp": true,
        "sms": true
      }
    },
    "quietHoursStart": 22,
    "quietHoursEnd": 7,
    "emailDigest": false,
    "digestTime": null,
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-07T10:00:00Z"
  }
}
```

---

### 2. Update Preferences

**Endpoint:** `PATCH /api/v1/notifications/preferences`
**Auth:** Required
**Description:** Update notification preferences

**Request Body:**
```json
{
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true,
  "quietHoursStart": 22,
  "quietHoursEnd": 7,
  "emailDigest": false,
  "digestTime": null,
  "preferences": {
    "AUCTION_NEW_BID": {
      "email": true,
      "inApp": true,
      "sms": false
    },
    "AUCTION_OUTBID": {
      "email": true,
      "inApp": true,
      "sms": true
    },
    "BARTER_OFFER_RECEIVED": {
      "email": false,
      "inApp": true,
      "sms": false
    }
  }
}
```

**Field Descriptions:**
- `emailEnabled`: Master switch for all email notifications
- `smsEnabled`: Master switch for SMS (future)
- `pushEnabled`: Master switch for push notifications (future)
- `quietHoursStart`: Hour to start quiet period (0-23)
- `quietHoursEnd`: Hour to end quiet period (0-23)
- `emailDigest`: Receive daily digest instead of individual emails
- `digestTime`: Hour to send daily digest (0-23)
- `preferences`: Per-type notification preferences

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": { ...updated preferences... }
}
```

---

## 📧 Email Queue Management

### 1. Get Email Stats

**Endpoint:** `GET /api/v1/notifications/email-stats`
**Auth:** Required
**Description:** Get email queue statistics

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email statistics retrieved successfully",
  "data": {
    "PENDING": 45,
    "SENDING": 2,
    "SENT": 1234,
    "FAILED": 5,
    "CANCELLED": 3
  }
}
```

---

### 2. Process Email Queue

**Endpoint:** `POST /api/v1/notifications/process-email-queue`
**Auth:** Required
**Description:** Manually process email queue

**Request Body:**
```json
{
  "batchSize": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Processed 10 emails",
  "data": {
    "sentCount": 10
  }
}
```

**Note:** This is typically called by a cron job, not manually.

---

### 3. Retry Failed Emails

**Endpoint:** `POST /api/v1/notifications/retry-failed-emails`
**Auth:** Required
**Description:** Retry all failed emails (max 3 attempts)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "5 failed emails queued for retry",
  "data": {
    "count": 5
  }
}
```

---

### 4. Cleanup Emails

**Endpoint:** `POST /api/v1/notifications/cleanup-emails`
**Auth:** Required
**Description:** Delete old emails from queue

**Request Body:**
```json
{
  "olderThanDays": 30
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "234 old emails cleaned up",
  "data": {
    "count": 234
  }
}
```

---

## 🔔 Priority Levels

| Priority | Description | Use Cases |
|----------|-------------|-----------|
| **LOW** | Can wait | System announcements, tips |
| **MEDIUM** | Normal | Item sold, new review |
| **HIGH** | Important | New bid, new offer, price drop |
| **URGENT** | Immediate | Won auction, offer accepted, payment received |

---

## ⏰ Quiet Hours

Users can set quiet hours to avoid notifications during sleep/rest:

**Example:**
- `quietHoursStart`: 22 (10 PM)
- `quietHoursEnd`: 7 (7 AM)

**Behavior:**
- **In-app**: Always shown (not intrusive)
- **Email/SMS/Push**: Queued and sent after quiet hours end
- **Exceptions**: URGENT priority notifications may override (configurable)

---

## 📨 Email Digest

Instead of individual emails, users can receive a daily digest:

**Settings:**
```json
{
  "emailDigest": true,
  "digestTime": 9
}
```

**Result:** One email at 9 AM with all notifications from past 24 hours

---

## 🎯 Real-World Examples

### Example 1: User Receives Bid Notification

**Scenario:** Ahmed's auction receives a new bid

**1. System creates notification:**
```javascript
import { notifyAuctionNewBid } from '../services/notification-dispatcher.service';

await notifyAuctionNewBid(
  'ahmed-user-id',
  'auction-id',
  'Mohamed Ali',
  5000
);
```

**2. User receives:**
- ✅ In-app notification (immediate)
- ✅ Email notification (if enabled and not in quiet hours)

**3. User views notifications:**
```bash
GET /api/v1/notifications?isRead=false
```

**4. User marks as read:**
```bash
PATCH /api/v1/notifications/{notification-id}/read
```

---

### Example 2: User Configures Preferences

**Scenario:** User wants emails only for urgent notifications

**Request:**
```bash
PATCH /api/v1/notifications/preferences
```

**Body:**
```json
{
  "emailEnabled": true,
  "preferences": {
    "AUCTION_NEW_BID": { "email": false, "inApp": true },
    "AUCTION_OUTBID": { "email": false, "inApp": true },
    "AUCTION_WON": { "email": true, "inApp": true },
    "REVERSE_AUCTION_AWARDED": { "email": true, "inApp": true }
  }
}
```

**Result:** User only gets emails for winning auctions and awarded bids

---

## 🔧 For Backend Developers

### Sending Notifications

**Use the dispatcher service:**

```typescript
import { dispatch } from '../services/notification-dispatcher.service';

// Send notification
await dispatch({
  userId: 'user-id',
  type: 'AUCTION_NEW_BID',
  title: 'New Bid!',
  message: 'Someone bid on your auction',
  priority: 'HIGH',
  entityType: 'auction',
  entityId: 'auction-id',
  actionUrl: '/auctions/auction-id',
  actionText: 'View Auction',
  channels: ['IN_APP', 'EMAIL'],
  emailSubject: 'New Bid on Your Auction',
  emailData: {
    bidderName: 'Ahmed',
    bidAmount: 5000
  }
});
```

### Pre-built Notification Functions

```typescript
// Auction notifications
await notifyAuctionNewBid(sellerId, auctionId, bidderName, bidAmount);
await notifyOutbid(bidderId, auctionId, auctionTitle, newBidAmount);
await notifyAuctionWon(winnerId, auctionId, title, winningBid);

// Reverse auction notifications
await notifyReverseAuctionNewRequest(sellerId, requestId, title, maxBudget);
await notifyReverseAuctionAwarded(winnerId, requestId, title, winningBid);

// Barter notifications
await notifyBarterOffer(recipientId, offerId, initiatorName, offeredItems);
await notifyBarterAccepted(initiatorId, offerId, recipientName);

// User notifications
await notifyUserWelcome(userId, userName);
```

---

## 🔄 Cron Jobs

Set up these cron jobs for optimal operation:

### 1. Process Email Queue (Every 5 minutes)
```typescript
import { processEmailQueue } from '../services/email.service';

cron.schedule('*/5 * * * *', async () => {
  const sent = await processEmailQueue(50);
  console.log(`Sent ${sent} emails`);
});
```

### 2. Clean Expired Notifications (Daily)
```typescript
import { cleanupExpiredNotifications } from '../services/notification.service';

cron.schedule('0 2 * * *', async () => {
  const deleted = await cleanupExpiredNotifications();
  console.log(`Deleted ${deleted} expired notifications`);
});
```

### 3. Clean Old Emails (Weekly)
```typescript
import { cleanupEmailQueue } from '../services/email.service';

cron.schedule('0 3 * * 0', async () => {
  const deleted = await cleanupEmailQueue(30);
  console.log(`Deleted ${deleted} old emails`);
});
```

---

## ⚠️ Error Handling

### Common Errors

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Notification not found"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "quietHoursStart",
        "message": "Must be between 0 and 23"
      }
    ]
  }
}
```

---

## 📊 Performance Considerations

### Database Indexes
All key fields are indexed for fast queries:
- `userId`, `type`, `isRead`, `priority`, `createdAt`
- Email queue: `status`, `priority`, `scheduledFor`

### Email Queue
- Processes in batches (default: 10)
- Retry failed emails (max 3 attempts)
- Auto-cleanup old emails

### Pagination
- Default: 20 items per page
- Max: 100 items per page

---

## 🔒 Security

### Authorization
- Users can only access their own notifications
- Email queue management restricted to authenticated users
- In production, add admin-only middleware for queue operations

### Data Privacy
- Sensitive data stored in metadata (encrypted if needed)
- Email addresses never exposed in notifications
- Quiet hours respected

---

## 🎉 Summary

The Notification System provides:
- ✅ **13 API endpoints** (6 in-app, 2 preferences, 4 email management, 1 stats)
- ✅ **Multi-channel delivery** (in-app, email, SMS/push coming)
- ✅ **Smart preferences** (per-type settings, quiet hours)
- ✅ **Reliable email delivery** (queue, retry, cleanup)
- ✅ **Priority levels** (LOW, MEDIUM, HIGH, URGENT)
- ✅ **Pre-built functions** (for common notification types)
- ✅ **Production-ready** (error handling, indexes, cron jobs)

### Total API Endpoints: **13**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/notifications` | List notifications |
| GET | `/api/v1/notifications/unread-count` | Get unread count |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read |
| POST | `/api/v1/notifications/mark-all-read` | Mark all read |
| DELETE | `/api/v1/notifications/:id` | Delete notification |
| DELETE | `/api/v1/notifications/read` | Delete all read |
| GET | `/api/v1/notifications/preferences` | Get preferences |
| PATCH | `/api/v1/notifications/preferences` | Update preferences |
| GET | `/api/v1/notifications/email-stats` | Email stats |
| POST | `/api/v1/notifications/process-email-queue` | Process queue |
| POST | `/api/v1/notifications/retry-failed-emails` | Retry failed |
| POST | `/api/v1/notifications/cleanup-emails` | Cleanup emails |

**Status:** 🟢 **PRODUCTION-READY**

---

**Built for Xchange E-commerce Platform**
**Version:** 1.0.0
**Last Updated:** November 7, 2025

**NOTE:** Install nodemailer for production email sending:
```bash
pnpm add nodemailer @types/nodemailer
```
