# Password Reset - Quick Reference

## 📋 Files Modified/Created

**Created:**
- `utils/sendEmail.js` - Email sending utility
- `utils/resetToken.js` - Token generation utility  
- `middleware/resetTokenMiddleware.js` - Token verification
- `public/forgot-password.html` - Forgot password page
- `public/reset-password.html` - Reset password page
- `PASSWORD_RESET_DOCUMENTATION.md` - Full API docs
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `SETUP_GUIDE.md` - Setup instructions

**Modified:**
- `schemas/userSchema.js` - Added password reset fields
- `controllers/userController.js` - Added 3 new functions
- `routers/userRouters.js` - Added 3 new routes
- `config.env` - Added email configuration

---

## 🚀 Quick Start (5 minutes)

### 1. Configure Email (Gmail)
```env
# In config.env
EMAIL_SERVICE = gmail
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = app_specific_password
EMAIL_FROM = noreply@yourapp.com
```

### 2. Test Forgot Password
```bash
curl -X POST http://localhost:4000/api/v1/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### 3. Reset with Token from Email
```bash
curl -X POST http://localhost:4000/api/v1/users/reset-password/TOKEN \
  -H "Content-Type: application/json" \
  -d '{"password":"newPass123","confirmPassword":"newPass123"}'
```

---

## 🔌 API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/users/forgot-password` | POST | ❌ | Send reset email |
| `/api/v1/users/reset-password/:token` | POST | ❌ | Reset password |
| `/api/v1/users/change-password` | POST | ✅ | Change password |

---

## 📧 Email Flow

```
User Request Email
      ↓
Generate 32-byte random token
      ↓
Hash token with SHA256
      ↓
Save hashed token to DB (expires in 10 min)
      ↓
Send email with reset link containing raw token
      ↓
User clicks link, token sent to reset endpoint
      ↓
Hash token again, compare with DB
      ↓
If valid and not expired, update password
      ↓
Clear reset token from DB
```

---

## 🔑 Key Security Features

- **Token Hashing**: SHA256
- **Token Length**: 64 characters (32 bytes in hex)
- **Token Expiry**: 10 minutes
- **Password Hashing**: Bcrypt (10 rounds)
- **Authentication**: JWT required for change-password
- **Validation**: Email format, password matching

---

## 💾 Database Schema Changes

```javascript
// Added to User schema:
{
  passwordResetToken: String,      // Hashed token
  passwordResetExpires: Date       // Expiry timestamp
}
```

---

## 🧩 New Controller Functions

### forgotPassword()
- **Triggered by**: POST /forgot-password
- **Input**: email
- **Output**: Reset email sent
- **Side effects**: Saves token to DB

### resetPassword()
- **Triggered by**: POST /reset-password/:token
- **Input**: password, confirmPassword, token
- **Output**: Password updated
- **Side effects**: Clears reset token from DB

### changePassword()
- **Triggered by**: POST /change-password
- **Input**: currentPassword, newPassword, confirmPassword
- **Output**: New JWT token + password updated
- **Requirements**: Authenticated user (JWT required)

---

## 🌐 Frontend Pages

### forgot-password.html
- Email input with validation
- Loading states
- Success/error messages
- Link back to login

### reset-password.html
- Password & confirm password fields
- 8+ character validation
- Password matching validation
- Auto-redirect on success

---

## ⚠️ Error Messages

| Status | Message | Cause |
|--------|---------|-------|
| 404 | User not found | Email doesn't exist |
| 400 | Invalid or expired reset token | Token invalid/expired |
| 400 | Passwords do not match | Confirm ≠ password |
| 400 | Password must be 8+ chars | Weak password |
| 401 | Current password incorrect | Wrong password for change |
| 500 | Error sending email | SMTP configuration issue |

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path
1. ✅ User requests password reset → email sent
2. ✅ User clicks reset link → page loads
3. ✅ User enters new password → password updated
4. ✅ User logs in with new password → success

### Scenario 2: Expired Token
1. ✅ User requests reset → email sent
2. ⏳ Waits >10 minutes
3. ❌ Tries to reset → token expired error

### Scenario 3: Wrong Current Password
1. ✅ User logs in
2. ❌ Change password with wrong current password → error
3. ✅ Try again with correct password → success

---

## 📞 Troubleshooting

**"Email not received"**
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASS in config.env
- For Gmail: Use app-specific password, not account password

**"Invalid token error"**
- Token expires after 10 minutes, request new link
- Token must be from the email link

**"Password not updating"**
- Ensure password ≠ confirmPassword
- Check MongoDB connection
- Verify bcrypt hashing works

**"SMTP Error"**
- Check EMAIL_SERVICE value
- Verify firewall allows SMTP port (587)
- For Gmail: Enable less secure apps OR use app password

---

## 📚 Additional Resources

- `PASSWORD_RESET_DOCUMENTATION.md` - Detailed API documentation
- `SETUP_GUIDE.md` - Complete setup instructions
- `IMPLEMENTATION_SUMMARY.md` - What was implemented

---

## ✨ Features Included

✅ Secure token generation
✅ Email sending with nodemailer
✅ Token hashing and validation
✅ 10-minute token expiration
✅ Password strength validation
✅ Bcrypt password hashing
✅ JWT authentication for change password
✅ HTML email templates
✅ Frontend pages included
✅ Comprehensive error handling
✅ Full documentation

---

**Status**: ✅ Ready to use
**Nodemailer**: ✅ Installed (v7.0.12)
**Authentication**: ✅ JWT + Password hash
**Email Support**: ✅ Gmail, Outlook, Yahoo, SendGrid
