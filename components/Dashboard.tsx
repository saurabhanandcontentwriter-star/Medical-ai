import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VitalSign, OrderItem, AppView } from '../types';

// Initial historical data for the chart
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
}

const Dashboard: React.FC<DashboardProps> = ({ orders = [], onNavigate = (view: AppView) => {} }) => {
  const [vitals, setVitals] = useState<VitalSign[]>(initialVitals);
  const [historyData, setHistoryData] = useState(initialHistoryData);
  const [selectedVitalId, setSelectedVitalId] = useState<string>('hr');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Greeting State
  const [showGreeting, setShowGreeting] = useState(true);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Greeting Timer
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 4000); // Hide greeting after 4 seconds
    return () => clearTimeout(timer);
  }, []);
  
  // Filter for upcoming doctor appointments
  const upcomingAppointments = orders
    .filter(o => o.type === 'doctor_appointment' && ['Confirmed', 'Scheduled'].includes(o.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Show top 3

  // Weather State
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    location: string;
    loading: boolean;
  }>({ temp: 0, condition: '', location: 'Detecting...', loading: true });

  // Fetch Weather & Location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // 1. Fetch Weather (Open-Meteo)
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          
          // 2. Fetch Location Name (Nominatim)
          const locationRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const locationData = await locationRes.json();
          
          // Extract meaningful city/area name
          const city = locationData.address.city || 
                       locationData.address.town || 
                       locationData.address.village || 
                       locationData.address.county || 
                       locationData.address.state_district || 
                       "Unknown Location";
          
          // Determine Condition
          const code = weatherData.current_weather.weathercode;
          let cond = "Sunny";
          if (code >= 1 && code <= 3) cond = "Partly Cloudy";
          else if (code >= 45 && code <= 48) cond = "Foggy";
          else if (code >= 51 && code <= 67) cond = "Rainy";
          else if (code >= 71 && code <= 77) cond = "Snowy";
          else if (code >= 80 && code <= 99) cond = "Stormy";

          setWeather({
            temp: weatherData.current_weather.temperature,
            condition: cond,
            location: city,
            loading: false
          });
        } catch (error) {
          console.error("Error fetching weather data", error);
          setWeather({ temp: 28, condition: 'Sunny', location: 'Patna (Default)', loading: false });
        }
      }, (error) => {
        console.error("Location access denied:", error.message);
        setWeather({ temp: 28, condition: 'Sunny', location: 'Patna', loading: false });
      });
    } else {
      setWeather({ temp: 28, condition: 'Sunny', location: 'Patna', loading: false });
    }
  }, []);
  
  // Form State
  const [logForm, setLogForm] = useState({
    vitalId: 'hr',
    value: '',
    date: new Date().toLocaleDateString('en-US', { weekday: 'short' })
  });

  const selectedVital = vitals.find(v => v.id === selectedVitalId) || vitals[0];

  // Config for chart based on selected vital
  const getChartConfig = (id: string) => {
    switch(id) {
      case 'hr': return { key: 'hr', color: '#f43f5e', label: 'Heart Rate' };
      case 'bp': return { key: 'sys', color: '#3b82f6', label: 'Systolic BP' }; // Charting Systolic for simplicity
      case 'spo2': return { key: 'spo2', color: '#14b8a6', label: 'Oxygen %' };
      case 'temp': return { key: 'temp', color: '#f59e0b', label: 'Temperature' };
      default: return { key: 'hr', color: '#f43f5e', label: 'Value' };
    }
  };

  const chartConfig = getChartConfig(selectedVitalId);

  const handleLogSubmit = () => {
    if (!logForm.value) return;

    // 1. Update the Vitals Card
    const updatedVitals = vitals.map(v => {
      if (v.id === logForm.vitalId) {
        // Simple trend calculation
        const oldValue = parseFloat(v.value.split('/')[0]); // Handle BP 120/80 -> 120
        const newValue = parseFloat(logForm.value.split('/')[0]);
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (newValue > oldValue) trend = 'up';
        if (newValue < oldValue) trend = 'down';

        return { ...v, value: logForm.value, trend };
      }
      return v;
    });
    setVitals(updatedVitals);

    // 2. Update History Data (Append new point)
    // We clone the last entry to keep other values stable, then update the logged one
    const lastEntry = historyData[historyData.length - 1];
    const newEntry: any = { ...lastEntry, name: 'Now' }; // In a real app, use actual date
    
    // Parse value for chart
    if (logForm.vitalId === 'bp') {
      const parts = logForm.value.split('/');
      if (parts.length === 2) {
        newEntry.sys = parseInt(parts[0]);
        newEntry.dia = parseInt(parts[1]);
      } else {
        newEntry.sys = parseInt(parts[0]);
      }
    } else if (logForm.vitalId === 'hr') {
      newEntry.hr = parseFloat(logForm.value);
    } else if (logForm.vitalId === 'spo2') {
      newEntry.spo2 = parseFloat(logForm.value);
    } else if (logForm.vitalId === 'temp') {
      newEntry.temp = parseFloat(logForm.value);
    }

    setHistoryData([...historyData.slice(1), newEntry]); // Keep array size constant for demo
    
    // Reset and Close
    setIsModalOpen(false);
    setLogForm(prev => ({ ...prev, value: '' }));
    
    // Switch view to the updated metric
    setSelectedVitalId(logForm.vitalId);
  };

  // Determine Greeting Message
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: '🌅' };
    if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: '☀️' };
    if (hour >= 17 && hour < 22) return { text: 'Good Evening', icon: '🌇' };
    return { text: 'Good Night', icon: '🌙' };
  };
  
  const greeting = getGreeting();

  return (
    <div className="p-6 space-y-6 pb-24 md:pb-6 relative text-gray-900 dark:text-gray-100">
      
      {/* Greeting Popup */}
      {showGreeting && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-5 duration-700">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border border-teal-100 dark:border-teal-900 rounded-full px-6 py-3 flex items-center space-x-3 min-w-[280px]">
            <span className="text-3xl animate-bounce">{greeting.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-teal-800 dark:text-teal-400 text-base">{greeting.text}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back to MedAssist</p>
            </div>
            <button 
              onClick={() => setShowGreeting(false)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your vitals and view historical trends.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Weather Widget */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white px-5 py-2 rounded-xl shadow-md flex items-center min-w-[200px] justify-between sm:justify-start transition-all hover:shadow-lg">
            <div className="flex items-center">
              <div className="mr-3 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                {weather.condition.includes('Rain') || weather.condition.includes('Storm') ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                ) : weather.condition.includes('Cloud') || weather.condition.includes('Fog') ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </div>
              <div>
                {weather.loading ? (
                  <div className="h-5 w-16 bg-white/30 rounded animate-pulse mb-1"></div>
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <p className="font-bold text-xl leading-none">{weather.temp}°C</p>
                    <span className="text-xs text-blue-100 font-medium">{weather.condition}</span>
                  </div>
                )}
                <p className="text-xs text-blue-100 flex items-center mt-0.5">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {weather.loading ? 'Detecting...' : weather.location}
                </p>
              </div>
            </div>
          </div>

          {/* Time Widget */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-700 dark:to-indigo-800 text-white px-5 py-2 rounded-xl shadow-md flex items-center min-w-[160px] justify-between sm:justify-start transition-all hover:shadow-lg">
             <div className="mr-3 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
                <p className="font-bold text-xl leading-none">
                  {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <p className="text-xs text-indigo-100 font-medium mt-0.5">
                  {currentTime.toLocaleDateString([], {weekday: 'short', day: 'numeric', month: 'short'})}
                </p>
             </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 dark:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors flex items-center justify-center whitespace-nowrap"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Log Health Data
          </button>
        </div>
      </header>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((vital) => (
          <div 
            key={vital.id} 
            onClick={() => setSelectedVitalId(vital.id)}
            className={`p-4 rounded-2xl shadow-sm border transition-all cursor-pointer ${
              selectedVitalId === vital.id 
                ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 ring-1 ring-teal-500' 
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-700'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-medium ${selectedVitalId === vital.id ? 'text-teal-700 dark:text-teal-400' : 'text-gray-400 dark:text-gray-400'}`}>
                {vital.name}
              </span>
              <span className={`p-1 rounded-full ${vital.status === 'normal' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                {vital.status === 'normal' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-2xl font-bold ${vital.color}`}>{vital.value}</span>
              <span className="text-xs text-gray-400">{vital.unit}</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center">
              {vital.trend === 'up' && <span className="text-red-400 mr-1">↑</span>}
              {vital.trend === 'down' && <span className="text-green-400 mr-1">↓</span>}
              {vital.trend === 'stable' && <span className="text-gray-400 mr-1">→</span>}
              vs last reading
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedVital.name} History</h2>
          <select className="text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-lg px-3 py-1 text-gray-500 dark:text-gray-300 focus:ring-0">
            <option>Last 7 Days</option>
            <option>Last Month</option>
          </select>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:opacity-20" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tw-bg-opacity, 1) rgba(255, 255, 255, var(--tw-bg-opacity, 1))' }}
                itemStyle={{ color: '#374151' }}
              />
              <Area 
                type="monotone" 
                dataKey={chartConfig.key}
                name={chartConfig.label}
                stroke={chartConfig.color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMetric)" 
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations & Appointments Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        
        {/* Daily Goal */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-800 rounded-2xl p-6 text-white">
          <h3 className="font-semibold mb-2">Daily Goal</h3>
          <p className="text-teal-100 text-sm mb-4">You're doing great! Try to walk another 2,000 steps to reach your daily activity goal.</p>
          <div className="w-full bg-teal-800/30 rounded-full h-2">
            <div className="bg-white rounded-full h-2 w-[70%]"></div>
          </div>
        </div>

        {/* Sleep Insight */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-2xl p-6 text-white">
          <h3 className="font-semibold mb-2">Sleep Insight</h3>
          <p className="text-indigo-100 text-sm mb-4">Your average sleep duration increased by 45 minutes this week. Keep it up!</p>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">7h 12m</span>
            <span className="text-indigo-200 text-xs">Avg / night</span>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Appointments</h3>
            <button 
              onClick={() => onNavigate && onNavigate(AppView.DOCTOR_FINDER)}
              className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wide hover:text-teal-700 hover:underline"
            >
              Book New
            </button>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[120px] pr-1">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="flex items-start space-x-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                  <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{apt.title.replace('Appt: ', '')}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{apt.details}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded shadow-sm">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 text-gray-300 dark:text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No upcoming visits.</p>
              <button 
                onClick={() => onNavigate && onNavigate(AppView.DOCTOR_FINDER)}
                className="w-full py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors"
              >
                Find a Doctor
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Log Data Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Log New Reading</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metric</label>
                <select 
                  value={logForm.vitalId}
                  onChange={(e) => setLogForm({...logForm, vitalId: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white"
                >
                  {vitals.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value <span className="text-gray-400 font-normal">({vitals.find(v => v.id === logForm.vitalId)?.unit})</span>
                </label>
                <input 
                  type="text" 
                  value={logForm.value}
                  onChange={(e) => setLogForm({...logForm, value: e.target.value})}
                  placeholder={logForm.vitalId === 'bp' ? '120/80' : 'e.g. 75'}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleLogSubmit}
                  disabled={!logForm.value}
                  className={`w-full py-3 rounded-xl font-medium shadow-sm transition-all ${
                    !logForm.value 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  Save Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;