import { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { getUser } from './auth.tsx';
import { createClient } from 'npm:@supabase/supabase-js';

// Get dashboard statistics
export async function getDashboardStats(c: Context) {
  try {
    console.log('Fetching dashboard stats...');
    
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    let userId: string | undefined;
    if (accessToken) {
      try {
        const result = await getUser(accessToken);
        userId = result.user?.id;
      } catch (authError) {
        console.log('Could not get user from token:', authError);
      }
    }
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetching diary entries from Supabase diary_entries table
    console.log(`📖 Fetching diary entries from diary_entries table for dashboard`);
    
    // Fetch diary entries from Supabase table - use fallback if table doesn't exist
    let diaryEntriesData: any[] | null = null;
    try {
      const fetchResult = await supabase
        .from('diary_entries')
        .select('*');
      
      if (fetchResult.error) {
        console.warn('Could not fetch from diary_entries:', fetchResult.error.message);
        // Table doesn't exist or other error - use empty array as fallback
        diaryEntriesData = [];
      } else {
        diaryEntriesData = fetchResult.data;
      }
    } catch (error) {
      console.warn('Error accessing diary_entries table:', error);
      // Use empty array as fallback
      diaryEntriesData = [];
    }
    
    const kvDiaryEntries = (diaryEntriesData || []);
    
    // Fetch other data types from Deno KV store
    const [careBuddySessions, activities, loginHistory, gameSessions, exerciseSessions, dietItems, futureMessages, reminders] = await Promise.all([
      kv.getByPrefix('care_buddy_session_'),
      kv.getByPrefix('activity:'),
      kv.getByPrefix('login_'),
      kv.getByPrefix('game_session_'),
      kv.getByPrefix('exercise_session_'),
      kv.getByPrefix('diet_item_'),
      kv.getByPrefix('future_message_'),
      kv.getByPrefix('reminder_'),
    ]);

    console.log(`Total diary entries: ${kvDiaryEntries.length} from diary_entries table`);
    console.log('Data fetched, calculating stats...');
    
    // Calculate stats with combined diary entries
    const stats = calculateStats(kvDiaryEntries, careBuddySessions, activities, loginHistory, gameSessions, exerciseSessions, dietItems, futureMessages, reminders, userId);
    console.log('Stats calculated:', stats);
    
    const moodData = calculateMoodData(kvDiaryEntries, userId);
    console.log('Mood data calculated');
    
    // Calculate weekly average mood
    const weeklyAvgMood = calculateWeeklyAverageMood(moodData);
    console.log('Weekly average mood:', weeklyAvgMood);
    
    const dietProgress = await calculateDietProgress(userId);
    console.log('Diet progress calculated');

    return c.json({
      stats,
      moodData,
      weeklyAvgMood,
      dietProgress,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ error: `Failed to fetch dashboard stats: ${error}` }, 500);
  }
}

function calculateStats(diaryEntries: any[], careBuddySessions: any[], activities: any[], loginHistory: any[], gameSessions: any[], exerciseSessions: any[], dietItems: any[], futureMessages: any[], reminders: any[], userId?: string) {
  // Filter data by userId if provided
  if (userId) {
    diaryEntries = diaryEntries.filter((entry: any) => entry.user_id === userId || entry.userId === userId);
    careBuddySessions = careBuddySessions.filter((session: any) => session.userId === userId);
    activities = activities.filter((activity: any) => activity.userId === userId);
    loginHistory = loginHistory.filter((login: any) => login.userId === userId);
    gameSessions = gameSessions.filter((session: any) => session.userId === userId);
    exerciseSessions = exerciseSessions.filter((session: any) => session.userId === userId);
    dietItems = dietItems.filter((item: any) => item.userId === userId);
    futureMessages = futureMessages.filter((message: any) => message.userId === userId);
    reminders = reminders.filter((reminder: any) => reminder.userId === userId);
  }
  
  // Calculate average mood for today
  const today = new Date().toLocaleDateString('en-US');
  const todayEntries = diaryEntries.filter((entry: any) => {
    const entryDate = new Date(entry.date).toLocaleDateString('en-US');
    return entryDate === today && entry.mood;
  });

  // Updated mood map to handle new dropdown format with emojis
  const moodMap: { [key: string]: number } = {
    // Positive moods (4-5)
    'Happy 😊': 5,
    'Excited 🎉': 5,
    'Grateful 🙏': 5,
    'Loved 💖': 5,
    'Peaceful 🌿': 4.5,
    'Calm 😌': 4.5,
    'Relaxed 😌': 4.5,
    'Content 😊': 4.5,
    'Hopeful ✨': 4,
    'Energetic ⚡': 4,
    'Thoughtful 🤔': 4,
    // Neutral (3)
    'Neutral 😐': 3,
    // Challenging moods (1-2.5)
    'Tired 😴': 2.5,
    'Stressed 😰': 2,
    'Anxious 😟': 2,
    'Frustrated 😤': 2,
    'Overwhelmed 😵': 1.5,
    'Sad 😢': 1.5,
    'Lonely 😔': 1.5,
    'Angry 😠': 1,
    // Legacy mood values (backwards compatibility)
    'Happy': 5,
    'Calm': 4.5,
    'Okay': 3,
    'Anxious': 2,
    'Sad': 1.5,
    // Care Buddy moods - Positive (4-5)
    'Joyful': 5,
    'Excited': 5,
    'Confident': 5,
    'Playful': 5,
    'Satisfied': 4.5,
    'Balanced': 4.5,
    'Cared For': 4.5,
    'Curious': 4,
    'Interested': 4,
    'Attentive': 4,
    'Focused': 4,
    // Care Buddy moods - Neutral (3)
    'Indifferent': 3,
    'Serious': 3,
    'Flat': 3,
    'Blank': 3,
    // Care Buddy moods - Mild Negative (2-2.5)
    'Slightly Concerned': 2.5,
    'Confused': 2.5,
    'Nervous': 2,
    'Under Pressure': 2,
    'Tense': 2,
    'Restless': 2,
    'Apprehensive': 2,
    'Irritated': 2,
    'Impatient': 2,
    'Worried': 2,
    // Care Buddy moods - Moderate Negative (1.5-2)
    'Panicked': 1.5,
    'Hypervigilant': 1.5,
    'Fearful': 1.5,
    'Tearful': 1.5,
    'Grieving': 1.5,
    'Despairing': 1.5,
    'Hopeless': 1.5,
    'Guilty': 1.5,
    'Ashamed': 1.5,
    'Depressed': 1.5,
    'Worthless': 1.5,
    'Disgusted': 1.5,
    // Care Buddy moods - Severe Negative (1-1.5)
    'Overloaded': 1.5,
    'Burnt Out': 1.5,
    'Exhausted': 1.5,
    'Crying': 1.5,
    'Enraged': 1,
    'Furious': 1,
    'Aggressive': 1,
    'Crazy': 1,
    'Mad': 1,
    'Numb': 1.5,
    'Empty': 1.5,
  };

  let avgMood = 'N/A';
  if (todayEntries.length > 0) {
    const totalMoodValue = todayEntries.reduce((sum: number, entry: any) => {
      return sum + (moodMap[entry.mood] || 3);
    }, 0);
    const avgValue = totalMoodValue / todayEntries.length;
    
    // Map average to mood label
    if (avgValue >= 4.5) avgMood = 'Happy';
    else if (avgValue >= 3.5) avgMood = 'Good';
    else if (avgValue >= 2.5) avgMood = 'Okay';
    else if (avgValue >= 1.5) avgMood = 'Low';
    else avgMood = 'Down';
  }

  // Count care buddy sessions (unique conversation threads)
  const careBuddySessionCount = careBuddySessions.length;

  // Count total activities - include ALL activity types from last 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Helper to check if timestamp is within 24 hours
  const isRecent = (timestamp: string) => {
    if (!timestamp) return false;
    try {
      return new Date(timestamp) >= twentyFourHoursAgo;
    } catch {
      return false;
    }
  };
  
  // Count recent activities from each type
  const recentActivities = activities.filter((a: any) => isRecent(a.timestamp)).length;
  const recentGames = gameSessions.filter((g: any) => isRecent(g.completedAt || g.startedAt)).length;
  const recentExercises = exerciseSessions.filter((e: any) => isRecent(e.completedAt || e.startedAt)).length;
  const recentDiaryEntries = diaryEntries.filter((d: any) => {
    if (!d.date || !d.time) return false;
    try {
      return isRecent(new Date(`${d.date} ${d.time}`).toISOString());
    } catch {
      return false;
    }
  }).length;
  const recentDietItems = dietItems.filter((d: any) => isRecent(d.createdAt)).length;
  const recentFutureMessages = futureMessages.filter((m: any) => isRecent(m.created || new Date().toISOString())).length;
  const recentReminders = reminders.filter((r: any) => isRecent(r.created || new Date().toISOString())).length;
  
  const totalActivities = recentActivities + recentGames + recentExercises + recentDiaryEntries + recentDietItems + recentFutureMessages + recentReminders;

  // Calculate streak (consecutive days of login)
  const streak = calculateStreak(loginHistory);

  // Count game sessions
  const totalGameSessions = gameSessions.length;

  // Count exercise sessions
  const totalExerciseSessions = exerciseSessions.length;

  // Count diet items
  const totalDietItems = dietItems.length;

  // Count future messages
  const totalFutureMessages = futureMessages.length;

  // Count reminders
  const totalReminders = reminders.length;

  // Count total history activities (all-time activities, not just last 24 hours)
  const totalHistoryActivities = activities.length + gameSessions.length + exerciseSessions.length + diaryEntries.length + dietItems.length + futureMessages.length + reminders.length;

  return {
    avgMood,
    careBuddySessionCount,
    totalActivities,
    totalHistoryActivities,
    streak,
    totalGameSessions,
    totalExerciseSessions,
    totalDietItems,
    totalFutureMessages,
    totalReminders,
  };
}

function calculateStreak(loginHistory: any[]): number {
  if (loginHistory.length === 0) return 1; // Default to 1 if no history

  // Sort login history by date (most recent first)
  const sortedLogins = loginHistory
    .map((login: any) => new Date(login.timestamp))
    .sort((a, b) => b.getTime() - a.getTime());

  // Get unique days (normalized to start of day)
  const uniqueDays = new Set<string>();
  sortedLogins.forEach(date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    uniqueDays.add(normalized.toDateString());
  });

  const uniqueDaysArray = Array.from(uniqueDays).map(dateStr => new Date(dateStr));
  uniqueDaysArray.sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDaysArray.length === 0) return 1; // Default to 1 if no valid days

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if user logged in today OR yesterday to keep streak alive
  const mostRecentLogin = new Date(uniqueDaysArray[0]);
  mostRecentLogin.setHours(0, 0, 0, 0);
  
  // If last login was before yesterday, streak is broken - start fresh at 1
  if (mostRecentLogin.getTime() < yesterday.getTime()) {
    return 1;
  }
  
  let streak = 0;
  let currentDate = new Date(today);

  for (const loginDate of uniqueDaysArray) {
    const checkDate = new Date(loginDate);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (checkDate.getTime() < currentDate.getTime()) {
      // Gap found - streak is broken
      break;
    }
  }

  // Ensure streak is at least 1 if user has any login history
  return Math.max(1, streak);
}

