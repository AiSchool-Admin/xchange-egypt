# User Management API Documentation

Base URL: `http://localhost:3001/api/v1/users`

---

## 📋 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/:id` | Get user by ID (public) | No |
| GET | `/:id/stats` | Get user statistics | No |
| PUT | `/profile/individual` | Update individual profile | Yes |
| PUT | `/profile/business` | Update business profile | Yes |
| POST | `/avatar` | Upload avatar | Yes |
| DELETE | `/avatar` | Delete avatar | Yes |
| PUT | `/password` | Change password | Yes |
| DELETE | `/account` | Delete account | Yes |

---

## 1. Get User by ID (Public Profile)

**Endpoint:** `GET /api/v1/users/:id`

**Description:** Get public profile information for any user

**Parameters:**
- `id` (path): User UUID

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid-here",
    "fullName": "أحمد محمد",
    "userType": "INDIVIDUAL",
    "avatar": "/uploads/avatars/avatar-123456.jpg",
    "bio": "مهتم بالتجارة الإلكترونية",
    "city": "Cairo",
    "governorate": "Cairo",
    "businessName": null,
    "rating": 4.5,
    "totalReviews": 10,
    "createdAt": "2025-11-06T10:00:00.000Z"
  }
}
```

**Note:** Email, phone, and other sensitive data are not included

---

## 2. Get User Statistics

**Endpoint:** `GET /api/v1/users/:id/stats`

**Description:** Get user's activity statistics

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "itemsCount": 15,
    "activeListingsCount": 5,
    "completedTransactionsCount": 8,
    "rating": 4.5,
    "totalReviews": 10
  }
}
```

---

## 3. Update Individual Profile

**Endpoint:** `PUT /api/v1/users/profile/individual`

**Description:** Update profile for individual accounts

**Authentication:** Required

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body

```json
{
  "fullName": "أحمد محمد علي",
  "phone": "01012345678",
  "bio": "مهتم بالتجارة الإلكترونية والمنتجات المستعملة",
  "address": "15 شارع النيل",
  "city": "Cairo",
  "governorate": "Cairo",
  "postalCode": "11511"
}
```

**All fields are optional** - only send fields you want to update.

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | No | Full name (min 3 chars) |
| phone | string | No | Egyptian phone (01xxxxxxxxx) |
| bio | string | No | Biography (max 500 chars) |
| address | string | No | Street address |
| city | string | No | City |
| governorate | string | No | Governorate |
| postalCode | string | No | Postal code |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "email": "ahmed@example.com",
    "fullName": "أحمد محمد علي",
    "phone": "01012345678",
    "userType": "INDIVIDUAL",
    "avatar": "/uploads/avatars/avatar-123.jpg",
    "bio": "مهتم بالتجارة الإلكترونية",
    "address": "15 شارع النيل",
    "city": "Cairo",
    "governorate": "Cairo",
    "postalCode": "11511",
    "rating": 4.5,
    "totalReviews": 10,
    "updatedAt": "2025-11-06T12:00:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request** - Wrong account type
```json
{
  "success": false,
  "error": {
    "message": "This endpoint is for individual accounts only"
  }
}
```

**409 Conflict** - Phone already in use
```json
{
  "success": false,
  "error": {
    "message": "Phone number is already in use"
  }
}
```

---

## 4. Update Business Profile

**Endpoint:** `PUT /api/v1/users/profile/business`

**Description:** Update profile for business accounts

**Authentication:** Required

### Request Body

```json
{
  "fullName": "محمد أحمد",
  "phone": "01012345678",
  "bio": "نوفر أفضل المنتجات المستعملة",
  "address": "20 شارع التحرير",
  "city": "Cairo",
  "governorate": "Cairo",
  "postalCode": "11511",
  "businessName": "شركة الأمل للتجارة",
  "taxId": "123-456-789",
  "commercialRegNo": "CR-12345"
}
```

### Request Fields

Same as individual profile, plus:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| businessName | string | No | Company name (min 3 chars) |
| taxId | string | No | Tax ID |
| commercialRegNo | string | No | Commercial registration number |

### Success Response (200 OK)

Similar to individual profile, with additional business fields.

---

## 5. Upload Avatar

**Endpoint:** `POST /api/v1/users/avatar`

**Description:** Upload user avatar image

**Authentication:** Required

### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| avatar | file | Yes | Image file (JPEG, PNG, GIF, WebP) |

**Constraints:**
- Max file size: 5MB (configurable)
- Accepted formats: JPEG, PNG, GIF, WebP
- Image will be automatically resized to 300x300px
- Converted to JPEG for optimization

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": "uuid-here",
    "email": "ahmed@example.com",
    "fullName": "أحمد محمد",
    "avatar": "/uploads/avatars/avatar-1699268123456-processed.jpg",
    "updatedAt": "2025-11-06T12:00:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request** - No file uploaded
```json
{
  "success": false,
  "error": {
    "message": "No file uploaded"
  }
}
```

**400 Bad Request** - Invalid file type
```json
{
  "success": false,
  "error": {
    "message": "Only image files (JPEG, PNG, GIF, WebP) are allowed"
  }
}
```

