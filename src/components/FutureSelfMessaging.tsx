import { useState, useEffect } from 'react';
import { Send, Trash2, Calendar, Clock, Mail } from 'lucide-react';
import { futureMessagesAPI } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { notificationService } from '../utils/notificationService';
import { dashboardRefresh } from '../utils/dashboardRefresh';

interface FutureMessage {
  id: string;
  message: string;
  scheduledDate: string;
  scheduledTime: string;
  created: string;
}

export function FutureSelfMessaging() {
  const [messages, setMessages] = useState<FutureMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    loadMessages();
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    try {
      const accessToken = localStorage.getItem('resilio_access_token');
      if (!accessToken) {
        // If not logged in, try to get email from localStorage as fallback
        const email = localStorage.getItem('resilio_user_email');
        if (email) {
          setUserEmail(email);
          setEmailInput(email);
        }
        return;
      }

      // Fetch user data from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user?.email) {
          setUserEmail(data.user.email);
          setEmailInput(data.user.email);
          // Also update localStorage for consistency
          localStorage.setItem('resilio_user_email', data.user.email);
        }
      }
    } catch (error) {
      console.error('Error fetching user email:', error);
      // Fallback to localStorage
      const email = localStorage.getItem('resilio_user_email');
      if (email) {
        setUserEmail(email);
        setEmailInput(email);
      }
    }
  };

  const loadMessages = () => {
    setLoading(true);
    futureMessagesAPI.getAll()
      .then((data) => {
        setMessages(data);
      })
      .catch((error) => {
        console.error('Error loading messages:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const scheduleMessage = async () => {
    if (!newMessage.trim() || !scheduledDate || !scheduledTime) {
      alert('⚠️ Please fill in all fields!\\n\\nMessage, date, and time are required.');
      return;
    }

    if (!emailInput.trim()) {
      alert('⚠️ Please enter your email address!\\n\\nWe need your email to send you the message.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      alert('⚠️ Invalid email address!\\n\\nPlease enter a valid email address.');
      return;
    }

    // Check if user is logged in
    const accessToken = localStorage.getItem('resilio_access_token');
    if (!accessToken) {
      alert('⚠️ Please log in first!\\n\\nYou need to be logged in to schedule messages.');
      return;
    }

    setSaving(true);

    // 🔥 FIX: Create proper ISO string with explicit timezone handling
    // Parse the date and time components
    const [year, month, day] = scheduledDate.split('-').map(Number);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    
    // Create date in user's LOCAL timezone (this is critical!)
    const localDateTime = new Date(year, month - 1, day, hours, minutes, 0);
    
    // Get the ISO string (this automatically converts to UTC)
    const scheduledISO = localDateTime.toISOString();
    
    console.log('🕐 [Timezone Debug - FutureSelf]:', {
      userInput: { scheduledDate, scheduledTime },
      parsed: { year, month, day, hours, minutes },
      localDateTime: localDateTime.toString(),
      localTimeString: localDateTime.toLocaleString(),
      scheduledISO: scheduledISO,
      reconstructedUTC: new Date(scheduledISO).toUTCString(),
      reconstructedLocal: new Date(scheduledISO).toLocaleString()
    });

    const message: any = {
      id: Date.now().toString(),
      message: newMessage,
      scheduledDate,
      scheduledTime,
      scheduledISO, // 🔥 ADD: Send ISO string with proper timezone conversion
      userEmail: emailInput.trim(), // ✅ Include email for backend
      created: new Date().toLocaleString(),
    };

    try {
      console.log('📧 [FutureSelf] Scheduling message:', {
        scheduledDate,
        scheduledTime,
        scheduledISO, // Log the ISO string
        userEmail: emailInput.trim(),
        hasToken: !!accessToken,
      });
      
      // Save the message (backend will queue email automatically)
      const result = await futureMessagesAPI.create(message);
      console.log('✅ [FutureSelf] Backend response:', result);

      // Register in-app notification
      const userId = localStorage.getItem('resilio_user_id') || 'unknown';
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      
      notificationService.addScheduled({
        id: `future-${message.id}`,
        type: 'future-message',
        title: 'Message from Your Past Self',
        message: newMessage,
        scheduledTime: scheduledDateTime.toISOString(),
        userId: userId,
      });
      
      console.log('📅 In-app notification scheduled for:', scheduledDateTime.toLocaleString());

      setNewMessage('');
      setScheduledDate('');
      setScheduledTime('');
      loadMessages();
      
      // Trigger dashboard refresh to update Activities and Profile pages
      dashboardRefresh.trigger();
      console.log('🔄 Dashboard refresh triggered after scheduling future message');
    } catch (error: any) {
      console.error('Error scheduling message:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        alert('🔒 Authentication Error\\n\\nYour session has expired. Please log out and log in again.');
      } else {
        alert('❌ Failed to schedule message. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteMessage = (id: string) => {
    if (confirm('Are you sure you want to delete this scheduled message?')) {
      futureMessagesAPI.delete(id)
        .then(() => {
          setMessages(messages.filter(msg => msg.id !== id));
        })
        .catch((error) => {
          console.error('Error deleting message:', error);
        });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-black text-center">Future Self Messaging</h2>
      <p className="text-center text-gray-600">Send messages to your future self that will appear at the scheduled time</p>

      {/* Create New Message */}
      <div className="bg-gray-50 border-2 border-gray-300 p-6 space-y-4">
        <h3 className="text-black">Create New Message</h3>

        

        <div className="space-y-2">
          <label className="text-black">Your Message</label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message to your future self..."
            className="w-full h-32 px-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black placeholder-gray-400 resize-none"
          />
        </div>

        {/* Enhanced Date & Time Section with Visual Prominence */}
        <div className="bg-blue-50 border-2 border-blue-300 p-4 space-y-4">
          <h4 className="text-blue-900 font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            📅 When should you receive this message?
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-blue-900 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date *
              </label>
              <DatePicker
                value={scheduledDate}
                onChange={setScheduledDate}
                label="Choose a date"
              />
              <p className="text-blue-700 text-sm">Choose the day to receive your message</p>
            </div>

            <div className="space-y-2">
              <label className="text-blue-900 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time *
              </label>
              <TimePicker
                value={scheduledTime}
                onChange={setScheduledTime}
                label="Choose a time"
              />
              <p className="text-blue-700 text-sm">Choose the time you want to be reminded</p>
            </div>
          </div>

          {scheduledDate && scheduledTime && (
            <div className="bg-white border-2 border-blue-400 p-3 rounded-lg">
              <p className="text-blue-900 text-center font-medium">
                ✅ Your message will be sent on <strong>{new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>{scheduledTime}</strong>
              </p>
            </div>
          )}
        </div>

        <button
          onClick={scheduleMessage}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white border-2 border-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          {saving ? 'Scheduling...' : 'Schedule Message'}
        </button>
      </div>

      {/* Scheduled Messages */}
      <div className="space-y-4">
        <h3 className="text-black">Scheduled Messages</h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No scheduled messages yet
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white border-2 border-gray-200 p-6 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex gap-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {msg.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {msg.scheduledTime}
                    </span>
                  </div>
                  <div className="text-gray-500">Created: {msg.created}</div>
                </div>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <div className="text-black whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}