function calculateMoodData(diaryEntries: any[], userId?: string) {
  // Filter data by userId if provided
  if (userId) {
    diaryEntries = diaryEntries.filter((entry: any) => entry.user_id === userId || entry.userId === userId);
  }
  
  // Updated mood map based on image requirements
  // Level 5 - Very Happy: Happy, Excited, Grateful
  // Level 4 - Good: Peaceful, Calm, Content, Thoughtful, Hopeful, Loved, Energetic, Relaxed
  // Level 3 - Neutral: Neutral
  // Level 2 - Low: Tired, Stressed, Anxious, Sad, Frustrated
  // Level 1 - Very Low: Overwhelmed, Angry, Lonely
  const moodMap: { [key: string]: number } = {
    // Level 5 - Very Happy (Top 3 in list)
    'Happy 😊': 5,
    'Excited 🎉': 5,
    'Grateful 🙏': 5,
    'Happy': 5,
    'Excited': 5,
    'Grateful': 5,
    
    // Level 4 - Good (Next 8 in list)
    'Peaceful 🌿': 4,
    'Calm 😌': 4,
    'Content 😊': 4,
    'Thoughtful 🤔': 4,
    'Hopeful ✨': 4,
    'Loved 💖': 4,
    'Energetic ⚡': 4,
    'Relaxed 😌': 4,
    'Peaceful': 4,
    'Calm': 4,
    'Content': 4,
    'Thoughtful': 4,
    'Hopeful': 4,
    'Loved': 4,
    'Energetic': 4,
    'Relaxed': 4,
    
    // Level 3 - Neutral
    'Neutral 😐': 3,
    'Neutral': 3,
    'Okay': 3,
    
    // Level 2 - Low
    'Tired 😴': 2,
    'Stressed 😰': 2,
    'Anxious 😟': 2,
    'Sad 😢': 2,
    'Frustrated 😤': 2,
    'Tired': 2,
    'Stressed': 2,
    'Anxious': 2,
    'Sad': 2,
    'Frustrated': 2,
    
    // Level 1 - Very Low (Bottom 4 in list)
    'Overwhelmed 😵': 1,
    'Angry 😠': 1,
    'Lonely 😔': 1,
    'Overwhelmed': 1,
    'Angry': 1,
    'Lonely': 1,
    // Care Buddy moods - Positive (4-5)
    'Joyful': 5,
    'Excited': 5,
    'Confident': 5,
    'Playful': 5,
    'Satisfied': 4,
    'Balanced': 4,
    'Cared For': 4,
    'Curious': 4,
    'Interested': 4,
    'Attentive': 4,
    'Focused': 4,
    // Care Buddy moods - Neutral (3)
    'Indifferent': 3,
    'Serious': 3,
    'Flat': 3,
    'Blank': 3,
    // Care Buddy moods - Low (2)
    'Slightly Concerned': 2,
    'Confused': 2,
    'Nervous': 2,
    'Under Pressure': 2,
    'Tense': 2,
    'Restless': 2,
    'Apprehensive': 2,
    'Irritated': 2,
    'Impatient': 2,
    'Worried': 2,
    // Care Buddy moods - Down (1)
    'Panicked': 1,
    'Hypervigilant': 1,
    'Fearful': 1,
    'Tearful': 1,
    'Grieving': 1,
    'Despairing': 1,
    'Hopeless': 1,
    'Guilty': 1,
    'Ashamed': 1,
    'Depressed': 1,
    'Worthless': 1,
    'Disgusted': 1,
    'Overloaded': 1,
    'Burnt Out': 1,
    'Exhausted': 1,
    'Crying': 1,
    'Enraged': 1,
    'Furious': 1,
    'Aggressive': 1,
    'Crazy': 1,
    'Mad': 1,
    'Numb': 1,
    'Empty': 1,
  };

  const colorMap: { [key: string]: string } = {
    'Happy': '#10B981',  // Green
    'Good': '#3B82F6',   // Blue
    'Okay': '#A855F7',   // Purple
    'Low': '#F97316',    // Orange
    'Down': '#EF4444',   // Red
  };

  // Get last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date);
  }

  console.log(`Processing mood data for ${diaryEntries.length} diary entries (filtered by userId: ${userId})`);

  const moodData = last7Days.map(date => {
    const dateStr = date.toLocaleDateString('en-US');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    // Find entries for this day
    const dayEntries = diaryEntries.filter((entry: any) => {
      if (!entry.date || !entry.mood) return false;
      const entryDate = new Date(entry.date).toLocaleDateString('en-US');
      return entryDate === dateStr;
    });

    console.log(`${dayName} (${dateStr}): Found ${dayEntries.length} entries with mood`);

    if (dayEntries.length === 0) {
      return {
        day: dayName,
        mood: '',
        value: 0,
        color: '#E5E7EB',
      };
    }

    // Calculate average mood for the day
    const totalMoodValue = dayEntries.reduce((sum: number, entry: any) => {
      const moodValue = moodMap[entry.mood] || 3;
      console.log(`  Entry mood: "${entry.mood}" -> value: ${moodValue}`);
      return sum + moodValue;
    }, 0);
    const avgValue = totalMoodValue / dayEntries.length;
    
    console.log(`  Average mood value: ${avgValue}`);
    
    // Map average to mood label and value with updated ranges
    // Range: 4.5 - 5.0 = Happy (5)
    // Range: 3.5 - 4.49 = Good (4)
    // Range: 2.5 - 3.49 = Okay (3)
    // Range: 1.5 - 2.49 = Low (2)
    // Range: 0.0 - 1.49 = Down (1)
    let mood = '';
    let displayValue = 0;
    
    if (avgValue >= 4.5) {
      mood = 'Happy';
      displayValue = 5;
    } else if (avgValue >= 3.5) {
      mood = 'Good';
      displayValue = 4;
    } else if (avgValue >= 2.5) {
      mood = 'Okay';
      displayValue = 3;
    } else if (avgValue >= 1.5) {
      mood = 'Low';
      displayValue = 2;
    } else {
      mood = 'Down';
      displayValue = 1;
    }

    console.log(`  Final mood: ${mood} (${displayValue})`);

    return {
      day: dayName,
      mood,
      value: displayValue,
      color: colorMap[mood] || '#E5E7EB',
    };
  });

  console.log('Final mood data:', JSON.stringify(moodData, null, 2));

  return moodData;
}

