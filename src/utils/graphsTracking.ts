import { projectId, publicAnonKey } from './supabase/info';

// ================================================================
// GAMES TRACKING
// ================================================================

export const gamesTracking = {
  async start(gameName: string): Promise<string> {
    const token = localStorage.getItem('resilio_access_token');
    const userId = localStorage.getItem('resilio_user_id');
    if (!token || !userId) throw new Error('Not authenticated');

    const res = await fetch(`https://${projectId}.supabase.co/rest/v1/games_activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publicAnonKey,
        Authorization: `Bearer ${token}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        game_name: gameName,
        started_at: new Date().toISOString(),
      }),
    });
    const [data] = await res.json();
    return data.id;
  },

  async end(activityId: string): Promise<void> {
    const token = localStorage.getItem('resilio_access_token');
    if (!token) return;

    // Get activity
    const getRes = await fetch(
      `https://${projectId}.supabase.co/rest/v1/games_activity?id=eq.${activityId}&select=*`,
      { headers: { apikey: publicAnonKey, Authorization: `Bearer ${token}` } }
    );
    const [activity] = await getRes.json();
    if (!activity) return;

    // Calculate duration
    const duration = Math.round((Date.now() - new Date(activity.started_at).getTime()) / 60000);

    // Update
    await fetch(`https://${projectId}.supabase.co/rest/v1/games_activity?id=eq.${activityId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: publicAnonKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ended_at: new Date().toISOString(),
        duration_minutes: duration,
      }),
    });
  },

  async getWeeklyData(): Promise<{ data: any[]; mindHealth: string }> {
    const token = localStorage.getItem('resilio_access_token');
    const userId = localStorage.getItem('resilio_user_id');
    if (!token || !userId) return { data: [], mindHealth: 'N/A' };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const res = await fetch(
      `https://${projectId}.supabase.co/rest/v1/games_activity?user_id=eq.${userId}&created_at=gte.${sevenDaysAgo.toISOString()}&select=*&order=created_at.asc`,
      { headers: { apikey: publicAnonKey, Authorization: `Bearer ${token}` } }
    );
    const activities = await res.json();

    // If no activities, return empty data
    if (!activities || activities.length === 0) {
      return { data: [], mindHealth: 'N/A' };
    }

    // Group by day and track all games played
    const dayData: Record<string, { minutes: number; games: string[] }> = {};
    
    activities.forEach((a: any) => {
      if (a.duration_minutes) {
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(a.created_at).getDay()];
        if (!dayData[day]) {
          dayData[day] = { minutes: 0, games: [] };
        }
        dayData[day].minutes += a.duration_minutes;
        if (!dayData[day].games.includes(a.game_name)) {
          dayData[day].games.push(a.game_name);
        }
      }
    });

    const graphData = Object.entries(dayData).map(([day, data]) => {
      const minutes = data.minutes;
      let healthRange = '15-30%';
      let healthValue = 1;
      
      // Logic: Less time = Better health
      if (minutes <= 1) {
        healthRange = '75-90%';
        healthValue = 5;
      } else if (minutes <= 3) {
        healthRange = '60-75%';
        healthValue = 4;
      } else if (minutes <= 5) {
        healthRange = '45-60%';
        healthValue = 3;
      } else if (minutes <= 7) {
        healthRange = '30-45%';
        healthValue = 2;
      } else {
        healthRange = '15-30%';
        healthValue = 1;
      }
      
      return {
        day,
        minutes,
        healthRange,
        healthValue,
        games: data.games,
        gamesDisplay: data.games.join(', ') || 'No games',
        color: healthValue === 5 ? '#10b981' : healthValue >= 3 ? '#f59e0b' : '#6366f1',
      };
    });

    // Calculate mind health (average across week)
    const healthValues = graphData.map(d => d.healthValue);
    const avgHealth = healthValues.reduce((sum, v) => sum + v, 0) / healthValues.length;
    let mindHealth = '15-30%';
    if (avgHealth >= 4.5) mindHealth = '75-90%';
    else if (avgHealth >= 3.5) mindHealth = '60-75%';
    else if (avgHealth >= 2.5) mindHealth = '45-60%';
    else if (avgHealth >= 1.5) mindHealth = '30-45%';

    return { data: graphData, mindHealth };
  },
};

