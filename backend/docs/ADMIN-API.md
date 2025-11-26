# Admin API Documentation

Comprehensive admin dashboard API for managing the Xchange platform.

## 🔐 Authentication

All admin endpoints require:
1. Valid JWT access token in Authorization header
2. User must have `user_type: ADMIN`
3. All actions are logged for audit trail

```bash
Authorization: Bearer <your-admin-jwt-token>
```

## 📊 Dashboard & Statistics

### Get Dashboard Stats
Get comprehensive platform statistics.

```http
GET /api/v1/admin/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1523,
      "active": 1420,
      "pending": 45,
      "suspended": 58
    },
    "categories": {
      "total": 218
    },
    "items": {
      "total": 5420,
      "active": 4890,
      "inactive": 530
    },
    "listings": {
      "total": 3210,
      "active": 2850,
      "inactive": 360
    },
    "transactions": {
      "total": 1890,
      "completed": 1654,
      "pending": 236
    },
    "disputes": {
      "pending": 12
    }
  }
}
```

---

## 👥 User Management

### Get All Users
Get paginated list of users with filters.

```http
GET /api/v1/admin/users?page=1&limit=20&status=ACTIVE&user_type=INDIVIDUAL&search=john
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `status` (string, optional) - Filter by status: ACTIVE | PENDING | SUSPENDED | BANNED
- `user_type` (string, optional) - Filter by type: INDIVIDUAL | BUSINESS | ADMIN
- `search` (string, optional) - Search by email, name, or phone
- `sort_by` (string, default: created_at) - Sort field
- `sort_order` (string, default: desc) - Sort order: asc | desc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "+201234567890",
      "user_type": "INDIVIDUAL",
      "status": "ACTIVE",
      "email_verified": true,
      "phone_verified": true,
      "rating": 4.5,
      "total_reviews": 23,
      "total_transactions": 45,
      "created_at": "2025-01-15T10:30:00Z",
      "last_login": "2025-01-26T08:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1523,
    "totalPages": 77
  }
}
```

### Get User Details
Get detailed information about a specific user.

```http
GET /api/v1/admin/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "...": "...",
    "_count": {
      "items": 15,
      "listings": 8,
      "transactions_as_buyer": 12,
      "transactions_as_seller": 10,
      "reviews_received": 22,
      "reviews_given": 18
    }
  }
}
```

### Update User Status
Change user account status (activate, suspend, ban).

```http
PATCH /api/v1/admin/users/:id/status
```

**Body:**
```json
{
  "status": "SUSPENDED",
  "reason": "Violation of terms of service - spam listings"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated to SUSPENDED",
  "data": { "...": "updated user object" }
}
```

### Verify User Email
Manually verify user email (admin override).

```http
POST /api/v1/admin/users/:id/verify-email
```

### Verify User Phone
Manually verify user phone (admin override).

```http
POST /api/v1/admin/users/:id/verify-phone
```

### Delete User
Delete user account (soft or hard delete).

```http
DELETE /api/v1/admin/users/:id
```

**Body:**
```json
{
  "permanent": false  // true for hard delete, false for soft delete
}
```

**⚠️ Requires Super Admin role**

---

## 📁 Category Management

### Get All Categories
Get all categories including inactive ones.

```http
GET /api/v1/admin/categories?level=1&parent_id=uuid&include_inactive=true
```

