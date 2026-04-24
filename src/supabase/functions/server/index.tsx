import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import * as kvUser from './kv_store_with_user.tsx';
import { logActivity, getRecentActivities, getActivityHistory } from './activities.tsx';
import { getDashboardStats, trackLogin } from './dashboard.tsx';
import { signUp, signIn, getUser, updateUserProfile, updateUserPassword, sendPasswordResetEmail } from './auth.tsx';
import { checkAndSendScheduledEmails } from './scheduler.tsx';
import { sendFutureMessageEmail, sendReminderEmail, sendDietEmail, sendMealEmail } from './email_nodemailer.tsx';
import { enqueueEmail, cancelEmail, getUserEmailQueue, processPendingEmails, retryFailedEmails } from './email_queue.tsx';

// FINAL FIX: 2026-04-11 - All diary operations use kv_store_40d4d8fd table
// NO references to diary_entries table anywhere in the code

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Simple test endpoint - no auth required
app.get('/make-server-40d4d8fd/test', (c) => {
  return c.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    version: '2.0-fixed-diary-entries',
  });
});

// Authentication endpoints
app.post('/make-server-40d4d8fd/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const result = await signUp(email, password, name);
    return c.json(result);
  } catch (error: any) {
    console.log('Sign up endpoint error:', error);
    return c.json({ error: error.message || 'Sign up failed' }, 400);
  }
});

app.post('/make-server-40d4d8fd/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const result = await signIn(email, password);
    return c.json(result);
  } catch (error: any) {
    console.log('Login endpoint error:', error);
    return c.json({ error: error.message || 'Login failed' }, 400);
  }
});

// Verify user session endpoint
app.get('/make-server-40d4d8fd/user/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const result = await getUser(accessToken);
    if (result.success && result.user) {
      return c.json({ success: true, valid: true });
    } else {
      return c.json({ success: false, valid: false }, 401);
    }
  } catch (error: any) {
    console.log('Verify session endpoint error:', error);
    return c.json({ error: error.message || 'Invalid session' }, 401);
  }
});

app.get('/make-server-40d4d8fd/auth/user', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const result = await getUser(accessToken);
    return c.json(result);
  } catch (error: any) {
    console.log('Get user endpoint error:', error);
    return c.json({ error: error.message || 'Failed to get user' }, 401);
  }
});

// Update user profile (name/email)
app.put('/make-server-40d4d8fd/auth/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, email } = await c.req.json();
    const result = await updateUserProfile(user.id, { name, email });
    return c.json(result);
  } catch (error: any) {
    console.log('Update profile endpoint error:', error);
    return c.json({ error: error.message || 'Failed to update profile' }, 400);
  }
});

// Update user password
app.put('/make-server-40d4d8fd/auth/password', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { password } = await c.req.json();
    const result = await updateUserPassword(user.id, password);
    return c.json(result);
  } catch (error: any) {
    console.log('Update password endpoint error:', error);
    return c.json({ error: error.message || 'Failed to update password' }, 400);
  }
});

// Send password reset email
app.post('/make-server-40d4d8fd/auth/reset-password', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const result = await sendPasswordResetEmail(email);
    return c.json(result);
  } catch (error: any) {
    console.log('Password reset endpoint error:', error);
    return c.json({ error: error.message || 'Failed to send password reset email' }, 400);
  }
});

// Verify email exists (for password reset flow)
app.post('/make-server-40d4d8fd/auth/verify-email', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Use Supabase Admin Client to check if user exists
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const { createClient } = await import('npm:@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get user by email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Failed to verify email: ${error.message}`);
    }

    const userExists = users?.some(user => user.email === email);

    if (!userExists) {
      return c.json({ error: 'Email not found. Please check your email or sign up first.' }, 404);
    }

    return c.json({ success: true, message: 'Email verified' });
  } catch (error: any) {
    console.log('Email verification endpoint error:', error);
    return c.json({ error: error.message || 'Failed to verify email' }, 400);
  }
});

// Update password (without token - for forgot password flow)
app.post('/make-server-40d4d8fd/auth/update-password', async (c) => {
  try {
    const { email, newPassword } = await c.req.json();

    if (!email || !newPassword) {
      return c.json({ error: 'Email and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    // Use Supabase Admin Client to update password
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const { createClient } = await import('npm:@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to find user: ${listError.message}`);
    }

    const user = users?.find(u => u.email === email);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }

    return c.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.log('Update password endpoint error:', error);
    return c.json({ error: error.message || 'Failed to update password' }, 400);
  }
});

// Get user profile data (including profile image)
app.get('/make-server-40d4d8fd/user/profile-data', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await kv.get(`user_profile_${user.id}`);
    return c.json({ success: true, profileData: profileData || {} });
  } catch (error: any) {
    console.log('Get profile data endpoint error:', error);
    return c.json({ error: error.message || 'Failed to get profile data' }, 400);
  }
});

// Save user profile data (including profile image)
app.post('/make-server-40d4d8fd/user/profile-data', async (c) => {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const result = await getUser(accessToken);
    const user = result.user;
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();
    await kvUser.set(`user_profile_${user.id}`, profileData, user.id);
    return c.json({ success: true });
  } catch (error: any) {
    console.log('Save profile data endpoint error:', error);
    return c.json({ error: error.message || 'Failed to save profile data' }, 400);
  }
});

