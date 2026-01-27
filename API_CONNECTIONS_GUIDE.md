# API Connections Guide - Dave's Digital Cave

## Overview
This document outlines all frontend API connections and how they integrate with the backend endpoints.

---

## ✅ Connected API Endpoints

### 1. **User Authentication Endpoints**

#### Login
- **Frontend File**: [public/login.html](public/login.html)
- **Script**: [public/login-scripts.js](public/login-scripts.js)
- **API Endpoint**: `POST /api/v1/users/login`
- **What It Does**: 
  - User enters email and password
  - Sends credentials to backend
  - Receives JWT token
  - Stores token in localStorage
  - Redirects to home.html

#### Register
- **Frontend File**: [public/register.html](public/register.html)
- **Script**: [public/scripts.js](public/scripts.js)
- **API Endpoint**: `POST /api/v1/users/register`
- **What It Does**:
  - User enters name, email, password, and confirm password
  - Sends registration data to backend
  - Receives confirmation message
  - Redirects to login.html for email verification

#### Logout
- **Frontend File**: [public/home.html](public/home.html)
- **Logout Button**: Click "Logout" button in header
- **API Endpoint**: `POST /api/v1/users/logout`
- **What It Does**:
  - Sends logout request to backend with JWT token
  - Backend blacklists the token
  - Clears token from localStorage
  - Redirects to login.html

---

### 2. **Product Endpoints**

#### Get All Products
- **Frontend File**: [public/home.html](public/home.html)
- **Script**: [public/script2.js](public/script2.js)
- **API Endpoint**: `GET /api/v1/products`
- **Function**: `fetchProducts()`
- **What It Does**:
  - Fetches all products from database on page load
  - Displays products in grid format
  - Allows search and sort functionality
  - Each product has: id, name, price, img

#### Get Single Product
- **API Endpoint**: `GET /api/v1/products/:id`
- **Status**: Available for future use

---

### 3. **Cart Management**

#### Cart Storage
- **Location**: Browser's localStorage under `cart` key
- **What It Does**:
  - Stores cart items locally without backend calls
  - Persists cart across page refreshes
  - Cart data structure: Array of products with name, price, img, id

#### Cart Display
- **Frontend Files**: 
  - [public/home.html](public/home.html) - Shopping cart section
  - [public/script2.js](public/script2.js) - Cart functions
- **Functions**: 
  - `addToCart(id)` - Adds product to cart (requires login)
  - `updateCart()` - Updates display and persists to localStorage
  - `removeFromCart(index)` - Removes item from cart
  - `getCart()` - Retrieves cart from localStorage

#### Add to Cart
- **What It Does**:
  - Checks if user is logged in (has token)
  - Redirects to login if not authenticated
  - Adds selected product to localStorage cart
  - Updates cart display and count

---

### 4. **Checkout & Payment**

#### Get Stripe Config
- **Frontend File**: [public/checkout.html](public/checkout.html)
- **API Endpoint**: `GET /api/v1/payments/config`
- **What It Does**:
  - Fetches Stripe public key from backend
  - Initializes Stripe.js for payment processing

#### Create Checkout Session
- **API Endpoint**: `POST /api/v1/payments/checkout-session`
- **Required Header**: `Authorization: Bearer {token}`
- **Payload**:
  ```json
  {
    "cartItems": [...],
    "customerEmail": "user@example.com"
  }
  ```
- **What It Does**:
  - Creates Stripe hosted checkout session
  - Returns sessionId for redirect
  - User directed to Stripe's hosted checkout page

#### Create Payment Intent
- **API Endpoint**: `POST /api/v1/payments/payment-intent`
- **Required Header**: `Authorization: Bearer {token}`
- **Payload**:
  ```json
  {
    "amount": 1000,
    "currency": "usd",
    "cartItems": [...],
    "customerEmail": "user@example.com"
  }
  ```
- **What It Does**:
  - Creates payment intent for card payments
  - Returns clientSecret for Stripe.js confirmation
  - Processes payment directly on checkout page

#### Payment Webhook
- **API Endpoint**: `POST /api/v1/payments/webhook`
- **What It Does**:
  - Listens for Stripe webhook events
  - Updates order status when payment succeeds/fails
  - No authentication required (Stripe signature verification)

---

## 🔐 Authentication & Security

### Token Management
- **Storage**: `localStorage.getItem('token')`
- **Usage**: 
  - All protected API calls include: `Authorization: Bearer {token}`
  - Token contains user email and ID (JWT payload)
  - Decoding: `JSON.parse(atob(token.split('.')[1]))`

### Protected Pages
- **home.html**: Redirects to login if no token
- **checkout.html**: Redirects to login if no token

### Protected Endpoints
All endpoints with `protectedRoute` middleware require valid token:
- POST /api/v1/users/logout
- POST /api/v1/users/change-password
- DELETE /api/v1/users/account/delete
- POST /api/v1/payments/checkout-session
- POST /api/v1/payments/payment-intent

---

## 📋 API Endpoint Summary

| Method | Endpoint | Auth | Frontend |
|--------|----------|------|----------|
| POST | /api/v1/users/login | ❌ | login.html |
| POST | /api/v1/users/register | ❌ | register.html |
| POST | /api/v1/users/logout | ✅ | home.html |
| GET | /api/v1/products | ❌ | home.html |
| GET | /api/v1/products/:id | ❌ | - |
| GET | /api/v1/payments/config | ❌ | checkout.html |
| POST | /api/v1/payments/checkout-session | ✅ | checkout.html |
| POST | /api/v1/payments/payment-intent | ✅ | checkout.html |
| POST | /api/v1/payments/webhook | ❌ | - |

---

## 🚀 How to Test

### 1. Test Registration & Login
```bash
1. Open http://localhost:3000/register.html
2. Create a new account
3. Verify email (check console for verification link)
4. Login with credentials
5. Should redirect to home.html
```

### 2. Test Product Loading
```bash
1. Logged in on home.html
2. Check console - products should load from API
3. Search and sort should work
```

### 3. Test Cart
```bash
1. Click "Add to Cart" on any product
2. Cart count should increase
3. Refresh page - cart persists
4. Remove items - cart updates
```

### 4. Test Checkout
```bash
1. Add items to cart
2. Click "Proceed to Checkout"
3. Should load checkout.html (must be logged in)
4. Test Stripe payment with card: 4242 4242 4242 4242
```

---

## 🔧 Configuration

### Backend URL
- Currently set to: `http://localhost:4000`
- All API calls use this base URL
- Change in script files if using different port

### CORS Configuration
Backend configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:4000`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:4000`

---

## ⚠️ Common Issues & Solutions

### Issue: "Failed to fetch products"
- **Cause**: Backend not running or API endpoint not responding
- **Solution**: Start backend with `npm start` on port 4000

### Issue: "Unauthorized" on protected endpoints
- **Cause**: Token expired or invalid
- **Solution**: Clear localStorage and login again

### Issue: Cart not persisting
- **Cause**: localStorage disabled or cleared
- **Solution**: Check browser localStorage settings

### Issue: Stripe payment fails
- **Cause**: Stripe keys not configured
- **Solution**: Check config.env has STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY

---

## 📝 Notes

- All dates: January 22, 2026
- Frontend runs on port 3000 (or direct file access)
- Backend runs on port 4000
- MongoDB connection required for user accounts and products
- Stripe account required for payment processing
