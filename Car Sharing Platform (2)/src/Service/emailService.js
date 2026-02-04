/**
 * Email Service Configuration and Implementation Guide
 * For Node.js Backend (Express)
 * 
 * Install required packages:
 * npm install nodemailer dotenv
 */

// emailService.js (Backend)
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App password for Gmail
  },
  // Alternative for other providers:
  // host: process.env.SMTP_HOST,
  // port: process.env.SMTP_PORT,
  // secure: true,
  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASS,
  // },
});

/**
 * Send Email Verification Link
 */
const sendEmailVerification = async (email, firstName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@gotogether.com',
    to: email,
    subject: 'Verify Your Email - GoTogether',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #3b82f6, #2563eb); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">GoTogether</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0;">Car Sharing Platform</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome to GoTogether, ${firstName}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for signing up. Please verify your email address to complete your account setup.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link in your browser:<br/>
            <a href="${verificationUrl}" style="color: #3b82f6;">${verificationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This link will expire in 24 hours. If you didn't sign up for GoTogether, please ignore this email.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">© 2026 GoTogether. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Welcome to GoTogether, ${firstName}!
      
      Please verify your email address by clicking this link:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't sign up for GoTogether, please ignore this email.
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Phone OTP
 */
const sendPhoneOTP = async (phone, otp) => {
  // For SMS, use services like Twilio, AWS SNS, or Nexmo
  // Example with Twilio:
  
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  return client.messages.create({
    body: `Your GoTogether verification code is: ${otp}. This code will expire in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@gotogether.com',
    to: email,
    subject: 'Reset Your Password - GoTogether',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #3b82f6, #2563eb); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">GoTogether</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${firstName},<br/>
            We received a request to reset your password. Click the link below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@gotogether.com',
    to: email,
    subject: 'Welcome to GoTogether!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #3b82f6, #2563eb); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to GoTogether!</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0;">Start your journey today</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Your account has been successfully created! You're now part of a community of millions of travelers sharing rides and saving money.
          </p>
          
          <h3 style="color: #1f2937;">Getting Started:</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>Complete your profile for better matches</li>
            <li>Verify your phone number for security</li>
            <li>Search for rides or offer a ride</li>
            <li>Rate and review your fellow travelers</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmailVerification,
  sendPhoneOTP,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  transporter,
};

/**
 * Backend Routes Implementation
 * 
 * POST /user/users (Registration)
 * - Create user
 * - Send verification email
 * 
 * POST /user/users/:userId/verify-email
 * - Validate email
 * - Send verification link
 * 
 * POST /user/users/:userId/verify-phone
 * - Generate OTP
 * - Send SMS via Twilio
 * 
 * .env File Configuration:
 * 
 * EMAIL_USER=your-email@gmail.com
 * EMAIL_PASSWORD=your-app-password
 * EMAIL_FROM=noreply@gotogether.com
 * 
 * TWILIO_ACCOUNT_SID=your-twilio-account-sid
 * TWILIO_AUTH_TOKEN=your-twilio-auth-token
 * TWILIO_PHONE_NUMBER=+1234567890
 * 
 * FRONTEND_URL=http://localhost:5173
 * 
 */
