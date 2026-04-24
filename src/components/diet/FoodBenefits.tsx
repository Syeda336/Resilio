import { useState } from 'react';
import { Brain, Heart, Zap, Shield, Search } from 'lucide-react';

interface FoodBenefit {
  name: string;
  brainBenefits: string;
  bodyBenefits: string;
  mentalHealth: string;
  physicalHealth: string;
  carbs: number;
  protein: number;
  fats: number;
  icon: string;
}

const FOOD_BENEFITS: FoodBenefit[] = [
  {
    name: 'Salmon',
    icon: '🐟',
    brainBenefits: 'Rich in Omega-3 fatty acids, particularly DHA, which supports cognitive function, memory, and reduces risk of neurodegenerative diseases. Enhances brain cell communication and promotes new neuron formation.',
    bodyBenefits: 'High-quality protein source that supports muscle building and repair. Contains essential amino acids for overall body function.',
    mentalHealth: 'Omega-3s help reduce symptoms of depression and anxiety. Supports production of serotonin and dopamine, improving mood and emotional regulation.',
    physicalHealth: 'Reduces inflammation throughout the body. Supports cardiovascular health by lowering blood pressure and triglycerides. Promotes healthy skin and joints.',
    carbs: 0,
    protein: 20,
    fats: 13,
  },
  {
    name: 'Blueberries',
    icon: '🫐',
    brainBenefits: 'Packed with antioxidants, especially flavonoids, that protect brain cells from oxidative stress. Improves memory, delays brain aging, and enhances neural communication.',
    bodyBenefits: 'Low in calories but high in nutrients. Provides vitamin C, vitamin K, and manganese for various body functions.',
    mentalHealth: 'Anthocyanins in blueberries may reduce symptoms of depression and improve overall mood. Supports stress reduction through antioxidant activity.',
    physicalHealth: 'Powerful anti-inflammatory effects. Supports heart health, may lower blood pressure, and helps maintain healthy blood sugar levels. Boosts immune system.',
    carbs: 14,
    protein: 1,
    fats: 0.5,
  },
  {
    name: 'Walnuts',
    icon: '🌰',
    brainBenefits: 'Excellent source of alpha-linolenic acid (ALA), a plant-based Omega-3. Enhances cognitive performance, improves memory, and supports brain structure. Brain-shaped for a reason!',
    bodyBenefits: 'Rich in healthy fats, fiber, and plant compounds. Provides sustained energy and supports digestive health.',
    mentalHealth: 'May help reduce inflammation linked to depression. Supports better sleep quality through melatonin content, improving overall mental wellness.',
    physicalHealth: 'Promotes heart health by improving cholesterol levels. Supports gut health with prebiotic properties. May help control appetite and weight management.',
    carbs: 14,
    protein: 15,
    fats: 65,
  },
  {
    name: 'Dark Chocolate',
    icon: '🍫',
    brainBenefits: 'Contains flavonoids, caffeine, and antioxidants that boost brain function. Improves memory, focus, and learning capacity. Increases blood flow to the brain.',
    bodyBenefits: 'Rich in minerals like iron, magnesium, and zinc. Provides quick energy and supports various metabolic processes.',
    mentalHealth: 'Stimulates production of endorphins (feel-good chemicals). Contains phenylethylamine, which promotes feelings of happiness and well-being. Reduces stress hormones.',
    physicalHealth: 'Powerful antioxidants protect against cellular damage. May lower blood pressure and improve blood flow. Supports skin health and may reduce inflammation.',
    carbs: 46,
    protein: 8,
    fats: 43,
  },
  {
    name: 'Spinach',
    icon: '🥬',
    brainBenefits: 'High in folate, vitamin K, and lutein, which support cognitive function and slow mental decline. Rich in antioxidants that protect brain cells.',
    bodyBenefits: 'Packed with vitamins A, C, K, iron, and calcium. Extremely low in calories while providing essential nutrients for body function.',
    mentalHealth: 'Folate helps produce dopamine and serotonin, supporting mood regulation. May reduce risk of depression and anxiety through nutrient density.',
    physicalHealth: 'Strengthens bones, supports immune system, and promotes healthy vision. Anti-inflammatory properties support overall health. Helps maintain healthy blood pressure.',
    carbs: 3.6,
    protein: 2.9,
    fats: 0.4,
  },
  {
    name: 'Avocado',
    icon: '🥑',
    brainBenefits: 'Rich in monounsaturated fats that support healthy blood flow to the brain. Contains lutein which improves cognitive function and memory. Provides folate for neural health.',
    bodyBenefits: 'Packed with healthy fats, fiber, and potassium. Provides sustained energy and supports numerous body functions.',
    mentalHealth: 'B vitamins support neurotransmitter production, helping manage stress and anxiety. Healthy fats promote hormonal balance affecting mood.',
    physicalHealth: 'Supports heart health through healthy fats. May help lower cholesterol and blood pressure. Promotes healthy skin, eyes, and digestive system.',
    carbs: 9,
    protein: 2,
    fats: 15,
  },
  {
    name: 'Greek Yogurt',
    icon: '🥛',
    brainBenefits: 'Probiotics support gut-brain axis, influencing mood and cognitive function. Rich in B vitamins that support brain energy metabolism and neurotransmitter production.',
    bodyBenefits: 'Excellent source of protein and calcium. Supports muscle building, bone health, and provides sustained energy.',
    mentalHealth: 'Gut bacteria influenced by probiotics can produce neurotransmitters affecting mood. May reduce symptoms of anxiety and depression through gut-brain connection.',
    physicalHealth: 'Strengthens bones and teeth with high calcium content. Supports digestive health and immune function. Helps maintain healthy weight through protein satiety.',
    carbs: 6,
    protein: 17,
    fats: 0.4,
  },
  {
    name: 'Green Tea',
    icon: '🍵',
    brainBenefits: 'L-theanine promotes relaxation and focus without drowsiness. Caffeine improves alertness. Together they enhance brain function, memory, and concentration.',
    bodyBenefits: 'Contains powerful antioxidants called catechins. Supports metabolism and provides gentle energy boost.',
    mentalHealth: 'L-theanine increases alpha brain waves, promoting calm alertness. Reduces stress and anxiety while improving mood. May reduce risk of depression.',
    physicalHealth: 'Boosts metabolism and may aid in fat burning. Powerful antioxidants protect cells from damage. Supports heart health and may lower disease risk.',
    carbs: 0,
    protein: 0,
    fats: 0,
  },
];

