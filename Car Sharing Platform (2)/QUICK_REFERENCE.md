# Quick Reference - Verification Flow

## Frontend

```javascript
import { 
  sendPhoneVerification, 
  verifyPhoneCode,
  sendEmailVerification,
  verifyEmailCode,
  resendVerificationCode,
  formatPhoneE164
} from './Service/verificationUtils';

// Phone verification
await sendPhoneVerification(userId, '555-123-4567'); // Sends OTP via SMS
await verifyPhoneCode(userId, '555-123-4567', '123456'); // Verify code

// Email verification  
await sendEmailVerification(userId, 'user@example.com', 'John'); // Sends code via email
await verifyEmailCode(userId, 'user@example.com', '123456'); // Verify code

// Resend
await resendVerificationCode(userId, '555-123-4567', 'phone');
await resendVerificationCode(userId, 'user@example.com', 'email');
```

---

## Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/user/users/:userId/verify-phone` | POST | Generate & send phone OTP via SMS |
| `/user/users/:userId/verify-phone-code` | POST | Verify phone OTP code |
| `/user/users/:userId/verify-email` | POST | Generate & send email code via SendGrid |
| `/user/users/:userId/verify-email-code` | POST | Verify email code |
| `/user/users/:userId/resend-verification` | POST | Resend verification code |

---

## Request/Response Examples

### Generate Phone OTP
**Request:**
```json
POST /user/users/123/verify-phone
{ "phone": "+15551234567" }
```

**Response:**
```json
{
  "success": true,
  "message": "Verification OTP generated for +15551234567",
  "expiresIn": 600
}
```

### Verify Phone Code
**Request:**
```json
POST /user/users/123/verify-phone-code
{ "phone": "+15551234567", "code": "123456" }
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Phone verified successfully"
}
```

### Generate Email Code
**Request:**
```json
POST /user/users/123/verify-email
{ "email": "user@example.com", "firstName": "John" }
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent to user@example.com",
  "expiresIn": 86400
}
```

### Verify Email Code
**Request:**
```json
POST /user/users/123/verify-email-code
{ "email": "user@example.com", "code": "123456" }
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Email verified successfully"
}
```

### Resend Verification Code
**Request:**
```json
POST /user/users/123/resend-verification
{ "phone": "+15551234567", "type": "phone" }
```

**Response:**
```json
{
  "success": true,
  "message": "New verification OTP generated for +15551234567",
  "expiresIn": 600
}
```

---

## Database Schema (Backend)

### VerificationOTP (Phone)
```javascript
{
  userId: ObjectId,
  phone: String,      // "+15551234567"
  otp: String,        // "123456"
  expiresAt: Date,    // 10 minutes from creation
  createdAt: Date
}
```

### VerificationEmail
```javascript
{
  userId: ObjectId,
  email: String,
  otp: String,        // "123456"
  token: String,      // JWT token for link
  expiresAt: Date,    // 24 hours from creation
  createdAt: Date
}
```

### User (Add these fields)
```javascript
{
  phoneVerified: Boolean,   // default: false
  emailVerified: Boolean,   // default: false
  phone: String,
  email: String,
  ...
}
```

---

## Phone Number Formatting

The frontend automatically formats phone numbers to E.164 format (`+1234567890`):

```
Input: "555-123-4567"  → Output: "+15551234567"
Input: "(555) 123-4567" → Output: "+15551234567"  
Input: "5551234567"    → Output: "+15551234567"
Input: "+1234567890"   → Output: "+1234567890" (unchanged)
```

---

## Error Handling

All endpoints return:

**On Success:**
```json
{
  "success": true,
  "verified": true,        // For verification endpoints
  "message": "...",
  "expiresIn": 600
}
```

**On Error:**
```json
{
  "success": false,
  "verified": false,       // For verification endpoints
  "error": "Invalid code"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request / Invalid input
- `429` - Too many requests (rate limiting)
- `500` - Server error

---

## Rate Limiting

- Max 3 resend attempts per contact per 5 minutes
- OTP expires in 10 minutes (phone) or 24 hours (email)
- 5 verification attempts before timeout

---

## Files to Implement

1. **Backend Routes** - Create 5 endpoints (see BACKEND_API_ENDPOINTS.md)
2. **Database Models** - Create VerificationOTP & VerificationEmail collections
3. **Service Functions** - Use twilioVerificationService.js for generation logic
4. **User Model** - Add phoneVerified & emailVerified boolean fields

## Files Ready on Frontend

✅ verificationUtils.js - All API calls ready  
✅ twilioVerificationService.js - Backend service template  
✅ BACKEND_API_ENDPOINTS.md - Complete endpoint documentation  
✅ FRONTEND_SETUP.md - Integration examples
