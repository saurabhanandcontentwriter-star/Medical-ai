
import React, { useState } from 'react';
import { BlogArticle } from '../types';

const HealthBlog: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Nutrition', 'Mental Health', 'Fitness', 'Medical Insight', 'Ayurveda'];

  const articles: BlogArticle[] = [
    {
      id: '1',
      title: 'The Silent Impact of Daily Hydration on Mental Clarity',
      excerpt: 'How drinking enough water affects your cognitive performance and mood stability throughout the day.',
      content: 'Drinking enough water is about more than just physical health; it’s a cornerstone of mental acuity. Studies show that even 1% dehydration can lead to significant drops in concentration and mood volatility. In this article, we explore the biological link between H2O and neurotransmitter efficiency. When you are hydrated, your brain receives better blood flow, allowing for efficient waste removal and oxygen delivery. This prevents the "brain fog" many associate with midday fatigue...',
      author: 'Dr. Sarah Mitchell',
      readTime: '5 min',
      category: 'Mental Health',
      image: 'https://images.unsplash.com/photo-1548919973-5dea5846f680?q=80&w=800&auto=format&fit=crop',
      date: 'Oct 25, 2023'
    },
    {
      id: '2',
      title: 'Modern Ayurveda: Ancient Wisdom for Desktop Warriors',
      excerpt: 'Adapting traditional Ayurvedic practices to mitigate the health risks of a sedentary 9-to-5 desk job.',
      content: 'Ayurveda, the 5,000-year-old system of natural healing, has profound applications for the modern office worker. From the use of specific herbal teas like Ashwagandha to combat stress, to the practice of "Netra Tarpana" for eye strain, these ancient techniques are more relevant than ever. We look at how "Dinacharya" (daily routine) can be mapped to a corporate schedule to maintain dosha balance despite long hours of screen time...',
      author: 'Aacharya Vikram',
      readTime: '8 min',
      category: 'Ayurveda',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop',
      date: 'Oct 24, 2023'
    },
    {
      id: '3',
      title: 'Superfoods: Separating Marketing Hype from Nutritional Reality',
      excerpt: 'A deep dive into common "superfoods" and what the clinical data actually says about their benefits.',
      content: 'The term "superfood" is often more marketing than science. However, certain nutrient-dense foods like blueberries, kale, and turmeric do carry specific bioactive compounds that support long-term health. We break down the clinical evidence for the top 10 most popular superfoods and provide a guide on how to integrate them into a balanced diet without breaking the bank...',
      author: 'Lisa Chen, RD',
      readTime: '6 min',
      category: 'Nutrition',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
      date: 'Oct 22, 2023'
    },
    {
      id: '4',
      title: 'Understanding Your Gut Microbiome: The Second Brain',
      excerpt: 'Why your digestive health is the secret key to your immune system and overall happiness.',
      content: 'Your gut is home to trillions of microbes that do more than just digest food. They communicate directly with your brain via the vagus nerve. Emerging research suggests that gut health is linked to everything from autoimmune diseases to clinical depression. Learning how to feed your microbiome with prebiotics and probiotics is essential for holistic wellness...',
      author: 'Dr. James Wilson',
      readTime: '10 min',
      category: 'Medical Insight',
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop',
      date: 'Oct 20, 2023'
    },
    {
      id: '5',
      title: 'The Future of Wearable Health Technology',
      excerpt: 'How smart sensors are moving beyond step counting to predict chronic conditions before they start.',
      content: 'We are entering an era of proactive healthcare. The new generation of wearables isn’t just tracking your sleep; they are monitoring blood glucose, ECG, and even stress levels through sweat analysis. This data, when crunched by AI, provides a longitudinal view of your health that was previously impossible. We interview top bio-engineers about the roadmap for consumer health sensors...',
      author: 'Mark Sterling',
      readTime: '7 min',
      category: 'Medical Insight',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop',
      date: 'Oct 18, 2023'
    },
    {
      id: '6',
      title: 'Sustainable Fitness: Building a Routine You Won’t Quit',
      excerpt: 'Psychological strategies to overcome the "all-or-nothing" mentality and stay active for life.',
      content: 'Most people fail at fitness not because of lack of effort, but because of unsustainable intensity. The key to lifetime health is "Low Stakes consistency." This means prioritizing movement over "workouts." We discuss the "Habit Stacking" method and how to design your environment to make exercise the path of least resistance...',
      author: 'Coach Sarah T.',
      readTime: '4 min',
      category: 'Fitness',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
      date: 'Oct 15, 2023'
    }
  ];

  const filteredArticles = activeCategory === 'All' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full h-full overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Learning Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Deep dives into health, science, and wellness.</p>
      </header>

      {/* Categories */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeCategory === cat
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-200 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {filteredArticles.map(article => (
          <div 
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="group bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-teal-600 uppercase tracking-widest shadow-sm">
                  {article.category}
                </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center space-x-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>{article.date}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{article.readTime} read</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-teal-600 transition-colors uppercase tracking-tighter">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
                {article.excerpt}
              </p>
              <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">By {article.author}</span>
                <span className="text-teal-600 dark:text-teal-400 font-black text-[10px] uppercase tracking-widest flex items-center">
                  Read More
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-500 relative flex flex-col">
            
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-900 p-3 rounded-full z-50 shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative h-80 flex-shrink-0">
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 via-transparent to-transparent"></div>
            </div>

            <div className="px-8 md:px-16 pb-16 -mt-20 relative z-10">
              <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-6 text-[10px] font-black text-teal-600 uppercase tracking-widest">
                  <span className="bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-lg">{selectedArticle.category}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">{selectedArticle.date}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">{selectedArticle.readTime} read</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 leading-[0.95]">
                  {selectedArticle.title}
                </h2>

                <div className="flex items-center space-x-4 mb-10 pb-10 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 font-black text-xl">
                    {selectedArticle.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedArticle.author}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">MedAssist Expert Contributor</p>
                  </div>
                </div>

                <div className="prose prose-teal dark:prose-invert max-w-none">
                   <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-teal-600">
                    {selectedArticle.content}
                   </p>
                   <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-6">
                    Our AI models continuously scan clinical journals to bring you the most updated insights. Health is a long-term commitment, and staying informed is your first line of defense against lifestyle diseases. By understanding the granular details of hydration, nutrition, and mental balance, you can craft a lifestyle that is both resilient and fulfilling.
                   </p>
                </div>

                <div className="mt-12 bg-teal-50 dark:bg-teal-900/10 p-8 rounded-[2rem] border-2 border-dashed border-teal-200 dark:border-teal-800">
                   <h4 className="text-sm font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest mb-4">AI Key Takeaway</h4>
                   <p className="text-sm italic text-teal-800 dark:text-teal-200 font-medium">
                    "This article emphasizes that wellness is holistic. Small habitual changes, when combined with evidence-based medical knowledge, create exponential improvements in quality of life. Consult your doctor before making major dietary shifts."
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthBlog;
