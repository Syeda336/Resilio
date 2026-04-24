// Notification Service - Manages scheduled notifications for messages and reminders

export interface ScheduledNotification {
  id: string;
  type: 'future-message' | 'reminder';
  title: string;
  message: string;
  scheduledTime: string; // ISO string
  userId: string;
  shown: boolean;
}

class NotificationService {
  private listeners: Array<(notification: ScheduledNotification) => void> = [];
  private checkInterval: number | null = null;
  private storageKey = 'resilio_scheduled_notifications';

  // Subscribe to notification events
  subscribe(callback: (notification: ScheduledNotification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners
  private notify(notification: ScheduledNotification) {
    this.listeners.forEach(listener => listener(notification));
  }

  // Get all scheduled notifications
  getScheduled(): ScheduledNotification[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading scheduled notifications:', error);
      return [];
    }
  }

  // Save scheduled notifications
  private saveScheduled(notifications: ScheduledNotification[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }

  // Add a new scheduled notification
  addScheduled(notification: Omit<ScheduledNotification, 'shown'>) {
    const notifications = this.getScheduled();
    const newNotification: ScheduledNotification = {
      ...notification,
      shown: false,
    };
    notifications.push(newNotification);
    this.saveScheduled(notifications);
    console.log('📅 Scheduled notification added:', newNotification);
  }

  // Remove a scheduled notification
  removeScheduled(id: string) {
    const notifications = this.getScheduled();
    const filtered = notifications.filter(n => n.id !== id);
    this.saveScheduled(filtered);
  }

  // Mark notification as shown
  markAsShown(id: string) {
    const notifications = this.getScheduled();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, shown: true } : n
    );
    this.saveScheduled(updated);
  }

  // Check for due notifications (called every minute)
  checkDueNotifications() {
    const notifications = this.getScheduled();
    const now = new Date();

    notifications.forEach(notification => {
      if (notification.shown) return;

      const scheduledTime = new Date(notification.scheduledTime);
      
      // Check if the scheduled time has passed
      if (scheduledTime <= now) {
        console.log('⏰ Notification due!', notification);
        this.notify(notification);
        this.markAsShown(notification.id);
      }
    });
  }

  // Start background timer (checks every minute)
  startTimer() {
    if (this.checkInterval !== null) return; // Already running

    console.log('⏱️ Starting notification timer...');
    
    // Check immediately
    this.checkDueNotifications();

    // Then check every minute
    this.checkInterval = window.setInterval(() => {
      this.checkDueNotifications();
    }, 1000); // 60 seconds
  }

  // Stop background timer
  stopTimer() {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏱️ Notification timer stopped');
    }
  }

  // Clean up old shown notifications (older than 30 days)
  cleanup() {
    const notifications = this.getScheduled();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = notifications.filter(n => {
      if (!n.shown) return true; // Keep unshown
      const scheduledTime = new Date(n.scheduledTime);
      return scheduledTime > thirtyDaysAgo; // Keep recent
    });

    this.saveScheduled(filtered);
  }
}

// Singleton instance
export const notificationService = new NotificationService();
