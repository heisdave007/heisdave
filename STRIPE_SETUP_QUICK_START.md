# Stripe Integration Quick Start

## Immediate Actions Required

### 1. Add Your Stripe Keys (5 minutes)

Open `config.env` and update:

```env
STRIPE_PUBLIC_KEY = pk_test_YOUR_PUBLIC_KEY_HERE
STRIPE_SECRET_KEY = sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET_HERE
BASE_URL = http://localhost:3000
```

**Where to find these:**
1. Go to https://dashboard.stripe.com
2. Click "Developers" (top right)
3. Click "API Keys"
4. Copy "Publishable key" → STRIPE_PUBLIC_KEY
5. Click "Reveal test key" → Copy to STRIPE_SECRET_KEY

### 2. Set Up Webhooks (for testing)

```bash
# Install Stripe CLI
# Windows: https://stripe.com/docs/stripe-cli#install-windows
# macOS: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/v1/payments/webhook

# Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET
```

### 3. Test the Integration

1. Start your server: `npm start`
2. Go to http://localhost:3000/checkout.html
3. Add items to cart from products page
4. Click checkout
5. Select payment method:
   - **Card**: Use `4242 4242 4242 4242` (any future date, any CVC)
   - **Checkout**: Use `4242 4242 4242 4242`
6. Pay and verify order was created

## What Changed

### Backend Updates
- ✅ `config.env` - Added STRIPE_WEBHOOK_SECRET and BASE_URL
- ✅ `controllers/paymentController.js` - Added `getStripePublicKey()` function
- ✅ `routers/paymentRouters.js` - Added `/config` endpoint
- ✅ `index.js` - Added raw body middleware for webhooks
- ✅ `public/checkout.html` - Dynamic Stripe key loading

### Key Features
✅ **Two Payment Methods**
- Direct card payment
- Stripe hosted checkout

✅ **Complete Order Tracking**
- Stores payment intent / session ID
- Updates status on webhook
- Tracks receipt URL

✅ **Security**
- No hardcoded keys
- Webhook signature verification
- JWT authentication

## Test Credit Cards

| Type | Card Number | Expiry | CVC |
|------|------------|--------|-----|
| Visa | 4242 4242 4242 4242 | Future date | Any |
| Decline | 4000 0000 0000 0002 | Future date | Any |
| 3D Secure | 4000 0025 0000 3155 | Future date | Any |

## Verify Everything Works

### Backend Check
```bash
# Start server
npm start

# Should show:
# "Server is running on port 4000"
# "Database connected successfully"
```

### Test API Endpoint
```bash
# Get Stripe public key (no auth needed)
curl http://localhost:3000/api/v1/payments/config

# Should return JSON with publicKey
```

### Frontend Check
1. Open http://localhost:3000/checkout.html in browser
2. Open DevTools (F12)
3. Console should have NO errors
4. Should display Stripe logo in payment form

## Common Issues

### "Failed to load Stripe configuration"
- Check config.env has STRIPE_PUBLIC_KEY
- Restart server: `npm start`
- Clear browser cache (Ctrl+Shift+Delete)

### Webhook not triggering
- Did you run `stripe listen`?
- Check webhook secret in config.env matches
- Look for errors in server logs

### Payment fails
- Using test card `4242 4242 4242 4242`?
- Using future expiry date?
- Check browser console for errors
- Check server logs for API errors

## Next Steps

✅ Complete steps 1-3 above
✅ Test with test cards
✅ Verify webhook is updating orders
✅ Deploy to production
✅ Switch to live keys

## Production Deployment

When going live:
1. Get live Stripe keys (starts with `pk_live_`, `sk_live_`)
2. Update `config.env` with live keys
3. Set `BASE_URL = https://yourdomain.com`
4. Configure production webhook endpoint
5. Ensure HTTPS is enabled
6. Test with real cards (if approved by Stripe)

## Support

- Stripe Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
- CLI Help: `stripe --help`
