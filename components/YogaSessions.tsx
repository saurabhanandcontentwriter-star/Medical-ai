
import React, { useState, useEffect } from 'react';
import { fetchYogaSessions } from '../services/geminiService';
import { YogaSession } from '../types';

const YogaSessions: React.FC = () => {
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<YogaSession | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      const data = await fetchYogaSessions();
      setSessions(data);
      setLoading(false);
    };
    loadSessions();
  }, []);

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yoga & Mindfulness</h1>
        <p className="text-gray-500 dark:text-gray-400">Find your balance with curated yoga sessions.</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {sessions.map(session => (
            <div 
              key={session.id} 
              onClick={() => setSelectedSession(session)}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-teal-500 cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{session.title}</h3>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 px-2 py-1 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                    {session.level}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{session.focus}</p>
                <div className="flex items-center text-xs text-gray-400 space-x-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {session.duration}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    {session.poses.length} Poses
                  </span>
                </div>
              </div>
              <button className="mt-6 w-full py-2 bg-gray-50 dark:bg-gray-900 text-teal-600 dark:text-teal-400 font-bold rounded-xl hover:bg-teal-600 hover:text-white transition-all">
                Start Practice
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSession.title}</h2>
                <p className="text-gray-500 dark:text-gray-400">{selectedSession.focus}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest">Session Sequence</h4>
              {selectedSession.poses.map((pose, idx) => (
                <div key={idx} className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="w-6 h-6 flex items-center justify-center bg-teal-500 text-white rounded-full text-xs font-bold mr-4 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{pose}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedSession(null)}
              className="mt-8 w-full bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-200 dark:shadow-none"
            >
              Complete Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YogaSessions;
