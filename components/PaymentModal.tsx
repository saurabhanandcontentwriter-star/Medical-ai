
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, isOpen, onClose, onSuccess, title = "Pay for Lab Test" }) => {
  const [step, setStep] = useState<'select' | 'upi_apps' | 'processing' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [showEmailToast, setShowEmailToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setPaymentMethod('upi');
      setSelectedUpiApp('');
      setShowEmailToast(false);
    }
  }, [isOpen]);

  const handleProceed = () => {
    if (paymentMethod === 'upi') {
      setStep('upi_apps');
    } else {
      handlePay();
    }
  };

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      // Simulate sending email notification
      setTimeout(() => setShowEmailToast(true), 1000);
    }, 2000);
  };

  const downloadReceipt = () => {
    const doc = new jsPDF();
    const txnId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const date = new Date().toLocaleString();

    doc.setFillColor(13, 148, 136); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MEDASSIST AI", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 30, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text(`Receipt ID: ${txnId}`, 20, 60);
    doc.text(`Date: ${date}`, 20, 70);
    doc.line(20, 75, 190, 75);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE DETAILS", 20, 85);
    doc.setFont("helvetica", "normal");
    doc.text(`Description: ${title}`, 20, 95);
    doc.text(`Payment Method: ${paymentMethod.toUpperCase()} ${selectedUpiApp ? `(${selectedUpiApp})` : ''}`, 20, 105);
    doc.line(20, 115, 190, 115);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL AMOUNT PAID: RS. ${amount}`, 105, 130, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Status: SUCCESSFUL", 105, 140, { align: 'center' });
    doc.setFontSize(8);
    doc.text("Thank you for choosing MedAssist AI. This is a computer generated document.", 105, 280, { align: 'center' });
    doc.save(`MedAssist_Receipt_${txnId}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col transition-all">
        
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-[#1e293b] dark:text-white leading-tight">{title}</h3>
            <p className="text-sm text-slate-400 font-bold">Secure Payment Gateway</p>
          </div>
          <button onClick={onClose} disabled={step === 'processing'} className="text-slate-300 hover:text-slate-500 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 pt-4">
          {step === 'select' && (
            <div className="space-y-8">
              <div className="text-center py-10 bg-[#f0fdfa] dark:bg-teal-900/10 rounded-[2rem] border border-[#ccfbf1] dark:border-teal-800">
                <p className="text-[#64748b] dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">TOTAL PAYABLE AMOUNT</p>
                <p className="text-5xl font-black text-[#0d9488] dark:text-teal-400 tracking-tighter">₹{amount}</p>
                <p className="text-[11px] text-[#94a3b8] mt-4 uppercase tracking-[0.15em] font-black opacity-80">INCLUDES GST & PLATFORM FEES</p>
              </div>
              <div className="space-y-4">
                <p className="font-black text-[#475569] dark:text-gray-400 uppercase tracking-tighter text-sm ml-1">SELECT PAYMENT METHOD</p>
                <label onClick={() => setPaymentMethod('upi')} className={`flex items-center p-5 rounded-2xl cursor-pointer transition-all border-2 ${paymentMethod === 'upi' ? 'border-[#0d9488] bg-white dark:bg-gray-800 shadow-sm' : 'border-slate-100 dark:border-gray-700 hover:border-slate-200'}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${paymentMethod === 'upi' ? 'border-[#0d9488] bg-[#0d9488]' : 'border-slate-300'}`}>
                    {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                  </div>
                  <div className="flex-1">
                    <span className="block font-black text-[#1e293b] dark:text-white text-lg tracking-tight leading-none mb-1">UPI</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tight">GOOGLE PAY, PHONEPE, PAYTM</span>
                  </div>
                </label>
                <label onClick={() => setPaymentMethod('card')} className={`flex items-center p-5 rounded-2xl cursor-pointer transition-all border-2 ${paymentMethod === 'card' ? 'border-[#0d9488] bg-white dark:bg-gray-800 shadow-sm' : 'border-slate-100 dark:border-gray-700 hover:border-slate-200'}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${paymentMethod === 'card' ? 'border-[#0d9488] bg-[#0d9488]' : 'border-slate-300'}`}>
                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                  </div>
                  <div className="flex-1">
                    <span className="block font-black text-[#1e293b] dark:text-white text-lg tracking-tight leading-none mb-1">Credit / Debit Card</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tight">VISA, MASTERCARD, RUPAY</span>
                  </div>
                </label>
              </div>
              <button onClick={handleProceed} className="w-full bg-[#1e293b] dark:bg-teal-600 text-white py-6 rounded-[1.5rem] font-black uppercase text-sm tracking-[0.25em] shadow-xl hover:bg-black transition-all mt-6 active:scale-[0.98]">Next</button>
            </div>
          )}

          {step === 'upi_apps' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <button onClick={() => setStep('select')} className="text-[#0d9488] font-black text-[10px] uppercase flex items-center mb-4 tracking-widest">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                BACK TO METHODS
              </button>
              <h4 className="text-xl font-black text-[#1e293b] dark:text-white uppercase tracking-tighter">Choose UPI App</h4>
              <div className="grid grid-cols-1 gap-3">
                {[{ id: 'mi', name: 'Mi Pay', icon: 'https://img.icons8.com/color/48/xiaomi.png' }, { id: 'gpay', name: 'Google Pay', icon: 'https://img.icons8.com/color/48/google-pay.png' }, { id: 'phonepe', name: 'PhonePe', icon: 'https://img.icons8.com/color/48/phone-pe.png' }, { id: 'other', name: 'Other UPI Apps', icon: 'https://img.icons8.com/color/48/bank-cards.png' }].map(app => (
                  <button key={app.id} onClick={() => { setSelectedUpiApp(app.name); handlePay(); }} className="flex items-center p-5 bg-slate-50 dark:bg-gray-700/50 rounded-2xl border border-slate-100 dark:border-gray-600 hover:border-[#0d9488] hover:bg-white transition-all text-left group">
                    <img src={app.icon} alt={app.name} className="w-8 h-8 mr-4 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-slate-700 dark:text-white uppercase text-xs tracking-widest">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-[6px] border-slate-100 border-t-[#0d9488] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🛡️</div>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-black text-[#1e293b] dark:text-white uppercase tracking-tighter mb-2">Securing Payment</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Contacting {selectedUpiApp || paymentMethod.toUpperCase()}...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in zoom-in duration-400">
              <div className="w-28 h-28 bg-[#f0fdfa] border-4 border-[#ccfbf1] text-[#0d9488] rounded-[2.5rem] flex items-center justify-center shadow-lg animate-bounce relative">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
              </div>

              {showEmailToast && (
                <div className="flex items-center gap-3 bg-[#1e293b] text-white px-5 py-3 rounded-2xl animate-in slide-in-from-bottom-5 shadow-xl border border-slate-700">
                   <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                   <p className="text-[10px] font-black uppercase tracking-widest">Confirmation email sent!</p>
                </div>
              )}

              <div className="text-center w-full">
                <h4 className="text-3xl font-black text-[#1e293b] dark:text-white uppercase tracking-tighter mb-2">Transaction Successful</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto mb-10">Confirmed! Amount ₹{amount} was charged. A copy of this receipt has been dispatched to your email.</p>
                
                <div className="flex flex-col gap-4 w-full px-2">
                  <button onClick={downloadReceipt} className="w-full bg-[#0d9488] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 hover:bg-teal-700 active:scale-[0.98] transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                    Download PDF Receipt
                  </button>
                  <button onClick={onSuccess} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-[#0d9488] transition-colors">Done</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
