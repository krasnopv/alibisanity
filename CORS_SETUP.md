# CORS Configuration for Custom Domain Studio

## Problem

When accessing the Studio at `admin.alibistudios.co`, you get CORS errors:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://srer6l4b.api.sanity.io/...
(Reason: CORS header 'Access-Control-Allow-Origin' missing)
```

## Solution: Add Custom Domain to Sanity CORS Settings

You need to configure Sanity to allow requests from your custom domain.

### Step 1: Access Sanity Project Settings

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project (`srer6l4b`)
3. Go to **Settings** → **API** → **CORS origins**

### Step 2: Add Your Custom Domain

1. Click **Add CORS origin**
2. Enter: `https://admin.alibistudios.co`
3. Check **Allow credentials** (if you want to allow authenticated requests)
4. Click **Save**

### Step 3: Verify

After adding the origin:
- Wait a few minutes for changes to propagate
- Refresh `admin.alibistudios.co`
- The CORS errors should disappear

## Alternative: Use Sanity's Default Studio Domain

If you don't want to configure CORS, you can:
- Use Sanity's default Studio at `sanity.io` → Your project → Open Studio
- Or deploy to Sanity's hosting: `sanity deploy` (uses `*.sanity.studio` domain)

## For Both HTTP and HTTPS

If you're testing with HTTP first:
- Add: `http://admin.alibistudios.co` (for testing)
- Add: `https://admin.alibistudios.co` (for production)

**Note:** Sanity recommends using HTTPS in production.

## Troubleshooting

### Still Getting CORS Errors?

1. **Check the exact domain** - Make sure it matches exactly (including `https://`)
2. **Wait a few minutes** - CORS changes can take time to propagate
3. **Clear browser cache** - Sometimes cached CORS headers cause issues
4. **Check browser console** - Look for the exact origin being blocked
5. **Verify in Sanity dashboard** - Make sure the origin is listed in CORS settings

### Multiple Domains

If you have multiple environments:
- `https://admin.alibistudios.co` (staging)
- `https://admin-prod.alibistudios.co` (production, if you add it later)

Add each domain separately in Sanity's CORS settings.

## Security Note

Only add domains you control. Don't add wildcard domains (`*.alibistudios.co`) unless you understand the security implications.
