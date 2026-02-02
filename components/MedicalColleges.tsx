
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MedicalCollege, Language } from '../types';

interface MedicalCollegesProps {
  language: Language;
}

const COLLEGES_DATA: MedicalCollege[] = [
  // GOVERNMENT COLLEGES
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
    description: 'One of the oldest medical colleges in India, known for its extensive clinical exposure and historical significance in the region.',
    website: 'http://www.patnamedicalcollege.in/',
    about: {
      departments: ['Anatomy', 'Cardiology', 'Dermatology', 'Forensic Medicine', 'Microbiology', 'Pediatrics'],
      facilities: ['2500+ Bed Capacity', 'Central Library', 'Advanced Blood Bank', 'Residential Hostels'],
      contact: 'Ashok Rajpath, Patna - 800004',
      fees: '₹6,100 Per Annum (approx)',
      neetCutoff: '650+ (General AIQ)',
      affiliation: 'Aryabhatta Knowledge University (AKU)',
      beds: '2,500+'
    }
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
    description: 'Institution of National Importance, offering state-of-the-art medical education, multi-disciplinary research, and tertiary healthcare.',
    website: 'https://www.aiimspatna.edu.in/',
    about: {
      departments: ['Burn & Plastic Surgery', 'Neurosurgery', 'Oncology', 'Radio-Diagnosis', 'Trauma Care'],
      facilities: ['Smart Classrooms', 'Telemedicine Unit', 'Sports Complex', 'High-end Research Labs'],
      contact: 'Phulwari Sharif, Patna - 801507',
      fees: '₹5,856 (Total Course Fee)',
      neetCutoff: '700+ (General)',
      affiliation: 'Autonomous (Statutory Body)',
      beds: '960+'
    }
  },
  {
    id: 'vims-p',
    name: 'Vardhman Institute of Medical Sciences (VIMS) Pawapuri',
    city: 'Pawapuri',
    established: '2013',
    type: 'Government',
    seats: 120,
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1538108149393-fdfd81895907?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.0114, lng: 85.5135 },
    description: 'Modern government medical institution located near the holy site of Pawapuri, dedicated to providing quality medical education and tertiary healthcare in the Nalanda district.',
    website: 'https://vimspawapuri.org/',
    about: {
      departments: ['Anatomy', 'Pathology', 'General Medicine', 'Ophthalmology', 'Microbiology'],
      facilities: ['Fully Functional ICU', 'Modular OT Complex', 'Digital Library', 'Indoor Sports Area'],
      contact: 'Pawapuri, Nalanda, Bihar - 803115',
      fees: '₹6,000 Per Annum (approx)',
      neetCutoff: '620+ (General)',
      affiliation: 'Aryabhatta Knowledge University (AKU)',
      beds: '500+'
    }
  },
  {
    id: 'kmc-k',
    name: 'Katihar Medical College (KMC)',
    city: 'Katihar',
    established: '1987',
    type: 'Private',
    seats: 150,
    rating: '4.4',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.5458, lng: 87.5684 },
    description: 'Premier private medical college in North Bihar, offering undergraduate and postgraduate courses with a large multi-specialty hospital.',
    website: 'https://kmckatihar.org/',
    about: {
      departments: ['Orthopedics', 'General Surgery', 'Obstetrics & Gynaecology', 'Biochemistry'],
      facilities: ['600+ Bed Hospital', 'Air-conditioned Classrooms', 'Library', 'Hostel for Boys & Girls'],
      contact: 'Karim Bagh, Katihar - 854105',
      fees: '₹9,35,000 Per Annum (approx)',
      neetCutoff: '450+ (General)',
      affiliation: 'Al-Karim University',
      beds: '600+'
    }
  },
  {
    id: 'nsmch-b',
    name: 'Netaji Subhas Medical College',
    city: 'Bihta, Patna',
    established: '2020',
    type: 'Private',
    seats: 100,
    rating: '4.2',
    image: 'https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=800&auto=format&fit=crop',
    location: { lat: 25.5684, lng: 84.8542 },
    description: 'A newly established, rapidly growing private medical college with modern infrastructure and tertiary healthcare services in the outskirts of Patna.',
    website: 'https://nsmch.com/',
    about: {
      departments: ['ENT', 'Ophthalmology', 'Psychiatry', 'Radio-Diagnosis', 'Dermatology'],
      facilities: ['Modern Emergency Block', 'Blood Bank', 'WiFi Campus', 'Digital Classrooms'],
      contact: 'Amhara, Bihta, Patna - 801103',
      fees: '₹15,50,000 Per Annum (approx)',
      neetCutoff: '350+ (General)',
      affiliation: 'Aryabhatta Knowledge University (AKU)',
      beds: '350+'
    }
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
  const [quickViewCollege, setQuickViewCollege] = useState<MedicalCollege | null>(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickView = (e: React.MouseEvent, college: MedicalCollege) => {
    e.stopPropagation();
    setQuickViewCollege(college);
  };

  const getTranslation = (key: string) => {
    const translations: any = {
      English: {
        title: "Medical Colleges in Bihar",
        subtitle: "Comprehensive institutional directory for medical aspirants and researchers.",
        searchPlaceholder: "Search institutions by name or city...",
        est: "ESTABLISHED",
        seats: "MBBS SEATS",
        website: "VISIT INSTITUTIONAL WEBSITE",
        admission: "VIEW DETAILED CAMPUS PROFILE",
        about: "ABOUT THE INSTITUTION",
        beds: "BED CAPACITY",
        affiliation: "AFFILIATION"
      },
      Hindi: {
        title: "बिहार के मेडिकल कॉलेज",
        subtitle: "मेडिकल उम्मीदवारों और शोधकर्ताओं के लिए व्यापक संस्थागत निर्देशिका।",
        searchPlaceholder: "नाम या शहर से संस्थान खोजें...",
        est: "स्थापित",
        seats: "एमबीबीएस सीटें",
        website: "आधिकारिक वेबसाइट पर जाएं",
        admission: "विस्तृत कैंपस प्रोफाइल देखें",
        about: "संस्थान के बारे में",
        beds: "बेड क्षमता",
        affiliation: "संबद्धता"
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

        <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-[1.5rem] border-2 border-gray-100 dark:border-gray-700 shadow-sm">
           {['All', 'Government', 'Private'].map(type => (
             <button 
               key={type}
               onClick={() => setFilterType(type as any)}
               className={`px-8 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-teal-600 text-white shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
             >
               {type}
             </button>
           ))}
        </div>
      </header>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-[2.5rem] shadow-sm border-2 border-gray-100 dark:border-gray-800 mb-10 flex items-center gap-4 group focus-within:border-teal-500 transition-all">
        <div className="pl-4 text-gray-400 group-focus-within:text-teal-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          type="text" 
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-black placeholder-gray-300 dark:placeholder-gray-700 py-4 uppercase tracking-tighter"
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Sidebar List */}
        <div className="lg:col-span-4 space-y-5 max-h-[700px] overflow-y-auto pr-3 scrollbar-hide">
          {filteredColleges.map((college) => (
            <div 
              key={college.id}
              onClick={() => handleSelectCollege(college)}
              className={`p-8 rounded-[3rem] border-4 transition-all cursor-pointer group flex flex-col relative overflow-hidden ${selectedCollege?.id === college.id ? 'border-teal-500 bg-white dark:bg-gray-800 shadow-2xl' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 hover:border-teal-200'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="font-black text-xl uppercase tracking-tighter leading-[0.95] group-hover:text-teal-600 transition-colors">{college.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                     <span className="text-sm">📍</span> {college.city}, BIHAR
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${college.type === 'Government' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{college.type}</div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-100 dark:border-gray-700/50">
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.est}</p>
                   <p className="text-lg font-black text-slate-700 dark:text-teal-400">{college.established}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.seats}</p>
                   <p className="text-lg font-black text-slate-700 dark:text-teal-400">{college.seats}</p>
                </div>
              </div>

              <button 
                onClick={(e) => handleQuickView(e, college)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 bg-teal-600 text-white rounded-2xl opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Dynamic Detail Panel */}
        <div className="lg:col-span-8">
           {selectedCollege ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-700">
                <div className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl border-4 border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row h-full">
                   <div className="md:w-1/2 relative h-80 md:h-auto overflow-hidden">
                      <img src={selectedCollege.image} alt={selectedCollege.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                   </div>
                   <div className="md:w-1/2 p-12 flex flex-col">
                      <div className="mb-10">
                        <div className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-lg inline-block mb-4">
                           {selectedCollege.type} Institution
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.95] mb-4">
                          {selectedCollege.name}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed italic">
                          "{selectedCollege.description}"
                        </p>
                      </div>

                      <div className="space-y-6 flex-1">
                         <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.beds}</span>
                            <span className="text-xl font-black text-teal-600">{selectedCollege.about.beds}</span>
                         </div>
                         <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.affiliation}</span>
                            <span className="text-[10px] font-black text-slate-800 dark:text-gray-300 uppercase truncate max-w-[200px] text-right">{selectedCollege.about.affiliation}</span>
                         </div>
                      </div>

                      <div className="mt-12 flex flex-col gap-3">
                         <a href={selectedCollege.website} target="_blank" rel="noreferrer" className="w-full py-5 bg-teal-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest text-center hover:bg-teal-700 transition-all shadow-xl shadow-teal-100">
                            {t.website}
                         </a>
                      </div>
                   </div>
                </div>
                
                {/* Visual Map Integrated Below */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border-4 border-gray-100 dark:border-gray-800 shadow-xl h-[350px] overflow-hidden relative">
                   <div className="absolute top-8 left-8 z-[20] flex flex-col gap-2">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border-2 border-teal-500/10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-teal-600">Institutional Geo-Tag</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedCollege.city} Campus</p>
                      </div>
                   </div>
                   <MapContainer style={{ height: '100%', width: '100%' }}>
                     <MapFocus center={[selectedCollege.location.lat, selectedCollege.location.lng]} zoom={15} />
                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                     <Marker position={[selectedCollege.location.lat, selectedCollege.location.lng]}>
                       <Popup>
                         <div className="text-center font-black uppercase text-xs tracking-tighter p-2">{selectedCollege.name}</div>
                       </Popup>
                     </Marker>
                   </MapContainer>
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[500px] bg-white dark:bg-gray-900 rounded-[5rem] border-4 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-20 text-center opacity-50">
                <div className="text-8xl mb-10">🏫</div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-gray-400">Select an Institution</h3>
                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">To view detailed clinical and academic profile</p>
             </div>
           )}
        </div>
      </div>

      {/* Redesigned Quick View Modal (Matches User Screenshot) */}
      {quickViewCollege && (
        <div className="fixed inset-0 z-[200] bg-teal-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-teal-500/20 flex flex-col md:flex-row min-h-[600px]">
              
              {/* Image Section (Left) */}
              <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                 <img src={quickViewCollege.image} alt={quickViewCollege.name} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/10"></div>
                 <button 
                   onClick={() => setQuickViewCollege(null)} 
                   className="md:hidden absolute top-6 right-6 bg-white/40 p-3 rounded-full text-white"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              {/* Data Section (Right) */}
              <div className="md:w-1/2 p-12 flex flex-col relative bg-white">
                 <button 
                   onClick={() => setQuickViewCollege(null)} 
                   className="hidden md:block absolute top-10 right-10 text-gray-300 hover:text-rose-500 transition-colors"
                 >
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>

                 <div className="mb-10">
                    <div className="px-3 py-1 bg-teal-50 text-teal-600 text-[9px] font-black uppercase tracking-widest rounded-lg inline-block mb-6">
                       {quickViewCollege.type.toUpperCase()}
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-[0.9] mb-4">
                      {quickViewCollege.name}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                       <span className="text-rose-500">📍</span> {quickViewCollege.city}, BIHAR
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-10 mb-12">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.est}</p>
                       <p className="text-3xl font-black text-slate-800 tracking-tighter">{quickViewCollege.established}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.seats}</p>
                       <p className="text-3xl font-black text-slate-800 tracking-tighter">{quickViewCollege.seats}</p>
                    </div>
                 </div>

                 {/* About Card Style (Matched to Screenshot) */}
                 <div className="bg-gray-50/80 p-8 rounded-[2.5rem] border border-gray-100 mb-12 flex-1 relative overflow-hidden group">
                    <h4 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       {t.about}
                    </h4>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                       {quickViewCollege.description}
                    </p>
                    <div className="absolute top-8 right-8 text-4xl opacity-5 group-hover:scale-125 transition-transform duration-700">📖</div>
                 </div>

                 <div className="space-y-4">
                    <button 
                      onClick={() => { handleSelectCollege(quickViewCollege); setQuickViewCollege(null); }}
                      className="w-full py-5 bg-[#0d9488] text-white rounded-[1.8rem] font-black uppercase text-xs tracking-widest hover:bg-[#0b7e74] transition-all shadow-2xl shadow-teal-100 transform active:scale-[0.98]"
                    >
                      {t.admission}
                    </button>
                    <a 
                      href={quickViewCollege.website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-5 bg-gray-50 text-gray-400 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.2em] text-center hover:bg-gray-100 transition-all flex items-center justify-center border border-gray-100"
                    >
                      {t.website}
                    </a>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MedicalColleges;
