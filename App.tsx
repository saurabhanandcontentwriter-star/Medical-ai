
import React, { useState, useEffect } from 'react';
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
import { AppView, AppNotification, Message, Sender, OrderItem, UserProfile } from './types';

function App() {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  // Theme State
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
  
  // Centralized State for Notifications and Chat
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'init',
      text: "Hi! I'm your MedAssist helper. Need help finding a doctor or checking a quick symptom?",
      sender: Sender.BOT,
      timestamp: new Date()
    }
  ]);

  // Initial dummy data for orders/tracking
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: '1001',
      type: 'medicine',
      title: 'Monthly Meds',
      details: 'Metformin 500mg, Atorvastatin 10mg',
      amount: 450,
      date: new Date(Date.now() - 86400000 * 2), // 2 days ago
      status: 'Out for Delivery',
      deliveryAgent: {
        name: 'Ravi Kumar',
        phone: '+91 99887 76655'
      },
      invoiceUrl: '#invoice-1001',
      steps: [
        { label: 'Order Placed', timestamp: 'Oct 24, 10:00 AM', isCompleted: true },
        { label: 'Confirmed', timestamp: 'Oct 24, 10:30 AM', isCompleted: true },
        { label: 'Shipped', timestamp: 'Oct 25, 09:00 AM', isCompleted: true },
        { label: 'Out for Delivery', timestamp: 'Today, 08:30 AM', isCompleted: true },
        { label: 'Delivered', isCompleted: false },
      ]
    },
    {
      id: '2005',
      type: 'lab_test',
      title: 'Thyroid Profile',
      details: 'Home Sample Collection',
      amount: 499,
      date: new Date(Date.now() - 86400000 * 5),
      status: 'Completed',
      deliveryAgent: {
        name: 'Dr. Anita Singh',
        phone: '+91 98765 12345'
      },
      invoiceUrl: '#invoice-2005',
      reportUrl: '#report-2005',
      steps: [
        { label: 'Booked', timestamp: 'Oct 20, 02:00 PM', isCompleted: true },
        { label: 'Confirmed', timestamp: 'Oct 20, 02:15 PM', isCompleted: true },
        { label: 'Sample Collected', timestamp: 'Oct 21, 08:00 AM', isCompleted: true },
        { label: 'Analyzing', timestamp: 'Oct 21, 12:00 PM', isCompleted: true },
        { label: 'Report Ready', timestamp: 'Oct 22, 10:00 AM', isCompleted: true },
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

  const addChatMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.BOT,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(AppView.DASHBOARD);
  };

  // Handlers for Order/Booking completion
  const handleMedicineOrderComplete = (itemNames: string[], amount: number) => {
    const itemList = itemNames.join(', ');
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date();

    const newOrder: OrderItem = {
      id: orderId,
      type: 'medicine',
      title: 'Medicine Order',
      details: itemList.length > 30 ? itemList.substring(0, 30) + '...' : itemList,
      amount: amount,
      date: now,
      status: 'Placed',
      deliveryAgent: {
        name: 'Vikram Singh',
        phone: '+91 98765 00000'
      },
      invoiceUrl: `#invoice-${orderId}`,
      steps: [
        { label: 'Order Placed', timestamp: 'Just now', isCompleted: true },
        { label: 'Confirmed', timestamp: 'Processing...', isCompleted: true },
        { label: 'Shipped', isCompleted: false },
        { label: 'Out for Delivery', isCompleted: false },
        { label: 'Delivered', isCompleted: false },
      ]
    };
    setOrders(prev => [newOrder, ...prev]);
    addChatMessage(`Your medicine order #${orderId} for ₹${amount} has been placed! You can track it in the 'Track Orders' section.`);
    addNotification('Order Confirmed', `Order #${orderId} containing: ${itemList}. Total: ₹${amount}`, 'order');
  };

  const handleLabTestBookingComplete = (testName: string, date: string, amount: number) => {
    const orderId = Math.floor(5000 + Math.random() * 5000).toString();
    const now = new Date();

    const newOrder: OrderItem = {
      id: orderId,
      type: 'lab_test',
      title: testName,
      details: `Scheduled: ${date}`,
      amount: amount,
      date: now,
      status: 'Booked',
      deliveryAgent: {
        name: 'Suresh Tech',
        phone: '+91 99881 23456'
      },
      invoiceUrl: `#invoice-${orderId}`,
      steps: [
        { label: 'Booked', timestamp: 'Just now', isCompleted: true },
        { label: 'Confirmed', timestamp: 'Processing...', isCompleted: true },
        { label: 'Sample Collected', isCompleted: false },
        { label: 'Analyzing', isCompleted: false },
        { label: 'Report Ready', isCompleted: false },
      ]
    };
    setOrders(prev => [newOrder, ...prev]);
    addChatMessage(`Your appointment for ${testName} is confirmed for ${date}. Booking ID: #${orderId}.`);
    addNotification('Booking Confirmed', `Lab Test Booking #${orderId} for ${testName}. Date: ${date}.`, 'order');
  };

  const handleDoctorAppointment = (doctorName: string, date: string, time: string, amount: number) => {
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date();

    const newOrder: OrderItem = {
      id: orderId,
      type: 'doctor_appointment',
      title: `Appt: ${doctorName}`,
      details: `Scheduled: ${date} at ${time}`,
      amount: amount,
      date: now,
      status: 'Confirmed',
      deliveryAgent: {
         name: 'Clinic Staff',
         phone: '+91 98765 43210'
      },
      invoiceUrl: `#invoice-${orderId}`,
      steps: [
        { label: 'Booked', timestamp: 'Just now', isCompleted: true },
        { label: 'Confirmed', timestamp: 'Just now', isCompleted: true },
        { label: 'Reminder Sent', isCompleted: false },
        { label: 'Visit Completed', isCompleted: false },
      ]
    };
    setOrders(prev => [newOrder, ...prev]);
    addChatMessage(`Appointment confirmed with ${doctorName} on ${date} at ${time}.`);
    addNotification('Appointment Booked', `Doctor: ${doctorName}, Date: ${date}`, 'order');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-200 text-gray-900 dark:text-gray-100">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl transition-colors">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Medical Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              MedAssist AI is a demonstration tool. The information provided by this application is for educational purposes only and 
              <strong className="text-gray-900 dark:text-white"> does not constitute professional medical advice, diagnosis, or treatment.</strong>
              <br/><br/>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">If you think you may have a medical emergency, call your doctor or emergency services immediately.</span>
            </p>
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-[60]">
        <button 
          onClick={() => {
            setIsNotificationOpen(!isNotificationOpen);
            if (!isNotificationOpen) markAllRead();
          }}
          className="relative p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isNotificationOpen && (
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{notifications.length} Total</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${notif.read ? 'opacity-70' : 'bg-blue-50/30 dark:bg-blue-900/20'}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'order' ? 'bg-green-500' : 'bg-teal-500'}`}></div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{notif.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2">{notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden h-screen overflow-y-auto relative">
        {currentView === AppView.DASHBOARD && <Dashboard orders={orders} onNavigate={setCurrentView} />}
        {currentView === AppView.CHAT && <SymptomChat />}
        {currentView === AppView.ANALYZER && <ReportAnalyzer />}
        {currentView === AppView.DOCTOR_FINDER && <DoctorFinder onBookAppointment={handleDoctorAppointment} />}
        {currentView === AppView.ORDER_MEDICINE && (
          <MedicineOrder onOrderComplete={handleMedicineOrderComplete} />
        )}
        {currentView === AppView.BOOK_TEST && (
          <LabTestBooking onBookingComplete={handleLabTestBookingComplete} />
        )}
        {currentView === AppView.HEALTH_NEWS && <HealthNews />}
        {currentView === AppView.HEALTH_TIPS && <HealthTips />}
        {currentView === AppView.YOGA && <YogaSessions />}
        {currentView === AppView.TRACKING && <OrderTracking orders={orders} />}
        {currentView === AppView.PROFILE && <Profile user={user} />}
        {currentView === AppView.ADMIN && <AdminPanel />}

        {/* Floating Chatbot */}
        {currentView !== AppView.CHAT && (
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
