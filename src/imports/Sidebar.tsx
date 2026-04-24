import { useState } from 'react';
import { Home, Activity, BookOpen, Apple, Users, Gamepad2, Dumbbell, Menu, X, Moon, Sun, Database } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeView: 'dashboard' | 'activities' | 'journal' | 'diet' | 'care' | 'games' | 'exercises' | 'profile' | 'food-db';
  onNavigate: (view: 'dashboard' | 'activities' | 'journal' | 'diet' | 'care' | 'games' | 'exercises' | 'profile' | 'food-db') => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'activities' as const, label: 'Activities', icon: Activity },
    { id: 'journal' as const, label: 'Journal', icon: BookOpen },
    { id: 'diet' as const, label: 'Diet', icon: Apple },
    { id: 'care' as const, label: 'Care Buddy', icon: Users },
    { id: 'food-db' as const, label: 'Food Database', icon: Database }, // <-- Ye line add karein
  ];

  const additionalItems = [
    { id: 'games' as const, label: 'Mini Games', icon: Gamepad2 },
    { id: 'exercises' as const, label: 'Exercises', icon: Dumbbell },
  ];

  const handleNavigate = (view: any) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    toggleTheme();
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed at top left */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-purple-600 to-rose-500 text-white rounded-xl flex items-center justify-center hover:shadow-xl transition-all shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar with gradient and vertical accent */}
      <div
        className={`
          w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 shadow-2xl
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Decorative vertical accent stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 via-rose-400 to-teal-400"></div>
        
        {/* Logo */}
        <div className="px-6 py-6 border-b border-purple-800/50 bg-gradient-to-r from-transparent to-purple-900/20">
          <div className="flex items-center gap-3">
            {/* Custom Resilio Logo - Mind, Mood, Mental Health */}
            <div className="w-10 h-10 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer circle - representing wholeness and balance */}
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="url(#gradient1)"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Growing sprout/leaf - representing resilience and growth */}
                <path
                  d="M20 28 C20 28, 18 24, 18 20 C18 16, 20 12, 20 12"
                  stroke="url(#gradient2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                
                {/* Left leaf - representing thoughts/mind */}
                <path
                  d="M18 18 C18 18, 13 17, 11 15 C9 13, 10 10, 12 11 C14 12, 17 15, 18 18"
                  fill="url(#gradient3)"
                />
                
                {/* Right leaf - representing emotions/mood */}
                <path
                  d="M20 22 C20 22, 25 21, 27 19 C29 17, 28 14, 26 15 C24 16, 21 19, 20 22"
                  fill="url(#gradient4)"
                />
                
                {/* Heart element at top - representing care and wellness */}
                <path
                  d="M20 13 C20 13, 19 11, 17.5 11 C16 11, 15 12, 15 13.5 C15 15, 17 16.5, 20 18.5 C23 16.5, 25 15, 25 13.5 C25 12, 24 11, 22.5 11 C21 11, 20 13, 20 13 Z"
                  fill="url(#gradient5)"
                />
                
                {/* Inner glow circles - representing positive energy */}
                <circle cx="20" cy="20" r="14" fill="url(#radialGlow)" opacity="0.15" />
                
                {/* Gradients */}
                <defs>
                  {/* Outer circle gradient */}
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  
                  {/* Stem gradient */}
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                  
                  {/* Left leaf gradient */}
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  
                  {/* Right leaf gradient */}
                  <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  
                  {/* Heart gradient */}
                  <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fda4af" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                  
                  {/* Radial glow */}
                  <radialGradient id="radialGlow">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <span className="text-white text-xl font-semibold">Resilio</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-rose-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-purple-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full"></div>
                  )}
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-2">
            {additionalItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-500/30'
                      : 'text-purple-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full"></div>
                  )}
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dark/Light Mode Toggle */}
          <div className="mt-8 pt-6 border-t border-violet-800/30">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group bg-gradient-to-r from-violet-600/20 to-teal-600/20 hover:from-violet-600/30 hover:to-teal-600/30 text-violet-200 hover:text-white border border-violet-600/30"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-teal-500">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
              </div>
              <span className="font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <div className="ml-auto">
                <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  theme === 'dark' ? 'bg-violet-600' : 'bg-teal-500'
                }`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${
                    theme === 'dark' ? 'left-0.5' : 'left-6'
                  }`}></div>
                </div>
              </div>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-800/50 bg-gradient-to-r from-transparent to-purple-900/20">
          <p className="text-purple-300 text-sm">© {new Date().getFullYear()} Resilio</p>
        </div>
      </div>
    </>
  );
}