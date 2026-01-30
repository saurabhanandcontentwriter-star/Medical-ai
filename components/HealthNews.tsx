
import React, { useState, useEffect } from 'react';
import { fetchHealthNews } from '../services/geminiService';
import { HealthNewsItem } from '../types';

interface HealthNewsProps {
  language?: string;
}

// Added language prop to handle preference from the main App state
const HealthNews: React.FC<HealthNewsProps> = ({ language: propLanguage }) => {
  const [news, setNews] = useState<HealthNewsItem[]>([]);
  const [bookmarks, setBookmarks] = useState<HealthNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Default to prop value or English
  const [language, setLanguage] = useState<string>(propLanguage || 'English');
  const [view, setView] = useState<'all' | 'saved'>('all');

  // Sync internal language state with parent prop updates
  useEffect(() => {
    if (propLanguage) {
      setLanguage(propLanguage);
    }
  }, [propLanguage]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('medassist_bookmarked_news');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('medassist_bookmarked_news', JSON.stringify(bookmarks));
  }, [bookmarks]);

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
    if (view === 'all') {
      loadNews();
    }
  }, [language, view]);

  const toggleBookmark = (item: HealthNewsItem) => {
    setBookmarks(prev => {
      const isBookmarked = prev.find(b => b.id === item.id);
      if (isBookmarked) {
        return prev.filter(b => b.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const isItemBookmarked = (id: string) => bookmarks.some(b => b.id === id);

  const displayedNews = view === 'all' ? news : bookmarks;

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto h-full">
      <header className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {view === 'saved' 
              ? (language === 'Hindi' ? 'सहेजे गए लेख' : 'Saved Articles')
              : (language === 'Hindi' ? 'स्वास्थ्य समाचार और अपडेट' : 'Health News & Updates')
            }
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {view === 'saved'
              ? (language === 'Hindi' ? 'आपके बुकमार्क किए गए समाचार यहाँ हैं।' : 'Your bookmarked news items are kept here for later reading.')
              : (language === 'Hindi' ? 'नवीनतम चिकित्सा खोजें और स्वास्थ्य बुलेटिन।' : 'Latest medical breakthroughs and health bulletins.')
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* View Toggle (All vs Saved) */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'all'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {language === 'Hindi' ? 'सभी समाचार' : 'All News'}
            </button>
            <button
              onClick={() => setView('saved')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${
                view === 'saved'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill={view === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {language === 'Hindi' ? 'सहेजे गए' : 'Saved'}
            </button>
          </div>

          {/* Custom Language Switcher */}
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

          {view === 'all' && (
            <button 
              onClick={loadNews}
              disabled={isLoading}
              className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 transition-colors flex items-center disabled:opacity-50 whitespace-nowrap"
            >
              <svg className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {language === 'Hindi' ? 'ताज़ा करें' : 'Refresh'}
            </button>
          )}
        </div>
      </header>

      {isLoading && view === 'all' ? (
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
      ) : error && view === 'all' ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-8 text-center">
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          <button onClick={loadNews} className="mt-4 text-sm font-bold text-red-600 underline">Try Again</button>
        </div>
      ) : displayedNews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {view === 'saved' ? (language === 'Hindi' ? 'कोई बुकमार्क नहीं' : 'No saved articles') : (language === 'Hindi' ? 'कोई समाचार नहीं' : 'No news found')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {view === 'saved' 
              ? (language === 'Hindi' ? 'जब आप समाचार पढ़ते हैं, तो उन्हें बाद के लिए सहेजने के लिए बुकमार्क आइकन पर क्लिक करें।' : 'Click the bookmark icon on news articles to save them for later reading.')
              : (language === 'Hindi' ? 'ताज़ा समाचार प्राप्त करने के लिए रिफ्रेश बटन दबाएं।' : 'Click the refresh button to get the latest health updates.')
            }
          </p>
          {view === 'saved' && (
            <button 
              onClick={() => setView('all')}
              className="mt-6 text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              {language === 'Hindi' ? 'समाचार ब्राउज़ करें' : 'Browse News'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedNews.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col hover:shadow-md transition-shadow group relative">
              <button 
                onClick={() => toggleBookmark(item)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all z-10 ${
                  isItemBookmarked(item.id)
                    ? 'bg-teal-500 text-white shadow-md scale-110'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
                title={isItemBookmarked(item.id) ? "Remove Bookmark" : "Bookmark for Later"}
              >
                <svg className="w-5 h-5" fill={isItemBookmarked(item.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              <div className="flex justify-between items-start mb-4 pr-10">
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
