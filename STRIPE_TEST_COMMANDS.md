#!/bin/bash

# Stripe Payment Integration - Test Commands
# Run these curl commands to test the payment system

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000/api/v1"
JWT_TOKEN="your_jwt_token_here"  # Replace with your actual JWT token

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Stripe Payment Integration - Test Commands${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

# Function to display test category
test_category() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
}

# Function to display curl command
display_command() {
    echo -e "${GREEN}Command:${NC}"
    echo "$1"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════
# TEST 1: Create Payment Intent (Card Payment)
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 1: Create Payment Intent (Card Payment)"

CMD1="curl -X POST $BASE_URL/payments/payment-intent \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer $JWT_TOKEN' \\
  -d '{
    \"amount\": 99.99,
    \"currency\": \"usd\",
    \"cartItems\": [
      {
        \"productId\": \"prod_001\",
        \"productName\": \"Test Product 1\",
        \"price\": 49.99,
        \"quantity\": 1
      },
      {
        \"productId\": \"prod_002\",
        \"productName\": \"Test Product 2\",
        \"price\": 50.00,
        \"quantity\": 1
      }
    ],
    \"customerEmail\": \"test@example.com\"
  }'"

display_command "$CMD1"

echo -e "${YELLOW}Expected Response:${NC}"
cat << 'EOF'
{
  "success": true,
  "clientSecret": "pi_xxxxxx_secret_xxxxxx",
  "paymentIntentId": "pi_xxxxxx",
  "orderId": "mongodb_order_id"
}
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 2: Create Checkout Session (Hosted Checkout)
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 2: Create Checkout Session (Hosted Checkout)"

CMD2="curl -X POST $BASE_URL/payments/checkout-session \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer $JWT_TOKEN' \\
  -d '{
    \"cartItems\": [
      {
        \"productId\": \"prod_001\",
        \"productName\": \"Premium Package\",
        \"price\": 299.99,
        \"quantity\": 1
      }
    ],
    \"customerEmail\": \"user@example.com\"
  }'"

display_command "$CMD2"

echo -e "${YELLOW}Expected Response:${NC}"
cat << 'EOF'
{
  "success": true,
  "sessionId": "cs_xxxxxx",
  "url": "https://checkout.stripe.com/pay/cs_xxxxxx",
  "orderId": "mongodb_order_id"
}

# → Redirect user to "url" field for payment completion
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 3: Retrieve Payment Intent Status
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 3: Retrieve Payment Intent Status"

echo -e "${RED}⚠️  Replace 'pi_test_xxxxx' with actual payment intent ID${NC}"
echo ""

CMD3="curl -X GET $BASE_URL/payments/payment-intent/pi_test_xxxxx \\
  -H 'Authorization: Bearer $JWT_TOKEN'"

display_command "$CMD3"

echo -e "${YELLOW}Expected Response:${NC}"
cat << 'EOF'
{
  "success": true,
  "status": "succeeded",
  "amount": 99.99,
  "currency": "usd",
  "paymentIntentId": "pi_test_xxxxx"
}

# Possible status values:
# - processing: Still being processed
# - requires_action: User action needed (3D Secure, etc.)
# - requires_capture: Manual capture needed
# - requires_confirmation: Confirmation needed
# - requires_payment_method: No payment method attached
# - succeeded: Payment completed
# - canceled: Payment was canceled
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 4: Retrieve Checkout Session Status
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 4: Retrieve Checkout Session Status"

echo -e "${RED}⚠️  Replace 'cs_test_xxxxx' with actual checkout session ID${NC}"
echo ""

CMD4="curl -X GET $BASE_URL/payments/checkout-session/cs_test_xxxxx \\
  -H 'Authorization: Bearer $JWT_TOKEN'"

display_command "$CMD4"

echo -e "${YELLOW}Expected Response:${NC}"
cat << 'EOF'
{
  "success": true,
  "payment_status": "paid",
  "amount": 299.99,
  "currency": "usd",
  "customer_email": "user@example.com"
}

# Possible payment_status values:
# - unpaid: Not yet paid
# - paid: Successfully paid
# - no_payment_required: Free checkout
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 5: Webhook Test (Simulate Payment Success)
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 5: Webhook Test (Simulate Payment Success)"

echo -e "${YELLOW}Note: Webhook testing requires special Stripe CLI setup${NC}"
echo ""

echo -e "${GREEN}Option 1: Using Stripe CLI${NC}"
cat << 'EOF'

# Install Stripe CLI from: https://stripe.com/docs/stripe-cli

# 1. Authenticate with Stripe:
stripe login

# 2. Listen to webhooks:
stripe listen --forward-to localhost:3000/api/v1/payments/webhook

# 3. The CLI will output a webhook signing secret:
# → Copy this to your STRIPE_WEBHOOK_SECRET in config.env

# 4. In another terminal, trigger test events:
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger checkout.session.completed
EOF

echo ""
echo -e "${GREEN}Option 2: Manual Webhook Simulation${NC}"
cat << 'EOF'

# Get test event data from Stripe Logs, then:

curl -X POST http://localhost:3000/api/v1/payments/webhook \\
  -H 'Content-Type: application/json' \\
  -H 'Stripe-Signature: test_signature' \\
  -d '{
    "id": "evt_test_xxxxx",
    "object": "event",
    "api_version": "2023-10-16",
    "created": 1699999999,
    "data": {
      "object": {
        "id": "pi_test_xxxxx",
        "object": "payment_intent",
        "status": "succeeded"
      }
    },
    "type": "payment_intent.succeeded"
  }'
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 6: Frontend Checkout Flow
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 6: Frontend Checkout Flow"

