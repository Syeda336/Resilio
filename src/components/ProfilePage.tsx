import { useState, useEffect, useRef } from 'react';
import { Mail, TrendingUp, Award, Target, Calendar, Edit, X, Eye, EyeOff, LogOut, User, Camera, Sparkles, Settings } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { EmailSchedulerSetupGuide } from './EmailSchedulerSetupGuide';
import { EmailQueueDebugger } from './EmailQueueDebugger';
import { dashboardRefresh } from '../utils/dashboardRefresh';

interface ProfilePageProps {
  userName: string;
  userEmail?: string;
  userId?: string;
  accessToken?: string;
  profileImage?: string | null;
  onClose: () => void;
  onUpdateName: (newName: string) => void;
  onUpdateProfile?: (newName: string, newEmail: string) => void;
  onUpdateProfileImage?: (newImage: string | null) => void;
  onLogout?: () => void;
}

interface ProgressStats {
  journalEntries: number;
  dietTaken: number;
  exercisesCompleted: number;
  gamesPlayed: number;
  loginStreak: number;
  careBuddySessions: number;
}

export function ProfilePage({ userName, userEmail, userId, accessToken, profileImage, onClose, onUpdateName, onUpdateProfile, onUpdateProfileImage, onLogout }: ProfilePageProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail || '');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [stats, setStats] = useState<ProgressStats>({
    journalEntries: 0,
    dietTaken: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    loginStreak: 1, // Default to 1 instead of 0
    careBuddySessions: 0,
  });

  useEffect(() => {
    fetchUserStats();
    
    // Subscribe to dashboard refresh events
    const unsubscribe = dashboardRefresh.subscribe(() => {
      console.log('🔄 ProfilePage received refresh event');
      fetchUserStats();
    });
    
    return () => {
      unsubscribe();
    };
  }, [userId, accessToken]);

  const saveProfileData = async (imageData: string | null) => {
    if (!userId || !accessToken) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/user/profile-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            profileImage: imageData,
          }),
        }
      );
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const authToken = accessToken || localStorage.getItem('resilio_access_token') || publicAnonKey;

      // Fetch all stats from dashboard/stats endpoint (same as Dashboard)
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // Get ALL activities from BOTH recent AND history endpoints
        const currentUserId = userId || localStorage.getItem('resilio_user_id') || '';
        
        // Fetch BOTH recent (last 24 hours) AND history (older) activities
        const [recentResponse, historyResponse] = await Promise.all([
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/activities/recent?userId=${encodeURIComponent(currentUserId)}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          ),
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/activities/history?userId=${encodeURIComponent(currentUserId)}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          ),
        ]);

        let journalEntries = 0;
        let gamesPlayed = 0;
        let exercisesCompleted = 0;
        let dietTaken = 0;

        // Combine recent and history activities
        const allActivities = [];
        
        if (recentResponse.ok) {
          const recentActivities = await recentResponse.json();
          allActivities.push(...recentActivities);
          console.log('📊 Profile Page - Recent activities (Last 24h):', recentActivities.length);
        }
        
        if (historyResponse.ok) {
          const historyActivities = await historyResponse.json();
          allActivities.push(...historyActivities);
          console.log('📊 Profile Page - History activities (Older):', historyActivities.length);
        }
        
        // Remove duplicates based on unique identifier
        const uniqueActivities = Array.from(
          new Map(
            allActivities.map(activity => [
              // Create unique key from id + timestamp + type
              `${activity.id || ''}-${activity.timestamp || ''}-${activity.type || ''}`,
              activity
            ])
          ).values()
        );

        // DEBUG: Log all activities to see what we're getting
        console.log('📊 Profile Page - Combined activities (after deduplication):', uniqueActivities);
        console.log('📊 Profile Page - Current userId:', currentUserId);
        
        // Count ALL activities by type (from start day, including recent + history)
        journalEntries = uniqueActivities.filter((a: any) => a.type === 'journal').length;
        gamesPlayed = uniqueActivities.filter((a: any) => a.type === 'game').length;
        exercisesCompleted = uniqueActivities.filter((a: any) => a.type === 'exercise').length;
        dietTaken = uniqueActivities.filter((a: any) => a.type === 'diet').length;
        
        // DEBUG: Log filtered counts
        console.log('📊 Profile Page - Game activities:', uniqueActivities.filter((a: any) => a.type === 'game'));
        
        console.log('📊 Profile Page - ALL TIME Activity counts:', {
          journal: journalEntries,
          diet: dietTaken,
          exercise: exercisesCompleted,
          games: gamesPlayed,
          total: uniqueActivities.length,
          expected: '9 (4 recent + 5 history)',
        });

        setStats({
          journalEntries,
          dietTaken,
          exercisesCompleted,
          gamesPlayed,
          loginStreak: statsData.stats.streak || 1,
          careBuddySessions: statsData.stats.careBuddySessionCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        saveProfileData(result);
        if (onUpdateProfileImage) {
          onUpdateProfileImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    saveProfileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUpdateProfileImage) {
      onUpdateProfileImage(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert('Name cannot be empty');
      return;
    }

    if (!editEmail.trim()) {
      alert('Email cannot be empty');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (editPassword && editPassword !== editConfirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSaving(true);

    try {
      if (userId && accessToken) {
        const profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/profile`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              name: editName.trim(),
              email: editEmail.trim(),
            }),
          }
        );

        if (!profileResponse.ok) {
          const error = await profileResponse.json();
          throw new Error(error.error || 'Failed to update profile');
        }

        if (editPassword) {
          const passwordResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/auth/password`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                password: editPassword,
              }),
            }
          );

          if (!passwordResponse.ok) {
            const error = await passwordResponse.json();
            throw new Error(error.error || 'Failed to update password');
          }
        }

        if (onUpdateProfile) {
          onUpdateProfile(editName.trim(), editEmail.trim());
        }

        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsEditingProfile(false);
      setEditPassword('');
      setEditConfirmPassword('');
      setIsSaving(false);
    }
  };

  const totalActivities = stats.journalEntries + stats.dietTaken + stats.exercisesCompleted + stats.gamesPlayed + stats.careBuddySessions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-rose-50/30">
      {/* Header with unique asymmetric vertical design */}
      <div className="relative bg-gradient-to-r from-purple-600 via-rose-600 to-teal-600 text-white px-4 md:px-8 py-12 overflow-hidden">
        {/* Decorative vertical stripes - asymmetric design */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-teal-400 to-rose-400"></div>
        <div className="absolute right-12 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-teal-400"></div>
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-rose-400 to-purple-400"></div>
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-teal-300 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50 overflow-hidden">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full rounded-2xl object-cover" 
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-white mb-1">My Profile</h1>
                <p className="text-purple-100 text-sm">Manage your personal information and track your progress</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with vertical accent bars */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative">
        {/* Decorative vertical bars on sides */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-rose-500 to-teal-500 hidden lg:block"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 via-rose-500 to-purple-500 hidden lg:block"></div>
        
        {/* Profile Card */}
        <div className="glass rounded-2xl p-8 mb-8 shadow-xl border-l-4 border-purple-500">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-40 h-40 rounded-2xl object-cover border-4 border-gradient-to-br from-purple-500 to-rose-500 shadow-xl"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shadow-xl">
                    <span className="text-white text-6xl font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg border-2 border-white"
                >
                  <Edit className="w-6 h-6 text-white" />
                </button>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-rose-500/0 group-hover:from-purple-500/20 group-hover:to-rose-500/20 rounded-2xl transition-all"></div>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-rose-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* User Info Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-slate-900">{userName}</h2>
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-rose-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                  Active Member
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border-l-4 border-purple-500">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Email Address</p>
                    <p className="text-slate-900 font-medium">{userEmail || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-rose-50 to-white rounded-xl border-l-4 border-rose-500">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Member Since</p>
                    <p className="text-slate-900 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-teal-50 to-white rounded-xl border-l-4 border-teal-500">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Current Streak</p>
                    <p className="text-slate-900 font-medium">{stats.loginStreak} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Modal */}
          {isEditingProfile && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
              <div className="glass rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl border-2 border-purple-200 flex flex-col">
                {/* Modal Header - Fixed at top */}
                <div className="flex items-center justify-between p-8 pb-6 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <h3 className="text-slate-900">Edit Profile</h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditName(userName);
                      setEditEmail(userEmail || '');
                      setEditPassword('');
                      setEditConfirmPassword('');
                    }}
                    className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Modal Content - Scrollable */}
                <div className="px-8 overflow-y-auto flex-1">
                  {/* Profile Picture Section */}
                  <div className="mb-6">
                    <label className="block text-slate-900 mb-3 font-medium">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-xl object-cover border-2 border-purple-200 shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shadow-lg">
                          <span className="text-white text-3xl font-bold">
                            {editName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-rose-600 text-white rounded-xl hover:shadow-xl transition-all mb-2 font-medium"
                        >
                          Choose Photo
                        </button>
                        {profileImage && (
                          <button
                            onClick={handleImageRemove}
                            className="w-full px-4 py-3 bg-white text-red-600 border-2 border-red-500 rounded-xl hover:bg-red-50 transition-all"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="mb-6">
                    <label className="block text-slate-900 mb-2 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 bg-white"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="mb-6">
                    <label className="block text-slate-900 mb-2 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 bg-white"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-6">
                    <label className="block text-slate-900 mb-2 font-medium">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 bg-white pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">Leave blank if you don't want to change password</p>
                  </div>

                  {/* Confirm Password Field */}
                  {editPassword && (
                    <div className="mb-6">
                      <label className="block text-slate-900 mb-2 font-medium">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={editConfirmPassword}
                          onChange={(e) => setEditConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 bg-white pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="p-8 pt-6 border-t border-slate-200 flex-shrink-0">
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-rose-600 text-white rounded-xl hover:shadow-xl transition-all font-medium disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditName(userName);
                        setEditEmail(userEmail || '');
                        setEditPassword('');
                        setEditConfirmPassword('');
                      }}
                      className="px-6 py-3 bg-white text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="glass rounded-2xl p-8 mb-8 shadow-xl border-l-4 border-rose-500">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-rose-600" />
            <h3 className="text-slate-900">Progress Overview</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Journal Entries */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border-l-4 border-purple-500 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">Journal Entries</span>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-slate-900 text-4xl font-bold">{stats.journalEntries}</p>
            </div>

            {/* Diet Taken */}
            <div className="p-6 bg-gradient-to-br from-rose-50 to-white rounded-xl border-l-4 border-rose-500 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">Diet Taken</span>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Award className="w-6 h-6 text-rose-600" />
                </div>
              </div>
              <p className="text-slate-900 text-4xl font-bold">{stats.dietTaken}</p>
            </div>

            {/* Exercises Completed */}
            <div className="p-6 bg-gradient-to-br from-teal-50 to-white rounded-xl border-l-4 border-teal-500 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">Exercises Done</span>
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <p className="text-slate-900 text-4xl font-bold">{stats.exercisesCompleted}</p>
            </div>

            {/* Games Played */}
            <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-xl border-l-4 border-orange-500 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">Games Played</span>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-slate-900 text-4xl font-bold">{stats.gamesPlayed}</p>
            </div>

            {/* Login Streak */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl border-l-4 border-indigo-500 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">Login Streak</span>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <p className="text-slate-900 text-4xl font-bold">{stats.loginStreak}</p>
            </div>

            {/* Care Buddy Sessions */}
            <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl border-l-4 border-pink-500 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">Care Sessions</span>
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-all">
                  <Award className="w-6 h-6 text-pink-600" />
                </div>
              </div>
              <p className="text-slate-900 text-4xl font-bold">{stats.careBuddySessions}</p>
            </div>
          </div>
        </div>

        {/* Achievements Summary */}
        <div className="glass rounded-2xl p-8 mb-8 shadow-xl border-l-4 border-teal-500">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-teal-600" />
            <h3 className="text-slate-900">Achievement Summary</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-white rounded-xl border-l-4 border-purple-500 hover:shadow-lg transition-all">
              <div>
                <p className="text-slate-900 font-semibold mb-1">Total Activities</p>
                <p className="text-slate-500 text-sm">All actions tracked across the platform</p>
              </div>
              <span className="text-purple-600 text-3xl font-bold">{totalActivities}</span>
            </div>

            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-rose-50 to-white rounded-xl border-l-4 border-rose-500 hover:shadow-lg transition-all">
              <div>
                <p className="text-slate-900 font-semibold mb-1">Current Streak</p>
                <p className="text-slate-500 text-sm">Consecutive days of logging in</p>
              </div>
              <span className="text-rose-600 text-3xl font-bold">{stats.loginStreak} days</span>
            </div>

            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-50 to-white rounded-xl border-l-4 border-teal-500 hover:shadow-lg transition-all">
              <div>
                <p className="text-slate-900 font-semibold mb-1">Wellness Score</p>
                <p className="text-slate-500 text-sm">Based on overall platform engagement</p>
              </div>
              <span className="text-teal-600 text-3xl font-bold">{Math.min(100, Math.floor((totalActivities / 10) * 10))}%</span>
            </div>
          </div>
        </div>

        {/* Email Queue Debugger */}
        <div className="mb-8">
          <EmailQueueDebugger />
        </div>

        
      </div>

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <EmailSchedulerSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </div>
  );
}