# 🚀 Deploy Xchange Frontend to Production

## Quick Deploy to Vercel (RECOMMENDED - 2 Minutes)

### Step 1: Push Your Code to GitHub

Your code is already on GitHub at the branch:
```
claude/fix-registration-endpoint-01B4yWAiqKxxUw6kPMjEcV1o
```

**Merge it to main first:**
1. Go to your GitHub repository
2. Create a Pull Request from your branch to main
3. Merge the PR

### Step 2: Deploy to Vercel

1. **Go to** [vercel.com](https://vercel.com)

2. **Click "Sign Up"** or **"Login"** (use GitHub account)

3. **Click "Add New Project"**

4. **Import your repository:**
   - Select: `AiSchool-Admin/xchange-egypt`
   - Click "Import"

5. **Configure the project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: **`frontend`** ⚠️ IMPORTANT!
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

6. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_API_URL=https://xchange-egypt-production.up.railway.app/api/v1
   NEXT_PUBLIC_WS_URL=https://xchange-egypt-production.up.railway.app
   ```

7. **Click "Deploy"**

   Vercel will:
   - Install dependencies
   - Build your app
   - Deploy to production
   - Give you a live URL!

8. **Get Your Live URL:**

   After deployment (1-2 minutes), you'll get a URL like:
   ```
   https://xchange-egypt.vercel.app
   ```

---

## ✅ After Deployment

### Test Your Live Application:

1. **Open the Vercel URL** in your browser
2. **Click "Register"**
3. **Register as Individual or Business**
4. **Login and use the dashboard**

### Update Backend CORS:

Go to Railway → Your backend service → Environment Variables:

Add your Vercel URL to `CORS_ORIGIN`:
```
CORS_ORIGIN=https://xchange-egypt.vercel.app,https://xchange-egypt-production.up.railway.app
```

---

## Alternative: Deploy to Railway

If you prefer to keep everything on Railway:

### Step 1: Create New Railway Service

1. Go to [railway.app](https://railway.app)
2. Open your existing project
3. Click **"+ New"** → **"GitHub Repo"**
4. Select `AiSchool-Admin/xchange-egypt`
5. Configure:
   - Root Directory: **`frontend`**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Step 2: Add Environment Variables

```
NEXT_PUBLIC_API_URL=https://xchange-egypt-production.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://xchange-egypt-production.up.railway.app
PORT=3000
```

### Step 3: Deploy

Railway will auto-deploy and give you a URL like:
```
https://xchange-frontend-production.up.railway.app
```

---

## Alternative: Deploy to Netlify

### Step 1: Go to Netlify

1. Visit [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click **"Add new site"** → **"Import an existing project"**

### Step 2: Configure

- Repository: `AiSchool-Admin/xchange-egypt`
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/.next`

### Step 3: Environment Variables

```
NEXT_PUBLIC_API_URL=https://xchange-egypt-production.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://xchange-egypt-production.up.railway.app
```

### Step 4: Deploy

Click "Deploy site" - you'll get a URL like:
```
https://xchange-egypt.netlify.app
```

---

## 🎯 Recommendation

**Use Vercel** - It's:
- ✅ Built specifically for Next.js
- ✅ Free tier is generous
- ✅ Automatic deployments on git push
- ✅ Best performance
- ✅ Takes 2 minutes to set up

---

## After Going Live

Once deployed, share the URL and you can:

1. **Register real users** (Individual & Business)
2. **Test the full authentication flow**
3. **Use the dashboard**
4. **Access from any device** (phone, tablet, laptop)
5. **Share with others** to test

---

## Troubleshooting

### Build fails with "Failed to fetch font 'Inter'"

This is the Google Fonts issue. Fix in `frontend/app/layout.tsx`:

Replace:
```typescript
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

With:
```typescript
// Use system fonts instead
const inter = { className: 'font-sans' };
```

Then redeploy.

### CORS errors in browser

Make sure you added your Vercel URL to the backend's `CORS_ORIGIN` environment variable on Railway.

---

## Success Checklist

- [ ] Code merged to main branch
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Build successful
- [ ] Live URL working
- [ ] Can register users
- [ ] Can login
- [ ] Dashboard loads
- [ ] Backend CORS updated
- [ ] No console errors

---

**You're 2 minutes away from having a LIVE production app!** 🚀

Choose Vercel and follow the steps above.
