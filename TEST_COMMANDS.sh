#!/bin/bash
# Password Reset API Testing Commands
# Usage: Run these commands in your terminal to test the password reset functionality

echo "===== Password Reset API Testing ====="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:4000/api/v1/users"

# Test 1: Request Password Reset
echo -e "${BLUE}Test 1: Request Password Reset${NC}"
echo "Endpoint: POST /forgot-password"
echo "Description: Send password reset link to user email"
echo ""
echo "curl command:"
echo "curl -X POST $BASE_URL/forgot-password \\"
echo '  -H "Content-Type: application/json" \\'
echo '  -d '"'"'{"email":"test@example.com"}'"'"''
echo ""
echo "To run:"
curl -X POST $BASE_URL/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
echo ""
echo ""

# Test 2: Reset Password with Token
echo -e "${BLUE}Test 2: Reset Password with Token${NC}"
echo "Endpoint: POST /reset-password/:token"
echo "Description: Reset password using the token from email"
echo ""
echo "Note: Replace TOKEN_FROM_EMAIL with the actual token from the email"
echo ""
echo "curl command:"
echo "curl -X POST $BASE_URL/reset-password/TOKEN_FROM_EMAIL \\"
echo '  -H "Content-Type: application/json" \\'
echo '  -d '"'"'{"password":"newPassword123","confirmPassword":"newPassword123"}'"'"''
echo ""
echo ""

# Test 3: Change Password (Logged In User)
echo -e "${BLUE}Test 3: Change Password (Authenticated User)${NC}"
echo "Endpoint: POST /change-password"
echo "Description: Change password for logged-in users"
echo ""
echo "Note: Replace YOUR_JWT_TOKEN with your actual JWT token"
echo ""
echo "curl command:"
echo "curl -X POST $BASE_URL/change-password \\"
echo '  -H "Content-Type: application/json" \\'
echo '  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\'
echo '  -d '"'"'{"currentPassword":"oldPassword123","newPassword":"newPassword123","confirmPassword":"newPassword123"}'"'"''
echo ""
echo ""

# Test with registration first
echo -e "${YELLOW}===== Setup: Register a Test User First =====${NC}"
echo ""
echo "If you don't have a test user, register one first:"
echo ""
echo "curl -X POST $BASE_URL/register \\"
echo '  -H "Content-Type: application/json" \\'
echo '  -d '"'"'{
  "name":"Test User",
  "email":"test@example.com",
  "password":"password123",
  "confirmPassword":"password123"
}'"'"''
echo ""
echo ""

# Expected responses
echo -e "${GREEN}===== Expected Responses =====${NC}"
echo ""
echo "Test 1 - Success Response:"
echo '{ "message": "Password reset link sent to your email" }'
echo ""
echo "Test 2 - Success Response:"
echo '{ "message": "Password reset successfully" }'
echo ""
echo "Test 3 - Success Response:"
echo '{
  "message": "Password changed successfully",
  "token": "new_jwt_token_here",
  "user": { ... }
}'
echo ""
echo ""

# Error scenarios
echo -e "${YELLOW}===== Error Scenarios =====${NC}"
echo ""
echo "Test invalid email:"
curl -X POST $BASE_URL/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}'
echo ""
echo ""

echo -e "${YELLOW}===== Postman Import (JSON) =====${NC}"
echo ""
echo "Use this in Postman by creating a new request:"
echo ""
echo "1. Method: POST"
echo "2. URL: http://localhost:4000/api/v1/users/forgot-password"
echo "3. Headers: Content-Type: application/json"
echo "4. Body (raw JSON):"
echo "   {\"email\":\"test@example.com\"}"
echo ""
echo ""

# PowerShell versions
echo -e "${YELLOW}===== PowerShell Commands =====${NC}"
echo ""
echo "For Windows PowerShell users:"
echo ""
echo "Test 1: Forgot Password"
echo '$headers = @{"Content-Type"="application/json"}'
echo '$body = @{"email"="test@example.com"} | ConvertTo-Json'
echo 'Invoke-WebRequest -Uri "http://localhost:4000/api/v1/users/forgot-password" -Method POST -Headers $headers -Body $body'
echo ""
echo ""

echo -e "${YELLOW}===== Environment Variables Checklist =====${NC}"
echo ""
echo "Make sure these are set in config.env:"
echo ""
echo "EMAIL_SERVICE = gmail"
echo "EMAIL_USER = your_email@gmail.com"
echo "EMAIL_PASS = your_app_password"
echo "EMAIL_FROM = noreply@yourapp.com"
echo "FRONTEND_URL = http://localhost:3000"
echo "JWT_SECRET = your_secret_key"
echo ""
echo ""

echo -e "${GREEN}===== Testing Complete =====${NC}"
