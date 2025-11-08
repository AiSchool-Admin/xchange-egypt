# Deploying Xchange Egypt Frontend to Vercel

This guide will help you deploy the Xchange Egypt e-commerce platform frontend to Vercel.

## Prerequisites

- GitHub account
- Access to the `AiSchool-Admin/xchange-egypt` repository

## Deployment Steps

### 1. Sign Up / Sign In to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub repositories

### 2. Import the Project

1. From your Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and select the `AiSchool-Admin/xchange-egypt` repository
3. Click **"Import"**

### 3. Configure Project Settings

On the project configuration page:

**Framework Preset:** Next.js (should be auto-detected)

**Root Directory:**
- Click "Edit" next to Root Directory
- Enter: `frontend`
- This tells Vercel to build from the frontend subdirectory

**Build and Output Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

### 4. Add Environment Variables

Click **"Environment Variables"** and add the following:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://xchange-egypt-production.up.railway.app/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `https://xchange-egypt-production.up.railway.app` |

**Important:** Make sure to add these for all environments (Production, Preview, Development)

### 5. Deploy

1. Click **"Deploy"**
2. Vercel will start building and deploying your application
3. Wait for the deployment to complete (usually 1-2 minutes)
4. Once complete, you'll get a URL like: `https://xchange-egypt-xxx.vercel.app`

## Post-Deployment

### Access Your Application

- **Production URL:** `https://xchange-egypt.vercel.app` (or your custom domain)
- **Preview URLs:** Generated for each commit/PR

### Verify the Deployment

1. Open your Vercel deployment URL
2. Test the following features:
   - ✅ Homepage loads correctly
   - ✅ Login/Register pages work
   - ✅ Can connect to backend API (check Network tab)
   - ✅ WebSocket chat connects properly
   - ✅ Image uploads work

### Automatic Deployments

Vercel will automatically:
- Deploy to production when you push to `main` branch
- Create preview deployments for pull requests
- Rebuild when you push new commits

## Troubleshooting

### Build Fails

**Issue:** "Failed to fetch font from Google Fonts"
**Solution:** This is a temporary network issue. Click "Redeploy" in Vercel.

**Issue:** Environment variables not working
**Solution:** Verify that all `NEXT_PUBLIC_*` variables are added in Vercel settings.

### API Connection Issues

**Issue:** Cannot connect to backend
**Solution:**
1. Check that `NEXT_PUBLIC_API_URL` is set correctly
2. Verify your Railway backend is running
3. Check CORS settings on backend allow your Vercel domain

### WebSocket Not Connecting

**Issue:** Chat not working
**Solution:**
1. Verify `NEXT_PUBLIC_WS_URL` is set correctly
2. Check backend WebSocket server is running
3. Ensure Railway backend allows WebSocket connections

## Custom Domain (Optional)

To add a custom domain:

1. Go to your project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain (e.g., `xchange-egypt.com`)
4. Follow Vercel's DNS configuration instructions

## Backend CORS Configuration

Make sure your Railway backend allows requests from your Vercel domain. Add to backend CORS settings:

```javascript
cors({
  origin: [
    'https://xchange-egypt.vercel.app',
    'https://xchange-egypt-*.vercel.app', // Preview deployments
    // ... other origins
  ]
})
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Project Repository: https://github.com/AiSchool-Admin/xchange-egypt

## Quick Reference

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Build Logs:** Available in deployment details
- **Environment Variables:** Settings → Environment Variables
- **Domains:** Settings → Domains
