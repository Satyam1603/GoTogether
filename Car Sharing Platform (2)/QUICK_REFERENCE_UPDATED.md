# Quick Reference - Email Links + Phone OTP

## Frontend API Calls

```javascript
import { 
  sendPhoneVerification,     // Generate phone OTP
  verifyPhoneCode,           // Verify phone OTP
  sendEmailVerification,     // Send email link
  verifyEmailToken,          // Verify email token
  resendVerificationCode,    // Resend phone OTP
} from './Service/verificationUtils';

// Phone: OTP Code
await sendPhoneVerification(userId, '555-123-4567');     // Send code via SMS
await verifyPhoneCode(userId, '555-123-4567', '123456'); // User enters code

// Email: Verification Link
await sendEmailVerification(userId, 'user@example.com', 'John'); // Send link via email
// User clicks link → verifyEmailToken() called automatically on that page
```

---

## Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/user/users/:userId/verify-phone` | POST | Generate & send phone OTP via SMS |
| `/user/users/:userId/verify-phone-code` | POST | Verify phone OTP code |
| `/user/users/:userId/verify-email` | POST | Generate & send email verification link |
| `/user/verify-email-token` | POST | Verify email token from link |
| `/user/users/:userId/resend-verification` | POST | Resend phone OTP |

---

## Request/Response Examples

### Phone OTP Flow

**Generate OTP**
```json
POST /user/users/123/verify-phone
{ "phone": "+15551234567" }

Response:
{ "success": true, "message": "Verification OTP generated...", "expiresIn": 600 }
```

**Verify Code**
```json
POST /user/users/123/verify-phone-code
{ "phone": "+15551234567", "code": "123456" }

Response:
{ "success": true, "verified": true, "message": "Phone verified successfully" }
```

**Resend OTP**
```json
POST /user/users/123/resend-verification
{ "phone": "+15551234567", "type": "phone" }

Response:
{ "success": true, "message": "New verification code generated...", "expiresIn": 600 }
```

---

### Email Link Flow

**Send Link**
```json
POST /user/users/123/verify-email
{ "email": "user@example.com", "firstName": "John" }

Response:
{ "success": true, "message": "Verification email sent...", "expiresIn": 86400 }
```

**Verify Token**
```json
POST /user/verify-email-token
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "email": "user@example.com" }

Response:
{ "success": true, "verified": true, "message": "Email verified successfully" }
```

---

## Flow Diagrams

### Phone Verification (OTP)
```
User enters phone
    ↓
sendPhoneVerification(userId, phone)
    ↓ POST /verify-phone
        → Generate 6-digit OTP
        → Send via Twilio SMS
        ← Success response
    ↓
User receives SMS, enters code in UI
    ↓
verifyPhoneCode(userId, phone, code)
    ↓ POST /verify-phone-code
        → Check code = OTP
        → Update user.phoneVerified = true
        ← Success response
```

### Email Verification (Link)
```
User signs up
    ↓
sendEmailVerification(userId, email, firstName)
    ↓ POST /verify-email
        → Generate JWT token
        → Create verification link
        → Send via SendGrid email
        ← Success response
    ↓
User clicks link in email
    ↓ Link: /verify-email?token=xxx&email=user@example.com
        → Automatically calls verifyEmailToken(token, email)
        ↓ POST /verify-email-token
            → Verify JWT token
            → Update user.emailVerified = true
            → Show success message
```

---

## Database Schema

### VerificationOTP (Phone codes)
```
{
  userId,           // User ID
  phone,            // "+15551234567"
  otp,              // "123456" (6 digits)
  expiresAt,        // 10 minutes
  createdAt
}
```

### VerificationEmail (Email tokens)
```
{
  userId,           // User ID
  email,            // "user@example.com"
  token,            // JWT token
  expiresAt,        // 24 hours
  createdAt
}
```

### User Model (Add fields)
```
phoneVerified: Boolean    // default: false
emailVerified: Boolean    // default: false
phone: String             // unique, sparse
```

---

## Error Responses

**Invalid Code**
```json
{
  "success": false,
  "verified": false,
  "error": "Invalid verification code"
}
```

**Expired**
```json
{
  "success": false,
  "verified": false,
  "error": "OTP expired" or "Verification link has expired"
}
```

**Too Many Attempts**
```json
{
  "success": false,
  "error": "Too many resend attempts. Try again later.",
  "status": 429
}
```

---

## Verification Summary

| Feature | Phone | Email |
|---------|-------|-------|
| **Method** | 6-digit OTP | JWT Link |
| **Delivery** | Twilio SMS | SendGrid Email |
| **How user verifies** | Enters code | Clicks link |
| **Expiration** | 10 minutes | 24 hours |
| **Storage** | VerificationOTP | VerificationEmail |
| **Resend** | Available | Not available (just resend email) |

---

## Frontend Usage Example

```javascript
// Signup with phone verification
const handleSignupPhone = async () => {
  // 1. Register user
  const user = await register({ email, password, firstName });
  
  // 2. Send phone OTP
  await sendPhoneVerification(user.id, phone);
  
  // 3. User enters code
  const verified = await verifyPhoneCode(user.id, phone, enteredCode);
  
  if (verified.verified) {
    // Phone verified! ✓
  }
};

// Signup with email verification
const handleSignupEmail = async () => {
  // 1. Register user
  const user = await register({ email, password, firstName });
  
  // 2. Send verification email
  await sendEmailVerification(user.id, email, firstName);
  
  // 3. User clicks link in email (calls /verify-email-token automatically)
  // Done! ✓
};
```

---

## Files

- **Frontend:** `src/Service/verificationUtils.js`
- **Backend Template:** `src/Service/twilioVerificationService.js`
- **Implementation Guide:** `BACKEND_API_UPDATED.md`
