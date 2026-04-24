import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MoodHistoryProps {
  userName: string;
  userId: string;
  accessToken: string;
  onClose: () => void;
}

interface WeekData {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  average: string;
  averageValue: number;
  moods: Array<{
    date: string;
    day: string;
    mood: string;
    value: number;
    emoji: string;
    color: string;
  }>;
}

export function MoodHistory({ userName, userId, accessToken, onClose }: MoodHistoryProps) {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationAttempted, setMigrationAttempted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMoodHistory();
  }, [accessToken]);

  const loadMoodHistory = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching mood history...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/mood/history`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log('📡 Mood history response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Mood history loaded:', data);
        
        // If no mood entries and migration not attempted, try migration
        if ((!data.weeks || data.weeks.length === 0) && !migrationAttempted) {
          console.log('🔄 No mood entries found, attempting migration...');
          await migrateMoodEntries();
          return; // migrateMoodEntries will reload after migration
        }
        
        setWeeks(data.weeks || []);
        setLoading(false);
        setRefreshing(false);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch mood history:', response.status, errorText);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      console.error('❌ Error loading mood history:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await loadMoodHistory();
  };

  const migrateMoodEntries = async () => {
    try {
      console.log('🚀 Starting migration...');
      setMigrationAttempted(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/mood/migrate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log('📡 Migration response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Migration completed:', data);
        // Reload mood history after migration
        setTimeout(() => {
          loadMoodHistory();
        }, 1000); // Small delay to ensure data is saved
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to migrate mood entries:', response.status, errorText);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      console.error('❌ Error migrating mood entries:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'Happy': return '😊';
      case 'Good': return '🙂';
      case 'Okay': return '😐';
      case 'Low': return '😔';
      case 'Down': return '😢';
      // default: return '😐';
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30 min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-500 via-rose-500 to-pink-500 text-white px-4 md:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white text-3xl font-bold mb-1">Mood History</h1>
              <p className="text-white/90 text-sm">Your emotional journey over time</p>
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

      {/* Content */}
      <div className="p-4 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-600 text-lg">Loading mood history...</div>
          </div>
        ) : weeks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No mood entries yet</p>
            <p className="text-slate-500 text-sm mt-2">Start tracking your moods in the diary section</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="glass rounded-2xl p-6 shadow-lg">
                {/* Week Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-rose-500 rounded-full"></div>
                    <div>
                      <h2 className="text-slate-900 text-xl font-bold">Week {week.weekNumber}</h2>
                      <p className="text-slate-600 text-sm">{week.weekStart} - {week.weekEnd}</p>
                    </div>
                  </div>
                  
                  {/* Week Average */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-rose-100 px-6 py-3 rounded-xl border-2 border-purple-200">
                    <div className="text-right">
                      <p className="text-slate-600 text-xs font-medium uppercase tracking-wide">Weekly Avg</p>
                      <p className="text-slate-900 text-lg font-bold">{week.average}</p>
                    </div>
                    <span className="text-3xl">{getMoodEmoji(week.average)}</span>
                  </div>
                </div>

                {/* Mood Entries */}
                {week.moods.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No mood entries for this week
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {week.moods.map((mood, moodIndex) => (
                      <div
                        key={moodIndex}
                        className="border-2 rounded-xl p-4 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                        style={{ borderColor: mood.color }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          
                          <div className="text-right">
                            <p className="text-slate-900 font-bold text-lg">{mood.mood}</p>
                            
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{mood.day}</span>
                          </div>
                          <p className="text-slate-500 text-xs">{mood.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}