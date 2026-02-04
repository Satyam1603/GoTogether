/**
 * Frontend Verification Utilities
 * All logic handled by backend (Redis/Memcached for OTP, JWT for email tokens)
 * Frontend just calls API endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/gotogether';

/**
 * Send Phone OTP - Generates OTP and sends via Twilio SMS
 * Backend: POST /gotogether/users/{userId}/verify-phone
 */
export const sendPhoneVerification = async (userId, phone) => {
  try {
    const formattedPhone = formatPhoneE164(phone);
    const response = await fetch(`${API_URL}/users/${userId}/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone }),
    });
    
    if (!response.ok) throw new Error('Failed to send OTP');
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Phone verification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify Phone OTP Code - Confirms the OTP code
 * Backend: POST /gotogether/users/{userId}/verify-otp
 */
export const verifyPhoneCode = async (userId, otp) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/verify-otp?otp=${otp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      return { success: true, message: 'Phone verified successfully' };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Invalid OTP' };
    }
  } catch (error) {
    console.error('Phone code verification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send Email Verification Link - Generates JWT token and sends email
 * Backend: POST /gotogether/users/{userId}/verify-email
 */
export const sendEmailVerification = async (userId, email, firstName = 'User') => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName }),
    });
    
    if (!response.ok) throw new Error('Failed to send verification email');
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify Email Token - Confirms the email verification link
 * Backend: GET /gotogether/users/verify-email-confirm?token=
 */
export const verifyEmailToken = async (token, email) => {
  try {
    const response = await fetch(`${API_URL}/users/verify-email-confirm?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      return { success: true, message: 'Email verified successfully' };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Invalid or expired token' };
    }
  } catch (error) {
    console.error('Email token verification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Resend Verification Code - Rate-limited OTP resend
 * Backend: POST /gotogether/users/{userId}/verify-phone (can be reused with rate limiting)
 */
export const resendVerificationCode = async (userId, phone) => {
  try {
    const formattedPhone = formatPhoneE164(phone);
    const response = await fetch(`${API_URL}/users/${userId}/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone }),
    });
    
    if (!response.ok) throw new Error('Failed to resend OTP');
    return { success: true, message: 'OTP resent successfully' };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Format Phone to E.164 Format (Required by Backend/Twilio)
 * Converts various formats to +1234567890
 */
export const formatPhoneE164 = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If already has country code (11+ digits for US)
  if (cleaned.length >= 11) {
    return `+${cleaned}`;
  }

  // If 10 digits (US number without country code)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Already formatted or international
  if (phone.startsWith('+')) {
    return phone;
  }

  // Default: assume US and add country code
  return `+1${cleaned}`;
};

/**
 * Format Phone for Display
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * Mask Email for Display
 */
export const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask Phone for Display
 */
export const maskPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return `****${cleaned.slice(-4)}`;
};

/**
 * Validate Email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Phone
 */
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Validate OTP Code (6 digits)
 */
export const isValidOTPCode = (code) => {
  return /^\d{6}$/.test(code);
};
