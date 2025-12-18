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
  "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
];

// Approximate center coords for Bihar districts for fallback map centering
const districtCoords: Record<string, [number, number]> = {
  "Patna": [25.5941, 85.1376],
  "Gaya": [24.7914, 85.0002],
  "Muzaffarpur": [26.1209, 85.3647],
  "Bhagalpur": [25.2425, 87.0117],
  "Darbhanga": [26.1542, 85.8918],
  "Purnia": [25.7711, 87.4822],
  "Begusarai": [25.4182, 86.1272],
  "Arrah": [25.5560, 84.6603], // Bhojpur HQ
  "Bhojpur": [25.5560, 84.6603],
  "Bihar Sharif": [25.1982, 85.5149], // Nalanda HQ
  "Nalanda": [25.1982, 85.5149],
  // Default fallback for others: Center of Bihar
  "Default": [25.0961, 85.3131]
};

const specialties = [
  "General Physician", "Cardiologist", "Dentist", "Dermatologist", 
  "Gynecologist", "Pediatrician", "Orthopedic", "ENT Specialist", 
  "Neurologist", "Psychiatrist"
];

// Helper to update map view when results change
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
  const [district, setDistrict] = useState('Patna');
  const [specialty, setSpecialty] = useState('General Physician');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DoctorSearchResult | null>(null);

  // Booking State
  const [bookingDoctor, setBookingDoctor] = useState<{title: string, uri: string} | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const consultationFee = 500;

  const handleSearch = async () => {
    setIsLoading(true);
    setResult(null);
    const searchSpecialty = customSpecialty.trim() || specialty;
    
    try {
      const data = await searchDoctors(district, searchSpecialty);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateBooking = (place: {title: string, uri: string}) => {
    setBookingDoctor(place);
    // Default to tomorrow
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

  // Determine map center
  const center: [number, number] = 
    result?.places?.find(p => p.location)?.location 
      ? [result.places.find(p => p.location)!.location!.lat, result.places.find(p => p.location)!.location!.lng]
      : (districtCoords[district] || districtCoords["Default"]);

  const hasLocations = result?.places?.some(p => p.location);

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50 dark:bg-gray-900 max-h-[calc(100vh-80px)] md:max-h-screen">
      <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Doctors in Bihar</h1>
          <p className="text-gray-500 dark:text-gray-400">Connect with medical specialists across all districts of Bihar.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">District</label>
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
                    <>
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    'Find Doctors'
                  )}
                </button>
              </div>
            </div>

            {/* Results List */}
            {result && result.places.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 px-1">Verified Locations</h3>
                {result.places.map((place, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start mb-3">
                      <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 text-sm mb-1">{place.title}</h4>
                        <a href={place.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:underline">View on Google Maps</a>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => initiateBooking(place)}
                      className="w-full py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-lg hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map and Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[400px] z-0 relative dark:invert dark:hue-rotate-180">
              <MapContainer 
                center={center} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <MapUpdater center={center} zoom={12} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {hasLocations ? (
                  result?.places.filter(p => p.location).map((place, idx) => (
                    <CircleMarker 
                      key={idx}
                      center={[place.location!.lat, place.location!.lng]}
                      radius={10}
                      pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 0.6 }}
                      eventHandlers={{
                        click: () => {
                           // Optional: Center map or open popup logic if needed
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-center dark:invert dark:hue-rotate-180">
                          <strong className="block text-sm font-bold text-gray-800 mb-2">{place.title}</strong>
                          <button 
                            onClick={() => initiateBooking(place)}
                            className="w-full bg-teal-600 text-white text-xs px-3 py-1.5 rounded hover:bg-teal-700 transition-colors mb-2"
                          >
                            Book Appointment
                          </button>
                          <a href={place.uri} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:underline block">Google Maps</a>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))
                ) : (
                  // Fallback marker for center if no specific results with coords
                  <CircleMarker 
                    center={center} 
                    radius={8}
                    pathOptions={{ color: '#94a3b8', fillColor: '#cbd5e1', fillOpacity: 0.5 }}
                  >
                    <Popup>
                      <span className="text-xs text-gray-600 dark:text-gray-900">{district} (Center)</span>
                    </Popup>
                  </CircleMarker>
                )}
              </MapContainer>
              
              {!hasLocations && result && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-gray-600 shadow-sm z-[400] border border-gray-200 dark:invert dark:hue-rotate-180">
                  Showing general area. Exact coordinates unavailable.
                </div>
              )}
            </div>

            {/* AI Summary */}
            {result && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
                </div>
                <div className="prose prose-teal dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {result.text}
                </div>
              </div>
            )}

            {!result && !isLoading && (
              <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center text-gray-400 dark:text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>Select a district and specialty to see doctors on the map.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Appointment</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Schedule a visit with <strong>{bookingDoctor.title}</strong>.</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl space-y-2 border border-teal-100 dark:border-teal-800">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Consultation Fee</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">₹{consultationFee}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Time</label>
                <input 
                  type="time" 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white" 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setBookingDoctor(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleProceedToPay}
                disabled={!bookingDate || !bookingTime}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Pay
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
        amount={consultationFee}
        title="Pay Consultation Fee"
      />
    </div>
  );
};

export default DoctorFinder;