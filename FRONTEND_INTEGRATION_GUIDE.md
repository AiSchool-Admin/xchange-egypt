# Frontend Integration Guide

## ✅ Integration Complete!

The Next.js frontend has been fully integrated with the Railway backend.

---

## 🚀 Quick Start

### Frontend Dev Server (Already Running)

The Next.js development server is running at:
```
http://localhost:3000
```

### Test the Integration

1. **Open your browser** to `http://localhost:3000`

2. **Test Individual Registration:**
   - Navigate to `/register`
   - Select "Individual" account type
   - Fill in the form:
     - Full Name: Your Name
     - Email: your-email@example.com
     - Password: (min 8 characters)
     - Phone: +201234567890 (optional)
     - City & Governorate: (optional)
   - Click "Register"
   - You'll be redirected to `/dashboard` upon success

3. **Test Business Registration:**
   - Navigate to `/register`
   - Select "Business" account type
   - Additional fields appear:
     - Business Name (required)
     - Tax ID (optional)
     - Commercial Registration No. (optional)
   - Fill and submit

4. **Test Login:**
   - Navigate to `/login`
   - Use credentials from registration
   - Success redirects to `/dashboard`

5. **Test Dashboard:**
   - View your user profile
   - See JWT authentication status
   - Check WebSocket connection status

---

## 📋 What Was Integrated

### API Layer (`frontend/lib/api/auth.ts`)

**Updated Response Format:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { message: string; details?: unknown };
}
```

**New Registration Methods:**
```typescript
// Individual registration
registerIndividual(data: RegisterIndividualData): Promise<AuthResponse>
// POST /api/v1/auth/register/individual

// Business registration
registerBusiness(data: RegisterBusinessData): Promise<AuthResponse>
// POST /api/v1/auth/register/business
```

**Updated User Interface:**
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;        // ← Changed from 'name'
  phone?: string;
  userType: 'INDIVIDUAL' | 'BUSINESS';  // ← Changed from 'role'
  status?: string;
  avatar?: string;
  rating?: number;
  city?: string;
  governorate?: string;
  // Business-specific fields
  businessName?: string;
  taxId?: string;
  commercialRegNo?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Auth Context (`frontend/lib/contexts/AuthContext.tsx`)

**New Methods:**
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  registerIndividual: (data: RegisterIndividualData) => Promise<void>;  // ← New
  registerBusiness: (data: RegisterBusinessData) => Promise<void>;      // ← New
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}
```

### Registration Page (`frontend/app/register/page.tsx`)

**Features:**
- ✅ User type toggle (Individual/Business)
- ✅ Conditional business fields
- ✅ All required and optional fields
- ✅ Client-side validation
- ✅ Error message extraction from new API format
- ✅ Minimum password length: 8 characters

### Login Page (`frontend/app/login/page.tsx`)

**Updates:**
- ✅ Error handling for wrapped API responses
- ✅ Proper error message extraction

### Dashboard (`frontend/app/dashboard/page.tsx`)

**Updates:**
- ✅ Display `fullName` instead of `name`
- ✅ Display `userType` instead of `role`

---

## 🔧 Configuration

### Environment Variables

**Location:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=https://xchange-egypt-production.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://xchange-egypt-production.up.railway.app
```

**Note:** `.env.local` is gitignored. Use `.env.local.example` as a template.

---

## 🧪 Testing from Your Machine

### Option 1: Use the Frontend UI (Recommended)

1. Open browser to `http://localhost:3000`
2. Navigate through register → login → dashboard flow
3. Check browser console for any errors
4. Verify tokens are stored in localStorage

### Option 2: Use the Test HTML Page

Open in browser:
```
file:///home/user/xchange-egypt/test-frontend-integration.html
```

This provides:
- Individual registration test
- Business registration test
- Login test
- Get user profile test
- Logout test

### Option 3: Use PowerShell (Windows)

