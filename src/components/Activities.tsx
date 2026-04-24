import { useState, useEffect } from 'react';
import { Activity, getRecentActivities, getActivityHistory } from '../utils/activityTracker';
import { Clock, History, BookOpen, Apple, Users, Gamepad2, Dumbbell, RefreshCw, TrendingUp } from 'lucide-react';
import { dashboardRefresh } from '../utils/dashboardRefresh';

interface ActivitiesProps {
  userName: string;
  userId: string;
}

export function Activities({ userName, userId }: ActivitiesProps) {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recent' | 'history'>('recent');

  useEffect(() => {
    loadActivities();
    
    // Subscribe to dashboard refresh events
    const unsubscribe = dashboardRefresh.subscribe(() => {
      console.log('🔄 Activities received refresh event');
      loadActivities();
    });
    
    const interval = setInterval(() => {
      loadActivities();
    }, 30000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const [recent, history] = await Promise.all([
        getRecentActivities(),
        getActivityHistory(),
      ]);
      
      // Remove duplicates based on activity ID using Map
      const uniqueRecent = Array.from(
        new Map(recent.map(activity => [activity.id, activity])).values()
      );
      const uniqueHistory = Array.from(
        new Map(history.map(activity => [activity.id, activity])).values()
      );
      
      setRecentActivities(uniqueRecent);
      setActivityHistory(uniqueHistory);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'diet':
        return <Apple className="w-5 h-5 text-teal-600" />;
      case 'journal':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'care_buddy':
        return <Users className="w-5 h-5 text-rose-600" />;
      case 'game':
        return <Gamepad2 className="w-5 h-5 text-orange-500" />;
      case 'exercise':
        return <Dumbbell className="w-5 h-5 text-indigo-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'diet':
        return 'border-l-4 border-teal-500 bg-gradient-to-r from-teal-50 to-white';
      case 'journal':
        return 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white';
      case 'care_buddy':
        return 'border-l-4 border-rose-500 bg-gradient-to-r from-rose-50 to-white';
      case 'game':
        return 'border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white';
      case 'exercise':
        return 'border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-white';
      default:
        return 'border-l-4 border-slate-500 bg-gradient-to-r from-slate-50 to-white';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const renderActivityList = (activities: Activity[]) => {
    if (activities.length === 0) {
      return (
        <div className="text-center py-16 glass rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-rose-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-slate-600">No activities recorded yet</p>
          <p className="text-slate-500 text-sm mt-2">Start using the app to see your activities here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id || index}
            className={`p-5 rounded-xl ${getActivityColor(activity.type)} shadow-sm hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-slate-900 font-medium">{activity.action}</h3>
                  <span className="text-slate-500 text-sm whitespace-nowrap bg-white px-3 py-1 rounded-lg shadow-sm">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{activity.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const groupActivitiesByDate = (activities: Activity[]) => {
    const grouped: { [key: string]: Activity[] } = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    
    return grouped;
  };

  const renderHistory = () => {
    if (activityHistory.length === 0) {
      return (
        <div className="text-center py-16 glass rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-rose-100 flex items-center justify-center">
            <History className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-slate-600">No activity history available</p>
          <p className="text-slate-500 text-sm mt-2">Your past activities will appear here</p>
        </div>
      );
    }

    const grouped = groupActivitiesByDate(activityHistory);

    return (
      <div className="space-y-8">
        {Object.entries(grouped).map(([date, activities]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-rose-500 rounded-full"></div>
              <h3 className="text-slate-900 font-semibold">{date}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
              <span className="text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-full">
                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
              </span>
            </div>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className={`p-5 rounded-xl ${getActivityColor(activity.type)} shadow-sm hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-900 font-medium mb-1">{activity.action}</h4>
                      <p className="text-slate-600 text-sm mb-2">{activity.details}</p>
                      <span className="text-slate-500 text-xs bg-white px-2 py-1 rounded inline-block">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-teal-50/30 to-violet-50/30 min-h-screen">
      {/* Header with grid pattern and vertical accent */}
      <div className="relative bg-gradient-to-r from-teal-600 via-blue-600 to-violet-600 text-white px-4 md:px-8 py-8 overflow-hidden">
        {/* Decorative vertical stripe on right */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-violet-400 to-teal-300"></div>
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 pl-14 md:pl-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-white" />
            <h1 className="text-white">Activities</h1>
          </div>
          <p className="text-teal-100 mb-3">Track your daily activities and view your history</p>
          <div className="flex flex-col gap-1">
            <span className="text-white text-sm md:text-base">User: {userName}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation with modern design */}
      <div className="sticky top-0 z-30 glass border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
              activeTab === 'recent'
                ? 'bg-gradient-to-r from-teal-600 to-purple-600 text-white scale-105'
                : 'bg-white text-slate-700 hover:bg-teal-50'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Last 24 Hours</span>
            {recentActivities.length > 0 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === 'recent'
                  ? 'bg-white/20 text-white'
                  : 'bg-teal-100 text-teal-700'
              }`}>
                {recentActivities.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white scale-105'
                : 'bg-white text-slate-700 hover:bg-purple-50'
            }`}
          >
            <History className="w-5 h-5" />
            <span>History</span>
            {activityHistory.length > 0 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === 'history'
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {activityHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={loadActivities}
            className="ml-auto px-6 py-3 rounded-xl bg-white text-slate-700 border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Content with vertical accent bar */}
      <div className="p-4 md:p-8 relative">
        {/* Decorative vertical bar on left side */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 via-purple-500 to-rose-500 hidden md:block"></div>
        
        <div className="md:pl-8">
          {loading ? (
            <div className="text-center py-16 glass rounded-2xl">
              <div className="inline-block w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading activities...</p>
            </div>
          ) : (
            <>
              {activeTab === 'recent' && renderActivityList(recentActivities)}
              {activeTab === 'history' && renderHistory()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}