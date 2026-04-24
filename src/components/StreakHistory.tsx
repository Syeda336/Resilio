import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Flame, CheckCircle, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface StreakHistoryProps {
  userName: string;
  userId: string;
  accessToken: string;
  onClose: () => void;
}

interface LoginDay {
  date: string;
  dayOfWeek: string;
  loggedIn: boolean;
  loginTime?: string;
  dayNumber: number;
}

interface MonthGroup {
  month: string;
  days: LoginDay[];
}

export function StreakHistory({ userName, userId, accessToken, onClose }: StreakHistoryProps) {
  const [loginDays, setLoginDays] = useState<LoginDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalLogins, setTotalLogins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStreakHistory();
  }, [accessToken]);

  const loadStreakHistory = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching streak history...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/streak/history`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log('📡 Streak history response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Streak history loaded:', data);
        setLoginDays(data.loginDays || []);
        setCurrentStreak(data.currentStreak || 0);
        setLongestStreak(data.longestStreak || 0);
        setTotalLogins(data.totalLogins || 0);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch streak history:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error loading streak history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await loadStreakHistory();
  };

  const groupByMonth = (days: LoginDay[]): MonthGroup[] => {
    const grouped: { [key: string]: LoginDay[] } = {};
    
    days.forEach((day) => {
      const date = new Date(day.date);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(day);
    });
    
    return Object.entries(grouped).map(([month, days]) => ({
      month,
      days: days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const monthGroups = groupByMonth(loginDays);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30 min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-4 md:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white text-3xl font-bold mb-1">Login Streak History</h1>
              <p className="text-white/90 text-sm">Your complete login journey</p>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-4 md:p-8 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Streak */}
          <div className="glass rounded-2xl p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Current Streak</p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 text-3xl font-bold">{currentStreak}</p>
                  <span className="text-3xl">🔥</span>
                </div>
                <p className="text-orange-600 text-sm">days strong</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="glass rounded-2xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Longest Streak</p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 text-3xl font-bold">{longestStreak}</p>
                  <span className="text-3xl">🏆</span>
                </div>
                <p className="text-purple-600 text-sm">personal best</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Logins */}
          <div className="glass rounded-2xl p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Total Logins</p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 text-3xl font-bold">{totalLogins}</p>
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-teal-600 text-sm">successful logins</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-600 text-lg">Loading streak history...</div>
          </div>
        ) : loginDays.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No login history yet</p>
            <p className="text-slate-500 text-sm mt-2">Start using the app to build your streak</p>
          </div>
        ) : (
          <div className="space-y-8">
            {monthGroups.map((group) => (
              <div key={group.month}>
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-slate-900 font-semibold text-xl">{group.month}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                  <span className="text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-full">
                    {group.days.filter(d => d.loggedIn).length} / {group.days.length} days
                  </span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.days.map((day) => (
                    <div
                      key={day.date}
                      className={`glass rounded-xl p-5 border-2 transition-all ${
                        day.loggedIn
                          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {day.loggedIn ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500" />
                          )}
                          <span className="text-slate-900 font-semibold">Day {day.dayNumber}</span>
                        </div>
                        <span className="text-2xl">
                          {day.loggedIn ? '✅' : '❌'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-slate-700 font-medium text-sm">{day.dayOfWeek}</p>
                        <p className="text-slate-600 text-xs">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {day.loginTime && (
                          <p className="text-slate-500 text-xs mt-2 pt-2 border-t border-slate-200">
                            ⏰ {new Date(day.loginTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
