# Authentication API Documentation

Base URL: `http://localhost:3001/api/v1/auth`

---

## 📋 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register/individual` | Register individual user | No |
| POST | `/register/business` | Register business user | No |
| POST | `/login` | Login user | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout (single device) | No |
| POST | `/logout-all` | Logout all devices | Yes |
| GET | `/me` | Get current user profile | Yes |

---

## 1. Register Individual User

**Endpoint:** `POST /api/v1/auth/register/individual`

**Description:** Register a new individual user account

### Request Body

```json
{
  "email": "ahmed@example.com",
  "password": "SecurePassword123",
  "fullName": "أحمد محمد",
  "phone": "01012345678",
  "city": "Cairo",
  "governorate": "Cairo"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| fullName | string | Yes | Min 3 characters |
| phone | string | No | Egyptian phone number (01xxxxxxxxx) |
| city | string | No | User's city |
| governorate | string | No | User's governorate |

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "ahmed@example.com",
      "fullName": "أحمد محمد",
      "phone": "01012345678",
      "userType": "INDIVIDUAL",
      "city": "Cairo",
      "governorate": "Cairo",
      "createdAt": "2025-11-06T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

**409 Conflict** - Email already exists
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists"
  }
}
```

**422 Validation Error**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "body.password",
        "message": "Password must contain at least one uppercase letter"
      }
    ]
  }
}
```

---

## 2. Register Business User

**Endpoint:** `POST /api/v1/auth/register/business`

**Description:** Register a new business account

### Request Body

```json
{
  "email": "info@company.com",
  "password": "SecurePassword123",
  "fullName": "محمد أحمد",
  "phone": "01012345678",
  "businessName": "شركة الأمل للتجارة",
  "taxId": "123-456-789",
  "commercialRegNo": "CR-12345",
  "city": "Cairo",
  "governorate": "Cairo"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| fullName | string | Yes | Owner's full name (min 3 chars) |
| phone | string | Yes | Egyptian phone number |
| businessName | string | Yes | Company name (min 3 chars) |
| taxId | string | No | Tax ID |
| commercialRegNo | string | No | Commercial registration number |
| city | string | No | Business location |
| governorate | string | No | Governorate |

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Business account registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "info@company.com",
      "fullName": "محمد أحمد",
      "phone": "01012345678",
      "userType": "BUSINESS",
      "businessName": "شركة الأمل للتجارة",
      "taxId": "123-456-789",
      "commercialRegNo": "CR-12345",
      "city": "Cairo",
      "governorate": "Cairo",
      "createdAt": "2025-11-06T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 3. Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Login with email and password

### Request Body

```json
{
  "email": "ahmed@example.com",
  "password": "SecurePassword123"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "ahmed@example.com",
      "fullName": "أحمد محمد",
      "phone": "01012345678",
      "userType": "INDIVIDUAL",
      "status": "ACTIVE",
      "emailVerified": false,
      "phoneVerified": false,
      "avatar": null,
      "bio": null,
      "address": null,
      "city": "Cairo",
      "governorate": "Cairo",
      "postalCode": null,
      "rating": 0,
      "totalReviews": 0,
      "createdAt": "2025-11-06T10:00:00.000Z",
      "updatedAt": "2025-11-06T10:00:00.000Z",
      "lastLoginAt": "2025-11-06T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password"
  }
}
```

**401 Unauthorized** - Account suspended
```json
{
  "success": false,
  "error": {
    "message": "Your account has been suspended"
  }
}
```

---

## 4. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Get a new access token using refresh token

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

**401 Unauthorized** - Invalid or expired token
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired refresh token"
  }
}
```

---

## 5. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout from current device (invalidate refresh token)

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 6. Logout All Devices

**Endpoint:** `POST /api/v1/auth/logout-all`

**Description:** Logout from all devices (invalidate all refresh tokens)

**Authentication:** Required

### Headers

```
Authorization: Bearer <access_token>
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out from all devices",
  "data": {
    "message": "Logged out from all devices"
  }
}
```

---

## 7. Get Current User Profile

**Endpoint:** `GET /api/v1/auth/me`

**Description:** Get current authenticated user's profile

**Authentication:** Required

### Headers

```
Authorization: Bearer <access_token>
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid-here",
    "email": "ahmed@example.com",
    "fullName": "أحمد محمد",
    "phone": "01012345678",
    "userType": "INDIVIDUAL",
    "status": "ACTIVE",
    "emailVerified": false,
    "phoneVerified": false,
    "avatar": null,
    "bio": null,
    "address": null,
    "city": "Cairo",
    "governorate": "Cairo",
    "postalCode": null,
    "businessName": null,
    "taxId": null,
    "commercialRegNo": null,
    "rating": 4.5,
    "totalReviews": 10,
    "createdAt": "2025-11-06T10:00:00.000Z",
    "updatedAt": "2025-11-06T10:00:00.000Z",
    "lastLoginAt": "2025-11-06T12:00:00.000Z"
  }
}
```

---

## 🔐 Authentication Flow

### Initial Registration/Login

1. User registers or logs in
2. Server returns `accessToken` (expires in 15 min) and `refreshToken` (expires in 7 days)
3. Client stores both tokens (accessToken in memory, refreshToken in secure storage)

### Making Authenticated Requests

```
Authorization: Bearer <access_token>
```

### Token Refresh Flow

1. When access token expires (401 error)
2. Client calls `/auth/refresh` with refresh token
3. Server returns new access token
4. Client uses new access token for subsequent requests

### Logout Flow

**Single Device:**
```javascript
POST /auth/logout
Body: { refreshToken: "<refresh_token>" }
```

**All Devices:**
```javascript
POST /auth/logout-all
Headers: { Authorization: "Bearer <access_token>" }
```

---

## 📝 Example Usage (JavaScript)

### Register

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/register/individual', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'ahmed@example.com',
    password: 'SecurePassword123',
    fullName: 'أحمد محمد',
    phone: '01012345678',
  }),
});

const { data } = await response.json();
const { accessToken, refreshToken } = data;

// Store tokens
localStorage.setItem('refreshToken', refreshToken);
// Store accessToken in memory (not localStorage for security)
```

### Login

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'ahmed@example.com',
    password: 'SecurePassword123',
  }),
});

const { data } = await response.json();
```

### Authenticated Request

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await response.json();
console.log(data); // User profile
```

### Refresh Token

```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken'),
  }),
});

const { data } = await response.json();
const { accessToken } = data;
```

---

## 🔒 Security Best Practices

1. **Access Token:** Store in memory (React state, Zustand, etc.) - NOT in localStorage
2. **Refresh Token:** Store in secure HTTP-only cookie or encrypted localStorage
3. **Always use HTTPS** in production
4. **Implement rate limiting** to prevent brute force attacks
5. **Use strong passwords** with validation
6. **Implement CSRF protection** for sensitive operations

---

## 🧪 Testing with curl

### Register
```bash
curl -X POST http://localhost:3001/api/v1/auth/register/individual \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "fullName": "Test User",
    "phone": "01012345678"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**For more API documentation, see:**
- [Users API](./USERS.md) (Coming soon)
- [Items API](./ITEMS.md) (Coming soon)
- [Listings API](./LISTINGS.md) (Coming soon)