function calculateWeeklyAverageMood(moodData: any[]): string {
  // Filter out days with no mood data (value = 0)
  const daysWithData = moodData.filter(day => day.value > 0);
  
  if (daysWithData.length === 0) {
    return 'N/A';
  }
  
  // Calculate average
  const totalValue = daysWithData.reduce((sum, day) => sum + day.value, 0);
  const avgValue = totalValue / daysWithData.length;
  
  console.log(`Weekly average calculation: ${daysWithData.length} days with data, avg value: ${avgValue}`);
  
  // Map average to mood label using same ranges as calculateMoodData
  // Range: 4.5 - 5.0 = Happy
  // Range: 3.5 - 4.49 = Good
  // Range: 2.5 - 3.49 = Okay
  // Range: 1.5 - 2.49 = Low
  // Range: 0.0 - 1.49 = Down
  let weeklyMood = '';
  if (avgValue >= 4.5) weeklyMood = 'Happy';
  else if (avgValue >= 3.5) weeklyMood = 'Good';
  else if (avgValue >= 2.5) weeklyMood = 'Okay';
  else if (avgValue >= 1.5) weeklyMood = 'Low';
  else weeklyMood = 'Down';
  
  console.log(`Weekly mood: ${weeklyMood}`);
  
  return weeklyMood;
}

