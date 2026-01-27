# Email Verification During Registration

## Overview
This document describes the email verification functionality added to the registration process. Users must verify their email address after registration before they can log in.

---

## Features

### 1. **Email Verification on Registration**
When a user registers, they automatically receive a verification email with a unique token.

### 2. **Verify Email Endpoint**
Users can verify their email by using the token sent to their inbox.

### 3. **Resend Verification Email**
If a user doesn't receive the initial email or it expires (24 hours), they can request a new verification email.

### 4. **Login Protection**
Users cannot log in until their email is verified.

---

## Database Schema Changes

Added to User Schema:
```javascript
emailVerificationToken: String,      // Hashed verification token
emailVerificationExpires: Date,      // Token expiry (24 hours)
isEmailVerified: Boolean,             // Email verification status (default: false)
emailVerifiedAt: Date                 // When email was verified
```

---

## API Endpoints

### 1. **Register User** (Updated)
**Endpoint:** `POST /api/v1/users/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "email": "john@example.com",
  "user": { /* user object */ }
}
```

**What Happens:**
- User is created with `isEmailVerified: false`
- Verification email is sent automatically
- User receives email with 24-hour verification link

---

### 2. **Verify Email**
**Endpoint:** `POST /api/v1/users/verify-email/:token`

**URL Parameters:**
- `token`: The verification token from the email link

**Response (Success):**
```json
{
  "message": "Email verified successfully",
  "token": "jwt_token_for_auto_login",
  "user": { /* user object with isEmailVerified: true */ }
}
```

**Response (Error):**
```json
{
  "message": "Invalid or expired verification token"
}
```

**Status Codes:**
- `200` - Email verified successfully
- `400` - Invalid or expired token
- `400` - Email already verified

---

### 3. **Resend Verification Email**
**Endpoint:** `POST /api/v1/users/resend-verification-email`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email resent successfully. Please check your email."
}
```

**Status Codes:**
- `200` - Email resent successfully
- `400` - Email already verified
- `404` - User not found

---

### 4. **Login User** (Updated)
**Endpoint:** `POST /api/v1/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Email Not Verified):**
```json
{
  "message": "Please verify your email before logging in",
  "email": "john@example.com",
  "requiresEmailVerification": true
}
```

**Status Code:** `403` - Email verification required

**Response (Email Verified):**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": { /* user object */ }
}
```

---

## Email Flow

### Registration Email
```
Subject: Email Verification - Complete Your Registration

Body:
Welcome to Our App!
Thank you for registering. Please verify your email to complete your registration.
This link will expire in 24 hours.

[Verify Email Button]
Or copy and paste this link: https://yourapp.com/verify-email/{token}
```

### Resend Email
```
Subject: Email Verification - Resend

Body:
Verify Your Email
We resent your email verification link. Please verify your email to complete your registration.
This link will expire in 24 hours.

[Verify Email Button]
Or copy and paste this link: https://yourapp.com/verify-email/{token}
```

---

## Frontend Integration

### Registration Page
After registration, show this message:
```
"Registration successful! Please check your email to verify your account."
```

### Login Page - Email Verification Check
If login returns `403` with `requiresEmailVerification: true`:
```javascript
if (response.status === 403) {
  showError('Please verify your email before logging in.');
  showResendLink(email); // Offer to resend verification email
}
```

### Verify Email Page
A beautiful verification page is provided: `public/verify-email.html`

**Features:**
- Auto-verifies email if token is in URL
- Shows loading state while verifying
- Displays success/error messages
- Allows resending verification email
- Auto-redirects to login on success

---

## Testing

### Test Registration with Email Verification

**1. Register a new user:**
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

**Expected Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "email": "test@example.com",
  "user": { /* user object with isEmailVerified: false */ }
}
```

---

**2. Verify the token was generated and saved:**
Open MongoDB and check the user document:
```javascript
db.users.findOne({ email: "test@example.com" });
```

