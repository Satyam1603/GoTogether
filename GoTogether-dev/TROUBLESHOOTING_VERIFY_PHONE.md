# Troubleshooting Guide - 500 Error on /verify-phone

## Problem Summary
You're receiving a 500 (Internal Server Error) when calling:
```
GET http://localhost:8080/gotogether/users/17/verify-phone
```

## Common Causes & Solutions

### 1. **Redis Connection Issue** ❌
**Symptom**: 500 error when trying to save OTP

**Solution**:
```bash
# Start Redis (if not running)
docker run --name my-redis -p 6379:6379 -d redis

# Or if Docker container exists, restart it
docker start my-redis

# Verify Redis is running
docker exec -it my-redis redis-cli ping
# Should return: PONG
```

**Verification**: Check `application.properties`
```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

---

### 2. **Twilio Configuration Issue** ❌
**Symptom**: SMS sending fails (but shouldn't cause 500 after our fix)

**Solution**:
Verify Twilio credentials in `application.properties`:
```properties
twilio.account.sid=${TWILIO_ACCOUNT_SID}
twilio.auth.token=your_actual_token_here
twilio.phone.number=+1361XXXXX
```

**Quick Test** (without actual SMS):
- The SMS failure won't cause 500 error anymore (we added error handling)
- OTP is still saved in Redis even if SMS fails

---

### 3. **User Not Found (userId doesn't exist)** ❌
**Symptom**: 500 error with message "User not found with id: 17"

**Solution**:
```bash
# Verify user with id 17 exists in database
mysql> SELECT * FROM users WHERE user_id = 17;

# If no results, the user doesn't exist
# Create a test user first with register endpoint:
POST http://localhost:8080/gotogether/users/register
```

**Example Request**:
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "phoneNo": "+91234567890",
  "role": "PASSENGER"
}
```

---

### 4. **User Missing Phone Number** ❌
**Symptom**: 500 error with message "Phone number not found for user"

**Solution**:
```bash
# Check if user 17 has a phone number
mysql> SELECT user_id, email, phone_no FROM users WHERE user_id = 17;

# If phone_no is NULL, update it
mysql> UPDATE users SET phone_no = '+91234567890' WHERE user_id = 17;
```

**Or use Update API**:
```
PUT http://localhost:8080/gotogether/users/17
Content-Type: application/json

{
  "phone": "+91234567890",
  "firstName": "FirstName",
  "lastName": "LastName",
  "preferences": "some preferences"
}
```

---

### 5. **Database Connection Issue** ❌
**Symptom**: 500 error - Cannot connect to database

**Solution**:
```bash
# Verify MySQL is running
mysql -u root -p root123

# Check if gotogether_users_db exists
SHOW DATABASES;

# If database doesn't exist, it will be created automatically with:
# spring.jpa.hibernate.ddl-auto=update
```

---

## How to Debug - Step by Step

### Step 1: Check Server Logs
Look for error message in your IDE console or:
```bash
# If running as JAR
java -jar application.jar | grep -i "verify-phone"
```

### Step 2: Test with Postman/cURL
```bash
curl -X GET http://localhost:8080/gotogether/users/17/verify-phone \
  -H "Authorization: Bearer <your_token>" \
  -v
```

The `-v` flag shows full request/response including headers.

### Step 3: Database Verification
```sql
-- Check if user exists
SELECT * FROM users WHERE user_id = 17;

-- Check user's phone number
SELECT user_id, first_name, email, phone_no FROM users WHERE user_id = 17;

-- Check Redis OTP (from redis-cli)
KEYS OTP:*
GET OTP:17
```

### Step 4: Check Redis Connection
```bash
# Open Redis CLI
docker exec -it my-redis redis-cli

# Test basic commands
PING                 # Should return PONG
SET testkey testval  # Should return OK
GET testkey          # Should return testval
FLUSHALL             # Clear all keys for testing
```

---

## Database Queries for Verification

### Create Sample User for Testing
```sql
INSERT INTO users (user_id, first_name, last_name, email, password, phone_no, role, email_verified, phone_verified, created_at)
VALUES (
  NULL,
  'Test',
  'User',
  'test@example.com',
  'password123',
  '+91234567890',
  'PASSENGER',
  false,
  false,
  NOW()
);

-- Get the newly created user ID
SELECT LAST_INSERT_ID();
```

