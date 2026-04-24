import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MessageCircle, RefreshCw, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CareBuddyHistoryProps {
  userName: string;
  userId: string;
  accessToken: string;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  mood?: string;
}

interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  messages: Message[];
  detectedMood?: string;
}

interface GroupedSessions {
  [date: string]: Session[];
}

export function CareBuddyHistory({ userName, userId, accessToken, onClose }: CareBuddyHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [accessToken]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching Care Buddy conversation history...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/care-buddy/history`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log('📡 Care Buddy history response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Care Buddy history loaded:', data);
        setSessions(data.sessions || []);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch Care Buddy history:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error loading Care Buddy history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await loadHistory();
  };

  const groupSessionsByDate = (sessions: Session[]): GroupedSessions => {
    const grouped: GroupedSessions = {};
    
    sessions.forEach((session) => {
      const date = new Date(session.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    
    return grouped;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return '';
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('happy') || moodLower.includes('joy')) return '😊';
    if (moodLower.includes('sad') || moodLower.includes('down')) return '😢';
    if (moodLower.includes('angry') || moodLower.includes('frustrated')) return '😠';
    if (moodLower.includes('anxious') || moodLower.includes('worried')) return '😰';
    if (moodLower.includes('calm') || moodLower.includes('peaceful')) return '😌';
    if (moodLower.includes('excited')) return '🤗';
    return '😐';
  };

  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30 min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white px-4 md:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white text-3xl font-bold mb-1">Care Buddy History</h1>
              <p className="text-white/90 text-sm">Your conversation history with Care Buddy</p>
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
            <div className="text-slate-600 text-lg">Loading conversation history...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No conversations yet</p>
            <p className="text-slate-500 text-sm mt-2">Start chatting with Care Buddy to see your history here</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-slate-900 font-semibold text-xl">{date}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                  <span className="text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-full">
                    {dateSessions.length} {dateSessions.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                {/* Sessions for this date */}
                <div className="space-y-4">
                  {dateSessions.map((session) => (
                    <div key={session.id} className="glass rounded-2xl p-6 shadow-lg">
                      {/* Session Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-slate-900 font-semibold">Session</p>
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(session.startTime)}</span>
                              {session.endTime && (
                                <>
                                  <span>-</span>
                                  <span>{formatTime(session.endTime)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Detected Mood */}
                        {session.detectedMood && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-rose-100 to-purple-100 px-4 py-2 rounded-xl border-2 border-rose-200">
                            <span className="text-2xl">{getMoodEmoji(session.detectedMood)}</span>
                            <div className="text-right">
                              <p className="text-slate-600 text-xs font-medium uppercase tracking-wide">Mood</p>
                              <p className="text-slate-900 text-sm font-bold">{session.detectedMood}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Messages */}
                      <div className="space-y-3">
                        {session.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                                message.sender === 'user'
                                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white'
                                  : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender === 'user' ? 'text-white/70' : 'text-slate-500'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Count */}
                      <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                        <p className="text-slate-500 text-sm">
                          {session.messages.length} {session.messages.length === 1 ? 'message' : 'messages'} exchanged
                        </p>
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
