
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { VitalSign, OrderItem, AppView, MedicationReminder } from '../types';

// Helper to keep map synced with state
const MapFocus: React.FC<{ center: [number, number], follow: boolean }> = ({ center, follow }) => {
  const map = useMap();
  useEffect(() => {
    if (follow) {
      map.setView(center, 15);
    }
  }, [center, follow, map]);
  return null;
};

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
  const [vitals] = useState<VitalSign[]>(initialVitals);
  const [historyData] = useState(initialHistoryData);
  const [activeChartKey, setActiveChartKey] = useState<string>('hr');
  const [healthScore] = useState(88);
  const [waterIntake, setWaterIntake] = useState(1200);
  const waterGoal = 3000;
  const [isFollowing, setIsFollowing] = useState(true);

  // Default values set to Patna for immediate UI readiness
  const [location, setLocation] = useState({
    city: 'Patna',
    fullAddress: 'BIHAR, INDIA',
    coords: [25.5941, 85.1376] as [number, number],
    details: {
      postcode: '800001',
      suburb: 'Kankarbagh',
      state: 'Bihar',
      district: 'Patna'
    },
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
    setLocation(prev => ({ ...prev, loading: true }));
    
    const handleSuccess = async (pos: GeolocationPosition) => {
      try {
        const { latitude, longitude } = pos.coords;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoRes.json();
        
        const addr = geoData?.address || {};
        const city = addr.city || addr.town || addr.suburb || addr.village || "Current Location";
        const stateStr = (addr.state || '').toUpperCase();
        const countryStr = (addr.country || 'INDIA').toUpperCase();
        
        // Parallel fetch for weather and air quality
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`).catch(() => null),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current_air_quality=true`).catch(() => null)
        ]);

        if (weatherRes?.ok) {
          const wData = await weatherRes.json();
          if (wData?.current_weather) {
            setWeather(prev => ({
              ...prev,
              temp: Math.round(wData.current_weather.temperature).toString(),
              condition: wData.current_weather.weathercode >= 51 ? 'RAINING' : 'CLEAR SKY'
            }));
          }
        }

        if (aqiRes?.ok) {
          const aData = await aqiRes.json();
          const aqiVal = aData?.current_air_quality?.us_aqi;
          if (typeof aqiVal === 'number') {
            let level = 'GOOD', color = 'bg-green-500';
            if (aqiVal > 150) { color = 'bg-red-500'; level = 'POOR'; }
            else if (aqiVal > 100) { color = 'bg-orange-500'; level = 'UNHEALTHY'; }
            else if (aqiVal > 50) { color = 'bg-yellow-500'; level = 'MODERATE'; }
            setWeather(prev => ({ ...prev, aqi: aqiVal.toString(), aqiLevel: level, aqiColor: color }));
          }
        }

        setLocation({
          city: city,
          fullAddress: stateStr ? `${stateStr}, ${countryStr}` : countryStr,
          coords: [latitude, longitude],
          details: {
            postcode: addr.postcode || '800001',
            suburb: addr.suburb || addr.neighbourhood || addr.road || 'City Center',
            state: addr.state || 'Bihar',
            district: addr.state_district || addr.county || 'Patna'
          },
          loading: false
        });
      } catch (e) {
        console.error("Location fetch failed", e);
        setLocation(prev => ({ ...prev, loading: false }));
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("Geolocation failed", err.message);
      // Fail gracefully back to Patna
      setLocation(prev => ({ 
        ...prev, 
        city: 'Patna', 
        fullAddress: 'GPS UNAVAILABLE (FALLBACK)', 
        loading: false 
      }));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { timeout: 8000, enableHighAccuracy: false });
    } else {
      handleError({ code: 0, message: "Not supported", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as any);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRealHealthData();
  }, [fetchRealHealthData]);

  const waterProgress = Math.min(100, (waterIntake / waterGoal) * 100);
  const adherence = reminders.length > 0 ? Math.round((reminders.filter(r => r.isTakenToday).length / reminders.length) * 100) : 0;
  const nextMed = reminders.filter(r => !r.isTakenToday).sort((a, b) => a.time.localeCompare(b.time))[0];

  return (
    <div className="p-6 space-y-8 pb-24 md:pb-6 text-gray-900 dark:text-gray-100">
      <header className="flex flex-wrap gap-4 items-center">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[240px] justify-between transition-all hover:shadow-md">
           <div className="flex items-center">
              <div className="mr-3 text-xl">{location.loading ? '⏳' : '📍'}</div>
              <div className="max-w-[150px]">
                 <p className={`font-black text-teal-600 dark:text-teal-400 text-lg leading-tight truncate`}>{location.city}</p>
                 <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest truncate mt-0.5">{location.fullAddress}</p>
              </div>
           </div>
           <button onClick={fetchRealHealthData} className={`ml-2 text-gray-300 hover:text-teal-500 transition-colors ${location.loading ? 'animate-spin text-teal-500' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[180px] justify-between transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="mr-3"><img src="https://img.icons8.com/color/48/lungs.png" alt="AQI Icon" className={`w-8 h-8`} /></div>
            <div>
              <p className="font-black text-xl leading-none text-slate-900 dark:text-white">{weather.aqi}</p>
              <p className={`text-[9px] font-black tracking-widest mt-1 ${weather.aqiColor.replace('bg-', 'text-')}`}>{weather.aqiLevel}</p>
            </div>
          </div>
          <div className={`ml-4 w-3 h-3 rounded-full ${weather.aqiColor} animate-pulse`}></div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[170px] justify-between transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="mr-3 text-2xl">{weather.condition === 'RAINING' ? '🌧️' : '☀️'}</div>
            <div>
              <p className="font-black text-xl leading-none">{weather.temp}°C</p>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">{weather.condition}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative group h-[400px]">
               <div className="absolute top-6 left-6 z-[20] flex flex-col gap-2">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-black uppercase tracking-tighter text-teal-600">Live Health Zone</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{location.loading ? 'Updating Geo-Sync...' : 'Accuracy: High Precision'}</p>
                  </div>
               </div>
               
               <div className="absolute bottom-6 right-6 z-[20] flex flex-col gap-2">
                  <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`p-4 rounded-2xl shadow-2xl transition-all border-2 ${isFollowing ? 'bg-teal-600 border-teal-400 text-white' : 'bg-white dark:bg-gray-800 border-transparent text-gray-400'}`}
                  >
                    <svg className={`w-6 h-6 ${isFollowing ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
               </div>

               <div className="h-full w-full z-0">
                  <MapContainer center={location.coords} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={location.coords} />
                    <MapFocus center={location.coords} follow={isFollowing} />
                  </MapContainer>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xl font-black uppercase tracking-tighter">Location Details</h3>
                     <span className={`w-3 h-3 bg-green-500 rounded-full ${location.loading ? 'animate-ping' : ''}`}></span>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Postal Code</p>
                           <p className="text-lg font-black text-slate-800 dark:text-white">{location.details.postcode}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">District</p>
                           <p className="text-lg font-black text-slate-800 dark:text-white truncate">{location.details.district}</p>
                        </div>
                     </div>

                     <div className="bg-teal-50/50 dark:bg-teal-900/20 p-5 rounded-3xl border-2 border-dashed border-teal-100 dark:border-teal-800">
                        <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Detailed Address</p>
                        <p className="text-sm font-bold text-teal-900 dark:text-teal-100 leading-relaxed italic">
                           {location.details.suburb}, {location.details.state} {location.details.postcode !== 'N/A' ? `- ${location.details.postcode}` : ''}
                        </p>
                     </div>

                     <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                           <span>Live Lat/Lng</span>
                           <span className="text-teal-600">Geo-Sync Ready</span>
                        </div>
                        <div className="bg-gray-900 text-teal-400 p-3 rounded-xl font-mono text-xs text-center border-2 border-gray-800">
                           {location.coords[0].toFixed(6)}° N, {location.coords[1].toFixed(6)}° E
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

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
             </div>
             <div style={{ width: '100%', height: 300 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={historyData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#94a3b8'}} />
                   <YAxis hide={true} domain={['auto', 'auto']} />
                   <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '10px' }} />
                   <Line type="monotone" dataKey={activeChartKey} stroke="#0d9488" strokeWidth={5} dot={{ r: 6, fill: '#0d9488', strokeWidth: 3, stroke: '#fff' }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div className="flex justify-between items-start mb-6"><h3 className="text-xl font-black uppercase tracking-tighter">Med Adherence</h3><span className="text-teal-600 font-black text-lg">{adherence}%</span></div>
              <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden mb-8"><div className="h-full bg-teal-500 transition-all duration-1000" style={{width: `${adherence}%`}}></div></div>
              {nextMed ? (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                   <div className="truncate mr-2"><p className="font-bold text-sm truncate">{nextMed.name}</p><p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mt-1">{nextMed.time} • {nextMed.dosage}</p></div>
                   <button onClick={() => onUpdateReminders?.(reminders.map(r => r.id === nextMed.id ? {...r, isTakenToday: true} : r))} className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-teal-700 transition-colors shadow-sm">✓</button>
                </div>
              ) : <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-8">All clear ✨</p>}
           </div>
           
           <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="relative z-10">
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Daily Goal</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest"><span>Steps</span><span>6.5k / 10k</span></div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white w-[65%]"></div></div>
                 </div>
              </div>
              <span className="absolute -bottom-4 -right-4 text-9xl opacity-10 select-none pointer-events-none group-hover:rotate-12 transition-transform duration-700">🏃</span>
           </div>

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
                    <button key={amt} onClick={() => setWaterIntake(prev => prev + amt)} className="flex-1 py-3 bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-blue-100">+{amt}ml</button>
                  ))}
               </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
