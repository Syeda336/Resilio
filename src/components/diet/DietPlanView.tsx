import { useState, useEffect } from 'react';
import { Clock, Flame, Drumstick, Wheat, Droplet, Calendar, Trash2 } from 'lucide-react';
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
  timeline?: string;
  date: string;
  type: 'food' | 'meal';
  description?: string;
  foodItems?: string;
  isLocal?: boolean; // New flag to identify database items
}

export function DietPlanView() {
  const [dietItems, setDietItems] = useState<DietItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDietItems();
    
    // Listen for changes if user adds food in another tab/view
    window.addEventListener('storage', loadDietItems);
    return () => window.removeEventListener('storage', loadDietItems);
  }, []);

  const loadDietItems = async () => {
    setLoading(true);
    try {
      // 1. Load existing items from API
      const apiItemsRaw = await dietItemsAPI.getAll();
      
      // 2. Map API items to match DietItem interface (convert 'carbs' to 'carbohydrates')
      const apiItems: DietItem[] = apiItemsRaw.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.mealType || item.category,
        timeSet: item.scheduledTime || 'N/A',
        calories: Number(item.calories) || 0,
        carbohydrates: Number(item.carbs) || 0, // 🔥 FIX: Map 'carbs' to 'carbohydrates'
        protein: Number(item.protein) || 0,
        fats: Number(item.fat) || 0,
        timeline: item.timeline,
        date: item.scheduledDate || item.date || new Date().toISOString(),
        type: 'food',
        description: item.description,
        foodItems: item.foodItems,
      }));
      
      // 3. Load items added from Food Database (LocalStorage)
      const localData = localStorage.getItem('resilio_diet_plan');
      const localItemsRaw = localData ? JSON.parse(localData) : [];
      
      // 4. Map Local items to match the DietItem interface
      const localItems: DietItem[] = localItemsRaw.map((item: any) => ({
        id: item.food_id, 
        name: item.food_name,
        category: item.food_category,
        timeSet: item.addedAt ? new Date(item.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged',
        calories: Number(item.Calories_grams) || 0,
        carbohydrates: Number(item.Carbs_g) || 0,
        protein: Number(item.Protein_g) || 0,
        fats: Number(item.Fat_g) || 0,
        date: item.addedAt || new Date().toISOString(),
        type: 'food',
        description: item.Benefits,
        isLocal: true // Mark as local
      }));

      // Combine both lists
      setDietItems([...apiItems, ...localItems]);
    } catch (error) {
      console.error('Error loading diet items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, isLocal?: boolean) => {
    if (confirm('Are you sure you want to delete this diet item?')) {
      try {
        if (isLocal) {
          // Remove from LocalStorage
          const localData = localStorage.getItem('resilio_diet_plan');
          if (localData) {
            const currentItems = JSON.parse(localData);
            const updatedItems = currentItems.filter((item: any) => item.food_id !== id);
            localStorage.setItem('resilio_diet_plan', JSON.stringify(updatedItems));
          }
        } else {
          // Remove from API
          await dietItemsAPI.delete(id);
        }
        
        // Update the UI list
        setDietItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting diet item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  // Calculations
  const totalCalories = dietItems.reduce((sum, item) => sum + item.calories, 0);
  const totalCarbs = dietItems.reduce((sum, item) => sum + item.carbohydrates, 0);
  const totalProtein = dietItems.reduce((sum, item) => sum + item.protein, 0);
  const totalFats = dietItems.reduce((sum, item) => sum + item.fats, 0);
  const totalMacros = totalCarbs + totalProtein + totalFats;

  return (
    <div className="space-y-6">
      <h2 className="text-black font-bold text-2xl">Your Diet Plan</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-800 font-semibold">Total Calories</span>
          </div>
          <p className="text-emerald-900 text-2xl font-bold">{totalCalories}</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-600 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Wheat className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-semibold">Carbs</span>
          </div>
          <p className="text-blue-900 text-2xl font-bold">{totalCarbs}g</p>
        </div>

        <div className="bg-orange-50 border-2 border-orange-600 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Drumstick className="w-5 h-5 text-orange-600" />
            <span className="text-orange-800 font-semibold">Protein</span>
          </div>
          <p className="text-orange-900 text-2xl font-bold">{totalProtein}g</p>
        </div>
      </div>

      {/* Diet Items List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading your plan...</div>
      ) : dietItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl">
          <p className="text-gray-600 mb-2">No diet items found.</p>
          <p className="text-gray-400 text-sm">Add items from the Food Database to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-black font-bold">All Diet Items ({dietItems.length})</h3>
          
          <div className="space-y-3">
            {dietItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-gray-200 p-5 hover:border-emerald-500 transition-all rounded-xl shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-black font-bold text-lg">{item.name}</h4>
                        {item.isLocal && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">DB ITEM</span>
                        )}
                        {item.category && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {item.timeSet}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* 🔥 Show Food Items for Meal Planner (calories === 0), otherwise show nutrition */}
                    {item.calories === 0 && item.foodItems ? (
                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <p className="text-[10px] text-amber-700 font-bold uppercase mb-2">📋 Food Items:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.foodItems}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-emerald-50 p-2 rounded border border-emerald-100 text-center">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">Calories</p>
                          <p className="text-emerald-900 font-bold">{item.calories}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded border border-blue-100 text-center">
                          <p className="text-[10px] text-blue-600 font-bold uppercase">Carbs</p>
                          <p className="text-blue-900 font-bold">{item.carbohydrates}g</p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded border border-orange-100 text-center">
                          <p className="text-[10px] text-orange-600 font-bold uppercase">Protein</p>
                          <p className="text-orange-900 font-bold">{item.protein}g</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id, item.isLocal)}
                    className="p-2 text-rose-500 hover:bg-rose-50 border-2 border-transparent hover:border-rose-200 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance Section */}
      {dietItems.length > 0 && totalMacros > 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-2xl">
          <h4 className="text-black font-bold mb-4">Nutritional Balance</h4>
          <div className="space-y-4">
            {[
              { label: 'Carbs', val: totalCarbs, color: 'bg-blue-600' },
              { label: 'Protein', val: totalProtein, color: 'bg-orange-600' },
              { label: 'Fats', val: totalFats, color: 'bg-purple-600' }
            ].map(macro => (
              <div key={macro.label}>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-gray-600">{macro.label}</span>
                  <span className="text-gray-900">{Math.round((macro.val / totalMacros) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`${macro.color} h-full transition-all duration-500`} 
                    style={{ width: `${(macro.val / totalMacros) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}