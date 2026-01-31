# Vercel Deployment Environment Variables Template

Copy and modify the values below to add to your Vercel project:

## 🔐 Security & Core
```
NODE_ENV=production
PORT=3000
```

## 🗄️ Database
```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/database
```

## 🔑 Authentication
```
JWT_SECRET=generate-a-strong-random-string-here
JWT_EXPIRES_IN=7d
PASSPORT_SECRET=generate-another-strong-random-string-here
```

## 📧 Email Configuration (Gmail SMTP)
```
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Your Name <noreply@example.com>
```

## 📨 Resend Email Service (Alternative/Legacy)
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM_LEGACY=noreply@yourapp.com
```

## 💳 Stripe Payment Configuration
```
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BASE_URL=https://your-vercel-domain.vercel.app
```

## 🌐 Frontend Configuration
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

## 📋 How to Add These to Vercel

### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. For each variable, click "Add New"
5. Enter the key and value
6. Select which environments (Production, Preview, Development)
7. Click "Save"
8. Redeploy after adding all variables

### Via Vercel CLI:
```bash
vercel env add MONGODB_URL
vercel env add JWT_SECRET
# ... repeat for each variable
```

## ⚠️ Important Security Notes

1. **NEVER commit `.env` files to Git** ✅ Already in .gitignore
2. **Keep STRIPE_SECRET_KEY private** - Only in production environment
3. **Use strong random strings** for JWT_SECRET and PASSPORT_SECRET
4. **Generate secrets with**: `openssl rand -base64 32`
5. **Update STRIPE_WEBHOOK_SECRET** after creating webhook in Stripe

## 🔄 Environment-Specific Variables

Some variables should only be in Production:
- STRIPE_SECRET_KEY (keep out of Preview/Development)
- JWT_SECRET (keep out of Preview/Development)
- Database credentials (if separate from production)

Production-specific setup in Vercel:
1. Set variables to "Production" only
2. Use different secrets for preview/development if needed
3. Stripe keys: Always use test keys first, switch to live in production

## 📝 Generating Strong Secrets

### On Windows (PowerShell):
```powershell
# Generate 32-byte base64 string
[Convert]::ToBase64String((1..32|ForEach-Object{[byte](Get-Random -Max 256)}))
```

### On macOS/Linux:
```bash
openssl rand -base64 32
```

## ✅ Verification

After deploying with these variables:
1. Check logs in Vercel dashboard
2. Test API endpoints
3. Verify database connection works
4. Test Stripe payment flow
5. Check email notifications are sent
6. Review authentication flows

---

**Note**: Replace placeholder values with your actual credentials from:
- MongoDB Atlas
- Stripe Dashboard
- Gmail App Passwords
- Resend Account

Never share these values publicly!
