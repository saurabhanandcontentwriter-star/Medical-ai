import React, { useState } from 'react';
import { OrderItem } from '../types';

interface OrderTrackingProps {
  orders: OrderItem[];
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orders }) => {
  const [previewDoc, setPreviewDoc] = useState<{ type: 'invoice' | 'report', order: OrderItem } | null>(null);

  if (orders.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Orders</h2>
        <p className="text-center max-w-xs">Your medicine orders, lab test bookings, and appointments will appear here.</p>
      </div>
    );
  }

  const handlePreview = (e: React.MouseEvent, type: 'invoice' | 'report', order: OrderItem) => {
    e.preventDefault();
    setPreviewDoc({ type, order });
  };

  const closePreview = () => setPreviewDoc(null);

  const downloadFile = () => {
    if (!previewDoc) return;
    
    // Create a dummy download
    const element = document.createElement("a");
    const fileContent = `MedAssist ${previewDoc.type === 'invoice' ? 'Invoice' : 'Report'}\nOrder ID: ${previewDoc.order.id}\nDate: ${previewDoc.order.date.toLocaleDateString()}\nTotal: Rs. ${previewDoc.order.amount}`;
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `MedAssist_${previewDoc.type}_${previewDoc.order.id}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
    
    closePreview();
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto w-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Orders</h1>
        <p className="text-gray-500 dark:text-gray-400">Real-time status of your medicines and appointments.</p>
      </header>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  order.type === 'medicine' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 
                  order.type === 'lab_test' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                }`}>
                  {order.type === 'medicine' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  ) : order.type === 'lab_test' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{order.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{order.details}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Order ID: #{order.id} • {order.date.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{order.amount}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                  order.status === 'Delivered' || order.status === 'Completed' || order.status === 'Visit Completed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="relative mb-6">
              {/* Desktop Horizontal Stepper */}
              <div className="hidden md:flex justify-between items-center relative z-10 px-4">
                {/* Connecting Line background */}
                <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 mx-8"></div>
                {/* Progress Line */}
                 <div 
                   className="absolute left-0 top-3 h-0.5 bg-teal-500 -z-10 mx-8 transition-all duration-1000"
                   style={{ width: `${(order.steps.filter(s => s.isCompleted).length - 1) / (order.steps.length - 1) * 100}%` }}
                 ></div>

                {order.steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                      step.isCompleted 
                        ? 'border-teal-500 bg-teal-500' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                      {step.isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p className={`text-xs font-bold ${step.isCompleted ? 'text-teal-700 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</p>
                      {step.timestamp && <p className="text-[10px] text-gray-400 dark:text-gray-600">{step.timestamp}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Vertical Stepper */}
              <div className="md:hidden space-y-0 pl-2">
                {order.steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start pb-6 last:pb-0">
                    {/* Vertical Line */}
                    {idx !== order.steps.length - 1 && (
                      <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                        step.isCompleted && order.steps[idx + 1].isCompleted ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}></div>
                    )}
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center z-10 ${
                      step.isCompleted 
                        ? 'border-teal-500 bg-teal-500' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                      {step.isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-bold ${step.isCompleted ? 'text-teal-700 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</p>
                      {step.timestamp && <p className="text-xs text-gray-500 dark:text-gray-500">{step.timestamp}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloads & Actions */}
            {(order.reportUrl || order.invoiceUrl) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {order.reportUrl && (
                  <button 
                    onClick={(e) => handlePreview(e, 'report', order)}
                    className="flex items-center px-4 py-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-xl text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors border border-teal-100 dark:border-teal-800"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download Report
                  </button>
                )}
                {order.invoiceUrl && (
                  <button 
                    onClick={(e) => handlePreview(e, 'invoice', order)}
                    className="flex items-center px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Download Invoice
                  </button>
                )}
              </div>
            )}

            {/* Delivery Agent / Professional Details */}
            {order.deliveryAgent && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-900 dark:text-white">{order.type === 'medicine' ? 'Delivery Partner' : order.type === 'lab_test' ? 'Lab Technician' : 'Clinic Staff'}</p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">{order.deliveryAgent.name}</p>
                   </div>
                </div>
                <div className="flex items-center">
                   <a href={`tel:${order.deliveryAgent.phone}`} className="flex items-center text-teal-700 dark:text-teal-400 bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 px-3 py-2 rounded-lg transition-colors shadow-sm">
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                     <span className="font-medium text-sm hidden sm:inline">{order.deliveryAgent.phone}</span>
                     <span className="font-medium text-sm sm:hidden">Call</span>
                   </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-colors">
            {/* Modal Header */}
            <div className="bg-gray-800 dark:bg-gray-900 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center">
                {previewDoc.type === 'invoice' ? (
                   <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Invoice Preview</>
                ) : (
                   <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>Report Preview</>
                )}
              </h3>
              <button onClick={closePreview} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body - Simulated Document (keep white for readability of "paper") */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900">
              <div className="bg-white shadow-lg p-8 mx-auto max-w-lg min-h-[500px] text-sm text-gray-800">
                
                {/* Document Header */}
                <div className="border-b-2 border-gray-100 pb-6 mb-6 flex justify-between items-start">
                  <div>
                    <div className="text-2xl font-bold text-teal-600 mb-1">MedAssist</div>
                    <p className="text-gray-400 text-xs">Healthcare Simplified</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                      {previewDoc.type === 'invoice' ? 'Tax Invoice' : 'Lab Report'}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">ID: #{previewDoc.order.id}</p>
                    <p className="text-gray-500 text-xs">Date: {previewDoc.order.date.toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Patient/Customer Info */}
                <div className="mb-8">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    {previewDoc.type === 'invoice' ? 'Billed To' : 'Patient Details'}
                  </p>
                  <p className="font-bold text-gray-900 text-base">Rahul Sharma</p>
                  <p className="text-gray-600">Age: 28 / Male</p>
                  <p className="text-gray-600">Patna, Bihar</p>
                </div>

                {/* Content based on Type */}
                {previewDoc.type === 'invoice' ? (
                  <div className="space-y-4">
                    <table className="w-full mb-8">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-bold text-gray-600">Item</th>
                          <th className="text-right py-2 font-bold text-gray-600">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewDoc.order.details.split(',').map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-50">
                            <td className="py-3 text-gray-800">{item.trim()}</td>
                            <td className="py-3 text-right text-gray-600">Included</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span>Items Subtotal</span>
                        <span>₹{Math.round(previewDoc.order.amount * 0.85)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span>GST (IGST 12%)</span>
                        <span>₹{Math.round(previewDoc.order.amount * 0.12)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span>Platform & Service Fee</span>
                        <span>₹{Math.round(previewDoc.order.amount * 0.03)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-lg pt-2">
                        <span>Total Amount</span>
                        <span className="text-teal-600">₹{previewDoc.order.amount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">Test Results</p>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-medium">{previewDoc.order.title}</span>
                        <span className="font-bold text-gray-900">Normal Range</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Analyte A</span>
                        <span>12.5 <span className="text-xs text-gray-400">(10-15)</span></span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Analyte B</span>
                        <span>0.8 <span className="text-xs text-gray-400">(0.5-1.2)</span></span>
                      </div>
                      {/* Fake verified stamp */}
                      <div className="mt-8 border-2 border-green-500 text-green-500 font-bold uppercase text-xs inline-block px-4 py-1 rounded rotate-[-10deg] opacity-80">
                        Verified by Dr. Anita
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-12 pt-6 border-t border-gray-100">
                  <p>Generated electronically by MedAssist AI.</p>
                  <p>This is a simulated document for demonstration purposes.</p>
                  <p className="mt-2 font-mono opacity-50">GSTIN: 10AAAAA0000A1Z5</p>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button 
                onClick={closePreview}
                className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={downloadFile}
                className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors flex items-center shadow-lg shadow-teal-200 dark:shadow-none"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;