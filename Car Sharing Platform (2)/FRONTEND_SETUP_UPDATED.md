# Frontend Setup - Email Links + Phone OTP

## Simplified Approach

✅ **Phone:** 6-digit OTP codes via SMS  
✅ **Email:** Verification links (no codes)  
✅ **Backend:** Handles Twilio & SendGrid completely  

---

## Frontend Usage

### Phone Verification (OTP Code)

```javascript
import { sendPhoneVerification, verifyPhoneCode } from './Service/verificationUtils';

// Step 1: Send OTP
const handleSendPhoneCode = async (userId, phone) => {
  const response = await sendPhoneVerification(userId, phone);
  // Response: { success: true, message: "OTP sent..." }
};

// Step 2: User receives SMS with code, enters it
const handleVerifyPhone = async (userId, phone, code) => {
  const response = await verifyPhoneCode(userId, phone, code);
  // Response: { success: true, verified: true, message: "Phone verified!" }
};
```

### Email Verification (Link)

```javascript
import { sendEmailVerification, verifyEmailToken } from './Service/verificationUtils';

// Step 1: Send email with verification link
const handleSendEmailLink = async (userId, email, firstName) => {
  const response = await sendEmailVerification(userId, email, firstName);
  // Response: { success: true, message: "Email sent..." }
  // Email contains: http://yoursite.com/verify-email?token=xxx&email=user@example.com
};

// Step 2: User clicks link → automatic verification
// The link redirects to /verify-email?token=xxx&email=user@example.com
// Your component should call:
const handleVerifyEmail = async (token, email) => {
  const response = await verifyEmailToken(token, email);
  // Response: { success: true, verified: true, message: "Email verified!" }
};
```

---

## Example: Signup Component

```javascript
import { useState } from 'react';
import { 
  sendPhoneVerification, 
  verifyPhoneCode,
  sendEmailVerification,
  verifyEmailToken 
} from './Service/verificationUtils';
import { useAuth } from './context/AuthContext';

export default function SignUp() {
  const { register } = useAuth();
  const [step, setStep] = useState('register'); // 'register' | 'verify-phone' | 'verify-email' | 'done'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    verificationMethod: 'phone', // or 'email'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState(null);

  // Step 1: Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
      });
      
      setUserId(response.userId);
      
      // Send verification code/link
      if (formData.verificationMethod === 'phone') {
        await sendPhoneVerification(response.userId, formData.phone);
        setStep('verify-phone');
      } else {
        await sendEmailVerification(response.userId, formData.email, formData.firstName);
        setStep('verify-email');
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  // Step 2: Verify phone code
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    try {
      const response = await verifyPhoneCode(userId, formData.phone, verificationCode);
      if (response.verified) {
        setStep('done');
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  // Registration form
  if (step === 'register') {
    return (
      <form onSubmit={handleRegister}>
        <h2>Sign Up</h2>
        
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        
        <label>
          <input
            type="radio"
            name="verification"
            value="phone"
            checked={formData.verificationMethod === 'phone'}
            onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
          />
          Verify with Phone
        </label>
        
        <label>
          <input
            type="radio"
            name="verification"
            value="email"
            checked={formData.verificationMethod === 'email'}
            onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
          />
          Verify with Email
        </label>
        
        {formData.verificationMethod === 'phone' && (
          <input
            type="tel"
            placeholder="Phone Number (for SMS code)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        )}
        
        <button type="submit">Sign Up</button>
      </form>
    );
  }

  // Phone verification form
  if (step === 'verify-phone') {
    return (
      <form onSubmit={handleVerifyPhone}>
        <h2>Verify Your Phone</h2>
        <p>Enter the 6-digit code sent to {formData.phone}</p>
        
        <input
          type="text"
          maxLength="6"
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
          required
        />
        
        <button type="submit">Verify</button>
      </form>
    );
  }

  // Email verification (just show waiting message)
  if (step === 'verify-email') {
    return (
      <div>
        <h2>Verify Your Email</h2>
        <p>Check your email at {formData.email}</p>
        <p>Click the verification link to confirm your account.</p>
        <p>You'll be automatically redirected when verified.</p>
      </div>
    );
  }

  // Success
  if (step === 'done') {
    return (
      <div>
        <h2>✓ Account Created!</h2>
        <p>Welcome, {formData.firstName}!</p>
        <p>Your account is verified and ready to use.</p>
      </div>
    );
  }
}
```

---

## Email Link Verification Page

Create a new component at `src/pages/VerifyEmail.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailToken } from '../Service/verificationUtils';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        // Call backend to verify token
        const response = await verifyEmailToken(token, email);

        if (response.verified) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting...');
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return <div><p>Verifying your email...</p></div>;
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>✓ Email Verified!</h2>
        <p>{message}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>✗ Verification Failed</h2>
        <p>{message}</p>
        <a href="/signup">Try signing up again</a>
      </div>
    );
  }
}
```

---

## Router Setup

Add the verify email page to your router:

```javascript
import VerifyEmail from './pages/VerifyEmail';

const router = [
  // ... other routes
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
];
```

---

## Verification Flow Summary

### Phone Flow
```
User signs up with phone
  ↓
Backend sends OTP via SMS
  ↓
User enters 6-digit code
  ↓
Frontend calls verifyPhoneCode()
  ↓
Backend updates phoneVerified = true
  ↓
Done! ✓
```

### Email Flow
```
User signs up with email
  ↓
Backend sends email with verification link
  ↓
User clicks link in email
  ↓
Redirected to /verify-email?token=xxx&email=user@example.com
  ↓
Frontend calls verifyEmailToken()
  ↓
Backend updates emailVerified = true
  ↓
Done! ✓
```

---

## API Functions Ready to Use

```javascript
import {
  sendPhoneVerification,      // Generate & send phone OTP
  verifyPhoneCode,            // Verify phone OTP
  sendEmailVerification,      // Send email verification link
  verifyEmailToken,           // Verify email token
  resendVerificationCode,     // Resend phone OTP
  formatPhoneE164,           // Format phone: +1234567890
  formatPhoneDisplay,        // Display format: (555) 123-4567
  isValidEmail,              // Check email format
  isValidPhone,              // Check phone format
  isValidOTPCode,            // Check OTP is 6 digits
  maskEmail,                 // Privacy mask: u***r@example.com
  maskPhone,                 // Privacy mask: ****1234
} from './Service/verificationUtils';
```

---

## That's It!

Your frontend verification system is complete. Just:

1. ✅ Use `sendPhoneVerification()` and `verifyPhoneCode()` for phone OTP
2. ✅ Use `sendEmailVerification()` and `verifyEmailToken()` for email links
3. ✅ Create the `VerifyEmail.jsx` page for email link handling
4. ✅ Add the page to your router

Backend handles all Twilio & SendGrid sending automatically!
