
import React, { useState, useEffect } from 'react';

interface AmbulanceBookingProps {
  onBookingComplete: (type: string) => void;
}

const AmbulanceBooking: React.FC<AmbulanceBookingProps> = ({ onBookingComplete }) => {
  const [step, setStep] = useState<'select' | 'dispatching' | 'success'>('select');
  const [selectedType, setSelectedType] = useState('Basic Life Support');
  const [eta, setEta] = useState(0);

  const ambulanceTypes = [
    { name: 'Basic Life Support', desc: 'For stable patients requiring medical monitoring.', icon: '🚑', features: ['Oxygen', 'First Aid', 'Patient Bed'] },
    { name: 'Advance Life Support (ICU)', desc: 'For critical patients requiring ventilator support.', icon: '🚐', features: ['Ventilator', 'Defibrillator', 'Paramedic'] },
    { name: 'Cardiac Ambulance', desc: 'Specially equipped for heart-related emergencies.', icon: '🚨', features: ['ECG Monitor', 'Advanced Cardiac Care', 'Doctor on board'] }
  ];

  const handleBook = () => {
    setStep('dispatching');
    setEta(Math.floor(Math.random() * 10) + 5); // 5-15 mins
    setTimeout(() => {
      setStep('success');
      onBookingComplete(selectedType);
    }, 3000);
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full h-full flex flex-col">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-rose-600 dark:text-rose-500 uppercase tracking-tighter">Emergency Dispatch</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Zero-cost ambulance booking for your location.</p>
      </header>

      {step === 'select' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid md:grid-cols-3 gap-6">
              {ambulanceTypes.map(type => (
                <button 
                  key={type.name} 
                  onClick={() => setSelectedType(type.name)}
                  className={`p-8 rounded-[2.5rem] border-4 transition-all text-left flex flex-col h-full group ${selectedType === type.name ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 shadow-xl' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-rose-200'}`}
                >
                  <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{type.icon}</span>
                  <h3 className={`text-xl font-black uppercase tracking-tighter leading-tight mb-2 ${selectedType === type.name ? 'text-rose-700 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>{type.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-6 line-clamp-3">{type.desc}</p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                     {type.features.map(f => (
                       <div key={f} className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span> {f}
                       </div>
                     ))}
                  </div>
                  
                  <div className="mt-6 font-black text-teal-600 text-lg">FREE SERVICE</div>
                </button>
              ))}
           </div>

           <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[2.5rem] border-2 border-dashed border-rose-200 dark:border-rose-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h4 className="text-lg font-black text-rose-700 dark:text-rose-400 uppercase tracking-tighter mb-2">Requesting for Current Location</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-300 font-bold uppercase tracking-widest opacity-80 leading-relaxed italic">
                    The dispatch team will receive your GPS coordinates automatically. Please ensure you are in an accessible area.
                  </p>
                </div>
                <button 
                  onClick={handleBook}
                  className="px-12 py-6 bg-rose-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-all transform active:scale-95"
                >
                  Confirm Dispatch
                </button>
              </div>
           </div>
        </div>
      )}

      {step === 'dispatching' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-10">
           <div className="relative">
              <div className="w-48 h-48 border-[12px] border-gray-100 dark:border-gray-800 border-t-rose-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-6xl animate-pulse">📡</div>
           </div>
           <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Finding Nearest Unit</h2>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] animate-pulse">Establishing Secure Emergency Link...</p>
           </div>
        </div>
      )}

      {step === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500">
           <div className="w-32 h-32 bg-green-50 text-green-600 rounded-[2.5rem] border-4 border-green-100 flex items-center justify-center text-6xl shadow-xl shadow-green-100">🚑</div>
           <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Ambulance Dispatched!</h2>
              <div className="bg-teal-50 dark:bg-teal-900/20 px-8 py-6 rounded-3xl border border-teal-100 dark:border-teal-800 inline-block">
                 <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                 <p className="text-5xl font-black text-teal-900 dark:text-teal-100 tracking-tighter">{eta}<span className="text-xl ml-1">mins</span></p>
              </div>
           </div>
           <p className="max-w-md text-gray-500 font-medium leading-relaxed">
             A {selectedType} unit is on its way to your pinned location. The driver will contact your registered phone number shortly.
           </p>
           <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-6">
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-left">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Driver Name</p>
                 <p className="font-black text-gray-900 dark:text-white uppercase">Sanjay Kumar</p>
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-left">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle No.</p>
                 <p className="font-black text-gray-900 dark:text-white uppercase">BR 01 AM 9982</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceBooking;
