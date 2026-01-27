# Email Verification - Quick Setup Guide

## What's New

Email verification is now required during registration. Users must verify their email before they can log in.

---

## 🚀 Quick Start

### Step 1: User Registers
User submits registration form with name, email, password.

### Step 2: Verification Email Sent
System automatically sends verification email to user's email address.

### Step 3: User Verifies Email
User clicks link in email → Email verified → Can now login

---

## 📧 API Endpoints

### Register
```bash
POST /api/v1/users/register
```

### Verify Email
```bash
POST /api/v1/users/verify-email/:token
```

### Resend Verification
```bash
POST /api/v1/users/resend-verification-email
```

### Login (Now checks email verification)
```bash
POST /api/v1/users/login
```

---

## 🧪 Test Commands

### 1. Register User
```bash
curl -X POST http://localhost:4000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### 2. Verify Email
```bash
curl -X POST http://localhost:4000/api/v1/users/verify-email/TOKEN_FROM_EMAIL \
  -H "Content-Type: application/json"
```

### 3. Login
```bash
curl -X POST http://localhost:4000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Resend Verification
```bash
curl -X POST http://localhost:4000/api/v1/users/resend-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## 📝 Registration Response (NEW)

Before verification:
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "email": "test@example.com",
  "user": {
    "isEmailVerified": false,
    "emailVerificationToken": "hashed_token",
    "emailVerificationExpires": "2026-01-18T...",
    ...
  }
}
```

---

## 🔐 Login Protection (UPDATED)

**If email not verified:**
```json
{
  "message": "Please verify your email before logging in",
  "email": "test@example.com",
  "requiresEmailVerification": true
}
Status: 403
```

**If email verified:**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": { ... }
}
Status: 200
```

---

## 📋 Database Changes

User document now has:
```javascript
{
  email: "user@example.com",
  isEmailVerified: false,                    // Status
  emailVerificationToken: "hashed_token",    // For verification
  emailVerificationExpires: ISODate(...),    // Expires in 24 hours
  emailVerifiedAt: undefined                 // Set after verification
}
```

After verification:
```javascript
{
  email: "user@example.com",
  isEmailVerified: true,                     // Verified!
  emailVerificationToken: undefined,         // Cleared
  emailVerificationExpires: undefined,       // Cleared
  emailVerifiedAt: ISODate(...)              // When verified
}
```

---

## 🎨 Frontend Pages

**New Page:** `public/verify-email.html`
- Auto-verifies if token in URL
- Shows loading/success/error states
- Allows resending verification email
- Beautiful responsive design

---

## ⚙️ Configuration

Make sure these are in `config.env`:
```env
EMAIL_SERVICE = gmail
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_app_password
EMAIL_FROM = noreply@yourapp.com
FRONTEND_URL = http://localhost:3000
```

---

## 🔑 Key Features

✅ Automatic email verification required
✅ 24-hour token expiration
✅ Resend verification email option
✅ Prevents login until verified
✅ Auto-login after verification
✅ Beautiful verification page included
✅ Clear error messages

---

## ⏱️ Timeline

| Action | Duration |
|--------|----------|
| Register | Immediate |
| Email sent | <1 minute |
| Token expires | 24 hours |
| Auto-verify | <1 minute (if user clicks link) |

---

## ❌ Common Issues

**Email not received:**
- Check spam folder
- Verify config.env settings
- Wait a minute and check again

**Token expired:**
- Use resend verification option
- User has 24 hours to verify

**Can't login after registration:**
- User must verify email first
- Send verification email link
- Click link in email to verify

---

## 📊 User Journey

```
Registration Form
    ↓
Submit registration
    ↓
✓ User created (isEmailVerified: false)
✓ Verification email sent
    ↓
User checks email
    ↓
User clicks verification link
    ↓
verify-email.html page loads
    ↓
Auto-submits verification token
    ↓
✓ Email verified (isEmailVerified: true)
✓ JWT token generated
    ↓
Auto-redirect to login
    ↓
User can now login
```

---

## 💡 Tips

- Integration is automatic - no code changes needed in registration form
- Verification page handles everything automatically
- Users get auto-logged in after verification
- Resend option prevents user frustration
- All security best practices implemented

---

## 📚 For Detailed Info

See: `EMAIL_VERIFICATION_DOCUMENTATION.md`

---

**Status**: ✅ Complete and Ready to Use
**Time to Setup**: 5 minutes (email config)
**Complexity**: Simple (automatic)
