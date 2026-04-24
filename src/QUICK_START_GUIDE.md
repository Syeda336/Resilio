# 🚀 Resilio - Quick Start Guide

## Your Personal Journal App is Ready!

Everything is set up and working. Here's how to get started immediately.

---

## 🎯 First Steps

### 1. Launch the Application
Just open your app in the browser. You'll see the Welcome page.

### 2. Create Your Account
1. Click **"Get Started"**
2. Click **"Sign Up"**
3. Enter your details:
   - Name
   - Email (use the email configured for SMTP notifications)
   - Password (minimum 6 characters)
4. Click **"Create Account"**

You'll be automatically logged in!

### 3. Explore the Dashboard
After login, you'll see:
- **Welcome message** with your name
- **Login streak** counter (starts at 1)
- **Recent activities** (will populate as you use the app)
- **Quick stats** for journal, games, and exercises

---

## 📝 Using the Journal

Click **"Journal"** in the sidebar to access 4 powerful features:

### Tab 1: Diary
Write your daily thoughts with advanced features:

**Voice Typing:**
1. Click the microphone icon
2. Start speaking
3. Your words appear automatically
4. Click again to stop

**Formatting:**
- Click the paint palette to change text color
- Click the smile icon to add emojis
- Click the music icon for background music

**Saving:**
- Click **"Save Entry"** when done
- Entry is saved with current date/time and mood

### Tab 2: Entries
View all your previous journal entries:
- See all entries in chronological order
- Search by keyword
- Filter by date
- Delete entries you no longer want
- Each entry shows date, time, mood, and content

### Tab 3: Future Self Messaging
Send messages to your future self:

1. Write your message
2. Choose a delivery date (future date)
3. Click **"Schedule Message"**
4. On the delivery date, you'll receive an email with the message!

**How it works:**
- Message is stored with delivery date
- Email scheduler checks daily
- Email sent automatically on delivery date
- You can view all scheduled messages

### Tab 4: Personal Reminders
Never forget important tasks:

1. Enter reminder title
2. Add description (optional)
3. Set due date
4. Choose priority (High/Medium/Low)
5. Click **"Create Reminder"**

**Features:**
- Email notification on due date
- Mark as complete when done
- View all active reminders
- Delete completed reminders

---

## 🎮 Other Features

### Activities
Track all your app usage:
- Journal entries written
- Games played
- Exercises completed
- Care Buddy sessions

Click **"Activities"** to see your full activity log.

### Dashboard Stats
Your dashboard shows:
- **Login Streak:** Days you've logged in consecutively
- **Recent Activities:** Your last 5 actions
- **Total Stats:** Counts of journal entries, games, exercises

### Profile
Click your profile picture (or initials) to:
- Update your name and email
- Change your password
- Upload a profile picture
- View account information
- Logout

---

## 📧 Setting Up Email Notifications

Your SMTP is already configured with Gmail. To activate automated emails:

### Quick Setup (5 minutes):

**Option A: Using Cron-Job.org (Recommended - Free)**

1. Go to https://cron-job.org/
2. Create a free account
3. Click **"Create Cronjob"**
4. Fill in:
   - **Title:** "Resilio Email Scheduler"
   - **URL:** `https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check`
   - **Schedule:** Every 1 hour
   - **Request Method:** GET
5. Click **"Advanced"** tab
6. Add Header:
   - **Name:** `Authorization`
   - **Value:** `Bearer [YOUR_ANON_KEY]`
7. Save

Done! Emails will now send automatically every hour.

**Option B: Manual Testing**

Open `/test-scheduler.html` in your browser and click "Check & Send Scheduled Emails" whenever you want to trigger the email check.

**Option C: System Cron (Advanced - Linux/Mac)**

