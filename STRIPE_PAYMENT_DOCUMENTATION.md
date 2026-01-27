# Stripe Payment Integration Guide

## Overview
This application integrates Stripe payment processing to enable users to purchase products from their shopping cart. The system supports two payment methods: direct card payments and Stripe's hosted checkout.

## Features
- ✅ Payment Intent creation for card payments
- ✅ Checkout Session creation for hosted checkout
- ✅ Payment status retrieval
- ✅ Webhook handling for async payment events
- ✅ Order persistence with payment tracking
- ✅ Secure payment processing with PCI compliance

## Files Added/Modified

### New Files Created
1. **`controllers/paymentController.js`** - Payment processing logic
2. **`routers/paymentRouters.js`** - Payment API routes
3. **`schemas/orderSchema.js`** - Order database schema
4. **`public/checkout.html`** - Payment checkout page
5. **`public/success.html`** - Payment success page

### Modified Files
1. **`package.json`** - Added stripe package
2. **`config.env`** - Added Stripe API keys
3. **`index.js`** - Registered payment routes

## Setup Instructions

### 1. Install Stripe Package
```bash
npm install stripe
```

### 2. Configure Environment Variables
Add these to your `config.env`:
```env
STRIPE_PUBLIC_KEY=pk_test_51SqVceHCdwLs97LR6414MxNGzCwVwkxiQJN6l2b1NiLNriZMI36uRZfneUyKar8kQDXxq68oHsEKsdu4DOdcyJr400BDlZygz6
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
BASE_URL=http://localhost:3000
```

**⚠️ IMPORTANT:**
- **STRIPE_PUBLIC_KEY**: Safe to use on frontend, already provided
- **STRIPE_SECRET_KEY**: Must be obtained from Stripe Dashboard → Settings → API Keys (keep secret!)
- **STRIPE_WEBHOOK_SECRET**: Get from Stripe Dashboard → Webhooks (after setting up endpoint)

### 3. Set Up Stripe Webhook (for production)
1. Go to Stripe Dashboard → Webhooks
2. Create a new endpoint: `https://yourdomain.com/api/v1/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in config.env

## API Endpoints

### Create Payment Intent (Card Payment)
**POST** `/api/v1/payments/payment-intent`
```json
{
  "amount": 99.99,
  "currency": "usd",
  "cartItems": [
    {
      "productId": "product123",
      "productName": "Product Name",
      "price": 99.99,
      "quantity": 1
    }
  ],
  "customerEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "paymentIntentId": "pi_xxxxx",
  "orderId": "order_mongodb_id"
}
```

### Create Checkout Session
**POST** `/api/v1/payments/checkout-session`
```json
{
  "cartItems": [
    {
      "productId": "product123",
      "productName": "Product Name",
      "price": 99.99,
      "quantity": 1
    }
  ],
  "customerEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_xxxxx",
  "url": "https://checkout.stripe.com/pay/cs_xxxxx",
  "orderId": "order_mongodb_id"
}
```

### Retrieve Payment Intent Status
**GET** `/api/v1/payments/payment-intent/:paymentIntentId`

**Response:**
```json
{
  "success": true,
  "status": "succeeded",
  "amount": 99.99,
  "currency": "usd",
  "paymentIntentId": "pi_xxxxx"
}
```

### Retrieve Checkout Session Status
**GET** `/api/v1/payments/checkout-session/:sessionId`

**Response:**
```json
{
  "success": true,
  "payment_status": "paid",
  "amount": 99.99,
  "currency": "usd",
  "customer_email": "user@example.com"
}
```

### Webhook Handler
**POST** `/api/v1/payments/webhook`
- Automatically updates order status when payment succeeds/fails
- No authentication required
- Requires `stripe-signature` header from Stripe

## Testing the Integration

### Test Card Numbers
Use these card numbers in the checkout form:

| Card Type | Number | Expiry | CVC |
|-----------|--------|--------|-----|
| Visa | 4242 4242 4242 4242 | Any future date | Any 3 digits |
| MasterCard | 5555 5555 5555 4444 | Any future date | Any 3 digits |
| Amex | 3782 822463 10005 | Any future date | Any 4 digits |
| Declined | 4000 0000 0000 0002 | Any future date | Any 3 digits |

### Test Payment Flow

#### 1. Card Payment Method
```bash
# Step 1: Create payment intent
curl -X POST http://localhost:3000/api/v1/payments/payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 99.99,
    "currency": "usd",
    "cartItems": [{
      "productId": "123",
      "productName": "Test Product",
      "price": 99.99,
      "quantity": 1
    }],
    "customerEmail": "test@example.com"
  }'

