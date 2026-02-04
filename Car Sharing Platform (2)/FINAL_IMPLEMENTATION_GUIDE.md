# Complete Verification System - Final

## ✨ Everything Simplified

Frontend just calls API endpoints.  
Backend handles all logic.

---

## Frontend Functions (Ready to Use)

Location: `src/Service/verificationUtils.js`

```javascript
import {
  sendPhoneVerification,      // Call: POST /verify-phone
  verifyPhoneCode,            // Call: POST /verify-phone-code
  sendEmailVerification,      // Call: POST /verify-email
  verifyEmailToken,           // Call: POST /verify-email-token
  resendVerificationCode,     // Call: POST /resend-verification
  formatPhoneE164,            // Format: "555-1234567" → "+15551234567"
  isValidEmail,               // Check email format
  isValidPhone,               // Check phone format
  isValidOTPCode,             // Check OTP is 6 digits
  maskEmail,                  // Display: u***r@example.com
  maskPhone,                  // Display: ****1234
} from './Service/verificationUtils';
```

---

## Backend Implementation

### 5 Endpoints to Create

#### 1. Generate Phone OTP
```javascript
POST /user/users/:userId/verify-phone

Request: { phone: "+15551234567" }

Backend Logic:
├─ Generate 6-digit OTP
├─ Store in Redis: setEx("otp:phone:+15551234567", 600, "123456")
├─ Send via Twilio: client.messages.create()
└─ Return: { success: true, message: "OTP sent" }
```

#### 2. Verify Phone Code
```javascript
POST /user/users/:userId/verify-phone-code

Request: { phone: "+15551234567", code: "123456" }

Backend Logic:
├─ Get OTP from Redis: get("otp:phone:+15551234567")
├─ Check: code === storedOTP
├─ If match:
│  ├─ Delete OTP: del("otp:phone:+15551234567")
│  └─ Update: User.phoneVerified = true
└─ Return: { success: true, verified: true }
```

#### 3. Generate Email Link
```javascript
POST /user/users/:userId/verify-email

Request: { email: "user@example.com", firstName: "John" }

Backend Logic:
├─ Generate JWT: jwt.sign({ userId, email }, SECRET, { expiresIn: '24h' })
├─ Create link: https://yoursite.com/verify-email?token=xxx&email=...
├─ Send via SendGrid with link
└─ Return: { success: true, message: "Email sent" }
```

#### 4. Verify Email Token
```javascript
POST /user/verify-email-token

Request: { token: "eyJhbGciOiJIUzI1NiIs...", email: "user@example.com" }

Backend Logic:
├─ Verify JWT: jwt.verify(token, SECRET)
├─ Check: decoded.email === sent email
├─ If valid:
│  └─ Update: User.emailVerified = true
└─ Return: { success: true, verified: true }
```

#### 5. Resend OTP
```javascript
POST /user/users/:userId/resend-verification

Request: { phone: "+15551234567", type: "phone" }

Backend Logic:
├─ Check rate limit:
│  ├─ Get counter: incr("resend:+15551234567")
│  └─ If > 3 in 5 min: return error 429
├─ Generate new OTP
├─ Store in Redis: setEx("otp:phone:+15551234567", 600, newOTP)
├─ Send via Twilio
└─ Return: { success: true, message: "Code resent" }
```

---

## Data Storage

### Redis Keys (OTP)
```
Key: otp:phone:+15551234567
Value: 123456
TTL: 600 seconds (auto-deletes)
```

### Redis Keys (Rate Limiting)
```
Key: resend:+15551234567
Value: 1, 2, 3 (increments)
TTL: 300 seconds (auto-deletes)
```

### JWT Token (Email)
```
Payload: { userId, email }
Secret: Your JWT_SECRET
Expires: 24 hours
```

---

## Usage Flow

### Phone Verification
```
1. User enters phone → Frontend: sendPhoneVerification(userId, phone)
2. Backend: Generates OTP, stores in Redis, sends SMS
3. User receives SMS, enters code
4. Frontend: verifyPhoneCode(userId, phone, code)
5. Backend: Gets from Redis, verifies, updates user, deletes OTP
6. Done ✓
```

### Email Verification
```
1. User enters email → Frontend: sendEmailVerification(userId, email, firstName)
2. Backend: Generates token, creates link, sends email
3. User receives email, clicks link
4. Browser redirects to: /verify-email?token=xxx&email=user@example.com
5. VerifyEmail.jsx loads, calls: verifyEmailToken(token, email)
6. Backend: Verifies JWT, updates user
7. Done ✓
```

---

## Frontend VerifyEmail Component

Create: `src/pages/VerifyEmail.jsx`

```javascript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailToken } from '../Service/verificationUtils';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setStatus('error');
          return;
        }

        // Backend handles verification
        const response = await verifyEmailToken(token, email);

        if (response.verified) {
          setStatus('success');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, navigate]);

  if (status === 'loading') return <p>Verifying...</p>;
  if (status === 'success') return <p>✓ Email verified!</p>;
  if (status === 'error') return <p>✗ Verification failed</p>;
}
```

---

## Installation & Setup

### Install Dependencies
```bash
npm install redis
npm install @sendgrid/mail
npm install twilio
npm install jsonwebtoken
```

### Environment Variables
```
REDIS_URL=redis://localhost:6379
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

---

## Error Responses

### Invalid Code
```json
{
  "success": false,
  "verified": false,
  "error": "Invalid verification code"
}
```

### Expired OTP
```json
{
  "success": false,
  "verified": false,
  "error": "OTP expired or not found"
}
```

### Too Many Requests
```json
{
  "success": false,
  "error": "Too many resend attempts. Try again later.",
  "status": 429
}
```

### Invalid Token
```json
{
  "success": false,
  "verified": false,
  "error": "Invalid verification link"
}
```

---

## Checklist

### Backend Implementation
- [ ] Create `/verify-phone` endpoint
- [ ] Create `/verify-phone-code` endpoint
- [ ] Create `/verify-email` endpoint
- [ ] Create `/verify-email-token` endpoint
- [ ] Create `/resend-verification` endpoint
- [ ] Configure Redis
- [ ] Configure Twilio
- [ ] Configure SendGrid
- [ ] Set environment variables

### Frontend
- [ ] Import functions from verificationUtils.js
- [ ] Create VerifyEmail.jsx component
- [ ] Add route: `/verify-email`
- [ ] Test phone flow
- [ ] Test email flow
- [ ] Test error cases

---

## Summary

```
✅ Frontend: Calls 5 API endpoints (ready!)
✅ Backend: Handles all logic (implement these 5 endpoints)
✅ Storage: Redis/Memcached (OTP auto-expires in 10 min)
✅ Email: SendGrid (JWT tokens verified)
✅ SMS: Twilio (OTP sent automatically)
✅ Rate Limiting: Redis counter (max 3 resends/5 min)
```

Everything is separated cleanly.  
Frontend is simple.  
Backend does all the work.  

Ready to implement! 🚀
