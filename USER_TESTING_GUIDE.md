## 🎯 ACTUAL USER TESTING - Production Environment

### Test the REAL flow like a user would:

---

## **TEST 1: Register as Individual User**

### Steps:

1. **Open your browser** to:
   ```
   http://localhost:3000/register
   ```

2. **Select "Individual"** account type (should be selected by default)

3. **Fill in the form:**
   - Full Name: `John Smith`
   - Email: `john.smith.test@example.com` (use a unique email)
   - Password: `MyPassword123!`
   - Confirm Password: `MyPassword123!`
   - Phone: `+201234567890` (optional)
   - City: `Cairo` (optional)
   - Governorate: `Cairo` (optional)

4. **Click "Register"**

### Expected Results:
✅ You should be redirected to `/dashboard`
✅ Dashboard shows: "Welcome, John Smith! 👋"
✅ User type badge shows: "INDIVIDUAL"
✅ Check browser DevTools → Application → Local Storage:
   - Should see `accessToken`
   - Should see `refreshToken`

### If it fails:
- Open DevTools Console (F12) and screenshot any errors
- Check Network tab for the API call to `/auth/register/individual`

---

## **TEST 2: Logout**

### Steps:

1. **On the dashboard**, click the red **"Logout"** button (top right)

### Expected Results:
✅ Redirected to `/login`
✅ Local storage cleared (no tokens)

---

## **TEST 3: Login with Individual Account**

### Steps:

1. **On the login page** (`/login`), enter:
   - Email: `john.smith.test@example.com`
   - Password: `MyPassword123!`

2. **Click "Login"**

### Expected Results:
✅ Redirected to `/dashboard`
✅ See your name and email
✅ Tokens stored in localStorage again

---

## **TEST 4: Register as Business User**

### Steps:

1. **Logout** first (if logged in)

2. **Go to** `/register`

3. **Click "Business"** account type button

4. **Notice:** Business fields appear (Business Name, Tax ID, Commercial Reg No.)

5. **Fill in the form:**
   - Full Name: `Sarah Johnson`
   - Email: `sarah.business.test@example.com` (different email!)
   - Password: `BusinessPass123!`
   - Confirm Password: `BusinessPass123!`
   - Phone: `+201987654321`
   - **Business Name:** `Tech Solutions LLC` (required!)
   - Tax ID: `TAX987654` (optional)
   - Commercial Reg No: `CR123456` (optional)
   - City: `Alexandria`
   - Governorate: `Alexandria`

6. **Click "Register"**

### Expected Results:
✅ Redirected to `/dashboard`
✅ Dashboard shows: "Welcome, Sarah Johnson! 👋"
✅ User type badge shows: "BUSINESS"
✅ Tokens in localStorage

---

## **TEST 5: Test Protected Route (API Integration)**

### Steps:

1. **While logged in**, open DevTools Console (F12)

2. **Paste this code** and press Enter:

```javascript
fetch('https://xchange-egypt-production.up.railway.app/api/v1/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(r => r.json())
.then(data => console.log('User Profile:', data))
```

### Expected Results:
✅ Console shows your user profile data
✅ Should include: id, email, fullName, userType, etc.

---

## **TEST 6: Test Token Refresh (Advanced)**

### Steps:

1. **In DevTools Console**, manually expire the access token:

```javascript
// Get current refresh token (save it)
const refreshToken = localStorage.getItem('refreshToken');

// Clear access token to simulate expiration
localStorage.removeItem('accessToken');

// Make an authenticated request (should auto-refresh)
fetch('https://xchange-egypt-production.up.railway.app/api/v1/auth/me', {
  headers: {
    'Authorization': 'Bearer invalid-token'
  }
})
.then(r => r.json())
.then(data => console.log('Should fail with 401:', data))
```

### Expected Results:
✅ First request fails with 401
✅ Axios interceptor should catch it and refresh the token automatically
✅ Check localStorage - new `accessToken` should appear

---

## **TEST 7: Full End-to-End Flow**

### Complete User Journey:

```
1. Open localhost:3000
2. Click "Register" → Select Business
3. Fill form → Submit
4. Land on Dashboard → Verify user info
5. Click Logout → Back to login
6. Login again → Back to dashboard
7. Refresh page → Should stay logged in
8. Close browser → Reopen → Should stay logged in (tokens persist)
```

### Expected Results:
✅ Complete flow works without errors
✅ Tokens persist across page refreshes
✅ Authentication state maintained

---

## **TESTING CHECKLIST**

Run through these and mark what works:

- [ ] Individual registration works
- [ ] Business registration works
- [ ] Business fields only show for business type
- [ ] Login works
- [ ] Dashboard shows correct user data
- [ ] User type badge correct (INDIVIDUAL/BUSINESS)
- [ ] Logout clears tokens and redirects
- [ ] Protected routes work (dashboard requires login)
- [ ] Page refresh doesn't log you out
- [ ] Error messages display correctly
- [ ] Form validation works (password length, required fields)
- [ ] Tokens stored in localStorage
- [ ] API calls include Authorization header

---

## **COMMON ISSUES & FIXES**

### ❌ "Network Error" or "Failed to fetch"

**Cause:** Backend not reachable or CORS issue

**Fix:**
1. Check backend is running: https://xchange-egypt-production.up.railway.app/health
2. Verify `.env.local` has correct API URL
3. Check browser console for CORS errors

---

### ❌ "User already exists" error

**Cause:** Email already registered

**Fix:** Use a different email (add timestamp: `test-1234567@example.com`)

---

### ❌ Stuck on login page after login

**Cause:** Redirect not working or tokens not saved

**Fix:**
1. Check browser console for errors
2. Verify localStorage has `accessToken` and `refreshToken`
3. Check Network tab → Response should include tokens

---

### ❌ Dashboard shows wrong user data

**Cause:** Old data cached

**Fix:**
1. Clear localStorage
2. Logout and login again

---

## **SCREENSHOT CHECKLIST**

Take screenshots of:
1. ✅ Registration form (both Individual and Business)
2. ✅ Successful registration → Dashboard
3. ✅ Dashboard with user info
4. ✅ Login page
5. ✅ Network tab showing successful API calls
6. ✅ LocalStorage with tokens

---

## **WHAT TO REPORT**

If something doesn't work, provide:
1. **Which test failed** (TEST 1, 2, 3, etc.)
2. **Screenshot of error** (console + network tab)
3. **What you expected** vs **what happened**
4. **Browser and OS** (Chrome/Edge/Firefox, Windows/Mac)

---

## **SUCCESS CRITERIA**

✅ **All 7 tests pass**
✅ **Both user types can register**
✅ **Login/logout works**
✅ **Dashboard displays correct data**
✅ **Tokens persist and work**

---

**NOW GO TEST IT!** 🚀

Start at: `http://localhost:3000`