```bash
# Edit crontab
crontab -e

# Add this line (replace with your actual values):
0 * * * * curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-40d4d8fd/scheduler/check" -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🧪 Test Your Setup

### Test 1: Create a Journal Entry
1. Go to Journal → Diary
2. Write something: "My first journal entry!"
3. Choose a mood emoji
4. Click Save Entry
5. Go to Journal → Entries
6. You should see your entry!

### Test 2: Create a Future Message
1. Go to Journal → Future Self Messaging
2. Write: "Test message for tomorrow"
3. Set delivery date to tomorrow
4. Click Schedule Message
5. Check your email tomorrow (or run the scheduler manually)

### Test 3: Create a Reminder
1. Go to Journal → Personal Reminders
2. Title: "Test reminder"
3. Set due date to today
4. Click Create Reminder
5. Run the scheduler (via test file or cron)
6. Check your email!

### Test 4: Check Dashboard Streak
1. Login today
2. Check dashboard - streak should be at least 1
3. Login tomorrow
4. Streak should increase to 2!

---

## 🎨 Customization Tips

### Change Your Profile Picture
1. Click your profile icon (top right)
2. Upload an image (JPG, PNG)
3. Image appears across the app instantly

### Organize Your Journal
Use the Entries tab to:
- Search for specific topics
- Filter by date range
- Review past moods
- Track your progress over time

### Set Priorities
For reminders:
- **High:** Urgent tasks
- **Medium:** Regular tasks
- **Low:** Nice-to-do tasks

Color-coding helps you focus on what matters most!

---

## 💡 Pro Tips

### Maximize Your Streak
- Login daily to build your streak
- Streaks motivate consistency
- Dashboard shows your progress

### Use Voice Typing
- Faster than typing
- Great for journaling while relaxed
- Works in Chrome, Edge, Safari

### Background Music
- Click music icon while writing
- Choose from curated playlists
- Creates a calming atmosphere

### Batch Processing
- Create multiple future messages at once
- Set up reminders for the whole month
- Review entries weekly

### Data Privacy
- Your data is completely private
- Each user sees only their own data
- Passwords are encrypted
- SMTP credentials secured

---

## 🐛 Troubleshooting

### "WebAssembly" Error?
Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac) to hard refresh.

Or click the yellow banner that says "Clear Cache" if it appears.

### Can't Login?
- Check email/password are correct
- Password must be at least 6 characters
- Try signing up with a new account

### Email Not Received?
1. Check spam folder
2. Verify SMTP secrets in Supabase (already configured)
3. Test the scheduler endpoint manually
4. Check Supabase Edge Function logs

### Profile Picture Not Showing?
- Make sure image is under 5MB
- Use JPG or PNG format
- Try clearing cache and re-uploading

### Session Expired?
Just login again. Your data is safe!

---

## 📱 Mobile Usage

The app works great on mobile:
- Responsive design
- Touch-friendly buttons
- Sidebar collapses to hamburger menu
- Voice typing works on mobile browsers

---

## 🔒 Security & Privacy

### Your Data is Safe
- All passwords encrypted by Supabase Auth
- Access tokens expire after inactivity
- Data isolated per user (no one else can see it)
- SMTP password stored securely (not in code)

### Best Practices
- Use a strong password
- Logout on shared devices
- Don't share your access token
- Keep your email secure

---

## 📞 Quick Reference

### Key Files
- **Dashboard:** See overview
- **Journal:** Write & schedule
- **Activities:** Track usage
- **Profile:** Manage account

### Important Links
- **Test Scheduler:** `/test-scheduler.html`
- **Test Email:** `/test-email-system.html`
- **System Status:** `/SYSTEM_STATUS.md`
- **SMTP Setup:** `/SMTP_SETUP_COMPLETE.md`

### Keyboard Shortcuts
- **Voice Typing:** Click mic icon (no keyboard shortcut)
- **Save Entry:** Click Save button
- **Navigate:** Use sidebar or keyboard tab

---

## 🎉 You're All Set!

Your Resilio journal is ready to use. Start by:

1. ✅ Creating your first journal entry
2. ✅ Setting up a future message
3. ✅ Creating a reminder
4. ✅ Setting up the email cron job

**Enjoy your personal journaling journey! 📝✨**

---

**Need Help?**
- Check `/SYSTEM_STATUS.md` for system health
- Check `/SMTP_SETUP_COMPLETE.md` for email setup
- Review test files for debugging
- Check browser console for errors
- Check Supabase logs for server errors

**Everything is working perfectly!** 🎊
