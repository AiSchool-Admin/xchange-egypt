# Fixing CORS Issues with Railway and Vercel

## Problem
When the Vercel-deployed frontend tries to access the Railway backend, you may encounter a CORS error:

```
Access to XMLHttpRequest at 'https://xchange-egypt-production.up.railway.app/api/v1/auth/register'
from origin 'https://xchange-egypt-8i366ibkz-mamdouh-ragabs-projects.vercel.app' has been blocked
by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

### Step 1: Get Your Vercel Deployment URLs

You need to add your Vercel deployment URL(s) to the CORS configuration. You typically have:

1. **Preview/Development URL**: `https://xchange-egypt-8i366ibkz-mamdouh-ragabs-projects.vercel.app`
2. **Production URL**: (if you have a custom domain or production deployment)

### Step 2: Update Railway Environment Variable

1. Go to your Railway project dashboard: https://railway.app
2. Select your backend service
3. Navigate to the **Variables** tab
4. Find the `CORS_ORIGIN` variable (or create it if it doesn't exist)
5. Update its value to include your Vercel URLs (comma-separated):

```env
CORS_ORIGIN=http://localhost:3000,https://xchange-egypt-8i366ibkz-mamdouh-ragabs-projects.vercel.app
```

**For production with multiple deployment URLs:**
```env
CORS_ORIGIN=http://localhost:3000,https://xchange-egypt-8i366ibkz-mamdouh-ragabs-projects.vercel.app,https://your-production-url.vercel.app
```

**To allow all Vercel preview deployments (less secure, use with caution):**
```env
CORS_ORIGIN=http://localhost:3000,https://*.vercel.app
```

### Step 3: Redeploy Backend

After updating the environment variable:

1. Railway will automatically trigger a redeployment, OR
2. Manually redeploy by clicking the **Deploy** button

### Step 4: Verify the Fix

1. Wait for the Railway deployment to complete
2. Test your Vercel frontend again
3. The CORS error should be resolved

## Alternative: Update Frontend API URL

If you want to test locally or need to update the frontend to point to the correct backend:

1. Update your frontend's `.env` or `.env.production` file
2. Set the API URL to your Railway backend:

```env
NEXT_PUBLIC_API_URL=https://xchange-egypt-production.up.railway.app/api/v1
```

## Security Considerations

- **Development**: Include `http://localhost:3000` for local testing
- **Production**: Only include your specific production URLs
- **Avoid wildcards** in production (like `*` or `https://*`) as they allow any origin
- **Use specific domains** for better security

## Troubleshooting

### Error persists after updating CORS_ORIGIN

1. Check Railway logs to ensure the environment variable was picked up
2. Verify the deployment completed successfully
3. Clear your browser cache and try again
4. Check that the URL in CORS_ORIGIN exactly matches your Vercel URL (including `https://`)

### Multiple preview deployments

Vercel creates unique URLs for each preview deployment. You have two options:

1. **Update CORS_ORIGIN** each time you deploy (tedious)
2. **Use a custom Vercel domain** for consistent URLs
3. **Use wildcard** for Vercel subdomains (less secure): `https://*.vercel.app`

### Preflight requests failing

If preflight (OPTIONS) requests are failing:

1. Ensure your Railway backend is running the latest code
2. Check that the `cors` package is properly configured in `backend/src/app.ts`
3. Verify `credentials: true` is set in CORS options if you're sending cookies

## Current Configuration

The backend CORS configuration is in:
- **File**: `backend/src/config/env.ts` (lines 69-71)
- **App**: `backend/src/app.ts` (lines 38-43)

The configuration splits `CORS_ORIGIN` by commas and trims whitespace, allowing multiple origins.
