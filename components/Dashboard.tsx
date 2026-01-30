
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { VitalSign, OrderItem, AppView, MedicationReminder } from '../types';

// Helper to keep map synced with state
// Fixed: Explicitly defining props for the MapFocus component to resolve the "Expected 0 arguments, but got 1" error
const MapFocus = ({ center, follow }: { center: [number, number], follow: boolean }) => {
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

  // Step Counter State
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('medassist_steps');
    return saved ? parseInt(saved, 10) : 6540;
  });
  const stepGoal = 10000;
  const [isPedometerActive, setIsPedometerActive] = useState(false);

  // Location State
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
    loading: true
  });

  // Edit Mode State
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [tempLocation, setTempLocation] = useState({
    city: location.city,
    postcode: location.details.postcode,
    district: location.details.district,
    suburb: location.details.suburb,
    state: location.details.state,
    coords: location.coords
  });

  const postcodeRef = useRef<HTMLInputElement>(null);

  const [weather, setWeather] = useState({
    temp: '28',
    condition: 'SUNNY',
    aqi: '42',
    aqiLevel: 'GOOD',
    aqiColor: 'bg-green-500'
  });

  // New Feature: Regional Health Insights
  const [healthInsights, setHealthInsights] = useState({
    hospitalCount: 14,
    emergencyResponse: '8 mins',
    coverageRating: '9.2',
    riskLevel: 'LOW'
  });

  // Effect to auto-fetch when postcode reaches 6 digits
  useEffect(() => {
    if (isEditingLocation && tempLocation.postcode.length === 6) {
      autoFetchLocationData(tempLocation.postcode);
    }
  }, [tempLocation.postcode, isEditingLocation]);

  const autoFetchLocationData = async (code: string) => {
    setIsFetchingData(true);
    try {
      const searchRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${code}&country=India`);
      const searchData = await searchRes.json();

      if (searchData && searchData.length > 0) {
        const first = searchData[0];
        const newCoords: [number, number] = [parseFloat(first.lat), parseFloat(first.lon)];
        
        const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords[0]}&lon=${newCoords[1]}`);
        const revData = await revRes.json();
        
        if (revData?.address) {
          const addr = revData.address;
          setTempLocation(prev => ({
            ...prev,
            city: addr.city || addr.town || addr.village || addr.suburb || prev.city,
            district: addr.state_district || addr.county || prev.district,
            state: addr.state || prev.state,
            suburb: addr.suburb || addr.neighbourhood || addr.road || prev.suburb,
            coords: newCoords
          }));

          // Simulate updating health insights for the new area
          const hash = code.split('').reduce((acc, char) => acc + parseInt(char), 0);
          setHealthInsights({
            hospitalCount: 5 + (hash % 15),
            emergencyResponse: `${6 + (hash % 8)} mins`,
            coverageRating: (7 + (hash % 30) / 10).toFixed(1),
            riskLevel: hash % 2 === 0 ? 'LOW' : 'MODERATE'
          });
        }
      }
    } catch (e) {
      console.error("Auto-fetch failed", e);
    } finally {
      setIsFetchingData(false);
    }
  };

  // Step Counter Logic
  useEffect(() => {
    let lastMag = 0;
    const threshold = 12;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
      const delta = Math.abs(mag - lastMag);
      if (delta > threshold) {
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

  const fetchRealHealthData = useCallback(async () => {
    setLocation(prev => ({ ...prev, loading: true }));
    const handleSuccess = async (pos: GeolocationPosition) => {
      try {
        const { latitude, longitude } = pos.coords;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoRes.json();
        const addr = geoData?.address || {};
        
        const newDetails = {
          postcode: addr.postcode || '800001',
          suburb: addr.suburb || addr.neighbourhood || addr.road || 'City Center',
          state: addr.state || 'Bihar',
          district: addr.state_district || addr.county || 'Patna'
        };

        setLocation({
          city: addr.city || addr.town || addr.suburb || "Current Location",
          fullAddress: `${(addr.state || '').toUpperCase()}, ${(addr.country || 'INDIA').toUpperCase()}`,
          coords: [latitude, longitude],
          details: newDetails,
          loading: false
        });

        setTempLocation({
          city: addr.city || addr.town || addr.suburb || "Current Location",
          postcode: newDetails.postcode,
          district: newDetails.district,
          suburb: newDetails.suburb,
          state: newDetails.state,
          coords: [latitude, longitude]
        });
      } catch (e) {
        setLocation(prev => ({ ...prev, loading: false }));
      }
    };
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(handleSuccess, () => setLocation(p => ({ ...p, loading: false })));
  }, []);

  useEffect(() => { fetchRealHealthData(); }, [fetchRealHealthData]);

  const handleSaveLocation = () => {
    setLocation(prev => ({
      ...prev,
      city: tempLocation.city,
      coords: tempLocation.coords,
      details: {
        ...prev.details,
        postcode: tempLocation.postcode,
        district: tempLocation.district,
        suburb: tempLocation.suburb,
        state: tempLocation.state
      },
      fullAddress: `${tempLocation.state.toUpperCase()}, INDIA`
    }));
    setIsEditingLocation(false);
  };

  const toggleEditMode = () => {
    if (!isEditingLocation) {
      setIsEditingLocation(true);
      setTimeout(() => postcodeRef.current?.focus(), 50);
    } else {
      handleSaveLocation();
    }
  };

  const waterProgress = Math.min(100, (waterIntake / waterGoal) * 100);
  const stepProgress = Math.min(100, (steps / stepGoal) * 100);
  const adherence = reminders.length > 0 ? Math.round((reminders.filter(r => r.isTakenToday).length / reminders.length) * 100) : 0;
  const nextMed = reminders.filter(r => !r.isTakenToday).sort((a, b) => a.time.localeCompare(b.time))[0];

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}></div>
  );

  return (
    <div className="p-6 space-y-8 pb-24 md:pb-6 text-gray-900 dark:text-gray-100">
      <header className="flex flex-wrap gap-4 items-center">
        {location.loading ? (
          <div className="flex gap-4 w-full md:w-auto">
             <Skeleton className="h-14 w-60 rounded-2xl" />
             <Skeleton className="h-14 w-44 rounded-2xl" />
             <Skeleton className="h-14 w-40 rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-3 rounded-2xl shadow-sm flex items-center min-w-[240px] justify-between transition-all hover:shadow-md">
               <div className="flex items-center">
                  <div className="mr-3 text-xl">📍</div>
                  <div className="max-w-[150px]">
                     <p className={`font-black text-teal-600 dark:text-teal-400 text-lg leading-tight truncate`}>{location.city}</p>
                     <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest truncate mt-0.5">{location.fullAddress}</p>
                  </div>
               </div>
               <button onClick={fetchRealHealthData} className="ml-2 text-gray-300 hover:text-teal-500 transition-colors">
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
          </>
        )}
      </header>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {location.loading ? (
              <Skeleton className="h-[400px] md:col-span-2 rounded-[2.5rem]" />
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative group h-[400px]">
                   <div className="absolute top-6 left-6 z-[20] flex flex-col gap-2">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-black uppercase tracking-tighter text-teal-600">Live Health Zone</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accuracy: High Precision</p>
                      </div>
                   </div>
                   <div className="h-full w-full z-0">
                      {/* Fixed: MapFocus handles view management */}
                      <MapContainer style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={isEditingLocation ? tempLocation.coords : location.coords} />
                        <MapFocus center={isEditingLocation ? tempLocation.coords : location.coords} follow={isFollowing} />
                      </MapContainer>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-all duration-300">
                      <div className="flex justify-between items-center mb-8">
                         <h3 className="text-xl font-black uppercase tracking-tighter">Location Details</h3>
                         <div className="flex items-center gap-3">
                           {!isEditingLocation ? (
                              <button onClick={toggleEditMode} className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                           ) : (
                              <div className="flex gap-2">
                                <button onClick={() => setIsEditingLocation(false)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                <button onClick={handleSaveLocation} className="p-2 text-green-500 hover:bg-green-900/10 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></button>
                              </div>
                           )}
                           <span className={`w-3 h-3 bg-green-500 rounded-full ${isEditingLocation ? 'animate-pulse' : ''}`}></span>
                         </div>
                      </div>
                      
                      <div className="space-y-6 flex-1">
                         <div className="grid grid-cols-2 gap-4">
                            <div className={`bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all ${!isEditingLocation ? 'cursor-pointer' : ''}`}>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Postal Code</p>
                               {isEditingLocation ? (
                                 <div className="relative">
                                   <input ref={postcodeRef} type="text" value={tempLocation.postcode} onChange={(e) => setTempLocation({...tempLocation, postcode: e.target.value})} className="w-full bg-transparent font-black text-lg text-teal-600 outline-none border-b-2 border-teal-500 pb-1" maxLength={6} />
                                   {isFetchingData && <div className="absolute right-0 top-1 w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>}
                                 </div>
                               ) : (
                                 <p className="text-lg font-black text-slate-800 dark:text-white" onClick={toggleEditMode}>{location.details.postcode}</p>
                               )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">District</p>
                               {isEditingLocation ? (
                                 <input type="text" value={tempLocation.district} onChange={(e) => setTempLocation({...tempLocation, district: e.target.value})} className="w-full bg-transparent font-black text-lg text-teal-600 outline-none border-b-2 border-teal-500 pb-1" />
                               ) : (
                                 <p className="text-lg font-black text-slate-800 dark:text-white truncate" onClick={toggleEditMode}>{location.details.district}</p>
                               )}
                            </div>
                         </div>

                         <div className={`p-5 rounded-3xl border-2 border-dashed transition-all ${isEditingLocation ? 'border-teal-400 bg-teal-50/80 dark:bg-teal-900/40' : 'border-teal-100 bg-teal-50/50 dark:bg-teal-900/20'}`} onClick={() => !isEditingLocation && toggleEditMode()}>
                            <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Detailed Address</p>
                            {isEditingLocation ? (
                              <textarea value={tempLocation.suburb} onChange={(e) => setTempLocation({...tempLocation, suburb: e.target.value})} className="w-full bg-transparent text-sm font-bold text-teal-900 dark:text-teal-100 outline-none border-b-2 border-teal-500 resize-none h-12" />
                            ) : (
                              <p className="text-sm font-bold text-teal-900 dark:text-teal-100 leading-relaxed italic truncate">
                                 {location.details.suburb}, {location.details.state}
                              </p>
                            )}
                         </div>

                         <div className="mt-auto space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                               <span>Live Lat/Lng</span>
                               <span className="text-teal-600 font-bold">{isEditingLocation ? 'Manual Override' : 'Geo-Sync'}</span>
                            </div>
                            <div className="bg-gray-900 text-teal-400 p-3 rounded-xl font-mono text-[10px] text-center border border-gray-800 shadow-inner">
                               {location.coords[0].toFixed(6)}° N, {location.coords[1].toFixed(6)}° E
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>

          {/* New Feature: Regional Health Insights */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Regional Health Insights</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Infrastructure analysis for {location.city}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${healthInsights.riskLevel === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                   Risk: {healthInsights.riskLevel}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🏥</span>
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Facilities</p>
                   </div>
                   <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{healthInsights.hospitalCount}</p>
                   <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Clinics & Hospitals</p>
                </div>
                
                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-3xl border border-rose-100 dark:border-rose-800/50">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🚑</span>
                      <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Emergency</p>
                   </div>
                   <p className="text-3xl font-black text-rose-900 dark:text-rose-100">{healthInsights.emergencyResponse}</p>
                   <p className="text-[10px] font-bold text-rose-400 uppercase mt-1">Avg Response Time</p>
                </div>
                
                <div className="p-6 bg-teal-50 dark:bg-teal-900/20 rounded-3xl border border-teal-100 dark:border-teal-800/50">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">⭐</span>
                      <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Rating</p>
                   </div>
                   <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black text-teal-900 dark:text-teal-100">{healthInsights.coverageRating}</p>
                      <span className="text-xs font-bold text-teal-500">/10</span>
                   </div>
                   <p className="text-[10px] font-bold text-teal-400 uppercase mt-1">Coverage Index</p>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
             <div className="md:col-span-1 bg-teal-600 rounded-[2rem] p-6 text-white flex flex-col justify-between shadow-lg shadow-teal-200">
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
        </div>

        <div className="space-y-6">
           {/* Emergency SOS Card - New Ambulance Feature */}
           <div className="bg-rose-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-200 dark:shadow-none flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Emergency SOS</h3>
              <p className="text-xs font-bold text-rose-100 mb-6 uppercase tracking-widest opacity-80">Book ambulance instantly for FREE</p>
              <button 
                onClick={() => onNavigate(AppView.AMBULANCE)}
                className="w-full py-4 bg-white text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-rose-50 transition-all shadow-lg active:scale-95"
              >
                Launch Ambulance
              </button>
           </div>

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
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Step Tracker</h3>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isPedometerActive ? 'bg-green-400 text-white animate-pulse' : 'bg-white/20'}`}>
                       {isPedometerActive ? 'Live' : 'Active'}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-4xl font-black tracking-tighter">{(steps/1000).toFixed(1)}k</span>
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">/ {stepGoal/1000}k Goal</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                       <div className="h-full bg-white transition-all duration-500 shadow-[0_0_10px_white]" style={{width: `${stepProgress}%`}}></div>
                    </div>
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
