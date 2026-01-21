
import React, { useState } from 'react';

type AdminTab = 'dashboard' | 'orders' | 'inventory' | 'users';
type ModalType = 'product' | 'user' | 'report' | 'appointment' | 'refund_list' | null;

interface RefundRequest {
  id: string;
  customer: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // Report Form State
  const [reportType, setReportType] = useState('Sales Report');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-07-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<string | null>(null);

  // Refund State
  const [refunds, setRefunds] = useState<RefundRequest[]>([
    { id: 'ORD-2982', customer: 'Priya Patel', reason: 'Incorrect Item', amount: 499, status: 'pending' },
    { id: 'ORD-3015', customer: 'Arjun Mehra', reason: 'Damaged Product', amount: 1250, status: 'pending' }
  ]);

  // Mock Data
  const recentOrders = [
    { id: 'ORD-2983', customer: 'Rahul Sharma', items: 'Metformin, Atorvastatin', amount: 450, status: 'Processing', date: 'Oct 24, 2023' },
    { id: 'ORD-2982', customer: 'Priya Patel', items: 'Thyroid Profile Test', amount: 499, status: 'Refund Pending', date: 'Oct 24, 2023' },
    { id: 'ORD-2981', customer: 'Amit Kumar', items: 'Vitamin C, Zinc', amount: 120, status: 'Shipped', date: 'Oct 23, 2023' },
    { id: 'ORD-2980', customer: 'Sneha Gupta', items: 'Full Body Checkup', amount: 1499, status: 'Scheduled', date: 'Oct 23, 2023' },
    { id: 'ORD-2979', customer: 'Vikram Singh', items: 'Protein Powder', amount: 1499, status: 'Delivered', date: 'Oct 22, 2023' },
  ];