**Query Parameters:**
- `level` (number, optional) - Filter by level: 1, 2, or 3
- `parent_id` (string, optional) - Filter by parent category ID
- `include_inactive` (boolean, default: true) - Include inactive categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name_en": "Electronics",
      "name_ar": "الإلكترونيات",
      "slug": "electronics",
      "icon": "📱",
      "level": 1,
      "parent_id": null,
      "is_active": true,
      "parent": null,
      "_count": {
        "children": 5,
        "items": 234
      }
    }
  ],
  "total": 218
}
```

### Create Category
Create a new category.

```http
POST /api/v1/admin/categories
```

**Body:**
```json
{
  "name_en": "Virtual Reality",
  "name_ar": "الواقع الافتراضي",
  "slug": "virtual-reality",
  "icon": "🥽",
  "level": 3,
  "parent_id": "uuid-of-parent",
  "description_en": "VR headsets and accessories",
  "description_ar": "نظارات الواقع الافتراضي والملحقات",
  "is_active": true
}
```

**Validation:**
- Level must be 1, 2, or 3
- Level 2 and 3 require `parent_id`
- Slug must be unique

### Update Category
Update category details.

```http
PATCH /api/v1/admin/categories/:id
```

**Body:**
```json
{
  "name_en": "Updated Name",
  "is_active": false
}
```

### Delete Category
Delete category (only if no items or children).

```http
DELETE /api/v1/admin/categories/:id
```

**⚠️ Requires Super Admin role**

**Note:** Category cannot be deleted if:
- It has items associated with it
- It has child categories

---

## 📝 Listing Moderation

### Get All Listings
Get all listings for moderation.

```http
GET /api/v1/admin/listings?page=1&limit=20&status=ACTIVE&flagged_only=true
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `status` (string, optional) - Filter by status
- `listing_type` (string, optional) - Filter by type: DIRECT_SALE | BARTER | AUCTION | REVERSE_AUCTION
- `flagged_only` (boolean) - Show only flagged listings

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "listing_type": "DIRECT_SALE",
      "status": "ACTIVE",
      "is_flagged": true,
      "flag_reason": "Suspected counterfeit item",
      "item": {
        "title": "iPhone 15 Pro",
        "description": "..."
      },
      "seller": {
        "id": "uuid",
        "full_name": "Seller Name",
        "email": "seller@example.com"
      }
    }
  ],
  "pagination": { "...": "..." }
}
```

### Flag Listing
Flag a listing for review.

```http
POST /api/v1/admin/listings/:id/flag
```

**Body:**
```json
{
  "reason": "Suspected counterfeit product - trademark violation"
}
```

### Approve Listing
Approve a flagged listing (remove flag).

```http
POST /api/v1/admin/listings/:id/approve
```

### Reject Listing
Reject and close a listing.

```http
POST /api/v1/admin/listings/:id/reject
```

**Body:**
```json
{
  "reason": "Violates community guidelines - counterfeit goods"
}
```

---

## ⚖️ Dispute Resolution

### Get All Disputes
Get all disputes for resolution.

```http
GET /api/v1/admin/disputes?page=1&limit=20&status=OPEN
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `status` (string, default: OPEN) - Filter by status: OPEN | RESOLVED | CLOSED

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "OPEN",
      "reason": "Item not as described",
      "description": "Received damaged product",
      "created_at": "2025-01-25T10:00:00Z",
      "transaction": {
        "id": "uuid",
        "buyer": {
          "id": "uuid",
          "full_name": "Buyer Name",
          "email": "buyer@example.com"
        },
        "seller": {
          "id": "uuid",
          "full_name": "Seller Name",
          "email": "seller@example.com"
        }
      },
      "initiated_by_user": {
        "id": "uuid",
        "full_name": "Buyer Name"
      }
    }
  ],
  "pagination": { "...": "..." }
}
```

### Resolve Dispute
Resolve a dispute in favor of one party.

```http
POST /api/v1/admin/disputes/:id/resolve
```

**Body:**
```json
{
  "resolution": "Item was indeed damaged. Refund approved for buyer. Seller's rating reduced by 0.5 points.",
  "resolved_in_favor_of": "BUYER"  // or "SELLER" or "NONE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute resolved",
  "data": {
    "id": "uuid",
    "status": "RESOLVED",
    "resolution": "...",
    "resolved_at": "2025-01-26T10:00:00Z"
  }
}
```

---

## 🛠️ Utility Endpoints

### Seed Categories
Re-seed all 218 categories (admin only).

```http
POST /api/v1/admin/seed-categories
```

**⚠️ Use with caution in production**

### Health Check
Check admin endpoints status.

```http
GET /api/v1/admin/health
```

**Response:**
```json
{
  "success": true,
  "message": "Admin endpoints are active",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "userType": "ADMIN"
  }
}
```

---

## 🔒 Authorization Levels

### Admin
Standard admin access - can:
- View all users, categories, listings, disputes
- Update user status
- Manage categories
- Moderate listings
- Resolve disputes

### Super Admin
Extended privileges - can:
- Everything Admin can do
- Delete users (soft/hard)
- Delete categories
- Access sensitive operations

---

## 📝 Audit Logging

All admin actions are automatically logged with:
- Timestamp
- Admin user ID and email
- Action performed (method + path)
- Request IP address
- User agent
- Request body (for non-GET requests)

Example log:
```json
{
  "timestamp": "2025-01-26T10:30:15.123Z",
  "action": "PATCH /api/v1/admin/users/:id/status",
  "user": {
    "id": "admin-uuid",
    "email": "admin@xchange.com",
    "type": "ADMIN"
  },
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "body": {
    "status": "SUSPENDED",
    "reason": "Spam"
  }
}
```

---

## ⚠️ Security Best Practices

1. **Never share admin credentials**
2. **Use strong, unique passwords**
3. **Enable 2FA for admin accounts** (when implemented)
4. **Regularly review audit logs**
5. **Only create admin accounts for trusted personnel**
6. **Use soft deletes before hard deletes**
7. **Document all major admin actions**

---

## 🚀 Usage Example

```javascript
// Login as admin
const loginResponse = await fetch('https://api.xchange.com/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@xchange.com',
    password: 'SecureAdminPassword123!',
  }),
});

const { accessToken } = await loginResponse.json();

// Get dashboard stats
const statsResponse = await fetch('https://api.xchange.com/api/v1/admin/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const stats = await statsResponse.json();
console.log('Platform Stats:', stats.data);

// Suspend a user
await fetch('https://api.xchange.com/api/v1/admin/users/user-uuid/status', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'SUSPENDED',
    reason: 'Violation of terms',
  }),
});
```

---

## 📚 Related Documentation

- [Authentication API](./AUTH-API.md)
- [User API](./USER-API.md)
- [Category API](./CATEGORY-API.md)
- [Testing Guide](../tests/README.md)
