# Backend API Endpoints for Verification

Since Twilio is already setup on the backend, these endpoints just need to **generate** OTP and verification links.

## Endpoint 1: Generate Phone Verification OTP

```
POST /user/users/:userId/verify-phone
```

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "otp": "123456",
  "message": "Verification OTP generated for +1234567890",
  "expiresIn": 600
}
```

**Backend Logic:**
```javascript
const verificationService = require('../services/twilioVerificationService');

exports.generatePhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const { userId } = req.params;
    
    // Generate OTP using service
    const result = await verificationService.sendPhoneVerification(userId, phone);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Store OTP in database with expiration
    await VerificationOTP.create({
      userId,
      phone,
      otp: result.otp,
      type: 'phone',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    
    // Send OTP via Twilio SMS
    await twilioClient.messages.create({
      body: `Your GoTogether verification code is: ${result.otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## Endpoint 2: Verify Phone OTP Code

```
POST /user/users/:userId/verify-phone-code
```

**Request Body:**
```json
{
  "phone": "+1234567890",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Phone verified successfully"
}
```

**Backend Logic:**
```javascript
exports.verifyPhoneCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const { userId } = req.params;
    
    // Get stored OTP
    const otpRecord = await VerificationOTP.findOne({
      userId,
      phone,
      type: 'phone',
    }).sort({ createdAt: -1 });
    
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'OTP expired or not found',
        verified: false,
      });
    }
    
    // Verify code
    const result = await verificationService.verifyPhoneCode(
      userId,
      phone,
      code,
      otpRecord.otp
    );
    
    if (result.success && result.verified) {
      // Update user: phoneVerified = true
      await User.findByIdAndUpdate(userId, {
        phoneVerified: true,
        phone: phone,
      });
      
      // Delete OTP record
      await VerificationOTP.deleteOne({ _id: otpRecord._id });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## Endpoint 3: Generate Email Verification Link

```
POST /user/users/:userId/verify-email
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John"
}
```

**Response:**
```json
{
  "success": true,
  "otp": "123456",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationLink": "http://localhost:5173/verify-email?token=...&email=user@example.com&userId=123",
  "message": "Verification email generated for user@example.com",
  "expiresIn": 86400
}
```

**Backend Logic:**
```javascript
const jwt = require('jsonwebtoken');

exports.generateEmailVerification = async (req, res) => {
  try {
    const { email, firstName } = req.body;
    const { userId } = req.params;
    
    // Generate token for email link
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate OTP for alternative verification
    const result = await verificationService.sendEmailVerification(
      userId,
      email,
      firstName,
      token
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Store verification record
    await VerificationEmail.create({
      userId,
      email,
      otp: result.otp,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    
    // Send email via Twilio SendGrid
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Verify Your Email - GoTogether',
      html: `
        <h2>Verify Your Email, ${firstName}!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${result.verificationLink}">Verify Email</a>
        <p>Or use this verification code: ${result.otp}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });
    
    res.json({
      success: true,
      message: `Verification email sent to ${email}`,
      expiresIn: 86400,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## Endpoint 4: Verify Email Code/Token

```
POST /user/users/:userId/verify-email-code
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Email verified successfully"
}
```

**Backend Logic:**
```javascript
exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const { userId } = req.params;
    
    // Get stored email verification record
    const emailRecord = await VerificationEmail.findOne({
      userId,
      email,
    }).sort({ createdAt: -1 });
    
    if (!emailRecord || emailRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Verification code expired or not found',
        verified: false,
      });
    }
    
    // Verify code
    const result = await verificationService.verifyEmailCode(
      email,
      code,
      emailRecord.otp
    );
    
    if (result.success && result.verified) {
      // Update user: emailVerified = true
      await User.findByIdAndUpdate(userId, {
        emailVerified: true,
      });
      
      // Delete verification record
      await VerificationEmail.deleteOne({ _id: emailRecord._id });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## Endpoint 5: Resend Verification Code

```
POST /user/users/:userId/resend-verification
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "email"
}
```
or
```json
{
  "phone": "+1234567890",
  "type": "phone"
}
```

**Response:**
```json
{
  "success": true,
  "otp": "654321",
  "message": "New verification code generated",
  "expiresIn": 600
}
```

**Backend Logic:**
```javascript
exports.resendVerificationCode = async (req, res) => {
  try {
    const { phone, email, type } = req.body;
    const { userId } = req.params;
    
    // Check rate limiting (max 3 resends in 5 minutes)
    const recentResends = await VerificationLog.countDocuments({
      userId,
      type: 'resend',
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
    });
    
    if (recentResends >= 3) {
      return res.status(429).json({
        success: false,
        error: 'Too many resend attempts. Try again later.',
      });
    }
    
    let result;
    
    if (type === 'phone' && phone) {
      result = await verificationService.resendVerificationCode(userId, phone);
      
      // Update OTP in database
      await VerificationOTP.findOneAndUpdate(
        { userId, phone },
        {
          otp: result.otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }
      );
    } else if (type === 'email' && email) {
      result = await verificationService.resendVerificationCode(userId, email);
      
      // Update OTP in database
      await VerificationEmail.findOneAndUpdate(
        { userId, email },
        {
          otp: result.otp,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
      );
    }
    
    // Log resend attempt
    await VerificationLog.create({
      userId,
      type: 'resend',
      contactType: type,
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## Required Database Models

### VerificationOTP Collection
```javascript
const verificationOTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['phone'],
    default: 'phone',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete expired records
verificationOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### VerificationEmail Collection
```javascript
const verificationEmailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete expired records
verificationEmailSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### User Model Updates
```javascript
// Add these fields to your User model:
phoneVerified: {
  type: Boolean,
  default: false,
},
emailVerified: {
  type: Boolean,
  default: false,
},
phone: {
  type: String,
  unique: true,
  sparse: true,
},
```

---

## Frontend Usage

Your frontend just calls these endpoints and doesn't need to handle Twilio:

```javascript
// Generate phone OTP
const response = await fetch(`/user/users/${userId}/verify-phone`, {
  method: 'POST',
  body: JSON.stringify({ phone: '+1234567890' }),
});

// Verify phone code (user enters in UI)
const response = await fetch(`/user/users/${userId}/verify-phone-code`, {
  method: 'POST',
  body: JSON.stringify({ phone: '+1234567890', code: '123456' }),
});

// Generate email verification
const response = await fetch(`/user/users/${userId}/verify-email`, {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com', firstName: 'John' }),
});

// Verify email code
const response = await fetch(`/user/users/${userId}/verify-email-code`, {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com', code: '123456' }),
});
```

---

## Summary

✅ Backend generates OTP and verification links  
✅ Backend sends via Twilio (SMS and SendGrid email)  
✅ Frontend only calls API endpoints  
✅ No Twilio SDK needed on frontend  
✅ Clean separation of concerns
