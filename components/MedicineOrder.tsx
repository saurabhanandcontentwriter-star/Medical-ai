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

  const categories = ['All', 'Medicines', 'Supplements', 'Healthy Drinks'];

  // Expanded Default suggestions
  const defaultMedicines: Medicine[] = [
    // Medicines
    { id: '1', name: 'Paracetamol 650mg', description: 'Fever and mild pain relief', price: 30, category: 'General' },
    { id: '3', name: 'Cetirizine 10mg', description: 'Allergy relief', price: 45, category: 'Allergy' },
    { id: '4', name: 'Digene Gel', description: 'Antacid for acidity relief', price: 180, category: 'Digestion' },
    { id: '6', name: 'Volini Spray', description: 'Pain relief spray for muscles', price: 210, category: 'Pain Relief' },
    
    // Supplements
    { id: '2', name: 'Vitamin C + Zinc', description: 'Immunity booster supplements', price: 120, category: 'Supplements' },
    { id: '7', name: 'Multivitamin Tablets', description: 'Daily essential vitamins', price: 350, category: 'Supplements' },
    { id: '8', name: 'Calcium + D3', description: 'Bone health supplements', price: 290, category: 'Supplements' },
    
    // Healthy Drinks
    { id: '9', name: 'Green Tea Bags', description: 'Antioxidant rich detox tea', price: 180, category: 'Healthy Drinks' },
    { id: '10', name: 'Protein Powder (Chocolate)', description: 'Whey protein for muscle recovery', price: 1499, category: 'Healthy Drinks' },
    { id: '11', name: 'Electrolyte Energy Drink', description: 'Instant hydration and energy', price: 60, category: 'Healthy Drinks' },
    { id: '12', name: 'Nutritional Shake', description: 'Complete balanced nutrition drink', price: 450, category: 'Healthy Drinks' },
    
    // First Aid
    { id: '5', name: 'Band-Aid Pack', description: 'Waterproof adhesive bandages', price: 50, category: 'First Aid' },
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
    // When searching, we reset category to 'All' to show all relevant results
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

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    
    // Trigger global handlers
    const itemNames = cart.map(c => c.name);
    onOrderComplete(itemNames, totalAmount);

    setCart([]);
    setShowCart(false);
  };

  // Filter Logic
  const filteredMedicines = medicines.filter(med => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Healthy Drinks') return med.category === 'Healthy Drinks';
    if (activeCategory === 'Supplements') return med.category === 'Supplements';
    if (activeCategory === 'Medicines') {
      // Everything else is considered a medicine
      return med.category !== 'Healthy Drinks' && med.category !== 'Supplements';
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50 max-h-[calc(100vh-80px)] md:max-h-screen relative">
      <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy & Wellness</h1>
            <p className="text-gray-500">Order medicines, supplements, and health drinks.</p>
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
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for medicines, drinks, supplements..."
            className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-gray-900 text-white px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
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
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med, idx) => (
            <div key={`${med.id}-${idx}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  med.category === 'Healthy Drinks' ? 'bg-orange-100 text-orange-700' :
                  med.category === 'Supplements' ? 'bg-purple-100 text-purple-700' :
                  'bg-teal-50 text-teal-700'
                }`}>
                  {med.category || 'General'}
                </span>
                <span className="font-bold text-gray-900">₹{med.price}</span>
              </div>
              <div className="flex-1 mb-4">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{med.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{med.description}</p>
              </div>
              <button 
                onClick={() => addToCart(med)}
                className="w-full py-2.5 rounded-xl border-2 border-teal-600 text-teal-600 font-medium hover:bg-teal-600 hover:text-white transition-all flex items-center justify-center"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {filteredMedicines.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            No items found in this category.
          </div>
        )}
      </div>

      {/* Cart Sidebar / Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded inline-block mt-1">{item.category}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">₹{item.price}</span>
                      <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">₹{totalAmount}</span>
              </div>
              <button 
                disabled={cart.length === 0}
                className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-teal-200"
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
        title="Checkout Medicine"
      />
    </div>
  );
};

export default MedicineOrder;