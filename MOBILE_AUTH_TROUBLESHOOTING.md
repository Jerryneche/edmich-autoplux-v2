# Mobile Auth Token Troubleshooting Guide

**Issue:** 401 Unauthorized on authenticated endpoints  
**Root Cause:** JWT token not being sent or invalid  
**Status:** Enhanced logging added for debugging

---

## Quick Debug Steps

### Step 1: Verify Token is Being Stored After Login

```typescript
// After successful login
const loginResponse = await fetch('https://www.edmich.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await loginResponse.json();
console.log('Token received:', data.token);  // Should see a long string

// Store token
await AsyncStorage.setItem('jwtToken', data.token);
```

### Step 2: Verify Token is Sent in Subsequent Requests

```typescript
// When making authenticated requests
const token = await AsyncStorage.getItem('jwtToken');
console.log('Token being sent:', token ? token.substring(0, 50) + '...' : 'NONE');

const response = await fetch('https://www.edmich.com/api/mobile/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,  // ← CRITICAL: "Bearer " prefix with space
    'Content-Type': 'application/json'
  }
});
```

### Step 3: Check Server Logs

When you get 401, check server logs for:

```
[AUTH-API] Auth header present: true
[AUTH-API] Token (first 50 chars): eyJhbGc...
[AUTH-API] ✅ Token decoded: {"userId":"user_123","email":"..."}
[AUTH-API] User found in DB: true, userId: user_123
[AUTH-API] ✅ User ID: user_123
[AUTH-API] ✅ User role: SUPPLIER
```

If you see `[AUTH-API] === No user found, returning null ===`, check which step failed:

---

## Common Issues & Solutions

### ❌ Problem 1: Token Not Sent at All

**Server Log:**
```
[AUTH-API] Auth header present: false
[AUTH-API] === No user found, returning null ===
```

**Why:** Authorization header not being sent in request

**Solution:**
```typescript
// WRONG
fetch('/api/mobile/user/update-role', {
  method: 'POST',
  body: JSON.stringify({ role: 'SUPPLIER' })
});

// CORRECT
const token = await AsyncStorage.getItem('jwtToken');
fetch('https://www.edmich.com/api/mobile/user/update-role', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,  // Required!
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ role: 'SUPPLIER' })
});
```

---

### ❌ Problem 2: Wrong Bearer Format

**Server Log:**
```
[AUTH-API] Auth header present: true
[AUTH-API] Auth header: eyJhbGc...  // Shows token but no "Bearer "
[AUTH-API] === No user found, returning null ===
```

**Why:** Missing "Bearer " prefix (with space)

**Solution:**
```typescript
// WRONG
'Authorization': token  // Missing "Bearer "
'Authorization': `Bearer${token}`  // Missing space after Bearer

// CORRECT
'Authorization': `Bearer ${token}`  // Has "Bearer " + space + token
```

---

### ❌ Problem 3: Token Expired

**Server Log:**
```
[AUTH-API] ❌ JWT verify FAILED: jwt expired
[AUTH-API] Error name: TokenExpiredError
[AUTH-API] === No user found, returning null ===
```

**Why:** Token older than 30 days

**Solution:**
```typescript
// Need to login again to get a fresh token
const response = await fetch('https://www.edmich.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
await AsyncStorage.setItem('jwtToken', token);  // Store new token
```

---

### ❌ Problem 4: Invalid/Corrupted Token

**Server Log:**
```
[AUTH-API] ❌ JWT verify FAILED: invalid signature
[AUTH-API] Error name: JsonWebTokenError
[AUTH-API] === No user found, returning null ===
```

**Why:** Token was modified or corrupted

**Solution:**
```typescript
// Clear token and login again
await AsyncStorage.removeItem('jwtToken');

// Then login to get a fresh valid token
const response = await fetch('https://www.edmich.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
await AsyncStorage.setItem('jwtToken', token);
```

---

### ❌ Problem 5: User Doesn't Exist in Database

