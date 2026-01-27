# Token Management - Quick Reference

## What Changed

✅ **Automatic Token Deletion** when user doesn't exist
✅ **Logout Endpoint** to manually invalidate tokens
✅ **Logout All Devices** endpoint for multi-device logout
✅ **Delete Account** endpoint with token cleanup
✅ **Token Blacklist** system with MongoDB

## Files Added

1. `schemas/tokenBlacklistSchema.js` - Database schema for blacklist
2. `utils/tokenBlacklist.js` - Token management functions
3. `TOKEN_MANAGEMENT_GUIDE.md` - Full documentation

## Files Modified

1. `controllers/userController.js` - Added logout functions and enhanced middleware
2. `routers/userRouters.js` - Added new routes

## New API Endpoints

### Logout Current Device
```bash
POST /api/v1/users/logout
Authorization: Bearer {token}
```

### Logout All Devices
```bash
POST /api/v1/users/logout-all-devices
Authorization: Bearer {token}
```

### Delete Account
```bash
DELETE /api/v1/users/account/delete
Authorization: Bearer {token}
Content-Type: application/json

{
  "password": "user_password"
}
```

## How It Works (Simple)

```
1. User tries to access protected route with token
2. System checks if token is blacklisted
3. If not, verifies JWT signature
4. Tries to find user in database
5. If user not found → Blacklist token + Delete all user tokens
6. Return 401 error
```

## Key Features

✅ Automatic cleanup of expired tokens (MongoDB TTL)
✅ Single logout (logout from one device only)
✅ Multi-device logout (logout from all devices)
✅ Account deletion with token cleanup
✅ Password change detection
✅ Secure token verification

## Database

New collection: `tokenblacklists`

```javascript
{
  userId: ObjectId,
  token: String (unique),
  reason: String,
  expiresAt: Date (auto-deletes)
}
```

## Testing

### Test Logout
```bash
curl -X POST http://localhost:4000/api/v1/users/logout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Logout All
```bash
curl -X POST http://localhost:4000/api/v1/users/logout-all-devices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Delete Account
```bash
curl -X DELETE http://localhost:4000/api/v1/users/account/delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}'
```

## Response Examples

### Logout Success
```json
{
  "message": "Logged out successfully. Token has been invalidated."
}
```

### Logout All Success
```json
{
  "message": "Logged out from all devices. Invalidated 3 token(s).",
  "tokensInvalidated": 3
}
```

### Delete Account Success
```json
{
  "message": "User account deleted successfully. All tokens have been invalidated."
}
```

### Error: User Not Found (Auto Token Deletion)
```json
{
  "message": "Unauthorized: User no longer exists",
  "action": "please_login_again"
}
```

## Security

- Tokens blacklisted immediately when user deleted
- Old tokens auto-rejected for deleted users
- Password changes invalidate old tokens
- TTL index auto-cleans expired entries
- No personal data stored in tokens

## Performance Impact

- Minimal: One database query per request to check blacklist
- Indexed queries are very fast
- TTL index is efficient
- No impact on login/register

## Backup & Recovery

If you delete a user by mistake:
1. The user's tokens are immediately blacklisted
2. You need to restore the user from backup
3. User tokens will still be blacklisted until TTL expires
4. Clear blacklist manually if needed:

```javascript
// MongoDB console
db.tokenblacklists.deleteMany({ userId: ObjectId("user_id") })
```

## Production Checklist

- [x] Token blacklist implemented
- [x] TTL index configured
- [x] Logout endpoints working
- [x] Delete account secure
- [x] Error messages user-friendly
- [ ] Monitor blacklist collection size
- [ ] Set up alerts for token spam
- [ ] Enable MongoDB backups

## Useful Commands

### Get all blacklisted tokens for a user
```javascript
// In MongoDB
db.tokenblacklists.find({ userId: ObjectId("user_id") })
```

### Clear all expired blacklist entries
```javascript
// In MongoDB
db.tokenblacklists.deleteMany({ expiresAt: { $lt: new Date() } })
```

### Check blacklist size
```javascript
// In MongoDB
db.tokenblacklists.countDocuments()
```

## Next Steps

1. Test the new endpoints
2. Update frontend to call logout endpoints
3. Monitor blacklist collection growth
4. Add logout UI to your app

See `TOKEN_MANAGEMENT_GUIDE.md` for detailed documentation.
