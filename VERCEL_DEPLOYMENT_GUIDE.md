# Vercel Deployment Configuration Guide

## ✅ Completed Configuration

Your project has been properly configured for Vercel deployment with the following updates:

### 1. **vercel.json** - Updated with comprehensive configuration
   - ✅ Proper build configuration for Node.js
   - ✅ File inclusion list for all project dependencies
   - ✅ Routes configured for API and static files
   - ✅ Security headers configured (Cache-Control, X-Content-Type-Options, X-Frame-Options)
   - ✅ Environment variable support (NODE_ENV, LOG_LEVEL)

### 2. **.vercelignore** - Created to optimize deployment
   - Excludes node_modules, logs, and unnecessary files
   - Reduces deployment size and build time

### 3. **package.json** - Updated scripts
   - ✅ Proper build and start scripts
   - ✅ Vercel-specific build configuration

### 4. **index.js** - Enhanced for production
   - ✅ Conditional environment variable loading (only in development)
   - ✅ Proper MongoDB connection timeout settings (10s)
   - ✅ Connection pooling optimized for serverless (min: 2, max: 10)
   - ✅ CORS configuration automatically adjusts for Vercel URL
   - ✅ Session cookie settings adapted for cross-domain requests (sameSite: 'none' in production)

## 🚀 Pre-Deployment Checklist

### Required: MongoDB Configuration
1. **IP Whitelist in MongoDB Atlas:**
   - Go to your MongoDB Atlas cluster
   - Click "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` (allows all IPs - necessary for Vercel's dynamic IPs)
   - Or use Vercel's static IPs if available in your plan

2. **Connection String:**
   - Ensure MONGODB_URL is set in Vercel's environment variables
   - Format: `mongodb+srv://user:password@cluster.mongodb.net/database?appName=yourapp`

### Required: Environment Variables in Vercel
In your Vercel project settings, set these environment variables:

```
NODE_ENV=production
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
PASSPORT_SECRET=your_passport_secret_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Your Name <noreply@example.com>
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BASE_URL=https://your-vercel-domain.vercel.app
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

**⚠️ IMPORTANT: Keep STRIPE_SECRET_KEY and other sensitive credentials private!**

### Required: Stripe Webhook Configuration
1. Log in to Stripe Dashboard
2. Go to Webhooks → Add endpoint
3. Endpoint URL: `https://your-vercel-domain.vercel.app/api/v1/payments/webhook`
4. Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the signing secret and set as `STRIPE_WEBHOOK_SECRET` in Vercel

## 📋 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel
Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

Option B: Via GitHub (Recommended)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the project root (heisdave folder)
4. Add environment variables in "Environment Variables" section
5. Deploy

### Step 3: Verify Deployment
After deployment, verify:
- ✅ Application loads without errors
- ✅ API endpoints respond (test with `/api/v1/products`)
- ✅ Database connection works
- ✅ Authentication flows work
- ✅ Stripe payments work

## 🔧 Troubleshooting

### "Database connection failed"
- Check MongoDB IP whitelist includes `0.0.0.0/0`
- Verify MONGODB_URL is correct
- Check credentials in MongoDB Atlas

### "CORS errors"
- The FRONTEND_URL must match your actual Vercel domain
- Ensure CORS headers are properly configured in index.js

### "Stripe webhook not working"
- Verify webhook URL in Stripe dashboard matches your Vercel domain
- Check STRIPE_WEBHOOK_SECRET is set correctly
- Review webhook logs in Stripe dashboard

### "Session/Authentication issues"
- Session cookie is set to `sameSite: 'none'` for cross-origin (production only)
- Ensure JWT_SECRET and PASSPORT_SECRET are set in environment

### Build Failures
Check Vercel deployment logs:
1. Go to your Vercel project dashboard
2. Click "Deployments"
3. Click the failed deployment
4. View build logs for error details

## 📊 Project Structure (Vercel Ready)
```
heisdave/
├── vercel.json          ✅ Deployment config
├── .vercelignore        ✅ Optimization config
├── package.json         ✅ Updated scripts
├── index.js             ✅ Production ready
├── config.env           📝 Local development only
├── controllers/         ✅ API logic
├── routers/             ✅ Route handlers
├── schemas/             ✅ Database schemas
├── middleware/          ✅ Custom middleware
├── utils/               ✅ Utilities (email, auth, etc.)
└── public/              ✅ Frontend files
```

## 🎯 Key Differences from Local to Production

| Feature | Local | Production (Vercel) |
|---------|-------|-------------------|
| Environment Variables | config.env | Vercel dashboard |
| Database Timeout | 5s | 10s |
| Connection Pool | Default | Min: 2, Max: 10 |
| Secure Cookies | false | true |
| Same-Site Policy | lax | none |
| CORS Origin | localhost | Vercel URL |

## ✨ Notes

- All configuration files are optimized for serverless functions
- MongoDB connection is pooled for optimal performance
- Session handling is configured for cross-origin requests
- Static files are served efficiently through Vercel's CDN
- API routes use proper HTTP methods and headers

---

**Status**: ✅ Ready for Vercel Deployment

For more help: https://vercel.com/docs/frameworks/nodejs
