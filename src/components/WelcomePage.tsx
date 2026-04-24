import { Sparkles, Heart, Brain, Zap } from 'lucide-react';

interface WelcomePageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function WelcomePage({ onLogin, onSignUp }: WelcomePageProps) {
  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'AI Care Buddy',
      description: 'Personalized emotional support'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Smart Journal',
      description: 'Track thoughts & moods'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Wellness Tools',
      description: 'Diet, games & exercises'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Progress Reports',
      description: 'Track your growth journey'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Left Side - Gradient with content (40% width on desktop) */}
      <div className="w-full md:w-2/5 bg-gradient-to-br from-purple-600 via-purple-700 to-rose-600 relative overflow-hidden">
        {/* Decorative vertical accent stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-teal-400 via-rose-400 to-purple-400"></div>
        
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-rose-300 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-teal-300 blur-2xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center min-h-screen py-12 px-8 md:px-12">
          {/* Logo */}
          <div className="mb-8">
            <svg
              width="64"
              height="64"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
              <path d="M20 28 C20 28, 18 24, 18 20 C18 16, 20 12, 20 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M18 18 C18 18, 13 17, 11 15 C9 13, 10 10, 12 11 C14 12, 17 15, 18 18" fill="white" opacity="0.9" />
              <path d="M20 22 C20 22, 25 21, 27 19 C29 17, 28 14, 26 15 C24 16, 21 19, 20 22" fill="white" opacity="0.9" />
              <path d="M20 13 C20 13, 19 11, 17.5 11 C16 11, 15 12, 15 13.5 C15 15, 17 16.5, 20 18.5 C23 16.5, 25 15, 25 13.5 C25 12, 24 11, 22.5 11 C21 11, 20 13, 20 13 Z" fill="white" opacity="0.8" />
            </svg>
          </div>

          <h1 className="text-white text-5xl md:text-6xl mb-4 font-bold">Resilio</h1>
          
          <p className="text-purple-100 text-lg md:text-xl mb-8 max-w-md leading-relaxed">
            Your comprehensive mental wellness platform for personal growth and resilience
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 glass-dark rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-white mb-1">{feature.title}</h4>
                  <p className="text-purple-200 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom info */}
          <div className="mt-auto pt-8">
            <p className="text-purple-200 text-sm">
              © {new Date().getFullYear()} Resilio. Your Mental Wellness Partner.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - White with CTA (60% width on desktop) */}
      <div className="w-full md:w-3/5 bg-gradient-to-br from-white via-purple-50/30 to-rose-50/30 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-rose-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen py-12 px-8 md:px-16">
          <div className="max-w-xl w-full">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-rose-100 rounded-full mb-6">
                <span className="text-purple-700 text-sm font-medium">Welcome to Your Journey</span>
              </div>
              
              <h2 className="text-slate-900 text-4xl md:text-5xl mb-6 font-bold">
                Begin Your Path to <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">Wellness</span>
              </h2>
              
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Join thousands of users who have transformed their mental wellness with our AI-powered platform. Track your mood, connect with your care buddy, and build healthier habits.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4 mb-12">
              <button
                onClick={onSignUp}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-rose-500 text-white text-lg rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 font-medium"
              >
                Get Started Free
              </button>
              
              <button
                onClick={onLogin}
                className="w-full px-8 py-4 bg-white text-purple-700 text-lg rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 font-medium"
              >
                Login to Account
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <p className="text-slate-600 text-sm">AI Support</p>
              </div>
              
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent mb-1">
                  100%
                </div>
                <p className="text-slate-600 text-sm">Private & Secure</p>
              </div>
              
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent mb-1">
                  6+
                </div>
                <p className="text-slate-600 text-sm">Wellness Tools</p>
              </div>
              
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent mb-1">
                  ∞
                </div>
                <p className="text-slate-600 text-sm">Possibilities</p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-slate-500 text-sm">
                Trusted by mental wellness enthusiasts worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
