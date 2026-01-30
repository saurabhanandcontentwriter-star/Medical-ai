
import React, { useState, useEffect, useRef } from 'react';
import { searchDoctors } from '../services/geminiService';
import { DoctorSearchResult } from '../types';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import PaymentModal from './PaymentModal';

const biharDistricts = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", 
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", 
  "Katihar", "Khagaria", "Kishanjganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", 
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", 
  "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Sultanganj", "Supaul", "Vaishali", "West Champaran"
];

const districtCoords: Record<string, [number, number]> = {
  "Patna": [25.5941, 85.1376],
  "Gaya": [24.7914, 85.0002],
  "Muzaffarpur": [26.1209, 85.3647],
  "Bhagalpur": [25.2425, 87.0117],
  "Darbhanga": [26.1542, 85.8918],
  "Purnia": [25.7711, 87.4822],
  "Begusarai": [25.4182, 86.1272],
  "Bhojpur": [25.5560, 84.6603],
  "Nalanda": [25.1982, 85.5149],
  "Sultanganj": [25.2415, 86.7371],
  "Default": [25.0961, 85.3131]
};

const getSlotsForDoctor = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const totalSlots = 10 + (hash % 11);
  const bookedSlots = hash % (totalSlots + 1);
  return { totalSlots, bookedSlots, isFull: bookedSlots >= totalSlots };
};

const VERIFIED_LOCAL_DATA: Record<string, Array<{title: string, uri: string, location: {lat: number, lng: number}, verified: boolean}>> = {
  "Sultanganj": [
    { title: "Referral Hospital Sultanganj", uri: "https://www.google.com/maps/search/Referral+Hospital+Sultanganj", location: { lat: 25.2428, lng: 86.7345 }, verified: true },
    { title: "Sultanganj Primary Health Centre", uri: "https://www.google.com/maps/search/Sultanganj+PHC", location: { lat: 25.2395, lng: 86.7392 }, verified: true },
    { title: "Maa Tara Medical & Clinic", uri: "https://www.google.com/maps/search/Maa+Tara+Medical+Sultanganj", location: { lat: 25.2450, lng: 86.7310 }, verified: true }
  ]
};

const specialties = ["General Physician", "Cardiologist", "Dentist", "Dermatologist", "Gynecologist", "Pediatrician", "Orthopedic", "ENT Specialist", "Neurologist", "Psychiatrist"];

const MapUpdater: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface DoctorFinderProps {
  onBookAppointment: (doctorName: string, date: string, time: string, amount: number) => void;
}

