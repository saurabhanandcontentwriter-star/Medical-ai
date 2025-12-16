import React, { useState, useEffect } from 'react';
import { searchLabTests } from '../services/geminiService';
import { LabTest } from '../types';
import PaymentModal from './PaymentModal';

interface LabTestBookingProps {
  onBookingComplete: (testName: string, date: string, amount: number) => void;
}

const LabTestBooking: React.FC<LabTestBookingProps> = ({ onBookingComplete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null); // For booking modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');

  // Default suggestions
  const defaultTests: LabTest[] = [
    { id: '1', name: 'Full Body Checkup', description: 'Comprehensive health screening including CBC, Lipid Profile, Liver Function, and more.', price: 1499, preparation: '10-12 hours fasting required.' },
    { id: '2', name: 'Thyroid Profile', description: 'T3, T4, and TSH levels check.', price: 499, preparation: 'No special preparation needed.' },
    { id: '3', name: 'Diabetes Screen (HbA1c)', description: 'Average blood sugar levels over past 3 months.', price: 350, preparation: 'No fasting required.' },
    { id: '4', name: 'Lipid Profile', description: 'Cholesterol and triglyceride levels.', price: 550, preparation: '12 hours fasting required.' },
    { id: '5', name: 'Vitamin D Test', description: 'Check for Vitamin D deficiency.', price: 899, preparation: 'No special preparation needed.' },
  ];

  useEffect(() => {
    setTests(defaultTests);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setTests(defaultTests);
      return;
    }
    setIsLoading(true);
    const results = await searchLabTests(searchQuery);
    if (results.length > 0) {
      setTests(results);
    }
    setIsLoading(false);
  };

  const handleBook = (test: LabTest) => {
    setSelectedTest(test);
    setPreferredDate(new Date().toISOString().split('T')[0]); // Default today
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    
    // Trigger callback to App.tsx
    if (selectedTest) {
      onBookingComplete(selectedTest.name, preferredDate, selectedTest.price);
    }

    setSelectedTest(null);
  };

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50 max-h-[calc(100vh-80px)] md:max-h-screen">
      <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book Lab Tests</h1>
          <p className="text-gray-500">Home sample collection by certified professionals.</p>
        </header>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for tests (e.g., blood sugar, kidney function, vitamins)..."
            className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-gray-900 text-white px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Find Tests'}
          </button>
        </div>

        {/* Test List */}
        <div className="space-y-4">
          {tests.map((test, idx) => (
            <div key={`${test.id}-${idx}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{test.name}</h3>
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg font-medium">Home Collection</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {test.preparation}
                </div>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 min-w-[120px]">
                <span className="text-xl font-bold text-gray-900">₹{test.price}</span>
                <button 
                  onClick={() => handleBook(test)}
                  className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors w-full md:w-auto"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Booking</h2>
            <p className="text-gray-500 mb-6">Complete your booking for <strong>{selectedTest.name}</strong>.</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Price</span>
                  <span className="font-medium">₹{selectedTest.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sample Collection</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total Payable</span>
                  <span>₹{selectedTest.price}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input 
                  type="date" 
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedTest(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsPaymentOpen(true)}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedTest && (
        <PaymentModal 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
          amount={selectedTest.price}
          title="Pay for Lab Test"
        />
      )}
    </div>
  );
};

export default LabTestBooking;