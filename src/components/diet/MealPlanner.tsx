import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Utensils, Plus, Check, Loader2, Save } from 'lucide-react';
import { dietItemsAPI } from '../../utils/api';
import { dashboardRefresh } from '../../utils/dashboardRefresh';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';

type MealType = 'Breakfast' | 'Lunch' | 'Brunch' | 'Dinner';

const MEAL_TIMES = [
  { type: 'Breakfast', icon: Utensils, defaultTime: '08:00' },
  { type: 'Brunch', icon: Utensils, defaultTime: '10:30' },
  { type: 'Lunch', icon: Utensils, defaultTime: '13:00' },
  { type: 'Dinner', icon: Utensils, defaultTime: '19:00' },
] as const;

interface MealPlan {
  type: MealType;
  date: string;
  time: string;
  description: string;
  items: string;
}

interface MealPlannerProps {
  onItemAdded?: () => void;
}

export function MealPlanner({ onItemAdded }: MealPlannerProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealTime, setMealTime] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [mealItems, setMealItems] = useState('');
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Get user data on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const email = localStorage.getItem('userEmail');
    if (token) setAccessToken(token);
    if (email) setUserEmail(email);
  }, []);

  const handleMealSelect = (mealType: MealType) => {
    setSelectedMeal(mealType);
    const meal = MEAL_TIMES.find(m => m.type === mealType);
    setMealTime(meal?.defaultTime || '');
  };

  const handleSaveMealPlan = async () => {
    if (!selectedMeal || !mealDescription.trim() || !mealItems.trim()) {
      alert('Please select a meal type, enter a description, and list your food items.');
      return;
    }

    setSaving(true);

    try {
      // 🔥 FIX: Construct proper ISO datetime with user's local timezone
      // Parse date components to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = mealTime.split(':').map(Number);
      
      // Create date in local timezone (not UTC!)
      const scheduledDateTime = new Date(year, month - 1, day, hours, minutes, 0);
      const scheduledISO = scheduledDateTime.toISOString();

      // Create a diet item with meal plan data
      const dietItem = {
        id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${selectedMeal} - ${mealDescription.slice(0, 50)}${mealDescription.length > 50 ? '...' : ''}`,
        category: selectedMeal,
        mealType: selectedMeal,
        scheduledDate: selectedDate,
        scheduledTime: mealTime,
        scheduledISO: scheduledISO, // 🔥 NEW: Send full ISO timestamp
        calories: 0, // Meal plans don't have calculated calories
        carbohydrates: 0,
        protein: 0,
        fats: 0,
        type: 'meal',
        description: mealDescription,
        foodItems: mealItems,
        createdAt: new Date().toISOString(),
      };

      console.log('🍽️ [MealPlanner] Saving meal plan with email scheduling:', {
        id: dietItem.id,
        scheduledDate: dietItem.scheduledDate,
        scheduledTime: dietItem.scheduledTime,
        scheduledISO: dietItem.scheduledISO,
        mealType: dietItem.mealType,
        hasToken: !!localStorage.getItem('resilio_access_token'),
        isFutureTime: scheduledDateTime > new Date(),
      });

      const result = await dietItemsAPI.create(dietItem);
      console.log('✅ [MealPlanner] Backend response:', result);
      console.log('   emailQueued:', result.emailQueued);
      console.log('   emailError:', result.emailError);
      
      if (result.emailQueued) {
        console.log('📧 ✅ Email successfully queued for scheduled delivery!');
        alert('✅ Meal plan saved successfully!\n\n📧 Email reminder has been scheduled.');
      } else if (result.emailError) {
        console.error('📧 ❌ Email queueing FAILED:', result.emailError);
        alert(`⚠️ CRITICAL ERROR!\n\nMeal plan saved but email scheduling failed:\n${result.emailError}\n\nPlease check console for details.`);
      } else {
        console.warn('📧 ⚠️ Email was NOT queued (check conditions)');
        alert('⚠️ WARNING: Meal plan saved but email NOT scheduled!\n\nCheck browser console for details.');
      }

      setMealDescription('');
      setMealItems('');
      if (onItemAdded) {
        onItemAdded();
      }

      // ✅ NO NEED TO LOG ACTIVITY - Backend automatically converts diet_item_ to activity!
      // The activities.tsx endpoint already maps all diet items to activities
      // Logging here causes duplicate entries (1 from diet_item conversion + 1 from logActivity call)

      // Trigger dashboard refresh to update Activities and Profile pages
      dashboardRefresh.trigger();
      console.log('🔄 Dashboard refresh triggered after creating meal plan');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Failed to save meal plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-black">Meal Planner</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Meal Time Categories */}
        <div className="space-y-6">
          <h3 className="text-black">Meal Time</h3>
          
          <div className="space-y-3">
            {MEAL_TIMES.map(({ type, icon: Icon, defaultTime }) => (
              <button
                key={type}
                onClick={() => handleMealSelect(type)}
                className={`w-full flex items-center gap-4 px-6 py-4 border-2 transition-all ${
                  selectedMeal === type
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-black border-gray-300 hover:border-emerald-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="flex-1 text-left">
                  <p className={selectedMeal === type ? 'text-white' : 'text-black'}>
                    {type}
                  </p>
                  <p className={`text-sm ${selectedMeal === type ? 'text-white' : 'text-gray-600'}`}>
                    Default: {defaultTime}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Meal Plan Form */}
          {selectedMeal && (
            <div className="bg-gray-50 border-2 border-gray-300 p-6 space-y-4">
              <h4 className="text-black">Plan Your {selectedMeal}</h4>

              <div className="space-y-2">
                <label className="text-black">Time</label>
                <TimePicker
                  value={mealTime}
                  onChange={(time) => setMealTime(time)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-black">Meal Description</label>
                <textarea
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="Describe your meal plan..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black placeholder-gray-400 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-black">Food Items</label>
                <textarea
                  value={mealItems}
                  onChange={(e) => setMealItems(e.target.value)}
                  placeholder="List the foods you plan to eat..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black placeholder-gray-400 resize-none"
                />
              </div>

              <button
                onClick={handleSaveMealPlan}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white border-2 border-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Meal Plan'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Calendar */}
        <div className="space-y-6">
          <h3 className="text-black">Select Date</h3>
          
          <div className="bg-white border-2 border-gray-300 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-black mb-4">
                <CalendarIcon className="w-5 h-5" />
                <span>Choose a date for your meal plan</span>
              </div>
              
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />

              <div className="bg-gray-50 border-2 border-gray-300 p-4 mt-6">
                <p className="text-black mb-2">Selected Date:</p>
                <p className="text-gray-600">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {selectedMeal && (
                <div className="bg-emerald-50 border-2 border-emerald-600 p-4 mt-4">
                  <p className="text-emerald-800 mb-2">Planning:</p>
                  <p className="text-emerald-600">
                    {selectedMeal} on {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-50 border-2 border-gray-300 p-6">
            <h4 className="text-black mb-3">Planning Tips</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Plan your meals a week in advance</li>
              <li>• Include a variety of food groups</li>
              <li>• Consider your daily calorie goals</li>
              <li>• Balance proteins, carbs, and fats</li>
              <li>• Don't forget hydration!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}