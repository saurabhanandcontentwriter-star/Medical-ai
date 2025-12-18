import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, isOpen, onClose, onSuccess, title = "Complete Payment" }) => {
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setPaymentMethod('upi');
    }
  }, [isOpen]);

  const handlePay = () => {
    setStep('processing');
    // Simulate API call
    setTimeout(() => {
      setStep('success');
      // Auto close after success
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Secure Payment Gateway</p>
          </div>
          <button onClick={onClose} disabled={step !== 'select'} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-6">
              <div className="text-center py-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Payable Amount</p>
                <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">₹{amount}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Includes GST & Platform Fees</p>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-gray-700 dark:text-gray-300">Select Payment Method</p>
                
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500" />
                  <div className="ml-3 flex-1">
                    <span className="block font-medium text-gray-900 dark:text-white">UPI</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Google Pay, PhonePe, Paytm</span>
                  </div>
                  <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500" />
                  <div className="ml-3 flex-1">
                    <span className="block font-medium text-gray-900 dark:text-white">Credit / Debit Card</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, RuPay</span>
                  </div>
                  <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500" />
                  <div className="ml-3 flex-1">
                    <span className="block font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Pay when you receive</span>
                  </div>
                  <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </label>
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 dark:shadow-none mt-4"
              >
                Pay ₹{amount}
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-teal-100 dark:border-teal-900 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment</h4>
                <p className="text-gray-500 dark:text-gray-400">Please do not close this window...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h4>
                <p className="text-gray-500 dark:text-gray-400">Your order has been confirmed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;