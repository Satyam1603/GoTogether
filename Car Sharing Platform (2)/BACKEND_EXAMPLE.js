/**
 * COMPLETE BACKEND EXAMPLE
 * User Routes with Twilio Verification
 * 
 * This is a complete example showing how to implement
 * the verification routes in your Express backend
 */

const express = require('express');
const router = express.Router();
const twilioService = require('../services/twilioVerificationService');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');

// ============================================
// PHONE VERIFICATION ROUTES
// ============================================

/**
 * POST /users/:userId/verify-phone
 * Send phone verification code via SMS
 */
router.post('/users/:userId/verify-phone', async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone } = req.body;

    // Validate input
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Format phone to E.164 format
    const formattedPhone = formatPhoneE164(phone);

    // Send SMS via Twilio Verify
    const result = await twilioService.sendPhoneVerification(formattedPhone);

    if (result.success) {
      res.json({
        success: true,
        message: `Verification code sent to ${phone}`,
        sid: result.sid,
        status: result.status,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to send verification code',
      });
    }
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /users/:userId/verify-phone-code
 * Verify phone number with OTP code
 */
router.post('/users/:userId/verify-phone-code', async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone, code } = req.body;

    // Validate input
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and verification code are required',
      });
    }

    // Format phone to E.164 format
    const formattedPhone = formatPhoneE164(phone);

    // Verify code with Twilio
    const result = await twilioService.verifyPhoneCode(formattedPhone, code);

    if (result.success && result.verified) {
      // Update user in database
      const user = await User.findByIdAndUpdate(
        userId,
        {
          phoneVerified: true,
          phone: phone,
          verifiedAt: new Date(),
        },
        { new: true }
      );

      // Clean up verification codes
      await VerificationCode.deleteMany({
        userId,
        type: 'phone',
      });

      res.json({
        success: true,
        verified: true,
        message: 'Phone verified successfully',
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        message: result.error || 'Invalid verification code',
      });
    }
  } catch (error) {
    console.error('Phone verification check error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// ============================================
// EMAIL VERIFICATION ROUTES
// ============================================

/**
 * POST /users/:userId/verify-email
 * Send email verification code
 */
router.post('/users/:userId/verify-email', async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, firstName } = req.body;

    // Validate input
    if (!email || !firstName) {
      return res.status(400).json({
        success: false,
        message: 'Email and first name are required',
      });
    }

    // Send verification code via SendGrid
    const result = await twilioService.sendEmailVerification(email, firstName);

    if (result.success) {
      // Store verification code in database
      await VerificationCode.create({
        userId,
        email,
        code: result.verificationCode,
        type: 'email',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      res.json({
        success: true,
        message: `Verification code sent to ${email}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to send email verification',
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /users/:userId/verify-email-code
 * Verify email with code
 */
router.post('/users/:userId/verify-email-code', async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required',
      });
    }

    // Get stored verification code
    const verification = await VerificationCode.findOne({
      userId,
      email,
      code,
      type: 'email',
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid or expired verification code',
      });
    }

    // Update user in database
    const user = await User.findByIdAndUpdate(
      userId,
      {
        emailVerified: true,
        email: email,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    // Delete used verification code
    await VerificationCode.deleteOne({ _id: verification._id });

    res.json({
      success: true,
      verified: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// ============================================
// RESEND VERIFICATION ROUTES
// ============================================

/**
 * POST /users/:userId/resend-verification
 * Resend verification code
 */
router.post('/users/:userId/resend-verification', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contact, type, firstName } = req.body; // type: 'sms', 'email'

    // Validate input
    if (!contact || !type) {
      return res.status(400).json({
        success: false,
        message: 'Contact and type are required',
      });
    }

    // Rate limiting: Check if user has requested too many codes recently
    const recentRequests = await VerificationCode.countDocuments({
      userId,
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
    });

    if (recentRequests >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification requests. Please try again later.',
      });
    }

    if (type === 'email') {
      const result = await twilioService.sendEmailVerification(contact, firstName);

      if (result.success) {
        // Store new code
        await VerificationCode.create({
          userId,
          email: contact,
          code: result.verificationCode,
          type: 'email',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        res.json({
          success: true,
          message: `New verification code sent to ${contact}`,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } else if (type === 'sms' || type === 'call') {
      const formattedPhone = formatPhoneE164(contact);
      const result = await twilioService.resendVerificationCode(
        formattedPhone,
        type
      );

      if (result.success) {
        res.json({
          success: true,
          message: `Verification code resent via ${type}`,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid verification type',
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Format phone number to E.164 format
 * Required by Twilio Verify API
 * Examples:
 *   (555) 123-4567 → +15551234567
 *   +1 555 123 4567 → +15551234567
 *   555-123-4567 → +15551234567
 */
function formatPhoneE164(phone) {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    // US number without country code
    return `+1${cleaned}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    // US number with country code
    return `+${cleaned}`;
  }

  if (cleaned.length >= 11) {
    // International number
    return `+${cleaned}`;
  }

  // Return original if can't format
  return phone;
}

module.exports = router;

/**
 * EXAMPLE USAGE IN YOUR SERVER:
 * 
 * const express = require('express');
 * const userRoutes = require('./routes/userRoutes');
 * 
 * const app = express();
 * app.use(express.json());
 * app.use('/user', userRoutes);
 * 
 * app.listen(5000, () => {
 *   console.log('Server running on port 5000');
 * });
 */

/**
 * DATABASE SCHEMA EXAMPLES:
 * 
 * // User Model
 * {
 *   _id: ObjectId,
 *   firstName: String,
 *   lastName: String,
 *   email: String,
 *   emailVerified: Boolean,
 *   phone: String,
 *   phoneVerified: Boolean,
 *   password: String,
 *   createdAt: Date,
 *   verifiedAt: Date,
 * }
 * 
 * // VerificationCode Model
 * {
 *   _id: ObjectId,
 *   userId: ObjectId,
 *   email: String,
 *   code: String,
 *   type: String, // 'email' or 'phone'
 *   expiresAt: Date,
 *   createdAt: Date,
 * }
 */
