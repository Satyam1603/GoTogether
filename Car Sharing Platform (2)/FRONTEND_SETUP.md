# Frontend Setup - Verification

Your frontend is ready! Since Twilio is already set up on the backend, you just need to use these simple API endpoints.

## Quick Summary

✅ **No Twilio SDK needed on frontend** - Backend handles everything  
✅ **No environment variables needed** - Just call the API endpoints  
✅ **Simple fetch-based utilities** - No axios or complex setup  

---

## Frontend API Usage

### 1. Phone Verification Flow

```javascript
import { sendPhoneVerification, verifyPhoneCode } from './Service/verificationUtils';

// Step 1: User enters phone and clicks "Send Code"
const handleSendPhoneCode = async (userId, phone) => {
  const response = await sendPhoneVerification(userId, phone);
  // Backend sends OTP via Twilio SMS
  // Response: { success: true, message: "Verification OTP generated..." }
};

// Step 2: User receives SMS with code and enters it
const handleVerifyPhone = async (userId, phone, code) => {
  const response = await verifyPhoneCode(userId, phone, code);
  // Response: { success: true, verified: true, message: "Phone verified..." }
};
```

### 2. Email Verification Flow

```javascript
import { sendEmailVerification, verifyEmailCode } from './Service/verificationUtils';

// Step 1: User signs up and frontend triggers email verification
const handleSendEmailCode = async (userId, email, firstName) => {
  const response = await sendEmailVerification(userId, email, firstName);
  // Backend sends email with code via SendGrid
  // Response: { success: true, message: "Verification email sent..." }
};

// Step 2: User receives email with code and enters it
const handleVerifyEmail = async (userId, email, code) => {
  const response = await verifyEmailCode(userId, email, code);
  // Response: { success: true, verified: true, message: "Email verified..." }
};
```

### 3. Resend Code

```javascript
import { resendVerificationCode } from './Service/verificationUtils';

// Resend phone code
const handleResendPhone = async (userId, phone) => {
  const response = await resendVerificationCode(userId, phone, 'phone');
  // Response: { success: true, otp: "123456", message: "New verification code generated" }
};

// Resend email code
const handleResendEmail = async (userId, email) => {
  const response = await resendVerificationCode(userId, email, 'email');
  // Response: { success: true, otp: "654321", message: "New verification code generated" }
};
```

---

## Helper Functions

All validation and formatting functions are available:

```javascript
import {
  formatPhoneE164,      // Format: +1234567890 (automatic)
  formatPhoneDisplay,   // Format: (555) 123-4567 (for display)
  isValidEmail,         // Check if email is valid
  isValidPhone,         // Check if phone is valid
  isValidOTPCode,       // Check if code is 6 digits
  maskEmail,            // Mask: u***r@example.com
  maskPhone,            // Mask: ****1234
} from './Service/verificationUtils';
```

---

## Example: SignUp Component

```javascript
import { useState } from 'react';
import { sendPhoneVerification, verifyPhoneCode, verifyEmailCode } from './Service/verificationUtils';
import { useAuth } from './context/AuthContext'; // Your auth context

export default function SignUp() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
  });
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Step 1: Register user
      const response = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
      });
      
      const newUserId = response.userId;
      setUserId(newUserId);
      
      // Step 2: Send verification code
      if (formData.phone) {
        await sendPhoneVerification(newUserId, formData.phone);
      } else {
        await sendEmailVerification(newUserId, formData.email, formData.firstName);
      }
      
      setVerificationStep(true);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.phone) {
        // Verify phone
        const response = await verifyPhoneCode(userId, formData.phone, verificationCode);
        if (response.verified) {
          // Success! User is verified
          console.log('Phone verified!');
        }
      } else {
        // Verify email
        const response = await verifyEmailCode(userId, formData.email, verificationCode);
        if (response.verified) {
          // Success! User is verified
          console.log('Email verified!');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  if (verificationStep) {
    return (
      <form onSubmit={handleVerify}>
        <h2>Verify Your {formData.phone ? 'Phone' : 'Email'}</h2>
        <p>Enter the 6-digit code you received</p>
        <input
          type="text"
          maxLength="6"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
        />
        <button type="submit">Verify</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        placeholder="First Name"
        required
      />
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Phone (optional)"
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

---

## What Your Backend Needs

Your backend needs these 5 endpoints (see BACKEND_API_ENDPOINTS.md for full details):

1. **POST /user/users/:userId/verify-phone** - Generate & send OTP via SMS
2. **POST /user/users/:userId/verify-phone-code** - Verify OTP code
3. **POST /user/users/:userId/verify-email** - Generate & send code via email
4. **POST /user/users/:userId/verify-email-code** - Verify email code
5. **POST /user/users/:userId/resend-verification** - Resend code

---

## API Response Format

All endpoints return this format:

**Success:**
```json
{
  "success": true,
  "message": "Description...",
  "verified": true  // Only for verify endpoints
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message...",
  "verified": false  // Only for verify endpoints
}
```

---

## Environment Variables (Frontend Only)

Optional - if your API is not at `http://localhost:5000/user`:

```
VITE_API_URL=http://your-backend-url.com/user
```

---

## That's It!

Your frontend is ready to go. Just implement the 5 backend endpoints and you're done!

No Twilio setup needed on frontend - it's all handled by your backend.
