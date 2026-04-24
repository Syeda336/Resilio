import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Sparkles, Phone, KeyRound } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (name: string, email: string, token: string, id: string) => void;
  onSwitchToSignUp: () => void;
}

export function LoginPage({ onBack, onLogin, onSwitchToSignUp }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Forgot Password states
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'password'>('email');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    setIsLoading(true);

    try {
      // Call backend to sign in with Supabase Auth
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      // Try to parse response even if request failed
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, response might be HTML error page
        const textResponse = await response.text();
        console.error('Server returned non-JSON response:', textResponse);
        throw new Error('Server error - Edge Function might not be deployed. Check Supabase dashboard.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success - call onLogin with user info
      onLogin(data.user.user_metadata?.name || 'User', data.user.email, data.session.access_token, data.user.id);
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Provide more helpful error messages
      let errorMessage = err.message;
      
      // Check for specific error messages from Supabase
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = '❌ Invalid email or password.\n\n' +
          'Possible issues:\n' +
          '• Email or password is incorrect\n' +
          '• Account doesn\'t exist yet (sign up first)\n' +
          '• Typo in email or password\n\n' +
          'Try:\n' +
          '• Double-check your email and password\n' +
          '• Click "Sign up here" to create a new account\n' +
          '• Use the "Forgot Password" feature (if available)';
      } else if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        errorMessage = '❌ Cannot connect to server. Possible issues:\n\n' +
          '1. Supabase Edge Function not deployed\n' +
          '2. Network/firewall blocking connection\n' +
          '3. CORS issue\n\n' +
          'Please check:\n' +
          '• Supabase Dashboard → Edge Functions\n' +
          '• Deploy the "make-server-40d4d8fd" function\n' +
          '• Open /test-server.html to diagnose';
      }
      
      setError(errorMessage || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    
    if (resetStep === 'email') {
      // Step 1: Verify email exists
      if (!resetEmail.trim()) {
        setResetError('Please enter your email');
        return;
      }
      
      setIsLoading(true);

      try {
        // Call backend to verify email exists
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email: resetEmail.trim(),
            }),
          }
        );

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          const textResponse = await response.text();
          console.error('Server returned non-JSON response:', textResponse);
          throw new Error('Server error - Edge Function might not be deployed.');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Email verification failed');
        }

        // Email verified - move to password step
        setResetStep('password');
      } catch (err: any) {
        console.error('Email verification error:', err);
        setResetError(err.message || 'Email not found. Please check your email or sign up first.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Step 2: Set new password
      if (!newPassword) {
        setResetError('Please enter a new password');
        return;
      }

      if (newPassword.length < 6) {
        setResetError('Password must be at least 6 characters long');
        return;
      }

      if (newPassword !== confirmPassword) {
        setResetError('Passwords do not match');
        return;
      }
      
      setIsLoading(true);

      try {
        // Call backend to update password
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/update-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email: resetEmail.trim(),
              newPassword: newPassword,
            }),
          }
        );

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          const textResponse = await response.text();
          console.error('Server returned non-JSON response:', textResponse);
          throw new Error('Server error - Edge Function might not be deployed.');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Password update failed');
        }

        // Success - show success message
        setResetSuccess(true);
      } catch (err: any) {
        console.error('Password update error:', err);
        setResetError(err.message || 'Failed to update password. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Left Side - Image/Visual Panel (35% width on desktop) */}
      <div className="hidden md:block md:w-2/5 relative overflow-hidden bg-gradient-to-br from-blue-500 via-teal-600 to-violet-700">
        {/* Decorative vertical accent stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-teal-400 to-violet-300"></div>
        
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-violet-300/20 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-teal-300/20 blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-center">
          <Sparkles className="w-16 h-16 text-white mb-6" />
          <h2 className="text-white text-4xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-rose-100 text-lg leading-relaxed max-w-md">
            Continue your journey to better mental wellness and personal growth.
          </p>
          
          <div className="mt-12 space-y-4 w-full max-w-sm">
            <div className="glass-dark rounded-xl p-4 text-left">
              <div className="text-teal-300 text-sm mb-1">Daily Tracking</div>
              <div className="text-white font-medium">Monitor your progress</div>
            </div>
            <div className="glass-dark rounded-xl p-4 text-left">
              <div className="text-violet-300 text-sm mb-1">AI Support</div>
              <div className="text-white font-medium">Get personalized guidance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (65% width on desktop) */}
      <div className="w-full md:w-3/5 bg-gradient-to-br from-white via-sky-50/20 to-violet-50/20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Back Button */}
          <div className="p-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
          </div>

          {/* Form Container */}
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-slate-900 text-4xl mb-3 font-bold">
                  Login to <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">Resilio</span>
                </h1>
                <p className="text-slate-600">Access your personal wellness dashboard</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
                  <p className="text-rose-700 text-sm whitespace-pre-line">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
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

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium underline decoration-2 underline-offset-2"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600">
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToSignUp}
                    className="text-violet-600 hover:text-blue-600 font-medium underline decoration-2 underline-offset-2"
                  >
                    Sign up here
                  </button>
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-8 glass rounded-xl p-4">
                <p className="text-slate-600 text-sm text-center">
                  🔒 Your data is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetSuccess(false);
                setResetError('');
                setResetEmail('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!resetSuccess ? (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-slate-900 text-2xl font-bold mb-2">Reset Password</h2>
                  <p className="text-slate-600 text-sm">
                    {resetStep === 'email' ? 'Enter your email to verify your identity' : 'Create your new password'}
                  </p>
                </div>

                {/* Error Message */}
                {resetError && (
                  <div className="mb-4 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
                    <p className="text-rose-700 text-sm whitespace-pre-line">{resetError}</p>
                  </div>
                )}

                {/* Reset Form */}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {resetStep === 'email' ? (
                    <>
                      {/* Email Field */}
                      <div>
                        <label htmlFor="reset-email" className="block text-slate-700 mb-2 text-sm font-medium">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            id="reset-email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                            placeholder="your@email.com"
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isLoading ? 'Verifying...' : 'Continue'}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Email Display (Read-only) */}
                      <div>
                        <label className="block text-slate-700 mb-2 text-sm font-medium">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            value={resetEmail}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-slate-200 rounded-xl text-sm text-gray-600"
                            disabled
                          />
                        </div>
                      </div>

                      {/* New Password Field */}
                      <div>
                        <label htmlFor="new-password" className="block text-slate-700 mb-2 text-sm font-medium">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                            placeholder="Enter new password"
                            disabled={isLoading}
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div>
                        <label htmlFor="confirm-password" className="block text-slate-700 mb-2 text-sm font-medium">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                            placeholder="Confirm new password"
                            disabled={isLoading}
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isLoading ? 'Saving...' : 'Save New Password'}
                      </button>

                      {/* Back Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setResetStep('email');
                          setNewPassword('');
                          setConfirmPassword('');
                          setResetError('');
                        }}
                        className="w-full py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-medium hover:border-slate-300 hover:bg-slate-50 transition-all"
                        disabled={isLoading}
                      >
                        Back
                      </button>
                    </>
                  )}
                </form>

                {/* Info */}
                {resetStep === 'email' && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                    <p className="text-purple-700 text-xs text-center">
                      🔒 We'll verify your email address before allowing you to reset your password
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-slate-900 text-2xl font-bold mb-2">Password Updated!</h2>
                  <p className="text-slate-600 mb-6">
                    Your password has been successfully reset. You can now login with your new password.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSuccess(false);
                      setResetEmail('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setResetStep('email');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}