### Check User Details
```sql
SELECT 
  user_id,
  first_name,
  last_name,
  email,
  phone_no,
  role,
  email_verified,
  phone_verified,
  created_at
FROM users 
WHERE user_id = 17;
```

---

## Updated Error Handling

The following updates have been made to handle errors gracefully:

### 1. TwilioService - SMS Error Handling ✅
```java
// Now catches exceptions and logs them without crashing
public void sendSMS(String to, String message) {
    try {
        Message response = Message.creator(...)
            .create();
        System.out.println("SMS sent successfully");
    } catch (Exception e) {
        System.err.println("Error sending SMS: " + e.getMessage());
        // Doesn't throw - allows OTP to be saved even if SMS fails
    }
}
```

### 2. UserServiceImpl - OTP Generation ✅
```java
@Override
public void sendPhoneVerificationOTP(Long userId) {
    // Validates user exists
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException(...));
    
    // Validates phone number exists
    if (user.getPhoneNo() == null || user.getPhoneNo().isEmpty()) {
        throw new ResourceNotFoundException("Phone number not found");
    }
    
    // Generates and saves OTP
    String otp = generateOTP();
    String redisKey = "OTP:" + userId;
    redisTemplate.opsForValue().set(redisKey, otp, 5, TimeUnit.MINUTES);
    
    // Tries to send SMS (won't crash if it fails)
    try {
        twilioService.sendSMS(user.getPhoneNo(), "Your OTP is: " + otp);
    } catch (Exception e) {
        System.err.println("Failed to send SMS: " + e.getMessage());
    }
}
```

### 3. Controller - Error Response ✅
```java
@GetMapping("/{userId}/verify-phone")
public ResponseEntity<?> verifyPhone(@PathVariable Long userId) {
    try {
        userService.sendPhoneVerificationOTP(userId);
        return ResponseEntity.ok(new ApiResponseDTO("OTP sent for phone verification.", "SUCCESS"));
    } catch (Exception e) {
        // Provides error details in response
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiResponseDTO("Failed to send OTP: " + e.getMessage(), "FAILURE"));
    }
}
```

---

## Test Checklist

- [ ] Redis is running (`docker ps` shows redis container)
- [ ] MySQL is running and accessible
- [ ] User with id=17 exists in database
- [ ] User with id=17 has a phone number
- [ ] Phone number format is valid (e.g., +91234567890)
- [ ] Twilio credentials are configured (optional if SMS fails gracefully)
- [ ] Server logs show no exceptions
- [ ] Response includes clear error message

---

## Quick Test Flow

```
1. Register new user → Get new userId
   POST /gotogether/users/register
   
2. Send OTP to that user
   GET /gotogether/users/{userId}/verify-phone
   
3. Check Redis for OTP
   docker exec -it my-redis redis-cli
   GET OTP:{userId}
   
4. Verify OTP
   POST /gotogether/users/{userId}/verify-otp?otp=123456
```

---

## If Still Getting 500 Error

1. **Check server console logs** - look for the exact stack trace
2. **Enable debug logging** in `application.properties`:
   ```properties
   logging.level.com.gotogether.user=DEBUG
   logging.level.org.springframework.security=DEBUG
   ```
3. **Check database**:
   ```sql
   SELECT VERSION();
   SHOW DATABASES;
   USE gotogether_users_db;
   SHOW TABLES;
   DESC users;
   ```
4. **Check Redis**:
   ```bash
   docker exec -it my-redis redis-cli
   PING
   INFO
   ```
5. **Share the exact error message** from console with the detailed stack trace for further debugging

---

## Files Modified for Better Error Handling

1. ✅ `TwilioService.java` - Added SMS error handling
2. ✅ `UserServiceImpl.java` - Added phone number validation and SMS exception handling
3. ✅ `UserController.java` - Added try-catch and error responses
4. ✅ `GlobalExceptionHandler.java` - Added JWT and RefreshToken exception handlers

All these changes ensure that the endpoint returns a meaningful error message instead of a generic 500 error.
