
import React, { useState } from 'react';
import { AppView, SUPPORTED_LANGUAGES, Language } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onAdminRequest: () => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  setView, 
  onLogout, 
  isDarkMode, 
  toggleDarkMode, 
  onAdminRequest,
  selectedLanguage,
  onLanguageChange
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-1-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { id: AppView.MEALS, label: 'Nutrition', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    )},
    { id: AppView.AMBULANCE, label: 'SOS Ambulance', icon: (
      <svg className="w-5 h-5 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    )},
    { id: AppView.ANALYZER, label: 'Report Analyzer', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
    { id: AppView.CHAT, label: 'Symptom Chat', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    )},
    { id: AppView.DOCTOR_FINDER, label: 'Find Doctors', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
    { id: AppView.ORDER_MEDICINE, label: 'Pharmacy', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    )},
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:relative md:w-64 md:h-screen md:border-r md:border-t-0 z-50 overflow-y-auto scrollbar-hide flex flex-col justify-between transition-colors duration-200 text-gray-900 dark:text-gray-100 shadow-2xl md:shadow-none">
      <div className="flex md:flex-col justify-around md:justify-start md:h-full md:p-4">
        <div className="hidden md:flex items-center space-x-2 mb-8 px-4 py-2 bg-teal-50 dark:bg-teal-900/10 rounded-2xl">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-teal-200">M</div>
          <span className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">MedAssist</span>
        </div>
        
        <div className="flex md:flex-col justify-around md:space-y-1 w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col md:flex-row items-center md:space-x-3 p-3 md:px-4 md:py-3.5 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                currentView === item.id
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-700/50 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-teal-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              {item.icon}
              <span className="text-[10px] md:text-sm font-black uppercase tracking-widest mt-1 md:mt-0 whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="hidden md:flex flex-col gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="relative">
           <button 
             onClick={() => setShowLangMenu(!showLangMenu)}
             className="flex items-center justify-between w-full p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all hover:border-teal-500 group"
           >
             <div className="flex items-center gap-3">
               <span className="text-lg">🌏</span>
               <div className="text-left">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Language</p>
                 <p className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase">{selectedLanguage.native}</p>
               </div>
             </div>
             <svg className={`w-4 h-4 text-gray-300 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
           </button>
           
           {showLangMenu && (
             <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2">
                <div className="max-h-48 overflow-y-auto scrollbar-hide py-2">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { onLanguageChange(lang); setShowLangMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest transition-colors ${selectedLanguage.code === lang.code ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/30' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {lang.native} <span className="text-[10px] text-gray-300 ml-1">{lang.name}</span>
                    </button>
                  ))}
                </div>
             </div>
           )}
        </div>

        <button 
          onClick={onAdminRequest}
          className={`flex items-center space-x-3 w-full p-3.5 rounded-2xl transition-all ${currentView === AppView.ADMIN ? 'bg-[#0d645f] text-white' : 'text-gray-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:text-teal-600'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <span className="text-xs font-black uppercase tracking-widest">Admin Portal</span>
        </button>

        <button 
          onClick={toggleDarkMode}
          className="flex items-center justify-between w-full p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <span className="text-lg">☀️</span> : <span className="text-lg">🌙</span>}
            <span className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">{isDarkMode ? 'Light' : 'Dark'} Mode</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-teal-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
          </div>
        </button>

        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 w-full p-3.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
