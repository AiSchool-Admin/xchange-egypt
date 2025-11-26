# 🚀 DEPLOYMENT GUIDE - Railway & Vercel

**Issue**: PR merged to `main` but no automatic deployment triggered

**Status**: ✅ Merge successful | ⚠️ Deployments need configuration

---

## 🔍 WHY NO AUTO-DEPLOYMENT?

### Current Setup:
- ✅ GitHub Actions configured (CI only - lint & test)
- ✅ Railway config exists (`railway.json`)
- ✅ Vercel config exists (`vercel.json`)
- ❌ **Auto-deploy not configured in Railway/Vercel dashboards**

### What's Needed:
Railway and Vercel need to be configured in their dashboards to watch the `main` branch and auto-deploy on push.

---

## 🛤️ RAILWAY DEPLOYMENT

### **Option 1: Check Auto-Deploy Settings** (Recommended)

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Find your `xchange-backend` service**
3. **Click on the service** → **Settings**
4. **Check "Source"** section:
   - Should be connected to: `AiSchool-Admin/xchange-egypt`
   - Branch: Should be `main` ✅
   - Auto-deploy: Should be **ON** ✅

5. **If auto-deploy is OFF**:
   - Toggle it **ON**
   - Save settings
   - Railway will auto-deploy on next push

### **Option 2: Manual Deploy** (Quick Fix)

1. **Go to**: https://railway.app/dashboard
2. **Find** `xchange-backend` service
3. **Click** the service
4. **Click** "Deploy" or "Redeploy"
5. **Select** latest commit from `main` branch
6. **Confirm** deployment

### **Option 3: Push to Trigger** (Force Deploy)

```bash
# Make a trivial change to trigger deployment
git commit --allow-empty -m "chore: trigger Railway deployment"
git push origin main
```

---

## ☁️ VERCEL DEPLOYMENT

### **Option 1: Check Auto-Deploy Settings** (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your `xchange-frontend` project**
3. **Click** Settings → **Git**
4. **Check**:
   - Repository: `AiSchool-Admin/xchange-egypt` ✅
   - Production Branch: Should be `main` ✅
   - Auto-deploy: Should be **enabled** ✅

5. **If production branch is NOT `main`**:
   - Change it to `main`
   - Save
   - Next push to `main` will deploy

### **Option 2: Manual Deploy** (Quick Fix)

1. **Go to**: https://vercel.com/dashboard
2. **Find** your frontend project
3. **Click** "Deployments" tab
4. **Find** the latest commit from `main`
5. **Click** "Redeploy"
6. **Or**: Click "Deploy" → Select `main` branch

### **Option 3: Use Vercel CLI** (If installed)

```bash
cd frontend
vercel --prod
```

---

## 🔧 QUICK TROUBLESHOOTING

### Check 1: Are Services Connected to GitHub?

**Railway:**
- Dashboard → Service → Settings → Source
- Should show: `AiSchool-Admin/xchange-egypt`

**Vercel:**
- Dashboard → Project → Settings → Git
- Should show: `AiSchool-Admin/xchange-egypt`

### Check 2: Is `main` Branch Set as Production?

**Railway:**
- Settings → Source → Branch → Should be `main`

**Vercel:**
- Settings → Git → Production Branch → Should be `main`

### Check 3: Are There Any Failed Deployments?

**Railway:**
- Check "Deployments" tab for errors

**Vercel:**
- Check "Deployments" tab for failed builds

---

## ⚡ FASTEST SOLUTION (Do This Now)

### **For Railway Backend:**

1. Go to: https://railway.app/dashboard
2. Click your backend service
3. Click **"Deploy"** button
4. Done! ✅

### **For Vercel Frontend:**

1. Go to: https://vercel.com/dashboard
2. Click your frontend project
3. Click **"Redeploy"** on latest commit
4. Done! ✅

---

## 📊 WHAT SHOULD HAPPEN AFTER DEPLOYMENT

### Railway (Backend):
1. **Build starts** (npm install, prisma generate, build)
2. **Migrations run** (`npx prisma migrate deploy`)
3. **Server starts** (`npm start`)
4. **Health check passes** (`/health` endpoint)
5. **✅ LIVE** at your Railway URL

### Vercel (Frontend):
1. **Build starts** (Next.js build)
2. **Optimizations** run
3. **Deploy** to edge network
4. **✅ LIVE** at your Vercel URL

---

## 🎯 VERIFY DEPLOYMENTS

### After Railway Deploys:

Test the health endpoint:
```bash
curl https://your-railway-url.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

### After Vercel Deploys:

1. Open your Vercel URL in browser
2. Should see the Xchange homepage
3. Try to register/login
4. Check if categories load properly

---

## 🔄 SET UP AUTO-DEPLOY (One-Time Setup)

### Railway:
1. Dashboard → Service → Settings
2. **Source** section:
   - Repository: Connected ✅
   - Branch: `main` ✅
   - **Auto Deploy**: Toggle **ON** ✅
3. Save

**Result**: Every push to `main` will auto-deploy

### Vercel:
1. Dashboard → Project → Settings → Git
2. **Production Branch**: Set to `main` ✅
3. **Git Integration**: Enabled ✅
4. Save

**Result**: Every push to `main` will auto-deploy

---

## 💡 WHY THIS HAPPENED

Your PR was merged to `main`, but:
- Railway wasn't watching `main` branch
- OR auto-deploy was disabled
- OR wrong branch was set as production

**This is a one-time setup issue** - once configured, future merges will auto-deploy!

---

## ✅ ACTION PLAN

### **RIGHT NOW** (5 minutes):

1. ☐ Open Railway dashboard
2. ☐ Click your backend service
3. ☐ Click "Deploy" or "Redeploy"
4. ☐ Open Vercel dashboard
5. ☐ Click your frontend project
6. ☐ Click "Redeploy"
7. ☐ **Wait 3-5 minutes** for builds to complete
8. ☐ Test health endpoint
9. ☐ Check frontend URL

### **AFTER DEPLOYMENT** (5 minutes):

1. ☐ Railway: Enable auto-deploy from `main`
2. ☐ Vercel: Set production branch to `main`
3. ☐ Test that future pushes trigger deploys

---

## 📞 NEED HELP?

If deployments fail, check:
1. **Railway logs** - for backend errors
2. **Vercel logs** - for frontend build errors
3. **Environment variables** - are they set?
4. **Database connection** - is Supabase URL correct?

**Tell me what you see and I'll help debug!** 🚀

---

**TL;DR**: Go to Railway & Vercel dashboards → Click "Deploy/Redeploy" → Set auto-deploy to `main` branch ✅
