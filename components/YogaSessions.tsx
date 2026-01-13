
import React, { useState, useEffect } from 'react';
import { fetchYogaSessions, generateYogaTeacherImage, generateYogaStepVideo, fetchPoseDetails } from '../services/geminiService';
import { YogaSession } from '../types';

const YogaSessions: React.FC = () => {
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<YogaSession | null>(null);
  const [teacherGender, setTeacherGender] = useState<'male' | 'female'>('female');
  const [teacherImageUrl, setTeacherImageUrl] = useState<string | null>(null);
  const [isGeneratingTeacher, setIsGeneratingTeacher] = useState(false);
  
  // Video related state
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [activePoseIdx, setActivePoseIdx] = useState<number | null>(null);
  
  // Pose explanation state
  const [poseExplanation, setPoseExplanation] = useState<{description: string, benefits: string[]} | null>(null);
  const [isFetchingExplanation, setIsFetchingExplanation] = useState(false);

  useEffect(() => {
    const loadSessions = async () => {
      const data = await fetchYogaSessions();
      setSessions(data);
      setLoading(false);
    };
    loadSessions();
  }, []);

  const handleStartSession = async (session: YogaSession) => {
    setSelectedSession(session);
    setIsGeneratingTeacher(true);
    setTeacherImageUrl(null);
    setCurrentVideoUrl(null);
    setActivePoseIdx(null);
    setPoseExplanation(null);
    
    // Generate the AI Avatar based on gender and session focus
    const imageUrl = await generateYogaTeacherImage(teacherGender, session.focus);
    setTeacherImageUrl(imageUrl);
    setIsGeneratingTeacher(false);
  };

  const handlePoseClick = async (poseName: string, idx: number) => {
    if (activePoseIdx === idx && !currentVideoUrl) return; // Already viewing explanation
    
    setActivePoseIdx(idx);
    setPoseExplanation(null);
    setCurrentVideoUrl(null);
    setIsFetchingExplanation(true);

    try {
      const details = await fetchPoseDetails(poseName);
      setPoseExplanation(details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingExplanation(false);
    }
  };

  const handlePlayVideo = async (poseName: string, idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setActivePoseIdx(idx);
    setIsGeneratingVideo(true);
    setCurrentVideoUrl(null);
    setVideoStatus("Verifying session credentials...");

    try {
      // MANDATORY: API Key Selection Flow for Veo
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setVideoStatus("Billing setup required. Opening key selection...");
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Assume success and proceed as per instructions
      }

      const videoUrl = await generateYogaStepVideo(teacherGender, poseName, (status) => {
        setVideoStatus(status);
      });

      if (videoUrl) {
        setCurrentVideoUrl(videoUrl);
      }
    } catch (error: any) {
      console.error("Yoga Video Error:", error);
      if (error.message === "API_KEY_REQUIRED") {
        setVideoStatus("Requested entity not found. Please select a valid paid API key.");
        // Re-open dialog if the key was invalid/not found (Mandatory reset step)
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } else {
        setVideoStatus("Synthesis failed. Please ensure your project has Veo access enabled.");
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const closeSession = () => {
    setSelectedSession(null);
    setTeacherImageUrl(null);
    setCurrentVideoUrl(null);
    setActivePoseIdx(null);
    setPoseExplanation(null);
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full overflow-y-auto">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Yoga & Mindfulness</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Find your zen with AI-personalized instructors.</p>
        </div>
        
        <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <button 
            onClick={() => setTeacherGender('male')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${teacherGender === 'male' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <span className="text-lg">🧔</span> Male Guru
          </button>
          <button 
            onClick={() => setTeacherGender('female')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${teacherGender === 'female' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <span className="text-lg">👩</span> Female Guru
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div 
              key={session.id} 
              onClick={() => handleStartSession(session)}
              className="group bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 cursor-pointer transition-all shadow-sm hover:shadow-xl flex flex-col justify-between h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                <span className="text-9xl">🧘</span>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {session.level}
                  </div>
                  <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {session.duration}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight uppercase tracking-tighter">{session.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-[90%] line-clamp-2">{session.focus}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {session.poses.slice(0, 3).map((p, i) => (
                    <span key={i} className="text-[10px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-2 py-1 rounded-md text-gray-400 font-bold uppercase">{p}</span>
                  ))}
                  {session.poses.length > 3 && <span className="text-[10px] text-gray-400 font-bold px-2 py-1">+{session.poses.length - 3} MORE</span>}
                </div>
              </div>

              <button className="relative z-10 w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest group-hover:bg-teal-600 transition-colors shadow-lg">
                Start with AI Teacher
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] max-w-7xl w-full p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto border border-white/10 relative">
            
            <button onClick={closeSession} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors bg-gray-100 dark:bg-gray-900 p-3 rounded-full z-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Side: Immersive AI Teacher View (Image, Explanation, or Video) */}
              <div className="flex flex-col space-y-6 h-full sticky top-0">
                <div className="relative aspect-video lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 dark:bg-gray-900 border-4 border-white dark:border-gray-700 shadow-2xl flex items-center justify-center group">
                  {isGeneratingVideo ? (
                    <div className="flex flex-col items-center space-y-6 p-8 text-center">
                      <div className="relative">
                        <div className="w-24 h-24 border-8 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">🎥</div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-teal-600 animate-pulse uppercase tracking-[0.3em] mb-2">Generating AI Motion...</p>
                        <p className="text-xs font-bold text-gray-400 max-w-xs mx-auto leading-relaxed">{videoStatus}</p>
                      </div>
                    </div>
                  ) : currentVideoUrl ? (
                    <video 
                      src={currentVideoUrl} 
                      autoPlay 
                      loop 
                      playsInline 
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : isFetchingExplanation ? (
                     <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest animate-pulse">Analyzing Pose Dynamics...</p>
                     </div>
                  ) : poseExplanation ? (
                    <div className="w-full h-full p-10 overflow-y-auto flex flex-col animate-in fade-in duration-500">
                      <div className="mb-8">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em] mb-4">Pose Breakdown</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
                           {selectedSession.poses[activePoseIdx!]}
                        </h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                           "{poseExplanation.description}"
                        </p>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Benefits</p>
                         <div className="grid gap-2">
                            {poseExplanation.benefits.map((benefit, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                 <span className="text-teal-500 text-lg">✦</span>
                                 <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{benefit}</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      <button 
                        onClick={() => handlePlayVideo(selectedSession.poses[activePoseIdx!], activePoseIdx!)}
                        className="mt-auto w-full py-4 bg-gray-900 dark:bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 transition-all flex items-center justify-center gap-3"
                      >
                         <span className="text-lg">🎥</span> Generate AI Demonstration
                      </button>
                    </div>
                  ) : isGeneratingTeacher ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-teal-600 animate-pulse uppercase tracking-[0.3em]">Summoning AI Instructor...</p>
                    </div>
                  ) : teacherImageUrl ? (
                    <>
                      <img src={teacherImageUrl} alt="AI Yoga Teacher" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Assigned Guru</p>
                            <p className="text-lg font-black text-white uppercase tracking-tighter">AI Guru {teacherGender === 'male' ? 'Aditya' : 'Ishani'}</p>
                          </div>
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-gray-400 font-bold uppercase tracking-widest">Generation Failed.</p>
                      <button onClick={() => handleStartSession(selectedSession)} className="mt-4 text-teal-500 font-black underline uppercase text-[10px]">Retry</button>
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-teal-50 dark:bg-teal-900/20 rounded-[2rem] border-2 border-dashed border-teal-200 dark:border-teal-800">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl mt-1">💡</span>
                    <div>
                      <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Teacher's Advice</p>
                      <p className="text-sm font-bold text-teal-900 dark:text-teal-100 leading-relaxed italic">
                        {currentVideoUrl 
                          ? "Observe the precision in movement. Notice how the spine remains elongated and the breath is synchronized."
                          : poseExplanation 
                            ? "Focus on holding the alignment described. Breathing through the discomfort is key to mental mastery."
                            : "Select a pose from the list to see a detailed explanation and generate an AI demonstration video."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Session Content */}
              <div className="flex flex-col h-full">
                <header className="mb-8">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-8 h-1 bg-teal-500 rounded-full"></span>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em]">Now Training</p>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3">{selectedSession.title}</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-black text-gray-400 uppercase">{selectedSession.level}</span>
                    <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                    <span className="text-xs font-black text-gray-400 uppercase">{selectedSession.duration}</span>
                  </div>
                </header>

                <div className="flex-1 space-y-4 mb-8">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 dark:border-gray-700 pb-2 flex justify-between">
                    <span>Sequence Details</span>
                    <span className="text-teal-500">Tap for details & video</span>
                  </h4>
                  {/* Grid for poses - handles Surya Namaskar's 12 steps nicely */}
                  <div className={`grid ${selectedSession.poses.length > 6 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                    {selectedSession.poses.map((pose, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handlePoseClick(pose, idx)}
                        className={`group flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-[1.5rem] border transition-all cursor-pointer hover:shadow-md ${activePoseIdx === idx ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20 dark:bg-teal-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center font-black rounded-xl shadow-sm mr-4 flex-shrink-0 transition-all ${activePoseIdx === idx ? 'bg-teal-600 text-white' : 'bg-white dark:bg-gray-800 text-teal-600'}`}>
                          {idx + 1}
                        </div>
                        <p className="flex-1 text-gray-800 dark:text-gray-200 font-black uppercase tracking-tight text-[11px] leading-tight line-clamp-2">{pose}</p>
                        <button 
                          onClick={(e) => handlePlayVideo(pose, idx, e)}
                          disabled={isGeneratingVideo}
                          className={`p-2 rounded-lg transition-all ${activePoseIdx === idx && currentVideoUrl ? 'bg-teal-600 text-white shadow-teal-100' : 'bg-white dark:bg-gray-800 text-teal-600 hover:bg-teal-50 shadow-sm disabled:opacity-50'}`}
                          title="Generate Video"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <button 
                    onClick={closeSession}
                    className="w-full bg-teal-600 text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-teal-200 dark:shadow-none hover:bg-teal-700 transition-all transform active:scale-95"
                  >
                    Finish Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YogaSessions;
