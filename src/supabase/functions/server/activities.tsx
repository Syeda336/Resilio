import { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { getUser } from './auth.tsx';
import { createClient } from 'npm:@supabase/supabase-js';

const ACTIVITIES_PREFIX = 'activity:';

interface Activity {
  id: string;
  userId: string;  // Add userId to track which user performed the activity
  type: string;
  action: string;
  details: string;
  timestamp: string;
}

// Helper to generate activity ID
function generateActivityId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to check if timestamp is within 24 hours
function isWithin24Hours(timestamp: string): boolean {
  const activityDate = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - activityDate.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours <= 24;
}

// Helper to check if timestamp is within 12 hours
function isWithin12Hours(timestamp: string): boolean {
  const activityDate = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - activityDate.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours <= 12;
}

// Log a new activity
export async function logActivity(c: Context) {
  try {
    const body = await c.req.json();
    const { userId, type, action, details, timestamp } = body;

    if (!userId || !type || !action || !details || !timestamp) {
      return c.json({ error: 'Missing required fields: userId, type, action, details, timestamp' }, 400);
    }

    const id = generateActivityId();
    const activity: Activity = {
      id,
      userId,  // Store the userId with the activity
      type,
      action,
      details,
      timestamp,
    };

    const key = `${ACTIVITIES_PREFIX}${userId}:${id}`;  // Include userId in key for better querying
    await kv.set(key, activity);

    console.log(`Activity logged for user ${userId}: ${type} - ${action}`);
    return c.json({ success: true, id });
  } catch (error) {
    console.error('Error logging activity:', error);
    return c.json({ error: 'Failed to log activity' }, 500);
  }
}

// Get activities from last 24 hours
export async function getRecentActivities(c: Context) {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const result = await getUser(accessToken);
    const userId = result.user?.id;
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch diary entries from Supabase diary_entries table
    console.log(`📖 Fetching diary entries from diary_entries table for recent activities`);
    const { data: diaryEntriesData, error: diaryError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (diaryError) {
      console.error('Error fetching diary entries from diary_entries table:', diaryError);
    }
    
    const diaryEntries = diaryEntriesData || [];

    // Fetch all other activity types from Deno KV store for this specific user
    const [activities, gameSessions, exerciseSessions, dietItems, futureMessages, reminders] = await Promise.all([
      kv.getByPrefix(`${ACTIVITIES_PREFIX}${userId}:`),  // Filter by userId
      kv.getByPrefix('game_session_'),
      kv.getByPrefix('exercise_session_'),
      kv.getByPrefix('diet_item_'),
      kv.getByPrefix('future_message_'),
      kv.getByPrefix('reminder_'),
    ]);
    
    // Convert game sessions to activities (filter by userId)
    const gameActivities = gameSessions
      .filter((session: any) => session.userId === userId)
      .map((session: any) => ({
        id: session.id,
        userId: session.userId,
        type: 'game',
        action: session.completedAt ? 'Completed Game' : 'Started Game',
        details: `${session.gameName}${session.score ? ` - Score: ${session.score}` : ''}${session.duration ? ` - Duration: ${Math.floor(session.duration / 60)}m` : ''}`,
        timestamp: session.completedAt || session.startedAt,
      }));

    // Convert exercise sessions to activities (filter by userId)
    const exerciseActivities = exerciseSessions
      .filter((session: any) => session.userId === userId)
      .map((session: any) => ({
        id: session.id,
        userId: session.userId,
        type: 'exercise',
        action: session.completed ? 'Completed Exercise' : 'Started Exercise',
        details: `${session.exerciseName}${session.duration ? ` (${session.duration})` : ''}${session.difficulty ? ` - ${session.difficulty}` : ''}`,
        timestamp: session.completedAt || session.startedAt,
      }));

    // Convert diary entries to activities (already filtered by userId)
    const diaryActivitiesFromTable = diaryEntries
      .map((entry: any) => {
        let timestamp;
        try {
          // Use created_at from table, or create from date and time
          if (entry.created_at) {
            timestamp = entry.created_at;
          } else if (entry.date && entry.time) {
            timestamp = new Date(`${entry.date} ${entry.time}`).toISOString();
          } else if (entry.date) {
            timestamp = new Date(entry.date).toISOString();
          } else {
            timestamp = new Date().toISOString();
          }
        } catch (e) {
          // Fallback to current time if date parsing fails
          timestamp = new Date().toISOString();
        }
        
        return {
          id: entry.id,
          userId: entry.user_id, // Use user_id from table
          type: 'journal',
          action: 'Diary Entry Saved',
          details: `${entry.mood ? `Mood: ${entry.mood}` : 'Personal reflection'}`,
          timestamp,
          sourceId: entry.id,
          date: entry.date,
          time: entry.time,
        };
      });

    // Convert diet items to activities (filter by userId)
    const dietActivities = dietItems
      .filter((item: any) => item.userId === userId)
      .map((item: any) => ({
        id: item.id,
        userId: item.userId,
        type: 'diet',
        action: item.mealType ? `${item.mealType} Plan` : 'Diet Item Added',
        details: `${item.name || item.description || 'Diet item'}${item.scheduledTime ? ` at ${item.scheduledTime}` : ''}`,
        timestamp: item.createdAt,
      }));

    // Convert future messages to activities (filter by userId)
    const futureMessageActivities = futureMessages
      .filter((message: any) => message.userId === userId)
      .map((message: any) => {
        const timestamp = message.createdAt || message.created || new Date().toISOString();
        return {
          id: message.id,
          userId: message.userId,
          type: 'journal',
          action: 'Future Message Scheduled',
          details: `Message to future self - scheduled for ${message.scheduledDate} at ${message.scheduledTime}`,
          timestamp,
        };
      });

    // Convert reminders to activities (filter by userId)
    const reminderActivities = reminders
      .filter((reminder: any) => reminder.userId === userId)
      .map((reminder: any) => {
        const timestamp = reminder.createdAt || reminder.created || new Date().toISOString();
        return {
          id: reminder.id,
          userId: reminder.userId,
          type: 'journal',
          action: reminder.completed ? 'Completed Reminder' : 'Reminder Created',
          details: `${reminder.task} - ${reminder.date} at ${reminder.time}`,
          timestamp,
        };
      });

    // Merge all activities
    const allActivities = [...activities, ...gameActivities, ...exerciseActivities, ...diaryActivitiesFromTable, ...dietActivities, ...futureMessageActivities, ...reminderActivities];
    
    // Remove duplicates based on ID (use Set)
    const uniqueActivities = Array.from(
      new Map(allActivities.map(activity => [activity.id, activity])).values()
    );
    
    // Filter activities within 24 hours for recent
    const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const recentActivities = uniqueActivities
      .filter((activity: Activity) => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= twentyFourHoursAgo;
      })
      .sort((a: Activity, b: Activity) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    console.log(`Fetched ${recentActivities.length} recent activities (last 24 hours) for user ${userId} (including ${diaryActivitiesFromTable.length} diary entries from table)`);
    return c.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return c.json({ error: 'Failed to fetch recent activities' }, 500);
  }
}

// Get activity history (last 30 days, excluding last 24 hours)
export async function getActivityHistory(c: Context) {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const result = await getUser(accessToken);
    const userId = result.user?.id;
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch diary entries from Supabase diary_entries table
    console.log(`📖 Fetching diary entries from diary_entries table for history`);
    const { data: diaryEntriesData, error: diaryError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (diaryError) {
      console.error('Error fetching diary entries from diary_entries table:', diaryError);
    }
    
    const diaryEntries = diaryEntriesData || [];

    // Fetch all other activity types from Deno KV store for this specific user
    const [activities, gameSessions, exerciseSessions, dietItems, futureMessages, reminders] = await Promise.all([
      kv.getByPrefix(`${ACTIVITIES_PREFIX}${userId}:`),  // Filter by userId
      kv.getByPrefix('game_session_'),
      kv.getByPrefix('exercise_session_'),
      kv.getByPrefix('diet_item_'),
      kv.getByPrefix('future_message_'),
      kv.getByPrefix('reminder_'),
    ]);
    
    // Convert game sessions to activities (filter by userId)
    const gameActivities = gameSessions
      .filter((session: any) => session.userId === userId)
      .map((session: any) => ({
        id: session.id,
        userId: session.userId,
        type: 'game',
        action: session.completedAt ? 'Completed Game' : 'Started Game',
        details: `${session.gameName}${session.score ? ` - Score: ${session.score}` : ''}${session.duration ? ` - Duration: ${Math.floor(session.duration / 60)}m` : ''}`,
        timestamp: session.completedAt || session.startedAt,
      }));

    // Convert exercise sessions to activities (filter by userId)
    const exerciseActivities = exerciseSessions
      .filter((session: any) => session.userId === userId)
      .map((session: any) => ({
        id: session.id,
        userId: session.userId,
        type: 'exercise',
        action: session.completed ? 'Completed Exercise' : 'Started Exercise',
        details: `${session.exerciseName}${session.duration ? ` (${session.duration})` : ''}${session.difficulty ? ` - ${session.difficulty}` : ''}`,
        timestamp: session.completedAt || session.startedAt,
      }));

    // Convert diary entries to activities (already filtered by userId)
    const diaryActivitiesFromTable = diaryEntries
      .map((entry: any) => {
        let timestamp;
        try {
          // Use created_at from table, or create from date and time
          if (entry.created_at) {
            timestamp = entry.created_at;
          } else if (entry.date && entry.time) {
            timestamp = new Date(`${entry.date} ${entry.time}`).toISOString();
          } else if (entry.date) {
            timestamp = new Date(entry.date).toISOString();
          } else {
            timestamp = new Date().toISOString();
          }
        } catch (e) {
          // Fallback to current time if date parsing fails
          timestamp = new Date().toISOString();
        }
        
        return {
          id: entry.id,
          userId: entry.user_id, // Use user_id from table
          type: 'journal',
          action: 'Diary Entry Saved',
          details: `${entry.mood ? `Mood: ${entry.mood}` : 'Personal reflection'}`,
          timestamp,
          sourceId: entry.id,
          date: entry.date,
          time: entry.time,
        };
      });

    // Convert diet items to activities (filter by userId)
    const dietActivities = dietItems
      .filter((item: any) => item.userId === userId)
      .map((item: any) => ({
        id: item.id,
        userId: item.userId,
        type: 'diet',
        action: item.mealType ? `${item.mealType} Plan` : 'Diet Item Added',
        details: `${item.name || item.description || 'Diet item'}${item.scheduledTime ? ` at ${item.scheduledTime}` : ''}`,
        timestamp: item.createdAt,
      }));

    // Convert future messages to activities (filter by userId)
    const futureMessageActivities = futureMessages
      .filter((message: any) => message.userId === userId)
      .map((message: any) => {
        const timestamp = message.createdAt || message.created || new Date().toISOString();
        return {
          id: message.id,
          userId: message.userId,
          type: 'journal',
          action: 'Future Message Scheduled',
          details: `Message to future self - scheduled for ${message.scheduledDate} at ${message.scheduledTime}`,
          timestamp,
        };
      });

    // Convert reminders to activities (filter by userId)
    const reminderActivities = reminders
      .filter((reminder: any) => reminder.userId === userId)
      .map((reminder: any) => {
        const timestamp = reminder.createdAt || reminder.created || new Date().toISOString();
        return {
          id: reminder.id,
          userId: reminder.userId,
          type: 'journal',
          action: reminder.completed ? 'Completed Reminder' : 'Reminder Created',
          details: `${reminder.task} - ${reminder.date} at ${reminder.time}`,
          timestamp,
        };
      });

    // Merge all activities
    const allActivities = [...activities, ...gameActivities, ...exerciseActivities, ...diaryActivitiesFromTable, ...dietActivities, ...futureMessageActivities, ...reminderActivities];
    
    // Remove duplicates based on ID (use Set)
    const uniqueActivities = Array.from(
      new Map(allActivities.map(activity => [activity.id, activity])).values()
    );
    
    // Filter activities from last 30 days, excluding last 24 hours
    const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const historyActivities = uniqueActivities
      .filter((activity: Activity) => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= thirtyDaysAgo && activityDate < twentyFourHoursAgo;
      })
      .sort((a: Activity, b: Activity) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    console.log(`Fetched ${historyActivities.length} history activities (30 days, excluding last 24h) for user ${userId} (including ${diaryActivitiesFromTable.length} diary entries from table)`);
    return c.json(historyActivities);
  } catch (error) {
    console.error('Error fetching activity history:', error);
    return c.json({ error: 'Failed to fetch activity history' }, 500);
  }
}
