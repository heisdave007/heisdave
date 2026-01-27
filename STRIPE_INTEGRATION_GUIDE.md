# Stripe Integration Guide

## Overview
Your application now has a complete Stripe integration for checkout and payment processing. This guide explains how to set it up and use it.

## Setup Steps

### 1. Update Your Stripe Account Details

Edit the `config.env` file and add your actual Stripe API keys:

```env
# Get these from your Stripe Dashboard (Settings > API Keys)
STRIPE_PUBLIC_KEY = pk_test_YOUR_ACTUAL_PUBLIC_KEY
STRIPE_SECRET_KEY = sk_test_YOUR_ACTUAL_SECRET_KEY
STRIPE_WEBHOOK_SECRET = whsec_YOUR_ACTUAL_WEBHOOK_SECRET

# Base URL for redirect URLs
BASE_URL = http://localhost:3000
```

### 2. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings > API Keys**
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Set Up Webhook

For local testing:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/v1/payments/webhook`
4. Copy the webhook signing secret and add to `config.env` as `STRIPE_WEBHOOK_SECRET`

For production:
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/v1/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`

## Architecture

### Frontend (checkout.html)
- Dynamically loads Stripe public key from backend `/api/v1/payments/config`
- Two payment methods:
  - **Card Payment**: Direct card processing via Stripe Elements
  - **Checkout Session**: Hosted Stripe Checkout page

### Backend Components

#### 1. Payment Controller (`controllers/paymentController.js`)
- **getStripePublicKey()**: Serves public key to frontend (secure)
- **createPaymentIntent()**: Creates payment intent for direct card payments
- **createCheckoutSession()**: Creates hosted checkout session
- **handleWebhook()**: Processes Stripe webhook events

#### 2. Payment Routes (`routers/paymentRouters.js`)
```
GET  /api/v1/payments/config                    - Get Stripe public key
POST /api/v1/payments/payment-intent            - Create payment intent (requires auth)
POST /api/v1/payments/checkout-session          - Create checkout session (requires auth)
GET  /api/v1/payments/payment-intent/:id        - Get payment intent status (requires auth)
GET  /api/v1/payments/checkout-session/:id      - Get session status (requires auth)
POST /api/v1/payments/webhook                   - Stripe webhook (no auth needed)
```

#### 3. Order Schema (`schemas/orderSchema.js`)
Stores order details with payment tracking:
- `paymentIntentId` / `sessionId` - Stripe reference
- `status` - pending/completed/failed
- `totalAmount` - Order total
- `items` - Product details
- `customerEmail` - Customer email
- `receiptUrl` - Stripe receipt (after payment)

#### 4. Middleware (`index.js`)
- Raw body middleware for webhook signature verification
- Static file serving for frontend

## Payment Flows

### Card Payment Flow
```
1. User selects "Credit/Debit Card" payment method
2. Fills in email and card details
3. Frontend calls POST /api/v1/payments/payment-intent
4. Backend creates payment intent with Stripe
5. Frontend confirms payment with stripe.confirmCardPayment()
6. On success: Cart cleared, redirected to home
7. Webhook updates order status to "completed"
```

### Checkout Session Flow
```
1. User selects "Stripe Checkout (Hosted)" payment method
2. Fills in email
3. Frontend calls POST /api/v1/payments/checkout-session
4. Backend creates checkout session with Stripe
5. Redirects to Stripe-hosted checkout page
6. User completes payment on Stripe's domain
7. Redirects to success.html with session_id
8. Webhook updates order status to "completed"
```

## Testing

### Test Credit Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Auth Required: 4000 0025 0000 3155
Any expiry date (future)
Any CVC code
```

### Test Webhook Events

Using Stripe CLI:
```bash
# Trigger payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Trigger checkout.session.completed
stripe trigger checkout.session.completed
```

## Security Features

✅ **Public Key Safety**: Stored in backend, not hardcoded in frontend
✅ **Webhook Verification**: Stripe signature validation
✅ **Raw Body Handling**: Preserves signature for verification
✅ **Authentication**: Most endpoints require JWT auth
✅ **No Card Storage**: All card data handled by Stripe

## Error Handling

The system handles:
- Invalid amounts
- Empty cart
- Missing cart items
- Stripe API errors
- Webhook signature failures
- Invalid/expired tokens

## Next Steps

1. **Add your real Stripe keys to config.env**
2. **Set up Stripe CLI for local webhook testing**
3. **Test card payment flow with test cards**
4. **Test checkout session flow**
5. **Deploy and configure production webhook endpoint**

## Useful Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

## Troubleshooting

### "Public key not configured"
- Check STRIPE_PUBLIC_KEY in config.env
- Restart server: `npm start`

### Webhook not working locally
- Install Stripe CLI
- Run: `stripe listen --forward-to localhost:3000/api/v1/payments/webhook`
- Check webhook secret matches STRIPE_WEBHOOK_SECRET

### Payment fails silently
- Check browser console for errors
- Check server logs: `npm start`
- Verify token authentication

### Cart not showing
- Check localStorage has 'cart' data
- Verify JSON format in localStorage

## Production Checklist

- [ ] Switch to live Stripe keys (pk_live_, sk_live_)
- [ ] Update BASE_URL to your production domain
- [ ] Configure production webhook endpoint
- [ ] Enable HTTPS for checkout
- [ ] Test with real cards (if approved)
- [ ] Monitor webhook logs
- [ ] Set up order confirmation emails
- [ ] Enable Stripe's 3D Secure for enhanced security
