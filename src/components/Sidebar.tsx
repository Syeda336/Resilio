import { useState } from 'react';
import { Home, Activity, BookOpen, Apple, Users, Gamepad2, Dumbbell, Menu, X, Moon, Sun, Settings, ChevronLeft, Trash2 } from 'lucide-react';
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
  ];

  const additionalItems = [
    { id: 'games' as const, label: 'Mini Games', icon: Gamepad2 },
    { id: 'exercises' as const, label: 'Exercises', icon: Dumbbell },
  ];

  const handleNavigate = (view: any) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const handleDeleteChat = () => {
    if (confirm("Are you sure you want to delete your Care Buddy history?")) {
      // Add your chat deletion logic here (e.g., clearing localStorage or API call)
      console.log("Chat deleted");
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-purple-600 to-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`
          w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 shadow-2xl
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 via-rose-400 to-teal-400"></div>
        
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-purple-800/50">
          <div className="flex items-center gap-3">
            <span className="text-white text-xl font-semibold">Resilio</span>
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {activeView === 'profile' ? (
            /* --- PROFILE SETTINGS VIEW --- */
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <button 
                onClick={() => handleNavigate('dashboard')}
                className="flex items-center gap-2 text-purple-300 hover:text-white mb-6 px-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Menu</span>
              </button>

              <h3 className="px-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                Settings
              </h3>

              {/* Theme Toggle Option */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Appearance</span>
                  <span className="text-[10px] text-purple-300">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
              </button>

              {/* Delete Chat Option */}
              <button
                onClick={handleDeleteChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-500/20 group"
              >
                <Trash2 className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Delete Chat</span>
                  <span className="text-[10px] text-rose-300/70">Clear Care Buddy logs</span>
                </div>
              </button>
            </div>
          ) : (
            /* --- STANDARD NAVIGATION VIEW --- */
            <>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                        isActive ? 'bg-gradient-to-r from-purple-600 to-rose-500 text-white shadow-lg shadow-purple-500/30' : 'text-purple-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full"></div>}
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-purple-800/30 space-y-2">
                {additionalItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg' : 'text-purple-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Footer Settings Button (Always visible unless in profile view) */}
        {activeView !== 'profile' && (
          <div className="px-4 py-4 border-t border-purple-800/50">
            <button
              onClick={() => handleNavigate('profile')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-200 hover:bg-white/10 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        )}

        <div className="px-6 py-4 border-t border-purple-800/50 bg-purple-900/20">
          <p className="text-purple-300 text-sm">© {new Date().getFullYear()} Resilio</p>
        </div>
      </div>
    </>
  );
}