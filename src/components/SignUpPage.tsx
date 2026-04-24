import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SignUpPageProps {
  onBack: () => void;
  onSignUp: (name: string, email: string, token: string, id: string) => void;
  onSwitchToLogin: () => void;
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | '';

export function SignUpPage({ onBack, onSignUp, onSwitchToLogin }: SignUpPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('');

  // Country codes list
  const countries = [
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+1', name: 'Canada', flag: '🇨🇦' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+20', name: 'Egypt', flag: '🇪🇬' },
    { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  ];

  // Password strength checker
  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    if (!pwd) return '';
    
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    
    // Strong: Has uppercase, lowercase, numbers, special characters, and at least 8 chars
    if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough) {
      return 'strong';
    }
    
    // Medium: Has at least 3 of the criteria
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough].filter(Boolean).length;
    if (criteriaCount >= 3) {
      return 'medium';
    }
    
    // Weak: Anything else
    return 'weak';
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-slate-200';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'strong': return 'Strong password ✓';
      case 'medium': return 'Medium password';
      case 'weak': return 'Weak password';
      default: return '';
    }
  };

  const getStrengthTextColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
      default: return 'text-slate-500';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number for account recovery');
      return;
    }

    if (phoneNumber.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    // Enforce strong password
    if (passwordStrength !== 'strong') {
      setError(
        '❌ Password is not strong enough!\n\n' +
        'Your password must include:\n' +
        '• At least 8 characters\n' +
        '• Uppercase letters (A-Z)\n' +
        '• Lowercase letters (a-z)\n' +
        '• Numbers (0-9)\n' +
        '• Special characters (!@#$%^&*)\n\n' +
        'Example: Fatima#223&'
      );
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      // Call backend to create user with Supabase Auth
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            name: name.trim(),
            phone: `${countryCode}${phoneNumber}`,
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
        throw new Error(data.error || 'Sign up failed');
      }

      // Success - call onSignUp with name and email
      onSignUp(name.trim(), email.trim(), data.session.access_token, data.user.id);
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      // Provide more helpful error messages
      let errorMessage = err.message;
      
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        errorMessage = '❌ Cannot connect to server. Possible issues:\n\n' +
          '1. Supabase Edge Function not deployed\n' +
          '2. Network/firewall blocking connection\n' +
          '3. CORS issue\n\n' +
          'Please check:\n' +
          '• Supabase Dashboard → Edge Functions\n' +
          '• Deploy the "make-server-40d4d8fd" function\n' +
          '• Open /test-server.html to diagnose';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please login instead.';
      }
      
      setError(errorMessage || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse relative overflow-hidden">
      {/* Right Side - Visual Panel with benefits (40% width on desktop) */}
      <div className="hidden md:block md:w-2/5 relative overflow-hidden bg-gradient-to-br from-teal-500 via-purple-600 to-purple-700">
        {/* Decorative vertical accent stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-rose-400 to-teal-300"></div>
        
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-32 right-20 w-40 h-40 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-16 w-32 h-32 rounded-full bg-teal-300/20 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-28 h-28 rounded-full bg-rose-300/20 blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-12 py-16">
          <h2 className="text-white text-4xl font-bold mb-6">Start Your Wellness Journey</h2>
          <p className="text-teal-100 text-lg leading-relaxed mb-12">
            Join our community and unlock powerful tools for your mental health and personal growth.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">AI-Powered Support</h4>
                <p className="text-teal-100 text-sm">Get personalized guidance from your Care Buddy 24/7</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Track Your Progress</h4>
                <p className="text-teal-100 text-sm">Monitor mood, habits, and wellness metrics over time</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-rose-300" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Private & Secure</h4>
                <p className="text-teal-100 text-sm">Your data is encrypted and completely confidential</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Comprehensive Tools</h4>
                <p className="text-teal-100 text-sm">Journal, diet tracking, exercises, games, and more</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Sign Up Form (60% width on desktop) */}
      <div className="w-full md:w-3/5 bg-gradient-to-br from-white via-teal-50/20 to-purple-50/20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-teal-500 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Back Button */}
          <div className="p-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors group"
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
                  Create Your <span className="bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">Account</span>
                </h1>
                <p className="text-slate-600">Begin your journey to better mental wellness</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
                  <p className="text-rose-700 text-sm whitespace-pre-line">{error}</p>
                </div>
              )}

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label htmlFor="phone" className="block text-slate-700 mb-2">
                    Phone Number <span className="text-slate-500 text-sm">(for account recovery)</span>
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <div className="relative w-32">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full pl-3 pr-8 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors appearance-none text-sm"
                        disabled={isLoading}
                      >
                        {countries.map((country, index) => (
                          <option key={index} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Phone Number Input */}
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                        placeholder="1234567890"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">We'll use this only for account recovery and important updates</p>
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
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
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
                  <p className="text-slate-500 text-xs mt-1">Must include uppercase, lowercase, numbers & special characters</p>
                  {passwordStrength && (
                    <div className="mt-2">
                      <div className={`w-full h-2 ${getStrengthColor()} rounded-full transition-all duration-300`}></div>
                      <p className={`text-sm font-medium ${getStrengthTextColor()} mt-1`}>{getStrengthText()}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-teal-600 hover:text-teal-700 font-medium underline decoration-2 underline-offset-2"
                  >
                    Login here
                  </button>
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-8 glass rounded-xl p-4">
                <p className="text-slate-600 text-sm text-center">
                  By signing up, you agree to our Terms & Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}