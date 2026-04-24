import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Bell } from 'lucide-react';
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
  description?: string;
  foodItems?: string;
}

interface UpcomingMeal {
  id: string;
  name: string;
  scheduledTime: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  minutesUntil: number;
  type: 'food' | 'meal';
  description?: string;
  foodItems?: string;
  category?: string;
}

export function DietIntakeTime() {
  const [upcomingMeals, setUpcomingMeals] = useState<UpcomingMeal[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDietItems();
    
    // Update current time and reload meals every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      loadDietItems();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadDietItems = async () => {
    try {
      const items: DietItem[] = await dietItemsAPI.getAll();
      console.log('Loaded diet items for intake time:', items);
      
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      
      // Filter items scheduled for today and calculate time until each meal
      const todayMeals = items
        .filter(item => item.date === today && item.timeSet)
        .map(item => {
          const [hours, minutes] = item.timeSet.split(':').map(Number);
          const scheduledTime = new Date();
          scheduledTime.setHours(hours, minutes, 0, 0);
          
          const minutesUntil = Math.floor((scheduledTime.getTime() - now.getTime()) / 60000);
          
          return {
            id: item.id,
            name: item.name,
            scheduledTime: item.timeSet,
            calories: item.calories || 0,
            carbs: item.carbohydrates || 0,
            protein: item.protein || 0,
            fats: item.fats || 0,
            minutesUntil,
            type: item.type,
            description: item.description,
            foodItems: item.foodItems,
            category: item.category,
          };
        })
        // Only show meals that haven't passed (or just passed in last 5 minutes)
        .filter(meal => meal.minutesUntil >= -5)
        // Sort by time (earliest first)
        .sort((a, b) => a.minutesUntil - b.minutesUntil);
      
      setUpcomingMeals(todayMeals);
    } catch (error) {
      console.error('Error loading diet items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    if (confirm('Mark this meal as taken?')) {
      try {
        await dietItemsAPI.delete(id);
        setUpcomingMeals(upcomingMeals.filter(meal => meal.id !== id));
        console.log('Meal marked as done and deleted:', id);
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Failed to mark meal as done. Please try again.');
      }
    }
  };

  const getMealsWithin30Minutes = () => {
    return upcomingMeals.filter(meal => meal.minutesUntil <= 30 && meal.minutesUntil >= 0);
  };

  const getUpcomingMeals = () => {
    return upcomingMeals.filter(meal => meal.minutesUntil > 30);
  };

  const dueNowMeals = getMealsWithin30Minutes();
  const futureMeals = getUpcomingMeals();

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-black">Diet Intake Time</h2>
        <div className="text-center py-12 text-gray-600">
          Loading today's scheduled meals...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-black">Diet Intake Time</h2>

      <div className="bg-blue-50 border-2 border-blue-600 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-blue-900">Current Time: {currentTime.toLocaleTimeString()}</span>
        </div>
        <p className="text-sm text-blue-700">
          Meals scheduled within 30 minutes will appear with action buttons below.
        </p>
      </div>

      {/* Due Now Section */}
      {dueNowMeals.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-600 animate-pulse" />
            <h3 className="text-black">Time to Eat! ({dueNowMeals.length})</h3>
          </div>

          {dueNowMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-red-50 border-4 border-red-600 p-6 animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-5 h-5 text-red-600" />
                      <span className="text-red-600">
                        {meal.minutesUntil === 0 ? 'NOW' : `In ${meal.minutesUntil} minutes`}
                      </span>
                    </div>
                    <h4 className="text-black mb-2">{meal.name}</h4>
                    <p className="text-gray-600">Scheduled Time: {(() => {
                      // Format time to avoid timezone issues
                      const [hours, minutes] = meal.scheduledTime.split(':').map(Number);
                      const period = hours >= 12 ? 'PM' : 'AM';
                      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                      return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
                    })()}</p>
                    {meal.category && (
                      <span className="inline-block px-2 py-1 bg-emerald-600 text-white text-xs mt-1">
                        {meal.category}
                      </span>
                    )}
                  </div>

                  {/* Show meal plan details if available */}
                  {meal.type === 'meal' && (meal.description || meal.foodItems) && (
                    <div className="bg-white border border-red-300 p-3 space-y-2">
                      {meal.description && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Description:</p>
                          <p className="text-sm text-gray-700">{meal.description}</p>
                        </div>
                      )}
                      {meal.foodItems && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Food Items:</p>
                          <p className="text-sm text-gray-700">{meal.foodItems}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-red-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="text-black">{meal.calories}</p>
                    </div>
                    <div className="bg-white border border-red-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="text-black">{meal.carbs}g</p>
                    </div>
                    <div className="bg-white border border-red-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="text-black">{meal.protein}g</p>
                    </div>
                    <div className="bg-white border border-red-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Fats</p>
                      <p className="text-black">{meal.fats}g</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleMarkDone(meal.id)}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 transition-all whitespace-nowrap"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Followed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-gray-300 p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No meals due in the next 30 minutes.</p>
          <p className="text-sm text-gray-500 mt-2">
            You'll see alerts here 30 minutes before your scheduled meal times.
          </p>
        </div>
      )}

      {/* Upcoming Meals Section */}
      {futureMeals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-black">Upcoming Meals ({futureMeals.length})</h3>

          {futureMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white border-2 border-gray-300 p-5 hover:border-emerald-600 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-600">
                        In {Math.floor(meal.minutesUntil / 60)}h {meal.minutesUntil % 60}m
                      </span>
                    </div>
                    <h4 className="text-black mb-2">{meal.name}</h4>
                    <p className="text-gray-600">Scheduled Time: {meal.scheduledTime}</p>
                    {meal.category && (
                      <span className="inline-block px-2 py-1 bg-emerald-600 text-white text-xs mt-1">
                        {meal.category}
                      </span>
                    )}
                  </div>

                  {/* Show meal plan details if available */}
                  {meal.type === 'meal' && (meal.description || meal.foodItems) && (
                    <div className="bg-white border border-red-300 p-3 space-y-2">
                      {meal.description && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Description:</p>
                          <p className="text-sm text-gray-700">{meal.description}</p>
                        </div>
                      )}
                      {meal.foodItems && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Food Items:</p>
                          <p className="text-sm text-gray-700">{meal.foodItems}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="text-black">{meal.calories}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="text-black">{meal.carbs}g</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="text-black">{meal.protein}g</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2">
                      <p className="text-xs text-gray-600">Fats</p>
                      <p className="text-black">{meal.fats}g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {upcomingMeals.length === 0 && (
        <div className="text-center py-12 border-2 border-gray-300 bg-gray-50">
          <p className="text-gray-600 mb-4">No scheduled meals or diet items.</p>
          <p className="text-gray-500 text-sm">
            Add items from the Food Database or create meal plans in the Meal Planner.
          </p>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-emerald-50 border-2 border-emerald-600 p-6">
        <h4 className="text-emerald-900 mb-3">How It Works</h4>
        <ul className="space-y-2 text-emerald-800 text-sm">
          <li>• Meals appear here 30 minutes before their scheduled time</li>
          <li>• You'll see action buttons to mark meals as "Taken", "Followed", or "Done"</li>
          <li>• Clicking any button will remove the meal from your schedule</li>
          <li>• This helps you track your diet adherence throughout the day</li>
        </ul>
      </div>
    </div>
  );
}