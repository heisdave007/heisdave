# Password Reset Integration Guide

## Overview
This guide walks you through integrating the password reset functionality into your Node.js/Express application.

---

## ✅ Pre-requisites
- ✓ Node.js installed
- ✓ Express server running
- ✓ MongoDB connected
- ✓ Nodemailer installed (`npm i nodemailer`)
- ✓ All dependency packages installed

---

## 🔧 Step-by-Step Setup

### Step 1: Configure Environment Variables
Update your `config.env` file:

```env
PORT = 4000
MONGODB_URL = mongodb+srv://youruser:yourpass@cluster.mongodb.net/?appName=collection
JWT_SECRET = your_jwt_secret_key_here

# Email Configuration
EMAIL_SERVICE = gmail
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_app_password
EMAIL_FROM = noreply@yourapp.com
FRONTEND_URL = http://localhost:3000
```

#### For Gmail:
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in left sidebar
3. Enable "2-Step Verification" if not enabled
4. Go to "App Passwords" (appears after 2FA is enabled)
5. Select "Mail" and "Windows Computer" (or your device)
6. Google generates a 16-character password
7. Copy this password as `EMAIL_PASS`

#### For Other Providers:
- **Outlook/Hotmail**: Use your email and password
- **Yahoo**: Use your email and app-specific password
- **SendGrid**: Set EMAIL_SERVICE to 'SendGrid' and use API key

---

### Step 2: Verify Database Schema
The user schema should have these fields (already added):

```javascript
passwordResetToken: String,
passwordResetExpires: Date
```

Check this is in `schemas/userSchema.js`

---

### Step 3: Verify Imports in Controller
`controllers/userController.js` should have:

```javascript
import sendEmail from "../utils/sendEmail.js";
import { generateResetToken } from "../utils/resetToken.js";
import crypto from "crypto";
```

---

### Step 4: Verify Routes
Check `routers/userRouters.js` includes:

```javascript
// Password reset routes
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').post(resetPassword)
router.route('/change-password').post(protectedRoute, changePassword)
```

---

## 📱 Frontend Integration

### Option 1: Link to Provided HTML Pages
In your login page (`login.html`), add:

```html
<a href="/forgot-password.html" class="forgot-link">Forgot Password?</a>
```

### Option 2: Add to Your Existing Form
In your login form:

```html
<div class="login-container">
  <form id="loginForm">
    <input type="email" placeholder="Email" required>
    <input type="password" placeholder="Password" required>
    <button type="submit">Login</button>
  </form>
  <a href="/forgot-password.html">Forgot Password?</a>
</div>
```

### Option 3: JavaScript Fetch Implementation
```javascript
// Send forgot password request
async function requestPasswordReset(email) {
  const response = await fetch('/api/v1/users/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
}

// Reset password with token
async function resetPassword(token, password, confirmPassword) {
  const response = await fetch(`/api/v1/users/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, confirmPassword })
  });
  return response.json();
}

// Change password (logged-in users)
async function changePassword(currentPassword, newPassword, confirmPassword, token) {
  const response = await fetch('/api/v1/users/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
  });
  return response.json();
}
```

---

## 🧪 Testing

### Using Postman or cURL

#### Test 1: Request Password Reset
```bash
curl -X POST http://localhost:4000/api/v1/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "message": "Password reset link sent to your email"
}
```

---

#### Test 2: Reset Password
Copy the token from the email link, then:

```bash
curl -X POST http://localhost:4000/api/v1/users/reset-password/TOKEN_FROM_EMAIL \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

#### Test 3: Change Password (Logged In)
```bash
curl -X POST http://localhost:4000/api/v1/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "Password changed successfully",
  "token": "new_jwt_token",
  "user": { /* user object */ }
}
```

---

## 🔍 Debugging

### Check Email Configuration
Test your email setup with this script:

```javascript
// test-email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('✓ Email service ready');
  }
});
```

Run: `node test-email.js`

---

### Check Database Fields
Open MongoDB Compass or similar:
```javascript
db.users.findOne({ email: "test@example.com" })
```

Should show:
- `passwordResetToken` (hashed, if reset requested)
- `passwordResetExpires` (timestamp, if reset requested)

---

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Email not received | Check spam folder, verify credentials in config.env, check SMTP firewall |
| Invalid token error | Token expired (10 min), request new reset link |
| Password not saving | Check password !== confirmPassword, verify bcrypt is hashing |
| 401 Unauthorized | Missing or expired JWT token in Authorization header |
| 404 User not found | Email doesn't exist in database |
| SMTP error | Verify EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS values |

---

## 📊 Database Schema

User document after password reset request:
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$10$hashedpassword...",
  role: "user",
  passwordResetToken: "hashed_random_token",
  passwordResetExpires: ISODate("2026-01-17T14:35:00.000Z"),
  createdAt: ISODate("2026-01-17T14:20:00.000Z"),
  updatedAt: ISODate("2026-01-17T14:25:00.000Z")
}
```

After successful reset:
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$10$newhashedpassword...",
  role: "user",
  passwordResetToken: undefined,
  passwordResetExpires: undefined,
  passwordChangedAt: ISODate("2026-01-17T14:35:00.000Z"),
  createdAt: ISODate("2026-01-17T14:20:00.000Z"),
  updatedAt: ISODate("2026-01-17T14:35:00.000Z")
}
```

---

## 🔐 Security Best Practices

✅ **Do**:
- Use HTTPS in production
- Store JWT secret in environment variables
- Use strong passwords (8+ characters)
- Hash tokens before storing
- Set appropriate token expiry (10 minutes)
- Validate email format
- Use app-specific passwords for Gmail
- Clear reset token after use

❌ **Don't**:
- Store plain text passwords
- Use weak JWT secrets
- Send passwords in emails
- Use long token expiration
- Log sensitive information
- Expose error details to users
- Skip email verification

---

## 📞 Support

For issues:
1. Check `PASSWORD_RESET_DOCUMENTATION.md` for detailed API docs
2. Verify all files are in correct directories
3. Ensure nodemailer is installed: `npm list nodemailer`
4. Check config.env has all required variables
5. Review server console for error messages

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Users receive password reset emails
- ✅ Reset links are valid for 10 minutes
- ✅ Passwords are successfully updated
- ✅ Failed attempts show appropriate error messages
- ✅ Logged-in users can change password
- ✅ New JWT token received after password change
