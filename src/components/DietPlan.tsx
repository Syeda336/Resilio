import { useState } from 'react';
import { Database, Calendar, ClipboardList, Apple } from 'lucide-react';
import { FoodDatabase } from './diet/FoodDatabase';
import { MealPlanner } from './diet/MealPlanner';
import { DietPlanView } from './diet/DietPlanView';

// Updated type to only include the remaining sections
type DietSection = 'database' | 'planner' | 'plan';

interface DietPlanProps {
  userName: string;
  userId: string;
}

export function DietPlan({ userName, userId }: DietPlanProps) {
  const [activeSection, setActiveSection] = useState<DietSection>('database');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRefreshNotice, setShowRefreshNotice] = useState(false);

  const handleItemAdded = () => {
    setRefreshKey(prev => prev + 1);
    console.log('Diet item added, refreshing data...');
    
    setShowRefreshNotice(true);
    setTimeout(() => setShowRefreshNotice(false), 3000);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30 min-h-screen">
      {/* Refresh Notice */}
      {showRefreshNotice && (
        <div className="fixed top-4 right-4 glass border-2 border-teal-500 px-6 py-3 shadow-xl z-50 rounded-xl animate-pulse">
          <p className="text-teal-700 font-medium">✓ Data refreshed!</p>
        </div>
      )}

      {/* Header */}
      <div className="relative bg-gradient-to-r from-teal-600 via-blue-600 to-violet-600 text-white px-4 md:px-8 py-8 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-violet-300 to-teal-300"></div>
        <div className="relative z-10 pl-14 md:pl-6">
          <div className="flex items-center gap-3 mb-2">
            <Apple className="w-8 h-8 text-white" />
            <h1 className="text-white text-2xl font-bold">Personal Diet Plan</h1>
          </div>
          <p className="text-sky-100 mb-3">Track your nutrition and achieve your health goals</p>
          <div className="flex flex-col gap-1">
            <span className="text-white text-sm md:text-base">User: {userName}</span>
          </div>
        </div>
      </div>

      <div className="relative px-4 md:px-8 py-8">
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 via-blue-500 to-teal-500 hidden md:block"></div>
        
        {/* Navigation Buttons - Updated Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => setActiveSection('database')}
            className={`flex flex-col items-center gap-3 px-4 py-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl ${
              activeSection === 'database'
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white scale-105'
                : 'glass text-slate-700 hover:bg-violet-50'
            }`}
          >
            <Database className="w-7 h-7" />
            <span className="text-sm font-medium">Food Database</span>
          </button>

          <button
            onClick={() => setActiveSection('planner')}
            className={`flex flex-col items-center gap-3 px-4 py-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl ${
              activeSection === 'planner'
                ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white scale-105'
                : 'glass text-slate-700 hover:bg-teal-50'
            }`}
          >
            <Calendar className="w-7 h-7" />
            <span className="text-sm font-medium">Meal Planner</span>
          </button>

          <button
            onClick={() => setActiveSection('plan')}
            className={`flex flex-col items-center gap-3 px-4 py-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl ${
              activeSection === 'plan'
                ? 'bg-gradient-to-br from-blue-500 to-sky-600 text-white scale-105'
                : 'glass text-slate-700 hover:bg-sky-50'
            }`}
          >
            <ClipboardList className="w-7 h-7" />
            <span className="text-sm font-medium">Diet Plan</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="glass rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex gap-4">
            <div className="w-1 bg-gradient-to-b from-violet-500 via-blue-500 to-teal-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              {activeSection === 'database' && <FoodDatabase onItemAdded={handleItemAdded} />}
              {activeSection === 'planner' && <MealPlanner onItemAdded={handleItemAdded} />}
              {activeSection === 'plan' && <DietPlanView />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}