# JWT & Refresh Token Implementation Guide

## Overview
This document explains the JWT (JSON Web Token) and Refresh Token implementation in the GoTogether User Service application.

## Architecture Components

### 1. **JwtTokenProvider** (Utility Class)
- **Location**: `com.gotogether.user.util.JwtTokenProvider`
- **Responsibility**: Token generation, validation, and claims extraction
- **Key Methods**:
  - `generateAccessToken()` - Creates short-lived access tokens (1 hour)
  - `generateRefreshToken()` - Creates long-lived refresh tokens (7 days)
  - `validateToken()` - Validates token signature and expiration
  - `getEmailFromToken()` - Extracts email from token
  - `getUserIdFromToken()` - Extracts user ID from token
  - `getRoleFromToken()` - Extracts user role from token

### 2. **RefreshToken Entity**
- **Location**: `com.gotogether.user.entity.RefreshToken`
- **Database Table**: `refresh_tokens`
- **Fields**:
  - `id` - Primary key
  - `token` - The actual refresh token string
  - `userId` - References the user
  - `expiryDate` - Token expiration date
  - `revoked` - Flag to invalidate tokens (for logout)
  - `createdAt` - Creation timestamp
  - `updatedAt` - Last update timestamp

### 3. **JwtAuthenticationFilter**
- **Location**: `com.gotogether.user.filter.JwtAuthenticationFilter`
- **Responsibility**: Intercepts requests and validates JWT tokens
- **Flow**:
  1. Extracts JWT from Authorization header (Bearer token)
  2. Validates token using JwtTokenProvider
  3. Sets Spring Security authentication context
  4. Allows request to proceed if valid

### 4. **SecurityConfig**
- **Location**: `com.gotogether.user.config.SecurityConfig`
- **Responsibility**: Configures Spring Security and JWT filter
- **Features**:
  - CORS configuration
  - CSRF disabled (for stateless JWT)
  - Session creation disabled (STATELESS)
  - Integrates JwtAuthenticationFilter
  - Public endpoints definition

## API Endpoints

### Authentication Endpoints

#### 1. **User Registration**
```
POST /gotogether/users/register
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNo": "+91234567890",
  "role": "PASSENGER"
}

Response (201 Created):
{
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNo": "+91234567890",
    "role": "PASSENGER"
  },
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "message": "Account created successfully",
  "status": "SUCCESS"
}
```

#### 2. **User Login**
```
POST /gotogether/users/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "userId": 1,
  "email": "john@example.com",
  "role": "PASSENGER"
}
```

#### 3. **Refresh Access Token**
```
POST /gotogether/users/refresh-token
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "userId": 1,
  "email": "john@example.com",
  "role": "PASSENGER"
}
```

#### 4. **Revoke Refresh Token (Logout)**
```
POST /gotogether/users/{userId}/revoke-token
Content-Type: application/json
Authorization: Bearer <accessToken>

Request:
{
  "refreshToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
"Refresh token revoked successfully."
```

#### 5. **Logout**
```
POST /gotogether/users/logout
Authorization: Bearer <accessToken>

Response (200 OK):
"User logged out successfully."
```

## Frontend Usage Example (Angular/React)

### Registration
```javascript
const response = await userService.registerUser(userData);
console.log('Registration response:', response);
const { user: newUser, accessToken, refreshToken } = response.data;

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(newUser));
```

### Login
```javascript
const response = await userService.loginUser(credentials);
const { accessToken, refreshToken, user } = response.data;

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

### Making Authenticated Requests
```javascript
// Add token to every request header
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
};

