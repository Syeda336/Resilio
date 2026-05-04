# Resilio - Personal Journal Web Application

A comprehensive personal wellness and journaling platform built with React, Tailwind CSS, and Supabase.

## 📖 Overview

**Resilio** is a feature-rich personal journal web application designed to help users track their daily activities, moods, wellness goals, and personal growth. The application combines traditional journaling with modern features like mood tracking, future messaging, diet planning, exercise tracking, and an AI-powered care buddy.

## ✨ Key Features

### 📝 Core Features
- **Digital Diary**: Rich text editor with 10 custom fonts, text formatting (bold, italic, underline), size options, color picker, emoji support, and voice typing
- **Mood Tracking**: Track daily moods on a 1-5 scale with visual color coding and weekly mood trends
- **Future Self Messaging**: Send emails to your future self with scheduled delivery
- **Personal Reminders**: Set reminders with email notifications at scheduled times
- **Activities Dashboard**: Track all activities across the platform with "Last 24 Hours" and "History" sections

### 🎯 Wellness Features
- **Diet Plan Section**: 
  - 1,700+ foods database with nutritional information
  - Custom meal planning with "Add to Plan" functionality
  - Automatic email scheduling for meal reminders
  - Dual food database access (main navigation + diet section tab)
  
- **Exercises Section**: 
  - Exercise library and tracking
  - Activity logging for completed exercises
  
- **Care Buddy**: 
  - Animated SVG character with mood detection capabilities
  - Interactive wellness companion

### 🎮 Engagement Features
- **Mini Games Section**:
  - Symmetry Fix game with random object selection (100 items pool)
  - Drag-and-drop functionality
  - Activity tracking for games played

### 📊 Progress Tracking
- **Dashboard**: Real-time statistics and weekly mood trends
- **Profile Page**: Comprehensive stats including:
  - Journal entries count
  - Diet taken count
  - Exercises completed count
  - Games played count
  - Login streak (day counter)
  - Care Buddy sessions count
  - Total activities summary
- **Activities Page**: Detailed activity history with filtering

## 🛠️ Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth with email/password
- **Email System**: Supabase Edge Functions with automatic CRON jobs
- **State Management**: React hooks and context
- **Routing**: React Router (Data mode)
- **Icons**: Lucide React
- **Voice Input**: Web Speech API

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm/pnpm
- Supabase account and project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd resilio
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Configure Supabase

Create `/src/utils/supabase/info.ts`:
```typescript
export const projectId = 'YOUR_PROJECT_ID';
export const publicAnonKey = 'YOUR_ANON_KEY';
```

### 4. Set Up Database

Run the migration files in order:
```sql
-- 1. Create diary_entries table
/supabase/migrations/20260412000000_create_diary_entries_table.sql

-- 2. Set up email queue system (if not already set up)
-- Create email_queue table, email scheduler functions, and CRON job
```

### 5. Configure Email System

#### Enable Supabase CRON Extension
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

#### Set Up CRON Job (ID: 9)
The email scheduler runs automatically every 1 minute via Supabase CRON job:
```sql
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',  -- Every 1 minute
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/make-server-40d4d8fd/email/process-queue',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### 6. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Main app component
│   │   ├── routes.tsx              # React Router configuration
│   │   └── components/
│   │       ├── DiaryEditor.tsx     # Rich text diary editor
│   │       ├── Dashboard.tsx       # Main dashboard
│   │       ├── ActivitiesPage.tsx  # Activity tracking
│   │       ├── ProfilePage.tsx     # User profile & stats
│   │       ├── FutureMessages.tsx  # Future self messaging
│   │       ├── Reminders.tsx       # Personal reminders
│   │       ├── DietPlan.tsx        # Diet planning section
│   │       ├── MiniGames.tsx       # Games section
│   │       ├── Exercises.tsx       # Exercise tracking
│   │       ├── CareBuddy.tsx       # AI care companion
│   │       └── ...
│   ├── utils/
│   │   ├── supabase/
│   │   │   └── info.ts             # Supabase configuration
│   │   └── dashboardRefresh.ts     # Real-time refresh utility
│   └── styles/
│       ├── theme.css               # Global theme variables
│       └── fonts.css               # Font imports
├── supabase/
│   └── migrations/
│       └── 20260412000000_create_diary_entries_table.sql
├── package.json
└── README.md
```

## 🗄️ Database Schema

### Main Tables

#### `diary_entries`
```sql
- id (uuid, primary key)
- created_at (timestamp)
- user_id (text)
- date (text)
- time (text)
- content (text)
- mood (integer, 1-5 scale)
- updated_at (timestamp)
```

