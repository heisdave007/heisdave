# Token Management & User Deletion System

## Overview

This system automatically invalidates all tokens when:
1. A user no longer exists in the database
2. A user logs out
3. A user's password is changed
4. A user deletes their account

## How It Works

### Token Blacklist System

When a token is used and the user no longer exists, the system:
1. **Detects** that the user doesn't exist
2. **Blacklists** the current token (adds to blacklist database)
3. **Deletes** all related tokens for that user
4. **Returns** a 401 error with appropriate message

### Architecture

```
Request with Token
    ↓
Check Token in Authorization Header
    ↓
Is Token Blacklisted? → YES → Return 401 (Token Invalid)
    ↓ NO
Verify JWT Signature
    ↓
Find User in Database
    ↓
Does User Exist? → NO → Blacklist Token + Delete All User Tokens
    ↓ YES
Check if Password Changed
    ↓
Grant Access or Deny
```

## New Schemas

### TokenBlacklistSchema
Location: `schemas/tokenBlacklistSchema.js`

```javascript
{
  userId: ObjectId,           // Reference to user
  token: String,              // The actual JWT token (unique)
  reason: String,             // 'logout', 'user_deleted', 'user_not_found', 'password_changed'
  expiresAt: Date,            // Auto-delete when token expires (TTL index)
  timestamps: true            // createdAt, updatedAt
}
```

## New Utilities

### Token Blacklist Functions
Location: `utils/tokenBlacklist.js`

```javascript
// Add single token to blacklist
blacklistToken(token, userId, reason)

// Check if token is blacklisted
isTokenBlacklisted(token)

// Blacklist all tokens for a user
blacklistAllUserTokens(userId, reason)

// Auto-cleanup expired tokens
cleanupExpiredTokens()

// Get all blacklisted tokens for user
getUserBlacklistedTokens(userId)
```

## New Endpoints

### 1. Logout (Single Device)
**POST** `/api/v1/users/logout`

```javascript
Headers:
  Authorization: Bearer {token}

Response (200):
{
  message: "Logged out successfully. Token has been invalidated."
}
```

**What happens:**
- Current token is added to blacklist
- User can't use this token anymore
- Other devices can still use their tokens

### 2. Logout All Devices
**POST** `/api/v1/users/logout-all-devices`

```javascript
Headers:
  Authorization: Bearer {token}

Response (200):
{
  message: "Logged out from all devices. Invalidated 5 token(s).",
  tokensInvalidated: 5
}
```

**What happens:**
- All tokens for this user are added to blacklist
- User is logged out from all devices
- User must login again to continue

### 3. Delete Account
**DELETE** `/api/v1/users/account/delete`

```javascript
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  password: "user_password"
}

Response (200):
{
  message: "User account deleted successfully. All tokens have been invalidated."
}
```

**What happens:**
- Verifies user's password
- All user's tokens are blacklisted
- User account is deleted from database
- User cannot login anymore

## Enhanced Protected Route Middleware

The `protectedRoute` middleware now:

1. **Extracts token** from Authorization header
2. **Checks blacklist** - Returns 401 if token is blacklisted
3. **Verifies JWT** - Validates signature and expiration
4. **Finds user** in database
5. **If user not found:**
   - Blacklists current token
   - Deletes all user's tokens
   - Returns 401 with message
6. **Checks password** - If changed, blacklists token
7. **Grants access** - Adds user and token to request object

## Example Flows

### Flow 1: User Deletes Account While Logged In
```
User → DELETE /api/v1/users/account/delete + password
  ↓
Server verifies password
  ↓
Server blacklists all tokens for user
  ↓
Server deletes user from database
  ↓
User cannot access any protected routes
  ↓
User gets 401: "User no longer exists"
```

### Flow 2: User Exists But Tries Old Token (After Deletion)
```
Hacker → GET /api/v1/users with old stolen token
  ↓
Server checks if token is blacklisted
  ↓
Token IS blacklisted (from user deletion)
  ↓
Return 401: "Token has been invalidated"
```

