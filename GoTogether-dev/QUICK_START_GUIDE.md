# Quick Start Guide - JWT & Refresh Token + 500 Error Fix

## What's Been Done

✅ **JWT & Refresh Token Implementation**
- Access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- Token rotation on refresh
- Token revocation on logout

✅ **500 Error Fixed**
- Better error handling in OTP sending
- Phone number validation
- Meaningful error messages
- Debug endpoints for troubleshooting

---

## Getting Started (5 minutes)

### Step 1: Make Sure Services Are Running
```bash
# 1. Start Redis
docker run --name my-redis -p 6379:6379 -d redis

# 2. Start MySQL (if not already running)
# Usually: mysql -u root -p

# 3. Start the application
mvn spring-boot:run
```

### Step 2: Verify Everything is Working
```bash
# Health check
curl http://localhost:8080/gotogether/debug/health

# Should return:
# {"status":"UP","timestamp":1645000000,"message":"Server is running"}
```

### Step 3: Register a New User
```bash
curl -X POST http://localhost:8080/gotogether/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNo": "+91234567890",
    "role": "PASSENGER"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "firstName": "John",
    "email": "john@example.com",
    "phoneNo": "+91234567890"
  },
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "status": "SUCCESS"
}
```

### Step 4: Send OTP (Now Fixed!)
```bash
curl -X GET http://localhost:8080/gotogether/users/1/verify-phone \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Expected Response:**
```json
{
  "message": "OTP sent for phone verification.",
  "status": "SUCCESS"
}
```

**If Error (Should be meaningful now, not 500!):**
```json
{
  "message": "Failed to send OTP: Phone number not found for user: 1",
  "status": "FAILURE"
}
```

### Step 5: Verify OTP
```bash
# First check what OTP was generated
docker exec -it my-redis redis-cli
> GET OTP:1
# Shows: "123456" (example)

# Then verify it
curl -X POST "http://localhost:8080/gotogether/users/1/verify-otp?otp=123456" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

## Testing Scenarios

### Scenario 1: Complete Authentication Flow
```bash
# 1. Register
USER_DATA='{"firstName":"Alice","lastName":"Smith","email":"alice@example.com","password":"pass123","phoneNo":"+91234567890","role":"PASSENGER"}'

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/gotogether/users/register \
  -H "Content-Type: application/json" \
  -d "$USER_DATA")

echo $REGISTER_RESPONSE

# Extract from response:
# USER_ID = 2
# ACCESS_TOKEN = eyJhbG...
# REFRESH_TOKEN = eyJhbG...

# 2. Use access token to get profile
curl -X GET http://localhost:8080/gotogether/users/2 \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. Refresh token (after 1 hour or test immediately)
curl -X POST http://localhost:8080/gotogether/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}'

# 4. Logout (revoke token)
curl -X POST http://localhost:8080/gotogether/users/2/revoke-token \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}'
```

### Scenario 2: OTP Verification
```bash
# 1. Send OTP
curl -X GET http://localhost:8080/gotogether/users/1/verify-phone \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 2. Check Redis for generated OTP
docker exec -it my-redis redis-cli
> GET OTP:1

# 3. Verify OTP (use the OTP from Redis)
curl -X POST "http://localhost:8080/gotogether/users/1/verify-otp?otp=XXXXXX" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Check verification status
curl -X GET http://localhost:8080/gotogether/users/1/verification-status \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Scenario 3: Error Cases (Now Fixed!)
```bash
# Test: User not found
curl -X GET http://localhost:8080/gotogether/users/9999/verify-phone \
  -H "Authorization: Bearer $ACCESS_TOKEN"
# Response: 404 with meaningful message

# Test: No phone number
# First create user without phone number, then test
curl -X GET http://localhost:8080/gotogether/users/99/verify-phone \
  -H "Authorization: Bearer $ACCESS_TOKEN"
# Response: 400 with meaningful message

# Test: Invalid token
curl -X GET http://localhost:8080/gotogether/users/1/verify-phone \
  -H "Authorization: Bearer invalid_token"
# Response: 401 Unauthorized
```

---

## Using Debug Endpoints

### Check User Details
```bash
# See all user information including phone number
curl http://localhost:8080/gotogether/debug/user/1
```

### Debug OTP Process
```bash
# See step-by-step what happens in OTP process
curl http://localhost:8080/gotogether/debug/verify-phone-debug/1
```

### Test Database Connection
```bash
# Verify database is connected and working
curl http://localhost:8080/gotogether/debug/database/test
```

### List All Users
```bash
# See all users in system (debug only)
curl http://localhost:8080/gotogether/debug/users/all
```

---

## Frontend Integration (Angular Example)

### 1. Install Dependencies
```bash
npm install @angular/common @angular/http
```

### 2. Add AuthService
```typescript
// Copy code from FRONTEND_JWT_IMPLEMENTATION.ts
// Save as: src/app/services/auth.service.ts
```

### 3. Add HTTP Interceptor
```typescript
// Copy JwtInterceptor from FRONTEND_JWT_IMPLEMENTATION.ts
// Save as: src/app/interceptors/jwt.interceptor.ts
```

### 4. Register in app.module.ts
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthService } from './services/auth.service';

@NgModule({
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

### 5. Use in Component
```typescript
constructor(private authService: AuthService) {}