const response = await fetch('/gotogether/users/{userId}', {
  method: 'GET',
  headers: headers
});
```

### Token Refresh Flow
```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    const response = await fetch('/gotogether/users/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    // Update tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data.accessToken;
  } catch (error) {
    // Refresh failed - redirect to login
    window.location.href = '/login';
  }
}
```

## Token Structure (JWT Claims)

Each JWT token contains the following claims:

```json
{
  "sub": "user@example.com",
  "userId": 1,
  "role": "PASSENGER",
  "appName": "GoTogether",
  "iat": 1645000000,
  "exp": 1645003600
}
```

### Claim Definitions:
- `sub` (subject) - User's email
- `userId` - User's ID in database
- `role` - User's role (PASSENGER, DRIVER, ADMIN)
- `appName` - Application name
- `iat` (issued at) - Token creation timestamp
- `exp` (expiration) - Token expiration timestamp

## Configuration

Add these properties to `application.properties`:

```properties
# JWT Configuration
jwt.secret=GotogetherSecretKeyForJWTTokenGenerationAndValidationPurposeOnly2025
jwt.expiration=3600000
jwt.refresh.expiration=604800000
app.name=GoTogether
```

### Configuration Parameters:
- `jwt.secret` - Secret key for signing tokens (minimum 32 characters for HS512)
- `jwt.expiration` - Access token expiration in milliseconds (default: 1 hour = 3600000)
- `jwt.refresh.expiration` - Refresh token expiration in milliseconds (default: 7 days = 604800000)
- `app.name` - Application name to include in token

## Security Best Practices

1. **Token Storage**
   - Store tokens in HttpOnly cookies (most secure)
   - OR store in localStorage with XSS protection
   - NEVER store in sessionStorage for sensitive apps

2. **Token Transmission**
   - Always use HTTPS in production
   - Send tokens in Authorization header: `Bearer <token>`
   - Never include tokens in URL parameters

3. **Secret Key**
   - Use strong, random secret key (minimum 32 characters)
   - Rotate secret keys periodically
   - Store secret in environment variables

4. **Token Validation**
   - Always validate token signature
   - Check token expiration
   - Validate user still exists and is active

5. **Refresh Token Rotation**
   - Implement refresh token rotation (new refresh token on each refresh)
   - Store refresh tokens in database
   - Revoke refresh tokens on logout

6. **Error Handling**
   - Handle expired tokens gracefully
   - Implement automatic token refresh on 401 responses
   - Clear tokens on refresh failure

## Error Responses

### Invalid Token
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired JWT token",
  "status": 401
}
```

### Refresh Token Expired
```json
{
  "error": "Unauthorized",
  "message": "Refresh token has expired",
  "status": 401
}
```

### Token Not Provided
```json
{
  "error": "Unauthorized",
  "message": "Authorization token was either not provided or invalid",
  "status": 401
}
```

## Database Schema

### refresh_tokens table
```sql
CREATE TABLE refresh_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(1000) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  expiry_date DATETIME NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_token ON refresh_tokens(token);
CREATE INDEX idx_user_id ON refresh_tokens(user_id);
```

## Testing

### Register New User
```bash
curl -X POST http://localhost:8080/gotogether/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNo": "+91234567890",
    "role": "PASSENGER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/gotogether/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:8080/gotogether/users/1 \
  -H "Authorization: Bearer <accessToken>"
```

### Refresh Token
```bash
curl -X POST http://localhost:8080/gotogether/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

## Troubleshooting

### Token Validation Fails
- Check if token has expired
- Verify token secret key matches
- Ensure token format is correct (Bearer <token>)

### Refresh Token Not Working
- Verify refresh token exists in database
- Check if refresh token is revoked
- Ensure refresh token hasn't expired

### 401 Unauthorized on Protected Endpoints
- Verify Authorization header is present
- Check if token is valid and not expired
- Ensure user still exists in database

## Future Enhancements

1. **Token Blacklist** - Implement blacklist for revoked access tokens
2. **Multi-Device Support** - Allow multiple refresh tokens per user
3. **Token Rotation Policy** - Auto-rotate tokens based on usage
4. **JTI (JWT ID)** - Add unique identifier to prevent token reuse
5. **Rate Limiting** - Limit refresh token requests per user
6. **Analytics** - Track token usage and suspicious patterns