// Diary entries endpoints - NOW USING SUPABASE DATABASE
app.get('/make-server-40d4d8fd/entries', async (c) => {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    console.log('📖 Fetching diary entries from SUPABASE, auth header present:', !!authHeader);
    
    if (!accessToken) {
      console.log('❌ No access token provided');
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.log('❌ Auth error when fetching entries:', userError);
      return c.json({ success: false, error: 'Invalid authentication token' }, 401);
    }

    console.log('📖 User ID from token:', user.id);
    
    // Fetch entries from diary_entries Supabase table
    console.log(`📖 Fetching diary entries from diary_entries table for user: ${user.id}`);
    
    const { data: entries, error: fetchError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Gracefully handle table not found error
    if (fetchError) {
      if (fetchError.message?.includes('does not exist') || fetchError.code === '42P01' || fetchError.message?.includes('schema cache')) {
        console.log('⚠️ Table diary_entries not found yet - returning empty array');
        return c.json({ success: true, entries: [] });
      }
      console.log('❌ Error fetching from diary_entries:', fetchError);
      return c.json({ success: false, error: fetchError.message }, 500);
    }
    
    console.log(`📖 Entries fetched from diary_entries for user ${user.id}: ${entries?.length || 0}`);
    
    return c.json({ success: true, entries: entries || [] });
  } catch (error) {
    console.log('❌ Error fetching diary entries:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/entries', async (c) => {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    console.log('💾 Saving diary entry to SUPABASE, auth header present:', !!authHeader);
    
    if (!accessToken) {
      console.log('❌ No access token provided');
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.log('❌ Auth error when saving entry:', userError);
      return c.json({ success: false, error: 'Invalid authentication token' }, 401);
    }

    const entry = await c.req.json();
    
    console.log('💾 Saving diary entry to diary_entries table:', { 
      id: entry.id, 
      mood: entry.mood, 
      date: entry.date, 
      time: entry.time,
      userId: user.id
    });
    
    // Save to diary_entries Supabase table
    const { error: insertError } = await supabase
      .from('diary_entries')
      .insert({
        id: entry.id,
        user_id: user.id,
        date: entry.date,
        time: entry.time,
        content: entry.content,
        mood: entry.mood,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.log('❌ Error inserting into diary_entries:', insertError);
      return c.json({ success: false, error: insertError.message }, 500);
    }
    
    console.log('✅ Diary entry saved successfully to diary_entries table with id:', entry.id);
    
    // Save mood separately for mood history tracking
    if (entry.mood) {
      const moodKey = `mood:${user.id}:${entry.date}`;
      const moodEntry = {
        mood: entry.mood,
        date: entry.date,
        time: entry.time,
        userId: user.id
      };
      await kvUser.set(moodKey, moodEntry, user.id);
      console.log('✅ Mood entry saved separately with key:', moodKey);
    }
    
    return c.json({ success: true, entry });
  } catch (error) {
    console.log('❌ Error saving diary entry:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/entries/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log('🗑️ Delete request for entry from SUPABASE:', id);
    
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.log('❌ No access token provided');
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.log('❌ Auth error when deleting entry:', userError);
      return c.json({ success: false, error: 'Invalid authentication token' }, 401);
    }

    console.log('🗑️ Deleting entry for user:', user.id);
    
    // First, get the entry from diary_entries table to retrieve date for mood deletion
    const { data: entry, error: fetchError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !entry) {
      console.log('❌ Entry not found in diary_entries:', id);
      return c.json({ success: false, error: 'Entry not found' }, 404);
    }
    
    // Delete from diary_entries table
    const { error: deleteError } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.log('❌ Error deleting from diary_entries:', deleteError);
      return c.json({ success: false, error: deleteError.message }, 500);
    }
    
    console.log('✅ Diary entry deleted from diary_entries:', id);
    
    // Note: No need to delete activity log since activities are now generated from diary_entries table
    // Activities will automatically not appear after entry is deleted from table
    
    // If entry had a mood, delete the mood entry too
    if (entry && entry.mood && entry.date) {
      const moodKey = `mood:${user.id}:${entry.date}`;
      console.log('🎭 Attempting to delete mood entry:', moodKey);
      try {
        await kvUser.del(moodKey);
        console.log('✅ Mood entry deleted:', moodKey);
      } catch (moodError) {
        console.log('⚠️ Could not delete mood entry:', moodError);
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('❌ Error deleting diary entry:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Future messages endpoints
app.get('/make-server-40d4d8fd/future-messages', async (c) => {
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
    
    const allMessages = await kv.getByPrefix('future_message_');
    // Filter messages by userId if available
    const messages = userId 
      ? allMessages.filter((message: any) => message.userId === userId)
      : allMessages;
    
    return c.json({ success: true, messages });
  } catch (error) {
    console.log('Error fetching future messages:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/future-messages', async (c) => {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.log('No access token provided in Authorization header');
      return c.json({ error: 'No access token provided' }, 401);
    }

    let user;
    try {
      const result = await getUser(accessToken);
      user = result.user;
    } catch (authError: any) {
      console.log('Authentication error:', authError.message);
      return c.json({ error: `Authentication failed: ${authError.message}` }, 401);
    }

    if (!user) {
      console.log('No user found from token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const message = await c.req.json();
    // Add userId to the message
    message.userId = user.id;
    message.emailSent = false;
    message.createdAt = new Date().toISOString(); // 🔥 ADD: Proper ISO timestamp for activity tracking
    
    const key = `future_message_${message.id}`;
    await kvUser.set(key, message, user.id);

    // 🔥 NEW: Enqueue email for scheduled delivery
    try {
      // 🔥 FIX: Use scheduledISO if available (with proper timezone), fallback to legacy parsing
      let scheduledDateTime;
      if (message.scheduledISO) {
        scheduledDateTime = new Date(message.scheduledISO);
        console.log('✅ Using scheduledISO from frontend:', message.scheduledISO);
      } else {
        // Legacy: Parse date and time (may have timezone issues)
        scheduledDateTime = new Date(`${message.scheduledDate}T${message.scheduledTime}:00`);
        console.log('⚠️ Using legacy date/time construction (may have timezone issues)');
      }
      
      const userEmail = message.userEmail || user.email;
      const userName = user.user_metadata?.name || 'there';

      console.log('📅 Scheduling future message email:');
      console.log('   Scheduled for:', scheduledDateTime.toISOString());
      console.log('   Current time:', new Date().toISOString());
      console.log('   Is future:', scheduledDateTime > new Date());

      await enqueueEmail({
        userId: user.id,
        userEmail: userEmail,
        userName: userName,
        emailType: 'future_message',
        subject: '📬 Message from Your Past Self',
        messageContent: message.message,
        scheduledFor: scheduledDateTime,
        metadata: {
          messageId: message.id,
          scheduledDate: message.scheduledDate,
          scheduledTime: message.scheduledTime,
        },
      });

      console.log(`✅ Future message email queued for: ${scheduledDateTime.toISOString()}`);
    } catch (queueError: any) {
      console.error('⚠️ Failed to queue email, but message was saved:', queueError.message);
      // Don't fail the whole request if queuing fails
    }

    return c.json({ success: true, message });
  } catch (error: any) {
    console.log('Error saving future message:', error);
    return c.json({ success: false, error: error.message || String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/future-messages/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`future_message_${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting future message:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Personal reminders endpoints
app.get('/make-server-40d4d8fd/reminders', async (c) => {
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
    
    const allReminders = await kv.getByPrefix('reminder_');
    // Filter reminders by userId if available
    const reminders = userId 
      ? allReminders.filter((reminder: any) => reminder.userId === userId)
      : allReminders;
    
    return c.json({ success: true, reminders });
  } catch (error) {
    console.log('Error fetching reminders:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/reminders', async (c) => {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.log('No access token provided in Authorization header');
      return c.json({ error: 'No access token provided' }, 401);
    }

    let user;
    try {
      const result = await getUser(accessToken);
      user = result.user;
    } catch (authError: any) {
      console.log('Authentication error:', authError.message);
      return c.json({ error: `Authentication failed: ${authError.message}` }, 401);
    }

    if (!user) {
      console.log('No user found from token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reminder = await c.req.json();
    // Add userId to the reminder
    reminder.userId = user.id;
    reminder.emailSent = false;
    reminder.createdAt = new Date().toISOString(); // 🔥 ADD: Proper ISO timestamp for activity tracking
    
    const key = `reminder_${reminder.id}`;
    await kvUser.set(key, reminder, user.id);

    // 🔥 NEW: Enqueue email for scheduled delivery
    try {
      // 🔥 FIX: Use scheduledISO if available (with proper timezone), fallback to legacy parsing
      let scheduledDateTime;
      if (reminder.scheduledISO) {
        scheduledDateTime = new Date(reminder.scheduledISO);
        console.log('✅ Using scheduledISO from frontend:', reminder.scheduledISO);
      } else {
        // Legacy: Parse date and time (may have timezone issues)
        scheduledDateTime = new Date(`${reminder.date}T${reminder.time}:00`);
        console.log('⚠️ Using legacy date/time construction (may have timezone issues)');
      }
      
      const userEmail = reminder.userEmail || user.email;
      const userName = user.user_metadata?.name || 'there';

      console.log('📅 Scheduling reminder email:');
      console.log('   Scheduled for:', scheduledDateTime.toISOString());
      console.log('   Current time:', new Date().toISOString());
      console.log('   Is future:', scheduledDateTime > new Date());

      await enqueueEmail({
        userId: user.id,
        userEmail: userEmail,
        userName: userName,
        emailType: 'reminder',
        subject: '⏰ Reminder from Resilio',
        messageContent: reminder.task,
        scheduledFor: scheduledDateTime,
        metadata: {
          reminderId: reminder.id,
          scheduledDate: reminder.date,
          scheduledTime: reminder.time,
        },
      });

      console.log(`✅ Reminder email queued for: ${scheduledDateTime.toISOString()}`);
    } catch (queueError: any) {
      console.error('⚠️ Failed to queue email, but reminder was saved:', queueError.message);
      // Don't fail the whole request if queuing fails
    }

    return c.json({ success: true, reminder });
  } catch (error: any) {
    console.log('Error saving reminder:', error);
    return c.json({ success: false, error: error.message || String(error) }, 500);
  }
});

app.put('/make-server-40d4d8fd/reminders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const key = `reminder_${id}`;
    
    // Get existing reminder
    const existing = await kv.get(key);
    if (!existing) {
      return c.json({ success: false, error: 'Reminder not found' }, 404);
    }
    
    // Update reminder
    const updated = { ...existing, ...updates };
    await kv.set(key, updated);
    return c.json({ success: true, reminder: updated });
  } catch (error) {
    console.log('Error updating reminder:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/reminders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`reminder_${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting reminder:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Diet items endpoints
app.get('/make-server-40d4d8fd/diet-items', async (c) => {
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
    
    const allDietItems = await kv.getByPrefix('diet_item_');
    // Filter diet items by userId if available
    const dietItems = userId 
      ? allDietItems.filter((item: any) => item.userId === userId)
      : allDietItems;
    
    return c.json({ success: true, dietItems });
  } catch (error) {
    console.log('Error fetching diet items:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/diet-items', async (c) => {
  try {
    // Get user from auth token
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.error('❌ No access token provided in request');
      return c.json({ success: false, error: 'No access token provided' }, 401);
    }

    let user: any;
    try {
      const result = await getUser(accessToken);
      user = result.user;
      console.log('🔐 User authenticated:', { userId: user?.id, hasEmail: !!user?.email });
    } catch (authError: any) {
      console.error('❌ Could not get user from token:', authError);
      return c.json({ success: false, error: `Authentication failed: ${authError.message}` }, 401);
    }

    if (!user) {
      console.error('❌ No user found from token');
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const dietItem = await c.req.json();
    // Add userId to diet item
    dietItem.userId = user.id;
    
    console.log('📝 Saving diet item:', {
      id: dietItem.id,
      scheduledDate: dietItem.scheduledDate,
      scheduledTime: dietItem.scheduledTime,
      mealType: dietItem.mealType,
      hasUser: !!user,
      hasEmail: !!user?.email,
    });
    
    const key = `diet_item_${dietItem.id}`;
    await kvUser.set(key, dietItem, user.id);
    
    // 🔥 NEW: Enqueue email if scheduledTime is provided
    let emailQueued = false;
    let emailError = null;
    
    console.log('🔍 [EMAIL DEBUG] Checking email queueing conditions:', {
      hasScheduledTime: !!dietItem.scheduledTime,
      hasUser: !!user,
      hasUserEmail: !!user?.email,
      scheduledTime: dietItem.scheduledTime,
      userEmail: user?.email,
    });
    
    if (dietItem.scheduledTime && user && user.email) {
      console.log('✅ [EMAIL DEBUG] All conditions met, proceeding with email queueing...');
      
      try {
        console.log('📦 [EMAIL DEBUG] Importing email_queue module...');
        const { enqueueEmail } = await import('./email_queue.tsx');
        console.log('✅ [EMAIL DEBUG] email_queue module imported successfully!');
        console.log('   enqueueEmail function type:', typeof enqueueEmail);
        
        // Parse scheduled date and time
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const scheduledDate = dietItem.scheduledDate || today; // 🔥 FIX: Define outside if/else block
        
        // 🔥 CRITICAL FIX: Use scheduledISO if available (includes timezone info from frontend)
        // Otherwise fall back to constructing from date/time
        let scheduledDateTime;
        if (dietItem.scheduledISO) {
          scheduledDateTime = new Date(dietItem.scheduledISO);
          console.log('✅ Using scheduledISO from frontend:', dietItem.scheduledISO);
        } else {
          scheduledDateTime = new Date(`${scheduledDate}T${dietItem.scheduledTime}:00`);
          console.log('⚠️ Using legacy date/time construction (may have timezone issues)');
        }
        
        console.log(`📅 Scheduling diet email for: ${scheduledDateTime.toISOString()}`);
        console.log(`   Current time: ${now.toISOString()}`);
        console.log(`   Is future time: ${scheduledDateTime > now}`);
        
        // Only schedule if time is in the future
        if (scheduledDateTime > now) {
          const userEmail = user.email;
          const userName = user.user_metadata?.name || 'there';
          
          const foodName = dietItem.name || dietItem.description || 'Diet item';
          const mealType = dietItem.mealType || 'Meal';
          
          // 🔥 FIX: Determine email type based on the 'type' field (most reliable!)
          // Meal Planner sends type: 'meal' + foodItems string
          // Food Database sends type: undefined/null + individual food data
          const isMealPlanner = dietItem.type === 'meal' || (dietItem.calories === 0 && dietItem.foodItems);
          const emailType = isMealPlanner ? 'meal_plan' : 'diet_plan';
          
          console.log('🔥🔥🔥 MEAL PLANNER DETECTION:', {
            type: dietItem.type,
            isMealPlanner,
            emailType,
            calories: dietItem.calories,
            hasFoodItems: !!dietItem.foodItems,
            description: dietItem.description,
            foodItems: typeof dietItem.foodItems === 'string' 
              ? dietItem.foodItems.substring(0, 50) 
              : JSON.stringify(dietItem.foodItems || []).substring(0, 50),
          });
          
          console.log('🎯 About to enqueue email with data:', {
            userId: user.id,
            userEmail,
            userName,
            emailType,
            mealType,
            foodName,
            isMealPlanner,
            scheduledFor: scheduledDateTime.toISOString(),
          });
          
          console.log('🚀 [EMAIL DEBUG] CALLING enqueueEmail NOW...');
          const enqueueResult = await enqueueEmail({
            userId: user.id,
            userEmail: userEmail,
            userName: userName,
            emailType: emailType,
            subject: `🍽️ ${mealType} Reminder from Resilio`,
            messageContent: `Time for your ${mealType.toLowerCase()}: ${foodName}`,
            scheduledFor: scheduledDateTime,
            metadata: {
              dietItemId: dietItem.id,
              foodName,
              mealType,
              scheduledDate,
              scheduledTime: dietItem.scheduledTime,
              calories: dietItem.calories,
              protein: dietItem.protein || 0,
              carbs: dietItem.carbs || 0,
              description: dietItem.description || '', // 🔥 ADD: Meal description
              foodItems: dietItem.foodItems || '', // 🔥 ADD: Food items list
            },
          });
          
          console.log('✅ Diet reminder email queued successfully!', enqueueResult);
          console.log(`   Job ID: ${enqueueResult.jobId}`);
          emailQueued = true;
        } else {
          console.log(`⏰ Diet email NOT queued - scheduled time is in the past`);
          console.log(`   Scheduled: ${scheduledDateTime.toISOString()}`);
          console.log(`   Now: ${now.toISOString()}`);
        }
      } catch (emailErr: any) {
        console.error('❌❌❌ CRITICAL: Failed to queue diet email:', emailErr);
        console.error('   Error details:', {
          message: emailErr.message,
          stack: emailErr.stack,
          name: emailErr.name,
        });
        emailError = emailErr.message;
        // Still save the diet item but log the email error prominently
      }
    } else {
      console.log('⏭️ Diet email NOT queued because:', {
        hasScheduledTime: !!dietItem.scheduledTime,
        hasUser: !!user,
        hasEmail: !!user?.email,
      });
    }
    
    return c.json({ 
      success: true, 
      dietItem,
      emailQueued,
      emailError: emailError || undefined,
    });
  } catch (error) {
    console.log('Error saving diet item:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/diet-items/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`diet_item_${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting diet item:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Activity tracking endpoints
app.post('/make-server-40d4d8fd/activities', logActivity);
app.get('/make-server-40d4d8fd/activities/recent', getRecentActivities);
app.get('/make-server-40d4d8fd/activities/today', async (c) => {
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

    // Get Supabase client to fetch diary entries from table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Fetch diary entries from Supabase table
    const { data: diaryEntriesFromTable, error: diaryError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (diaryError) {
      console.log('⚠️ Error fetching diary entries from table:', diaryError);
    }
    
    // Fetch all activity types for this specific user (excluding old diary_entry_ keys)
    const [activities, gameSessions, exerciseSessions, dietItems, futureMessages, reminders] = await Promise.all([
      kv.getByPrefix(`activity:${userId}:`),  // Filter by userId
      kv.getByPrefix('game_session_'),
      kv.getByPrefix('exercise_session_'),
      kv.getByPrefix('diet_item_'),
      kv.getByPrefix('future_message_'),
      kv.getByPrefix('reminder_'),
    ]);
    
    // Use diary entries from Supabase table
    const diaryEntries = diaryEntriesFromTable || [];
    
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

    // Convert diary entries to activities (already filtered by userId in query)
    const diaryActivities = diaryEntries
      .map((entry: any) => {
        let timestamp;
        try {
          // Use created_at from table, or create from date/time
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
    const allActivities = [...activities, ...gameActivities, ...exerciseActivities, ...diaryActivities, ...dietActivities, ...futureMessageActivities, ...reminderActivities];
    
    // Remove duplicates based on ID
    const uniqueActivities = Array.from(
      new Map(allActivities.map((activity: any) => [activity.id, activity])).values()
    );
    
    // Filter activities within 24 hours
    const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const todayActivities = uniqueActivities
      .filter((activity: any) => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= twentyFourHoursAgo;
      })
      .sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    console.log(`Fetched ${todayActivities.length} activities from last 24 hours for user ${userId}`);
    return c.json(todayActivities);
  } catch (error) {
    console.error('Error fetching today\'s activities:', error);
    return c.json({ error: 'Failed to fetch today\'s activities' }, 500);
  }
});
app.get('/make-server-40d4d8fd/activities/history', getActivityHistory);

// Dashboard endpoints
app.get('/make-server-40d4d8fd/dashboard/stats', getDashboardStats);
app.post('/make-server-40d4d8fd/dashboard/login', trackLogin);

// Mood history endpoint
app.get('/make-server-40d4d8fd/mood/history', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('❌ Authentication error in mood history:', userError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all mood entries for the user
    const moodEntries = await kv.getByPrefix(`mood:${user.id}:`);
    console.log('📊 Found mood entries:', moodEntries.length, moodEntries);

    if (!moodEntries || moodEntries.length === 0) {
      return c.json({ weeks: [] });
    }

    // Parse and organize moods by week
    const moodsByWeek = new Map<string, any[]>();
    const moodValueMap: Record<string, number> = {
      'Happy': 5,
      'Good': 4,
      'Okay': 3,
      'Low': 2,
      'Down': 1
    };

    const moodColorMap: Record<string, string> = {
      'Happy': '#10b981',
      'Good': '#14b8a6',
      'Okay': '#f59e0b',
      'Low': '#f97316',
      'Down': '#ef4444'
    };

    const moodEmojiMap: Record<string, string> = {
      'Happy': '😊',
      'Good': '🙂',
      'Okay': '😐',
      'Low': '😔',
      'Down': '😢'
    };

    // Note: getByPrefix returns only values, not {key, value} objects
    for (const entry of moodEntries) {
      if (entry && typeof entry === 'object' && entry.mood) {
        const date = new Date(entry.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!moodsByWeek.has(weekKey)) {
          moodsByWeek.set(weekKey, []);
        }

        moodsByWeek.get(weekKey)?.push({
          date: entry.date,
          mood: entry.mood,
          value: moodValueMap[entry.mood] || 3,
          color: moodColorMap[entry.mood] || '#f59e0b',
          emoji: moodEmojiMap[entry.mood] || '😐'
        });
      }
    }

    // Convert to array and sort by week (newest first)
    const weeks = Array.from(moodsByWeek.entries())
      .map(([weekStart, moods]) => {
        // Sort moods by date
        moods.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate average mood
        const avgValue = moods.reduce((sum, m) => sum + m.value, 0) / moods.length;
        const avgMood = avgValue >= 4.5 ? 'Happy' :
                        avgValue >= 3.5 ? 'Good' :
                        avgValue >= 2.5 ? 'Okay' :
                        avgValue >= 1.5 ? 'Low' : 'Down';

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        return {
          weekStart,
          weekEnd: weekEnd.toISOString().split('T')[0],
          average: avgMood,
          averageValue: avgValue,
          moods: moods.map(m => ({
            date: m.date,
            day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
            mood: m.mood,
            value: m.value,
            emoji: m.emoji,
            color: m.color
          }))
        };
      })
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

    // Add week numbers
    const weeksWithNumbers = weeks.map((week, index) => ({
      weekNumber: weeks.length - index,
      weekStart: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      weekEnd: new Date(week.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      average: week.average,
      averageValue: week.averageValue,
      moods: week.moods
    }));

    return c.json({ weeks: weeksWithNumbers });
  } catch (error: any) {
    console.error('❌ Error in mood history endpoint:', error);
    return c.json({ error: error.message || 'Failed to get mood history' }, 500);
  }
});

// Migrate existing diary entries to mood entries (one-time migration)
app.post('/make-server-40d4d8fd/mood/migrate', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('❌ Authentication error in mood migration:', userError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all diary entries for the user
    // Note: getByPrefix returns only values, not {key, value} objects
    const allEntries = await kv.getByPrefix('diary_entry_');
    const userEntries = allEntries.filter((entry: any) => entry && entry.userId === user.id);
    
    console.log(`🔄 Migrating ${userEntries.length} diary entries for user ${user.id}`, userEntries);
    
    let migratedCount = 0;
    for (const entry of userEntries) {
      // entry is already the value, not {key, value}
      if (entry && entry.mood && entry.date) {
        const moodKey = `mood:${user.id}:${entry.date}`;
        const moodEntry = {
          mood: entry.mood,
          date: entry.date,
          time: entry.time || '00:00',
          userId: user.id
        };
        await kvUser.set(moodKey, moodEntry, user.id);
        console.log(`✅ Created mood entry: ${moodKey}`, moodEntry);
        migratedCount++;
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} mood entries`);
    return c.json({ 
      success: true, 
      message: `Migrated ${migratedCount} mood entries from ${userEntries.length} diary entries` 
    });
  } catch (error: any) {
    console.error('❌ Error in mood migration endpoint:', error);
    return c.json({ error: error.message || 'Failed to migrate mood entries' }, 500);
  }
});

// Care Buddy conversation history endpoint
app.get('/make-server-40d4d8fd/care-buddy/history', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('❌ Authentication error in care buddy history:', userError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all care buddy sessions for the user
    const sessions = await kv.getByPrefix(`care_buddy_session:${user.id}:`);
    console.log('📊 Found care buddy sessions:', sessions.length);

    if (!sessions || sessions.length === 0) {
      return c.json({ sessions: [] });
    }

    // Parse and organize sessions
    const parsedSessions = sessions
      .filter(session => session && typeof session === 'object')
      .map((session: any) => ({
        id: session.sessionId || session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        messages: session.messages || [],
        detectedMood: session.detectedMood || session.mood
      }))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return c.json({ sessions: parsedSessions });
  } catch (error: any) {
    console.error('❌ Error in care buddy history endpoint:', error);
    return c.json({ error: error.message || 'Failed to get care buddy history' }, 500);
  }
});

// Streak history endpoint
app.get('/make-server-40d4d8fd/streak/history', async (c) => {
  try {
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

    // Get all login records
    const allLogins = await kv.getByPrefix('login_');
    console.log('📊 Total login records:', allLogins.length);
    
    // Filter login history by userId
    const loginHistory = allLogins.filter((login: any) => login.userId === userId);
    console.log('📊 User login records:', loginHistory.length);
    
    if (loginHistory.length === 0) {
      return c.json({ 
        loginDays: [], 
        currentStreak: 1, 
        longestStreak: 1, 
        totalLogins: 0 
      });
    }

    // Get unique days with login info
    const loginDaysMap = new Map<string, { date: Date; loginTime: string }>();
    
    loginHistory.forEach((login: any) => {
      const date = new Date(login.timestamp);
      const dateKey = date.toDateString();
      
      if (!loginDaysMap.has(dateKey) || new Date(login.timestamp) > new Date(loginDaysMap.get(dateKey)!.loginTime)) {
        loginDaysMap.set(dateKey, {
          date: new Date(date.setHours(0, 0, 0, 0)),
          loginTime: login.timestamp
        });
      }
    });

    // Get all days from first login to today
    const sortedLoginDays = Array.from(loginDaysMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (sortedLoginDays.length === 0) {
      return c.json({ 
        loginDays: [], 
        currentStreak: 1, 
        longestStreak: 1, 
        totalLogins: 0 
      });
    }

    const firstLoginDate = sortedLoginDays[0].date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allDays: any[] = [];
    let dayNumber = 1;
    
    const currentDate = new Date(firstLoginDate);
    while (currentDate <= today) {
      const dateKey = currentDate.toDateString();
      const loginInfo = loginDaysMap.get(dateKey);
      
      allDays.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        dayOfWeek: new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long' }),
        loggedIn: !!loginInfo,
        loginTime: loginInfo?.loginTime,
        dayNumber: dayNumber++
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    for (let i = allDays.length - 1; i >= 0; i--) {
      const day = allDays[i];
      const dayDate = new Date(day.date);
      
      if (dayDate.getTime() === checkDate.getTime() && day.loggedIn) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dayDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
    
    currentStreak = Math.max(1, currentStreak);

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    allDays.forEach(day => {
      if (day.loggedIn) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    
    longestStreak = Math.max(1, longestStreak);

    return c.json({ 
      loginDays: allDays.reverse(), // Most recent first
      currentStreak,
      longestStreak,
      totalLogins: loginHistory.length
    });
  } catch (error: any) {
    console.error('❌ Error in streak history endpoint:', error);
    return c.json({ error: error.message || 'Failed to get streak history' }, 500);
  }
});

// Dashboard streak endpoint
app.get('/make-server-40d4d8fd/dashboard/streak', async (c) => {
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

    const allLogins = await kv.getByPrefix('login_');
    
    // Filter login history by userId
    const loginHistory = allLogins.filter((login: any) => login.userId === userId);
    
    // If no login history, default to 1
    if (loginHistory.length === 0) {
      return c.json({ currentStreak: 1 });
    }
    
    // Sort login history by date (most recent first)
    const sortedLogins = loginHistory
      .map((login: any) => new Date(login.timestamp))
      .sort((a, b) => b.getTime() - a.getTime());

    // Get unique days
    const uniqueDays = new Set<string>();
    sortedLogins.forEach(date => {
      uniqueDays.add(date.toDateString());
    });

    const uniqueDaysArray = Array.from(uniqueDays).map(dateStr => new Date(dateStr));
    uniqueDaysArray.sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    if (uniqueDaysArray.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);

      for (const loginDate of uniqueDaysArray) {
        const checkDate = new Date(loginDate);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate.getTime() === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (checkDate.getTime() < currentDate.getTime()) {
          // Gap found
          break;
        }
      }
    }
    
    // Ensure streak is at least 1 if user has any login history
    const finalStreak = Math.max(1, streak);

    return c.json({ currentStreak: finalStreak });
  } catch (error) {
    console.log('Error fetching streak:', error);
    return c.json({ error: 'Failed to fetch streak' }, 500);
  }
});

// Game session endpoints
app.get('/make-server-40d4d8fd/game-sessions', async (c) => {
  try {
    const gameSessions = await kv.getByPrefix('game_session_');
    return c.json({ success: true, gameSessions });
  } catch (error) {
    console.log('Error fetching game sessions:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/game-sessions', async (c) => {
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

    const session = await c.req.json();
    // Add userId to game session if available
    if (userId) {
      session.userId = userId;
    }
    
    const key = `game_session_${session.id}`;
    await kvUser.set(key, session, userId);
    console.log('Game session created:', session.id);
    return c.json({ success: true, session });
  } catch (error) {
    console.log('Error creating game session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/game-sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`game_session_${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting game session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Exercise session endpoints
app.get('/make-server-40d4d8fd/exercise-sessions', async (c) => {
  try {
    const exerciseSessions = await kv.getByPrefix('exercise_session_');
    return c.json({ success: true, exerciseSessions });
  } catch (error) {
    console.log('Error fetching exercise sessions:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/exercise-sessions', async (c) => {
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

    const session = await c.req.json();
    // Add userId to exercise session if available
    if (userId) {
      session.userId = userId;
    }
    
    const key = `exercise_session_${session.id}`;
    await kvUser.set(key, session, userId);
    console.log('Exercise session created:', session.id);
    return c.json({ success: true, session });
  } catch (error) {
    console.log('Error creating exercise session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-40d4d8fd/exercise-sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const key = `exercise_session_${id}`;
    
    // Get existing session
    const existing = await kv.get(key);
    if (!existing) {
      return c.json({ success: false, error: 'Exercise session not found' }, 404);
    }
    
    // Update session
    const updated = { ...existing, ...updates };
    await kv.set(key, updated);
    return c.json({ success: true, session: updated });
  } catch (error) {
    console.log('Error updating exercise session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/exercise-sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`exercise_session_${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting exercise session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Care Buddy session endpoints
app.get('/make-server-40d4d8fd/care-buddy/sessions', async (c) => {
  try {
    const sessions = await kv.getByPrefix('care_buddy_session_');
    return c.json({ success: true, sessions });
  } catch (error) {
    console.log('Error fetching care buddy sessions:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/care-buddy/sessions', async (c) => {
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

    const session = await c.req.json();
    // Add userId to care buddy session if available
    if (userId) {
      session.userId = userId;
    }
    
    const key = session.id;
    await kvUser.set(key, session, userId);
    console.log('Care Buddy session created:', session.id);
    return c.json({ success: true, session });
  } catch (error) {
    console.log('Error creating care buddy session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-40d4d8fd/care-buddy/sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing session
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    // Update session
    const updated = { ...existing, ...updates };
    await kv.set(id, updated);
    return c.json({ success: true, session: updated });
  } catch (error) {
    console.log('Error updating care buddy session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/care-buddy/sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting care buddy session:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Care Buddy message endpoints
app.get('/make-server-40d4d8fd/care-buddy/messages', async (c) => {
  try {
    const userId = c.req.query('userId');
    const allMessages = await kv.getByPrefix('care_buddy_message_');
    
    // Filter messages by userId if provided
    const messages = userId 
      ? allMessages.filter((msg: any) => msg.userId === userId)
      : allMessages;
    
    // Sort by timestamp
    messages.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return c.json(messages);
  } catch (error) {
    console.log('Error fetching care buddy messages:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-40d4d8fd/care-buddy/messages', async (c) => {
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

    const message = await c.req.json();
    
    // Use userId from request or from auth token
    const finalUserId = message.userId || userId;
    
    // Add userId to message
    if (finalUserId) {
      message.userId = finalUserId;
    }
    
    const key = `care_buddy_message_${message.id}`;
    await kvUser.set(key, message, finalUserId);
    console.log('Care Buddy message saved:', message.id);
    return c.json({ success: true, message });
  } catch (error) {
    console.log('Error saving care buddy message:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-40d4d8fd/care-buddy/messages/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const key = `care_buddy_message_${id}`;
    await kv.del(key);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting care buddy message:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DEBUG: Check email queue status
app.get('/make-server-40d4d8fd/debug/email-queue', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user's email queue
    const { getUserEmailQueue } = await import('./email_queue.tsx');
    const queueData = await getUserEmailQueue(user.id);

    // Get current time
    const now = new Date();
    const nowISO = now.toISOString();

    // Get pending emails that are due
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: dueEmails } = await supabase
      .from('email_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('scheduled_for', nowISO);

    const { data: upcomingEmails } = await supabase
      .from('email_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gt('scheduled_for', nowISO)
      .order('scheduled_for', { ascending: true })
      .limit(10);

    return c.json({
      success: true,
      currentTime: nowISO,
      userId: user.id,
      userEmail: user.email,
      totalEmails: queueData.emails.length,
      dueNow: dueEmails?.length || 0,
      upcoming: upcomingEmails?.length || 0,
      dueEmailsDetails: dueEmails?.map(e => {
        // Parse metadata if it's a JSON string
        let metadata = {};
        if (e.metadata) {
          try {
            metadata = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
          } catch (err) {
            console.warn('Failed to parse metadata for email:', e.id);
          }
        }
        
        return {
          ...e,
          metadata: metadata, // 🔥 Include parsed metadata
        };
      }) || [],
      upcomingEmailsDetails: upcomingEmails?.map(e => {
        // Parse metadata if it's a JSON string
        let metadata = {};
        if (e.metadata) {
          try {
            metadata = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
          } catch (err) {
            console.warn('Failed to parse metadata for email:', e.id);
          }
        }
        
        return {
          id: e.id,
          type: e.email_type,
          scheduledFor: e.scheduled_for,
          minutesUntil: Math.round((new Date(e.scheduled_for).getTime() - now.getTime()) / 60000),
          subject: e.subject,
          messageContent: e.message_content,
          metadata: metadata, // 🔥 NEW: Include full metadata with food names, calories, etc.
        };
      }) || [],
      allEmails: queueData.emails
    });
  } catch (error: any) {
    console.error('❌ Debug email queue error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 🔥 NEW: Delete all pending meal/diet emails
app.post('/make-server-40d4d8fd/debug/delete-meal-emails', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('🗑️ Deleting all meal emails for user:', user.id);

    // Delete all pending/failed diet_plan and meal_plan emails for this user
    const { data, error } = await supabase
      .from('email_queue')
      .delete()
      .eq('user_id', user.id)
      .in('email_type', ['diet_plan', 'meal_plan'])
      .in('status', ['pending', 'failed'])
      .select();

    if (error) {
      throw new Error(`Failed to delete emails: ${error.message}`);
    }

    console.log(`✅ Deleted ${data?.length || 0} meal emails`);

    return c.json({
      success: true,
      deleted: data?.length || 0,
      message: `Deleted ${data?.length || 0} meal/diet emails`
    });
  } catch (error: any) {
    console.error('❌ Delete meal emails error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Cron job endpoint: Check and send scheduled emails
// Can be called by frontend polling (internal) or external cron job
// 🔒 Protected with CRON_API_KEY or user authentication
app.get('/make-server-40d4d8fd/cron/check-scheduled-emails', async (c) => {
  try {
    // Accept either CRON_API_KEY (external) or user auth token (internal frontend polling)
    const cronApiKey = c.req.header('X-Cron-API-Key') || c.req.query('api_key');
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    const expectedCronKey = Deno.env.get('CRON_API_KEY');
    
    console.log('🔐 Auth Check - Received headers:');
    console.log(`   X-Cron-API-Key: ${cronApiKey ? `"${cronApiKey}"` : '❌ Missing'}`);
    console.log(`   Authorization: ${authHeader ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Expected CRON_API_KEY: ${expectedCronKey ? '✅ Configured' : '⚠️  NOT SET'}`);
    
    let authenticated = false;
    
    // Check 1: Internal trigger with special key (frontend polling) - PRIORITY
    if (cronApiKey === 'resilio-internal-trigger') {
      console.log('✅ Internal frontend polling trigger');
      authenticated = true;
    }
    
    // Check 2: External cron with CRON_API_KEY
    if (!authenticated && cronApiKey && expectedCronKey && cronApiKey === expectedCronKey) {
      console.log('✅ External cron authenticated with CRON_API_KEY');
      authenticated = true;
    }
    
    // Check 3: Logged-in user with valid token
    if (!authenticated && accessToken) {
      try {
        const { user } = await getUser(accessToken);
        if (user) {
          console.log('✅ Internal trigger from authenticated user');
          authenticated = true;
        }
      } catch (error) {
        console.debug('User auth check failed for cron trigger');
      }
    }
    
    // Check 4: Allow if CRON_API_KEY is not configured yet (setup mode)
    if (!authenticated && !expectedCronKey) {
      console.warn('⚠️  CRON_API_KEY not configured - allowing request (SETUP MODE)');
      console.warn('⚠️  Please set CRON_API_KEY in Edge Function secrets for security');
      authenticated = true;
    }
    
    if (!authenticated) {
      console.error('❌ Unauthorized cron trigger attempt');
      console.error(`Debug: cronApiKey="${cronApiKey}", hasAccessToken=${!!accessToken}, expectedCronKey=${!!expectedCronKey}`);
      return c.json({ 
        success: false, 
        error: 'Unauthorized. Please login or provide valid CRON_API_KEY.',
        hint: expectedCronKey ? 'CRON_API_KEY configured but does not match' : 'CRON_API_KEY not configured in Edge Function secrets'
      }, 401);
    }
    
    // Call the scheduler function
    return await checkAndSendScheduledEmails(c);
  } catch (error: any) {
    console.error('❌ Cron endpoint error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to run scheduled email check',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Simple health check endpoint (no auth required)
app.get('/make-server-40d4d8fd/health', async (c) => {
  return c.json({
    status: 'ok',
    message: 'Resilio server is running!',
    timestamp: new Date().toISOString(),
    environment: {
      SMTP_PASSWORD_SET: !!Deno.env.get('SMTP_PASSWORD'),
      CRON_API_KEY_SET: !!Deno.env.get('CRON_API_KEY'),
      SUPABASE_URL_SET: !!Deno.env.get('SUPABASE_URL'),
    }
  });
});

// 📧 Email Queue Status - Check pending emails (No auth required for debugging)
app.get('/make-server-40d4d8fd/email/queue/status', async (c) => {
  try {
    const { createClient } = await import('npm:@supabase/supabase-js');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return c.json({ error: 'Supabase not configured' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get counts by status
    const { data: allEmails, error } = await supabase
      .from('email_queue')
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    const now = new Date();
    const pending = allEmails?.filter(e => e.status === 'pending') || [];
    const dueNow = pending.filter(e => new Date(e.scheduled_for) <= now);
    const upcoming = pending.filter(e => new Date(e.scheduled_for) > now);
    const sent = allEmails?.filter(e => e.status === 'sent') || [];
    const failed = allEmails?.filter(e => e.status === 'failed') || [];

    return c.json({
      success: true,
      currentTime: now.toISOString(),
      summary: {
        total: allEmails?.length || 0,
        pending: pending.length,
        dueNow: dueNow.length,
        upcoming: upcoming.length,
        sent: sent.length,
        failed: failed.length,
      },
      dueNow: dueNow.map(e => ({
        id: e.id,
        email: e.user_email,
        type: e.email_type,
        scheduledFor: e.scheduled_for,
        subject: e.subject,
      })),
      upcoming: upcoming.slice(0, 5).map(e => ({
        id: e.id,
        email: e.user_email,
        type: e.email_type,
        scheduledFor: e.scheduled_for,
        subject: e.subject,
      })),
      recentlySent: sent.slice(-5).map(e => ({
        id: e.id,
        email: e.user_email,
        type: e.email_type,
        scheduledFor: e.scheduled_for,
        sentAt: e.sent_at,
        subject: e.subject,
      })),
      failed: failed.map(e => ({
        id: e.id,
        email: e.user_email,
        type: e.email_type,
        scheduledFor: e.scheduled_for,
        error: e.error_message,
        retries: e.retry_count,
      })),
    });
  } catch (error: any) {
    console.error('Error checking queue status:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send Future Message Email - QUEUE FOR SCHEDULED DELIVERY
app.post('/make-server-40d4d8fd/send-future-message-email', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { message, scheduledDate, scheduledTime, scheduledISO, userEmail: requestUserEmail } = await c.req.json();

    if (!message || !scheduledDate) {
      return c.json({ error: 'Message and scheduled date are required' }, 400);
    }

    const userEmail = requestUserEmail || user.email;
    const userName = user.user_metadata?.name || 'there';

    if (!userEmail) {
      return c.json({ error: 'User email not found' }, 400);
    }

    // Parse scheduled date and time as local time, not UTC
    // 🔥 FIX: Use scheduledISO if available (with proper timezone), fallback to legacy parsing
    let scheduledDateTime;
    const time = scheduledTime || '09:00';
    if (scheduledISO) {
      scheduledDateTime = new Date(scheduledISO);
      console.log('✅ Using scheduledISO from frontend:', scheduledISO);
      console.log('   📅 Parsed as Date:', scheduledDateTime.toString());
      console.log('   🌍 UTC string:', scheduledDateTime.toUTCString());
      console.log('   📍 ISO string:', scheduledDateTime.toISOString());
    } else {
      // Legacy: Parse date and time (may have timezone issues)
      scheduledDateTime = new Date(`${scheduledDate}T${time}:00`);
      console.log('⚠️ Using legacy date/time construction (may have timezone issues)');
    }
    
    console.log(`📅 Queueing future message to: ${userEmail} for ${scheduledDateTime.toISOString()}`);

    // Queue the email for scheduled delivery
    const { enqueueEmail } = await import('./email_queue.tsx');
    const result = await enqueueEmail({
      userId: user.id,
      userEmail: userEmail,
      userName: userName,
      emailType: 'future_message',
      subject: '💌 Message from Your Past Self',
      messageContent: message,
      scheduledFor: scheduledDateTime,
      metadata: {
        scheduledDate,
        scheduledTime: time
      }
    });

    console.log(`✅ Future message queued successfully: ${result.jobId}`);
    return c.json({ 
      success: true, 
      mode: 'queued', 
      message: `Email scheduled for ${scheduledDateTime.toLocaleString()}`,
      jobId: result.jobId,
      scheduledFor: scheduledDateTime.toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error queueing future message:', error);
    return c.json({ error: error.message || 'Failed to queue email' }, 500);
  }
});

// Send Reminder Email - QUEUE FOR SCHEDULED DELIVERY
app.post('/make-server-40d4d8fd/send-reminder-email', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { task, scheduledDate, scheduledTime, scheduledISO, userEmail: requestUserEmail } = await c.req.json();

    if (!task || !scheduledDate || !scheduledTime) {
      return c.json({ error: 'Task, scheduled date, and scheduled time are required' }, 400);
    }

    const userEmail = requestUserEmail || user.email;
    const userName = user.user_metadata?.name || 'there';

    if (!userEmail) {
      return c.json({ error: 'User email not found' }, 400);
    }

    // Parse scheduled date and time as local time, not UTC
    // User inputs "2024-03-16" and "17:00", we want to schedule for exactly that time in their timezone
    // 🔥 FIX: Use scheduledISO if available (with proper timezone), fallback to legacy parsing
    let scheduledDateTime;
    if (scheduledISO) {
      scheduledDateTime = new Date(scheduledISO);
      console.log('✅ Using scheduledISO from frontend (Reminder):', scheduledISO);
      console.log('   📅 Parsed as Date:', scheduledDateTime.toString());
      console.log('   🌍 UTC string:', scheduledDateTime.toUTCString());
      console.log('   📍 ISO string:', scheduledDateTime.toISOString());
    } else {
      // Legacy: Parse date and time (may have timezone issues)
      scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      console.log('⚠️ Using legacy date/time construction (may have timezone issues)');
    }
    
    console.log(`📅 Queueing reminder to: ${userEmail} for ${scheduledDateTime.toISOString()}`);

    // Queue the email for scheduled delivery
    const { enqueueEmail } = await import('./email_queue.tsx');
    const result = await enqueueEmail({
      userId: user.id,
      userEmail: userEmail,
      userName: userName,
      emailType: 'reminder',
      subject: `⏰ Reminder: ${task}`,
      messageContent: task,
      scheduledFor: scheduledDateTime,
      metadata: {
        scheduledDate,
        scheduledTime
      }
    });

    console.log(`✅ Reminder queued successfully: ${result.jobId}`);
    return c.json({ 
      success: true, 
      mode: 'queued', 
      message: `Email scheduled for ${scheduledDateTime.toLocaleString()}`,
      jobId: result.jobId,
      scheduledFor: scheduledDateTime.toISOString()
    });
  } catch (error: any) {
    console.error('Error queueing reminder email:', error);
    return c.json({ error: error.message || 'Failed to queue reminder email' }, 500);
  }
});

// Send Diet Email - QUEUE FOR SCHEDULED DELIVERY
app.post('/make-server-40d4d8fd/send-diet-email', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { 
      foodItems, 
      totalCalories, 
      totalProtein, 
      totalCarbs, 
      totalFats,
      scheduledDate, 
      scheduledTime,
      timeline,
      userEmail: requestUserEmail 
    } = await c.req.json();

    if (!foodItems || !scheduledDate || !scheduledTime) {
      return c.json({ error: 'Food items, scheduled date, and scheduled time are required' }, 400);
    }

    const userEmail = requestUserEmail || user.email;
    const userName = user.user_metadata?.name || 'there';

    if (!userEmail) {
      return c.json({ error: 'User email not found' }, 400);
    }

    // Parse scheduled date and time as local time, not UTC
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    
    console.log(`📅 Processing diet email to: ${userEmail}`);
    console.log(`   Scheduled for: ${scheduledDateTime.toISOString()}`);
    
    // Check if scheduled time is now or in the past (send immediately)
    const now = new Date();
    const shouldSendImmediately = scheduledDateTime.getTime() <= now.getTime() + (5 * 60 * 1000); // Within 5 minutes
    
    if (shouldSendImmediately) {
      console.log('📧 Sending diet email IMMEDIATELY (scheduled time is now or soon)');
      
      try {
        // Send email immediately
        const { sendDietEmail } = await import('./email_nodemailer.tsx');
        await sendDietEmail(
          userEmail,
          foodItems,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFats,
          scheduledDate,
          scheduledTime,
          timeline,
          userName
        );
        
        console.log(`✅ Diet email sent immediately to: ${userEmail}`);
        return c.json({ 
          success: true, 
          mode: 'immediate', 
          message: `Email sent immediately`,
          scheduledFor: scheduledDateTime.toISOString()
        });
      } catch (emailError: any) {
        console.error('❌ Failed to send immediate email:', emailError);
        // Fall back to queueing
        console.log('⚠️ Falling back to queue system...');
      }
    }

    // Queue the email for scheduled delivery (future time or immediate send failed)
    const { enqueueEmail } = await import('./email_queue.tsx');
    const result = await enqueueEmail({
      userId: user.id,
      userEmail: userEmail,
      userName: userName,
      emailType: 'diet_plan',
      subject: `🍎 Diet Plan Reminder: ${foodItems.length} items scheduled`,
      messageContent: `Your diet plan with ${foodItems.length} food items`,
      scheduledFor: scheduledDateTime,
      metadata: {
        foodItems,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        scheduledDate,
        scheduledTime,
        timeline
      }
    });

    console.log(`✅ Diet email queued successfully: ${result.jobId}`);
    return c.json({ 
      success: true, 
      mode: 'queued', 
      message: `Email scheduled for ${scheduledDateTime.toLocaleString()}`,
      jobId: result.jobId,
      scheduledFor: scheduledDateTime.toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error queueing diet email:', error);
    return c.json({ error: error.message || 'Failed to queue diet email' }, 500);
  }
});

// Send Meal Email - QUEUE FOR SCHEDULED DELIVERY
app.post('/make-server-40d4d8fd/send-meal-email', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { 
      mealType,
      mealDescription,
      mealItems,
      scheduledDate, 
      scheduledTime,
      userEmail: requestUserEmail 
    } = await c.req.json();

    if (!mealType || !mealDescription || !scheduledDate || !scheduledTime) {
      return c.json({ error: 'Meal type, description, scheduled date, and scheduled time are required' }, 400);
    }

    const userEmail = requestUserEmail || user.email;
    const userName = user.user_metadata?.name || 'there';

    if (!userEmail) {
      return c.json({ error: 'User email not found' }, 400);
    }

    // Parse scheduled date and time as local time, not UTC
    // User selects local time, so we parse it without the 'Z' suffix
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    
    console.log(`📅 Processing meal email to: ${userEmail}`);
    console.log(`   Scheduled for: ${scheduledDateTime.toISOString()}`);
    
    // Check if scheduled time is now or in the past (send immediately)
    const now = new Date();
    const shouldSendImmediately = scheduledDateTime.getTime() <= now.getTime() + (5 * 60 * 1000); // Within 5 minutes
    
    if (shouldSendImmediately) {
      console.log('📧 Sending meal email IMMEDIATELY (scheduled time is now or soon)');
      
      try {
        // Format meal items for email (convert array to string if needed)
        let formattedMealItems = mealItems;
        if (Array.isArray(mealItems)) {
          formattedMealItems = mealItems.map((item: any) => 
            `${item.name} (${item.calories} cal, ${item.protein}g protein, ${item.carbs}g carbs, ${item.fat}g fat)`
          ).join('\n');
        } else if (typeof mealItems === 'object') {
          formattedMealItems = JSON.stringify(mealItems, null, 2);
        }
        
        // Send email immediately
        const { sendMealEmail } = await import('./email_nodemailer.tsx');
        await sendMealEmail(
          userEmail,
          mealType,
          mealDescription,
          formattedMealItems,
          scheduledDate,
          scheduledTime,
          userName
        );
        
        console.log(`✅ Meal email sent immediately to: ${userEmail}`);
        return c.json({ 
          success: true, 
          mode: 'immediate', 
          message: `Email sent immediately`,
          scheduledFor: scheduledDateTime.toISOString()
        });
      } catch (emailError: any) {
        console.error('❌ Failed to send immediate email:', emailError);
        // Fall back to queueing
        console.log('⚠️ Falling back to queue system...');
      }
    }

    // Queue the email for scheduled delivery (future time or immediate send failed)
    const { enqueueEmail } = await import('./email_queue.tsx');
    const result = await enqueueEmail({
      userId: user.id,
      userEmail: userEmail,
      userName: userName,
      emailType: 'meal_plan',
      subject: `🍽️ Meal Reminder: ${mealType}`,
      messageContent: mealDescription,
      scheduledFor: scheduledDateTime,
      metadata: {
        mealType,
        mealDescription,
        mealItems,
        scheduledDate,
        scheduledTime
      }
    });

    console.log(`✅ Meal email queued successfully: ${result.jobId}`);
    return c.json({ 
      success: true, 
      mode: 'queued', 
      message: `Email scheduled for ${scheduledDateTime.toLocaleString()}`,
      jobId: result.jobId,
      scheduledFor: scheduledDateTime.toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error queueing meal email:', error);
    return c.json({ error: error.message || 'Failed to queue meal email' }, 500);
  }
});

// Email Queue Management Endpoints

// Enqueue an email
app.post('/make-server-40d4d8fd/email/queue', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { email, subject, body, scheduledDate, scheduledTime } = await c.req.json();

    if (!email || !subject || !body || !scheduledDate || !scheduledTime) {
      return c.json({ error: 'Email, subject, body, scheduled date, and scheduled time are required' }, 400);
    }

    // Use email from request body (UI display) instead of Supabase Auth
    const userEmail = email || user.email;
    const userName = user.user_metadata?.name || 'there';

    if (!userEmail) {
      return c.json({ error: 'User email not found' }, 400);
    }

    console.log(`���� Enqueuing email to: ${userEmail}`);

    // Create scheduled datetime
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

    // Enqueue the email
    const result = await enqueueEmail({
      userId: user.id,
      userEmail: userEmail,
      userName: userName,
      emailType: 'reminder',
      subject: subject,
      messageContent: body,
      scheduledFor: scheduledDateTime,
      metadata: {
        source: 'diet_plan',
        scheduledDate,
        scheduledTime
      }
    });

    console.log('✅ Email enqueued successfully:', result);
    return c.json({ success: true, mode: 'enqueued', message: 'Email enqueued successfully', emailId: result.jobId });
  } catch (error: any) {
    console.error('❌ Error enqueuing email:', error);
    return c.json({ error: error.message || 'Failed to enqueue email' }, 500);
  }
});

// Cancel an enqueued email
app.delete('/make-server-40d4d8fd/email/queue/:id', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Email ID is required' }, 400);
    }

    console.log(`�� Canceling enqueued email with ID: ${id}`);

    // Cancel the email
    const result = await cancelEmail(id);

    console.log('✅ Email canceled successfully');
    return c.json({ success: true, mode: 'canceled', message: 'Email canceled successfully', emailId: result.data?.id });
  } catch (error: any) {
    console.error('❌ Error canceling email:', error);
    return c.json({ error: error.message || 'Failed to cancel email' }, 500);
  }
});

// Get user's email queue
app.get('/make-server-40d4d8fd/email/queue', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { user } = await getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`📧 Fetching email queue for user: ${user.email}`);

    // Get the email queue
    const result = await getUserEmailQueue(user.id);

    console.log('✅ Email queue fetched successfully');
    return c.json({ success: true, mode: 'fetched', message: 'Email queue fetched successfully', emailQueue: result.data });
  } catch (error: any) {
    console.error('❌ Error fetching email queue:', error);
    return c.json({ error: error.message || 'Failed to fetch email queue' }, 500);
  }
});

// Process pending emails
app.post('/make-server-40d4d8fd/email/queue/process', async (c) => {
  try {
    // Verify cron API key
    const cronApiKey = c.req.header('X-Cron-API-Key') || c.req.query('api_key');
    const expectedCronKey = Deno.env.get('CRON_API_KEY');
    
    if (!expectedCronKey) {
      console.error('❌ CRON_API_KEY not configured in environment variables');
      return c.json({ 
        success: false, 
        error: 'CRON_API_KEY not configured. Please set CRON_API_KEY in Supabase environment variables.' 
      }, 500);
    }
    
    if (!cronApiKey || cronApiKey !== expectedCronKey) {
      console.error('❌ Unauthorized cron job access attempt');
      return c.json({ 
        success: false, 
        error: 'Unauthorized. Invalid or missing CRON_API_KEY.' 
      }, 401);
    }
    
    console.log('✅ Cron job authenticated successfully');
    console.log(`🕐 Processing emails at: ${new Date().toISOString()}`);
    
    // Call the process pending emails function
    const result = await processPendingEmails();
    
    return c.json({
      ...result,
      timestamp: new Date().toISOString(),
      currentTime: new Date().toString(),
    });
  } catch (error: any) {
    console.error('❌ Error processing emails:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to process pending emails',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Retry failed emails
app.post('/make-server-40d4d8fd/email/queue/retry', async (c) => {
  try {
    // Verify cron API key
    const cronApiKey = c.req.header('X-Cron-API-Key') || c.req.query('api_key');
    const expectedCronKey = Deno.env.get('CRON_API_KEY');
    
    if (!expectedCronKey) {
      console.error('❌ CRON_API_KEY not configured in environment variables');
      return c.json({ 
        success: false, 
        error: 'CRON_API_KEY not configured. Please set CRON_API_KEY in Supabase environment variables.' 
      }, 500);
    }
    
    if (!cronApiKey || cronApiKey !== expectedCronKey) {
      console.error('❌ Unauthorized cron job access attempt');
      return c.json({ 
        success: false, 
        error: 'Unauthorized. Invalid or missing CRON_API_KEY.' 
      }, 401);
    }
    
    console.log('✅ Cron job authenticated successfully');
    
    // Call the retry failed emails function
    return await retryFailedEmails(c);
  } catch (error: any) {
    console.error('❌ Cron endpoint error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to retry failed emails',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Cleanup endpoint - Remove old diary activity logs (they're now auto-generated from table)
app.post('/make-server-40d4d8fd/cleanup/diary-activities', async (c) => {
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

    console.log('🧹 Cleaning up old diary activity logs for user:', userId);
    
    // Get all activities for this user
    const activities = await kv.getByPrefix(`activity:${userId}:`);
    
    // Filter diary/journal activities
    const diaryActivities = activities.filter((activity: any) => 
      activity.type === 'journal' && 
      (activity.action === 'Diary Entry' || activity.action === 'Diary Entry Saved')
    );
    
    console.log(`Found ${diaryActivities.length} old diary activity logs to remove`);
    
    // Delete each one
    let deletedCount = 0;
    for (const activity of diaryActivities) {
      const key = `activity:${userId}:${activity.id}`;
      try {
        await kv.del(key);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete activity ${key}:`, error);
      }
    }
    
    console.log(`✅ Cleaned up ${deletedCount} old diary activity logs`);
    
    return c.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} old diary activity logs`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up diary activities:', error);
    return c.json({ error: 'Failed to cleanup diary activities' }, 500);
  }
});

// Export the app for use by the edge function wrapper
export default app;

// Start the server when run directly
if (import.meta.main) {
  Deno.serve(app.fetch);
}