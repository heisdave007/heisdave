# Frontend-Backend API Connections Map

## 🗺️ Complete Connection Diagram

```
FRONTEND                          BACKEND ENDPOINTS                    DATABASE
├── register.html ─────────┐
│                          ├──→ POST /api/v1/users/register ────→ MongoDB: Users
│                          │
├── login.html ────────────┤
│                          ├──→ POST /api/v1/users/login ────────→ MongoDB: Users
│                          │    ↓ Returns JWT Token
├── home.html ─────────────┤
│   ├── Get Products ──────├──→ GET /api/v1/products ────────────→ MongoDB: Products
│   ├── Add to Cart ───────┤
│   │  (localStorage)      │
│   └── Logout Button ─────├──→ POST /api/v1/users/logout ───────→ MongoDB: Token Blacklist
│       (sends token)      │
│                          │
├── checkout.html ─────────┤
│   ├── Get Stripe Key ────├──→ GET /api/v1/payments/config ────→ Config: Stripe Keys
│   ├── Checkout Session ──├──→ POST /api/v1/payments/checkout-session ──┐
│   │                      │                                            ├──→ Stripe
│   └── Payment Intent ────├──→ POST /api/v1/payments/payment-intent ───┘
│                          │
└── Stripe Webhook ────────┴──→ POST /api/v1/payments/webhook ────→ MongoDB: Orders
                          (from Stripe when payment completes)
```

---

## 📊 API Endpoint Flow

### User Registration Flow
```
register.html
    ↓
User fills form
    ↓
scripts.js: axios.post('/api/v1/user/register')
    ↓
Backend: userController.registerUser()
    ↓
Save to MongoDB → Send verification email
    ↓
Redirect to login.html
```

### User Login Flow
```
login.html
    ↓
User enters credentials
    ↓
login-scripts.js: axios.post('/api/v1/user/login')
    ↓
Backend: userController.loginUser()
    ↓
Create JWT token → Return to frontend
    ↓
localStorage.setItem('token', token)
    ↓
Redirect to home.html
```

### Product Display Flow
```
home.html loads
    ↓
DOMContentLoaded event fires
    ↓
script2.js: fetchProducts()
    ↓
fetch('/api/v1/products')
    ↓
Backend: productController.getproducts()
    ↓
Query MongoDB products collection
    ↓
Return products array
    ↓
displayProducts() creates HTML
    ↓
Products visible in grid
```

### Add to Cart Flow
```
User clicks "Add to Cart"
    ↓
script2.js: addToCart(productId)
    ↓
Check localStorage.getItem('token')
    ↓
If no token → Redirect to login.html
If token exists ↓
cart.push(product)
updateCart()
saveCart() → localStorage.setItem('cart', JSON.stringify(cart))
    ↓
Cart displayed and persisted
```

### Checkout Flow
```
home.html → user clicks "Proceed to Checkout"
    ↓
Redirect to checkout.html
    ↓
Check token (must be logged in)
    ↓
initializeStripe()
    ↓
fetch('/api/v1/payments/config')
    ↓
Get Stripe public key
    ↓
stripe = Stripe(publicKey)
    ↓
User fills payment details
    ↓
Submit form
    ↓
Two options:
    ├─ Card Payment ──→ POST /payments/payment-intent
    │                      ↓
    │                  stripe.confirmCardPayment()
    │                      ↓
    │                  Success → Clear cart → Redirect
    │
    └─ Checkout Session ──→ POST /payments/checkout-session
                              ↓
                          stripe.redirectToCheckout()
                              ↓
                          Stripe hosted page
                              ↓
                          (Webhook handles result)
```

### Logout Flow
```
home.html
    ↓
User clicks "Logout" button
    ↓
home.html: axios.post('/api/v1/users/logout', {}, {
  headers: { Authorization: `Bearer ${token}` }
})
    ↓
Backend: userController.logoutUser()
    ↓
Add token to blacklist (MongoDB)
    ↓
localStorage.removeItem('token')
    ↓
Redirect to login.html
```

---

## 🔐 Token & Auth Flow

