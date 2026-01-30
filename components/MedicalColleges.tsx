
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MedicalCollege, Language } from '../types';

interface MedicalCollegesProps {
  language: Language;
}

const COLLEGES_DATA: MedicalCollege[] = [
  {
    id: 'pmch',
    name: 'Patna Medical College and Hospital (PMCH)',
    city: 'Patna',
    established: '1925',
    type: 'Government',
    seats: 200,
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.6206, lng: 85.1554 },
    description: 'One of the oldest medical colleges in India, known for its extensive clinical exposure.',
    website: 'http://www.patnamedicalcollege.in/'
  },
  {
    id: 'aiims-p',
    name: 'AIIMS Patna',
    city: 'Patna',
    established: '2012',
    type: 'Government',
    seats: 125,
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1586773860418-d3b9797886d9?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.5562, lng: 85.0741 },
    description: 'Institution of National Importance, offering state-of-the-art medical education and research.',
    website: 'https://www.aiimspatna.edu.in/'
  },
  {
    id: 'nmch',
    name: 'Nalanda Medical College (NMCH)',
    city: 'Patna',
    established: '1970',
    type: 'Government',
    seats: 150,
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.5979, lng: 85.1843 },
    description: 'A prominent government medical college serving the eastern part of Patna.',
    website: 'https://www.nmch.ac.in/'
  },
  {
    id: 'igims',
    name: 'Indira Gandhi Institute of Medical Sciences (IGIMS)',
    city: 'Patna',
    established: '1983',
    type: 'Government',
    seats: 120,
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1538108149393-fdfd81895907?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.6094, lng: 85.0894 },
    description: 'Autonomous institute on the pattern of AIIMS, New Delhi.',
    website: 'http://www.igims.org/'
  },
  {
    id: 'dmch',
    name: 'Darbhanga Medical College (DMCH)',
    city: 'Darbhanga',
    established: '1946',
    type: 'Government',
    seats: 120,
    rating: '4.4',
    image: 'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=800&auto=format&fit=crop',
    location: { lat: 26.1592, lng: 85.9015 },
    description: 'Second oldest medical college in Bihar, with a rich heritage in Northern Bihar.',
    website: 'https://www.dmch.ac.in/'
  },
  {
    id: 'jlmnch',
    name: 'Jawaharlal Nehru Medical College (JLNMCH)',
    city: 'Bhagalpur',
    established: '1970',
    type: 'Government',
    seats: 120,
    rating: '4.3',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.2604, lng: 87.0094 },
    description: 'Premier medical institution in Bhagalpur providing tertiary healthcare.',
    website: 'https://www.jlnmchbhagalpur.org/'
  }
];

