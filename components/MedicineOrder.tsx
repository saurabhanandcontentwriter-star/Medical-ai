
import React, { useState, useEffect } from 'react';
import { searchMedicines } from '../services/geminiService';
import { Medicine } from '../types';
import PaymentModal from './PaymentModal';

interface MedicineOrderProps {
  onOrderComplete: (itemNames: string[], amount: number) => void;
}

const MedicineOrder: React.FC<MedicineOrderProps> = ({ onOrderComplete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Payment State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const categories = ['All', 'Medicines', 'Ayurvedic', 'Skin & Face', 'Hair Care', 'Dental', 'Hygiene', 'Supplements', 'Sexual Wellness'];

  const defaultMedicines: Medicine[] = [
    // Medicines
    { id: '1', name: 'Paracetamol 650mg', description: 'Fever and mild pain relief', price: 30, category: 'Medicines', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop' },
    { id: '3', name: 'Cetirizine 10mg', description: 'Allergy relief', price: 45, category: 'Medicines', image: 'https://images.unsplash.com/photo-1471864190281-ad5f9f81ce4c?q=80&w=400&auto=format&fit=crop' },
    { id: '4', name: 'Digene Gel', description: 'Antacid for acidity relief', price: 180, category: 'Medicines', image: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?q=80&w=400&auto=format&fit=crop' },
    
    // Ayurvedic
    { id: 'a1', name: 'Ashwagandha Tablets', description: 'Herbal supplement for stress relief', price: 299, category: 'Ayurvedic', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=400&auto=format&fit=crop' },
    { id: 'a2', name: 'Triphala Churna', description: 'Natural digestive cleanser', price: 150, category: 'Ayurvedic', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop' },
    
    // Sexual Wellness
    { id: 'sw1', name: 'Natural Performance Booster', description: 'Ayurvedic blend for stamina', price: 850, category: 'Sexual Wellness', image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=400&auto=format&fit=crop' },
    { id: 'sw2', name: 'Personal Lubricant', description: 'Water-based formula', price: 425, category: 'Sexual Wellness', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=400&auto=format&fit=crop' },
    { id: 'sw3', name: 'Premium Latex Condoms', description: 'Ultra-thin safety (Pack of 10)', price: 220, category: 'Sexual Wellness', image: 'https://images.unsplash.com/photo-1618641986557-1ee23055d44d?q=80&w=400&auto=format&fit=crop' },
    { id: 'sw4', name: 'Shilajit Gold Resin', description: 'Pure Himalayan energy resin', price: 1250, category: 'Sexual Wellness', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=400&auto=format&fit=crop' },

    // Skin & Face
    { id: 'f1', name: 'Salicylic Face Wash', description: 'Treats active acne', price: 349, category: 'Skin & Face', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop' },
    { id: 'f3', name: 'SPF 50 Sunscreen', description: 'Matte sun protection', price: 499, category: 'Skin & Face', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=400&auto=format&fit=crop' },
    
    // Hair Care
    { id: 'h1', name: 'Ketoconazole Shampoo', description: 'Anti-dandruff solution', price: 320, category: 'Hair Care', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400&auto=format&fit=crop' },
    { id: 'h2', name: 'Biotin Hair Serum', description: 'Strengthens hair roots', price: 650, category: 'Hair Care', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=400&auto=format&fit=crop' },

    // Hygiene & Supplements
    { id: 's1', name: 'Antiseptic Liquid', description: 'Advanced germ protection', price: 145, category: 'Hygiene', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop' },
    { id: '2', name: 'Vitamin C + Zinc', description: 'Immunity booster', price: 120, category: 'Supplements', image: 'https://images.unsplash.com/photo-1550572017-ed20015ade7a?q=80&w=400&auto=format&fit=crop' },
    { id: '10', name: 'Whey Protein (1kg)', description: 'Muscle recovery fuel', price: 1499, category: 'Supplements', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=400&auto=format&fit=crop' },
  ];

  useEffect(() => {
    setMedicines(defaultMedicines);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMedicines(defaultMedicines);
      return;
    }
    setIsLoading(true);
    setActiveCategory('All');
    const results = await searchMedicines(searchQuery);
    if (results.length > 0) {
      setMedicines(results);
    }
    setIsLoading(false);
  };

  const addToCart = (med: Medicine) => {
    setCart([...cart, med]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const gst = Math.round(subtotal * 0.12);
  const platformFee = cart.length > 0 ? 15 : 0;
  const totalAmount = subtotal + gst + platformFee;

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    const itemNames = cart.map(c => c.name);
    onOrderComplete(itemNames, totalAmount);
    setCart([]);
    setShowCart(false);
  };

  const filteredMedicines = medicines.filter(med => {
    if (activeCategory === 'All') return true;
    return med.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50 dark:bg-gray-900 max-h-[calc(100vh-80px)] md:max-h-screen relative">
      <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto scrollbar-hide">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Pharmacy & Care</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Quality healthcare products delivered to your door.</p>
          </div>
          <button 
            onClick={() => setShowCart(true)}
            className="relative bg-teal-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            My Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                {cart.length}
              </span>
            )}
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search vitality, skin care, sexual wellness..."
            className="flex-1 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl px-6 py-4 text-gray-800 dark:text-white font-bold placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-gray-900 dark:bg-teal-600 text-white px-8 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all disabled:opacity-50"
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </div>

        <div className="flex space-x-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-4 ring-teal-500/10'
                  : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMedicines.map((med, idx) => (
            <div key={`${med.id}-${idx}`} className="group bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full animate-in fade-in duration-500">
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-900">
                <img 
                  src={med.image || 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=400&auto=format&fit=crop'} 
                  alt={med.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${
                    med.category === 'Sexual Wellness' ? 'bg-purple-600 text-white' :
                    med.category === 'Skin & Face' ? 'bg-rose-500 text-white' :
                    'bg-white/90 text-teal-600'
                  }`}>
                    {med.category || 'General'}
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tighter leading-tight">{med.name}</h3>
                  <span className="font-black text-teal-600 text-xl">₹{med.price}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-8">{med.description}</p>
                <button 
                  onClick={() => addToCart(med)}
                  className="w-full py-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-black uppercase text-[10px] tracking-widest border-2 border-teal-100 dark:border-teal-800 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMedicines.length === 0 && !isLoading && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No items found in this section.</p>
          </div>
        )}
      </div>

      {showCart && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Your Basket</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Selected Wellness items</p>
              </div>
              <button onClick={() => setShowCart(false)} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-full text-gray-400 hover:text-rose-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="text-center py-24 text-gray-300">
                  <div className="text-6xl mb-4 opacity-20">🛒</div>
                  <p className="font-black uppercase tracking-widest text-xs">Basket is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-3xl border border-gray-100 dark:border-gray-600 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0 shadow-sm">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 dark:text-gray-200 text-sm truncate uppercase tracking-tighter">{item.name}</h4>
                      <p className="text-[9px] text-teal-600 font-black uppercase tracking-widest mt-1">{item.category}</p>
                      <p className="font-black text-gray-900 dark:text-white mt-1">₹{item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="self-center text-gray-300 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-8 mt-6 space-y-3">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Tax (GST 12%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-700">
                <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">Total</span>
                <span className="text-3xl font-black text-teal-600">₹{totalAmount}</span>
              </div>
              <button 
                disabled={cart.length === 0}
                className="w-full bg-teal-600 text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] hover:bg-teal-700 transition-all disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 shadow-xl shadow-teal-100 dark:shadow-none mt-6"
                onClick={() => setIsPaymentOpen(true)}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalAmount}
        title="Payment Confirmation"
      />
    </div>
  );
};

export default MedicineOrder;
