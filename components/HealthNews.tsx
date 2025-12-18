
import React, { useState, useEffect } from 'react';
import { fetchHealthNews } from '../services/geminiService';
import { HealthNewsItem } from '../types';

const HealthNews: React.FC = () => {
  const [news, setNews] = useState<HealthNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newsItems = await fetchHealthNews(language);
      setNews(newsItems);
    } catch (err) {
      console.error(err);
      setError("Failed to load health news. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [language]);

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto h-full">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'Hindi' ? 'स्वास्थ्य समाचार और अपडेट' : 'Health News & Updates'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'Hindi' ? 'नवीनतम चिकित्सा खोजें और स्वास्थ्य बुलेटिन।' : 'Latest medical breakthroughs and health bulletins.'}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Custom Language Switcher (Matches requested image style) */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <button
              onClick={() => setLanguage('English')}
              className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                language === 'English'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 border-2 border-black dark:border-gray-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-2 border-transparent'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('Hindi')}
              className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                language === 'Hindi'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 border-2 border-black dark:border-gray-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-2 border-transparent'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button 
            onClick={loadNews}
            disabled={isLoading}
            className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 transition-colors flex items-center disabled:opacity-50 whitespace-nowrap"
          >
            <svg className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {language === 'Hindi' ? 'ताज़ा करें' : 'Refresh'}
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-8 text-center">
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          <button onClick={loadNews} className="mt-4 text-sm font-bold text-red-600 underline">Try Again</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-1 rounded">
                  {item.category}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{item.date}</span>
              </div>
              <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-teal-600 transition-colors ${language === 'Hindi' ? 'leading-relaxed' : 'leading-snug'}`}>
                {item.title}
              </h3>
              <p className={`text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1 ${language === 'Hindi' ? 'leading-loose' : 'leading-relaxed'}`}>
                {item.summary}
              </p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{item.source}</span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-teal-600 dark:text-teal-400 text-xs font-bold hover:underline flex items-center"
                >
                  {language === 'Hindi' ? 'पूरी कहानी पढ़ें' : 'Read Full Story'}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthNews;