**Individual Registration:**
```powershell
$body = @{
    fullName = "Test User"
    email = "test-$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "TestPassword123!"
    phone = "+201234567890"
    city = "Cairo"
    governorate = "Cairo"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://xchange-egypt-production.up.railway.app/api/v1/auth/register/individual" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Business Registration:**
```powershell
$body = @{
    fullName = "Business Owner"
    email = "business-$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "TestPassword123!"
    phone = "+201987654321"
    businessName = "Test Corp LLC"
    taxId = "TAX123456"
    commercialRegNo = "CR987654"
    city = "Alexandria"
    governorate = "Alexandria"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://xchange-egypt-production.up.railway.app/api/v1/auth/register/business" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## 🎯 API Endpoints Tested

| Endpoint | Method | Status |
|----------|--------|--------|
| `/auth/register/individual` | POST | ✅ Working |
| `/auth/register/business` | POST | ✅ Working |
| `/auth/login` | POST | ✅ Working |
| `/auth/me` | GET | ✅ Working |
| `/auth/refresh` | POST | ✅ Working |
| `/auth/logout` | POST | ✅ Working |

---

## 📦 TypeScript Compilation

All TypeScript files compile successfully:
```bash
cd frontend
npm run type-check  # ✅ No errors
```

---

## 🔐 Authentication Flow

1. **Registration:**
   ```
   User fills form → Frontend validates → API call
   → Backend creates user → Returns tokens + user data
   → Frontend stores tokens in localStorage
   → Redirects to /dashboard
   ```

2. **Login:**
   ```
   User enters credentials → API call
   → Backend validates → Returns tokens + user data
   → Frontend stores tokens → Redirects to /dashboard
   ```

3. **Protected Routes:**
   ```
   Frontend request → Axios interceptor adds Authorization header
   → Backend validates JWT → Returns data
   ```

4. **Token Refresh:**
   ```
   API returns 401 → Axios interceptor catches
   → Calls /auth/refresh with refreshToken
   → Gets new accessToken → Retries original request
   ```

5. **Logout:**
   ```
   User clicks logout → Call /auth/logout with refreshToken
   → Backend invalidates token → Clear localStorage
   → Redirect to /login
   ```

---

## 📊 Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists",
    "details": { ... }
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue: CORS Error in Browser

**Solution:** Make sure CORS_ORIGIN is set in Railway:
```
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com
```

### Issue: 401 Unauthorized on Protected Routes

**Solution:** Check localStorage for `accessToken`. If missing, user needs to login again.

### Issue: "Failed to fetch" Error

**Solution:**
1. Check backend is running on Railway
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for detailed error

### Issue: Registration Returns 400 Error

**Solution:** Check validation:
- Password minimum 8 characters
- Email format is valid
- Business name required for business accounts

---

## 🎉 Next Steps

1. **Test the full flow** using the frontend UI
2. **Deploy frontend** to Vercel/Netlify (see `VERCEL_DEPLOYMENT.md`)
3. **Add additional features:**
   - Password reset
   - Email verification
   - Profile editing
   - Avatar upload

---

## 📝 Files Modified

```
frontend/
├── lib/
│   ├── api/
│   │   └── auth.ts                    # ✅ Updated API methods & types
│   └── contexts/
│       └── AuthContext.tsx            # ✅ Added registration methods
├── app/
│   ├── register/
│   │   └── page.tsx                   # ✅ Full rewrite with user types
│   ├── login/
│   │   └── page.tsx                   # ✅ Updated error handling
│   └── dashboard/
│       └── page.tsx                   # ✅ Updated field names
└── .env.local                         # ✅ Created with API URL
```

---

## 🔗 Links

- **Frontend:** http://localhost:3000
- **Backend:** https://xchange-egypt-production.up.railway.app
- **API Docs:** https://xchange-egypt-production.up.railway.app/api/v1/docs
- **Health Check:** https://xchange-egypt-production.up.railway.app/health

---

## ✅ Integration Checklist

- [x] API client configured with backend URL
- [x] Response format matches backend structure
- [x] Individual registration implemented
- [x] Business registration implemented
- [x] Login functionality working
- [x] Protected route authentication
- [x] Token refresh mechanism
- [x] Logout functionality
- [x] Error handling implemented
- [x] TypeScript types aligned
- [x] Form validation added
- [x] User type toggle in UI
- [x] All fields from backend supported

**Status: READY FOR TESTING ✅**
