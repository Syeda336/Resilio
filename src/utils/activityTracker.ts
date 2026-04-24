import { projectId, publicAnonKey } from './supabase/info';

export type ActivityType = 'diet' | 'journal' | 'care_buddy' | 'game' | 'exercise';

export interface Activity {
  id?: string;
  userId?: string;  // Add userId to activity interface
  type: ActivityType;
  action: string;
  details: string;
  timestamp: string;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd`;

// Helper to get auth headers
function getHeaders() {
  const accessToken = localStorage.getItem('resilio_access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
  };
}

// Helper to get current user ID from localStorage
function getCurrentUserId(): string | null {
  return localStorage.getItem('resilio_user_id');
}

export async function logActivity(activity: Partial<Activity>): Promise<void>;
export async function logActivity(type: ActivityType, action: string, details: string): Promise<void>;

export async function logActivity(
  typeOrActivity: ActivityType | Partial<Activity>,
  action?: string,
  details?: string
): Promise<void> {
  try {
    // Get the current user's ID from localStorage
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.warn('Cannot log activity: User not authenticated');
      return;
    }

    let activity: Activity;
    
    // Check if first parameter is an object (new style) or a string (old style)
    if (typeof typeOrActivity === 'object') {
      // New style: logActivity({ type, action, details })
      activity = {
        userId,
        type: typeOrActivity.type!,
        action: typeOrActivity.action!,
        details: typeOrActivity.details!,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Old style: logActivity(type, action, details)
      activity = {
        userId,
        type: typeOrActivity,
        action: action!,
        details: details!,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(`${SERVER_URL}/activities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error logging activity:', error);
    } else {
      console.log(`✅ Activity logged: ${activity.type} - ${activity.action}`);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getRecentActivities(): Promise<Activity[]> {
  try {
    // Get the current user's ID from localStorage
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.warn('Cannot fetch activities: User not authenticated');
      return [];
    }

    // This endpoint returns activities from last 24 hours for Activities page
    const response = await fetch(`${SERVER_URL}/activities/today`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching recent activities:', error);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

export async function getActivityHistory(): Promise<Activity[]> {
  try {
    // Get the current user's ID from localStorage
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.warn('Cannot fetch activity history: User not authenticated');
      return [];
    }

    const response = await fetch(`${SERVER_URL}/activities/history`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching activity history:', error);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activity history:', error);
    return [];
  }
}