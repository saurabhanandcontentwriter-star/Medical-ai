
import React, { useState, useEffect } from 'react';
import { fetchHealthTips } from '../services/geminiService';
import { HealthTip } from '../types';

const HealthTips: React.FC = () => {
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTips = async () => {
      const data = await fetchHealthTips();
      setTips(data);
      setLoading(false);
    };
    loadTips();
  }, []);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Nutrition': return 'from-orange-400 to-orange-600';
      case 'Lifestyle': return 'from-blue-400 to-blue-600';
      case 'Mental Health': return 'from-purple-400 to-purple-600';
      case 'Exercise': return 'from-teal-400 to-teal-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Health Tips</h1>
        <p className="text-gray-500 dark:text-gray-400">Small steps to a healthier you, powered by AI.</p>
      </header>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map(tip => (
            <div key={tip.id} className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`h-2 bg-gradient-to-r ${getCategoryColor(tip.category)}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-gray-50 dark:bg-gray-900 text-gray-500`}>
                    {tip.category}
                  </span>
                  <span className="text-2xl">{tip.icon || '✨'}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthTips;
