import { projectId } from './supabase/info';

// Supabase Edge Function configuration
export const FUNCTION_NAME = 'make-server-40d4d8fd'; // The deployed function name
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/${FUNCTION_NAME}`;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGNUP: `${API_BASE_URL}/make-server-40d4d8fd/auth/signup`,
  LOGIN: `${API_BASE_URL}/make-server-40d4d8fd/auth/login`,
  VERIFY: `${API_BASE_URL}/make-server-40d4d8fd/user/verify`,
  GET_USER: `${API_BASE_URL}/make-server-40d4d8fd/auth/user`,
  UPDATE_PROFILE: `${API_BASE_URL}/make-server-40d4d8fd/auth/profile`,
  UPDATE_PASSWORD: `${API_BASE_URL}/make-server-40d4d8fd/auth/password`,
  
  // User Data
  PROFILE_DATA: `${API_BASE_URL}/make-server-40d4d8fd/user/profile-data`,
  
  // Activities
  ACTIVITIES: `${API_BASE_URL}/make-server-40d4d8fd/activities`,
  ACTIVITIES_RECENT: `${API_BASE_URL}/make-server-40d4d8fd/activities/recent`,
  ACTIVITIES_HISTORY: `${API_BASE_URL}/make-server-40d4d8fd/activities/history`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/make-server-40d4d8fd/dashboard/stats`,
  DASHBOARD_LOGIN: `${API_BASE_URL}/make-server-40d4d8fd/dashboard/login`,
  DASHBOARD_STREAK: `${API_BASE_URL}/make-server-40d4d8fd/dashboard/streak`,
  
  // Diary Entries
  ENTRIES: `${API_BASE_URL}/make-server-40d4d8fd/entries`,
  
  // Future Messages
  FUTURE_MESSAGES: `${API_BASE_URL}/make-server-40d4d8fd/future-messages`,
  
  // Reminders
  REMINDERS: `${API_BASE_URL}/make-server-40d4d8fd/reminders`,
  
  // Diet Items
  DIET_ITEMS: `${API_BASE_URL}/make-server-40d4d8fd/diet-items`,
  
  // Games
  GAMES: `${API_BASE_URL}/make-server-40d4d8fd/games`,
  GAME_SESSIONS: `${API_BASE_URL}/make-server-40d4d8fd/game-sessions`,
  
  // Exercises
  EXERCISES: `${API_BASE_URL}/make-server-40d4d8fd/exercises`,
  EXERCISE_SESSIONS: `${API_BASE_URL}/make-server-40d4d8fd/exercise-sessions`,
  
  // Care Buddy
  CARE_BUDDY_SESSIONS: `${API_BASE_URL}/make-server-40d4d8fd/care-buddy/sessions`,
  
  // Email Scheduler
  CRON_CHECK_EMAILS: `${API_BASE_URL}/make-server-40d4d8fd/cron/check-scheduled-emails`,
};