import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, Check, Mail } from 'lucide-react';
import { remindersAPI } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { notificationService } from '../utils/notificationService';
import { dashboardRefresh } from '../utils/dashboardRefresh';

interface Reminder {
  id: string;
  task: string;
  date: string;
  time: string;
  completed: boolean;
  created: string;
}

export function PersonalReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    loadReminders();
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

  const loadReminders = () => {
    setLoading(true);
    remindersAPI.getAll(projectId)
      .then((data) => {
        setReminders(data);
      })
      .catch((error) => {
        console.error('Error loading reminders:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addReminder = async () => {
    if (!newTask.trim() || !newDate || !newTime) {
      alert('⚠️ Please fill in all fields!\n\nTask, date, and time are required.');
      return;
    }

    if (!emailInput.trim()) {
      alert('⚠️ Please enter your email address!\n\nWe need your email to send you the reminder.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      alert('⚠️ Invalid email address!\n\nPlease enter a valid email address.');
      return;
    }

    // Check if user is logged in
    const accessToken = localStorage.getItem('resilio_access_token');
    if (!accessToken) {
      alert('⚠️ Please log in first!\n\nYou need to be logged in to add reminders.');
      return;
    }

    setSaving(true);

    // 🔥 FIX: Create proper ISO string with explicit timezone handling
    // Parse the date and time components
    const [year, month, day] = newDate.split('-').map(Number);
    const [hours, minutes] = newTime.split(':').map(Number);
    
    // Create date in user's LOCAL timezone (this is critical!)
    const localDateTime = new Date(year, month - 1, day, hours, minutes, 0);
    
    // Get the ISO string (this automatically converts to UTC)
    const scheduledISO = localDateTime.toISOString();
    
    console.log('🕐 [Timezone Debug - Reminder]:', {
      userInput: { scheduledDate: newDate, scheduledTime: newTime },
      parsed: { year, month, day, hours, minutes },
      localDateTime: localDateTime.toString(),
      localTimeString: localDateTime.toLocaleString(),
      scheduledISO: scheduledISO,
      reconstructedUTC: new Date(scheduledISO).toUTCString(),
      reconstructedLocal: new Date(scheduledISO).toLocaleString()
    });

    const reminder: Reminder = {
      id: Date.now().toString(),
      task: newTask,
      date: newDate,
      time: newTime,
      completed: false,
      created: new Date().toLocaleString(),
    };

    try {
      console.log('📧 [PersonalReminders] Creating reminder:', {
        task: newTask,
        date: newDate,
        time: newTime,
        scheduledISO, // Log the ISO string
        userEmail: emailInput.trim(),
        hasToken: !!accessToken,
      });
      
      // Save the reminder (backend will automatically queue email)
      const result = await remindersAPI.create({
        ...reminder,
        scheduledISO, // 🔥 ADD: Send ISO string with proper timezone conversion
        userEmail: emailInput.trim(), // Pass email to backend for email scheduling
      });
      
      console.log('✅ [PersonalReminders] Backend response:', result);

      // Register in-app notification
      const userId = localStorage.getItem('resilio_user_id') || 'unknown';
      const scheduledDateTime = new Date(`${newDate}T${newTime}:00`);
      
      notificationService.addScheduled({
        id: `reminder-${reminder.id}`,
        type: 'reminder',
        title: 'Personal Reminder',
        message: newTask,
        scheduledTime: scheduledDateTime.toISOString(),
        userId: userId,
      });
      
      console.log('📅 In-app notification scheduled for:', scheduledDateTime.toLocaleString());
      console.log('📧 Email will be automatically sent at scheduled time via queue system');

      setNewTask('');
      setNewDate('');
      setNewTime('');
      loadReminders();
      
      // Trigger dashboard refresh to update Activities and Profile pages
      dashboardRefresh.trigger();
      console.log('🔄 Dashboard refresh triggered after adding reminder');
    } catch (error: any) {
      console.error('Error adding reminder:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        alert('🔒 Authentication Error\n\nYour session has expired. Please log out and log in again.');
      } else {
        alert('❌ Failed to add reminder. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    remindersAPI.update(projectId, id, { completed: !reminder.completed })
      .then(() => {
        setReminders(reminders.map(r =>
          r.id === id ? { ...r, completed: !r.completed } : r
        ));
      })
      .catch((error) => {
        console.error('Error updating reminder:', error);
      });
  };

  const deleteReminder = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      remindersAPI.delete(projectId, id)
        .then(() => {
          setReminders(reminders.filter(reminder => reminder.id !== id));
        })
        .catch((error) => {
          console.error('Error deleting reminder:', error);
        });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-black text-center">Personal Reminders</h2>

      {/* Email Notification Info Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            ℹ️
          </div>
          <div className="flex-1">
            <h4 className="text-amber-900 font-semibold mb-1">⏰ Dual Notification System</h4>
            <p className="text-amber-800 text-sm leading-relaxed">
              When you add a reminder, you'll receive:<br />
              <strong>1. In-App Notification:</strong> A beautiful popup will appear on screen at the scheduled time<br />
              <strong>2. Email Notification:</strong> An email will be sent to the address you provide below
            </p>
          </div>
        </div>
      </div>

      {/* Add New Reminder */}
      <div className="bg-gray-50 border-2 border-gray-300 p-6 space-y-4">
        <h3 className="text-black">Add New Reminder</h3>

        {/* Email Input Field */}
        <div className="space-y-2">
          <label className="text-black flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Your Email Address
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black placeholder-gray-400"
          />
          <p className="text-gray-600 text-sm">The reminder notification will be sent to this email address</p>
        </div>

        <div className="space-y-2">
          <label className="text-black">Task Description</label>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What do you need to remember?"
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black placeholder-gray-400"
          />
        </div>

        {/* Enhanced Date & Time Section with Visual Prominence */}
        <div className="bg-amber-50 border-2 border-amber-300 p-4 space-y-4">
          <h4 className="text-amber-900 font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            📅 When should you be reminded?
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-amber-900 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date *
              </label>
              <DatePicker
                value={newDate}
                onChange={setNewDate}
                label="Choose a date"
              />
              <p className="text-amber-700 text-sm">Choose the reminder date</p>
            </div>

            <div className="space-y-2">
              <label className="text-amber-900 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time *
              </label>
              <TimePicker
                value={newTime}
                onChange={setNewTime}
                label="Choose a time"
              />
              <p className="text-amber-700 text-sm">Choose the reminder time</p>
            </div>
          </div>

          {newDate && newTime && (
            <div className="bg-white border-2 border-amber-400 p-3 rounded-lg">
              <p className="text-amber-900 text-center font-medium">
                ⏰ Reminder set for <strong>{new Date(newDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>{newTime}</strong>
              </p>
            </div>
          )}
        </div>

        <button
          onClick={addReminder}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white border-2 border-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {saving ? 'Adding...' : 'Add Reminder'}
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        <h3 className="text-black">Your Reminders</h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No reminders yet. Add your first reminder above!
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`border-2 p-5 transition-all ${
                  reminder.completed
                    ? 'bg-gray-100 border-gray-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleComplete(reminder.id)}
                        className={`flex-shrink-0 w-6 h-6 border-2 flex items-center justify-center transition-all ${
                          reminder.completed
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'border-gray-400 hover:border-emerald-600'
                        }`}
                      >
                        {reminder.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <span className={`text-black ${reminder.completed ? 'line-through opacity-60' : ''}`}>
                        {reminder.task}
                      </span>
                    </div>

                    <div className="flex gap-3 text-gray-600 ml-9">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {reminder.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {reminder.time}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}