const MapFocus: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MedicalColleges: React.FC<MedicalCollegesProps> = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Government' | 'Private'>('All');
  const [selectedCollege, setSelectedCollege] = useState<MedicalCollege | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.5941, 85.1376]);
  const [zoom, setZoom] = useState(7);

  const filteredColleges = COLLEGES_DATA.filter(c => 
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterType === 'All' || c.type === filterType)
  );

  const handleSelectCollege = (college: MedicalCollege) => {
    setSelectedCollege(college);
    setMapCenter([college.location.lat, college.location.lng]);
    setZoom(15);
  };

  const getTranslation = (key: string) => {
    const translations: any = {
      English: {
        title: "Medical Colleges in Bihar",
        subtitle: "A directory of top medical institutions for aspiring students and healthcare professionals.",
        searchPlaceholder: "Search by college name or city...",
        est: "Established",
        seats: "MBBS Seats",
        type: "Institution Type",
        website: "Visit Official Site",
        admission: "Admission Insights",
        ranking: "National Ranking",
        location: "Institutional Campus Map"
      },
      Hindi: {
        title: "बिहार के मेडिकल कॉलेज",
        subtitle: "इच्छुक छात्रों और स्वास्थ्य देखभाल पेशेवरों के लिए शीर्ष चिकित्सा संस्थानों की निर्देशिका।",
        searchPlaceholder: "कॉलेज के नाम या शहर से खोजें...",
        est: "स्थापित",
        seats: "एमबीबीएस सीटें",
        type: "संस्थान का प्रकार",
        website: "आधिकारिक साइट पर जाएं",
        admission: "प्रवेश अंतर्दृष्टि",
        ranking: "राष्ट्रीय रैंकिंग",
        location: "संस्थागत परिसर मानचित्र"
      }
    };
    return translations[language.code] || translations.English;
  };

  const t = getTranslation(language.code);

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full h-full overflow-y-auto scrollbar-hide text-gray-900 dark:text-white">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{t.title}</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{t.subtitle}</p>
        </div>

        <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
           {['All', 'Government', 'Private'].map(type => (
             <button 
               key={type}
               onClick={() => setFilterType(type as any)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
             >
               {type}
             </button>
           ))}
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 mb-10 flex items-center gap-4 group transition-all focus-within:ring-4 focus-within:ring-teal-500/10">
        <div className="pl-4 text-gray-400 group-focus-within:text-teal-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          type="text" 
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold placeholder-gray-300 dark:placeholder-gray-600 py-4"
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 h-full">
        {/* College List */}
        <div className="lg:col-span-4 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredColleges.map((college) => (
            <div 
              key={college.id}
              onClick={() => handleSelectCollege(college)}
              className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group flex flex-col ${selectedCollege?.id === college.id ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 shadow-xl' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-teal-200 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-black text-lg uppercase tracking-tight leading-tight group-hover:text-teal-600 transition-colors">{college.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">📍 {college.city}, BIHAR</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${college.type === 'Government' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{college.type}</div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-50 dark:border-gray-700/30">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.est}</span>
                   <span className="font-black text-slate-700 dark:text-teal-400">{college.established}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.seats}</span>
                   <span className="font-black text-slate-700 dark:text-teal-400">{college.seats}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredColleges.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
              No institutions match your search
            </div>
          )}
        </div>

        {/* Map & Details */}
        <div className="lg:col-span-8 space-y-6">
           {selectedCollege ? (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group">
                      <div className="relative h-64 overflow-hidden">
                        <img src={selectedCollege.image} alt={selectedCollege.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 flex items-center gap-2">
                           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                           <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Verified Academic Hub</span>
                        </div>
                      </div>
                      <div className="p-8">
                         <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">{selectedCollege.name}</h2>
                         <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{selectedCollege.description}</p>
                         
                         <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700 flex flex-wrap gap-4">
                            <a href={selectedCollege.website} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-gray-900 dark:bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-black transition-all shadow-xl">
                               {t.website}
                            </a>
                            <button className="flex-1 py-4 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 border-teal-100 dark:border-teal-800 hover:bg-teal-100 transition-all">
                               {t.admission}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Academic Metrics</h3>
                            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 text-xl font-black shadow-inner">🏆</div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-6">
                            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.ranking}</p>
                               <p className="text-2xl font-black text-teal-600">Top 50</p>
                               <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">NIRF Medical 2023</p>
                            </div>
                            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User Rating</p>
                               <div className="flex items-baseline gap-1">
                                  <p className="text-2xl font-black text-amber-500">{selectedCollege.rating}</p>
                                  <span className="text-xs font-bold text-gray-400">/5</span>
                               </div>
                               <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Institutional Score</p>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 h-[300px] overflow-hidden relative group">
                        <div className="absolute top-6 left-6 z-[20]">
                           <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-teal-500/10">
                             <h4 className="text-[10px] font-black uppercase tracking-tighter text-teal-600">{t.location}</h4>
                           </div>
                        </div>
                        <MapContainer style={{ height: '100%', width: '100%' }}>
                          <MapFocus center={mapCenter} zoom={zoom} />
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[selectedCollege.location.lat, selectedCollege.location.lng]}>
                            <Popup>
                              <div className="p-2 text-center">
                                <p className="font-black uppercase text-xs tracking-tighter leading-tight mb-2">{selectedCollege.name}</p>
                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Institution Campus</span>
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/30 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 animate-in fade-in zoom-in duration-700">🏢</div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Explore Academic Institutions</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm leading-relaxed">
                  Select a medical college from the sidebar to view campus images, map locations, MBBS seat availability, and historical data.
                </p>
                <div className="mt-12 flex gap-4">
                   <div className="flex flex-col items-center">
                      <div className="w-12 h-1 bg-teal-100 rounded-full mb-2"></div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Map View</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="w-12 h-1 bg-teal-100 rounded-full mb-2"></div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Clinical Data</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="w-12 h-1 bg-teal-100 rounded-full mb-2"></div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Web Link</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MedicalColleges;