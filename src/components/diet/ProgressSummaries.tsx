import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dietItemsAPI } from '../../utils/api';

interface DietItem {
  id: string;
  name: string;
  category?: string;
  timeSet: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fats: number;
  date: string;
  type: 'food' | 'meal';
}

export function ProgressSummaries() {
  const [dietItems, setDietItems] = useState<DietItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDietItems();
  }, []);

  const loadDietItems = async () => {
    setLoading(true);
    try {
      const items = await dietItemsAPI.getAll();
      console.log('Loaded diet items for progress:', items);
      setDietItems(items);
    } catch (error) {
      console.error('Error loading diet items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate data from actual diet items
  const calculateChartData = () => {
    // Get last 7 days for weekly data
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate daily calories and macros
    const dailyData = last7Days.map((date, index) => {
      const dayItems = dietItems.filter(item => item.date === date && item.type === 'food');
      const totalCals = dayItems.reduce((sum, item) => sum + item.calories, 0);
      const dayOfWeek = new Date(date).getDay();
      const dayName = dayNames[dayOfWeek];
      
      return {
        date,
        day: dayName.substring(0, 3),
        calories: totalCals,
        target: 2000, // Default target
        planned: dietItems.filter(item => item.date === date).length,
        followed: dayItems.length,
      };
    });

    // Calculate total macronutrients from all food items
    const totalCarbs = dietItems.filter(item => item.type === 'food').reduce((sum, item) => sum + (item.carbohydrates || 0), 0);
    const totalProtein = dietItems.filter(item => item.type === 'food').reduce((sum, item) => sum + (item.protein || 0), 0);
    const totalFats = dietItems.filter(item => item.type === 'food').reduce((sum, item) => sum + (item.fats || 0), 0);

    const macronutrientData = [
      { name: 'Carbohydrates', value: Math.round(totalCarbs), color: '#3b82f6' },
      { name: 'Protein', value: Math.round(totalProtein), color: '#f97316' },
      { name: 'Fats', value: Math.round(totalFats), color: '#a855f7' },
    ];

    // Calculate meal type completion for last 7 days
    const mealTypes = ['Breakfast', 'Lunch', 'Brunch', 'Dinner'];
    const mealPlanData = mealTypes.map(mealType => {
      const total = last7Days.length; // 7 days
      const completed = last7Days.filter(date => 
        dietItems.some(item => item.date === date && item.category === mealType)
      ).length;
      
      return {
        meal: mealType,
        completed,
        total,
      };
    });

    // Calculate average daily calories
    const totalCalories = dailyData.reduce((sum, day) => sum + day.calories, 0);
    const avgDailyCalories = Math.round(totalCalories / 7);

    // Calculate diet follow rate
    const totalPlanned = dailyData.reduce((sum, day) => sum + day.planned, 0);
    const totalFollowed = dailyData.reduce((sum, day) => sum + day.followed, 0);
    const followRate = totalPlanned > 0 ? Math.round((totalFollowed / totalPlanned) * 100) : 0;

    // Calculate meal completion rate
    const totalMealSlots = mealPlanData.reduce((sum, meal) => sum + meal.total, 0);
    const completedMeals = mealPlanData.reduce((sum, meal) => sum + meal.completed, 0);
    const mealCompletionRate = totalMealSlots > 0 ? Math.round((completedMeals / totalMealSlots) * 100) : 0;

    // Weight progress (placeholder - would need weight tracking feature)
    const weightProgressData = [
      { week: 'Week 1', weight: 75 },
      { week: 'Week 2', weight: 74.5 },
      { week: 'Week 3', weight: 74 },
      { week: 'Week 4', weight: 73.5 },
    ];

    return {
      dietFollowData: dailyData,
      weightProgressData,
      caloriesIntakeData: dailyData,
      macronutrientData,
      mealPlanData,
      avgDailyCalories,
      followRate,
      mealCompletionRate,
      totalMacros: totalCarbs + totalProtein + totalFats,
    };
  };

  const { dietFollowData, weightProgressData, caloriesIntakeData, macronutrientData, mealPlanData, avgDailyCalories, followRate, mealCompletionRate, totalMacros } = calculateChartData();

  // Calculate totals for summaries
  const totalPlanned = dietFollowData.reduce((sum, day) => sum + day.planned, 0);
  const totalFollowed = dietFollowData.reduce((sum, day) => sum + day.followed, 0);
  const totalMealSlots = mealPlanData.reduce((sum, meal) => sum + meal.total, 0);
  const completedMeals = mealPlanData.reduce((sum, meal) => sum + meal.completed, 0);

  if (loading) {
    return (
      <div className="space-y-8">
        <h2 className="text-black">Progress & Weekly Summaries</h2>
        <div className="text-center py-12 text-gray-600">
          Loading progress data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-black">Progress & Weekly Summaries</h2>

      {/* Diet Follow Chart */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <h3 className="text-black mb-4">Diet Follow Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dietFollowData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="followed" fill="#10b981" name="Followed" />
            <Bar dataKey="planned" fill="#e5e7eb" name="Planned" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300">
          <p className="text-black">Weekly Average: <span className="text-emerald-600">{followRate}%</span></p>
          <p className="text-sm text-gray-600">You followed {totalFollowed} out of {totalPlanned} planned meals this week.</p>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <h3 className="text-black mb-4">Weight Progress Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightProgressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[70, 76]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} name="Weight (kg)" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300">
          <p className="text-black">Progress: <span className="text-emerald-600">-1.5 kg</span></p>
          <p className="text-sm text-gray-600">Great job! You've lost weight consistently over the past 4 weeks.</p>
        </div>
      </div>

      {/* Calories Intake Chart */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <h3 className="text-black mb-4">Calories Intake Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={caloriesIntakeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2} name="Actual" />
            <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300">
          <p className="text-black">Daily Average: <span className="text-blue-600">{avgDailyCalories} kcal</span></p>
          <p className="text-sm text-gray-600">Slightly above your target of 2,000 kcal per day.</p>
        </div>
      </div>

      {/* Macronutrient Breakdown Chart */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <h3 className="text-black mb-4">Macronutrient Breakdown Chart</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={macronutrientData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {macronutrientData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {macronutrientData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-4 h-4" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-black">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.value}g</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300">
          <p className="text-black">Weekly Total: <span className="text-purple-600">{totalMacros}g</span></p>
          <p className="text-sm text-gray-600">Balanced distribution of macronutrients.</p>
        </div>
      </div>

      {/* Meal Plan Chart */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <h3 className="text-black mb-4">Meal Plan Completion Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mealPlanData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="meal" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
            <Bar dataKey="total" fill="#e5e7eb" name="Total" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300">
          <p className="text-black">Completion Rate: <span className="text-emerald-600">{mealCompletionRate}%</span></p>
          <p className="text-sm text-gray-600">{completedMeals} out of {totalMealSlots} meals completed this week.</p>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-emerald-50 border-2 border-emerald-600 p-6">
        <h3 className="text-emerald-900 mb-4">Weekly Average Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Diet Follow Rate</p>
            <p className="text-2xl text-emerald-900">{followRate}%</p>
          </div>
          <div className="bg-white p-4 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Avg. Daily Calories</p>
            <p className="text-2xl text-emerald-900">{avgDailyCalories}</p>
          </div>
          <div className="bg-white p-4 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Weight Change</p>
            <p className="text-2xl text-emerald-900">-0.5 kg</p>
          </div>
          <div className="bg-white p-4 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Meal Completion</p>
            <p className="text-2xl text-emerald-900">{mealCompletionRate}%</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white border border-emerald-200">
          <p className="text-emerald-900 mb-2">Weekly Insights</p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>✓ Excellent consistency in following meal plans</li>
            <li>✓ Weight loss on track with healthy rate</li>
            <li>✓ Calorie intake within acceptable range</li>
            <li>⚠ Consider increasing dinner completion rate</li>
          </ul>
        </div>
      </div>
    </div>
  );
}