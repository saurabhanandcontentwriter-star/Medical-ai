
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { MealEntry } from '../types';

const MealTracker: React.FC = () => {
  const [meals, setMeals] = useState<MealEntry[]>(() => {
    const saved = localStorage.getItem('medassist_meals');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [selectedType, setSelectedType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  
  const dailyGoal = 2200;
  const currentTotal = meals.reduce((sum, m) => sum + m.calories, 0);
  const progress = Math.min(100, (currentTotal / dailyGoal) * 100);

  useEffect(() => {
    localStorage.setItem('medassist_meals', JSON.stringify(meals));
  }, [meals]);

  const analyzeMeal = async () => {
    if (!mealDescription.trim() || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this meal: "${mealDescription}". Estimate its calories, protein, carbs, and fats in grams based on standard Indian or continental portion sizes. Respond in JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            },
            required: ['name', 'calories', 'protein', 'carbs', 'fats']
          }
        }
      });

      const result = JSON.parse(response.text);
      const newEntry: MealEntry = {
        id: Date.now().toString(),
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: selectedType
      };

      setMeals(prev => [newEntry, ...prev]);
      setMealDescription('');
    } catch (error) {
      console.error("Meal analysis failed", error);
      alert("AI analysis failed. Please try a simpler description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full h-full overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Nutrition Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Smart dietary monitoring and AI-powered calorie estimation.</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left: Input & Stats */}
        <div className="lg:col-span-4 space-y-8">
           {/* Calorie Goal Gauge */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-gray-700" />
                  <circle 
                    cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" 
                    className="text-orange-500 transition-all duration-1000" 
                    strokeDasharray="553" 
                    strokeDashoffset={553 - (553 * progress / 100)} 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{currentTotal}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged Kcal</p>
                </div>
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-tight">Remaining: {Math.max(0, dailyGoal - currentTotal)} kcal</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Goal: {dailyGoal} kcal</p>
              </div>
           </div>

           {/* AI Intake Interface */}
           <div className="bg-orange-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-orange-100 dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">🥗</div>
              <div className="relative z-10 space-y-6">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Smart Entry</h3>
                    <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">AI Calorie Synthesis</p>
                 </div>

                 <div className="flex bg-white/10 p-1 rounded-2xl border border-white/20">
                    {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(type => (
                      <button 
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === type ? 'bg-white text-orange-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                      >
                        {type.charAt(0)}
                      </button>
                    ))}
                 </div>

                 <textarea 
                   value={mealDescription}
                   onChange={(e) => setMealDescription(e.target.value)}
                   placeholder="Describe what you ate... (e.g. 2 rotis, cup of dal, apple)"
                   className="w-full bg-white/10 border-2 border-white/20 rounded-[1.5rem] p-5 text-sm font-bold placeholder-white/50 focus:ring-0 focus:border-white transition-all resize-none h-32"
                 />

                 <button 
                   onClick={analyzeMeal}
                   disabled={isAnalyzing || !mealDescription.trim()}
                   className="w-full py-5 bg-white text-orange-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isAnalyzing ? (
                     <><div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>Synthesizing...</>
                   ) : 'Log with AI'}
                 </button>
              </div>
           </div>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-gray-700 p-10">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Nutritional Intake</h3>
              <button 
                onClick={() => { if(window.confirm('Reset logs?')) setMeals([]); }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
              >
                Reset Today
              </button>
           </div>

           {meals.length === 0 ? (
             <div className="py-20 text-center opacity-30">
                <div className="text-6xl mb-6">🍽️</div>
                <p className="text-xs font-black uppercase tracking-[0.3em]">No records found for today.</p>
             </div>
           ) : (
             <div className="space-y-6">
                {meals.map((meal) => (
                  <div key={meal.id} className="group flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900 transition-all animate-in slide-in-from-right duration-500">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0 ${meal.type === 'Breakfast' ? 'bg-amber-50 text-amber-600' : meal.type === 'Lunch' ? 'bg-green-50 text-green-600' : meal.type === 'Dinner' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {meal.type === 'Breakfast' ? '🥞' : meal.type === 'Lunch' ? '🍲' : meal.type === 'Dinner' ? '🍱' : '🍎'}
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                           <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight">{meal.name}</h4>
                           <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-gray-700 text-slate-500 uppercase tracking-widest">{meal.time}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                           <span className="text-[10px] font-bold text-orange-600 uppercase">Protein: {meal.protein}g</span>
                           <span className="text-[10px] font-bold text-teal-600 uppercase">Carbs: {meal.carbs}g</span>
                           <span className="text-[10px] font-bold text-purple-600 uppercase">Fats: {meal.fats}g</span>
                        </div>
                     </div>

                     <div className="text-right">
                        <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{meal.calories}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">kcal</p>
                     </div>

                     <button 
                       onClick={() => deleteMeal(meal.id)}
                       className="p-3 rounded-full text-slate-300 hover:text-rose-500 transition-colors"
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MealTracker;
