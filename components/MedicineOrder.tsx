
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

  const categories = ['All', 'Medicines', 'Skin & Face', 'Hair Care', 'Dental', 'Hygiene', 'Supplements'];

  // Expanded Default suggestions with soaps, handwashes, and problem-specific treatments
  const defaultMedicines: Medicine[] = [
    // Medicines
    { id: '1', name: 'Paracetamol 650mg', description: 'Fever and mild pain relief', price: 30, category: 'Medicines' },
    { id: '3', name: 'Cetirizine 10mg', description: 'Allergy relief', price: 45, category: 'Medicines' },
    { id: '4', name: 'Digene Gel', description: 'Antacid for acidity relief', price: 180, category: 'Medicines' },
    { id: '6', name: 'Volini Spray', description: 'Pain relief spray for muscles', price: 210, category: 'Medicines' },
    
    // Skin & Face
    { id: 'f1', name: 'Salicylic Acid Face Wash', description: 'Treats active acne and prevents breakouts', price: 349, category: 'Skin & Face' },
    { id: 'f2', name: 'Acne Clarifying Gel', description: 'Spot treatment for pimples and blemishes', price: 275, category: 'Skin & Face' },
    { id: 'f3', name: 'SPF 50 Sunscreen', description: 'Ultra-light matte finish sun protection', price: 499, category: 'Skin & Face' },
    { id: 'f4', name: 'Sulphur Medicated Soap', description: 'For fungal infections and skin issues', price: 95, category: 'Skin & Face' },
    
    // Hair Care
    { id: 'h1', name: 'Ketoconazole Shampoo', description: 'Clinically proven anti-dandruff solution', price: 320, category: 'Hair Care' },
    { id: 'h2', name: 'Biotin Hair Serum', description: 'Strengthens hair roots and reduces hair fall', price: 650, category: 'Hair Care' },
    { id: 'h3', name: 'Minoxidil Solution 5%', description: 'Medical treatment for hair regrowth', price: 850, category: 'Hair Care' },
    { id: 'h4', name: 'Onion Hair Oil', description: 'Natural hair nourishment and shine', price: 399, category: 'Hair Care' },

    // Dental
    { id: 't1', name: 'Sensitivity Toothpaste', description: 'Rapid relief for sensitive teeth and gums', price: 185, category: 'Dental' },
    { id: 't2', name: 'Antiseptic Mouthwash', description: 'Kills 99% of germs, prevents plaque', price: 220, category: 'Dental' },
    { id: 't3', name: 'Gum Care Gel', description: 'Relief from bleeding and inflamed gums', price: 140, category: 'Dental' },
    { id: 't4', name: 'Charcoal Whitening Paste', description: 'Natural teeth whitening and stain removal', price: 245, category: 'Dental' },

    // Hygiene & Soaps
    { id: 's1', name: 'Antiseptic Liquid Wash', description: 'Advanced germ protection hand wash', price: 145, category: 'Hygiene' },
    { id: 's2', name: 'Glycerin Transparent Soap', description: 'Mild and gentle for dry, sensitive skin', price: 75, category: 'Hygiene' },
    { id: 's3', name: 'Neem & Tulsi Hand Wash', description: 'Natural antibacterial herbal protection', price: 125, category: 'Hygiene' },
    { id: 's4', name: 'Aloe Vera Body Soap', description: 'Moisturizing bar for daily freshness', price: 60, category: 'Hygiene' },
    
    // Supplements
    { id: '2', name: 'Vitamin C + Zinc', description: 'Immunity booster supplements', price: 120, category: 'Supplements' },
    { id: '7', name: 'Multivitamin Tablets', description: 'Daily essential vitamins', price: 350, category: 'Supplements' },
    { id: '10', name: 'Protein Powder (Chocolate)', description: 'Whey protein for muscle recovery', price: 1499, category: 'Supplements' },
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
  const gst = Math.round(subtotal * 0.12); // 12% GST
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pharmacy & Personal Care</h1>
            <p className="text-gray-500 dark:text-gray-400">Trusted solutions for skin, hair, teeth and general health.</p>
          </div>
          <button 
            onClick={() => setShowCart(true)}
            className="relative bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </button>
        </header>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search acne gel, hair fall serum, sensitivity toothpaste..."
            className="flex-1 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-gray-900 dark:bg-gray-700 text-white px-6 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med, idx) => (
            <div key={`${med.id}-${idx}`} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider ${
                  med.category === 'Skin & Face' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                  med.category === 'Hair Care' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' :
                  med.category === 'Dental' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  med.category === 'Hygiene' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                }`}>
                  {med.category || 'General'}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">₹{med.price}</span>
              </div>
              <div className="flex-1 mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-1">{med.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{med.description}</p>
              </div>
              <button 
                onClick={() => addToCart(med)}
                className="w-full py-2.5 rounded-xl border-2 border-teal-600 text-teal-600 font-bold text-sm uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all flex items-center justify-center dark:hover:bg-teal-500 dark:border-teal-500 dark:text-teal-400 dark:hover:text-white"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {filteredMedicines.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            No items found in this category.
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded inline-block mt-1 font-bold">{item.category}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-900 dark:text-white">₹{item.price}</span>
                      <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span>GST (12%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-700 mt-2">
                <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">₹{totalAmount}</span>
              </div>
              <button 
                disabled={cart.length === 0}
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-teal-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-teal-200 dark:shadow-none mt-4"
                onClick={() => setIsPaymentOpen(true)}
              >
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalAmount}
        title="Checkout Order"
      />
    </div>
  );
};

export default MedicineOrder;
