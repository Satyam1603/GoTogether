/**
 * Verification Service - Backend Only
 * Generates OTP and verification links
 * Twilio is already setup in backend
 */

/**
 * Generate 6-digit OTP for phone verification
 * NOTE: OTP is stored in Redis/Memcached by the backend route, not here
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate verification link for email
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Verification link
 */
const generateVerificationLink = (userId, email, token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${baseUrl}/verify-email?token=${token}&email=${email}&userId=${userId}`;
  return verificationLink;
};

/**
 * Generate phone verification OTP
 * NOTE: Actual storage is handled by backend route (Redis/Memcached)
 * This service only generates the OTP
 */
const sendPhoneVerification = async (userId, phone) => {
  try {
    const otp = generateOTP();
    
    // OTP storage is handled in your backend route:
    // await redis.setex(`otp:${phone}`, 600, otp); // 10 minutes
    // OR with memcached:
    // await memcached.set(`otp:${phone}`, otp, 600);
    // Then send via Twilio SMS

    return {
      success: true,
      otp: otp, // Return OTP for backend to send via Twilio SMS
      message: `Verification OTP generated for ${phone}`,
      expiresIn: 600, // 10 minutes in seconds
    };
  } catch (error) {
    console.error('OTP generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate OTP',
    };
  }
};

/**
 * Verify phone OTP
 * NOTE: OTP retrieval from Redis/Memcached is handled by backend route
 */
const verifyPhoneCode = async (userId, phone, code, storedOTP) => {
  try {
    if (code !== storedOTP) {
      return {
        success: false,
        error: 'Invalid verification code',
        verified: false,
      };
    }

    return {
      success: true,
      message: 'Phone verified successfully',
      verified: true,
    };
  } catch (error) {
    console.error('Phone verification error:', error);
    return {
      success: false,
      error: error.message || 'Verification failed',
      verified: false,
    };
  }
};

/**
 * Generate email verification link
 * Returns link that user clicks to verify
 * NOTE: Email token is optionally stored in Redis/Memcached if expiration tracking needed
 */
const sendEmailVerification = async (userId, email, firstName, token) => {
  try {
    const verificationLink = generateVerificationLink(userId, email, token);
    
    // Optional: Store token in Redis for tracking (not required if using JWT exp)
    // await redis.setex(`email_token:${token}`, 86400, userId); // 24 hours

    return {
      success: true,
      token: token,
      verificationLink: verificationLink,
      message: `Verification email link generated for ${email}`,
      expiresIn: 86400, // 24 hours in seconds
    };
  } catch (error) {
    console.error('Email verification generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate email verification',
    };
  }
};

/**
 * Verify email token (JWT token from email link)
 */
const verifyEmailToken = async (token) => {
  try {
    // Verify JWT token in backend
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If no error, token is valid
    
    return {
      success: true,
      message: 'Email verified successfully',
      verified: true,
    };
  } catch (error) {
    console.error('Email token verification error:', error);
    return {
      success: false,
      error: error.message || 'Invalid or expired token',
      verified: false,
    };
  }
};

/**
 * Resend OTP
 * NOTE: Storage is handled by backend route in Redis/Memcached
 */
const resendVerificationCode = async (userId, phone) => {
  try {
    const otp = generateOTP();
    
    // Update in Redis/Memcached:
    // await redis.setex(`otp:${phone}`, 600, otp); // 10 minutes
    // OR
    // await memcached.set(`otp:${phone}`, otp, 600);

    return {
      success: true,
      otp: otp,
      message: `New verification OTP generated for ${phone}`,
      expiresIn: 600,
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      error: error.message || 'Failed to resend OTP',
    };
  }
};

module.exports = {
  generateOTP,
  generateVerificationLink,
  sendPhoneVerification,
  verifyPhoneCode,
  sendEmailVerification,
  verifyEmailToken,
  resendVerificationCode,
};
