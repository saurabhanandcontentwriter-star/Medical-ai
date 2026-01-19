
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { VitalSign, OrderItem, AppView, MedicationReminder } from '../types';
import { generateDoctorAvatar } from '../services/geminiService';

const initialHistoryData = [
  { name: 'Mon', hr: 72, sys: 120, dia: 80, spo2: 98, temp: 98.4 },
  { name: 'Tue', hr: 75, sys: 122, dia: 82, spo2: 97, temp: 98.6 },
  { name: 'Wed', hr: 70, sys: 118, dia: 79, spo2: 99, temp: 98.5 },
  { name: 'Thu', hr: 68, sys: 119, dia: 81, spo2: 98, temp: 98.3 },
  { name: 'Fri', hr: 74, sys: 121, dia: 80, spo2: 98, temp: 98.7 },
  { name: 'Sat', hr: 78, sys: 124, dia: 84, spo2: 97, temp: 98.6 },
  { name: 'Sun', hr: 73, sys: 120, dia: 80, spo2: 98, temp: 98.5 },
];

const initialVitals: VitalSign[] = [
  { id: 'hr', name: 'Heart Rate', value: '73', unit: 'bpm', status: 'normal', trend: 'stable', color: 'text-rose-500' },
  { id: 'bp', name: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', trend: 'up', color: 'text-blue-500' },
  { id: 'spo2', name: 'Oxygen Level', value: '98', unit: '%', status: 'normal', trend: 'stable', color: 'text-teal-500' },
  { id: 'temp', name: 'Temperature', value: '98.6', unit: '°F', status: 'normal', trend: 'stable', color: 'text-amber-500' },
];

interface DashboardProps {
  orders?: OrderItem[];
  onNavigate?: (view: AppView) => void;
  reminders?: MedicationReminder[];
  onUpdateReminders?: (reminders: MedicationReminder[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders = [], onNavigate = () => {}, reminders = [], onUpdateReminders }) => {
  const [vitals, setVitals] = useState<VitalSign[]>(initialVitals);
  const [historyData, setHistoryData] = useState(initialHistoryData);
  const [activeChartKey, setActiveChartKey] = useState<string>('hr');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [maleDrAvatar, setMaleDrAvatar] = useState<string | null>(null);
  const [femaleDrAvatar, setFemaleDrAvatar] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState(88);

  // Nutrition & Hydration State
  const [waterIntake, setWaterIntake] = useState(1200); // ml
  const waterGoal = 3000; // ml
  const [meals, setMeals] = useState<{ id: string; time: string; name: string; calories: number }[]>([
    { id: '1', time: '08:30 AM', name: 'Oats & Berries', calories: 350 },
    { id: '2', time: '01:15 PM', name: 'Quinoa Salad', calories: 480 },
  ]);
  const [mealNameInput, setMealNameInput] = useState('');
  const [mealCalsInput, setMealCalsInput] = useState('');

  const [logForm, setLogForm] = useState({
    day: 'Sun',
    hr: 72,
    sys: 120,
    dia: 80,
    spo2: 98
  });

  const [location, setLocation] = useState({
    city: 'Patna',
    fullAddress: 'PATNA, BIHAR',
    loading: false
  });

  const [weather, setWeather] = useState({
    temp: '28',
    condition: 'SUNNY',
    aqi: '42',
    aqiLevel: 'GOOD',
    aqiColor: 'bg-green-500'
  });

  const fetchRealHealthData = useCallback(async () => {
    if (!navigator.geolocation) return;
    setLocation(prev => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoRes.json();
        const city = geoData?.address?.city || geoData?.address?.town || geoData?.address?.suburb || geoData?.address?.village || "Unknown Area";
        const state = (geoData?.address?.state || '').toUpperCase();
        const country = (geoData?.address?.country || 'INDIA').toUpperCase();
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`).catch(() => null),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current_air_quality=true`).catch(() => null)
        ]);
        let tempValue = '28', aqiValueStr = '42', aqiLevelStr = 'GOOD', color = 'bg-green-500', conditionStr = 'SUNNY';
        if (weatherRes?.ok) {
          const wData = await weatherRes.json();
          if (wData?.current_weather) {
            tempValue = Math.round(wData.current_weather.temperature).toString();
            const code = wData.current_weather.weathercode;
            conditionStr = (code >= 1 && code <= 3) ? 'PARTLY CLOUDY' : code >= 45 ? 'FOGGY' : code >= 51 ? 'RAINING' : 'CLEAR SKY';
          }
        }
        if (aqiRes?.ok) {
          const aData = await aqiRes.json();
          const aqiVal = aData?.current_air_quality?.us_aqi;
          if (typeof aqiVal === 'number') {
            aqiValueStr = aqiVal.toString();
            if (aqiVal > 150) { color = 'bg-red-500'; aqiLevelStr = 'POOR'; }
            else if (aqiVal > 100) { color = 'bg-orange-500'; aqiLevelStr = 'UNHEALTHY'; }
            else if (aqiVal > 50) { color = 'bg-yellow-500'; aqiLevelStr = 'MODERATE'; }
            else { color = 'bg-green-500'; aqiLevelStr = 'GOOD'; }
          }
        }
        setLocation({ city, fullAddress: state ? `${state}, ${country}` : country, loading: false });
        setWeather({ temp: tempValue, condition: conditionStr, aqi: aqiValueStr, aqiLevel: aqiLevelStr, aqiColor: color });
      } catch (e) {
        setLocation(prev => ({ ...prev, loading: false }));
      }
    }, () => setLocation(prev => ({ ...prev, loading: false })));
  }, []);

  useEffect(() => {
    fetchRealHealthData();
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    const loadAvatars = async () => {
      const [m, f] = await Promise.all([generateDoctorAvatar('male'), generateDoctorAvatar('female')]);
      setMaleDrAvatar(m); setFemaleDrAvatar(f);
    };
    loadAvatars();
    return () => clearInterval(clock);
  }, [fetchRealHealthData]);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedHistory = historyData.map(item => item.name === logForm.day ? { ...item, hr: logForm.hr, sys: logForm.sys, dia: logForm.dia, spo2: logForm.spo2 } : item);
    setHistoryData(updatedHistory);
    if (logForm.day === 'Sun') {
      setVitals(prev => prev.map(v => {
        if (v.id === 'hr') return { ...v, value: logForm.hr.toString() };
        if (v.id === 'bp') return { ...v, value: `${logForm.sys}/${logForm.dia}` };
        if (v.id === 'spo2') return { ...v, value: logForm.spo2.toString() };
        return v;
      }));
    }
    setIsModalOpen(false);
  };

  const addMeal = () => {
    if (!mealNameInput || !mealCalsInput) return;
    const newMeal = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: mealNameInput,
      calories: parseInt(mealCalsInput)
    };
    setMeals([...meals, newMeal]);
    setMealNameInput('');
    setMealCalsInput('');
  };

  const getChartColor = () => {
    if (activeChartKey === 'hr') return '#f43f5e';
    if (activeChartKey === 'spo2') return '#0d9488';
    return '#3b82f6';
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const waterProgress = Math.min(100, (waterIntake / waterGoal) * 100);
  const adherence = reminders.length > 0 ? Math.round((reminders.filter(r => r.isTakenToday).length / reminders.length) * 100) : 0;
  const nextMed = reminders.filter(r => !r.isTakenToday).sort((a, b) => a.time.localeCompare(b.time))[0];

  return (
    <div className="p-6 space-y-8 pb-24 md:pb-6 text-gray-900 dark:text-gray-100">
      <header className="flex flex-wrap gap-4 items-center">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[220px] justify-between transition-all hover:shadow-md">
           <div className="flex items-center">
              <div className="mr-3 text-xl">📍</div>
              <div className="max-w-[140px]">
                 <p className="font-black text-teal-600 dark:text-teal-400 text-lg leading-tight truncate">{location.city}</p>
                 <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest truncate mt-0.5">{location.fullAddress}</p>
              </div>
           </div>
           <button onClick={fetchRealHealthData} className={`ml-2 text-gray-300 hover:text-teal-500 transition-colors ${location.loading ? 'animate-spin' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[180px] justify-between transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="mr-3"><img src="https://img.icons8.com/color/48/lungs.png" alt="AQI Icon" className="w-8 h-8" /></div>
            <div>
              <p className="font-black text-xl leading-none text-slate-900 dark:text-white">{weather.aqi}</p>
              <p className={`text-[9px] font-black tracking-widest mt-1 ${weather.aqiColor.replace('bg-', 'text-')}`}>{weather.aqiLevel}</p>
            </div>
          </div>
          <div className={`ml-4 w-3 h-3 rounded-full ${weather.aqiColor} animate-pulse`}></div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[170px] justify-between transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="mr-3 text-2xl">{weather.condition === 'RAINING' ? '🌧️' : weather.condition === 'FOGGY' ? '🌫️' : '☀️'}</div>
            <div>
              <p className="font-black text-xl leading-none">{weather.temp}°C</p>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">{weather.condition}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[160px] justify-between transition-all hover:shadow-md">
           <div className="mr-3 text-2xl">🕒</div>
           <div>
              <p className="font-black text-xl leading-none">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">{currentTime.toLocaleDateString([], {weekday: 'long'}).toUpperCase()}</p>
           </div>
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
             <div className="md:col-span-1 bg-teal-600 rounded-[2rem] p-6 text-white flex flex-col justify-between shadow-lg shadow-teal-200 dark:shadow-none">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Health Score</p>
                <div className="my-2"><span className="text-5xl font-black">{healthScore}</span><span className="text-lg opacity-50 ml-1">/100</span></div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white transition-all duration-1000" style={{width: `${healthScore}%`}}></div></div>
             </div>
             <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {vitals.map((vital) => (
                  <div key={vital.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-transform active:scale-95 cursor-pointer">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">{vital.name}</p>
                    <p className={`text-xl font-black ${vital.color}`}>{vital.value}<span className="text-[10px] ml-0.5 opacity-50 font-bold">{vital.unit}</span></p>
                    <div className="flex items-center mt-2"><span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${vital.status === 'normal' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>{vital.status}</span></div>
                  </div>
                ))}
             </div>
          </div>

          {/* Nutrition & Hydration Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Hydration</h3>
                  <div className="text-blue-500 font-black">{Math.round(waterProgress)}%</div>
               </div>
               <div className="relative h-48 bg-blue-50 dark:bg-blue-900/20 rounded-3xl overflow-hidden flex flex-col items-center justify-center mb-6">
                  <div className="absolute bottom-0 left-0 w-full bg-blue-400/30 transition-all duration-1000" style={{ height: `${waterProgress}%` }}></div>
                  <div className="relative z-10 text-center">
                    <span className="text-4xl">💧</span>
                    <p className="text-2xl font-black text-blue-600 mt-2">{waterIntake}<span className="text-xs uppercase ml-1">ml</span></p>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Goal: {waterGoal}ml</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  {[250, 500].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setWaterIntake(prev => prev + amt)}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
                    >
                      +{amt}ml
                    </button>
                  ))}
                  <button onClick={() => setWaterIntake(0)} className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-2xl hover:text-rose-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Meal Log</h3>
                  <div className="text-orange-500 font-black">{totalCalories} kcal</div>
               </div>
               <div className="flex-1 overflow-y-auto max-h-40 space-y-3 mb-6 scrollbar-hide">
                  {meals.map(meal => (
                    <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                       <div className="truncate pr-2">
                          <p className="font-bold text-sm truncate uppercase tracking-tight">{meal.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{meal.time}</p>
                       </div>
                       <div className="text-xs font-black text-orange-600">+{meal.calories}</div>
                    </div>
                  ))}
                  {meals.length === 0 && <p className="text-center text-xs font-bold text-gray-300 uppercase py-8">No meals recorded today</p>}
               </div>
               <div className="space-y-2 mt-auto">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Meal name"
                      value={mealNameInput}
                      onChange={e => setMealNameInput(e.target.value)}
                      className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-xs font-bold placeholder-gray-400 focus:ring-1 focus:ring-orange-500" 
                    />
                    <input 
                      type="number" 
                      placeholder="Cals"
                      value={mealCalsInput}
                      onChange={e => setMealCalsInput(e.target.value)}
                      className="w-20 p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-xs font-bold placeholder-gray-400 focus:ring-1 focus:ring-orange-500" 
                    />
                  </div>
                  <button 
                    onClick={addMeal}
                    className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-md shadow-orange-100"
                  >
                    Log Meal
                  </button>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Biometric Trends</h2>
                  <div className="flex gap-4 mt-2">
                     {['hr', 'sys', 'spo2'].map(key => (
                       <button key={key} onClick={() => setActiveChartKey(key)} className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-all border-b-2 ${activeChartKey === key ? 'text-teal-600 border-teal-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>{key === 'hr' ? 'Heart Rate' : key === 'sys' ? 'Blood Pressure' : 'Oxygen Level'}</button>
                     ))}
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>Log Vitals
               </button>
             </div>
             <div style={{ width: '100%', height: 350, minHeight: 350 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#94a3b8'}} />
                   <YAxis hide={true} domain={['auto', 'auto']} />
                   <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }} />
                   <Line type="monotone" dataKey={activeChartKey} stroke={getChartColor()} strokeWidth={5} dot={{ r: 6, fill: getChartColor(), strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} />
                   {activeChartKey === 'sys' && <Line type="monotone" dataKey="dia" stroke="#93c5fd" strokeWidth={3} strokeDasharray="5 5" dot={false} />}
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
             <div onClick={() => onNavigate(AppView.VIDEO_CONSULT)} className="group bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-teal-500 transition-all shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 overflow-hidden flex items-center justify-center">{maleDrAvatar ? <img src={maleDrAvatar} className="w-full h-full object-cover" /> : <span className="text-2xl">👨‍⚕️</span>}</div>
                <div><h3 className="font-black text-lg uppercase tracking-tighter">Dr. Aryan</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AI General Physician</p></div>
             </div>
             <div onClick={() => onNavigate(AppView.VIDEO_CONSULT)} className="group bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-teal-500 transition-all shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 overflow-hidden flex items-center justify-center">{femaleDrAvatar ? <img src={femaleDrAvatar} className="w-full h-full object-cover" /> : <span className="text-2xl">👩‍⚕️</span>}</div>
                <div><h3 className="font-black text-lg uppercase tracking-tighter">Dr. Ishani</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AI Wellness Specialist</p></div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div className="flex justify-between items-start mb-6"><h3 className="text-xl font-black uppercase tracking-tighter">Med Adherence</h3><span className="text-teal-600 font-black text-lg">{adherence}%</span></div>
              <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden mb-8"><div className="h-full bg-teal-500 transition-all duration-1000" style={{width: `${adherence}%`}}></div></div>
              {nextMed ? (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                   <div className="truncate mr-2"><p className="font-bold text-sm truncate">{nextMed.name}</p><p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mt-1">{nextMed.time} • {nextMed.dosage}</p></div>
                   <button onClick={() => onUpdateReminders?.(reminders.map(r => r.id === nextMed.id ? {...r, isTakenToday: true} : r))} className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-teal-700 transition-colors shadow-sm">✓</button>
                </div>
              ) : <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-8">Prescription Complete ✨</p>}
           </div>
           <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="relative z-10">
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Steps Tracker</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest"><span>Walking Goal</span><span>6.5k / 10k</span></div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white w-[65%] shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div></div>
                    <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest mt-4">2.4 km remaining for today</p>
                 </div>
              </div>
              <span className="absolute -bottom-4 -right-4 text-9xl opacity-10 select-none pointer-events-none group-hover:rotate-12 transition-transform duration-700">🧘</span>
           </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">Log Health Data</h3>
            <form onSubmit={handleLogSubmit} className="space-y-5">
              <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Day</label>
                <select value={logForm.day} onChange={e => setLogForm({...logForm, day: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (<option key={day} value={day}>{day}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Heart Rate (bpm)</label><input type="number" value={logForm.hr} onChange={e => setLogForm({...logForm, hr: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl font-bold text-gray-900 dark:text-white" /></div>
                 <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SpO2 (%)</label><input type="number" value={logForm.spo2} onChange={e => setLogForm({...logForm, spo2: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl font-bold text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BP (Sys)</label><input type="number" value={logForm.sys} onChange={e => setLogForm({...logForm, sys: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl font-bold text-gray-900 dark:text-white" /></div>
                 <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BP (Dia)</label><input type="number" value={logForm.dia} onChange={e => setLogForm({...logForm, dia: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl font-bold text-gray-900 dark:text-white" /></div>
              </div>
              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                 <button type="submit" className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-teal-200">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