echo -e "${GREEN}Step 1: Prepare Cart (JavaScript)${NC}"
cat << 'EOF'
const cart = [
  {
    productId: "prod_001",
    productName: "Product A",
    price: 99.99,
    quantity: 2
  },
  {
    productId: "prod_002", 
    productName: "Product B",
    price: 149.99,
    quantity: 1
  }
];

localStorage.setItem('cart', JSON.stringify(cart));
EOF

echo ""
echo -e "${GREEN}Step 2: Redirect to Checkout${NC}"
cat << 'EOF'
window.location.href = '/checkout.html';
EOF

echo ""
echo -e "${GREEN}Step 3: User Selects Payment Method${NC}"
cat << 'EOF'
- Card Payment: Enter test card 4242 4242 4242 4242, any future date, any CVC
- Or Checkout: Redirected to Stripe hosted checkout
EOF

echo ""
echo -e "${GREEN}Step 4: Payment Confirmation${NC}"
cat << 'EOF'
After successful payment:
- ✓ Redirected to /success.html
- ✓ Order created in database
- ✓ Cart cleared from localStorage
- ✓ Webhook updates order status
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 7: Test Card Numbers
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 7: Test Card Numbers (in /checkout.html)"

cat << 'EOF'

┌─ Basic Cards ─────────────────────────────────────────┐
│ Visa            │ 4242 4242 4242 4242                 │
│ Mastercard      │ 5555 5555 5555 4444                 │
│ American Exp    │ 3782 822463 10005                   │
│ Discover        │ 6011 1111 1111 1117                 │
└─────────────────────────────────────────────────────────┘

┌─ Special Result Cards ──────────────────────────────────┐
│ Declined        │ 4000 0000 0000 0002                 │
│ CVC Error       │ 4000 0000 0000 0127                 │
│ Expired         │ 4000 0000 0000 0069                 │
└─────────────────────────────────────────────────────────┘

┌─ 3D Secure Cards ──────────────────────────────────────┐
│ Success (3D)    │ 4000 0025 0000 3155                 │
│ Fail (3D)       │ 4000 0027 6000 3184                 │
└─────────────────────────────────────────────────────────┘

For ALL test cards:
- Expiry: Any future date (MM/YY format)
- CVC: Any 3-4 digits (depending on card type)
- Cardholder Name: Any value
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 8: Error Handling
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 8: Error Handling"

echo -e "${GREEN}Test Missing Cart Items:${NC}"
cat << 'EOF'
curl -X POST http://localhost:3000/api/v1/payments/payment-intent \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer $JWT_TOKEN' \
  -d '{
    "amount": 99.99,
    "currency": "usd",
    "cartItems": [],
    "customerEmail": "test@example.com"
  }'

# Expected Error:
# {
#   "success": false,
#   "message": "Cart items are required."
# }
EOF

echo ""
echo -e "${GREEN}Test Invalid Amount:${NC}"
cat << 'EOF'
curl -X POST http://localhost:3000/api/v1/payments/payment-intent \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer $JWT_TOKEN' \
  -d '{
    "amount": -50,
    "currency": "usd",
    "cartItems": [...],
    "customerEmail": "test@example.com"
  }'

# Expected Error:
# {
#   "success": false,
#   "message": "Invalid amount. Amount must be greater than 0."
# }
EOF

echo ""
echo -e "${GREEN}Test Missing Authorization:${NC}"
cat << 'EOF'
curl -X POST http://localhost:3000/api/v1/payments/payment-intent \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 99.99,
    "currency": "usd",
    "cartItems": [...],
    "customerEmail": "test@example.com"
  }'

# Expected Error: 401 Unauthorized or similar auth error
EOF

# ═══════════════════════════════════════════════════════════════════════
# TEST 9: Order Status Tracking
# ═══════════════════════════════════════════════════════════════════════

test_category "Test 9: Track Order Status"

echo -e "${GREEN}After creating a payment, check its status:${NC}"
echo ""

echo -e "${YELLOW}After Card Payment (Payment Intent):${NC}"
cat << 'EOF'
curl -X GET http://localhost:3000/api/v1/payments/payment-intent/pi_xxxxx \
  -H 'Authorization: Bearer $JWT_TOKEN'

# Expected: status: "succeeded" (after successful payment)
# Order status will be: "completed"
EOF

echo ""
echo -e "${YELLOW}After Checkout Session Payment:${NC}"
cat << 'EOF'
curl -X GET http://localhost:3000/api/v1/payments/checkout-session/cs_xxxxx \
  -H 'Authorization: Bearer $JWT_TOKEN'

# Expected: payment_status: "paid" (after successful payment)
# Order status will be: "completed" (after webhook processes)
EOF

# ═══════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Test Guide Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

echo ""
echo -e "${YELLOW}Before Running Tests:${NC}"
echo "1. Ensure server is running on port 3000"
echo "2. Replace \$JWT_TOKEN with actual JWT from login"
echo "3. Update cart items with real product IDs"
echo "4. Use test card 4242 4242 4242 4242 for testing"
echo ""

echo -e "${YELLOW}Important Notes:${NC}"
echo "• All amounts in USD (cents converted by API)"
echo "• Only test cards work in test mode"
echo "• Webhooks need Stripe CLI or manual testing"
echo "• Check server logs for detailed error messages"
echo ""

echo -e "${YELLOW}Resources:${NC}"
echo "📖 Documentation: STRIPE_PAYMENT_DOCUMENTATION.md"
echo "🚀 Quick Start: STRIPE_QUICK_START.md"
echo "🔗 Stripe Docs: https://stripe.com/docs"
echo ""
