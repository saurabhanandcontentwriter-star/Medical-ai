
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VitalSign, OrderItem, AppView, MedicationReminder } from '../types';

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
  reminders?: MedicationReminder[];
  onUpdateReminders?: (reminders: MedicationReminder[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders = [], onNavigate = (view: AppView) => {}, reminders = [], onUpdateReminders }) => {
  const [vitals, setVitals] = useState<VitalSign[]>(initialVitals);
  const [historyData, setHistoryData] = useState(initialHistoryData);
  const [selectedVitalId, setSelectedVitalId] = useState<string>('hr');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // SOS State
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosAlertSent, setSosAlertSent] = useState(false);
  const sosTimerRef = useRef<number | null>(null);

  // Greeting State
  const [showGreeting, setShowGreeting] = useState(true);

  // Prescription Logic
  const todayTaken = reminders.filter(r => r.isTakenToday).length;
  const totalMeds = reminders.length;
  const adherencePercent = totalMeds > 0 ? Math.round((todayTaken / totalMeds) * 100) : 0;
  
  const nextMed = reminders
    .filter(r => !r.isTakenToday)
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // SOS Countdown logic
  useEffect(() => {
    if (isSosModalOpen && sosCountdown > 0 && !sosAlertSent) {
      sosTimerRef.current = window.setTimeout(() => {
        setSosCountdown(prev => prev - 1);
      }, 1000);
    } else if (isSosModalOpen && sosCountdown === 0 && !sosAlertSent) {
      setSosAlertSent(true);
    }
    return () => {
      if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
    };
  }, [isSosModalOpen, sosCountdown, sosAlertSent]);

  const handleSosTrigger = () => {
    setIsSosModalOpen(true);
    setSosCountdown(5);
    setSosAlertSent(false);
  };

  const cancelSos = () => {
    setIsSosModalOpen(false);
    if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 4000);
    return () => clearTimeout(timer);
  }, []);
  
  const upcomingAppointments = orders
    .filter(o => o.type === 'doctor_appointment' && ['Confirmed', 'Scheduled'].includes(o.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Weather State
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    location: string;
    loading: boolean;
  }>({ temp: 0, condition: '', location: 'Detecting...', loading: true });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          const locationRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const locationData = await locationRes.json();
          const city = locationData.address.city || locationData.address.town || locationData.address.village || locationData.address.county || "Unknown";
          const code = weatherData.current_weather.weathercode;
          let cond = "Sunny";
          if (code >= 1 && code <= 3) cond = "Partly Cloudy";
          else if (code >= 45 && code <= 48) cond = "Foggy";
          else if (code >= 51 && code <= 67) cond = "Rainy";
          setWeather({ temp: weatherData.current_weather.temperature, condition: cond, location: city, loading: false });
        } catch (error) {
          setWeather({ temp: 28, condition: 'Sunny', location: 'Patna', loading: false });
        }
      }, () => setWeather({ temp: 28, condition: 'Sunny', location: 'Patna', loading: false }));
    }
  }, []);
  
  const [logForm, setLogForm] = useState({ vitalId: 'hr', value: '', date: 'Mon' });
  const selectedVital = vitals.find(v => v.id === selectedVitalId) || vitals[0];

  const getChartConfig = (id: string) => {
    switch(id) {
      case 'hr': return { key: 'hr', color: '#f43f5e', label: 'Heart Rate' };
      case 'bp': return { key: 'sys', color: '#3b82f6', label: 'Systolic BP' };
      case 'spo2': return { key: 'spo2', color: '#14b8a6', label: 'Oxygen %' };
      case 'temp': return { key: 'temp', color: '#f59e0b', label: 'Temperature' };
      default: return { key: 'hr', color: '#f43f5e', label: 'Value' };
    }
  };

  const chartConfig = getChartConfig(selectedVitalId);

  const handleLogSubmit = () => {
    if (!logForm.value) return;
    const updatedVitals = vitals.map(v => {
      if (v.id === logForm.vitalId) {
        const newValue = parseFloat(logForm.value);
        // Fix: Use a type assertion to prevent 'trend' from being widened to 'string', 
        // ensuring compatibility with the VitalSign['trend'] union type.
        return { ...v, value: logForm.value, trend: (newValue > parseFloat(v.value) ? 'up' : 'down') as 'up' | 'down' | 'stable' };
      }
      return v;
    });
    setVitals(updatedVitals);
    setIsModalOpen(false);
  };

  const greeting = (() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: '🌅' };
    if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: '☀️' };
    if (hour >= 17 && hour < 22) return { text: 'Good Evening', icon: '🌇' };
    return { text: 'Good Night', icon: '🌙' };
  })();

  const markMedTaken = (id: string) => {
    if (!onUpdateReminders) return;
    const today = new Date().toDateString();
    const updated = reminders.map(r => r.id === id ? { ...r, isTakenToday: true, lastTakenDate: today } : r);
    onUpdateReminders(updated);
  };

  return (
    <div className="p-6 space-y-6 pb-24 md:pb-6 relative text-gray-900 dark:text-gray-100">
      
      {showGreeting && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-5 duration-700">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border border-teal-100 dark:border-teal-900 rounded-full px-6 py-3 flex items-center space-x-3 min-w-[280px]">
            <span className="text-3xl animate-bounce">{greeting.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-teal-800 dark:text-teal-400 text-base">{greeting.text}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back to MedAssist</p>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Overview</h1>
            <p className="text-gray-500 dark:text-gray-400">Track your vitals and daily prescriptions.</p>
          </div>
          <button onClick={handleSosTrigger} className="flex items-center justify-center p-3 bg-red-600 text-white rounded-full shadow-lg animate-pulse hover:scale-110 active:scale-95 z-40">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            <span className="hidden md:block ml-2 font-bold text-xs">SOS</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white px-5 py-2 rounded-xl shadow-md flex items-center min-w-[200px] justify-between transition-all hover:shadow-lg">
            <div className="flex items-center">
              <div className="mr-3 bg-white/20 p-2 rounded-full backdrop-blur-sm">☀️</div>
              <div>
                <p className="font-bold text-xl leading-none">{weather.temp}°C</p>
                <p className="text-[10px] text-blue-100 uppercase font-black">{weather.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-700 dark:to-indigo-800 text-white px-5 py-2 rounded-xl shadow-md flex items-center min-w-[160px] justify-between transition-all hover:shadow-lg">
             <div className="mr-3 bg-white/20 p-2 rounded-full backdrop-blur-sm">🕒</div>
             <div>
                <p className="font-bold text-xl leading-none">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-[10px] text-indigo-100 uppercase font-black">{currentTime.toLocaleDateString([], {weekday: 'short'})}</p>
             </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 transition-colors flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Log Vitals
          </button>
        </div>
      </header>

      {isSosModalOpen && (
        <div className="fixed inset-0 z-[100] bg-red-900/40 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 border-4 border-red-500 overflow-hidden text-center">
             <div className="w-32 h-32 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 text-6xl font-black mx-auto mb-6">
                {!sosAlertSent ? sosCountdown : '✓'}
             </div>
             <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
               {!sosAlertSent ? 'Emergency Alert' : 'Help is Coming'}
             </h2>
             <button onClick={cancelSos} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg">
               {!sosAlertSent ? 'STOP ALERT' : 'CLOSE'}
             </button>
          </div>
        </div>
      )}

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((vital) => (
          <div key={vital.id} onClick={() => setSelectedVitalId(vital.id)} className={`p-4 rounded-2xl shadow-sm border transition-all cursor-pointer ${selectedVitalId === vital.id ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 ring-1 ring-teal-500' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-400">{vital.name}</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-2xl font-bold ${vital.color}`}>{vital.value}</span>
              <span className="text-xs text-gray-400">{vital.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedVital.name} History</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs><linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.2}/><stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:opacity-20" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey={chartConfig.key} stroke={chartConfig.color} strokeWidth={3} fill="url(#colorMetric)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prescription Adherence Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Daily Adherence</h3>
              <button onClick={() => onNavigate(AppView.MED_REMINDERS)} className="text-teal-600 text-xs font-bold uppercase tracking-widest hover:underline">Manage</button>
           </div>
           
           <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * adherencePercent) / 100} className="text-teal-500" />
                 </svg>
                 <span className="absolute font-black text-xl text-teal-600">{adherencePercent}%</span>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Prescriptions</p>
                 <p className="text-2xl font-black text-gray-900 dark:text-white">{todayTaken} / {totalMeds}</p>
                 <p className="text-xs text-gray-500">Doses taken today</p>
              </div>
           </div>

           <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">Up Next</p>
              {nextMed ? (
                <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                   <div className="flex items-center space-x-3">
                      <span className="text-xl">💊</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{nextMed.name}</p>
                        <p className="text-[10px] text-teal-600 font-bold">{nextMed.time} • {nextMed.dosage}</p>
                      </div>
                   </div>
                   <button onClick={() => markMedTaken(nextMed.id)} className="px-3 py-1.5 bg-teal-600 text-white text-[10px] font-bold rounded-lg hover:bg-teal-700 transition-colors">DONE</button>
                </div>
              ) : (
                <div className="text-center py-2">
                   <p className="text-xs text-gray-400 italic">No more doses for today!</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-800 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="font-bold mb-2">Healthy Tip</h3>
          <p className="text-teal-100 text-sm">Drinking 2L of water today helps with vitamin absorption.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Appointments</h3>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between">
                  <span className="font-bold">{apt.title}</span>
                  <span className="text-teal-600">{apt.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No upcoming visits.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Track Activity</h3>
          <div className="h-2 w-full bg-gray-100 rounded-full mt-4"><div className="h-2 bg-teal-500 rounded-full w-[65%]"></div></div>
          <p className="text-[10px] text-gray-400 uppercase mt-2 font-black">6,500 / 10,000 Steps</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-sm p-8">
            <h3 className="text-xl font-bold mb-6">Log Reading</h3>
            <div className="space-y-4">
              <select value={logForm.vitalId} onChange={e => setLogForm({...logForm, vitalId: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold">
                {vitals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <input type="text" value={logForm.value} onChange={e => setLogForm({...logForm, value: e.target.value})} placeholder="Enter Value" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold" />
              <button onClick={handleLogSubmit} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black">SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