const DoctorFinder: React.FC<DoctorFinderProps> = ({ onBookAppointment }) => {
  const [district, setDistrict] = useState('Sultanganj');
  const [specialty, setSpecialty] = useState('General Physician');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DoctorSearchResult | null>(null);
  const [errorType, setErrorType] = useState<'404' | 'other' | null>(null);

  // Search Pop State
  const [isSearchPopOpen, setIsSearchPopOpen] = useState(false);
  const [searchPopQuery, setSearchPopQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [bookingDoctor, setBookingDoctor] = useState<{title: string, uri: string} | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const consultationFee = 500;

  const handleSearch = async (overrideSpecialty?: string) => {
    setIsLoading(true);
    setResult(null);
    setErrorType(null);
    const searchSpecialty = overrideSpecialty || customSpecialty.trim() || specialty;
    
    try {
      const data = await searchDoctors(district, searchSpecialty);
      if (district === 'Sultanganj') {
        const verified = VERIFIED_LOCAL_DATA["Sultanganj"];
        const mergedPlaces = [...verified, ...data.places.filter(p => !verified.some(v => v.title.toLowerCase().includes(p.title.toLowerCase())))];
        setResult({ ...data, places: mergedPlaces });
      } else {
        setResult(data);
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      setErrorType(error?.status === 'NOT_FOUND' ? '404' : 'other');
    } finally {
      setIsLoading(false);
      setIsSearchPopOpen(false);
    }
  };

  const initiateBooking = (place: {title: string, uri: string}) => {
    const slots = getSlotsForDoctor(place.title);
    if (slots.isFull) return;
    setBookingDoctor(place);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingTime('10:00');
  };

  const handleProceedToPay = () => {
    if (bookingDoctor && bookingDate && bookingTime) setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    if (bookingDoctor) onBookAppointment(bookingDoctor.title, bookingDate, bookingTime, consultationFee);
    setBookingDoctor(null);
  };

  const toggleSearchPop = () => {
    setIsSearchPopOpen(!isSearchPopOpen);
    if (!isSearchPopOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearchPop();
      }
      if (e.key === 'Escape') {
        setIsSearchPopOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const center: [number, number] = result?.places?.find(p => p.location)?.location 
      ? [result.places.find(p => p.location)!.location!.lat, result.places.find(p => p.location)!.location!.lng]
      : (districtCoords[district] || districtCoords["Default"]);

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50 dark:bg-gray-900 max-h-[calc(100vh-80px)] md:max-h-screen">
      <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Doctor Appointment System</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Check availability and book appointments in {district}.</p>
          </div>
          <button 
            onClick={toggleSearchPop}
            className="flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Search Doctors</span>
            <kbd className="hidden md:inline-flex items-center px-2 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] font-black text-gray-400 uppercase">CTRL K</kbd>
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h3 className="text-xs font-black text-teal-600 uppercase tracking-[0.2em] mb-6">Filter Settings</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / District</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white font-bold appearance-none transition-all">
                    {biharDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Medical Specialty</label>
                  <select value={specialty} onChange={(e) => { setSpecialty(e.target.value); setCustomSpecialty(''); }} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white font-bold appearance-none transition-all">
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>
                {specialty === 'Other' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specify Specialty</label>
                    <input type="text" value={customSpecialty} onChange={(e) => setCustomSpecialty(e.target.value)} placeholder="e.g. Urologist" className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white font-bold" />
                  </div>
                )}
                <button onClick={() => handleSearch()} disabled={isLoading} className="w-full py-5 rounded-2xl bg-teal-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-teal-100 dark:shadow-none hover:bg-teal-700 transition-all transform active:scale-95 disabled:opacity-50">
                  {isLoading ? 'Updating Feed...' : 'Sync Availability'}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
                      <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-xl w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-1/2 mb-6"></div>
                      <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl w-full"></div>
                   </div>
                 ))}
              </div>
            ) : result && result.places.length > 0 && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
                <div className="px-1 flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available in {district}</h3>
                  <span className="text-[10px] font-black text-teal-500 uppercase">{result.places.length} Facilities</span>
                </div>
                {result.places.map((place: any, idx) => {
                  const slots = getSlotsForDoctor(place.title);
                  return (
                    <div key={idx} className={`flex flex-col p-6 bg-white dark:bg-gray-800 rounded-[2rem] border transition-all group ${place.verified ? 'border-teal-500/20 bg-teal-50/5 dark:bg-teal-900/10' : 'border-gray-100 dark:border-gray-700'} hover:shadow-xl hover:scale-[1.02]`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-black text-gray-900 dark:text-white text-base truncate uppercase tracking-tight leading-tight">{place.title}</h4>
                             {place.verified && <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                          </div>
                          <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{specialty}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${slots.isFull ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>{slots.isFull ? 'BOOKED' : 'VACANT'}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Live Slots</p>
                          <div className="flex items-baseline gap-1"><span className={`text-xl font-black ${slots.isFull ? 'text-rose-500' : 'text-teal-600'}`}>{slots.totalSlots - slots.bookedSlots}</span><span className="text-[10px] text-gray-400 font-bold">/ {slots.totalSlots}</span></div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Clinic Fee</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">₹500</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a href={place.uri} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest text-center hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Locate
                        </a>
                        <button onClick={() => initiateBooking(place)} disabled={slots.isFull} className={`flex-[2] py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${slots.isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'}`}>
                          {slots.isFull ? 'Full' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[500px] z-0 relative group">
              <div className="absolute top-8 left-8 z-[20] flex flex-col gap-2">
                 <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/10">
                   <h3 className="text-sm font-black uppercase tracking-tighter text-teal-600">Geo-Mapping Active</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{district} Health Network</p>
                 </div>
              </div>
              
              <MapContainer style={{ height: '100%', width: '100%' }}>
                <MapUpdater center={center} zoom={14} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {result?.places.filter(p => p.location).map((place: any, idx) => {
                    const slots = getSlotsForDoctor(place.title);
                    return (
                      <CircleMarker key={idx} center={[place.location!.lat, place.location!.lng]} radius={place.verified ? 14 : 10} pathOptions={{ color: slots.isFull ? '#ef4444' : '#0d9488', fillColor: slots.isFull ? '#ef4444' : '#0d9488', fillOpacity: 0.6, weight: 3 }}>
                        <Popup>
                          <div className="text-center p-2 min-w-[150px]">
                            <strong className="block text-sm font-black text-gray-900 uppercase tracking-tight mb-2 leading-tight">{place.title}</strong>
                            <div className={`mb-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${slots.isFull ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
                              {slots.isFull ? 'FULLY BOOKED' : `${slots.totalSlots - slots.bookedSlots} SLOTS FREE`}
                            </div>
                            {!slots.isFull && <button onClick={() => initiateBooking(place)} className="w-full bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-teal-700 transition-all mb-3 shadow-lg shadow-teal-100">BOOK APPOINTMENT</button>}
                            <a href={place.uri} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 hover:underline block font-black uppercase tracking-widest">Open in Maps</a>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                })}
              </MapContainer>
            </div>
            
            {result && (
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-inner">📋</div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Clinical Guidelines</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verify your booking status at the reception upon arrival.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400"><span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span> Available</div>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Full</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Pop (Command Palette) */}
      {isSearchPopOpen && (
        <div className="fixed inset-0 z-[200] bg-teal-950/80 backdrop-blur-2xl flex items-start justify-center p-4 pt-20 md:pt-32 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-teal-500/20">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4 relative">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchPopQuery}
                onChange={(e) => setSearchPopQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchPopQuery)}
                placeholder="Find Cardiologists, Dentists, or Hospitals..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter placeholder-gray-300"
              />
              <button 
                onClick={() => setIsSearchPopOpen(false)}
                className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl text-gray-400 hover:text-rose-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
               <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Suggestions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Cardiologist', 'Dermatologist', 'Dentist', 'Emergency', 'AIIMS', 'General Physician'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => handleSearch(s)}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent hover:border-teal-500 hover:bg-white dark:hover:bg-gray-700 transition-all text-left group"
                      >
                         <p className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight group-hover:text-teal-600 transition-colors">{s}</p>
                         <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1">Search Now</p>
                      </button>
                    ))}
                  </div>
               </div>

               <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-[2rem] border-2 border-dashed border-teal-200 dark:border-teal-800">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Current Search Context</h5>
                    <span className="text-[10px] font-black text-teal-500 uppercase">{district}, Bihar</span>
                  </div>
                  <p className="text-xs font-bold text-teal-900 dark:text-teal-100 leading-relaxed italic opacity-70">
                    Your location is pinned to {district}. Results will be filtered to this area by default. Use the filters in the sidebar to change city.
                  </p>
               </div>

               <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">ENTER</kbd> to search</span>
                    <span className="flex items-center gap-1"><kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">ESC</kbd> to close</span>
                  </div>
                  <span className="text-teal-500">Search powered by MedAssist AI</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {bookingDoctor && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] max-w-md w-full p-8 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Confirm Booking</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px]">{bookingDoctor.title}</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/30 px-4 py-2 rounded-2xl flex flex-col items-end">
                <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">CONSULTATION</p>
                <p className="text-lg font-black text-teal-700 dark:text-teal-400">₹500</p>
              </div>
            </div>
            <div className="space-y-6 mb-10 mt-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Date</label>
                <input type="date" value={bookingDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setBookingDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white font-black uppercase tracking-widest text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'].map(t => (
                    <button key={t} onClick={() => setBookingTime(t)} className={`py-3 rounded-xl text-[10px] font-black transition-all ${bookingTime === t ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100'}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBookingDoctor(null)} className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleProceedToPay} className="flex-[2] bg-teal-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 dark:shadow-none">Proceed to Pay</button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={handlePaymentSuccess} amount={consultationFee} title="Pay Consultation Fee" />
    </div>
  );
};

export default DoctorFinder;
