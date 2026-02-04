# Frontend - Backend Separation

## Simple Rule

**Frontend:** Just calls API endpoints  
**Backend:** Handles all logic

---

## Frontend API Calls

```javascript
import { 
  sendPhoneVerification,
  verifyPhoneCode,
  sendEmailVerification,
  verifyEmailToken,
  resendVerificationCode,
} from './Service/verificationUtils';

// That's it! Just call these functions
// Backend does everything else
```

---

## What Frontend Does

✅ Format phone numbers  
✅ Validate email/phone format  
✅ Call API endpoints  
✅ Show loading/success/error UI  

---

## What Backend Does

✅ Generate OTP  
✅ Store OTP in Redis/Memcached (10 min expiration)  
✅ Generate JWT token for email links  
✅ Send OTP via Twilio SMS  
✅ Send email via SendGrid  
✅ Verify codes/tokens  
✅ Handle rate limiting  
✅ Update user database  
✅ Delete OTP after verification  

---

## Backend Endpoints

```
POST /user/users/:userId/verify-phone
├─ Request: { phone: "+15551234567" }
└─ Response: { success: true, message: "..." }

POST /user/users/:userId/verify-phone-code
├─ Request: { phone: "+15551234567", code: "123456" }
└─ Response: { success: true, verified: true }

POST /user/users/:userId/verify-email
├─ Request: { email: "user@example.com", firstName: "John" }
└─ Response: { success: true, message: "..." }

POST /user/verify-email-token
├─ Request: { token: "jwt...", email: "user@example.com" }
└─ Response: { success: true, verified: true }

POST /user/users/:userId/resend-verification
├─ Request: { phone: "+15551234567", type: "phone" }
└─ Response: { success: true, message: "..." }
```

---

## Frontend Component Example

```javascript
import { sendPhoneVerification, verifyPhoneCode } from './Service/verificationUtils';

export default function SignUp() {
  const [step, setStep] = useState('form');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState(null);

  // Step 1: Send phone OTP
  const handleSendCode = async () => {
    const response = await sendPhoneVerification(userId, phone);
    if (response.success) {
      setStep('verify'); // Show code input
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async () => {
    const response = await verifyPhoneCode(userId, phone, code);
    if (response.verified) {
      // Success! User is verified
      setStep('done');
    }
  };

  return (
    <>
      {step === 'form' && (
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={handleSendCode}>Send Code</button>
      )}
      
      {step === 'verify' && (
        <>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
          <button onClick={handleVerifyCode}>Verify</button>
        </>
      )}

      {step === 'done' && <p>✓ Verified!</p>}
    </>
  );
}
```

---

## Data Flow

```
FRONTEND                          BACKEND
--------                          -------

User enters phone
    ↓
sendPhoneVerification()
    ↓ POST /verify-phone
                        → Generate OTP: 123456
                        → Store in Redis (600 sec)
                        → Send via Twilio
                        ← { success: true }
    ↓
Show "Code sent" message

User enters code "123456"
    ↓
verifyPhoneCode()
    ↓ POST /verify-phone-code
                        → Get OTP from Redis
                        → Check: code === OTP ✓
                        → Delete OTP
                        → Update user.phoneVerified = true
                        ← { verified: true }
    ↓
Show "Verified!" message
```

---

## That's All!

Frontend is **completely simple**:
- Just calls 5 endpoints
- Backend handles all logic
- No validation, no storage, no sending

Perfect separation of concerns! ✨
