# Backend API Endpoints - Updated

**Email: Link-based verification**  
**Phone: OTP code-based verification**

---

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
  "message": "Verification email sent to user@example.com",
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
    
    // Generate link
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
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    
    // Send email via Twilio SendGrid with verification link
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Verify Your Email - GoTogether',
      html: `
        <h2>Verify Your Email, ${firstName}!</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${result.verificationLink}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy and paste this link:</p>
        <p>${result.verificationLink}</p>
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

## Endpoint 4: Verify Email Token

```
POST /user/verify-email-token
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com"
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
exports.verifyEmailToken = async (req, res) => {
  try {
    const { token, email } = req.body;
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.email !== email) {
      return res.status(400).json({
        success: false,
        error: 'Email mismatch',
        verified: false,
      });
    }
    
    // Update user: emailVerified = true
    await User.findByIdAndUpdate(decoded.userId, {
      emailVerified: true,
    });
    
    // Delete verification record
    await VerificationEmail.deleteOne({ token });
    
    res.json({
      success: true,
      verified: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        error: 'Verification link has expired',
        verified: false,
      });
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Invalid verification link',
      verified: false,
    });
  }
};
```

---

## Endpoint 5: Resend Verification Code (Phone only)

```
POST /user/users/:userId/resend-verification
```

**Request Body:**
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
  "message": "New verification code generated",
  "expiresIn": 600
}
```

**Backend Logic:**
```javascript
exports.resendVerificationCode = async (req, res) => {
  try {
    const { phone, type } = req.body;
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
    
    if (type === 'phone' && phone) {
      const result = await verificationService.resendVerificationCode(userId, phone);
      
      // Update OTP in database
      await VerificationOTP.findOneAndUpdate(
        { userId, phone },
        {
          otp: result.otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }
      );
      
      // Send via Twilio
      await twilioClient.messages.create({
        body: `Your new GoTogether verification code is: ${result.otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
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

## Database Models

### VerificationOTP Collection (Phone OTP codes)
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

### VerificationEmail Collection (Email tokens)
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
  token: {
    type: String,
    required: true,
    unique: true,
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

## Summary

| Type | Method | Endpoint | Purpose |
|------|--------|----------|---------|
| Phone | POST | `/user/users/:userId/verify-phone` | Generate & send OTP |
| Phone | POST | `/user/users/:userId/verify-phone-code` | Verify OTP |
| Phone | POST | `/user/users/:userId/resend-verification` | Resend OTP |
| Email | POST | `/user/users/:userId/verify-email` | Send verification link |
| Email | POST | `/user/verify-email-token` | Verify email token |

**Phone:** OTP codes (6 digits) sent via SMS, expire in 10 minutes  
**Email:** JWT tokens in verification links, expire in 24 hours
