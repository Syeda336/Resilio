import { useState, useEffect } from "react";
import {
  Smile,
  List,
  Flame,
  MessageCircle,
  Clock,
  TrendingUp,
  X,
  Gamepad2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";
import { dashboardRefresh } from "../utils/dashboardRefresh";
import { DailyRecommendation } from "./DailyRecommendation";

interface Activity {
  id: string;
  type: string;
  action: string;
  details: string;
  timestamp: string;
}

interface DashboardProps {
  userName: string;
  profileImage?: string | null;
  accessToken: string;
  userId?: string;
  onOpenProfile: () => void;
  onNavigateToMoodHistory?: () => void;
  onNavigateToCareBuddyHistory?: () => void;
  onNavigateToActivities?: () => void;
  onNavigateToStreakHistory?: () => void;
}

export function Dashboard({
  userName,
  profileImage,
  accessToken,
  userId,
  onOpenProfile,
  onNavigateToMoodHistory,
  onNavigateToCareBuddyHistory,
  onNavigateToActivities,
  onNavigateToStreakHistory,
}: DashboardProps) {
  const [moodData, setMoodData] = useState<any[]>([]);
  const [weeklyAvgMood, setWeeklyAvgMood] =
    useState<string>("N/A");
  const [dietProgress, setDietProgress] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<
    Activity[]
  >([]);
  const [gamesData, setGamesData] = useState<any[]>([]);
  const [gamesMindHealth, setGamesMindHealth] =
    useState<string>("N/A");
  const [exerciseData, setExerciseData] = useState<any[]>([]);
  const [exerciseChances, setExerciseChances] =
    useState<number>(1);
  const [stats, setStats] = useState({
    avgMood: "Loading...",
    careBuddySessions: 0,
    totalActivities: 0,
    totalHistoryActivities: 0,
    streak: 1,
  });
  const [activitiesCount, setActivitiesCount] = useState({
    last24Hours: 0,
    history: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  // Get current user ID
  const currentUserId =
    userId || localStorage.getItem("resilio_user_id") || "";

  useEffect(() => {
    loadDashboardData();
    loadGraphsData(); // Load graphs on mount

    // Subscribe to dashboard refresh events
    const unsubscribe = dashboardRefresh.subscribe(() => {
      console.log("🔄 Dashboard received refresh event");
      loadDashboardData();
      loadGraphsData(); // Also reload graphs on refresh
    });

    const interval = setInterval(() => {
      loadDashboardData();
      loadGraphsData(); // Reload graphs every 30 seconds
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [accessToken, userId]);

  const loadGraphsData = async () => {
    try {
      const { gamesTracking, exerciseTracking } = await import(
        "../utils/graphsTracking"
      );
      const games = await gamesTracking.getWeeklyData();
      const exercises = await exerciseTracking.getWeeklyData();

      console.log("📊 Graphs data loaded:", {
        games,
        exercises,
      });

      setGamesData(
        games.data.map((d, i) => ({ ...d, id: `game-${i}` })),
      );
      setGamesMindHealth(games.mindHealth);
      setExerciseData(
        exercises.data.map((d, i) => ({ ...d, id: `ex-${i}` })),
      );
      setExerciseChances(exercises.chances);
    } catch (error) {
      console.error("Error loading graphs:", error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        console.error("No access token available");
        setLoading(false);
        return;
      }

      if (!currentUserId) {
        console.error("No user ID available");
        setLoading(false);
        return;
      }

      const [activitiesRes, historyRes, statsRes] =
        await Promise.all([
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/activities/recent?userId=${encodeURIComponent(currentUserId)}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          ),
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/activities/history?userId=${encodeURIComponent(currentUserId)}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          ),
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/dashboard/stats`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          ),
        ]);

      if (activitiesRes.ok) {
        const allActivities = await activitiesRes.json();

        // Remove duplicates based on activity ID using Map
        const uniqueActivities = Array.from(
          new Map(
            allActivities.map((activity: Activity) => [
              activity.id,
              activity,
            ]),
          ).values(),
        );

        // Filter for 4 hours and limit to 5 most recent
        const fourHoursAgo = new Date(
          Date.now() - 4 * 60 * 60 * 1000,
        );
        const last4HourActivities = uniqueActivities
          .filter(
            (activity: Activity) =>
              new Date(activity.timestamp) >= fourHoursAgo,
          )
          .slice(0, 5);

        setRecentActivities(last4HourActivities);

        // Get history activities count
        let historyCount = 0;
        if (historyRes.ok) {
          const historyActivities = await historyRes.json();
          historyCount = historyActivities.length;
          console.log(
            `📜 History activities count: ${historyCount}`,
          );
        }

        // Calculate total: Last 24 Hours + History
        const last24HoursCount = uniqueActivities.length;
        const totalCount = last24HoursCount + historyCount;

        console.log(`🎯 Activities Count Breakdown:`);
        console.log(`   Last 24 Hours: ${last24HoursCount}`);
        console.log(`   History: ${historyCount}`);
        console.log(`   TOTAL: ${totalCount}`);

        setActivitiesCount({
          last24Hours: last24HoursCount,
          history: historyCount,
          total: totalCount,
        });
      } else {
        console.error(
          "Failed to fetch activities:",
          activitiesRes.status,
          activitiesRes.statusText,
        );
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log("📊 Dashboard stats received:", {
          avgMood: statsData.stats.avgMood,
          weeklyAvgMood: statsData.weeklyAvgMood,
          moodDataCount: statsData.moodData?.length,
          moodData: statsData.moodData,
          totalHistoryActivities:
            statsData.stats.totalHistoryActivities,
          totalActivities: statsData.stats.totalActivities,
          fullStats: statsData.stats,
        });

        console.log(
          "🎯 Total History Activities Value:",
          statsData.stats.totalHistoryActivities,
        );

        setStats({
          avgMood: statsData.stats.avgMood,
          careBuddySessions:
            statsData.stats.careBuddySessionCount,
          totalActivities: statsData.stats.totalActivities,
          totalHistoryActivities:
            statsData.stats.totalHistoryActivities || 0,
          streak: statsData.stats.streak,
        });

        console.log("✅ Stats set in state:", {
          totalHistoryActivities:
            statsData.stats.totalHistoryActivities || 0,
          careBuddySessions:
            statsData.stats.careBuddySessionCount,
          streak: statsData.stats.streak,
        });

        // Ensure moodData has unique IDs
        const moodDataWithIds = (statsData.moodData || []).map(
          (item: any, index: number) => ({
            ...item,
            id: `mood-${item.day}-${index}`, // 🔥 FIX: Use day + index for unique keys
          }),
        );
        console.log("📈 Setting mood data:", moodDataWithIds);
        setMoodData(moodDataWithIds);

        // Ensure dietProgress has unique IDs
        const dietProgressWithIds = (
          statsData.dietProgress || []
        ).map((item: any, index: number) => ({
          ...item,
          id: `diet-${item.name || "item"}-${index}`, // 🔥 FIX: Use name + index for truly unique keys
        }));
        setDietProgress(dietProgressWithIds);

        console.log(
          "🎯 Setting weekly average mood:",
          statsData.weeklyAvgMood || "N/A",
        );
        setWeeklyAvgMood(statsData.weeklyAvgMood || "N/A");
      } else {
        console.error(
          "Failed to fetch dashboard stats:",
          statsRes.status,
          statsRes.statusText,
        );
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) return "1 min ago";
    if (diffMinutes === 1) return "1 min ago";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    // For hours with minutes
    if (diffHours < 24) {
      const remainingMins = diffMinutes % 60;
      if (remainingMins === 0) {
        return diffHours === 1
          ? "1 hour ago"
          : `${diffHours} hours ago`;
      }
      return `${diffHours} h ${remainingMins} min ago`;
    }

    // For days
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1
      ? "1 day ago"
      : `${diffDays} days ago`;
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30 min-h-screen">
      {/* Top Header - Modern gradient with vertical accent */}
      <div className="relative bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 text-white px-4 md:px-8 py-8 overflow-hidden">
        {/* Decorative vertical stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-teal-400 to-violet-400"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between pl-14 md:pl-6">
          <div className="flex-1">
            <h1 className="text-white mb-2">Dashboard</h1>
            <div className="flex flex-col gap-1">
              <span className="text-white text-sm md:text-lg">
                Welcome back, {userName}!
              </span>
            </div>
          </div>
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all overflow-hidden ring-2 ring-white/50 hover:ring-white shadow-lg"
            onClick={onOpenProfile}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Stats Cards - Redesigned with gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* AVG. MOOD */}
          <div className="glass rounded-2xl p-6 border-l-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide">
                  Avg. Mood
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 text-3xl font-bold">
                    {weeklyAvgMood}
                  </p>
                  {weeklyAvgMood === "Happy" && (
                    <span className="text-3xl">😊</span>
                  )}
                  {weeklyAvgMood === "Good" && (
                    <span className="text-3xl">🙂</span>
                  )}
                  {weeklyAvgMood === "Okay" && (
                    <span className="text-3xl">😐</span>
                  )}
                  {weeklyAvgMood === "Low" && (
                    <span className="text-3xl">😔</span>
                  )}
                  {weeklyAvgMood === "Down" && (
                    <span className="text-3xl">😢</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-purple-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>This week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Smile className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* CARE BUDDY SESSIONS */}
          <div className="glass rounded-2xl p-6 border-l-4 border-rose-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide">
                  Care Buddy
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 text-3xl font-bold mb-1">
                    {stats.careBuddySessions}
                  </p>
                  <span className="text-3xl">💖</span>
                </div>
                <div className="flex items-center gap-1 text-rose-600 text-sm">
                  <span>sessions</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* ACTIVITIES */}
          <div
            className="glass rounded-2xl p-6 border-l-4 border-teal-500"
            onClick={onNavigateToActivities}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide">
                  Activities
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 text-3xl font-bold mb-1">
                    {activitiesCount.total}
                  </p>
                  <span className="text-3xl">✅</span>
                </div>
                <div className="flex items-center gap-1 text-teal-600 text-sm">
                  <span>total tracked</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <List className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* STREAK */}
          <div className="glass rounded-2xl p-6 border-l-4 border-orange-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide">
                  Streak
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 text-3xl font-bold mb-1">
                    {stats.streak}
                  </p>
                  <span className="text-3xl">🔥</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <Flame className="w-4 h-4" />
                  <span>days strong</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Recommendation - Top of Dashboard */}
        <DailyRecommendation
          userId={currentUserId}
          accessToken={accessToken}
          projectId={projectId}
        />

        {/* Two Column Layout with vertical split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Mood Tracker - Left 2/3 */}
          <div className="lg:col-span-2 glass rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-rose-500 rounded-full"></div>
                <h2 className="text-slate-900">
                  Weekly Mood Tracker
                </h2>
              </div>

              {/* Weekly Average Display */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-rose-100 rounded-xl border border-purple-200">
                <span className="text-slate-600 text-sm font-medium">
                  Weekly Avg:
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
                  {weeklyAvgMood}
                </span>
                {weeklyAvgMood === "Happy" && (
                  <span className="text-xl">😊</span>
                )}
                {weeklyAvgMood === "Good" && (
                  <span className="text-xl">🙂</span>
                )}
                {weeklyAvgMood === "Okay" && (
                  <span className="text-xl">😐</span>
                )}
                {weeklyAvgMood === "Low" && (
                  <span className="text-xl">😔</span>
                )}
                {weeklyAvgMood === "Down" && (
                  <span className="text-xl">😢</span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-slate-600">
                  Loading mood data...
                </div>
              </div>
            ) : !moodData || moodData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-slate-500">
                  No mood data available
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", height: "320px" }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={moodData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                      tickFormatter={(value) => {
                        if (value === 5) return "Happy";
                        if (value === 4) return "Good";
                        if (value === 3) return "Okay";
                        if (value === 2) return "Low";
                        if (value === 1) return "Down";
                        return "";
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "value") {
                          const moodNames = [
                            "",
                            "Down",
                            "Low",
                            "Okay",
                            "Good",
                            "Happy",
                          ];
                          return [
                            moodNames[value] || "",
                            "Mood",
                          ];
                        }
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {moodData.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Activities - Right 1/3 */}
          <div className="glass rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-purple-500 rounded-full"></div>
              <div>
                <h2 className="text-slate-900">Recent</h2>
                <p className="text-slate-500 text-sm">
                  Last 4 hours
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-slate-600">
                  Loading...
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No recent activities
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="p-4 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm mb-1 truncate font-medium">
                          {activity.action}
                        </p>
                        <p className="text-slate-600 text-xs truncate">
                          {activity.details}
                        </p>
                      </div>
                      <span className="text-slate-500 text-xs whitespace-nowrap bg-white px-2 py-1 rounded-lg">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Diet Progress Chart - Full width with accent */}
        <div className="glass rounded-2xl p-8 shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-teal-500 rounded-full"></div>
            <h2 className="text-slate-900">Diet Progress</h2>
          </div>

          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-slate-600">
                Loading diet data...
              </div>
            </div>
          ) : dietProgress.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-slate-500">
                No diet data available
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", height: "320px" }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={dietProgress}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fill: "#64748b" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    key="meals-line"
                    type="monotone"
                    dataKey="meals"
                    stroke="#a855f7"
                    strokeWidth={3}
                    name="Meals Logged"
                    dot={{ fill: "#a855f7", r: 4 }}
                  />
                  <Line
                    key="items-line"
                    type="monotone"
                    dataKey="items"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    name="Food Items"
                    dot={{ fill: "#14b8a6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Games & Exercise Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Games Graph */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-6 h-6 text-indigo-600" />
                <h2 className="text-slate-900 dark:text-white font-bold text-xl uppercase tracking-tight">
                  Games Activity
                </h2>
              </div>
              {gamesMindHealth && gamesMindHealth !== "N/A" && (
                <div className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-lg border border-pink-300/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                    Mind Health
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {gamesMindHealth}
                  </div>
                </div>
              )}
            </div>
            {gamesData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Gamepad2 className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <div className="text-slate-500">
                    Play games to see your mind health!
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    Complete games fast to boost your score
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", height: "320px" }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={gamesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(value) => {
                        if (value === 5) return "75-90%";
                        if (value === 4) return "60-75%";
                        if (value === 3) return "45-60%";
                        if (value === 2) return "30-45%";
                        if (value === 1) return "15-30%";
                        return "";
                      }}
                    />
                    <Tooltip
                      formatter={(
                        value: any,
                        name: string,
                        props: any,
                      ) => {
                        const games = props.payload.games || [];
                        const healthRange =
                          props.payload.healthRange || "15-30%";
                        return [
                          <div key="tooltip">
                            <div>
                              <strong>{healthRange}</strong>
                            </div>
                            <div className="text-xs mt-1">
                              {games.join(", ") || "No games"}
                            </div>
                          </div>,
                        ];
                      }}
                    />
                    <Bar
                      dataKey="healthValue"
                      radius={[8, 8, 0, 0]}
                    >
                      {gamesData.map((entry, index) => (
                        <Cell
                          key={`game-${entry.day}-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Exercise Graph */}
          <div className="glass rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-teal-500 rounded-full"></div>
                <h2 className="text-slate-900">
                  Exercise Activity
                </h2>
              </div>
              {exerciseChances > 0 && (
                <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-teal-100 rounded-xl border border-indigo-200">
                  <span className="text-slate-600 text-xs font-medium">
                    Mind Health Chances:
                  </span>
                  <span className="ml-2 text-lg font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
                    {exerciseChances}/5
                  </span>
                  <span className="ml-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < exerciseChances
                            ? "text-yellow-500"
                            : "text-slate-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>

            {exerciseData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-slate-300 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <div className="text-slate-500">
                    Complete exercises to improve mind health!
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    Exercise longer to earn more stars
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", height: "320px" }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={exerciseData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      formatter={(
                        value: any,
                        name: string,
                        props: any,
                      ) => {
                        const exercises =
                          props.payload.exercises || [];
                        const chances =
                          props.payload.chances || 1;
                        return [
                          <div key="tooltip">
                            <div>
                              <strong>{chances}/5 Stars</strong>
                            </div>
                            <div className="text-xs mt-1">
                              {exercises.join(", ") ||
                                "No exercises"}
                            </div>
                          </div>,
                        ];
                      }}
                    />
                    <Bar
                      dataKey="chances"
                      radius={[8, 8, 0, 0]}
                      fill="#6366f1"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}