# GoTogether API - Quick Reference Guide

## Base URL
```
http://localhost:8080/gotogether/users
```

---

## 🔐 Authentication Endpoints

### 1. Register User
```
POST /register
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNo": "+91234567890",
  "role": "PASSENGER"  // or "DRIVER"
}

Response (201):
{
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNo": "+91234567890",
    "role": "PASSENGER"
  },
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "message": "Account created successfully",
  "status": "SUCCESS"
}
```

### 2. Login
```
POST /login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "userId": 1,
  "email": "john@example.com",
  "role": "PASSENGER"
}
```

### 3. Refresh Access Token
```
POST /refresh-token
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "userId": 1,
  "email": "john@example.com",
  "role": "PASSENGER"
}
```

### 4. Revoke Token (Logout)
```
POST /{userId}/revoke-token
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}

Response (200):
"Refresh token revoked successfully."
```

### 5. Logout
```
POST /logout
Authorization: Bearer <accessToken>

Response (200):
"User logged out successfully."
```

---

## 👤 User Profile Endpoints

### 6. Get User Profile
```
GET /{userId}
Authorization: Bearer <accessToken>

Response (200):
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNo": "+91234567890",
  "role": "PASSENGER"
}
```

### 7. Update User Profile
```
PUT /{userId}
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "firstName": "John",
  "phone": "+91987654321",
  "preferences": "music:on,ac:on"
}

Response (200):
"User profile updated successfully."
```

### 8. Change Password
```
PATCH /{userId}/password
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "oldPassword": "password123",
  "newPassword": "newPassword456"
}

Response (200):
"Password updated successfully."
```

### 9. Delete Account
```
DELETE /{userId}
Authorization: Bearer <accessToken>

Response (204): No Content
```

---

## 📱 Verification Endpoints

### 10. Send Phone OTP
```
GET /{userId}/verify-phone
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "OTP sent for phone verification.",
  "status": "SUCCESS"
}

Response (500):
{
  "message": "Failed to send OTP: Phone number not found for user: 17",
  "status": "FAILURE"
}
```

### 11. Verify Phone OTP
```
POST /{userId}/verify-otp?otp=123456
Authorization: Bearer <accessToken>

Response (200):
"Phone number verified successfully!"

Response (400):
"Invalid OTP. Please try again."
```

### 12. Send Email Verification
```
POST /{userId}/verify-email
Authorization: Bearer <accessToken>

Response (200):
"Verification email sent."
```

### 13. Confirm Email Verification
```
GET /verify-email-confirm?token=abc123xyz
(No authentication needed - public endpoint)

Response (200):
"Email verified successfully!"

Response (400):
"Invalid or Expired Link"
```

### 14. Get Verification Status
```
GET /{userId}/verification-status
Authorization: Bearer <accessToken>

Response (200):
{
  "emailVerified": true,
  "phoneVerified": false
}
```

### 15. Upload Identity Documents
```
POST /{userId}/verify-identity
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "documentType": "AADHAR",
  "documentNumber": "1234-5678-9012",
  "documentUrl": "https://..."
}

Response (200):
"Identity documents uploaded successfully."
```

---

## 🏆 Driver Endpoints

### 16. Get Top Rated Drivers
```
GET /top-rated
(Public endpoint - no authentication needed)

Response (200):
[
  {
    "id": 5,
    "firstName": "Mike",
    "lastName": "Johnson",
    "email": "mike@example.com",
    "rating": 4.8
  },
  {
    "id": 8,
    "firstName": "Sarah",
    "lastName": "Williams",
    "email": "sarah@example.com",
    "rating": 4.6
  }
]
```

---

## ⚙️ Preferences Endpoints

### 17. Update User Preferences
```
PUT /{userId}/preferences
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "musicPreference": "on",
  "acPreference": "on",
  "chattingPreference": "off"
}

Response (200):
"Preferences updated successfully."
```

---

## 🐛 Debug Endpoints (Development Only)

### 18. Health Check
```
GET /debug/health
(Public endpoint)

Response (200):
{
  "status": "UP",
  "timestamp": 1645000000,
  "message": "Server is running"
}
```

### 19. Check User Details
```
GET /debug/user/{userId}
(Public endpoint)

Response (200):
{
  "userId": 17,
  "status": "FOUND",
  "firstName": "John",
  "email": "john@example.com",
  "phoneNo": "+91234567890",
  "phoneNoExists": true,
  "role": "PASSENGER"
}
```