You should see:
- `emailVerificationToken`: hashed token
- `emailVerificationExpires`: 24 hours from now
- `isEmailVerified`: false

---

**3. Try to login (should fail):**
```bash
curl -X POST http://localhost:4000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response (403):**
```json
{
  "message": "Please verify your email before logging in",
  "email": "test@example.com",
  "requiresEmailVerification": true
}
```

---

**4. Verify email with token:**
```bash
curl -X POST http://localhost:4000/api/v1/users/verify-email/TOKEN_FROM_EMAIL \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "message": "Email verified successfully",
  "token": "jwt_token",
  "user": { /* user object with isEmailVerified: true */ }
}
```

---

**5. Try to login again (should succeed):**
```bash
curl -X POST http://localhost:4000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": { /* verified user object */ }
}
```

---

**6. Resend verification email:**
```bash
curl -X POST http://localhost:4000/api/v1/users/resend-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## Security Features

✅ **Token Security**
- 32-byte random token generation
- SHA256 hashing before storage
- 24-hour expiration
- One-time use (cleared after verification)

✅ **Email Verification**
- Email verification required before login
- Prevents unauthorized access
- 24-hour token window for verification

✅ **Auto-Login After Verification**
- JWT token generated after email verification
- Users can log in immediately after verification

---

## Error Handling

| Scenario | Status | Message |
|----------|--------|---------|
| Invalid token | 400 | "Invalid or expired verification token" |
| Expired token | 400 | "Invalid or expired verification token" |
| Already verified | 400 | "Email already verified. Please login." |
| User not found | 404 | "User not found" |
| Email not verified on login | 403 | "Please verify your email before logging in" |
| No email provided | 400 | "Please provide email address" |

---

## User Journey

```
User Registers
    ↓
User receives email with verification link
    ↓
User clicks link (expires in 24 hours)
    ↓
Email verified successfully
    ↓
JWT token generated for auto-login
    ↓
User can now login
    ↓
    
OR
    
Email expires
    ↓
User clicks "Resend" button
    ↓
New email sent
    ↓
User verifies email
    ↓
Can now login
```

---

## Files Modified/Created

**New Files:**
- `public/verify-email.html` - Email verification page

**Modified Files:**
- `schemas/userSchema.js` - Added verification fields
- `controllers/userController.js` - Updated registerUser, loginUser, added verifyEmail and resendVerificationEmail
- `routers/userRouters.js` - Added verification routes

---

## Configuration

Ensure these environment variables are set in `config.env`:
```env
EMAIL_SERVICE = gmail
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_app_password
EMAIL_FROM = noreply@yourapp.com
FRONTEND_URL = http://localhost:3000
```

---

## Troubleshooting

### Email not received
- Check spam folder
- Verify email configuration in config.env
- Check MongoDB to ensure token was saved
- Verify email service is running

### Token expired
- 24-hour expiration window
- Use "Resend Verification Email" feature
- Request new token if needed

### Can't login even after verification
- Check `isEmailVerified` field in database
- Verify token was cleared after verification
- Check that `emailVerificationToken` is undefined

### Verification page not working
- Check URL contains valid token
- Verify FRONTEND_URL in config.env
- Check browser console for errors

---

## Best Practices

✅ Use app-specific password for Gmail (more secure)
✅ Set appropriate email expiration (24 hours is good)
✅ Display clear messages to users
✅ Provide easy resend option
✅ Monitor email delivery
✅ Log verification attempts

---

## Statistics

| Metric | Value |
|--------|-------|
| **Token Length** | 64 characters (32 bytes hex) |
| **Expiration** | 24 hours |
| **Hashing** | SHA256 |
| **Auto-Login** | Yes (JWT after verification) |

---

For more information about the complete password reset system, see [PASSWORD_RESET_DOCUMENTATION.md](PASSWORD_RESET_DOCUMENTATION.md).