**Server Log:**
```
[AUTH-API] ✅ Token decoded: {"userId":"user_999","email":"..."}
[AUTH-API] User found in DB: false, userId: user_999
[AUTH-API] ❌ User NOT found in DB for userId: user_999
[AUTH-API] === No user found, returning null ===
```

**Why:** User account was deleted or wrong token

**Solution:**
1. Verify you're logged in with the correct account
2. If account was deleted, create a new account and login again
3. Check that you're using the token from the SAME account

---

## API Response Debugging

### Login Response (Successful)

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirectUrl": "/dashboard/supplier",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "SUPPLIER",
    "onboardingStatus": "COMPLETED"
  }
}
```

**Save `token` field for all future requests!**

---

### Authenticated Request (Successful)

**Request:**
```bash
curl -X POST "https://www.edmich.com/api/mobile/user/update-role" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"role":"SUPPLIER"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated to SUPPLIER. Please complete onboarding.",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "SUPPLIER",
    "onboardingStatus": "PENDING",
    "hasCompletedOnboarding": false
  },
  "needsOnboarding": true
}
```

---

### Authenticated Request (Unauthorized)

**Request without Authorization header:**
```bash
curl -X POST "https://www.edmich.com/api/mobile/user/update-role" \
  -H "Content-Type: application/json" \
  -d '{"role":"SUPPLIER"}'
```

**Response:**
```json
{
  "error": "Unauthorized"
}
```

**Status:** 401

---

## Complete Workflow Example

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthManager {
  // Step 1: Login
  async login(email: string, password: string) {
    const response = await fetch('https://www.edmich.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.token) {
      // Save token
      await AsyncStorage.setItem('jwtToken', data.token);
      console.log('✅ Login successful, token saved');
      return data.user;
    } else {
      throw new Error(data.error);
    }
  }

  // Step 2: Make authenticated request
  async updateRole(newRole: string) {
    const token = await AsyncStorage.getItem('jwtToken');
    
    if (!token) {
      throw new Error('No token found - please login first');
    }

    const response = await fetch('https://www.edmich.com/api/mobile/user/update-role', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - need to login again
        await AsyncStorage.removeItem('jwtToken');
        throw new Error('Session expired - please login again');
      }
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  // Step 3: Get user profile
  async getProfile() {
    const token = await AsyncStorage.getItem('jwtToken');
    
    if (!token) {
      throw new Error('No token found - please login first');
    }

    const response = await fetch('https://www.edmich.com/api/mobile/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  // Step 4: Logout
  async logout() {
    await AsyncStorage.removeItem('jwtToken');
    console.log('✅ Logged out, token cleared');
  }
}

// Usage
const auth = new AuthManager();

// Login
const user = await auth.login('user@example.com', 'password');
console.log('Logged in as:', user.name);

// Update role
const result = await auth.updateRole('SUPPLIER');
console.log('Role updated to:', result.user.role);

// Get profile
const profile = await auth.getProfile();
console.log('Profile:', profile);

// Logout
await auth.logout();
```

---

## Testing with Postman

1. **Login Request:**
   - Method: POST
   - URL: `https://www.edmich.com/api/auth/login`
   - Body: `{ "email": "test@example.com", "password": "password123" }`
   - Copy the `token` value from response

2. **Use Token in Authenticated Request:**
   - Method: POST
   - URL: `https://www.edmich.com/api/mobile/user/update-role`
   - Headers: `Authorization: Bearer <paste-token-here>`
   - Body: `{ "role": "SUPPLIER" }`
   - Should get 200 OK

3. **Without Token (Should Fail):**
   - Same request but NO Authorization header
   - Should get 401 Unauthorized

---

## Summary Checklist

- ✅ Token received from login response
- ✅ Token stored in AsyncStorage/Keychain
- ✅ Token sent in Authorization header with `Bearer ` prefix
- ✅ Token includes space after `Bearer` (e.g., `Bearer {token}`)
- ✅ Token not expired (max 30 days old)
- ✅ User account still exists in database
- ✅ Content-Type header set to application/json

If all these are true and you still get 401, check the server logs for the specific error message.

---

**Last Updated:** February 13, 2026