// ================================================================
// EXERCISE TRACKING
// ================================================================

export const exerciseTracking = {
  async start(exerciseName: string, videoId: string): Promise<string> {
    const token = localStorage.getItem('resilio_access_token');
    const userId = localStorage.getItem('resilio_user_id');
    if (!token || !userId) throw new Error('Not authenticated');

    const res = await fetch(`https://${projectId}.supabase.co/rest/v1/exercise_activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publicAnonKey,
        Authorization: `Bearer ${token}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        exercise_name: exerciseName,
        video_id: videoId,
        started_at: new Date().toISOString(),
      }),
    });
    const [data] = await res.json();
    return data.id;
  },

  async complete(activityId: string): Promise<boolean> {
    const token = localStorage.getItem('resilio_access_token');
    if (!token) return false;

    // Get activity
    const getRes = await fetch(
      `https://${projectId}.supabase.co/rest/v1/exercise_activity?id=eq.${activityId}&select=*`,
      { headers: { apikey: publicAnonKey, Authorization: `Bearer ${token}` } }
    );
    const [activity] = await getRes.json();
    if (!activity) return false;

    // Calculate duration in minutes (with decimals for precision)
    const durationMs = Date.now() - new Date(activity.started_at).getTime();
    const durationMinutes = durationMs / 60000;

    // Calculate chances based on time
    let chances = 1;
    if (durationMinutes >= 7) chances = 5;
    else if (durationMinutes >= 6) chances = 4;
    else if (durationMinutes >= 4) chances = 3;
    else if (durationMinutes >= 2) chances = 2;
    else if (durationMinutes >= 0.5) chances = 1; // 30 seconds or more

    // Store as integer minutes for database
    const duration = Math.round(durationMinutes);

    // Update with chances
    await fetch(`https://${projectId}.supabase.co/rest/v1/exercise_activity?id=eq.${activityId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: publicAnonKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
        duration_minutes: duration,
        is_completed: true, // Always true when user clicks tick
      }),
    });

    return true;
  },

  async getWeeklyData(): Promise<{ data: any[]; chances: number }> {
    const token = localStorage.getItem('resilio_access_token');
    const userId = localStorage.getItem('resilio_user_id');
    if (!token || !userId) return { data: [], chances: 0 };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const res = await fetch(
      `https://${projectId}.supabase.co/rest/v1/exercise_activity?user_id=eq.${userId}&created_at=gte.${sevenDaysAgo.toISOString()}&is_completed=eq.true&select=*&order=created_at.asc`,
      { headers: { apikey: publicAnonKey, Authorization: `Bearer ${token}` } }
    );
    const activities = await res.json();

    // If no activities, return empty data
    if (!activities || activities.length === 0) {
      return { data: [], chances: 0 };
    }

    // Group by day and calculate mind health chances based on duration
    const dayData: Record<string, { exercises: string[]; durations: number[]; maxChances: number }> = {};
    
    activities.forEach((a: any) => {
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(a.created_at).getDay()];
      const duration = a.duration_minutes || 0;
      
      // Calculate chances for this exercise based on duration
      let exerciseChances = 1;
      if (duration >= 7) exerciseChances = 5;
      else if (duration >= 6) exerciseChances = 4;
      else if (duration >= 4) exerciseChances = 3;
      else if (duration >= 2) exerciseChances = 2;
      else exerciseChances = 1;
      
      if (!dayData[day]) {
        dayData[day] = { exercises: [], durations: [], maxChances: 1 };
      }
      
      dayData[day].exercises.push(a.exercise_name);
      dayData[day].durations.push(duration);
      
      // Track highest chance for the day
      if (exerciseChances > dayData[day].maxChances) {
        dayData[day].maxChances = exerciseChances;
      }
    });

    const graphData = Object.entries(dayData).map(([day, data]) => ({
      day,
      exercises: data.exercises,
      exercisesDisplay: data.exercises.join(', ') || 'No exercises',
      durations: data.durations,
      chances: data.maxChances,
      count: data.exercises.length,
    }));

    // Calculate overall chances (based on max duration across week)
    const allChances = graphData.map(d => d.chances);
    const maxChances = Math.max(...allChances);

    return { data: graphData, chances: maxChances };
  },
};