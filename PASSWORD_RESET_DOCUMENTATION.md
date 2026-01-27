# Password Reset Functionality Documentation

## Overview
This implementation adds a complete password reset functionality using nodemailer. Users can reset their forgotten passwords by receiving a secure email with a reset token, and logged-in users can change their password.

## Features
1. **Forgot Password** - Send a password reset link to user's email
2. **Reset Password** - Reset password using the token from email
3. **Change Password** - Change password for authenticated users

## Installation
Nodemailer is already installed. No additional packages needed.

## Configuration

### 1. Update config.env
Add the following environment variables to your `config.env` file:

```env
# Email Configuration (Gmail example)
EMAIL_SERVICE = gmail
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_app_specific_password
EMAIL_FROM = noreply@yourapp.com
FRONTEND_URL = http://localhost:3000
JWT_SECRET = your_jwt_secret_key_here
```

#### For Gmail Setup:
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account → Security → App Passwords
3. Generate an App Password for "Mail" and "Windows Computer"
4. Use this password as `EMAIL_PASS` in config.env

#### For Other Email Services:
- **Outlook**: Use your Outlook email and password
- **Yahoo**: Use your Yahoo email and password
- **SendGrid**: Change EMAIL_SERVICE to 'SendGrid' and use API key

## API Endpoints

### 1. Forgot Password
**Endpoint:** `POST /api/v1/users/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent to your email"
}
```

---

### 2. Reset Password
**Endpoint:** `POST /api/v1/users/reset-password/:token`

**Request Body:**
```json
{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

### 3. Change Password (Authenticated Users)
**Endpoint:** `POST /api/v1/users/change-password`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully",
  "token": "new_jwt_token_here",
  "user": { /* user object */ }
}
```

---

## Files Modified/Created

### New Files:
- `utils/sendEmail.js` - Email sending utility
- `utils/resetToken.js` - Token generation utility
- `middleware/resetTokenMiddleware.js` - Token verification middleware

### Modified Files:
- `schemas/userSchema.js` - Added passwordResetToken and passwordResetExpires fields
- `controllers/userController.js` - Added forgotPassword, resetPassword, changePassword functions
- `routers/userRouters.js` - Added new routes for password reset
- `config.env` - Added email configuration variables

## Database Schema Changes

Added to User Schema:
```javascript
passwordResetToken: String,
passwordResetExpires: Date
```

## Security Features
1. **Token Hashing** - Reset tokens are hashed before storing in database
2. **Token Expiry** - Tokens expire after 10 minutes
3. **JWT Authentication** - Change password endpoint requires authentication
4. **Password Hashing** - All passwords are hashed with bcrypt before saving
5. **Email Verification** - User can only reset password via their registered email

## Flow Diagram

```
User Forgot Password
        ↓
POST /forgot-password (email)
        ↓
Generate Reset Token (32-byte random)
        ↓
Hash Token & Save to DB with 10-min expiry
        ↓
Send Email with Reset Link
        ↓
User Clicks Link with Token
        ↓
POST /reset-password/:token (new password)
        ↓
Hash Token & Verify Against DB
        ↓
Check if Token Not Expired
        ↓
Update Password & Clear Token Fields
        ↓
Success Response
```

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| User not found | 404 | "User not found" |
| Invalid/Expired token | 400 | "Invalid or expired reset token" |
| Password mismatch | 400 | "Passwords do not match" |
| Missing fields | 400 | "Please provide password and confirm password" |
| Wrong current password | 401 | "Current password is incorrect" |
| Email service error | 500 | "Error sending email" |

## Testing with Postman

### Test Forgot Password:
```
POST http://localhost:4000/api/v1/users/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Test Reset Password:
```
POST http://localhost:4000/api/v1/users/reset-password/token_from_email
Content-Type: application/json

{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### Test Change Password:
```
POST http://localhost:4000/api/v1/users/change-password
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

## Frontend Implementation Example

```javascript
// HTML Form for password reset
<form id="resetForm">
  <input type="password" id="password" placeholder="New Password" required>
  <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
  <button type="submit">Reset Password</button>
</form>

<script>
  document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get('token');
    
    const res = await fetch(`/api/v1/users/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
      })
    });
    
    const data = await res.json();
    alert(data.message);
  });
</script>
```

## Troubleshooting

### Email not sending:
1. Check EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASS in config.env
2. For Gmail, ensure you're using App Password, not regular password
3. Check firewall/antivirus blocking SMTP connections
4. Enable "Less secure app access" if not using App Password

### Token already expired:
- Reset tokens expire after 10 minutes
- User must request a new reset link

### Password not updating:
- Ensure confirmPassword matches password
- Check that bcrypt is properly hashing the password
- Verify MongoDB is saving the changes

## Notes
- Reset tokens are 32-byte random values hashed with SHA256
- Token expiry is set to 10 minutes (can be modified in forgotPassword controller)
- Passwords are automatically hashed by the pre-save hook in userSchema
- Change password auto-generates a new JWT token for seamless experience
