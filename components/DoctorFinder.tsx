
import React, { useState, useEffect } from 'react';
import { searchDoctors } from '../services/geminiService';
import { DoctorSearchResult } from '../types';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import PaymentModal from './PaymentModal';
// Leaflet CSS is loaded in index.html

const biharDistricts = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", 
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", 
  "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", 
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

// Helper to simulate slot data based on name (consistent random)
const getSlotsForDoctor = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const totalSlots = 10 + (hash % 11); // 10 to 20 slots
  const bookedSlots = hash % (totalSlots + 1); // 0 to totalSlots
  return { totalSlots, bookedSlots, isFull: bookedSlots >= totalSlots };
};

const VERIFIED_LOCAL_DATA: Record<string, Array<{title: string, uri: string, location: {lat: number, lng: number}, verified: boolean}>> = {
  "Sultanganj": [
    {
      title: "Referral Hospital Sultanganj",
      uri: "https://www.google.com/maps/search/Referral+Hospital+Sultanganj",
      location: { lat: 25.2428, lng: 86.7345 },
      verified: true
    },
    {
      title: "Sultanganj Primary Health Centre",
      uri: "https://www.google.com/maps/search/Sultanganj+PHC",
      location: { lat: 25.2395, lng: 86.7392 },
      verified: true
    },
    {
      title: "Maa Tara Medical & Clinic",
      uri: "https://www.google.com/maps/search/Maa+Tara+Medical+Sultanganj",
      location: { lat: 25.2450, lng: 86.7310 },
      verified: true
    }
  ]
};

