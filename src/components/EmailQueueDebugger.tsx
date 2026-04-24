import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Globe } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface EmailQueueData {
  currentTime: string;
  userId: string;
  userEmail: string;
  totalEmails: number;
  dueNow: number;
  upcoming: number;
  dueEmailsDetails: any[];
  upcomingEmailsDetails: any[];
  allEmails: any[];
}

export function EmailQueueDebugger() {
  const [queueData, setQueueData] = useState<EmailQueueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // 🔥 AUTO-FETCH on component mount
  useEffect(() => {
    fetchQueueStatus();
  }, []);

  const fetchQueueStatus = async () => {
    setLoading(true);
    setError('');
    
    console.log('🔍 [EmailQueueDebugger] Fetching queue status...');
    
    try {
      const accessToken = localStorage.getItem('resilio_access_token');
      if (!accessToken) {
        console.error('❌ [EmailQueueDebugger] No access token found');
        setError('Please login first');
        return;
      }

      console.log('✅ [EmailQueueDebugger] Access token found, making request...');
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/debug/email-queue`;
      console.log('   URL:', url);

      const response = await fetch(url, { 
        headers: { Authorization: `Bearer ${accessToken}` } 
      });

      console.log('📡 [EmailQueueDebugger] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [EmailQueueDebugger] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch queue status');
      }

      const data = await response.json();
      console.log('✅ [EmailQueueDebugger] Queue data received:', {
        totalEmails: data.totalEmails,
        dueNow: data.dueNow,
        upcoming: data.upcoming,
        userEmail: data.userEmail,
      });
      
      setQueueData(data);
    } catch (err: any) {
      console.error('❌ [EmailQueueDebugger] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const manuallyProcessEmails = async () => {
    setProcessing(true);
    setError('');
    try {
      const accessToken = localStorage.getItem('resilio_access_token');
      if (!accessToken) throw new Error('No access token');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) throw new Error('Failed to process emails');

      const result = await response.json();
      await fetchQueueStatus();
      alert(`✅ Complete! Processed: ${result.processed || 0}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 🔥 NEW: Delete all pending meal emails
  const deleteAllMealEmails = async () => {
    if (!confirm('⚠️ Are you sure you want to delete ALL pending meal/diet emails?\n\nThis will remove all diet_plan and meal_plan type emails from the queue.')) {
      return;
    }
    
    setProcessing(true);
    setError('');
    try {
      const accessToken = localStorage.getItem('resilio_access_token');
      if (!accessToken) throw new Error('No access token');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/debug/delete-meal-emails`,
        { 
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` } 
        }
      );

      if (!response.ok) throw new Error('Failed to delete emails');

      const result = await response.json();
      await fetchQueueStatus();
      alert(`✅ Deleted ${result.deleted || 0} meal emails!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // UPDATED: Now shows Local Time (PKT) instead of forcing UTC
  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      sent: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      missed: 'text-orange-600 bg-orange-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Mail className="size-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Email Queue Debugger</h3>
        </div>
        <button
          onClick={fetchQueueStatus}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Refresh Status'}
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 flex items-center gap-3">
            <AlertTriangle className="size-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {queueData ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', val: queueData.totalEmails, color: 'purple' },
                { label: 'Due Now', val: queueData.dueNow, color: 'red' },
                { label: 'Upcoming', val: queueData.upcoming, color: 'blue' },
                { label: 'User', val: queueData.userEmail?.split('@')[0], color: 'gray', small: true }
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-xl border border-${stat.color}-100 bg-${stat.color}-50/50`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider text-${stat.color}-600 mb-1`}>{stat.label}</p>
                  <p className={`${stat.small ? 'text-sm' : 'text-2xl'} font-bold text-${stat.color}-900 truncate`}>{stat.val}</p>
                </div>
              ))}
            </div>

            {/* Time Synchronization Card - FIXED DISPLAY */}
            <div className="p-4 bg-slate-900 rounded-xl text-white shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="size-4" />
                  <span className="text-xs font-bold uppercase">Time Synchronization</span>
                </div>
                <span className="text-[10px] bg-blue-500 px-2 py-0.5 rounded-full font-bold">LIVE PKT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Your Local Time</p>
                  <p className="text-xl font-mono font-bold text-blue-400">
                    {formatDate(queueData.currentTime)}
                  </p>
                </div>
                <div className="md:border-l md:border-slate-800 md:pl-4">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Raw Server String (UTC)</p>
                  <p className="text-xs font-mono text-slate-300 truncate">
                    {queueData.currentTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Emails List Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">📧 Scheduled Emails</h4>
              
              {/* Due Now Emails */}
              {queueData.dueEmailsDetails && queueData.dueEmailsDetails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-red-600">⚠️ Due Now ({queueData.dueEmailsDetails.length})</p>
                  {queueData.dueEmailsDetails.map((email) => {
                    const metadata = email.metadata || {};
                    const isFoodEmail = email.email_type === 'diet_plan';
                    const isFutureMessage = email.email_type === 'future_message';
                    const isPersonalReminder = email.email_type === 'reminder';
                    const isMealPlan = email.email_type === 'meal_plan';
                    // 🔥 Check if this is a meal planner item (diet_plan with 0 calories)
                    const isMealPlannerItem = isFoodEmail && metadata.calories === 0;
                    
                    return (
                      <div key={email.id} className="p-4 border border-red-100 bg-red-50/30 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold px-2 py-1 bg-red-600 text-white rounded uppercase">Due Now</span>
                          <span className="text-xs text-slate-500 font-mono">{formatDate(email.scheduled_for)}</span>
                        </div>
                        <p className="font-bold text-slate-900">{email.subject}</p>
                        
                        {/* 🔥 MEAL PLANNER ITEM: Show meal planner details (diet_plan with 0 calories) */}
                        {isMealPlannerItem && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-amber-200">
                            <p className="text-xs text-gray-500 mb-2">🍽️ Meal Planner:</p>
                            <p className="text-sm font-semibold text-amber-700 mb-3">📋 {metadata.description || metadata.foodName || 'No meal name'}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.mealType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Meal:</span>
                                  <span className="font-semibold text-amber-600">{metadata.mealType}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Date:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                            </div>
                            {metadata.foodItems && (
                              <div className="mt-3 pt-3 border-t border-amber-200">
                                <p className="text-xs text-gray-500 mb-1">📝 Food Items:</p>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">{metadata.foodItems}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🔥 MEAL PLAN: Show meal planner details */}
                        {isMealPlan && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-amber-200">
                            <p className="text-xs text-gray-500 mb-2">🍽️ Meal Planner:</p>
                            <p className="text-sm font-semibold text-amber-700 mb-3">📋 {metadata.description || email.message_content || 'No meal name'}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.mealType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Meal:</span>
                                  <span className="font-semibold text-amber-600">{metadata.mealType}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Date:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                            </div>
                            {metadata.foodItems && (
                              <div className="mt-3 pt-3 border-t border-amber-200">
                                <p className="text-xs text-gray-500 mb-1">📝 Food Items:</p>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">{metadata.foodItems}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🔥 DIET PLAN: Show food details (ONLY if NOT a meal planner item) */}
                        {isFoodEmail && !isMealPlannerItem && metadata.foodName && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-emerald-200">
                            <p className="text-xs text-gray-500 mb-2">🍽️ Meal Details:</p>
                            <p className="text-sm font-semibold text-emerald-700 mb-3">📋 {metadata.foodName}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.mealType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Meal Type:</span>
                                  <span className="font-semibold text-emerald-600">{metadata.mealType}</span>
                                </div>
                              )}
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Date:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Time:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                              {metadata.calories && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Calories:</span>
                                  <span className="font-semibold text-orange-600">{Math.round(metadata.calories)} cal</span>
                                </div>
                              )}
                              {metadata.protein !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Protein:</span>
                                  <span className="font-semibold text-blue-600">{metadata.protein}g</span>
                                </div>
                              )}
                              {metadata.carbs !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Carbs:</span>
                                  <span className="font-semibold text-purple-600">{metadata.carbs}g</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 🔥 FUTURE MESSAGE: Show message content, day, time */}
                        {isFutureMessage && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-purple-200">
                            <p className="text-xs text-gray-500 mb-2">📨 Message Content:</p>
                            <p className="text-sm text-gray-700 italic mb-3 line-clamp-3">"{email.message_content || metadata.message || 'No message'}"</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Day:</span>
                                  <span className="font-semibold text-purple-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-purple-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 🔥 PERSONAL REMINDER: Show reminder content, day, time created */}
                        {isPersonalReminder && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-pink-200">
                            <p className="text-xs text-gray-500 mb-2">🔔 Reminder Content:</p>
                            <p className="text-sm text-gray-700 italic mb-3 line-clamp-3">"{email.message_content || metadata.message || metadata.reminder || 'No reminder text'}"</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Day:</span>
                                  <span className="font-semibold text-pink-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Time:</span>
                                  <span className="font-semibold text-pink-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-slate-600">Recipient: {email.user_email}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upcoming Emails */}
              {queueData.upcomingEmailsDetails && queueData.upcomingEmailsDetails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-600">📅 Upcoming ({queueData.upcomingEmailsDetails.length})</p>
                  {queueData.upcomingEmailsDetails.map((email) => {
                    const metadata = email.metadata || {};
                    const isFoodEmail = email.type === 'diet_plan';
                    const isFutureMessage = email.type === 'future_message';
                    const isPersonalReminder = email.type === 'reminder';
                    const isMealPlan = email.type === 'meal_plan';
                    // 🔥 Check if this is a meal planner item (diet_plan with 0 calories)
                    const isMealPlannerItem = isFoodEmail && metadata.calories === 0;
                    
                    return (
                      <div key={email.id} className="p-4 border border-blue-100 bg-blue-50/30 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold px-2 py-1 bg-blue-600 text-white rounded uppercase">{email.type}</span>
                          <span className="text-xs text-slate-500 font-mono">{formatDate(email.scheduledFor)}</span>
                        </div>
                        <p className="font-bold text-slate-900">{email.subject}</p>
                        
                        {/* 🔥 MEAL PLANNER ITEM: Show meal planner details (diet_plan with 0 calories) */}
                        {isMealPlannerItem && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-amber-200">
                            <p className="text-xs text-gray-500 mb-2">🍽️ Meal Planner:</p>
                            <p className="text-sm font-semibold text-amber-700 mb-3">📋 {metadata.description || metadata.foodName || 'No meal name'}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.mealType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Meal:</span>
                                  <span className="font-semibold text-amber-600">{metadata.mealType}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Date:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                            </div>
                            {metadata.foodItems && (
                              <div className="mt-3 pt-3 border-t border-amber-200">
                                <p className="text-xs text-gray-500 mb-1">📝 Food Items:</p>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">{metadata.foodItems}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🔥 MEAL PLAN: Show meal planner details */}
                        {isMealPlan && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-amber-200">
                            <p className="text-xs text-gray-500 mb-2">🍽️ Meal Planner:</p>
                            <p className="text-sm font-semibold text-amber-700 mb-3">📋 {metadata.description || email.messageContent || 'No meal name'}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.mealType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Meal:</span>
                                  <span className="font-semibold text-amber-600">{metadata.mealType}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Date:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                            </div>
                            {metadata.foodItems && (
                              <div className="mt-3 pt-3 border-t border-amber-200">
                                <p className="text-xs text-gray-500 mb-1">📝 Food Items:</p>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">{metadata.foodItems}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🔥 DIET PLAN: Show food details (ONLY if NOT a meal planner item) */}
                        {isFoodEmail && !isMealPlannerItem && metadata.foodName && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-emerald-200">
                            <p className="text-xs text-gray-500 mb-2">🍽️ Meal Details:</p>
                            <p className="text-sm font-semibold text-emerald-700 mb-3">📋 {metadata.foodName}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.mealType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Meal Type:</span>
                                  <span className="font-semibold text-emerald-600">{metadata.mealType}</span>
                                </div>
                              )}
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Date:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Time:</span>
                                  <span className="font-semibold text-blue-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                              {metadata.calories && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Calories:</span>
                                  <span className="font-semibold text-orange-600">{Math.round(metadata.calories)} cal</span>
                                </div>
                              )}
                              {metadata.protein !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Protein:</span>
                                  <span className="font-semibold text-blue-600">{metadata.protein}g</span>
                                </div>
                              )}
                              {metadata.carbs !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Carbs:</span>
                                  <span className="font-semibold text-purple-600">{metadata.carbs}g</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 🔥 FUTURE MESSAGE: Show message content, day, time */}
                        {isFutureMessage && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-purple-200">
                            <p className="text-xs text-gray-500 mb-2">📨 Message Content:</p>
                            <p className="text-sm text-gray-700 italic mb-3 line-clamp-3">"{email.messageContent || metadata.message || 'No message'}"</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Day:</span>
                                  <span className="font-semibold text-purple-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-purple-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 🔥 PERSONAL REMINDER: Show reminder content, day, time */}
                        {isPersonalReminder && (
                          <div className="mt-2 p-3 bg-white/60 rounded-lg border border-pink-200">
                            <p className="text-xs text-gray-500 mb-2">🔔 Reminder Content:</p>
                            <p className="text-sm text-gray-700 italic mb-3 line-clamp-3">"{email.messageContent || metadata.message || metadata.reminder || 'No reminder text'}"</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {metadata.scheduledDate && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Scheduled Day:</span>
                                  <span className="font-semibold text-pink-600">{metadata.scheduledDate}</span>
                                </div>
                              )}
                              {metadata.scheduledTime && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-pink-600">{metadata.scheduledTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-slate-600">In {email.minutesUntil} minutes</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* All Emails */}
              {queueData.allEmails && queueData.allEmails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600">📋 All Emails ({queueData.allEmails.length})</p>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {queueData.allEmails.map((email: any) => (
                      <div key={email.id} className={`p-3 border rounded-lg ${
                        email.status === 'sent' ? 'border-green-100 bg-green-50/30' :
                        email.status === 'failed' ? 'border-red-100 bg-red-50/30' :
                        email.status === 'pending' ? 'border-yellow-100 bg-yellow-50/30' :
                        email.status === 'missed' ? 'border-orange-100 bg-orange-50/30' :
                        'border-gray-100 bg-gray-50/30'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${getStatusColor(email.status)}`}>
                            {email.status}
                          </span>
                          <span className="text-[10px] text-slate-500">{email.email_type}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{email.subject}</p>
                        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                          <span>📅 {formatDate(email.scheduled_for)}</span>
                          {email.sent_at && <span>✅ Sent: {formatDate(email.sent_at)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!queueData.allEmails || queueData.allEmails.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="size-12 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No emails in queue</p>
                  <p className="text-xs">Schedule some emails to see them here!</p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={manuallyProcessEmails}
                disabled={processing}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className={`size-5 ${processing ? 'animate-pulse' : ''}`} />
                {processing ? 'Processing Scheduled Tasks...' : 'Trigger Manual Email Check'}
              </button>
              <button
                onClick={deleteAllMealEmails}
                disabled={processing}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <XCircle className={`size-5 ${processing ? 'animate-pulse' : ''}`} />
                {processing ? 'Deleting...' : 'Delete All Meal Emails'}
              </button>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <Mail className="size-12 mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No data fetched yet.</p>
              <p className="text-xs text-slate-400">Click refresh to sync with Supabase</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}