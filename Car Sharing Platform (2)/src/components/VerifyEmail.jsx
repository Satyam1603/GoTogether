import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner@2.0.3';
import { verifyEmailToken } from '../Service/verificationUtils';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token or email.');
        return;
      }

      try {
        const result = await verifyEmailToken(token, email);
        
        if (result.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          toast.success('Email verified! Redirecting to login...');
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Email verification failed. The link may have expired.');
          toast.error(result.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        toast.error('Verification error');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <Loader className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                <p className="text-green-600 font-medium">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                <p className="text-red-600 font-medium">{message}</p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            {status === 'loading' && (
              <p className="text-sm text-gray-600 text-center">
                Validating your verification token...
              </p>
            )}

            {status === 'success' && (
              <p className="text-sm text-gray-600 text-center">
                You can now sign in with your credentials. You will be redirected to the login page shortly.
              </p>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The verification link may have expired or be invalid. Please try:
                </p>
                <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                  <li>Requesting a new verification email</li>
                  <li>Checking your spam folder</li>
                  <li>Signing up again with your email address</li>
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          {status !== 'loading' && (
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                variant={status === 'success' ? 'default' : 'outline'}
              >
                Go to Login
              </Button>
              
              {status === 'error' && (
                <Button
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="w-full"
                >
                  Create New Account
                </Button>
              )}
            </div>
          )}

          {/* Help Text */}
          {status === 'error' && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Need help? Contact our support team at support@gotogether.com
            </p>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