### 20. Test Database Connection
```
GET /debug/database/test
(Public endpoint)

Response (200):
{
  "status": "CONNECTED",
  "message": "Database connection successful",
  "totalUsers": 42
}
```

### 21. Debug OTP Process
```
GET /debug/verify-phone-debug/{userId}
(Public endpoint)

Response (200):
{
  "userId": 17,
  "step1_userExists": true,
  "step1_userName": "John Doe",
  "step2_phoneNo": "+91234567890",
  "step2_phoneNoExists": true,
  "step3_otpGenerated": "Would generate random 6-digit OTP",
  "step4_redisSave": "OTP would be saved to Redis with key: OTP:17",
  "step5_smsSend": "SMS would be sent to +91234567890",
  "status": "SUCCESS",
  "message": "All checks passed - OTP process can proceed"
}
```

### 22. Get All Users (Debug)
```
GET /debug/users/all
(Public endpoint - REMOVE IN PRODUCTION)

Response (200):
{
  "users": [
    {
      "id": 1,
      "firstName": "John",
      "email": "john@example.com",
      "phoneNo": "+91234567890",
      "hasPhone": true
    }
  ]
}
```

---

## Common Headers

### All Protected Endpoints Require:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Response Headers:
```
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | User successfully registered |
| 204 | No Content | Successful deletion (no body) |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Invalid or missing token |
| 404 | Not Found | User/resource doesn't exist |
| 500 | Internal Server Error | Server error (check logs) |

---

## Error Response Format

```json
{
  "message": "Error description here",
  "status": "FAILURE"
}
```

Or with validation errors:
```json
{
  "email": "Email already exists",
  "phoneNo": "Phone number format is invalid"
}
```

---

## Useful cURL Examples

### Register
```bash
curl -X POST http://localhost:8080/gotogether/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNo": "+91234567890",
    "role": "PASSENGER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/gotogether/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:8080/gotogether/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Send OTP
```bash
curl -X GET http://localhost:8080/gotogether/users/1/verify-phone \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Verify OTP
```bash
curl -X POST "http://localhost:8080/gotogether/users/1/verify-otp?otp=123456" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:8080/gotogether/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Token Details

### Access Token
- **Expiration**: 1 hour (3600000 ms)
- **Purpose**: Authentication for protected endpoints
- **Renewal**: Use refresh token to get new access token

### Refresh Token
- **Expiration**: 7 days (604800000 ms)
- **Purpose**: Obtain new access tokens
- **Renewal**: Automatically refreshed on each refresh request
- **Revocation**: Can be revoked on logout

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: Missing or invalid token
**Solution**: 
- Check if Authorization header is present
- Verify token hasn't expired
- Try refreshing token with refresh endpoint

### Issue: 500 Internal Server Error
**Cause**: Server error (check debug endpoints)
**Solutions**:
- Use `/debug/health` to verify server is running
- Use `/debug/database/test` to check database
- Use `/debug/verify-phone-debug/{userId}` to debug OTP issues
- Check server logs for details

### Issue: Phone Number Not Found
**Cause**: User doesn't have phone number set
**Solution**:
- Update user profile with phone number
- Use `/debug/user/{userId}` to verify phone number is set

### Issue: OTP Not Received
**Cause**: Twilio not configured or invalid phone number
**Solution**:
- Check Twilio credentials in application.properties
- Verify phone number format (+91...)
- Use `/debug/verify-phone-debug/{userId}` to debug

---

## Rate Limiting (Planned)

Currently unlimited. Recommend adding:
- 5 OTP requests per user per hour
- 10 failed login attempts per hour per IP
- 100 requests per minute per user

---

## Security Notes

🔒 **DO:**
- Use HTTPS in production
- Store tokens securely (HttpOnly cookies)
- Validate input on both client and server
- Use strong passwords
- Rotate secret keys regularly

❌ **DON'T:**
- Send tokens in URL parameters
- Store sensitive data in localStorage
- Log tokens to console in production
- Expose debug endpoints in production
- Use weak secret keys

---

## Support

For issues or questions:
1. Check TROUBLESHOOTING_VERIFY_PHONE.md
2. Check FIX_500_ERROR_SUMMARY.md
3. Use debug endpoints
4. Check server logs
5. Review JWT_REFRESH_TOKEN_IMPLEMENTATION.md