#### `email_queue`
```sql
- id (uuid, primary key)
- user_id (text)
- to_email (text)
- subject (text)
- body (text)
- scheduled_time (timestamp)
- status (text: 'pending', 'sent', 'failed')
- retry_count (integer)
- created_at (timestamp)
- sent_at (timestamp)
```

#### Key-Value Store Tables
- `kv_store_40d4d8fd`: General application data
- User profile data (profile images, preferences)
- Food database entries
- Activity logs
- Game progress
- Exercise records

## 🔑 Key Features Details

### Rich Text Editor
- **10 Custom Fonts**: Times New Roman, Aptos, Bahnschrift Condensed, Berlin Sans FB, Britannic Bold, Brush Script M7, Cascadia Code, Arial Rounded MT Bold, Baguet Script, Broadway
- **7 Text Sizes**: Small, Medium, Large, X-Large, XX-Large, XXX-Large, XXXX-Large
- **Formatting**: Bold, Italic, Underline
- **Color Picker**: Full color palette
- **Emoji Picker**: Integrated emoji support
- **Voice Typing**: Web Speech API with continuous listening and interim results

### Email Scheduling System
- **Exact Time Delivery**: Emails sent at scheduled time (not immediately)
- **Automatic Retry**: Failed emails retry automatically
- **Background Processing**: Works even when app is closed via CRON jobs
- **Queue Management**: Professional email queue with status tracking

### Activity Tracking
- **Automatic Logging**: All actions automatically logged
- **Real-time Updates**: Dashboard and profile update in real-time
- **Cascade Deletion**: Deleting diary entries removes associated activities
- **Duplicate Prevention**: Cleanup system prevents duplicate activities

### Day Streak System
- **Login Tracking**: Consecutive login days counted
- **Visual Display**: Streak shown on Dashboard and Profile
- **Reset Logic**: Breaks if user misses a day

### Mood Tracking
- **Weekly Trends**: 7-day mood visualization with color coding
- **5-Point Scale**: Moods rated 1-5
- **Color Coding**: 
  - 1-2: Red (low mood)
  - 3: Yellow (neutral)
  - 4-5: Green (high mood)

## 🔐 Authentication

- **Email/Password**: Standard authentication
- **Password Reset**: Professional email-based reset flow
- **Session Management**: Secure token-based sessions
- **Profile Management**: Update name, email, password, profile picture

## 📧 Email Features

### Future Self Messages
- Schedule emails to future dates
- Custom subject and message
- Automatic delivery at scheduled time

### Diet Plan Reminders
- Automatic meal reminder emails
- Scheduled based on meal times
- Nutritional information included

### Personal Reminders
- Custom reminder creation
- Email notifications at set times
- Activity tracking for completed reminders

## 🎮 Mini Games

### Symmetry Fix
- **Random Selection**: 15 items from 100-item pool per game
- **Categories**: Wood (33), Plastic (33), Paper (34)
- **Drag-and-Drop**: Interactive sorting gameplay
- **Activity Tracking**: Each game completion logged

## 📊 Progress & Stats

### Dashboard Metrics
- Total journal entries
- Weekly mood trends
- Recent activities (last 24 hours)
- Current login streak
- Care Buddy sessions

### Profile Stats
- **All-Time Activities**: Complete history from start day
- **Category Breakdown**: Journal, Diet, Exercise, Games
- **Wellness Score**: Based on platform engagement (0-100%)
- **Achievement Summary**: Total activities and milestones

## 🐛 Bug Fixes & Improvements

### Recent Fixes
✅ Diary duplicate activities bug fixed (removed double logging)  
✅ Profile page now shows ALL activities (recent + history)  
✅ Mood tracking with proper cascade deletion  
✅ Email scheduling with exact time delivery  
✅ Activity tracking across all sections  
✅ React imports fixed in DiaryEditor  
✅ Voice typing fully functional  
✅ Food database dual access working  

## 📝 Usage Tips

1. **Diary Writing**: Use voice typing for hands-free journaling
2. **Mood Tracking**: Update mood daily to see weekly trends
3. **Future Messages**: Send motivational messages to future self
4. **Diet Planning**: Use food database to plan balanced meals
5. **Games**: Play mini games for stress relief and activity tracking
6. **Care Buddy**: Interact regularly for mood support

## 🚀 Deployment

### Build for Production
```bash
npm run build
# or
pnpm build
```

### Environment Variables
Ensure Supabase credentials are properly configured in production.

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

Private project - All rights reserved

## 🙏 Acknowledgments

- Built with React and Tailwind CSS
- Powered by Supabase
- Icons by Lucide React
- Fonts from various sources

## 📞 Support

For issues or questions, please refer to the in-app help sections or contact the developer.

---

**Version**: 1.0.0  
**Last Updated**: May 2, 2026  
**Status**: Active Development

Made with ❤️ for personal wellness and growth
