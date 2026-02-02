
import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { VitalSign, AppView, MedicationReminder, OrderItem, MealEntry } from '../types';

const MapFocus = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

const initialHistoryData = [
  { name: 'Mon', steps: 4500 },
  { name: 'Tue', steps: 5200 },
  { name: 'Wed', steps: 6100 },
  { name: 'Thu', steps: 4800 },
  { name: 'Fri', steps: 7200 },
  { name: 'Sat', steps: 8500 },
  { name: 'Sun', steps: 6540 },
];

const initialVitals: VitalSign[] = [
  { id: 'hr', name: 'Heart Rate', value: '73', unit: 'bpm', status: 'normal', trend: 'stable', color: 'text-rose-500' },
  { id: 'bp', name: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', trend: 'up', color: 'text-blue-500' },
  { id: 'spo2', name: 'Oxygen Level', value: '98', unit: '%', status: 'normal', trend: 'stable', color: 'text-teal-500' },
  { id: 'temp', name: 'Temperature', value: '98.6', unit: '°F', status: 'normal', trend: 'stable', color: 'text-amber-500' },
];

interface DashboardProps {
  onNavigate?: (view: AppView) => void;
  reminders?: MedicationReminder[];
  onUpdateReminders?: (reminders: MedicationReminder[]) => void;
  orders?: OrderItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate = () => {}, 
  reminders = [], 
  onUpdateReminders,
  orders = []
}) => {
  const [vitals] = useState<VitalSign[]>(initialVitals);
  const [historyData] = useState(initialHistoryData);
  const [healthScore] = useState(88);
  const [waterIntake, setWaterIntake] = useState(1200);
  const waterGoal = 3000;
  
  const [dailyCals, setDailyCals] = useState(() => {
    const saved = localStorage.getItem('medassist_meals');
    if (!saved) return 0;
    const meals: MealEntry[] = JSON.parse(saved);
    return meals.reduce((sum, m) => sum + m.calories, 0);
  });
  const calGoal = 2200;

  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('medassist_steps');
    return saved ? parseInt(saved, 10) : 6540;
  });
  const stepGoal = 10000;
  const [isPedometerActive, setIsPedometerActive] = useState(false);

  const [location, setLocation] = useState({
    city: 'Patna',
    fullAddress: 'BIHAR, INDIA',
    coords: [25.5941, 85.1376] as [number, number],
    loading: true
  });

  useEffect(() => {
    let lastMag = 0;
    const threshold = 12;
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
      if (Math.abs(mag - lastMag) > threshold) {
        setSteps(prev => {
          const next = prev + 1;
          localStorage.setItem('medassist_steps', next.toString());
          return next;
        });
        setIsPedometerActive(true);
        setTimeout(() => setIsPedometerActive(false), 300);
      }
      lastMag = mag;
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const fetchLocation = useCallback(async () => {
    setLocation(prev => ({ ...prev, loading: true }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocation({
            city: data.address.city || data.address.town || "Current Location",
            fullAddress: `${data.address.state.toUpperCase()}, INDIA`,
            coords: [latitude, longitude],
            loading: false
          });
        } catch (e) {
          setLocation(prev => ({ ...prev, loading: false }));
        }
      }, () => setLocation(p => ({ ...p, loading: false })));
    }
  }, []);

  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  const waterProgress = Math.min(100, (waterIntake / waterGoal) * 100);
  const calProgress = Math.min(100, (dailyCals / calGoal) * 100);
  const stepProgress = Math.min(100, (steps / stepGoal) * 100);
  const adherence = reminders.length > 0 ? Math.round((reminders.filter(r => r.isTakenToday).length / reminders.length) * 100) : 100;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32 md:pb-8 max-w-[1600px] mx-auto transition-all duration-500">
      
      {/* 1. Immersive Header Section */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-3xl flex items-center justify-center text-3xl shadow-inner">👋</div>
            <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Good Morning, Rahul</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 System Status: Bio-Synced & Active
               </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={fetchLocation}
            className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-[1.8rem] flex items-center gap-4 hover:shadow-lg transition-all group border border-slate-100 dark:border-slate-700"
          >
             <div className="text-xl group-hover:scale-125 transition-transform duration-500">📍</div>
             <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Zone</p>
                <p className="text-sm font-black text-slate-800 dark:text-teal-400 uppercase tracking-tight">{location.loading ? 'Locating...' : location.city}</p>
             </div>
          </button>

          <button 
            onClick={() => onNavigate(AppView.HEALTH_NEWS)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-[1.8rem] shadow-xl shadow-rose-200 dark:shadow-none flex items-center gap-4 transition-all transform hover:scale-105 active:scale-95"
          >
             <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
             </div>
             <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-widest leading-none opacity-80 mb-1">Critical Update</p>
                <p className="text-xs font-black uppercase tracking-tight">Active Outbreak Monitor</p>
             </div>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* 2. Left Section: Vitals & Core Stats */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {vitals.map((vital) => (
               <div key={vital.id} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-50 dark:border-slate-700 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="flex justify-between items-start mb-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-opacity-10 shadow-inner ${vital.color.replace('text-', 'bg-')}`}>
                        <svg className={`w-6 h-6 ${vital.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           {vital.id === 'hr' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />}
                           {vital.id === 'bp' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                           {vital.id === 'spo2' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                           {vital.id === 'temp' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                        </svg>
                     </div>
                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${vital.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                        {vital.status}
                     </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{vital.name}</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{vital.value}</span>
                     <span className="text-xs font-bold text-slate-400 uppercase">{vital.unit}</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative h-[450px] group">
                <div className="absolute top-8 left-8 z-[20] flex flex-col gap-3 pointer-events-none">
                   <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-6 py-4 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                      <h3 className="text-base font-black uppercase tracking-tighter text-teal-600">Geo-Health Matrix</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Zone: {location.city}</p>
                   </div>
                </div>
                <div className="h-full w-full z-0 grayscale-[40%] brightness-[0.9] opacity-90 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105">
                   <MapContainer style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={location.coords} />
                      <MapFocus center={location.coords} />
                   </MapContainer>
                </div>
                <div className="absolute bottom-8 left-8 right-8 z-20">
                   <button 
                    onClick={() => onNavigate(AppView.DOCTOR_FINDER)} 
                    className="w-full bg-slate-900 dark:bg-teal-600 text-white py-5 rounded-[1.8rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                   >
                      Search Regional Specialists
                   </button>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Physical Performance</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Daily mobility log & efficiency</p>
                   </div>
                   <div className={`w-4 h-4 rounded-full ${isPedometerActive ? 'bg-green-500 animate-ping' : 'bg-slate-200'}`}></div>
                </div>
                
                <div className="flex-1 min-h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData}>
                        <defs>
                          <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px', padding: '12px 20px' }}
                          cursor={{ stroke: '#0d9488', strokeWidth: 2, strokeDasharray: '6 6' }}
                        />
                        <Area type="monotone" dataKey="steps" stroke="#0d9488" strokeWidth={4} fillOpacity={1} fill="url(#colorSteps)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>

                <div className="mt-8 flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Distance</p>
                      <div className="flex items-baseline gap-1">
                         <span className="text-5xl font-black tracking-tighter text-slate-800 dark:text-white">{(steps/1000).toFixed(1)}k</span>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Steps</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Achievement</p>
                      <p className="text-2xl font-black text-teal-600 uppercase tracking-tighter">{Math.round(stepProgress)}%</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* 4. Right Section: Command Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           
           <div className="bg-[#0b4d4a] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-teal-100 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-3">Diagnostic Integrity Score</p>
                 <div className="flex items-baseline gap-3 mb-10">
                    <span className="text-8xl font-black tracking-tighter">{healthScore}</span>
                    <span className="text-2xl font-bold opacity-40">/ 100</span>
                 </div>
                 
                 <div className="space-y-8">
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                          <span>Clinical Adherence</span>
                          <span>{adherence}%</span>
                       </div>
                       <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-all duration-1000" style={{width: `${adherence}%`}}></div>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => onNavigate(AppView.CHAT)}
                      className="w-full py-5 bg-white text-teal-900 rounded-[1.8rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-teal-50 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                       Execute Symptom Analysis
                    </button>
                 </div>
              </div>
           </div>

           {/* 5. Hydration & Nutrition Hubs */}
           <div className="grid grid-cols-1 gap-8">
              {/* Nutrition Hub */}
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Metabolic Energy</h3>
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Daily Cap: {calGoal} kcal</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🥗</div>
                </div>
                
                <div className="relative h-24 bg-slate-50 dark:bg-slate-900/40 rounded-[1.8rem] overflow-hidden mb-6 border border-slate-100 dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000 ease-out origin-left" style={{ width: `${calProgress}%` }}></div>
                  <div className="relative h-full flex items-center px-6 justify-between">
                    <p className="text-2xl font-black text-white mix-blend-difference">{dailyCals} kcal</p>
                    <p className="text-[10px] font-black text-white mix-blend-difference uppercase tracking-widest">{Math.round(calProgress)}% Consumed</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate(AppView.MEALS)}
                  className="w-full py-5 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 dark:shadow-none transform active:scale-95"
                >
                  Log Nutrition Input
                </button>
              </div>

              {/* Hydration Hub */}
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Hydration Hub</h3>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Daily Optimum: {waterGoal}ml</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner">💧</div>
                </div>
                
                <div className="relative h-56 bg-blue-50/40 dark:bg-blue-900/10 rounded-[2.8rem] overflow-hidden mb-8 border border-blue-50 dark:border-blue-900/30 group">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000 ease-out" 
                    style={{ height: `${waterProgress}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-8 bg-white/20 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-4 bg-white/10 -mt-4 animate-bounce duration-[2000ms]"></div>
                  </div>
                  <div className="relative h-full flex flex-col items-center justify-center">
                    <p className="text-5xl font-black text-blue-700 dark:text-blue-300 tracking-tighter leading-none">{waterIntake}</p>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mt-3">Milliliters Consumed</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {[250, 500].map(amt => (
                    <button 
                      key={amt} 
                      onClick={() => setWaterIntake(prev => prev + amt)} 
                      className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none transform active:scale-95"
                    >
                      +{amt}ml
                    </button>
                  ))}
                </div>
              </div>
           </div>

           {/* 6. Medical Bulletin Widget */}
           <div 
             onClick={() => onNavigate(AppView.HEALTH_NEWS)}
             className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:bg-slate-800 transition-all duration-500"
           >
              <div className="relative z-10">
                 <div className="flex justify-between items-center mb-8">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🗞️</div>
                    <span className="bg-teal-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Intelligence Feed</span>
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter mb-3 leading-tight">Global Medical<br />Bulletin</h3>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 max-w-[240px]">
                    Real-time monitoring of viral outbreaks and clinical journal breakthroughs.
                 </p>
                 <div className="flex items-center gap-3 text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                    <span>Read Full Bulletin</span>
                    <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </div>
              </div>
              <div className="absolute -bottom-16 -right-16 text-[12rem] opacity-[0.03] select-none pointer-events-none group-hover:rotate-12 transition-transform duration-1000 font-black">NEWS</div>
           </div>

        </div>
      </div>

      {/* 7. Emergency Floating Footer (Mobile Optimzed) */}
      <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
         <button 
           onClick={() => onNavigate(AppView.AMBULANCE)}
           className="w-full bg-rose-600 text-white py-6 rounded-[2.2rem] font-black uppercase text-sm tracking-[0.3em] shadow-[0_20px_50px_rgba(225,29,72,0.4)] flex items-center justify-center gap-4 animate-bounce"
         >
            <span className="text-xl">🚑</span> Emergency Dispatch
         </button>
      </div>

    </div>
  );
};

export default Dashboard;
