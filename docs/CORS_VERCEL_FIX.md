# 🔧 CORS Fix for Vercel Dynamic Preview URLs

## Problem
Vercel creates dynamic preview URLs for each deployment (e.g., `https://xchange-egypt-ff43xojqo-mamdouh-ragabs-projects.vercel.app`), which change with every push. This causes CORS errors because the backend doesn't recognize these new origins.

## Solution
The backend now supports **wildcard patterns** in `CORS_ORIGIN` to automatically allow all Vercel preview deployments.

---

## ✅ Railway Configuration

### Required CORS_ORIGIN Value

Go to **Railway Dashboard → Your Project → Variables** and set `CORS_ORIGIN` to:

```
http://localhost:3000,https://xchange-egypt-production.up.railway.app,https://*-mamdouh-ragabs-projects.vercel.app
```

### What Each Origin Does

1. **`http://localhost:3000`** - Local development frontend
2. **`https://xchange-egypt-production.up.railway.app`** - Backend itself (for health checks)
3. **`https://*-mamdouh-ragabs-projects.vercel.app`** - All Vercel preview deployments (wildcard)

---

## 🚀 How Wildcard Patterns Work

The `*` in the pattern acts as a wildcard that matches any characters:

- Pattern: `https://*-mamdouh-ragabs-projects.vercel.app`
- Matches:
  - ✅ `https://xchange-egypt-ff43xojqo-mamdouh-ragabs-projects.vercel.app`
  - ✅ `https://xchange-egypt-abc123-mamdouh-ragabs-projects.vercel.app`
  - ✅ `https://anything-mamdouh-ragabs-projects.vercel.app`
- Doesn't match:
  - ❌ `https://other-user.vercel.app`
  - ❌ `https://malicious-site.com`

---

## 📝 Step-by-Step Instructions

### 1. Update Railway Environment Variable

1. Go to [Railway Dashboard](https://railway.app)
2. Select your `xchange-egypt-production` project
3. Click on **Variables** tab
4. Find or add `CORS_ORIGIN`
5. Set the value to:
   ```
   http://localhost:3000,https://xchange-egypt-production.up.railway.app,https://*-mamdouh-ragabs-projects.vercel.app
   ```
6. Click **Save**
7. Railway will automatically redeploy (takes ~2 minutes)

### 2. Verify Deployment

After Railway redeploys, test the health endpoint:

```bash
curl https://xchange-egypt-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "environment": "production"
}
```

### 3. Test CORS from Vercel

1. Open your Vercel deployment in a browser
2. Try to register or login
3. Open DevTools → Console
4. You should **NOT** see any CORS errors

---

## 🔍 Troubleshooting

### Still Getting CORS Errors?

1. **Check the exact origin in the error message**
   - Look for: `from origin 'https://...'`
   - Verify it matches the wildcard pattern

2. **Verify Railway environment variable**
   - No spaces before or after commas
   - All URLs start with `http://` or `https://`
   - Wildcard pattern matches your Vercel URL

3. **Wait for full redeploy**
   - Railway takes 1-2 minutes to redeploy
   - Check deployment logs for errors

4. **Test with curl**
   ```bash
   curl -H "Origin: https://xchange-egypt-ff43xojqo-mamdouh-ragabs-projects.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS \
        https://xchange-egypt-production.up.railway.app/api/v1/auth/register -v
   ```

   Look for: `Access-Control-Allow-Origin` in response headers

### 502 Error on Preflight Request

This usually means:
- Backend isn't running
- Railway health checks are failing
- Database connection issues

Check Railway logs for:
```
✅ Database connected
🚀 Server running on port 3001
```

---

## 🎯 Production Domains

If you have a custom production Vercel domain (not preview), add it explicitly:

```
http://localhost:3000,https://xchange-egypt-production.up.railway.app,https://*-mamdouh-ragabs-projects.vercel.app,https://xchange.yourdomain.com
```

---

## 📋 Complete Checklist

- [ ] Updated `CORS_ORIGIN` in Railway
- [ ] Waited for Railway redeploy to complete
- [ ] Verified health endpoint works
- [ ] Tested registration from Vercel deployment
- [ ] No CORS errors in browser console
- [ ] Backend logs show successful requests

---

## 🔐 Security Note

The wildcard pattern is scoped to your Vercel account subdomain (`*-mamdouh-ragabs-projects.vercel.app`), so only YOUR Vercel deployments can access the API. This is secure and recommended for Vercel preview deployments.

---

## 💡 Key Points

1. **Wildcard support is now enabled** in the backend code
2. **Railway must have the correct CORS_ORIGIN** environment variable
3. **Pattern must match your Vercel subdomain** exactly
4. **No code changes needed** after initial setup
5. **All future Vercel deployments** will work automatically

---

## 📞 Quick Copy-Paste

**For Railway CORS_ORIGIN:**
```
http://localhost:3000,https://xchange-egypt-production.up.railway.app,https://*-mamdouh-ragabs-projects.vercel.app
```

Save this in Railway Variables and you're done! 🎉
