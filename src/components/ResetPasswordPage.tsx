import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ResetPasswordPageProps {
  onSuccess?: () => void;
  onBack: () => void;
}

export function ResetPasswordPage({ onSuccess, onBack }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    // Extract access token from URL hash (Supabase sends it this way)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    console.log('Hash params:', { token: token?.substring(0, 20) + '...', type });
    
    if (type === 'recovery' && token) {
      setAccessToken(token);
      console.log('Valid recovery token found');
    } else {
      setTokenError(true);
      setError('Invalid or expired reset link. Please request a new password reset.');
      console.error('Invalid reset link - missing token or wrong type');
    }
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessToken) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setError(passwordValidation);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend to update password with access token
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/update-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            newPassword: newPassword,
          }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Server error - please try again later');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Success!
      setSuccess(true);
      
      // Clear URL hash to remove token from URL
      window.history.replaceState(null, '', window.location.pathname);
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30 px-4">
        <div className="w-full max-w-md">
          <div className="glass rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-slate-900 text-2xl font-bold mb-2">Invalid Reset Link</h2>
            <p className="text-slate-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={onBack}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30 px-4">
        <div className="w-full max-w-md">
          <div className="glass rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-slate-900 text-2xl font-bold mb-2">Password Reset Successful!</h2>
            <p className="text-slate-600 mb-6">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={onBack}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Left Side - Image/Visual Panel (35% width on desktop) */}
      <div className="hidden md:block md:w-2/5 relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-rose-600">
        {/* Decorative vertical accent stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-rose-400 to-violet-300"></div>
        
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-rose-300/20 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-violet-300/20 blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-center">
          <KeyRound className="w-16 h-16 text-white mb-6" />
          <h2 className="text-white text-4xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-purple-100 text-lg leading-relaxed max-w-md">
            Create a new strong password to secure your Resilio account.
          </p>
          
          <div className="mt-12 space-y-4 w-full max-w-sm">
            <div className="glass-dark rounded-xl p-4 text-left">
              <div className="text-rose-300 text-sm mb-1">Secure</div>
              <div className="text-white font-medium">End-to-end encrypted</div>
            </div>
            <div className="glass-dark rounded-xl p-4 text-left">
              <div className="text-violet-300 text-sm mb-1">Private</div>
              <div className="text-white font-medium">Your data is protected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form (65% width on desktop) */}
      <div className="w-full md:w-3/5 bg-gradient-to-br from-white via-sky-50/20 to-violet-50/20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-violet-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Form Container */}
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-slate-900 text-4xl mb-3 font-bold">
                  Set New Password
                </h1>
                <p className="text-slate-600">Enter your new password below</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
                  <p className="text-rose-700 text-sm whitespace-pre-line">{error}</p>
                </div>
              )}

              {/* Reset Password Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password Field */}
                <div>
                  <label htmlFor="newPassword" className="block text-slate-700 mb-2 font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                      placeholder="Enter new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-slate-700 mb-2 font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="glass rounded-xl p-4">
                  <p className="text-slate-700 text-sm font-medium mb-2">Password must contain:</p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-slate-400'}>
                        {newPassword.length >= 8 ? '✓' : '○'}
                      </span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-slate-400'}>
                        {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                      </span>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-slate-400'}>
                        {/[a-z]/.test(newPassword) ? '��' : '○'}
                      </span>
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-slate-400'}>
                        {/[0-9]/.test(newPassword) ? '✓' : '○'}
                      </span>
                      One number
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !accessToken}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-8 text-center">
                <button
                  onClick={onBack}
                  className="text-violet-600 hover:text-purple-600 font-medium underline decoration-2 underline-offset-2"
                >
                  Back to Login
                </button>
              </div>

              {/* Security Info */}
              <div className="mt-8 glass rounded-xl p-4">
                <p className="text-slate-600 text-sm text-center">
                  🔒 Your password is encrypted and stored securely
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}