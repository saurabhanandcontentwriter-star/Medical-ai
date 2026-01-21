
import React from 'react';

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ userName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-teal-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
        
        {/* Left Panel - Teal with Icon */}
        <div className="md:w-[40%] bg-[#0d9488] p-10 flex flex-col justify-between text-white relative">
          <div className="space-y-6 relative z-10">
            {/* Sparkle Icon Box */}
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <svg className="w-8 h-8 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.2 7.6 1.2-5.4 5.4 1.2 7.2-7-3.6-7 3.6 1.2-7.2-5.4-5.4 7.6-1.2L12 2z" />
              </svg>
            </div>
            
            <h2 className="text-4xl font-black uppercase tracking-tight leading-[0.9] mt-8">
              WELCOME,<br />{userName.toUpperCase()}
            </h2>
          </div>

          {/* Building Background Image (Simplified) */}
          <div className="absolute top-10 right-0 opacity-20 pointer-events-none">
             <svg width="200" height="300" viewBox="0 0 200 300" fill="white">
                <rect x="50" y="50" width="100" height="200" rx="4" />
                <rect x="155" y="100" width="40" height="40" rx="2" />
                <path d="M165 120h20M175 110v20" stroke="white" strokeWidth="4" />
             </svg>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 relative z-10">
            MEDASSIST AI V2.5
          </div>
        </div>

        {/* Right Panel - White with Features */}
        <div className="md:w-[60%] p-12 flex flex-col">
          <div className="mb-10">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              YOUR HEALTH INTELLIGENCE DASHBOARD
            </h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Explore the new features we've prepared for your medical journey.
            </p>
          </div>

          <div className="space-y-8 mb-12 flex-1">
            {/* AI Report Analysis */}
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-xl shadow-sm">🤖</div>
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">AI REPORT ANALYSIS</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-tight">Upload reports to get instant clinical summaries.</p>
              </div>
            </div>

            {/* Video Consultations */}
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-xl shadow-sm">📹</div>
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">VIDEO CONSULTATIONS</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-tight">Real-time face-to-face sessions with Virtual Experts.</p>
              </div>
            </div>

            {/* Express Pharmacy */}
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-xl shadow-sm">🛒</div>
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">EXPRESS PHARMACY</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-tight">Get medications and wellness kits at your door.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-[#111827] text-white py-6 rounded-2xl font-black uppercase text-sm tracking-[0.3em] shadow-2xl transition-all transform active:scale-[0.98] hover:bg-black"
          >
            START EXPERIENCE
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
