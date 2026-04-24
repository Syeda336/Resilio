import { projectId, publicAnonKey } from './supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd`;

/**
 * Cleanup old diary activity logs from KV store
 * These are no longer needed since activities are auto-generated from diary_entries table
 * 
 * Call this once when the app loads to remove duplicates
 */
export async function cleanupOldDiaryActivities(): Promise<void> {
  try {
    const accessToken = localStorage.getItem('resilio_access_token');
    
    if (!accessToken) {
      console.log('⚠️ Cannot cleanup: No access token found');
      return;
    }

    console.log('🧹 Starting cleanup of old diary activity logs...');

    const response = await fetch(`${SERVER_URL}/cleanup/diary-activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error during cleanup:', error);
      return;
    }

    const result = await response.json();
    console.log(`✅ Cleanup complete: ${result.deletedCount} old activity logs removed`);
    
    if (result.deletedCount > 0) {
      console.log('🔄 Triggering page refresh to show clean data...');
      // Trigger a dashboard refresh to reload activities
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

/**
 * Check if cleanup has already been run
 */
function hasCleanupRun(): boolean {
  return localStorage.getItem('diary_activities_cleanup_done') === 'true';
}

/**
 * Mark cleanup as complete
 */
function markCleanupComplete(): void {
  localStorage.setItem('diary_activities_cleanup_done', 'true');
}

/**
 * Auto-cleanup that runs once per user
 * Call this when the app initializes
 */
export async function autoCleanupOnce(): Promise<void> {
  if (hasCleanupRun()) {
    console.log('✅ Diary activities cleanup already completed');
    return;
  }

  await cleanupOldDiaryActivities();
  markCleanupComplete();
}
