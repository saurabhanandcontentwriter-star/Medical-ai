
import React, { useState, useEffect } from 'react';
import { fetchHealthNews } from '../services/geminiService';
import { HealthNewsItem } from '../types';

interface HealthNewsProps {
  language?: string;
}

const HealthNews: React.FC<HealthNewsProps> = ({ language: propLanguage }) => {
  const [news, setNews] = useState<HealthNewsItem[]>([]);
  const [bookmarks, setBookmarks] = useState<HealthNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>(propLanguage || 'English');
  const [view, setView] = useState<'all' | 'saved'>('all');
  const [showProtocols, setShowProtocols] = useState(false);

  useEffect(() => {
    if (propLanguage) {
      setLanguage(propLanguage);
    }
  }, [propLanguage]);

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

  // Filter for critical outbreaks like Nipah to show in alert banner
  const alerts = news.filter(n => 
    n.title.toLowerCase().includes('nipah') || 
    n.summary.toLowerCase().includes('nipah') ||
    n.category.toLowerCase().includes('outbreak') ||
    n.title.toLowerCase().includes('emergency')
  );

  const displayedNews = view === 'all' ? news : bookmarks;

  const t = {
    alert: language === 'Hindi' ? 'स्वास्थ्य अलर्ट' : 'HEALTH ALERT',
    urgent: language === 'Hindi' ? 'तत्काल' : 'URGENT',
    safety: language === 'Hindi' ? 'सुरक्षा दिशानिर्देश देखें' : 'View Safety Protocols',
    breaking: language === 'Hindi' ? 'ताज़ा खबर' : 'Breaking News',
    protocolTitle: language === 'Hindi' ? 'निपाह वायरस सुरक्षा दिशानिर्देश' : 'NIPAH VIRUS SAFETY PROTOCOLS',
    protocolSubtitle: language === 'Hindi' ? 'तत्काल निवारक उपाय' : 'Immediate Preventive Measures'
  };

  const safetyProtocols = [
    { icon: '🧤', title: 'PPE Usage', desc: 'Healthcare workers should use personal protective equipment including gloves, gowns, and masks when handling patients.' },
    { icon: '🧼', title: 'Hygiene', desc: 'Frequent handwashing with soap and water or alcohol-based hand rub is essential.' },
    { icon: '🍎', title: 'Fruit Safety', desc: 'Avoid consuming fruits that show signs of animal/bat bites. Wash all fruits thoroughly.' },
    { icon: '🤒', title: 'Isolation', desc: 'Isolate individuals showing symptoms like fever, headache, or respiratory distress immediately.' },
    { icon: '🦇', title: 'Avoid Bats', desc: 'Avoid contact with bats or sick pigs, and stay away from areas where bats are known to roost.' }
  ];

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto h-full">
      <header className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {view === 'saved' 
              ? (language === 'Hindi' ? 'सहेजे गए लेख' : 'Saved Articles')
              : (language === 'Hindi' ? 'स्वास्थ्य समाचार केंद्र' : 'Health News Center')
            }
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {view === 'saved'
              ? (language === 'Hindi' ? 'आपके सहेजे गए महत्वपूर्ण लेख।' : 'Review your bookmarked health bulletins.')
              : (language === 'Hindi' ? 'भारत और दुनिया भर से चिकित्सा खोजें।' : 'Latest medical breakthroughs and virus outbreak monitoring.')
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                view === 'all'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {language === 'Hindi' ? 'सभी' : 'All'}
            </button>
            <button
              onClick={() => setView('saved')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                view === 'saved'
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {language === 'Hindi' ? 'सहेजे गए' : 'Saved'}
            </button>
          </div>

          <button 
            onClick={loadNews}
            disabled={isLoading}
            className="bg-gray-900 dark:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center disabled:opacity-50"
          >
            {isLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> : null}
            {language === 'Hindi' ? 'ताज़ा करें' : 'Refresh Feed'}
          </button>
        </div>
      </header>

      {/* Critical Alert Banner for Nipah / Outbreaks */}
      {!isLoading && view === 'all' && alerts.length > 0 && (
        <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-amber-600 dark:bg-amber-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-amber-200 dark:shadow-none flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-white/20 animate-pulse"></div>
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner flex-shrink-0 animate-bounce">🚨</div>
              <div className="flex-1 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="bg-white text-amber-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{t.urgent}</span>
                    <h2 className="text-xl font-black uppercase tracking-tighter">{t.alert}: {alerts[0].title}</h2>
                 </div>
                 <p className="text-sm font-bold text-amber-50 leading-relaxed max-w-2xl mb-6">
                    {alerts[0].summary}
                 </p>
                 <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <a href={alerts[0].url} target="_blank" rel="noreferrer" className="bg-white text-amber-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all shadow-lg">Read Official Bulletin</a>
                    <button 
                      onClick={() => setShowProtocols(true)}
                      className="bg-amber-500 text-white border-2 border-white/30 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
                    >
                      {t.safety}
                    </button>
                 </div>
              </div>
              <div className="hidden lg:block opacity-10 rotate-12 transform scale-150 absolute -right-4">
                 <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
              </div>
           </div>
        </div>
      )}

      {isLoading && view === 'all' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4 mb-6"></div>
              <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-full"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error && view === 'all' ? (
        <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-dashed border-rose-100 dark:border-rose-800 rounded-[3rem] p-16 text-center">
          <p className="text-rose-600 dark:text-rose-400 font-black uppercase text-xs tracking-widest">{error}</p>
          <button onClick={loadNews} className="mt-6 px-8 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Try Again</button>
        </div>
      ) : displayedNews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border-4 border-dashed border-gray-100 dark:border-gray-700 rounded-[4rem] p-24 text-center opacity-50">
          <div className="text-8xl mb-8">🗞️</div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
            {view === 'saved' ? 'No Bookmarked Alerts' : 'Feed is Silent'}
          </h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto">
            {view === 'saved' 
              ? 'Add important virus alerts to your bookmarks to keep track of them here.'
              : 'Pull the refresh button to synchronize with global medical journals.'
            }
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedNews.map((item) => {
            const isAlert = item.title.toLowerCase().includes('nipah') || item.category.toLowerCase().includes('emergency');
            return (
              <div key={item.id} className={`group bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border-2 transition-all flex flex-col hover:shadow-2xl relative overflow-hidden ${isAlert ? 'border-amber-500 bg-amber-50/5' : 'border-gray-50 dark:border-gray-800'}`}>
                
                {isAlert && (
                  <div className="bg-amber-500 text-white text-[8px] font-black uppercase px-4 py-1 tracking-widest flex items-center justify-center gap-1">
                     <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> High Risk Indicator
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isAlert ? 'bg-amber-100 text-amber-700' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'}`}>
                      {item.category}
                    </span>
                    <button 
                      onClick={() => toggleBookmark(item)}
                      className={`p-2.5 rounded-xl transition-all ${
                        isItemBookmarked(item.id)
                          ? 'bg-teal-600 text-white shadow-xl scale-110'
                          : 'bg-gray-50 dark:bg-gray-900 text-gray-300 hover:text-teal-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={isItemBookmarked(item.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 leading-[0.95] uppercase tracking-tighter group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed line-clamp-4 italic">
                    "{item.summary}"
                  </p>

                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Source</span>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight truncate max-w-[120px]">{item.source}</span>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Protocols Modal ("Pop add") */}
      {showProtocols && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-amber-500/20">
              <div className="bg-amber-600 p-10 text-white relative">
                 <button 
                   onClick={() => setShowProtocols(false)} 
                   className="absolute top-6 right-6 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-lg">🛡️</div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">{t.urgent}</p>
                       <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9]">{t.protocolTitle}</h3>
                    </div>
                 </div>
                 <p className="text-sm font-bold text-amber-100 uppercase tracking-widest opacity-90">{t.protocolSubtitle}</p>
              </div>

              <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                 <div className="grid gap-4">
                    {safetyProtocols.map((p, i) => (
                      <div key={i} className="flex gap-5 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-3xl border border-gray-100 dark:border-gray-700 group hover:border-amber-500 transition-all">
                         <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">{p.icon}</div>
                         <div>
                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-1">{p.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">{p.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border-2 border-dashed border-amber-200 dark:border-amber-800">
                    <p className="text-xs italic text-amber-800 dark:text-amber-200 font-bold leading-relaxed text-center">
                      Disclaimer: These protocols are based on WHO guidelines for Nipah virus outbreaks. Always follow instructions from your local health authority.
                    </p>
                 </div>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                 <button 
                   onClick={() => setShowProtocols(false)}
                   className="w-full py-5 bg-amber-600 text-white rounded-3xl font-black uppercase text-sm tracking-[0.3em] shadow-xl shadow-amber-200 dark:shadow-none hover:bg-amber-700 transition-all"
                 >
                   Understood & Safe
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HealthNews;
