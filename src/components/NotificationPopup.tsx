import { useState, useEffect } from 'react';
import { X, Bell, MessageCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService, ScheduledNotification } from '../utils/notificationService';

export function NotificationPopup() {
  const [notification, setNotification] = useState<ScheduledNotification | null>(null);
  const [queue, setQueue] = useState<ScheduledNotification[]>([]);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe((newNotification) => {
      console.log('🔔 New notification received:', newNotification);
      
      // Add to queue
      setQueue(prev => [...prev, newNotification]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Show next notification from queue
  useEffect(() => {
    if (!notification && queue.length > 0) {
      const [next, ...rest] = queue;
      setNotification(next);
      setQueue(rest);
    }
  }, [notification, queue]);

  const handleClose = () => {
    setNotification(null);
  };

  if (!notification) return null;

  const icon = notification.type === 'future-message' ? (
    <MessageCircle className="w-6 h-6 text-white" />
  ) : (
    <Clock className="w-6 h-6 text-white" />
  );

  const bgGradient = notification.type === 'future-message' 
    ? 'from-violet-500 to-purple-600' 
    : 'from-rose-500 to-pink-600';

  return (
    <AnimatePresence>
      {notification && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Notification Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${bgGradient} p-6 relative`}>
                {/* Animated bell icon */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Bell className="w-6 h-6 text-white" />
                </motion.div>

                <div className="flex items-center gap-3 pr-16">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {notification.type === 'future-message' ? '📬 Message from Your Past Self' : '⏰ Reminder'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {new Date(notification.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-slate-900 font-semibold text-xl mb-3">
                  {notification.title}
                </h4>
                <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className={`px-6 py-3 rounded-xl bg-gradient-to-r ${bgGradient} text-white font-medium hover:shadow-lg transition-all duration-200`}
                >
                  Got it! ✨
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