### Flow 3: Admin Deletes User But User Has Tokens
```
Admin → DELETE user from admin panel
  ↓
User tries to access protected route
  ↓
Server finds token is NOT blacklisted yet
  ↓
Server tries to find user in database
  ↓
User not found → Server blacklists token immediately
  ↓
Server deletes all related tokens
  ↓
Return 401: "User no longer exists"
```

## Test Cases

### Test 1: Logout Single Device
```bash
# User has 2 active sessions
# Login once more to get 3 tokens

# Call logout on one device
curl -X POST http://localhost:4000/api/v1/users/logout \
  -H "Authorization: Bearer token1" \
  -H "Content-Type: application/json"

# token1 is now blacklisted
# token2 and token3 still work
```

### Test 2: Logout All Devices
```bash
curl -X POST http://localhost:4000/api/v1/users/logout-all-devices \
  -H "Authorization: Bearer token1" \
  -H "Content-Type: application/json"

# All tokens (token1, token2, token3) blacklisted
# User must login again
```

### Test 3: Delete Account
```bash
curl -X DELETE http://localhost:4000/api/v1/users/account/delete \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"password": "user_password"}'

# User deleted
# All tokens blacklisted
# Database auto-cleans up blacklist entries after token expiration
```

## Security Features

✅ **Automatic Token Cleanup**: MongoDB TTL index auto-deletes expired tokens
✅ **Token Blacklist Check**: Every request checks if token is valid
✅ **User Verification**: Tokens rejected if user doesn't exist
✅ **Password Change Detection**: Old tokens invalidated when password changes
✅ **Multi-Device Support**: Can logout individual devices or all at once
✅ **Account Deletion**: All tokens invalidated when account is deleted

## Database Performance

### Indexes Created
- `TokenBlacklist.userId` - For finding all tokens of a user
- `TokenBlacklist.token` - For checking if token is blacklisted
- `TokenBlacklist.expiresAt` - For TTL auto-cleanup

### TTL Index
- Automatically deletes expired tokens from MongoDB
- No manual cleanup needed
- Runs every 60 seconds by default

## Migration Guide (If Implementing on Existing App)

1. **Run migrations to create TokenBlacklist collection:**
   ```bash
   npm start
   # MongoDB will auto-create collection on first insert
   ```

2. **Existing sessions** won't be tracked until next login

3. **No action needed** for existing users - system works for new tokens

## Configuration

No configuration needed! The system works automatically.

Optional: Adjust JWT expiration in `.env`:
```
JWT_EXPIRES_IN=7d        # Tokens expire after 7 days
```

Blacklist entries auto-delete when token expires.

## Troubleshooting

### Issue: "Token has been invalidated" error
**Cause**: Token is blacklisted
**Solution**: User needs to login again

### Issue: User can still access after deletion
**Cause**: Old token was already verified before deletion
**Solution**: This is expected for 1-2 seconds. Refresh page.

### Issue: Blacklist collection growing too large
**Cause**: TTL index not working
**Solution**: Manually run:
```javascript
// In MongoDB shell
db.tokenblacklists.deleteMany({ expiresAt: { $lt: new Date() } })
```

## API Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/register` | No | Create new user |
| POST | `/login` | No | Get token |
| POST | `/logout` | Yes | Invalidate current token |
| POST | `/logout-all-devices` | Yes | Invalidate all tokens |
| DELETE | `/account/delete` | Yes | Delete account & tokens |
| GET | `/:id` | Yes | Get user details |
| PATCH | `/:id` | Yes | Update user |

## Future Enhancements

- [ ] Add refresh token rotation
- [ ] Add IP address tracking for tokens
- [ ] Add device fingerprinting
- [ ] Add two-factor authentication
- [ ] Add email notifications on logout all devices
- [ ] Add token activity log UI
