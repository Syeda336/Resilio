import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Clock, Sparkles, Utensils, Loader2, Check } from 'lucide-react';
import { dietItemsAPI } from '../../utils/api';
import { dashboardRefresh } from '../../utils/dashboardRefresh';
import { foodDatabase, FoodItem } from '../../data/foodDatabase';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';

export function FoodDatabase({ onItemAdded }: { onItemAdded?: () => void }) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);
        
        // Use raw text import to handle escaped characters
        const response = await fetch(new URL('../../imports/foods.json', import.meta.url).href);
        const jsonText = await response.text();
        const data = JSON.parse(jsonText) as FoodItem[];
        
        console.log('FoodDatabase loaded successfully, total foods:', data.length);
        setFoods(data);
      } catch (err) {
        console.error('Error loading foods:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFoods();
  }, []);

  const toggleItemSelection = (foodId: string) => {
    const newSelected = new Set(selectedItems);
    newSelected.has(foodId) ? newSelected.delete(foodId) : newSelected.add(foodId);
    setSelectedItems(newSelected);
  };

  const handleAddToDatabase = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one food item');
      return;
    }

    if (!selectedTime) {
      alert('Please select a time for the meal');
      return;
    }

    setSaving(true);
    try {
      // Get selected food items details
      const selectedFoods = foods.filter(food => selectedItems.has(food.food_id));

      // Create food items array in the format expected by the API
      const foodItems = selectedFoods.map(food => ({
        name: food.food_name,
        calories: food.Calories_grams,
        protein: food.Protein_g,
        carbs: food.Carbs_g,
        fat: food.Fat_g,
      }));

      // Calculate totals
      const totalCalories = selectedFoods.reduce((sum, food) => sum + food.Calories_grams, 0);
      const totalProtein = selectedFoods.reduce((sum, food) => sum + food.Protein_g, 0);
      const totalCarbs = selectedFoods.reduce((sum, food) => sum + food.Carbs_g, 0);
      const totalFat = selectedFoods.reduce((sum, food) => sum + food.Fat_g, 0);

      // 🔥 FIX: Construct proper ISO datetime with user's local timezone
      // Parse date components to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      // Create date in local timezone (not UTC!)
      const scheduledDateTime = new Date(year, month - 1, day, hours, minutes, 0);
      const scheduledISO = scheduledDateTime.toISOString();

      // Create diet item object
      const dietItem = {
        id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: selectedFoods.map(f => f.food_name).join(', '),
        mealType: 'Custom Meal',
        description: selectedFoods.map(f => f.food_name).join(', '),
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        scheduledISO: scheduledISO, // 🔥 NEW: Send full ISO timestamp
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        foodItems: foodItems,
        createdAt: new Date().toISOString(),
      };

      console.log('🍽️ [FoodDatabase] Saving diet item with email scheduling:', {
        id: dietItem.id,
        scheduledDate: dietItem.scheduledDate,
        scheduledTime: dietItem.scheduledTime,
        scheduledISO: dietItem.scheduledISO,
        fullDateTime: `${dietItem.scheduledDate}T${dietItem.scheduledTime}:00`,
        mealType: dietItem.mealType,
        hasToken: !!localStorage.getItem('resilio_access_token'),
        currentTime: new Date().toISOString(),
        scheduledDateTime: scheduledDateTime.toISOString(),
        isFutureTime: scheduledDateTime > new Date(),
      });

      // Save to Supabase via API (backend will automatically queue email)
      const result = await dietItemsAPI.create(dietItem);
      console.log('✅ [FoodDatabase] Backend response:', result);
      console.log('   emailQueued:', result.emailQueued);
      console.log('   emailError:', result.emailError);
      
      if (result.emailQueued) {
        console.log('📧 ✅ Email successfully queued for scheduled delivery!');
        alert(`✅ Success!\\n\\n${selectedItems.size} item(s) added to your diet plan!\\n\\n📧 Email reminder scheduled for:\\n${selectedDate} at ${selectedTime}`);
      } else if (result.emailError) {
        console.error('📧 ❌ Email queueing FAILED:', result.emailError);
        alert(`⚠️ CRITICAL ERROR!\\n\\nFood added but email scheduling failed:\\n${result.emailError}\\n\\nPlease check console for details.`);
      } else {
        console.warn('📧 ⚠️ Email was NOT queued (check conditions)');
        console.warn('   Possible reasons:');
        console.warn('   1. Scheduled time is in the PAST');
        console.warn('   2. User email missing');
        console.warn('   3. Access token invalid');
        console.warn('   Check the backend logs above for exact reason.');
        alert('⚠️ WARNING: Email was NOT scheduled!\\n\\nFood item saved but no email will be sent.\\n\\nPossible reasons:\\n- Time is in the past\\n- No email configured\\n\\nCheck browser console for details.');
      }

      // ✅ NO NEED TO LOG ACTIVITY - Backend automatically converts diet_item_ to activity!
      // The activities.tsx endpoint already maps all diet items to activities
      // Logging here causes duplicate entries (1 from diet_item conversion + 1 from logActivity call)

      // Trigger dashboard refresh to update Activities and Profile pages
      dashboardRefresh.trigger();
      console.log('🔄 Dashboard refresh triggered after adding food items');

      // Clear selections
      setSelectedItems(new Set());
      setSelectedTime('');

      // Notify parent component to refresh
      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error('Error adding items to diet plan:', error);
      alert('Failed to add items to plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filter items based on search
  const filteredFoods = foods.filter((food) =>
    food.food_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Initializing Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-black font-bold text-2xl">Full Food Registry</h2>
          <p className="text-gray-500 text-sm">Showing {filteredFoods.length} items</p>
        </div>
      </div>

      {/* Search and Global Controls */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 space-y-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all categories..."
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-black shadow-sm"
          />
        </div>

        {/* Selection Action Bar - Only shows when items are picked */}
        {selectedItems.size > 0 && (
          <div className="bg-emerald-600 p-5 rounded-xl text-white flex flex-col lg:flex-row items-stretch lg:items-center gap-4 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <span className="font-bold text-lg whitespace-nowrap">{selectedItems.size} Selected</span>
              <div className="h-8 w-px bg-white/20 hidden sm:block" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <DatePicker value={selectedDate} onChange={setSelectedDate} />
                <TimePicker value={selectedTime} onChange={setSelectedTime} />
              </div>
            </div>
            <button
              onClick={handleAddToDatabase}
              disabled={saving}
              className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-colors whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add to Plan'
              )}
            </button>
          </div>
        )}
      </div>

      {/* The Full Grid - Removed .slice() to show everything */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFoods.map((food) => (
          <div 
            key={food.food_id} 
            onClick={() => toggleItemSelection(food.food_id)}
            className={`group p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedItems.has(food.food_id) 
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200' 
                : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                {food.food_name}
              </h3>
              {selectedItems.has(food.food_id) && <Check className="w-5 h-5 text-emerald-600" />}
            </div>
            
            <div className="mt-2 flex gap-2">
               <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase tracking-wider font-bold">
                {food.food_category}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1 text-[11px] text-center">
              <div className="bg-orange-50 p-1 rounded">
                <p className="text-orange-600 font-bold">{food.Calories_grams}</p>
                <p className="text-orange-400">Cal</p>
              </div>
              <div className="bg-blue-50 p-1 rounded">
                <p className="text-blue-600 font-bold">{food.Protein_g}g</p>
                <p className="text-blue-400">Prot</p>
              </div>
              <div className="bg-purple-50 p-1 rounded">
                <p className="text-purple-600 font-bold">{food.Carbs_g}g</p>
                <p className="text-purple-400">Carb</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No matches found for "{searchQuery}"
        </div>
      )}
    </div>
  );
}