```
┌─────────────────────────────────────────┐
│       User Authentication Flow          │
└─────────────────────────────────────────┘

1. LOGIN
   ┌──────────────────────────────┐
   │ User email & password        │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ POST /api/v1/users/login     │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ Backend validates credentials│
   │ Queries MongoDB for user     │
   │ Compares password hash       │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ Create JWT token             │
   │ token = header.payload.sign  │
   │ payload = {email, id, ...}   │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ Return: {token, message}     │
   └──────────────┬───────────────┘
                  ↓
2. STORE TOKEN
   ┌──────────────────────────────┐
   │ localStorage.setItem(         │
   │   'token',                    │
   │   response.data.token         │
   │ )                             │
   └──────────────┬───────────────┘
                  ↓
3. USE TOKEN FOR PROTECTED CALLS
   ┌──────────────────────────────┐
   │ Every API call includes:      │
   │ Authorization: Bearer {token} │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ Backend:                      │
   │ Extract token from header     │
   │ Verify signature (JWT)        │
   │ Check if token blacklisted    │
   │ Proceed if valid              │
   └──────────────┬───────────────┘
                  ↓
4. LOGOUT
   ┌──────────────────────────────┐
   │ POST /api/v1/users/logout    │
   │ Headers: {Authorization}      │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ Backend:                      │
   │ Verify token                  │
   │ Add to blacklist (MongoDB)    │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ localStorage.removeItem(token)│
   │ Redirect to login.html        │
   └──────────────────────────────┘
```

---

## 🔄 Data Structure Examples

### Cart Item (localStorage)
```javascript
{
  id: 1,
  name: "Fjallraven - Foldsack No. 1 Backpack",
  price: 109.95,
  img: "https://fakestoreapi.com/img/...",
  quantity: 1  // optional, defaults to 1
}
```

### JWT Token Structure
```
Header:   { "alg": "HS256", "typ": "JWT" }
Payload:  { "email": "user@example.com", "id": "...", "iat": 1234567890 }
Signature: HMACSHA256(header.payload, SECRET_KEY)

Encoded: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpZCI6IjEyMzQ1In0.signature
```

### API Response - Get Products
```javascript
{
  success: true,
  message: "Products retrieved successfully",
  products: [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Product 1",
      price: 99.99,
      image: "url",
      description: "...",
      stock: 10
    },
    // ... more products
  ]
}
```

### API Response - Login
```javascript
{
  success: true,
  message: "Login successful",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    _id: "507f1f77bcf86cd799439011",
    name: "John Doe",
    email: "john@example.com"
  }
}
```

---

## 🔗 File References

### Frontend Files
- **register.html** → scripts.js
- **login.html** → login-scripts.js
- **home.html** → script2.js + home.html inline script
- **checkout.html** → inline script in checkout.html

### Backend Files
- **index.js** → Main server setup
- **controllers/userController.js** → User routes
- **controllers/productController.js** → Product routes
- **controllers/paymentController.js** → Payment routes
- **routers/** → Route definitions
- **schemas/** → MongoDB schemas

---

## 🚨 Error Handling

### Frontend Error Examples
```javascript
// Fetch error
fetch(url)
  .then(res => {
    if (!res.ok) throw new Error('Failed');
    return res.json();
  })
  .catch(error => {
    console.error('Error:', error);
    // Show error to user
  });

// Axios error
axios.post(url)
  .catch(err => {
    const message = err?.response?.data?.message || err?.message;
    console.error(message);
  });
```

### Common Backend Errors
- 400: Bad Request (invalid data)
- 401: Unauthorized (missing/invalid token)
- 404: Not Found (endpoint doesn't exist)
- 500: Server Error (backend issue)

---

## ✅ Connection Verification

### How to verify all connections work:

1. **Open Browser Dev Tools** (F12)
2. **Go to Network Tab**
3. **Navigate through app:**
   - Register → See POST to /register
   - Login → See POST to /login (check response for token)
   - Home page loads → See GET to /products
   - Add to cart → Check localStorage
   - Logout → See POST to /logout

4. **Check Response Status**
   - 200-299: ✅ Success
   - 300-399: ↩️ Redirect
   - 400-499: ❌ Client error
   - 500+: ❌ Server error

---

## 📈 Performance Notes

- Products cached in `products` variable after fetch
- Cart persists in localStorage (no server roundtrip)
- JWT validation done on backend for protected routes
- Stripe async initialization prevents page blocking

---

**Last Updated**: January 22, 2026  
**Status**: ✅ All connections documented and working
