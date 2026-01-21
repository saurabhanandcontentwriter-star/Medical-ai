
import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import SymptomChat from './components/SymptomChat';
import ReportAnalyzer from './components/ReportAnalyzer';
import DoctorFinder from './components/DoctorFinder';
import MedicineOrder from './components/MedicineOrder';
import LabTestBooking from './components/LabTestBooking';
import HealthNews from './components/HealthNews';
import HealthTips from './components/HealthTips';
import YogaSessions from './components/YogaSessions';
import Profile from './components/Profile';
import OrderTracking from './components/OrderTracking';
import AdminPanel from './components/AdminPanel';
import FloatingChatbot from './components/FloatingChatbot';
import Login from './components/Login';
import MedicationReminders from './components/MedicationReminders';
import VideoConsultation from './components/VideoConsultation';
import HealthBlog from './components/HealthBlog';
import WelcomeModal from './components/WelcomeModal';
import { AppView, AppNotification, Message, Sender, OrderItem, UserProfile, MedicationReminder } from './types';

function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('medassist_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showWelcome, setShowWelcome] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(() => {
    const saved = localStorage.getItem('medassist_total_time');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setTotalTimeSpent(prev => {
        const next = prev + 10;
        localStorage.setItem('medassist_total_time', next.toString());
        return next;
      });
    }, 10000); 
    return () => clearInterval(interval);
  }, [user]);

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Shared chatbot message state
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'init',
      text: "Hi! I'm your MedAssist helper. Need help finding a doctor or checking a quick symptom?",
      sender: Sender.BOT,
      timestamp: new Date()
    }
  ]);

  const addChatBotMessage = (text: string) => {
    const newMsg: Message = {
      id: `system-${Date.now()}`,
      text: text,
      sender: Sender.BOT,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const [reminders, setReminders] = useState<MedicationReminder[]>(() => {
    const saved = localStorage.getItem('medassist_reminders');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      return parsed.map((r: MedicationReminder) => ({
        ...r,
        isTakenToday: r.lastTakenDate === today ? r.isTakenToday : false
      }));
    }
    return [];
  });

  const [dueMedication, setDueMedication] = useState<MedicationReminder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!user || reminders.length === 0) return;
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); 
      const today = now.toDateString();
      const due = reminders.find(r => 
        r.time === currentTime && 
        !r.isTakenToday && 
        r.lastTakenDate !== today
      );
      if (due && (!dueMedication || dueMedication.id !== due.id)) {
        setDueMedication(due);
        playNotificationSound();
        addNotification('Medication Due', `It's time to take your ${due.name} (${due.dosage}).`, 'alert');
      }
    };
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [user, reminders, dueMedication]);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const handleTakeDueMed = () => {
    if (!dueMedication) return;
    const today = new Date().toDateString();
    const updated = reminders.map(r => 
      r.id === dueMedication.id ? { ...r, isTakenToday: true, lastTakenDate: today } : r
    );
    setReminders(updated);
    setDueMedication(null);
  };

  useEffect(() => {
    localStorage.setItem('medassist_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleUpdateReminder = (updatedReminders: MedicationReminder[]) => {
    setReminders(updatedReminders);
  };

  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: '1001',
      type: 'medicine',
      title: 'Monthly Meds',
      details: 'Metformin 500mg, Atorvastatin 10mg',
      amount: 450,
      date: new Date(Date.now() - 86400000 * 2), 
      status: 'Out for Delivery',
      steps: [
        { label: 'Order Placed', timestamp: 'Oct 24, 10:00 AM', isCompleted: true },
        { label: 'Confirmed', timestamp: 'Oct 24, 10:30 AM', isCompleted: true },
        { label: 'Shipped', timestamp: 'Oct 25, 09:00 AM', isCompleted: true },
        { label: 'Out for Delivery', timestamp: 'Today, 08:30 AM', isCompleted: true },
        { label: 'Delivered', isCompleted: false },
      ]
    }
  ]);

  const addNotification = (title: string, message: string, type: 'order' | 'info' | 'alert' = 'info') => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('medassist_user', JSON.stringify(newUser));
    setShowWelcome(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('medassist_user');
    setCurrentView(AppView.DASHBOARD);
  };

  const handleDoctorAppointment = (doctorName: string, date: string, time: string, amount: number) => {
    const newOrder: OrderItem = {
      id: `APT-${Date.now()}`,
      type: 'doctor_appointment',
      title: `Appointment: ${doctorName}`,
      details: `Scheduled for ${date} at ${time}`,
      amount,
      date: new Date(date),
      status: 'Confirmed',
      steps: [
        { label: 'Booked', timestamp: new Date().toLocaleString(), isCompleted: true },
        { label: 'Confirmed', timestamp: new Date().toLocaleString(), isCompleted: true },
        { label: 'Visit Pending', isCompleted: false },
      ]
    };
    setOrders(prev => [newOrder, ...prev]);
    addNotification('Appointment Confirmed', `Your visit to ${doctorName} is set for ${date} at ${time}.`, 'order');
    addChatBotMessage(`📅 Appointment confirmed with ${doctorName} for ${date} at ${time}. A confirmation email has been sent to your registered address.`);
    setCurrentView(AppView.TRACKING);
  };

  const handleMedicineOrderComplete = (itemNames: string[], amount: number) => {
    const newOrder: OrderItem = {
      id: `ORD-${Date.now()}`,
      type: 'medicine',
      title: 'Pharmacy Order',
      details: itemNames.join(', '),
      amount,
      date: new Date(),
      status: 'Order Placed',
      steps: [
        { label: 'Order Placed', timestamp: new Date().toLocaleString(), isCompleted: true },
        { label: 'Confirmed', isCompleted: false },
        { label: 'Shipped', isCompleted: false },
        { label: 'Delivered', isCompleted: false },
      ]
    };
    setOrders(prev => [newOrder, ...prev]);
    addNotification('Medicine Order Placed', `We have received your order for ${itemNames.length} items.`, 'order');
    addChatBotMessage(`🛒 Order placed successfully! Your health items (${itemNames.join(', ')}) will be delivered soon. Receipt sent to your email.`);
    setCurrentView(AppView.TRACKING);
  };

  const handleLabTestBookingComplete = (testName: string, date: string, amount: number) => {
    const newOrder: OrderItem = {
      id: `LAB-${Date.now()}`,
      type: 'lab_test',
      title: testName,
      details: 'Home Sample Collection',
      amount,
      date: new Date(date),
      status: 'Booked',
      steps: [
        { label: 'Booked', timestamp: new Date().toLocaleString(), isCompleted: true },
        { label: 'Confirmed', isCompleted: false },
        { label: 'Sample Collected', isCompleted: false },
        { label: 'Analyzing', isCompleted: false },
        { label: 'Report Ready', isCompleted: false },
      ]
    };
    setOrders(prev => [newOrder, ...prev]);
    addNotification('Lab Test Scheduled', `Your ${testName} is scheduled for collection on ${date}.`, 'order');
    addChatBotMessage(`🔬 Lab test "${testName}" booked for ${date}. Our technician will contact you for home collection. Check your email for the detailed instructions.`);
    setCurrentView(AppView.TRACKING);
  };

  const handlePinClick = (digit: string) => {
    if (adminPin.length >= 4) return;
    const newPin = adminPin + digit;
    setAdminPin(newPin);
    if (newPin.length === 4) {
      if (newPin === '1234') { 
        setIsAdminAuthOpen(false);
        setCurrentView(AppView.ADMIN);
        setAdminPin('');
      } else {
        setPinError(true);
        setTimeout(() => { setAdminPin(''); setPinError(false); }, 1000);
      }
    }
  };

  const handlePinClear = () => setAdminPin('');
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-200 text-gray-900 dark:text-gray-100">
      {showWelcome && (
        <WelcomeModal 
          userName={user.name.split(' ')[0]} 
          onClose={() => setShowWelcome(false)} 
        />
      )}

      {dueMedication && (
        <div className="fixed inset-0 z-[1000] bg-teal-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-500 border border-teal-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-teal-500 animate-pulse"></div>
            <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-8 relative">
               <span className="text-5xl animate-bounce">💊</span>
               <div className="absolute inset-0 border-4 border-teal-500 rounded-full animate-ping opacity-25"></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Prescription Due</h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">Scheduled at {dueMedication.time}</p>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 mb-10">
               <h3 className="text-xl font-black text-teal-600 dark:text-teal-400 uppercase tracking-tighter">{dueMedication.name}</h3>
               <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mt-1">{dueMedication.dosage}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleTakeDueMed} className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl hover:bg-teal-700 transition-all transform active:scale-95">Mark as Taken</button>
              <button onClick={() => setDueMedication(null)} className="w-full py-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-black uppercase text-[10px] tracking-widest transition-colors">Snooze for 5 Mins</button>
            </div>
          </div>
        </div>
      )}

      {isAdminAuthOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-sm p-10 shadow-2xl transition-transform duration-300 ${pinError ? 'animate-bounce' : ''}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Admin Entry</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Authorized Personnel Only</p>
            </div>
            <div className="flex justify-center gap-4 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${adminPin.length >= i ? 'bg-teal-600 scale-125' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'X'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') handlePinClear();
                    else if (key === 'X') setIsAdminAuthOpen(false);
                    else handlePinClick(key);
                  }}
                  className={`h-16 rounded-2xl font-black text-xl flex items-center justify-center transition-all active:scale-95 ${
                    key === 'X' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 
                    key === 'C' ? 'bg-gray-50 text-gray-400 dark:bg-gray-700' : 
                    'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600'
                  }`}
                >
                  {key === 'X' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg> : key}
                </button>
              ))}
            </div>
            {pinError && <p className="text-center mt-6 text-rose-500 font-bold text-xs uppercase tracking-widest animate-pulse">Incorrect Access Key</p>}
          </div>
        </div>
      )}

      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl transition-colors">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Medical Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">MedAssist AI is a demonstration tool. The information provided does not constitute medical advice.</p>
            <button onClick={() => setShowDisclaimer(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors">I Understand & Agree</button>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-[60] flex items-center gap-3">
        <div className="relative">
          <button onClick={() => { setIsNotificationOpen(!isNotificationOpen); if (!isNotificationOpen) markAllRead(); }} className="p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-md hover:bg-gray-50 border border-gray-100 dark:border-gray-700 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">{unreadCount}</span>}
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                <span className="text-xs text-gray-500">{notifications.length} Total</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">No notifications yet.</div> : notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 transition-colors ${notif.read ? 'opacity-70' : 'bg-blue-50/30'}`}>
                      <div className="flex gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'order' ? 'bg-green-500' : 'bg-teal-500'}`}></div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{notif.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Navigation currentView={currentView} setView={setCurrentView} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onAdminRequest={() => setIsAdminAuthOpen(true)} />

      <main className="flex-1 overflow-hidden h-screen overflow-y-auto relative flex flex-col">
        <div className="flex-1">
          {currentView === AppView.DASHBOARD && <Dashboard orders={orders} onNavigate={setCurrentView} reminders={reminders} onUpdateReminders={handleUpdateReminder} />}
          {currentView === AppView.MED_REMINDERS && <MedicationReminders reminders={reminders} onUpdateReminders={handleUpdateReminder} />}
          {currentView === AppView.VIDEO_CONSULT && <VideoConsultation />}
          {currentView === AppView.CHAT && <SymptomChat chatMessages={chatMessages} setChatMessages={setChatMessages} />}
          {currentView === AppView.ANALYZER && <ReportAnalyzer />}
          {currentView === AppView.DOCTOR_FINDER && <DoctorFinder onBookAppointment={handleDoctorAppointment} />}
          {currentView === AppView.ORDER_MEDICINE && <MedicineOrder onOrderComplete={handleMedicineOrderComplete} />}
          {currentView === AppView.BOOK_TEST && <LabTestBooking onBookingComplete={handleLabTestBookingComplete} />}
          {currentView === AppView.HEALTH_NEWS && <HealthNews />}
          {currentView === AppView.BLOG && <HealthBlog />}
          {currentView === AppView.HEALTH_TIPS && <HealthTips />}
          {currentView === AppView.YOGA && <YogaSessions />}
          {currentView === AppView.TRACKING && <OrderTracking orders={orders} />}
          {currentView === AppView.PROFILE && <Profile user={{...user!, totalTimeSpent}} />}
          {currentView === AppView.ADMIN && <AdminPanel />}
        </div>
        <footer className="p-6 mt-auto border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">© 2024 MedAssist AI. For educational purposes only.</p>
        </footer>
        {currentView !== AppView.CHAT && currentView !== AppView.VIDEO_CONSULT && (
          <FloatingChatbot 
            messages={chatMessages} 
            setMessages={setChatMessages} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
