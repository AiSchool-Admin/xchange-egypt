# 🔧 Debug AI Features Not Working

## Problem
AI features (category suggestions, price warnings, fraud alerts) are not appearing on `/items/new` page.

## Root Cause Analysis
The AI components only render when they receive successful API responses. If API calls fail, they return `null` and nothing is displayed.

---

## ✅ Debugging Checklist

### 1. Test Backend Connectivity (DO THIS FIRST)

Open your live Vercel site at `/items/new`, open Browser Console (F12), and run:

```javascript
// Test 1: Check what API URL the frontend is using
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://xchange-egypt-production.up.railway.app/api/v1');

// Test 2: Try calling the AI endpoint directly
fetch('https://xchange-egypt-production.up.railway.app/api/v1/ai/categorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'iPhone 12 Pro Max', description: 'Good condition' })
})
.then(res => {
  console.log('Response status:', res.status);
  return res.json();
})
.then(data => console.log('✅ Backend Response:', data))
.catch(err => console.error('❌ Backend Error:', err));
```

**Expected Result:** `✅ Backend Response: {success: true, category: {...}, alternatives: [...]}`

**If you get an error:**
- `NetworkError` or `CORS error` → Backend is down or CORS misconfigured
- `404 Not Found` → AI routes not deployed
- `500 Internal Server Error` → Backend crash

---

### 2. Check Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variable:**
```
NEXT_PUBLIC_API_URL = https://xchange-egypt-production.up.railway.app/api/v1
```

**⚠️ IMPORTANT:** If you ADD or CHANGE this variable, you MUST:
1. Click "Save"
2. Go to Deployments
3. Click "..." on the latest deployment
4. Click "Redeploy"

---

### 3. Check Railway Backend Status

Go to Railway Dashboard → xchange-egypt-backend project

**Check:**
1. **Deployment Status** - Should show "Active" with green dot
2. **Logs** - Click "View Logs" and check for errors
3. **Health Check** - The backend should be responding

**Look for these errors in logs:**
- `Error: Cannot find module '@prisma/client'` → Build failed
- `TypeError: aiController.categorizeItem is not a function` → Controller missing
- `ECONNREFUSED` → Database connection failed

---

### 4. Test Individual AI Endpoints

In Railway Dashboard, click "View Logs" and watch for incoming requests.

Then in your browser console, test each endpoint:

```javascript
// Test Price Estimation
fetch('https://xchange-egypt-production.up.railway.app/api/v1/ai/estimate-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'iPhone 12 Pro Max',
    description: 'Excellent condition',
    categoryId: '1',
    condition: 'LIKE_NEW',
    estimatedValue: 15000
  })
})
.then(res => res.json())
.then(data => console.log('Price Estimation:', data))
.catch(err => console.error('Error:', err));

// Test Fraud Check
fetch('https://xchange-egypt-production.up.railway.app/api/v1/ai/check-listing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'iPhone 12 Pro Max',
    description: 'Brand new sealed',
    price: 1000,
    categoryId: '1',
    images: []
  })
})
.then(res => res.json())
.then(data => console.log('Fraud Check:', data))
.catch(err => console.error('Error:', err));
```

---

### 5. Check Browser Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Type "iPhone 12 Pro Max" in the title field
4. Wait 1 second (debounce delay)
5. Look for a request to `/ai/categorize`

**Check:**
- **Status Code**: 200 = Success, 404 = Not Found, 500 = Server Error, (failed) = Network Error
- **Request URL**: Should point to Railway backend
- **Response**: Click the request and check the "Response" tab

---

## 🔧 Common Issues & Fixes

### Issue 1: API URL is undefined
**Symptom:** Console shows `API URL: undefined`
**Fix:** Add `NEXT_PUBLIC_API_URL` to Vercel environment variables and redeploy

### Issue 2: CORS Error
**Symptom:** `Access to fetch blocked by CORS policy`
**Fix:** Backend CORS should already allow `.vercel.app` domains. Check Railway logs for `CORS blocked origin` messages.

### Issue 3: 404 Not Found on AI endpoints
**Symptom:** `/ai/categorize` returns 404
**Fix:** AI routes might not be deployed. Check Railway deployment logs for build errors.

### Issue 4: 500 Internal Server Error
**Symptom:** Backend crashes when calling AI endpoints
**Fix:** Check Railway logs for error stack traces. Common causes:
- Prisma client not generated
- Missing AI controller functions
- Database connection issues

### Issue 5: No visual feedback (loading spinner doesn't show)
**Symptom:** Nothing happens when typing
**Fix:** Check that:
- Title is at least 3 characters long
- Debounce delay (1 second) has passed
- React DevTools shows state changes

---

## 📊 Expected Behavior

### Category Suggestions (Purple Box)
- **Trigger:** Type 3+ characters in title field
- **Delay:** 1 second after you stop typing
- **Should show:** Purple box with category suggestions

### Price Warning (Yellow/Orange/Green Box)
- **Trigger:** Enter price AND select category
- **Delay:** 800ms after you stop typing
- **Should show:** Color-coded price validation

### Fraud Alert (Red/Yellow Box)
- **Trigger:** Click "List Item" button
- **Timing:** Before form submission
- **Should show:** Only if risk is MEDIUM or HIGH

---

## 🆘 What to Report

If none of this works, send me:

1. **Browser console output** from Test 1 & 2
2. **Vercel environment variables** (screenshot)
3. **Railway deployment status** (Active/Failed)
4. **Railway logs** (last 50 lines)
5. **Network tab screenshot** showing the failed `/ai/categorize` request

This will help me pinpoint the exact issue!