register() {
  this.authService.registerUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'pass123',
    phoneNo: '+91234567890',
    role: 'PASSENGER'
  }).subscribe(
    (response) => {
      const { user, accessToken, refreshToken } = response;
      console.log('Registered:', user);
      // User is now logged in
    },
    (error) => {
      console.error('Registration failed:', error);
    }
  );
}

login() {
  this.authService.loginUser({
    email: 'john@example.com',
    password: 'pass123'
  }).subscribe(
    (response) => {
      console.log('Logged in:', response);
    },
    (error) => {
      console.error('Login failed:', error);
    }
  );
}
```

---

## Common Issues & Quick Fixes

### Issue: Redis Connection Error
```bash
# Fix: Start Redis
docker run --name my-redis -p 6379:6379 -d redis
docker exec -it my-redis redis-cli ping
# Should return: PONG
```

### Issue: Database Connection Error
```bash
# Fix: Verify MySQL is running
mysql -u root -p root123
# If you're in MySQL prompt, it's working
```

### Issue: User Not Found on /verify-phone
```bash
# Fix: Register user first and get the userId
# Or check if user exists:
curl http://localhost:8080/gotogether/debug/user/1
```

### Issue: Phone Number Not Found
```bash
# Fix: Update user with phone number
curl -X PUT http://localhost:8080/gotogether/users/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","phone":"+91234567890"}'
```

### Issue: Still Getting 500 Error
```bash
# Debug: Check all prerequisites
curl http://localhost:8080/gotogether/debug/health
curl http://localhost:8080/gotogether/debug/database/test
curl http://localhost:8080/gotogether/debug/user/1
curl http://localhost:8080/gotogether/debug/verify-phone-debug/1
```

---

## File Locations

### Backend Files
```
src/main/java/com/gotogether/user/
├── util/
│   └── JwtTokenProvider.java
├── entity/
│   └── RefreshToken.java
├── repository/
│   └── RefreshTokenRepository.java
├── filter/
│   └── JwtAuthenticationFilter.java
├── config/
│   └── SecurityConfig.java
├── controller/
│   ├── UserController.java (updated)
│   └── DebugController.java (new)
├── service/
│   ├── UserService.java (updated)
│   ├── UserServiceImpl.java (updated)
│   └── TwilioService.java (updated)
├── dto/
│   ├── AuthTokenResponseDTO.java
│   ├── RegistrationResponseDTO.java
│   └── (others...)
└── custom_exception/
    ├── JwtAuthenticationException.java
    └── RefreshTokenException.java
```

### Documentation Files
```
project_root/
├── JWT_REFRESH_TOKEN_IMPLEMENTATION.md
├── TROUBLESHOOTING_VERIFY_PHONE.md
├── FIX_500_ERROR_SUMMARY.md
├── API_QUICK_REFERENCE.md
├── IMPLEMENTATION_VERIFICATION.md
├── FRONTEND_JWT_IMPLEMENTATION.ts
└── QUICK_START_GUIDE.md (this file)
```

---

## Key Features Summary

### ✅ JWT Authentication
- Register → Get tokens
- Login → Get tokens
- Refresh → Get new access token
- Logout → Revoke token

### ✅ OTP Verification
- Send OTP → Saved in Redis
- Verify OTP → Validate from Redis
- Auto-expire → 5 minutes
- Error handling → Meaningful messages

### ✅ Security
- Token expiration
- Token signing
- CORS configuration
- Protected endpoints
- Role-based access (extensible)

### ✅ Error Handling
- 400 Bad Request (validation)
- 401 Unauthorized (auth)
- 404 Not Found (resource)
- 500 Internal Server Error (now with details)

### ✅ Debug Tools
- Health check
- User detail check
- Database test
- OTP process debug
- User list viewer

---

## What Changed from Before

### Before (500 Error)
```
POST /login → ✅ Works
GET /verify-phone → ❌ 500 Error (no error handling)
POST /refresh-token → ❌ Endpoint didn't exist
GET /user → ❌ No authentication required
```

### After (Fixed & Enhanced)
```
POST /login → ✅ Returns tokens
GET /verify-phone → ✅ Returns meaningful error
POST /refresh-token → ✅ Returns new tokens
GET /user → ✅ Requires valid token
POST /register → ✅ Returns tokens
GET /debug/health → ✅ Troubleshooting aid
```

---

## Next Steps

1. **Test the implementation**
   - Run health check
   - Register a user
   - Test OTP endpoint

2. **Integrate with frontend**
   - Copy AuthService
   - Add JwtInterceptor
   - Use in components

3. **Deploy**
   - Remove debug endpoints
   - Enable HTTPS
   - Set production configs

4. **Monitor**
   - Track token usage
   - Monitor error rates
   - Set up alerts

---

## Support

For detailed information, see:
- 📖 `JWT_REFRESH_TOKEN_IMPLEMENTATION.md` - Complete technical details
- 🐛 `TROUBLESHOOTING_VERIFY_PHONE.md` - Troubleshooting guide
- ✅ `FIX_500_ERROR_SUMMARY.md` - Error fix explanation
- 📋 `API_QUICK_REFERENCE.md` - All API endpoints
- ✔️ `IMPLEMENTATION_VERIFICATION.md` - What was implemented

---

## That's It! 🎉

You now have:
- ✅ JWT & Refresh Token authentication
- ✅ Fixed 500 error on /verify-phone
- ✅ Meaningful error messages
- ✅ Debug tools for troubleshooting
- ✅ Complete documentation
- ✅ Frontend integration code

**Happy coding!**