**400 Bad Request** - File too large
```json
{
  "success": false,
  "error": {
    "message": "File size too large. Maximum size is 5MB"
  }
}
```

---

## 6. Delete Avatar

**Endpoint:** `DELETE /api/v1/users/avatar`

**Description:** Delete user avatar

**Authentication:** Required

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Avatar deleted successfully",
  "data": {
    "id": "uuid-here",
    "email": "ahmed@example.com",
    "fullName": "أحمد محمد",
    "avatar": null,
    "updatedAt": "2025-11-06T12:00:00.000Z"
  }
}
```

---

## 7. Change Password

**Endpoint:** `PUT /api/v1/users/password`

**Description:** Change user password

**Authentication:** Required

### Request Body

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | New password (min 8, uppercase, lowercase, number) |
| confirmPassword | string | Yes | Confirm new password |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Password changed successfully. Please login again.",
  "data": {
    "message": "Password changed successfully. Please login again."
  }
}
```

**Note:** All refresh tokens are invalidated (user logged out from all devices)

### Error Responses

**400 Bad Request** - Passwords don't match
```json
{
  "success": false,
  "error": {
    "message": "New password and confirm password do not match"
  }
}
```

**400 Bad Request** - Current password incorrect
```json
{
  "success": false,
  "error": {
    "message": "Current password is incorrect"
  }
}
```

**400 Bad Request** - Same password
```json
{
  "success": false,
  "error": {
    "message": "New password must be different from current password"
  }
}
```

---

## 8. Delete Account

**Endpoint:** `DELETE /api/v1/users/account`

**Description:** Delete user account (soft delete)

**Authentication:** Required

### Request Body

```json
{
  "password": "YourPassword123"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {
    "message": "Account deleted successfully"
  }
}
```

**Note:**
- This is a soft delete (status = DELETED)
- Email is anonymized
- All refresh tokens are deleted
- User data is retained for data integrity but account is inaccessible

### Error Responses

**400 Bad Request** - Wrong password
```json
{
  "success": false,
  "error": {
    "message": "Password is incorrect"
  }
}
```

---

## 📝 Example Usage (JavaScript)

### Update Profile

```javascript
const response = await fetch('http://localhost:3001/api/v1/users/profile/individual', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    fullName: 'أحمد محمد علي',
    phone: '01012345678',
    bio: 'مهتم بالتجارة الإلكترونية',
    city: 'Cairo',
  }),
});

const { data } = await response.json();
console.log(data); // Updated user profile
```

### Upload Avatar

```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/v1/users/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
});

const { data } = await response.json();
console.log(data.avatar); // /uploads/avatars/avatar-123-processed.jpg
```

### Change Password

```javascript
const response = await fetch('http://localhost:3001/api/v1/users/password', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    currentPassword: 'OldPassword123',
    newPassword: 'NewPassword123',
    confirmPassword: 'NewPassword123',
  }),
});

const { data } = await response.json();
console.log(data.message); // Password changed successfully
// User needs to login again
```

### Get Public Profile

```javascript
const userId = 'some-uuid';
const response = await fetch(`http://localhost:3001/api/v1/users/${userId}`);

const { data } = await response.json();
console.log(data); // Public user profile
```

---

## 🧪 Testing with curl

### Update Profile
```bash
curl -X PUT http://localhost:3001/api/v1/users/profile/individual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "أحمد محمد علي",
    "bio": "مهتم بالتجارة الإلكترونية"
  }'
```

### Upload Avatar
```bash
curl -X POST http://localhost:3001/api/v1/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### Change Password
```bash
curl -X PUT http://localhost:3001/api/v1/users/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword123",
    "confirmPassword": "NewPassword123"
  }'
```

### Get User by ID
```bash
curl http://localhost:3001/api/v1/users/UUID_HERE
```

---

## 🎯 Frontend Integration Tips

### Avatar Display

```jsx
// React component
const UserAvatar = ({ user }) => {
  const avatarUrl = user.avatar
    ? `http://localhost:3001${user.avatar}`
    : '/default-avatar.png';

  return <img src={avatarUrl} alt={user.fullName} />;
};
```

### Profile Form

```jsx
const ProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    phone: user.phone,
    bio: user.bio,
    // ...
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/v1/users/profile/individual', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(formData),
    });

    // Handle response...
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

---

## 🔒 Security Notes

1. **Avatar Upload:**
   - Files are validated on the server
   - Automatic image processing (resize, convert)
   - Stored with unique filenames

2. **Password Change:**
   - Requires current password
   - Logs out all devices after change
   - Password strength validation

3. **Account Deletion:**
   - Requires password confirmation
   - Soft delete (data retained)
   - All sessions invalidated

4. **Profile Update:**
   - Phone number uniqueness check
   - Data validation with Zod
   - Protected by JWT authentication

---

**For more API documentation, see:**
- [Authentication API](./AUTHENTICATION.md)
- [Items API](./ITEMS.md) (Coming soon)
- [Listings API](./LISTINGS.md) (Coming soon)
