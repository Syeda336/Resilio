import { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { Activities } from './Activities';
import { DiaryEditor } from './DiaryEditor';
import { EntriesList } from './EntriesList';
import { FutureSelfMessaging } from './FutureSelfMessaging';
import { PersonalReminders } from './PersonalReminders';
import { DietPlan } from './DietPlan';
import { MiniGames } from './MiniGames';
import { Exercises } from './Exercises';
import { CareBuddy } from './CareBuddy';
import { ProfilePage } from './ProfilePage';
import { BookOpen, List, MessageSquare, Bell } from 'lucide-react';
import { useState } from 'react';
import FoodDatabase from './FoodDatabase'; 

type MainView = 'dashboard' | 'activities' | 'journal' | 'diet' | 'care' | 'games' | 'exercises' | 'profile' | 'food-db';
type JournalTab = 'diary' | 'entries' | 'future' | 'reminders';

interface ThemedAppProps {
  userName: string;
  userEmail: string;
  userId: string;
  accessToken: string;
  profileImage: string | null;
  onLogout: () => void;
  onUpdateProfile: (newName: string, newEmail: string) => void;
  onUpdateProfileImage: (newImage: string | null) => void;
}

export function ThemedApp({
  userName,
  userEmail,
  userId,
  accessToken,
  profileImage,
  onLogout,
  onUpdateProfile,
  onUpdateProfileImage
}: ThemedAppProps) {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<MainView>('dashboard');
  const [activeJournalTab, setActiveJournalTab] = useState<JournalTab>('diary');

  const handleNavigate = (view: MainView) => {
    setActiveView(view);
  };

  const handleUpdateName = (newName: string) => {
    onUpdateProfile(newName, userEmail);
  };

  const isDark = theme === 'dark';

  // Theme-based color classes
  const bgGradient = isDark 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50';

  return (
    <div className={`min-h-screen ${bgGradient} flex`}>
      {/* Left Sidebar */}
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />

      {/* Main Content Area - with responsive margin for sidebar */}
      <div className="flex-1 md:ml-64">
        {activeView === 'dashboard' && (
          <Dashboard 
            userName={userName} 
            profileImage={profileImage} 
            accessToken={accessToken} 
            userId={userId} 
            onOpenProfile={() => setActiveView('profile')} 
          />
        )}
        
        {activeView === 'activities' && <Activities userName={userName} userId={userId} />}
        
        {activeView === 'journal' && (
          <div className={`flex-1 min-h-screen ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
              : 'bg-gradient-to-br from-violet-50 via-white to-sky-50'
          }`}>
            {/* Journal Header with vertical accent */}
            <div className={`relative text-white py-8 px-4 md:px-8 overflow-hidden ${
              isDark
                ? 'bg-gradient-to-r from-violet-900 via-blue-900 to-teal-900'
                : 'bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500'
            }`}>
              {/* Decorative vertical stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                isDark
                  ? 'bg-gradient-to-b from-teal-600 to-blue-800'
                  : 'bg-gradient-to-b from-teal-400 to-blue-400'
              }`}></div>
              
              <div className="pl-14 md:pl-6 relative z-10">
                <h1 className="text-white mb-2">My Personal Journal</h1>
                <p className={`mb-3 ${isDark ? 'text-violet-300' : 'text-violet-100'}`}>
                  Your thoughts, your future, your memories
                </p>
                <div className="flex flex-col gap-1">
                  <span className="text-white text-sm md:text-base">User: {userName}</span>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-8 py-8">
              {/* Navigation Tabs with gradient */}
              <div className="flex gap-3 mb-8 justify-center flex-wrap">
                <button
                  onClick={() => setActiveJournalTab('diary')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                    activeJournalTab === 'diary'
                      ? isDark
                        ? 'bg-gradient-to-r from-violet-700 to-purple-800 text-white scale-105'
                        : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white scale-105'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-violet-900/50'
                        : 'bg-white text-slate-700 hover:bg-violet-50'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Diary</span>
                </button>

                <button
                  onClick={() => setActiveJournalTab('entries')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                    activeJournalTab === 'entries'
                      ? isDark
                        ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white scale-105'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white scale-105'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-teal-900/50'
                        : 'bg-white text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                  <span>Entries</span>
                </button>

                <button
                  onClick={() => setActiveJournalTab('future')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                    activeJournalTab === 'future'
                      ? isDark
                        ? 'bg-gradient-to-r from-blue-700 to-sky-800 text-white scale-105'
                        : 'bg-gradient-to-r from-blue-500 to-sky-500 text-white scale-105'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-sky-900/50'
                        : 'bg-white text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Future Self Messaging</span>
                </button>

                <button
                  onClick={() => setActiveJournalTab('reminders')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                    activeJournalTab === 'reminders'
                      ? isDark
                        ? 'bg-gradient-to-r from-violet-800 to-teal-800 text-white scale-105'
                        : 'bg-gradient-to-r from-violet-500 to-teal-500 text-white scale-105'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-gradient-to-r hover:from-violet-900/50 hover:to-teal-900/50'
                        : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-teal-50'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span>Personal Reminders</span>
                </button>
              </div>

              {/* Content Area with glass effect */}
              <div className={`rounded-2xl shadow-xl p-6 md:p-8 mb-8 ${
                isDark 
                  ? 'bg-slate-800/50 border border-slate-700'
                  : 'glass'
              }`}>
                {activeJournalTab === 'diary' && <DiaryEditor />}
                {activeJournalTab === 'entries' && <EntriesList />}
                {activeJournalTab === 'future' && <FutureSelfMessaging />}
                {activeJournalTab === 'reminders' && <PersonalReminders />}
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'diet' && <DietPlan userName={userName} userId={userId} />}
        
        {activeView === 'care' && <CareBuddy userName={userName} userId={userId} accessToken={accessToken} />}
        
        {activeView === 'games' && <MiniGames userName={userName} userId={userId} />}
        
        {activeView === 'exercises' && <Exercises userName={userName} userId={userId} />}
        
       {activeView === 'profile' && (
          <ProfilePage 
            userName={userName} 
            userEmail={userEmail} 
            userId={userId} 
            accessToken={accessToken} 
            profileImage={profileImage} 
            onClose={() => setActiveView('dashboard')} 
            onUpdateName={handleUpdateName} 
            onUpdateProfile={onUpdateProfile} 
            onUpdateProfileImage={onUpdateProfileImage} 
            onLogout={onLogout} 
          />
        )}

        
      </div>
    </div>
  );
}
