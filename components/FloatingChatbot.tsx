
import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Language } from '../types';
import { sendMessageToGemini, generateSpeech, decodeAudioData } from '../services/geminiService';

interface FloatingChatbotProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  language: Language;
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ messages, setMessages, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(messages, userMsg.text, language.code);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: Sender.BOT,
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm having a little trouble connecting right now. Please try again.",
        sender: Sender.BOT,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playVoice = async (id: string, text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(id);

    try {
      const audioData = await generateSpeech(text, language.code);
      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(null);
        source.start();
      } else {
        setIsSpeaking(null);
      }
    } catch (e) {
      console.error("Audio playback error", e);
      setIsSpeaking(null);
    }
  };

  return (
    <>
      {/* Toggle Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center ${isOpen ? 'rotate-90' : 'rotate-0'}`}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-8 w-[calc(100vw-2rem)] md:w-96 h-[500px] max-h-[60vh] md:max-h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
           {/* Header */}
           <div className="p-4 bg-teal-600 text-white flex justify-between items-center shadow-sm">
             <div className="flex items-center space-x-2">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
               <div>
                 <h3 className="font-bold text-sm">MedAssist ({language.native})</h3>
               </div>
             </div>
             <div className="flex items-center space-x-2">
                <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase tracking-widest">{language.code.substring(0, 2)}</div>
                <button onClick={() => setIsOpen(false)} className="text-teal-100 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
             </div>
           </div>

           {/* Messages Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-gray-900">
             {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed relative group ${
                   msg.sender === Sender.USER 
                     ? 'bg-teal-600 text-white rounded-tr-none shadow-sm' 
                     : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none'
                 }`}>
                   {msg.text}
                   {msg.sender === Sender.BOT && (
                     <button 
                       onClick={() => playVoice(msg.id, msg.text)}
                       disabled={!!isSpeaking}
                       className={`mt-2 flex items-center space-x-1 text-[10px] font-bold transition-colors ${isSpeaking === msg.id ? 'text-teal-500 animate-pulse' : 'text-gray-400 hover:text-teal-500'}`}
                     >
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                       <span>{isSpeaking === msg.id ? 'Speaking...' : 'Listen'}</span>
                     </button>
                   )}
                 </div>
               </div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-white dark:bg-gray-800 p-3 rounded-xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex space-x-1.5 items-center">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                 </div>
               </div>
             )}
             <div ref={scrollRef} />
           </div>

           {/* Input Area */}
           <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
             <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 pr-2">
               <input 
                 type="text" 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder={`Type in ${language.native}...`}
                 className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
               />
               <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isLoading}
                 className={`p-2 rounded-lg transition-colors ${
                   !input.trim() || isLoading 
                     ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500' 
                     : 'bg-teal-600 text-white hover:bg-teal-700'
                 }`}
               >
                 <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
               </button>
             </div>
           </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;