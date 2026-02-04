# OTP Storage with Redis/Memcached

Since OTP is stored in Redis/Memcached (not database), here's how to implement the backend routes:

## Setup

### Install Dependencies
```bash
npm install redis
# OR
npm install memcached
```

### Initialize Client

#### Redis
```javascript
const redis = require('redis');
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.connect();
```

#### Memcached
```javascript
const Memcached = require('memcached');
const memcached = new Memcached(['127.0.0.1:11211']);
```

---

## Backend Routes

### Endpoint 1: Generate Phone OTP

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
    
    // ✅ Store OTP in Redis (NOT database)
    // Key: otp:phone:PHONENUMBER
    // Expiration: 10 minutes (600 seconds)
    
    // Using Redis:
    await redisClient.setEx(
      `otp:phone:${phone}`,
      600,  // expires in 600 seconds (10 minutes)
      result.otp
    );
    
    // OR Using Memcached:
    // await memcached.set(`otp:phone:${phone}`, result.otp, 600);
    
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

### Endpoint 2: Verify Phone OTP

```javascript
exports.verifyPhoneCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const { userId } = req.params;
    
    // ✅ Get OTP from Redis/Memcached (NOT database)
    
    // Using Redis:
    const storedOTP = await redisClient.get(`otp:phone:${phone}`);
    
    // OR Using Memcached:
    // const storedOTP = await memcached.get(`otp:phone:${phone}`);
    
    if (!storedOTP) {
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
      storedOTP
    );
    
    if (result.success && result.verified) {
      // Update user: phoneVerified = true
      await User.findByIdAndUpdate(userId, {
        phoneVerified: true,
        phone: phone,
      });
      
      // ✅ Delete OTP from Redis/Memcached (cleanup)
      await redisClient.del(`otp:phone:${phone}`);
      // OR Memcached:
      // await memcached.del(`otp:phone:${phone}`);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

### Endpoint 3: Resend OTP

```javascript
exports.resendVerificationCode = async (req, res) => {
  try {
    const { phone, type } = req.body;
    const { userId } = req.params;
    
    if (type !== 'phone' || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
      });
    }
    
    // Check rate limiting
    // Using Redis:
    const resendCount = await redisClient.incr(`resend:${phone}`);
    
    if (resendCount === 1) {
      // Set expiration on first increment
      await redisClient.expire(`resend:${phone}`, 300); // 5 minutes
    }
    
    if (resendCount > 3) {
      return res.status(429).json({
        success: false,
        error: 'Too many resend attempts. Try again later.',
      });
    }
    
    // Generate new OTP
    const result = await verificationService.resendVerificationCode(userId, phone);
    
    if (result.success) {
      // ✅ Update OTP in Redis
      await redisClient.setEx(
        `otp:phone:${phone}`,
        600,
        result.otp
      );
      
      // Send via Twilio
      await twilioClient.messages.create({
        body: `Your new GoTogether verification code is: ${result.otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

### Endpoint 4: Generate Email Link

```javascript
const jwt = require('jsonwebtoken');

exports.generateEmailVerification = async (req, res) => {
  try {
    const { email, firstName } = req.body;
    const { userId } = req.params;
    
    // Generate JWT token for email link
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
    
    // Optional: Store token in Redis for tracking
    // await redisClient.setEx(
    //   `email_token:${token}`,
    //   86400,  // 24 hours
    //   userId
    // );
    
    // Send email via SendGrid
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
        <p>Or copy this link: ${result.verificationLink}</p>
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

### Endpoint 5: Verify Email Token

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
    
    // Optional: Delete token from Redis
    // await redisClient.del(`email_token:${token}`);
    
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

## Redis/Memcached Keys Pattern

### Phone OTP
```
Key: otp:phone:+15551234567
Value: 123456 (6-digit OTP)
TTL: 600 seconds (10 minutes)
```

### Rate Limiting
```
Key: resend:+15551234567
Value: 1, 2, 3 (increment counter)
TTL: 300 seconds (5 minutes)
Auto-resets after 5 minutes
```

### Email Token (Optional)
```
Key: email_token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Value: userId
TTL: 86400 seconds (24 hours)
```

---

## Benefits of Redis/Memcached

✅ **No Database Hits** - Faster OTP verification  
✅ **Automatic Expiration** - Built-in TTL management  
✅ **Atomic Operations** - Rate limiting with INCR  
✅ **Scalable** - Handles high volume easily  
✅ **In-Memory** - Lightning fast lookups  

---

## Usage Summary

| Operation | Redis | Memcached |
|-----------|-------|-----------|
| Store OTP | `setEx(key, 600, otp)` | `set(key, otp, 600)` |
| Get OTP | `get(key)` | `get(key)` |
| Delete OTP | `del(key)` | `del(key)` |
| Increment | `incr(key)` | `incr(key)` |
| Set TTL | `expire(key, 300)` | Built-in |

---

## Environment Variables

```
REDIS_URL=redis://localhost:6379
# OR
MEMCACHED_SERVERS=localhost:11211

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
JWT_SECRET=your-secret-key
```

---

## That's It!

OTP is now stored in Redis/Memcached with:
- ✅ Automatic 10-minute expiration
- ✅ Fast verification (no DB query)
- ✅ Rate limiting built-in
- ✅ Clean cleanup after verification

No database OTP table needed!