export function FoodBenefits() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodBenefit | null>(null);

  const filteredFoods = FOOD_BENEFITS.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-black">Benefits of Special Foods</h2>

      <p className="text-gray-600">
        Discover how superfoods can enhance your brain function, mental health, and physical well-being.
      </p>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a food..."
          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 focus:border-emerald-600 focus:outline-none text-black placeholder-gray-400"
        />
      </div>

      {/* Food List */}
      {!selectedFood ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFoods.map((food) => (
            <button
              key={food.name}
              onClick={() => setSelectedFood(food)}
              className="bg-white border-2 border-gray-300 p-6 hover:border-emerald-600 transition-all text-left"
            >
              <div className="text-4xl mb-3 text-center">{food.icon}</div>
              <h3 className="text-black text-center mb-2">{food.name}</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Carbs: {food.carbs}g</p>
                <p>Protein: {food.protein}g</p>
                <p>Fats: {food.fats}g</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{selectedFood.icon}</div>
              <h3 className="text-black">{selectedFood.name}</h3>
            </div>
            <button
              onClick={() => setSelectedFood(null)}
              className="px-4 py-2 bg-white text-black border-2 border-gray-300 hover:border-emerald-600 transition-all"
            >
              Back to List
            </button>
          </div>

          {/* Nutritional Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border-2 border-blue-600 p-4">
              <p className="text-sm text-blue-700 mb-1">Carbohydrates</p>
              <p className="text-2xl text-blue-900">{selectedFood.carbs}g</p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-600 p-4">
              <p className="text-sm text-orange-700 mb-1">Protein</p>
              <p className="text-2xl text-orange-900">{selectedFood.protein}g</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-600 p-4">
              <p className="text-sm text-purple-700 mb-1">Fats</p>
              <p className="text-2xl text-purple-900">{selectedFood.fats}g</p>
            </div>
          </div>

          {/* Brain Benefits */}
          <div className="bg-white border-2 border-gray-300 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <h4 className="text-black">Brain Benefits</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedFood.brainBenefits}</p>
          </div>

          {/* Body Benefits */}
          <div className="bg-white border-2 border-gray-300 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-yellow-600" />
              <h4 className="text-black">Body Benefits</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedFood.bodyBenefits}</p>
          </div>

          {/* Mental Health Impact */}
          <div className="bg-white border-2 border-gray-300 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-6 h-6 text-pink-600" />
              <h4 className="text-black">Mental Health Impact</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedFood.mentalHealth}</p>
          </div>

          {/* Physical Health Impact */}
          <div className="bg-white border-2 border-gray-300 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-green-600" />
              <h4 className="text-black">Physical Health Impact</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedFood.physicalHealth}</p>
          </div>
        </div>
      )}
    </div>
  );
}
