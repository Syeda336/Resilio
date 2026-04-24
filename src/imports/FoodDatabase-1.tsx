import React, { useState, ChangeEvent, useEffect } from 'react';
import foodData from '../data/foods.json';
import { PlusCircle, Check } from 'lucide-react';

interface FoodItem {
  food_id: string;
  food_name: string;
  food_category: string;
  Calories_grams: number;
  Protein_g: number;
  Carbs_g: number;
  Fat_g: number;
  Benefits: string;
}

const foods = foodData as FoodItem[];

export default function FoodDatabase() {
  const [search, setSearch] = useState<string>("");
  const [addedItems, setAddedItems] = useState<string[]>([]);

  // 1. Changed key to 'resilio_diet_plan' to match DietPlanView
  useEffect(() => {
    const savedDiet = localStorage.getItem('resilio_diet_plan');
    if (savedDiet) {
      const parsed = JSON.parse(savedDiet);
      setAddedItems(parsed.map((item: any) => item.food_id));
    }
  }, []);

  const handleAddToDiet = (food: FoodItem) => {
    // 2. Using the same consistent key
    const currentDiet = JSON.parse(localStorage.getItem('resilio_diet_plan') || '[]');
    
    // Add new item with a timestamp for the Diet Plan timeline
    const updatedDiet = [...currentDiet, { 
      ...food, 
      addedAt: new Date().toISOString() 
    }];
    
    localStorage.setItem('resilio_diet_plan', JSON.stringify(updatedDiet));
    setAddedItems([...addedItems, food.food_id]);
    
    alert(`${food.food_name} Saved in Diet Plan!`);
  };

  const filteredFoods = foods.filter((food) => 
    food.food_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Search 1,700+ foods..."
        className="w-full p-4 rounded-xl border border-slate-200 bg-white/50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.slice(0, 30).map((food) => (
          <div key={food.food_id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{food.food_name}</h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 uppercase font-bold">
                {food.food_category}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-green-600 dark:text-green-400 italic">✨ {food.Benefits}</div>
              
              <button 
                onClick={() => handleAddToDiet(food)}
                disabled={addedItems.includes(food.food_id)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  addedItems.includes(food.food_id)
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                {addedItems.includes(food.food_id) ? (
                  <><Check className="w-4 h-4" /> Added</>
                ) : (
                  <><PlusCircle className="w-4 h-4" /> Add</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}