
import React, { useState } from 'react';

type AdminTab = 'dashboard' | 'orders' | 'colleges' | 'users';
type ModalType = 'product' | 'user' | 'report' | 'appointment' | 'refund_list' | 'add_college' | 'edit_college' | null;

interface RefundRequest {
  id: string;
  customer: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface CollegeEntry {
  id: string;
  name: string;
  seats: number;
  status: 'Verified' | 'Pending';
  fee: string;
  location: string;
  type: 'Government' | 'Private';
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('colleges');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // Reactive Order Stream State
  const [ordersList, setOrdersList] = useState([
    { id: 'ORD-2983', customer: 'Rahul Sharma', items: 'Metformin, Atorvastatin', amount: 450, status: 'Processing', date: 'Oct 24, 2023' },
    { id: 'ORD-2982', customer: 'Priya Patel', items: 'Thyroid Profile Test', amount: 499, status: 'Refund Pending', date: 'Oct 24, 2023' },
    { id: 'ORD-2981', customer: 'Amit Kumar', items: 'Vitamin C, Zinc', amount: 120, status: 'Shipped', date: 'Oct 23, 2023' },
    { id: 'ORD-2980', customer: 'Sneha Gupta', items: 'Full Body Checkup', amount: 1499, status: 'Scheduled', date: 'Oct 23, 2023' },
  ]);

  // STATEFUL INSTITUTION REGISTRY
  const [adminColleges, setAdminColleges] = useState<CollegeEntry[]>([
    { id: '1', name: 'PMCH PATNA', seats: 200, status: 'Verified', fee: '6.1k', location: 'PATNA', type: 'Government' },
    { id: '2', name: 'AIIMS PATNA', seats: 125, status: 'Verified', fee: '5.8k', location: 'PATNA', type: 'Government' },
    { id: '3', name: 'KMC KATIHAR', seats: 150, status: 'Verified', fee: '9.3L', location: 'KATIHAR', type: 'Private' },
    { id: '4', name: 'VIMS PAWAPURI', seats: 120, status: 'Pending', fee: '6.0k', location: 'PAWAPURI', type: 'Government' },
  ]);

  // Form State for Adding/Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [collegeForm, setCollegeForm] = useState({
    name: '',
    location: '',
    type: 'Government' as 'Government' | 'Private',
    seats: 0,
    fee: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(false);

  // Refund State
  const [refunds, setRefunds] = useState<RefundRequest[]>([
    { id: 'ORD-2982', customer: 'Priya Patel', reason: 'Incorrect Item', amount: 499, status: 'pending' },
    { id: 'ORD-3015', customer: 'Arjun Mehra', reason: 'Damaged Product', amount: 1250, status: 'pending' }
  ]);

  const stats = [
    { label: 'Total Revenue', value: '₹1.2L', change: '+12%', icon: '💰', color: 'bg-green-100 text-green-700' },
    { label: 'Active Orders', value: ordersList.length.toString(), change: '+5', icon: '📦', color: 'bg-blue-100 text-blue-700' },
    { label: 'Institutions', value: adminColleges.length.toString(), change: '+2', icon: '🏫', color: 'bg-teal-100 text-teal-700' },
    { label: 'Total Users', value: '1,840', change: '+24', icon: '👥', color: 'bg-orange-100 text-orange-700' },
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setCollegeForm({ name: '', location: '', type: 'Government', seats: 150, fee: '' });
    setOperationSuccess(false);
    setActiveModal('add_college');
  };

  const handleOpenEdit = (college: CollegeEntry) => {
    setEditingId(college.id);
    setCollegeForm({
      name: college.name,
      location: college.location,
      type: college.type,
      seats: college.seats,
      fee: college.fee
    });
    setOperationSuccess(false);
    setActiveModal('edit_college');
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this institution from registry?")) {
      setAdminColleges(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveCollege = () => {
    if (!collegeForm.name || !collegeForm.location) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      if (editingId) {
        // UPDATE EXISTING
        setAdminColleges(prev => prev.map(c => 
          c.id === editingId 
            ? { ...c, ...collegeForm, status: 'Verified' as const } 
            : c
        ));
      } else {
        // CREATE NEW
        const newEntry: CollegeEntry = {
          id: Date.now().toString(),
          name: collegeForm.name.toUpperCase(),
          location: collegeForm.location.toUpperCase(),
          seats: collegeForm.seats,
          type: collegeForm.type,
          fee: collegeForm.fee,
          status: 'Pending'
        };
        setAdminColleges(prev => [...prev, newEntry]);
      }
      setIsGenerating(false);
      setOperationSuccess(true);
      setTimeout(() => setActiveModal(null), 1000);
    }, 1200);
  };

  const handleRefundAction = (id: string, action: 'approved' | 'rejected') => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    if (action === 'approved') {
      setOrdersList(prev => prev.map(order => 
        order.id === id ? { ...order, status: 'Confirmed' } : order
      ));
    }
    setTimeout(() => {
        setRefunds(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  const renderModalContent = () => {
    if (operationSuccess) {
      return (
        <div className="py-12 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">✓</div>
           <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Registry Updated</h4>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Changes are now live</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Institution Name</label>
            <input 
              type="text" 
              value={collegeForm.name}
              onChange={(e) => setCollegeForm({...collegeForm, name: e.target.value})}
              placeholder="e.g. Nalanda Medical College" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">City</label>
            <input 
              type="text" 
              value={collegeForm.location}
              onChange={(e) => setCollegeForm({...collegeForm, location: e.target.value})}
              placeholder="Patna" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Type</label>
            <select 
              value={collegeForm.type}
              onChange={(e) => setCollegeForm({...collegeForm, type: e.target.value as any})}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 transition-all outline-none"
            >
               <option value="Government">Government</option>
               <option value="Private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">MBBS Seats</label>
            <input 
              type="number" 
              value={collegeForm.seats}
              onChange={(e) => setCollegeForm({...collegeForm, seats: parseInt(e.target.value)})}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Annual Fee</label>
            <input 
              type="text" 
              value={collegeForm.fee}
              onChange={(e) => setCollegeForm({...collegeForm, fee: e.target.value})}
              placeholder="₹6,000" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 transition-all outline-none" 
            />
          </div>
        </div>
        <button 
          onClick={handleSaveCollege}
          disabled={isGenerating}
          className="w-full bg-[#0d9488] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isGenerating ? 'Updating Registry...' : editingId ? 'Apply Changes & Verify' : 'Add to Global Index'}
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full h-full bg-slate-50 dark:bg-gray-900 overflow-y-auto scrollbar-hide">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium">System management console.</p>
        </div>
        
        <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
           {[
             { id: 'dashboard', label: 'Overview', icon: '📊' },
             { id: 'colleges', label: 'Institutions', icon: '🏫' },
             { id: 'orders', label: 'Operations', icon: '⚙️' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as AdminTab)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#0d645f] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
             >
               <span>{tab.icon}</span> {tab.label}
             </button>
           ))}
        </div>
      </header>

      {/* Registry Tab Content */}
      {activeTab === 'colleges' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
               <div className="p-8 border-b border-slate-50 dark:border-gray-700 flex justify-between items-center bg-teal-50/10">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">Institution Registry</h3>
                  <span className="bg-teal-600 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Global Index</span>
               </div>
               
               <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminColleges.map((c) => (
                    <div key={c.id} className="p-8 bg-slate-50/50 dark:bg-gray-700/50 rounded-[2.5rem] border-2 border-transparent hover:border-teal-500 transition-all flex flex-col group">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl mb-1">{c.name}</h4>
                             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">{c.location} • {c.seats} MBBS SEATS</p>
                          </div>
                          <div className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${c.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                             {c.status}
                          </div>
                       </div>
                       
                       <div className="flex gap-2 mt-auto">
                          <button 
                            onClick={() => handleOpenEdit(c)}
                            className="flex-1 py-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-teal-600 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className="px-5 py-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-700 p-8 h-fit">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xs mb-8 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#0d645f] rounded-full"></div>
                Admin Controls
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={handleOpenAdd}
                  className="w-full flex items-center p-5 bg-teal-50/50 dark:bg-teal-900/10 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-[2rem] transition-all group border-2 border-transparent hover:border-teal-500 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mr-4 text-2xl font-black group-hover:scale-110 transition-transform">🎓</div>
                  <div className="text-left">
                     <span className="block text-sm font-black text-slate-700 dark:text-gray-200 tracking-tight leading-none mb-1">Add Medical Institution</span>
                     <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Registry Update</span>
                  </div>
                </button>
                
                <button onClick={() => setActiveModal('report')} className="w-full flex items-center p-5 bg-slate-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-[2rem] transition-all group border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform">📄</div>
                  <span className="text-sm font-black text-slate-700 dark:text-gray-200 tracking-tight uppercase">System Report</span>
                </button>

                <button onClick={() => setActiveModal('refund_list')} className="w-full flex items-center p-5 bg-slate-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-[2rem] transition-all group border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">↩️</div>
                  <span className="text-sm font-black text-slate-700 dark:text-gray-200 tracking-tight uppercase">Refund Queue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Engine */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-gray-700">
            <div className="p-8 border-b border-slate-50 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">
                {activeModal === 'add_college' ? 'ADD INSTITUTION' : activeModal === 'edit_college' ? 'EDIT PROFILE' : 'ADMIN ACTION'}
              </h3>
              <button 
                onClick={() => { setActiveModal(null); setOperationSuccess(false); }} 
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
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] text-xs">Securing Entry Data</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Validating credentials and server link...</p>
                  </div>
                </div>
              ) : renderModalContent()}
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB Content (Partial for Context) */}
      {activeTab === 'dashboard' && (
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Live Order Stream</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-gray-700 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">ID</th>
                  <th className="px-8 py-5">Patient</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                {ordersList.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{order.id}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-gray-300 font-bold">{order.customer}</td>
                    <td className="px-8 py-5 text-slate-900 dark:text-white font-black">₹{order.amount}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        order.status === 'Confirmed' ? 'bg-teal-100 text-teal-700' :
                        order.status.includes('Refund') ? 'bg-rose-100 text-rose-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
