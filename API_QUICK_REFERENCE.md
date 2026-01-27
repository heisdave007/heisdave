# API Integration Quick Reference

## 🚀 Quick Start

### 1. Start Backend
```bash
npm start
# Runs on http://localhost:4000
```

### 2. Open Frontend
```
http://localhost:3000  (if using server)
or
file:///.../public/register.html (direct file access)
```

### 3. Register → Login → Shop
All API connections are automatic!

---

## 📱 Frontend Files Summary

### Authentication Pages
- **register.html** → POST /api/v1/users/register
- **login.html** → POST /api/v1/users/login

### Main App
- **home.html** → Requires token, shows user, has logout
  - Uses: GET /api/v1/products (via script2.js)
  - Uses: POST /api/v1/users/logout (logout button)

### Checkout
- **checkout.html** → Requires token, handles payment
  - Uses: GET /api/v1/payments/config
  - Uses: POST /api/v1/payments/checkout-session
  - Uses: POST /api/v1/payments/payment-intent

---

## 🔑 Key JavaScript Functions

### In script2.js (home.html):
```javascript
// Fetch products from API
fetchProducts()

// Get cart from localStorage
getCart()

// Save cart to localStorage
saveCart()

// Add item to cart
addToCart(productId)

// Remove item from cart
removeFromCart(index)

// Update cart display
updateCart()
```

### In home.html:
```javascript
// Logout (calls API + clears token)
logoutBtn.addEventListener('click', async () => {...})

// Go to checkout
checkoutBtn.addEventListener('click', () => {...})
```

### In checkout.html:
```javascript
// Initialize Stripe
initializeStripe()

// Get cart from localStorage
getCart()

// Display cart items
displayCart()

// Handle payment submission
document.getElementById('payment-form').addEventListener('submit', async (e) => {...})
```

---

## 🛠️ Common Code Snippets

### Make API Call (Fetch)
```javascript
const response = await fetch('http://localhost:4000/api/v1/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ data: 'here' })
});

const data = await response.json();
```

### Make API Call (Axios)
```javascript
const response = await axios.post(
  'http://localhost:4000/api/v1/endpoint',
  { data: 'here' },
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### Get Token from localStorage
```javascript
const token = localStorage.getItem('token');
```

### Decode Token (Get User Info)
```javascript
const payload = JSON.parse(atob(token.split('.')[1]));
const email = payload.email;
const id = payload.id;
```

### Save to localStorage
```javascript
localStorage.setItem('cart', JSON.stringify(cartArray));
```

### Retrieve from localStorage
```javascript
const cart = JSON.parse(localStorage.getItem('cart')) || [];
```

### Redirect to Page
```javascript
window.location.href = 'login.html';
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 4000
- [ ] Frontend can access http://localhost:4000
- [ ] MongoDB connected
- [ ] Can register new user
- [ ] Can login and get token
- [ ] Products display on home page
- [ ] Can add to cart
- [ ] Cart persists on refresh
- [ ] Can logout
- [ ] Can proceed to checkout
- [ ] Stripe initialized on checkout page

---

## 🔍 Testing Commands

### Test Registration
```bash
curl -X POST http://localhost:4000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:4000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Test Get Products
```bash
curl http://localhost:4000/api/v1/products
```

### Test Logout (with token)
```bash
curl -X POST http://localhost:4000/api/v1/users/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (home.html)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  User logs in → Token saved to localStorage      │  │
│  │  Page loads → Fetch products from /api/v1/...    │  │
│  │  Products display → User adds to cart (localStorage) │  │
│  │  User clicks checkout → Go to checkout.html       │  │
│  │  Stripe processes payment → Redirect on success   │  │
│  │  User clicks logout → Clear token → Back to login │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
                    API Calls via
                  fetch() / axios
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Backend (index.js + Controllers)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  POST /register → userController.registerUser   │  │
│  │  POST /login → userController.loginUser         │  │
│  │  GET /products → productController.getproducts  │  │
│  │  POST /logout → userController.logoutUser       │  │
│  │  POST /checkout-session → paymentController     │  │
│  │  POST /payment-intent → paymentController       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│           Database & External Services                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MongoDB: Users, Products, Orders, Tokens        │  │
│  │  Stripe: Payment processing & webhooks           │  │
│  │  Email: User verification & password reset       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🆘 Debug Tips

1. **Open Browser Console** (F12 or right-click → Inspect → Console)
   - Watch for fetch errors
   - Check token in localStorage
   - See network requests

2. **Check Network Tab**
   - Verify API calls are being made
   - Check response status (200 = success, 4xx = error)
   - Look at response body for error messages

3. **Test with curl** (command line)
   - Verify backend endpoints work
   - Test with/without authentication

4. **Check Backend Logs**
   - Run: `npm start`
   - Look for connection errors
   - Check MongoDB connection status

---

## 📞 Support

All connections documented in:
- **API_CONNECTIONS_GUIDE.md** - Full details
- **API_INTEGRATION_SUMMARY.md** - Changes made
- **This file** - Quick reference

---

**Last Updated**: January 22, 2026
**All endpoints**: ✅ Connected and tested
