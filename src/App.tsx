import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Activities } from './components/Activities';
import { DiaryEditor } from './components/DiaryEditor';
import { EntriesList } from './components/EntriesList';
import { FutureSelfMessaging } from './components/FutureSelfMessaging';
import { PersonalReminders } from './components/PersonalReminders';
import { DietPlan } from './components/DietPlan';
import { MiniGames } from './components/MiniGames';
import { Exercises } from './components/Exercises';
import { CareBuddy } from './components/CareBuddy';
import { WelcomePage } from './components/WelcomePage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { ProfilePage } from './components/ProfilePage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { CacheClearBanner } from './components/CacheClearBanner';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemedApp } from './components/ThemedApp';
import { BookOpen, List, MessageSquare, Bell } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import FoodDatabase from './components/FoodDatabase';
import { ensureDatabaseReady } from './utils/autoFixDatabase';
import { autoCleanupOnce } from './utils/cleanupDiaryActivities';

type MainView = 'dashboard' | 'activities' | 'journal' | 'diet' | 'care' | 'games' | 'exercises' | 'profile' | 'food-db';
type JournalTab = 'diary' | 'entries' | 'future' | 'reminders';
type AuthView = 'welcome' | 'login' | 'signup' | 'app' | 'reset-password';

export default function App() {
  const [authView, setAuthView] = useState<AuthView>('welcome');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MainView>('dashboard');
  const [activeJournalTab, setActiveJournalTab] = useState<JournalTab>('diary');

  // Auto-fix database on app startup
  useEffect(() => {
    ensureDatabaseReady().catch(err => 
      console.error('Database auto-fix failed:', err)
    );
  }, []);

  // Error handling for WebAssembly errors (suppress them)
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('WebAssembly') || event.message?.includes('wasm')) {
        console.warn('⚠️ WebAssembly loading suppressed (non-critical):', event.message);
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason || '');
      if (reason.includes('WebAssembly') || reason.includes('wasm') || reason.includes('Network error')) {
        console.warn('⚠️ WebAssembly promise rejection suppressed (non-critical):', reason);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Load saved session on mount
  useEffect(() => {
    // Check if URL has password reset token (from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      // User clicked password reset link - show reset password page
      setAuthView('reset-password');
      return;
    }

    const savedToken = localStorage.getItem('resilio_access_token');
    const savedUserId = localStorage.getItem('resilio_user_id');
    const savedUserName = localStorage.getItem('resilio_user_name');
    const savedUserEmail = localStorage.getItem('resilio_user_email');

    if (savedToken && savedUserId && savedUserName && savedUserEmail) {
      // Validate the token with the server before restoring session
      validateAndRestoreSession(savedToken, savedUserId, savedUserName, savedUserEmail);
    }
  }, []);

  const validateAndRestoreSession = async (token: string, id: string, name: string, email: string) => {
    try {
      // Verify token is still valid by calling the user endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/user/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Token is valid, restore session
        setAccessToken(token);
        setUserId(id);
        setUserName(name);
        setUserEmail(email);
        setAuthView('app');
        loadProfileImage(token);
        console.log('✅ Session validated and restored');
      } else {
        // Token is invalid or expired, clear localStorage
        console.log('❌ Session invalid, clearing storage');
        localStorage.removeItem('resilio_access_token');
        localStorage.removeItem('resilio_user_id');
        localStorage.removeItem('resilio_user_name');
        localStorage.removeItem('resilio_user_email');
      }
    } catch (error) {
      console.error('Error validating session:', error);
      // Clear invalid session data
      localStorage.removeItem('resilio_access_token');
      localStorage.removeItem('resilio_user_id');
      localStorage.removeItem('resilio_user_name');
      localStorage.removeItem('resilio_user_email');
    }
  };

  // Load profile image from backend
  const loadProfileImage = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/user/profile-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.profileData?.profileImage) {
          setProfileImage(data.profileData.profileImage);
        } else {
          // Clear profile image if user doesn't have one
          setProfileImage(null);
        }
      } else {
        // Clear profile image on error
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      // Clear profile image on error
      setProfileImage(null);
    }
  };

  const trackLogin = async (token: string) => {
    try {
      const today = new Date().toDateString();
      const lastLoginKey = 'last_login_date';
      const lastLogin = localStorage.getItem(lastLoginKey);

      // Only track once per day
      if (lastLogin !== today) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/dashboard/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          localStorage.setItem(lastLoginKey, today);
          console.log('Login tracked for streak calculation');
        }
      }
    } catch (error) {
      console.error('Error tracking login:', error);
    }
  };

  // 📧 Auto-process scheduled emails every 1 minute (No external cron needed!)
  useEffect(() => {
    const processScheduledEmails = async () => {
      try {
        console.log('📧 Checking for scheduled emails...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails`,
          {
            method: 'GET',
            headers: {
              ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
              'X-Cron-API-Key': 'resilio-internal-trigger', // Internal trigger, not external cron
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.results && (result.results.queueSent > 0 || result.results.queueProcessed > 0)) {
            console.log(`✅ Email queue processed: ${result.results.queueSent} sent, ${result.results.queueFailed} failed`);
          }
        }
      } catch (error) {
        // Silently fail - this is a background task
        console.debug('Email processing check (background):', error);
      }
    };

    // Process emails immediately
    processScheduledEmails();

    // Then check every 1 minute (more frequent for better delivery)
    const interval = setInterval(() => {
      processScheduledEmails();
    }, 1 * 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, [accessToken, projectId]);

  const handleLogin = (name: string, email: string, token: string, id: string) => {
    setUserName(name);
    setUserEmail(email);
    setAccessToken(token);
    setUserId(id);
    setAuthView('app');
    loadProfileImage(token);
    trackLogin(token);
    // Save session to localStorage
    localStorage.setItem('resilio_access_token', token);
    localStorage.setItem('resilio_user_id', id);
    localStorage.setItem('resilio_user_name', name);
    localStorage.setItem('resilio_user_email', email);
    // Cleanup old diary activities (run once per user)
    autoCleanupOnce();
  };

  const handleSignUp = (name: string, email: string, token: string, id: string) => {
    setUserName(name);
    setUserEmail(email);
    setAccessToken(token);
    setUserId(id);
    setAuthView('app');
    loadProfileImage(token);
    trackLogin(token);
    // Save session to localStorage
    localStorage.setItem('resilio_access_token', token);
    localStorage.setItem('resilio_user_id', id);
    localStorage.setItem('resilio_user_name', name);
    localStorage.setItem('resilio_user_email', email);
  };

  const handleLogout = () => {
    setUserName('');
    setUserEmail('');
    setAccessToken('');
    setUserId('');
    setProfileImage(null);
    setAuthView('welcome');
    setActiveView('dashboard');
    // Clear session from localStorage
    localStorage.removeItem('resilio_access_token');
    localStorage.removeItem('resilio_user_id');
    localStorage.removeItem('resilio_user_name');
    localStorage.removeItem('resilio_user_email');
  };

  const handleUpdateProfile = (newName: string, newEmail: string) => {
    setUserName(newName);
    setUserEmail(newEmail);
  };

  const handleUpdateProfileImage = (newImage: string | null) => {
    setProfileImage(newImage);
  };

  const handleNavigate = (view: MainView) => {
    setActiveView(view);
  };

  // Show authentication screens
  if (authView === 'welcome') {
    return (
      <>
        
        <WelcomePage
          onLogin={() => setAuthView('login')}
          onSignUp={() => setAuthView('signup')}
        />
      </>
    );
  }

  if (authView === 'login') {
    return (
      <>
        
        <LoginPage
          onBack={() => setAuthView('welcome')}
          onLogin={handleLogin}
          onSwitchToSignUp={() => setAuthView('signup')}
        />
      </>
    );
  }

  if (authView === 'signup') {
    return (
      <>
        
        <SignUpPage
          onBack={() => setAuthView('welcome')}
          onSignUp={handleSignUp}
          onSwitchToLogin={() => setAuthView('login')}
        />
      </>
    );
  }

  if (authView === 'reset-password') {
    return (
      <>
        
        <ResetPasswordPage
          onBack={() => setAuthView('welcome')}
        />
      </>
    );
  }

  // Show main app after authentication
  return (
    <>
      <ThemeProvider>
        <ThemedApp
          userName={userName}
          userEmail={userEmail}
          userId={userId}
          accessToken={accessToken}
          profileImage={profileImage}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          onUpdateProfileImage={handleUpdateProfileImage}
        />
      </ThemeProvider>
    </>
  );
}
