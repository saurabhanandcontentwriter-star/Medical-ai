
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decodeAudioData, generateConsultationSummary } from '../services/geminiService';

const VideoConsultation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Ready to start consultation');
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextInputRef = useRef<AudioContext | null>(null);
  const audioContextOutputRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);
  
  // Audio helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = useCallback(() => {
    setIsActive(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    activeSourcesRef.current.forEach(source => source.stop());
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setStatus('Consultation ended');
    setHasVideo(false);
  }, []);

  const handleGenerateSummary = async () => {
    if (transcriptions.length === 0) return;
    setIsGeneratingSummary(true);
    try {
      const fullTranscript = transcriptions.join('\n');
      const result = await generateConsultationSummary(fullTranscript);
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const startConsultation = async () => {
    setSummary(null);
    setTranscriptions([]);
    setIsConnecting(true);
    setStatus('Requesting hardware access...');
    
    try {
      let stream: MediaStream;
      let videoAvailable = true;

      try {
        // Try both audio and video
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (err: any) {
        console.warn("Could not access camera, trying audio only...", err);
        // Fallback to audio only
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          videoAvailable = false;
        } catch (audioErr) {
          throw new Error('Neither camera nor microphone could be accessed. Please check your device settings.');
        }
      }

      setHasVideo(videoAvailable);
      if (videoAvailable && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus('Connecting to Virtual Consultant...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextInputRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutputRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        // Fixed: Using the correct Live API model name as per requirements
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus(videoAvailable ? 'Consultation in progress. AI is listening...' : 'Audio Consultation in progress (No Camera).');
            
            const source = audioContextInputRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInputRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInputRef.current!.destination);

            if (videoAvailable) {
              const canvas = canvasRef.current!;
              const ctx = canvas.getContext('2d')!;
              frameIntervalRef.current = window.setInterval(() => {
                if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                  canvas.width = 320;
                  canvas.height = 240;
                  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64Data = (reader.result as string).split(',')[1];
                        sessionPromise.then((session) => {
                          session.sendRealtimeInput({
                            media: { data: base64Data, mimeType: 'image/jpeg' }
                          });
                        });
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.5);
                }
              }, 1000);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextOutputRef.current) {
              const ctx = audioContextOutputRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(ctx.destination);
              sourceNode.addEventListener('ended', () => activeSourcesRef.current.delete(sourceNode));
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(sourceNode);
              setStatus('AI is responding...');
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, `AI: ${text}`]);
            } else if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               setTranscriptions(prev => [...prev, `You: ${text}`]);
            }

            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('Consultation interrupted');
            }

            if (message.serverContent?.turnComplete) {
              setStatus('AI is listening...');
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            setStatus('Connection error. Try restarting.');
            stopSession();
          },
          onclose: () => {
            setStatus('Consultation closed');
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are an empathetic virtual medical consultant. You can see the user (if their camera is on) and hear them. Analyze their appearance or verbal symptoms for signs of health and answer their questions clearly. Be supportive and professional. Always remind them you are an AI assistant, not a human doctor.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Consultation startup error:', err);
      setStatus(err.message || 'Failed to access camera or microphone.');
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">AI Video Consultation</h1>
        <p className="text-gray-500 dark:text-gray-400">Speak face-to-face with our virtual medical assistant.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 flex-1">
        {/* Video Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
            {hasVideo ? (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover transition-opacity duration-500 ${summary ? 'opacity-20' : 'opacity-100'} grayscale-[20%] brightness-110`} 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-teal-500/30">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">{isActive ? 'Audio-Only Mode' : 'Camera Offline'}</p>
              </div>
            )}
            
            {/* Summary Overlay */}
            {summary && (
              <div className="absolute inset-0 flex items-center justify-center p-8 overflow-y-auto animate-in fade-in zoom-in duration-500">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-teal-500/30 max-w-lg w-full">
                  <div className="flex items-center space-x-3 mb-6 border-b border-teal-500/20 pb-4">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xl">📄</div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Doctor's Clinical Notes</h3>
                  </div>
                  <div className="prose prose-teal dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {summary}
                  </div>
                  <button 
                    onClick={() => setSummary(null)} 
                    className="mt-8 w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-700 transition-all shadow-lg"
                  >
                    Back to Feed
                  </button>
                </div>
              </div>
            )}

            {/* Overlay Status */}
            {!summary && (
              <div className="absolute top-6 left-6 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{isActive ? 'Live Session' : 'Offline'}</span>
              </div>
            )}

            {!isActive && !isConnecting && !summary && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-10 text-center">
                <div className="space-y-6">
                   <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl">🎥</div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {transcriptions.length > 0 ? 'Consultation Finished' : 'Ready to start?'}
                   </h3>
                   
                   <div className="flex flex-col gap-3">
                    <button 
                      onClick={startConsultation}
                      className="px-10 py-5 bg-white text-teal-900 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      {transcriptions.length > 0 ? 'New Session' : 'Initiate Session'}
                    </button>
                    
                    {transcriptions.length > 0 && (
                      <button 
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-teal-700 transition-all border border-teal-500/50 flex items-center justify-center"
                      >
                        {isGeneratingSummary ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>Analyzing Transcript...</>
                        ) : 'Generate Doctor\'s Notes'}
                      </button>
                    )}
                   </div>
                </div>
              </div>
            )}

            {isConnecting && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                 <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-teal-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Establishing Secure Link...</p>
                 </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={stopSession}
              disabled={!isActive}
              className={`flex-1 py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700' : 'bg-gray-100 text-gray-400'}`}
            >
              End Consultation
            </button>
            <div className="flex items-center space-x-2 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <span className="text-lg">🎤</span>
               <div className="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-teal-500 transition-all ${isActive ? 'w-2/3 animate-pulse' : 'w-0'}`}></div>
               </div>
            </div>
          </div>

          {!hasVideo && isActive && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Camera not detected.</strong> Proceeding with audio-only consultation. You can still speak to the AI assistant.
              </p>
            </div>
          )}
        </div>

        {/* Transcription Column */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col overflow-hidden max-h-screen lg:max-h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Session Logs</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isActive ? 'Real-time' : 'Finished'}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                 <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 opacity-50 text-3xl">💬</div>
                 <p className="text-xs font-bold uppercase tracking-widest">No conversation logs yet.</p>
              </div>
            ) : (
              transcriptions.map((t, idx) => (
                <div key={idx} className={`p-4 rounded-2xl ${t.startsWith('AI:') ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-100 border border-teal-100 dark:border-teal-800' : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}>
                  <p className="text-sm font-bold leading-relaxed">{t}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            {isActive ? (
              <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border-2 border-dashed border-teal-200 dark:border-teal-800">
                <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">AI Note</p>
                <p className="text-xs italic text-teal-800 dark:text-teal-200">The Virtual Consultant uses your audio and video feed to provide better diagnostic context. Ensure a quiet environment.</p>
              </div>
            ) : transcriptions.length > 0 && (
              <button 
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="w-full py-4 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-teal-100 transition-all flex items-center justify-center"
              >
                 {isGeneratingSummary ? 'Summarizing...' : 'Summarize for Clinical Record'}
              </button>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VideoConsultation;
