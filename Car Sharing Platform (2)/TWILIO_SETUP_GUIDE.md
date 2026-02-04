# Twilio Integration Guide for GoTogether

## Overview
This guide covers implementing Twilio Verify for phone/SMS verification and SendGrid for email verification in your backend.

## Installation

### Backend Dependencies
```bash
npm install twilio @sendgrid/mail dotenv
```

### Environment Variables (.env)
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SendGrid Configuration (for email)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@gotogether.com

# Frontend URL for links
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:5000
```

## How to Get Credentials

### 1. Twilio Verify Setup

**Step 1: Create Twilio Account**
- Go to [twilio.com](https://www.twilio.com)
- Sign up and verify your account
- Add payment method

**Step 2: Get Account SID & Auth Token**
- Dashboard → Account Info
- Copy `Account SID` and `Auth Token`

**Step 3: Create Verify Service**
- Go to Messaging → Verify → Services
- Click "Create Service"
- Name it "GoTogether" or similar
- Copy the `Service SID` (VAxxxxxxxx)
- Configure delivery methods: SMS, Voice, Email
- Set code length to 6 digits
- Set expiration to 10 minutes

### 2. SendGrid Setup (for Email)

**Step 1: Create SendGrid Account**
- Go to [sendgrid.com](https://sendgrid.com)
- Sign up and verify
- Add payment method

**Step 2: Create API Key**
- Settings → API Keys
- Click "Create API Key"
- Select "Restricted Access"
- Enable: Mail Send
- Copy the API key

**Step 3: Verify Sender**
- Settings → Sender Authentication
- Add and verify your domain or sender email
- Use verified email in `SENDGRID_FROM_EMAIL`

## Backend Implementation

### 1. Phone Verification Route

```javascript
// routes/verification.js
const express = require('express');
const router = express.Router();
const twilioService = require('../services/twilioVerificationService');

// Send phone verification code
router.post('/users/:userId/verify-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    // Format phone to E.164 format: +1234567890
    const formattedPhone = formatPhoneE164(phone);

    // Send verification code via Twilio Verify
    const result = await twilioService.sendPhoneVerification(formattedPhone);

    if (result.success) {
      // Optionally store verification SID in database
      // await User.update(userId, { verificationSid: result.sid });

      res.json({
        success: true,
        message: `Verification code sent to ${phone}`,
        sid: result.sid,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Verify phone code
router.post('/users/:userId/verify-phone-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    const formattedPhone = formatPhoneE164(phone);

    // Check code with Twilio Verify
    const result = await twilioService.verifyPhoneCode(formattedPhone, code);

    if (result.success && result.verified) {
      // Update user in database
      // await User.update(userId, { phoneVerified: true, phone: phone });

      res.json({
        success: true,
        verified: true,
        message: 'Phone verified successfully',
        user: {
          id: userId,
          phoneVerified: true,
          phone: phone,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        message: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
```

### 2. Email Verification Route

```javascript
// Send email verification code
router.post('/users/:userId/verify-email', async (req, res) => {
  try {
    const { email, firstName } = req.body;

    // Send verification code via SendGrid
    const result = await twilioService.sendEmailVerification(email, firstName);

    if (result.success) {
      // Store verification code in database with expiration
      // await VerificationCode.create({
      //   userId,
      //   email,
      //   code: result.verificationCode,
      //   expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      // });

      res.json({
        success: true,
        message: `Verification code sent to ${email}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Verify email code
router.post('/users/:userId/verify-email-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Get stored verification code from database
    // const verification = await VerificationCode.findOne({
    //   userId,
    //   email,
    //   code,
    // });

    // For demo, validate locally
    const result = await twilioService.verifyEmailCode(
      email,
      code,
      storedCode, // from database
      codeCreatedAt // from database
    );

    if (result.success && result.verified) {
      // Update user in database
      // await User.update(userId, { emailVerified: true, email: email });
      // await VerificationCode.delete(verification.id);

      res.json({
        success: true,
        verified: true,
        message: 'Email verified successfully',
        user: {
          id: userId,
          emailVerified: true,
          email: email,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        message: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Resend verification code
router.post('/users/:userId/resend-verification', async (req, res) => {
  try {
    const { contact, type } = req.body; // type: 'sms', 'call', 'email'

    if (type === 'email') {
      // Resend email code
      const result = await twilioService.sendEmailVerification(
        contact,
        firstName
      );
      res.json(result);
    } else {
      // Resend SMS/call
      const formattedPhone = formatPhoneE164(contact);
      const result = await twilioService.resendVerificationCode(
        formattedPhone,
        type
      );
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
```

### 3. Helper Function

```javascript
// Format phone to E.164 format required by Twilio
function formatPhoneE164(phone) {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  if (cleaned.length >= 11) {
    return `+${cleaned}`;
  }

  return phone;
}
```

## Frontend Implementation

### Send Phone Verification
```jsx
import { verifyPhone, confirmPhoneOTP } from '../context/AuthContext';

// Send code
const result = await verifyPhone(userId, '+1234567890');
// Result: { success: true, message: "Code sent" }

// Verify code
const result = await confirmPhoneOTP(userId, '123456');
// Result: { success: true, user: {...} }
```

### Send Email Verification
```jsx
import { verifyEmail, confirmEmailVerification } from '../context/AuthContext';

// Send code
const result = await verifyEmail(userId, 'user@example.com');
// Result: { success: true, message: "Code sent" }

// Verify code - when user enters it
const result = await confirmEmailVerification(userId, email, '123456');
// Result: { success: true, user: {...} }
```

## Test Credentials (Twilio Trial)

### Test Phone Numbers
- +1 415 523 8886 (US)
- +44 203 769 4729 (UK)
- +61 2 8015 7336 (Australia)

### Test Emails
- Use any email, but Twilio Verify uses actual Twilio credentials

## Troubleshooting

### Common Issues

1. **"Invalid phone number"**
   - Ensure phone is in E.164 format: +1234567890
   - Check Twilio region supports the country

2. **"Invalid code"**
   - Code expires after 10 minutes
   - Max 5 verification attempts per phone/email

3. **"Service not found"**
   - Verify `TWILIO_VERIFY_SID` is correct
   - Check it starts with `VA`

4. **SendGrid email not sending**
   - Verify sender email is confirmed in SendGrid
   - Check API key has Mail Send permission
   - Verify email format is valid

## Production Checklist

- [ ] Set up error logging and monitoring
- [ ] Implement rate limiting on verification endpoints
- [ ] Store verification attempts in database
- [ ] Add CAPTCHA for repeated failed attempts
- [ ] Use HTTPS for all verification communications
- [ ] Implement audit logging for compliance
- [ ] Set up email/SMS retry logic
- [ ] Monitor Twilio and SendGrid usage/costs

## Costs

**Twilio Verify**
- SMS: ~$0.005 per message
- Voice: ~$0.01 per call
- Email: Free (via SendGrid)

**SendGrid**
- Free tier: 100 emails/day
- Paid: starts at $9.95/month

## Resources

- [Twilio Verify Docs](https://www.twilio.com/docs/verify)
- [SendGrid Docs](https://sendgrid.com/docs)
- [Twilio Node SDK](https://github.com/twilio/twilio-node)
- [SendGrid Node SDK](https://github.com/sendgrid/sendgrid-nodejs)
