import { useState } from 'react';
import { Car, Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

export function SignUp({ onNavigate, onSignUpSuccess }) {
  const { register, verifyEmail, verifyPhone, confirmPhoneOTP, confirmEmailVerification, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [contactMethod, setContactMethod] = useState('email'); // 'email' or 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [userId, setUserId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Prepare registration data
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: contactMethod === 'email' ? formData.email : null,
      phoneNo: contactMethod === 'phone' ? formData.phone : null,
      role: 'PASSENGER',
      paymentMethod: 'CASH',
      password: formData.password,
      verificationMethod: contactMethod,
    };

    const result = await register(userData);
    console.log('Register response:', result);
    
    if (result.success) {

      console.log(`Registration successful, proceeding to verification... +userId: ${result.userId}`);
      setUserId(result.user.id);
      
      setShowVerification(true);
      
      // Send verification based on contact method
      if (contactMethod === 'email') {
        console.log('Sending email verification...');
        console.log(`Resending email verification... ${result.user}, ${formData.email}`);
        const emailResult = await verifyEmail(result.user.id, formData.email);
        if (emailResult.success) {
          toast.success(`Verification link sent to ${formData.email}`);
        } else {
          toast.error(emailResult.error || 'Failed to send verification email');
        }
      } else {
        const phoneResult = await verifyPhone(result.user.id, formData.phone);
        if (phoneResult.success) {
          toast.success(`Verification code sent to ${formData.phone}`);
          startResendTimer();
        } else {
          toast.error(phoneResult.error || 'Failed to send verification code');
        }
      }
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(60);
    
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (!canResend || !userId) return;
    
    if (contactMethod === 'email') {
      console.log(`Resending email verification... ${userId}, ${formData.email}`);
      const emailResult = await verifyEmail(userId, formData.email);
      if (emailResult.success) {
        toast.success(`New verification link sent to ${formData.email}`);
        startResendTimer();
      } else {
        toast.error(emailResult.error || 'Failed to resend verification email');
      }
    } else {
      const phoneResult = await verifyPhone(userId, formData.phone);
      if (phoneResult.success) {
        toast.success(`New verification code sent to ${formData.phone}`);
        startResendTimer();
      } else {
        toast.error(phoneResult.error || 'Failed to resend verification code');
      }
    }
  };

  const handleVerificationCodeChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerificationCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete verification code');
      return;
    }
    
    setIsVerifying(true);
    
    const result = await confirmPhoneOTP(userId, code);
    console.log('Phone OTP verification result:', result);
    if (result.success) {
      toast.success('Phone verified successfully!');
      
      setTimeout(() => {
        console.log('Calling onSignUpSuccess with user:', result.user);
       
       var user1 =  localStorage.getItem('user');
       console.log('user1:', user1);
      const user =  JSON.parse(user1);
      //  const user = {firstName: user1.firstName, lastName: user1.lastName}
        onSignUpSuccess(user); 
        // onSignUpSuccess({
        //   // email: formData.email || null,
        //   // phone: formData.phone || null,
        //   user: {firstName: formData.firstName, lastName: formData.lastName}
        //   // name: `${formData.firstName} ${formData.lastName}`,
        //   // verified: true,
        // }
        // );
      }, 500);
    } else {
      toast.error(result.error || 'OTP verification failed');
      setIsVerifying(false);
    }
  };

  // Simulate clicking verification link (for demo purposes)
  const handleSimulateEmailVerification = async () => {
    setIsVerifying(true);
    
    const result = await confirmEmailVerification(userId, formData.email);
    
    if (result.success) {
      toast.success('Email verified successfully!');
      
      setTimeout(() => {
        onSignUpSuccess({
          email: formData.email || null,
          phone: formData.phone || null,
          name: `${formData.firstName} ${formData.lastName}`,
          verified: true,
        });
      }, 500);
    } else {
      toast.error(result.error || 'Email verification failed');
      setIsVerifying(false);
    }
  };

  // Verification Screen
  if (showVerification) {
    // Email Verification Screen (Link-based)
    if (contactMethod === 'email') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={() => setShowVerification(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </button>

            {/* Verification Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl mb-2">Check Your Email</h2>
                <p className="text-gray-600">
                  We've sent a verification link to
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {formData.email}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">What to do next:</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="font-semibold">1.</span>
                    <span>Open the email we sent you</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Click on the verification link</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">3.</span>
                    <span>You'll be automatically signed in</span>
                  </li>
                </ol>
              </div>

              {/* Simulate Verification Button (Demo Only) */}
              <div className="mb-6">
                <Button 
                  onClick={handleSimulateEmailVerification} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Simulate Email Link Click (Demo)'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Click this button to simulate clicking the verification link in your email
                </p>
              </div>

              {/* Resend Link */}
              <div className="text-center mb-6">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-blue-600 hover:underline text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>

              {/* Help Text */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Didn't receive the email?</strong>
                </p>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Wait a few minutes and check again</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Toaster */}
          <Toaster />
        </div>
      );
    }

    // Phone Verification Screen (OTP-based)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => setShowVerification(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign Up
          </button>

          {/* Verification Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-2">Verify Your Phone</h2>
              <p className="text-gray-600">
                We sent a 6-digit code to
              </p>
              <p className="font-semibold text-gray-900 mt-1">
                {formData.phone}
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label className="text-center block">Enter Verification Code</Label>
                <div className="flex gap-2 justify-center">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold"
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Resend Code */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Resend Code
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend code in {resendTimer}s
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Didn't receive the SMS? Make sure your phone number is correct or click resend.
              </p>
            </div>
          </div>
        </div>

        {/* Toaster */}
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Sign Up Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Logo className="h-8 w-8 text-white" />
               <Logo className="mb-6" />
            </div>
            <span className="text-2xl">GoTogether</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-2">Create Your Account</h2>
            <p className="text-gray-600">Join thousands of travelers sharing rides</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="firstName">First Name</Label>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact Method Selection */}
            <div className="space-y-3">
              <Label>Choose Your Contact Method</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setContactMethod('email')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    contactMethod === 'email'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Mail className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod('phone')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    contactMethod === 'phone'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Phone className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Phone</span>
                </button>
              </div>
            </div>

            {/* Email or Phone Field (based on selection) */}
            {contactMethod === 'email' ? (
              <div className="space-y-0.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500">We'll send a verification code to this email</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500">We'll send an OTP to this phone number</p>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <Lock className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex-shrink-0 mr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="flex items-center h-11 pl-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <Lock className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="flex-1 h-full px-0 border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="flex-shrink-0 mr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Password must contain:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-300'}`} />
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-300'}`} />
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-300'}`} />
                  One number
                </li>
              </ul>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending Code...' : 'Continue'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Or sign up with</span>
            </div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </Button>
          </div>

          {/* Login Link */}
          <p className="text-center mt-8 text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Toaster */}
      <Toaster />
    </div>
  );
}