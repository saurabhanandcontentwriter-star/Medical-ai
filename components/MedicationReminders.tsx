
import React, { useState } from 'react';
import { MedicationReminder } from '../types';

interface MedicationRemindersProps {
  reminders: MedicationReminder[];
  onUpdateReminders: (reminders: MedicationReminder[]) => void;
}

const MedicationReminders: React.FC<MedicationRemindersProps> = ({ reminders, onUpdateReminders }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '1 Tablet',
    time: '08:00',
    type: 'pill' as 'pill' | 'syrup' | 'injection' | 'topical'
  });

  const handleAddMed = () => {
    if (!newMed.name) return;
    const med: MedicationReminder = {
      id: Date.now().toString(),
      ...newMed,
      isTakenToday: false
    };
    onUpdateReminders([...reminders, med]);
    setIsAddModalOpen(false);
    setNewMed({ name: '', dosage: '1 Tablet', time: '08:00', type: 'pill' });
  };

  const toggleTaken = (id: string) => {
    const today = new Date().toDateString();
    const updated = reminders.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          isTakenToday: !r.isTakenToday,
          lastTakenDate: !r.isTakenToday ? today : r.lastTakenDate
        };
      }
      return r;
    });
    onUpdateReminders(updated);
  };

  const deleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter(r => r.id !== id));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pill': return '💊';
      case 'syrup': return '🧪';
      case 'injection': return '💉';
      case 'topical': return '🧴';
      default: return '💊';
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.time.localeCompare(b.time) 
      : b.time.localeCompare(a.time);
  });

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescription Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your daily medication schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          {reminders.length > 0 && (
            <button 
              onClick={toggleSortOrder}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              title={`Sort by time: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              {sortOrder === 'asc' ? 'Earliest' : 'Latest'}
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 dark:shadow-none flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Med
          </button>
        </div>
      </header>

      <div className="grid gap-4">
        {reminders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💊</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Prescriptions Logged</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">Add your medications to receive reminders and track your daily health goals.</p>
          </div>
        ) : (
          sortedReminders.map(med => (
            <div 
              key={med.id} 
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                med.isTakenToday 
                  ? 'bg-teal-50/50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800' 
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${med.isTakenToday ? 'grayscale opacity-50' : ''}`}>
                  {getTypeIcon(med.type)}
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${med.isTakenToday ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {med.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {med.time} • {med.dosage}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => toggleTaken(med.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    med.isTakenToday 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                  }`}
                >
                  {med.isTakenToday ? 'Taken' : 'Take Now'}
                </button>
                <button 
                  onClick={() => deleteReminder(med.id)}
                  className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Add Prescription</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Medication Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newMed.name}
                  onChange={e => setNewMed({...newMed, name: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white font-bold" 
                  placeholder="e.g. Paracetamol"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Time</label>
                  <input 
                    type="time" 
                    value={newMed.time}
                    onChange={e => setNewMed({...newMed, time: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Dosage</label>
                  <input 
                    type="text" 
                    value={newMed.dosage}
                    onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white font-bold" 
                    placeholder="1 Tablet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'pill', label: 'Pill', icon: '💊' },
                    { id: 'syrup', label: 'Liquid', icon: '🧪' },
                    { id: 'injection', label: 'Inject', icon: '💉' },
                    { id: 'topical', label: 'Cream', icon: '🧴' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setNewMed({...newMed, type: t.id as any})}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all ${newMed.type === t.id ? 'bg-teal-50 border-teal-500 dark:bg-teal-900/30' : 'bg-gray-50 dark:bg-gray-700 border-transparent'}`}
                    >
                      <span className="text-xl mb-1">{t.icon}</span>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddMed}
              className="w-full mt-8 bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 dark:shadow-none"
            >
              Add Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReminders;