  const stats = [
    { label: 'Total Revenue', value: '₹1.2L', change: '+12%', icon: '💰', color: 'bg-green-100 text-green-700' },
    { label: 'Active Orders', value: '24', change: '+5', icon: '📦', color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending Tests', value: '12', change: '-2', icon: '🔬', color: 'bg-purple-100 text-purple-700' },
    { label: 'Total Users', value: '1,840', change: '+24', icon: '👥', color: 'bg-orange-100 text-orange-700' },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setGeneratedFile(null);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedFile(`Report_${reportType.replace(/\s+/g, '_')}_${startDate}.pdf`);
    }, 2000);
  };

  const handleRefundAction = (id: string, action: 'approved' | 'rejected') => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    // In a real app, you'd call an API here
    setTimeout(() => {
        setRefunds(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'report':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-0 focus:border-teal-500"
              >
                <option>Sales Report</option>
                <option>Inventory Analysis</option>
                <option>User Growth Report</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold" />
              </div>
            </div>
            <button 
              onClick={handleGenerateReport}
              className="w-full bg-[#0d645f] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest border-2 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              Generate Report
            </button>
          </div>
        );
      case 'refund_list':
        return (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Pending refund requests from customers.</p>
            <div className="space-y-4">
              {refunds.filter(r => r.status === 'pending').length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-2">✨</div>
                  <p className="text-sm font-bold text-slate-400">All refunds processed!</p>
                </div>
              ) : (
                refunds.filter(r => r.status === 'pending').map((refund) => (
                  <div key={refund.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-bottom-2">
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-slate-900 tracking-tight text-lg">{refund.id} - {refund.customer}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Reason: {refund.reason} • <span className="text-slate-900">₹{refund.amount}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleRefundAction(refund.id, 'approved')}
                        className="px-6 py-2.5 bg-[#0d645f] text-white text-xs font-black uppercase tracking-widest rounded-xl border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRefundAction(refund.id, 'rejected')}
                        className="px-6 py-2.5 bg-[#e2e8f0] text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all border-2 border-transparent"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return <div className="p-8 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Coming Soon</div>;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'report': return 'GENERATE REPORT';
      case 'refund_list': return 'PROCESS REFUNDS';
      case 'product': return 'ADD NEW PRODUCT';
      case 'appointment': return 'MANUAL APPOINTMENT';
      default: return 'ADMIN ACTION';
    }
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full h-full bg-slate-50 dark:bg-gray-900 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-gray-400 font-medium">System overview and management portal.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</h3>
              <p className="text-[10px] text-green-600 font-bold mt-2">{stat.change} this week</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${stat.color}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Recent Orders</h3>
              <button className="text-[10px] font-black text-[#0d645f] uppercase tracking-widest px-4 py-1 rounded-lg border-2 border-black bg-white dark:bg-gray-800 hover:bg-slate-50 transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none">
                VIEW ALL LOGS
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 dark:bg-gray-700 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-5">ID</th>
                    <th className="px-8 py-5">Customer</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{order.id}</td>
                      <td className="px-8 py-5 text-slate-600 dark:text-gray-300 font-bold">{order.customer}</td>
                      <td className="px-8 py-5 text-slate-900 dark:text-white font-black">₹{order.amount}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          order.status.includes('Refund') ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar matched exactly to request visual */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-700 p-8 h-fit">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xs mb-8 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#0d645f] rounded-full"></div>
            Admin Actions
          </h3>
          <div className="space-y-4">
            <button 
              onClick={() => setActiveModal('product')}
              className="w-full flex items-center p-4 bg-slate-50/50 dark:bg-gray-700/50 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-3xl transition-all group border border-transparent hover:border-slate-100"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 text-lg font-bold group-hover:scale-110 transition-transform shadow-sm">+</div>
              <span className="text-sm font-black text-slate-700 dark:text-gray-200 tracking-tight">Add New Product</span>
            </button>
            
            <button 
              onClick={() => setActiveModal('report')}
              className="w-full flex items-center p-4 bg-slate-50/50 dark:bg-gray-700/50 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-3xl transition-all group border border-transparent hover:border-slate-100"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-gray-200 tracking-tight">Generate PDF Report</span>
            </button>

            <button 
              onClick={() => setActiveModal('refund_list')}
              className="w-full flex items-center p-4 bg-slate-50/50 dark:bg-gray-700/50 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-3xl transition-all group border border-transparent hover:border-slate-100"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-gray-200 tracking-tight">Refund Process</span>
            </button>

            <button 
              onClick={() => setActiveModal('appointment')}
              className="w-full flex items-center p-4 bg-slate-50/50 dark:bg-gray-700/50 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-3xl transition-all group border border-transparent hover:border-slate-100"
            >
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-gray-200 tracking-tight">Manual Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-700">
            <div className="p-8 border-b border-slate-50 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">{getModalTitle()}</h3>
              <button 
                onClick={() => { setActiveModal(null); setIsGenerating(false); setGeneratedFile(null); }} 
                className="text-slate-400 hover:text-slate-600 transition-all bg-slate-100 dark:bg-gray-700 p-2.5 rounded-full hover:rotate-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8">
              {isGenerating ? (
                <div className="py-16 text-center space-y-8">
                  <div className="relative">
                    <div className="w-24 h-24 border-[6px] border-slate-100 border-t-[#0d645f] rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] text-xs">Compiling System Data</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Applying filters and security checks...</p>
                  </div>
                </div>
              ) : generatedFile ? (
                <div className="py-8 text-center space-y-10 animate-in zoom-in duration-300">
                  <div className="w-28 h-28 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl shadow-sm border-2 border-green-100 animate-bounce">✓</div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">System Report Ready</h4>
                    <p className="text-xs text-slate-400 font-black uppercase mt-3 tracking-widest">{generatedFile}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const element = document.createElement("a");
                      const fileContent = "MedAssist Admin Export Data";
                      const file = new Blob([fileContent], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = generatedFile;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      setActiveModal(null);
                    }}
                    className="w-full bg-[#0d645f] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] border-2 border-black shadow-[0_5px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF Document
                  </button>
                </div>
              ) : (
                renderModalContent()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
