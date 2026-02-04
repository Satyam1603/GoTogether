# Quick Implementation - Redis/Memcached OTP

## Key Points

✅ OTP is **NOT stored in database**  
✅ OTP is stored in **Redis/Memcached** with automatic 10-minute expiration  
✅ Backend service only **generates** OTP  
✅ Backend **route** handles storage and sending  

---

## Backend Route Pattern

```javascript
// 1. Service generates OTP
const { otp } = await twilioService.sendPhoneVerification(userId, phone);

// 2. Route stores in Redis/Memcached
await redis.setEx(`otp:phone:${phone}`, 600, otp);

// 3. Route sends via Twilio
await twilio.messages.create({
  body: `Code: ${otp}`,
  to: phone,
});

// 4. Return success
res.json({ success: true });
```

---

## Code Examples

### Store OTP in Redis
```javascript
// Redis
await redisClient.setEx(
  `otp:phone:${phone}`,  // Key
  600,                    // Expires in 600 seconds (10 min)
  otp                     // Value
);
```

### Get OTP from Redis
```javascript
const storedOTP = await redisClient.get(`otp:phone:${phone}`);

if (!storedOTP) {
  // OTP not found or expired
  return res.status(400).json({ error: 'OTP expired' });
}

// Verify code
if (code === storedOTP) {
  // Delete OTP (cleanup)
  await redisClient.del(`otp:phone:${phone}`);
  // Verification success
}
```

### Resend with Rate Limiting
```javascript
// Increment resend counter
const count = await redisClient.incr(`resend:${phone}`);

// Set 5-minute expiration on first increment
if (count === 1) {
  await redisClient.expire(`resend:${phone}`, 300);
}

// Check limit (max 3 resends)
if (count > 3) {
  return res.status(429).json({ error: 'Too many requests' });
}

// Generate and store new OTP
const newOTP = generateOTP();
await redisClient.setEx(`otp:phone:${phone}`, 600, newOTP);
```

---

## Installation

```bash
# For Redis
npm install redis

# For Memcached
npm install memcached
```

---

## Client Setup

### Redis
```javascript
const redis = require('redis');
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});
redisClient.connect();
module.exports = redisClient;
```

### Memcached
```javascript
const Memcached = require('memcached');
const memcached = new Memcached(['127.0.0.1:11211']);
module.exports = memcached;
```

---

## Redis Methods

| Method | Usage |
|--------|-------|
| `setEx(key, ttl, value)` | Store with expiration |
| `get(key)` | Retrieve value |
| `del(key)` | Delete key |
| `incr(key)` | Increment counter |
| `expire(key, ttl)` | Set/update expiration |
| `exists(key)` | Check if exists |

---

## Memcached Methods

| Method | Usage |
|--------|-------|
| `set(key, value, ttl)` | Store with expiration |
| `get(key)` | Retrieve value |
| `del(key)` | Delete key |
| `incr(key)` | Increment counter |

---

## Flow Diagram

```
PHONE VERIFICATION

Frontend: sendPhoneVerification(phone)
          ↓ POST /verify-phone
       
[BACKEND ROUTE]
├─ Generate OTP: 123456
├─ Store in Redis: setEx("otp:phone:+15551234567", 600, "123456")
├─ Send via Twilio SMS
└─ Return: { success: true }
       ↓
Frontend: User receives SMS
       ↓
Frontend: verifyPhoneCode(phone, "123456")
          ↓ POST /verify-phone-code
       
[BACKEND ROUTE]
├─ Get from Redis: get("otp:phone:+15551234567")
├─ Check: "123456" === stored
├─ Delete from Redis: del("otp:phone:+15551234567")
├─ Update: user.phoneVerified = true
└─ Return: { verified: true }
```

---

## That's It!

```
// 5 Backend Routes needed:

1. POST /verify-phone
   └─ Generate OTP
   └─ Store in Redis (10 min)
   └─ Send via Twilio

2. POST /verify-phone-code
   └─ Get from Redis
   └─ Verify code
   └─ Delete from Redis
   └─ Update user

3. POST /verify-email
   └─ Generate JWT token
   └─ Create link
   └─ Send via SendGrid

4. POST /verify-email-token
   └─ Verify JWT
   └─ Update user

5. POST /resend-verification
   └─ Check rate limit (Redis counter)
   └─ Generate new OTP
   └─ Store in Redis
   └─ Send via Twilio
```

See **REDIS_MEMCACHED_SETUP.md** for complete code examples!