const specialties = [
  "General Physician", "Cardiologist", "Dentist", "Dermatologist", 
  "Gynecologist", "Pediatrician", "Orthopedic", "ENT Specialist", 
  "Neurologist", "Psychiatrist"
];

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

  const [bookingDoctor, setBookingDoctor] = useState<{title: string, uri: string} | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const consultationFee = 500;

  const handleSearch = async () => {
    setIsLoading(true);
    setResult(null);
    setErrorType(null);
    const searchSpecialty = customSpecialty.trim() || specialty;
    
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
      if (error?.message?.includes('Requested entity was not found') || error?.status === 'NOT_FOUND' || (typeof error === 'string' && error.includes('404'))) {
        setErrorType('404');
      } else {
        setErrorType('other');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenKeySelection = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
    handleSearch();
  };

  const initiateBooking = (place: {title: string, uri: string}) => {
    const slots = getSlotsForDoctor(place.title);
    if (slots.isFull) return; // Guard for full slots

    setBookingDoctor(place);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingTime('10:00');
  };

  const handleProceedToPay = () => {
    if (bookingDoctor && bookingDate && bookingTime) {
      setIsPaymentOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    if (bookingDoctor && onBookAppointment) {
      onBookAppointment(bookingDoctor.title, bookingDate, bookingTime, consultationFee);
    }
    setBookingDoctor(null);
  };

  const center: [number, number] = 
    result?.places?.find(p => p.location)?.location 
      ? [result.places.find(p => p.location)!.location!.lat, result.places.find(p => p.location)!.location!.lng]
      : (districtCoords[district] || districtCoords["Default"]);

  const hasLocations = result?.places?.some(p => p.location);

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50 dark:bg-gray-900 max-h-[calc(100vh-80px)] md:max-h-screen">
      <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Appointment System</h1>
          <p className="text-gray-500 dark:text-gray-400">Check availability and book appointments in {district}.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City / District</label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white"
                  >
                    {biharDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
                  <select 
                    value={specialty}
                    onChange={(e) => {
                      setSpecialty(e.target.value);
                      setCustomSpecialty('');
                    }}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white"
                  >
                    {specialties.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                {specialty === 'Other' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specify</label>
                    <input 
                      type="text"
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      placeholder="e.g. Urologist"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white"
                    />
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center ${
                    isLoading
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center"><div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2"></div>Searching...</div>
                  ) : (
                    'Check Availability'
                  )}
                </button>
              </div>
            </div>

            {result && result.places.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 px-1 flex justify-between items-center">
                  <span>Results in {district}</span>
                  <span className="text-[10px] font-normal text-gray-400">Slots refresh daily</span>
                </h3>
                {result.places.map((place: any, idx) => {
                  const slots = getSlotsForDoctor(place.title);
                  return (
                    <div 
                      key={idx}
                      className={`flex flex-col p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all group ${place.verified ? 'border-teal-500/30' : 'border-gray-200 dark:border-gray-700'} hover:shadow-md`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 mb-1">
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{place.title}</h4>
                             {place.verified && <svg className="w-3.5 h-3.5 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                          </div>
                          <a href={place.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">View Map</a>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${slots.isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                           {slots.isFull ? 'FULL' : 'VACANT'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Today's Slots</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-lg font-black ${slots.isFull ? 'text-red-500' : 'text-teal-600'}`}>
                              {slots.totalSlots - slots.bookedSlots}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium pt-1">/ {slots.totalSlots} left</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Fee</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">₹500</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => initiateBooking(place)}
                        disabled={slots.isFull}
                        className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                          slots.isFull 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                        }`}
                      >
                        {slots.isFull ? 'No Slots Left' : 'Book Appointment'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[450px] z-0 relative">
              {/* FIX: MapContainer props fixed by removing center/zoom and using MapUpdater helper */}
              <MapContainer 
                style={{ height: '100%', width: '100%' }}
              >
                <MapUpdater center={center} zoom={14} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {hasLocations && result?.places.filter(p => p.location).map((place: any, idx) => {
                    const slots = getSlotsForDoctor(place.title);
                    return (
                      <CircleMarker 
                        key={idx}
                        center={[place.location!.lat, place.location!.lng]}
                        radius={place.verified ? 12 : 10}
                        pathOptions={{ 
                          color: slots.isFull ? '#ef4444' : '#0d9488', 
                          fillColor: slots.isFull ? '#ef4444' : '#0d9488', 
                          fillOpacity: 0.6 
                        }}
                      >
                        <Popup>
                          <div className="text-center p-1">
                            <strong className="block text-sm font-bold text-gray-900 mb-1">{place.title}</strong>
                            <div className={`mb-3 py-1 rounded text-[10px] font-black uppercase ${slots.isFull ? 'text-red-600' : 'text-teal-600'}`}>
                              {slots.isFull ? 'Status: Full' : `Available: ${slots.totalSlots - slots.bookedSlots} slots`}
                            </div>
                            {!slots.isFull && (
                              <button 
                                onClick={() => initiateBooking(place)}
                                className="w-full bg-teal-600 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-teal-700 transition-colors mb-2"
                              >
                                BOOK NOW
                              </button>
                            )}
                            <a href={place.uri} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 hover:underline block font-medium">Google Maps</a>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                })}
              </MapContainer>
            </div>

            {result && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Important Information</h3>
                </div>
                <div className="prose prose-teal dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300">
                  <p>Appointments are subject to real-time verification at the facility. We recommend arriving 15 minutes before your scheduled slot. For verified centers in <strong>{district}</strong>, digital prescriptions are available immediately after the visit.</p>
                  <div className="mt-4 flex gap-4 text-xs font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Vacant Slots</div>
                     <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Fully Booked</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {bookingDoctor && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Confirm Booking</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400">{bookingDoctor.title}</p>
               </div>
               <div className="bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-lg">
                  <p className="text-[10px] font-bold text-teal-600 uppercase">Consultation</p>
                  <p className="text-lg font-black text-teal-700 dark:text-teal-400">₹500</p>
               </div>
            </div>
            
            <div className="space-y-4 mb-8 mt-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white font-bold" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                   {['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'].map(t => (
                     <button 
                       key={t}
                       onClick={() => setBookingTime(t)}
                       className={`py-2 rounded-lg text-xs font-bold transition-all ${bookingTime === t ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setBookingDoctor(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleProceedToPay}
                className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-200"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={consultationFee}
        title="Pay Consultation Fee"
      />
    </div>
  );
};

export default DoctorFinder;