async function calculateDietProgress(userId?: string) {
  try {
    let dietItems = await kv.getByPrefix('diet_item_');

    // Filter data by userId if provided
    if (userId) {
      dietItems = dietItems.filter((item: any) => item.userId === userId);
    }
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    const dietProgress = last7Days.map(date => {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDateStr = date.toLocaleDateString('en-US');

      // Count items for this day
      const dayItems = dietItems.filter((item: any) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt).toLocaleDateString('en-US');
        return itemDate === fullDateStr;
      });

      // Count meals (items with mealType)
      const meals = dayItems.filter((item: any) => item.mealType).length;
      // Count all items
      const items = dayItems.length;

      return {
        date: dateStr,
        meals,
        items,
      };
    });

    return dietProgress;
  } catch (error) {
    console.error('Error calculating diet progress:', error);
    return [];
  }
}

// Track user login for streak calculation
export async function trackLogin(c: Context) {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    let userId: string | undefined;
    if (accessToken) {
      try {
        const result = await getUser(accessToken);
        userId = result.user?.id;
      } catch (authError) {
        console.log('Could not get user from token:', authError);
      }
    }

    const loginId = `login_${Date.now()}`;
    const loginData = {
      id: loginId,
      timestamp: new Date().toISOString(),
      userId: userId,
    };

    await kv.set(loginId, loginData);

    console.log('Login tracked successfully for user:', userId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error tracking login:', error);
    return c.json({ error: 'Failed to track login' }, 500);
  }
}