# Step 2: Get client secret from response
# Step 3: Use Stripe.js to confirm payment on frontend
# Step 4: Check webhook for payment confirmation
```

#### 2. Checkout Session Method
```bash
# Step 1: Create checkout session
curl -X POST http://localhost:3000/api/v1/payments/checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cartItems": [{
      "productId": "123",
      "productName": "Test Product",
      "price": 99.99,
      "quantity": 1
    }],
    "customerEmail": "test@example.com"
  }'

# Step 2: Redirect user to session URL
# Step 3: User completes payment on Stripe hosted page
# Step 4: Redirected to success page with session ID
# Step 5: Webhook updates order status
```

#### 3. Retrieve Payment Status
```bash
# Check payment intent status
curl http://localhost:3000/api/v1/payments/payment-intent/pi_xxxxx \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check checkout session status
curl http://localhost:3000/api/v1/payments/checkout-session/cs_xxxxx \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Order Schema

Orders are automatically created and tracked in the database with the following structure:

```javascript
{
  userId: ObjectId,           // Reference to user
  items: [                    // Cart items
    {
      productId: ObjectId,
      productName: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,        // Total in dollars
  paymentIntentId: String,    // Stripe payment intent ID
  sessionId: String,          // Stripe checkout session ID
  status: String,             // 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: String,      // 'card' | 'checkout_session'
  customerEmail: String,      // Customer email
  stripeCustomerId: String,   // Stripe customer ID
  receiptUrl: String,         // Stripe receipt URL
  failureReason: String,      // Payment failure reason
  createdAt: Date,           // Order creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

## Frontend Integration

### Using the Checkout Page
1. Add items to localStorage under key `cart`:
```javascript
localStorage.setItem('cart', JSON.stringify([
  {
    productId: '123',
    productName: 'Product Name',
    price: 99.99,
    quantity: 1
  }
]));
```

2. Redirect to checkout page:
```javascript
window.location.href = '/checkout.html';
```

3. User selects payment method and completes payment
4. On success, user is redirected to success page
5. Cart is automatically cleared

### Manual Stripe.js Integration
```javascript
import { Stripe } from 'stripe';

const stripe = Stripe('pk_test_51SqVceHCdwLs97LR6414MxNGzCwVwkxiQJN6l2b1NiLNriZMI36uRZfneUyKar8kQDXxq68oHsEKsdu4DOdcyJr400BDlZygz6');
const elements = stripe.elements();
const cardElement = elements.create('card');

cardElement.mount('#card-element');

// Create payment intent
const response = await fetch('/api/v1/payments/payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 99.99,
    cartItems: cartItems,
    customerEmail: email
  })
});

const { clientSecret } = await response.json();

// Confirm payment
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { email }
  }
});

if (result.paymentIntent.status === 'succeeded') {
  // Payment successful
}
```

## Security Considerations

1. **API Keys**: 
   - Public key: Safe to expose to frontend
   - Secret key: NEVER expose to frontend, always keep on backend

2. **Webhook Verification**:
   - Verify `stripe-signature` header
   - Stripe signs all webhooks with your webhook secret
   - Prevents unauthorized webhook calls

3. **PCI Compliance**:
   - Never handle raw credit card data
   - Use Stripe Elements or Checkout for card collection
   - Let Stripe handle encryption and storage

4. **HTTPS Required**:
   - Always use HTTPS in production
   - Stripe requires secure connections for payment processing

## Troubleshooting

### Payment Intent Fails
- Verify `STRIPE_SECRET_KEY` is correct
- Check that `amount` is positive number
- Ensure `cartItems` array is not empty

### Webhook Not Triggering
- Verify webhook endpoint is publicly accessible
- Check `stripe-signature` header is present
- Confirm webhook secret matches in Stripe Dashboard
- Verify event types are enabled in webhook settings

### Card Declined
- Use provided test card numbers
- Check card details (expiry, CVC)
- Verify amount is correct (in dollars, not cents)

### Session Redirect Issues
- Ensure `BASE_URL` environment variable is set correctly
- Check redirect URLs match in Stripe Dashboard
- Verify success/cancel URLs are publicly accessible

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe.js Reference](https://stripe.com/docs/stripe-js)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Webhook Events](https://stripe.com/docs/api/events)
- [Payment Intent Guide](https://stripe.com/docs/payments/payment-intents)

## Common Use Cases

### Processing Refunds
```javascript
const refund = await stripe.refunds.create({
  payment_intent: 'pi_xxxxx',
});
```

### Creating Customers
```javascript
const customer = await stripe.customers.create({
  email: 'customer@example.com',
  name: 'Customer Name'
});
```

### Listing Charges
```javascript
const charges = await stripe.charges.list({
  limit: 10
});
```

## Support & Questions
For payment integration support, contact your Stripe support team or refer to the official Stripe documentation.
