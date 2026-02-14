# Google Authentication Troubleshooting Guide

## Problem: Google Login keeps spinning, no error message

### Quick Diagnosis Steps

**Step 1: Check the debug endpoint**
```
Visit: https://www.edmich.com/api/auth/debug
```
This will show:
- Environment variables status
- Database connection status
- Current session state
- Timing information

**Step 2: Check browser console**
Open DevTools (F12) → Console tab and look for any errors

**Step 3: Check Vercel logs**
Go to Vercel dashboard → Your Project → Deployments → Latest → View Function Logs

### Common Causes & Solutions

#### Issue 1: Google OAuth Redirect URL Mismatch
**Symptom:** Login redirects to Google, you grant access, then it spins

**Fix:**
1. Go to Google Cloud Console → Your Project → Credentials
2. Find your OAuth Client ID for the web application
3. Check "Authorized redirect URIs"
4. Must include: `https://www.edmich.com/api/auth/callback/google`
5. For local testing: Add `http://localhost:3000/api/auth/callback/google`

#### Issue 2: Database Connection Timeout
**Symptom:** Debug endpoint is slow, database queries timing out

**Fix:**
1. Check Neon connection: `SELECT 1`
2. Verify connection pooling: DIRECT_URL should be set in .env
3. Current pooler:ep-round-dust-ai3hgmfh.c-4.us-east-1.aws.neon.tech
4. Check query timeouts: Increase if > 5 seconds

#### Issue 3: NEXTAUTH_SECRET Not Set
**Symptom:** Environment shows "NOT SET" for NEXTAUTH_SECRET

**Fix:**
```bash
# Generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to Vercel:
vercel env add NEXTAUTH_SECRET
# Then paste the generated value

# For local .env:
NEXTAUTH_SECRET="paste-generated-value-here"
```

#### Issue 4: Prisma Adapter Issue
**Symptom:** Database queries work, but session creation fails

**Fix:**
1. Run database migrations:
   ```bash
   npx prisma db push
   ```
2. Seed test data:
   ```bash
   npx prisma db seed
   ```
3. Check that User model includes all required fields

### Manual Testing Steps

#### Test 1: Direct API Test
```bash
# Test database connectivity
curl https://www.edmich.com/api/auth/debug

# Look for:
# - "ok": true
# - "timings.database" < 2000ms
# - "totalUsersCount" > 0
```

#### Test 2: Test with Credentials
```javascript
// In browser console (on development only):
const result = await fetch('/api/auth/signin/credentials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  })
});
console.log(await result.json());
```

#### Test 3: Check Session
```javascript
// In browser console:
const session = await fetch('/api/auth/session');
console.log(await session.json());
```

### Configuration Checklist

**Before Deploying:**
- [ ] Google Client ID set in Vercel: `GOOGLE_CLIENT_ID`
- [ ] Google Client Secret set in Vercel: `GOOGLE_CLIENT_SECRET`
- [ ] NEXTAUTH_SECRET set in Vercel (secure, 32-byte hex)
- [ ] NEXTAUTH_URL set to `https://www.edmich.com`
- [ ] Database URL (DIRECT_URL) working properly
- [ ] Google OAuth redirect URIs include the callback URL

**Local Development:**
```bash
# .env file should have:
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<from-google-cloud>
GOOGLE_CLIENT_SECRET=<from-google-cloud>
NEXTAUTH_SECRET=<generated-32-byte-hex>
DIRECT_URL=<from-neon-console>
```

### Debug Logging

The following console logs indicate auth flow progress:

```
✅ [AUTH-SIGNIN] Starting sign-in: google
✅ [AUTH-SIGNIN] Looking for existing Google user: user@email.com
✅ [AUTH-SIGNIN] ✅ Creating new Google user | Linking existing
✅ [AUTH-JWT] JWT callback triggered
✅ [AUTH-JWT] Initial token creation for user
✅ [AUTH-JWT] Initial token populated
✅ [AUTH-SESSION] Session callback triggered
✅ [AUTH-REDIRECT] Redirecting to dashboard
```

If logs stop at any point, that's where the hang is occurring.

### Vercel Environment Variables Setup

```bash
# Set all required variables:
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DIRECT_URL

# Verify they're set:
vercel env ls
```

### Test Account Setup

For testing Google OAuth without actual Google credentials:

1. Use test Gmail account: `test+automartplux@gmail.com`
2. Generates test token automatically
3. Creates user in database with `isGoogleAuth: true`

### Emergency Fix: Rollback to Credentials

If Google Auth still fails after all checks, modify login page temporarily:

```jsx
// Disable Google button temporarily
<button disabled className="opacity-50">
  Continue with Google (Temporarily Disabled)
</button>
```

Use credentials login instead while investigating.

### Performance Optimization

If login is slow (> 3 seconds):

1. Check database latency:
   ```sql
   SELECT 1 -- Should return < 50ms
   ```

2. Verify Prisma query caching is working
3. Ensure connection pooling is enabled in Neon

### Next Steps

1. **Run the debug endpoint**: Check all diagnostics
2. **Check Google Cloud Console**: Verify redirect URI
3. **Review Vercel logs**: Look for error messages
4. **Test database**: Ensure queries complete within 5s
5. **Contact support**: If still unresolved after the above steps

---

**Last Updated:** February 14, 2026
**Related Files:**
- `/lib/auth.ts` - NextAuth configuration
- `/app/api/auth/[...nextauth]/route.ts` - Auth handler
- `/middleware.ts` - Route middleware
