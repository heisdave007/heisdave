# Stripe Payment Integration - Quick Start

## What's New?
✅ **Payment Processing System** - Users can now purchase products using Stripe  
✅ **Two Payment Methods** - Card payments or hosted Stripe checkout  
✅ **Order Tracking** - All purchases stored in database with payment status  
✅ **Webhook Support** - Automatic payment verification and order updates

## Files Added
```
├── controllers/
│   └── paymentController.js (Payment processing functions)
├── routers/
│   └── paymentRouters.js (Payment API endpoints)
├── schemas/
│   └── orderSchema.js (Order database model)
├── public/
│   ├── checkout.html (Payment form)
│   └── success.html (Payment confirmation)
└── STRIPE_PAYMENT_DOCUMENTATION.md (Full documentation)
```

## Files Modified
- `package.json` - Added stripe package
- `config.env` - Added Stripe API keys
- `index.js` - Registered payment routes

## Quick Setup (3 Steps)

### Step 1: Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Settings → API Keys
3. Copy your **Secret Key**
4. Add to `config.env`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxx_your_secret_key_here
```

### Step 2: Test the Integration
Use the checkout page at `/checkout.html`

Test card: `4242 4242 4242 4242` (any future date, any CVC)

### Step 3: Set Up Webhooks (Production Only)
1. Go to Stripe Dashboard → Webhooks
2. Create endpoint: `https://yourdomain.com/api/v1/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
4. Copy webhook secret to `config.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx_your_webhook_secret
```

## API Endpoints

### Create Payment Intent
```bash
POST /api/v1/payments/payment-intent
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "amount": 99.99,
  "currency": "usd",
  "cartItems": [
    {
      "productId": "123",
      "productName": "Product",
      "price": 99.99,
      "quantity": 1
    }
  ],
  "customerEmail": "user@example.com"
}
```

### Create Checkout Session
```bash
POST /api/v1/payments/checkout-session
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "cartItems": [
    {
      "productId": "123",
      "productName": "Product",
      "price": 99.99,
      "quantity": 1
    }
  ],
  "customerEmail": "user@example.com"
}
```

### Check Payment Status
```bash
GET /api/v1/payments/payment-intent/:paymentIntentId
Authorization: Bearer YOUR_JWT_TOKEN

GET /api/v1/payments/checkout-session/:sessionId
Authorization: Bearer YOUR_JWT_TOKEN
```

## Payment Methods

### Method 1: Card Payment (Elements)
- User enters card details on your site
- More control over UI/UX
- Requires Stripe.js integration
- Returns immediately with payment status

### Method 2: Checkout Session (Hosted)
- Redirect to Stripe's hosted checkout page
- Simpler implementation
- Stripe handles UI
- Returns after user completes payment

## Test Credentials

| Card | Number | Expiry | CVC |
|------|--------|--------|-----|
| Success | 4242 4242 4242 4242 | Any future | Any |
| Decline | 4000 0000 0000 0002 | Any future | Any |
| 3D Secure | 4000 0025 0000 3155 | Any future | Any |

## Order Status Flow

```
pending (Initial) 
    ↓
    ├→ completed (Payment succeeded)
    ├→ failed (Payment failed)
    └→ cancelled (User cancelled)
```

## Frontend Implementation

### Adding to Cart (localStorage)
```javascript
const cart = [
  {
    productId: '123',
    productName: 'Product Name',
    price: 99.99,
    quantity: 1
  }
];

localStorage.setItem('cart', JSON.stringify(cart));
window.location.href = '/checkout.html';
```

### After Payment Success
- User redirected to `/success.html`
- Order details displayed
- Cart cleared automatically
- Can view orders or continue shopping

## Order Schema
```javascript
{
  userId: ObjectId,           // User reference
  items: Array,              // Cart items
  totalAmount: Number,       // Total price
  paymentIntentId: String,   // Stripe payment ID
  sessionId: String,         // Stripe session ID
  status: String,            // pending|completed|failed|cancelled
  paymentMethod: String,     // card|checkout_session
  customerEmail: String,     // Customer email
  receiptUrl: String,        // Stripe receipt
  createdAt: Date,          // Created timestamp
  updatedAt: Date           // Updated timestamp
}
```

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Mark order as completed |
| `payment_intent.payment_failed` | Mark order as failed |
| `checkout.session.completed` | Mark order as completed |

## Common Issues

**Q: Payment intent creation fails**  
A: Check STRIPE_SECRET_KEY is correct and amount is positive

**Q: Checkout page shows blank**  
A: Ensure cart is in localStorage and browser console for errors

**Q: Webhook not updating orders**  
A: Verify webhook secret and endpoint in Stripe Dashboard

**Q: Test cards not working**  
A: Use Stripe test mode (not live), not production keys

## Next Steps

1. ✅ Add payment routes - DONE
2. ✅ Create checkout page - DONE  
3. ✅ Add success page - DONE
4. ⬜ Connect products to cart
5. ⬜ Add order viewing page
6. ⬜ Send payment confirmation emails

## Environment Variables Reference

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_51SqVceHCdwLs97LR...  # Public (safe)
STRIPE_SECRET_KEY=sk_test_xxxxx...              # Secret (keep safe!)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...            # Webhook signing

# Server Configuration
BASE_URL=http://localhost:3000                   # Your domain
PORT=3000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Security Reminders

⚠️ **DO NOT:**
- Commit `.env` file to git
- Expose SECRET_KEY to frontend
- Log sensitive payment data
- Store raw card numbers (Stripe does this)

✅ **DO:**
- Use environment variables for secrets
- Verify webhook signatures
- Use HTTPS in production
- Keep Stripe.js library updated

## Support Resources

- 📖 [Full Documentation](./STRIPE_PAYMENT_DOCUMENTATION.md)
- 🔗 [Stripe Docs](https://stripe.com/docs)
- 🧪 [Test Cards](https://stripe.com/docs/testing#cards)
- 💬 [Integration Issues](./STRIPE_PAYMENT_DOCUMENTATION.md#troubleshooting)

---

**Status**: ✅ Payment system ready for testing  
**Public Key**: Configured ✅  
**Secret Key**: Needs to be added from Stripe Dashboard  
**Webhook**: Needs configuration for production
