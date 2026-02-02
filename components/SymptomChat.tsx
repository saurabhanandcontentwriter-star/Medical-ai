
import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Language, SUPPORTED_LANGUAGES } from '../types';
import { sendMessageToGemini, generateSpeech, decodeAudioData } from '../services/geminiService';

interface SymptomChatProps {
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const MessageRenderer: React.FC<{ text: string; isBot: boolean }> = ({ text, isBot }) => {
  // Simple parser for H1 (#), H2 (##), H3 (###) and bullet points (*)
  // Enforces the "highlights" request by styling headers prominently
  const lines = text.split('\n');
  
  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-lg font-black uppercase tracking-tight text-teal-700 dark:text-teal-300 mt-4 mb-2 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-lg border-l-4 border-teal-500">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mt-6 mb-3 border-b-2 border-teal-500 pb-1">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mt-8 mb-4">{line.replace('# ', '')}</h1>;
        }
        if (line.trim().startsWith('* ')) {
          return <div key={idx} className="flex items-start space-x-3 ml-2"><span className="text-teal-500 mt-1">•</span><span className="flex-1">{line.replace('* ', '')}</span></div>;
        }
        if (line.trim().startsWith('- ')) {
          return <div key={idx} className="flex items-start space-x-3 ml-2"><span className="text-teal-500 mt-1">•</span><span className="flex-1">{line.replace('- ', '')}</span></div>;
        }
        // Handle bold markers manually if they slipped through (rare with instruction)
        const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
        return cleanLine ? <p key={idx} className="leading-relaxed">{cleanLine}</p> : <div key={idx} className="h-2"></div>;
      })}
    </div>
  );
};

const SymptomChat: React.FC<SymptomChatProps> = ({ chatMessages, setChatMessages, language, onLanguageChange }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const quickSymptoms: Record<string, string[]> = {
    English: ['Fever', 'Headache', 'Chest Pain', 'Cough', 'Stomach Ache'],
    Hindi: ['बुखार', 'सिरदर्द', 'सीने में दर्द', 'खांसी', 'पेट दर्द'],
    Bengali: ['জ্বর', 'মাথাব্যথা', 'বুকে ব্যথা', 'কাশি', 'পেটে ব্যথা'],
    Telugu: ['జ్వరం', 'తలనొప్పి', 'ఛాతీ నొప్పి', 'దగ్గు', 'కడుపు నొప్పి'],
    Tamil: ['காய்ச்சல்', 'தலைவலி', 'நெஞ்சு வலி', 'இருமல்', 'வற்று வலி'],
  };

  const getChips = () => quickSymptoms[language.code] || quickSymptoms['English'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(chatMessages, userMsg.text, language.code);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: Sender.BOT,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnalysis = () => {
    const prompt = language.code === 'Hindi'
      ? "मैं विस्तृत लक्षण विश्लेषण करना चाहता हूँ। कृपया मुझसे एक-एक करके नैदानिक प्रश्न पूछें।"
      : "I want to perform a detailed symptom analysis. Please ask me relevant diagnostic questions one by one.";
    handleSendMessage(prompt);
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
      } else { setIsSpeaking(null); }
    } catch (e) { setIsSpeaking(null); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950 max-h-[calc(100vh-80px)] md:max-h-screen">
      <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Clinical AI ({language.native})
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Diagnostic Intelligence Unit</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
             {SUPPORTED_LANGUAGES.filter(l => l.code === 'English' || l.code === 'Hindi').map(lang => (
               <button
                 key={lang.code}
                 onClick={() => onLanguageChange(lang)}
                 className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language.code === lang.code ? 'bg-teal-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {lang.native}
               </button>
             ))}
          </div>

          <button 
            onClick={startAnalysis}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {language.code === 'Hindi' ? 'जांच शुरू करें' : 'Start Checkup'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 md:pb-6 scrollbar-hide">
        {chatMessages.length === 1 && (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-80 animate-in fade-in duration-1000">
             <div className="w-32 h-32 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-8 relative">
                <span className="text-6xl">🏥</span>
                <div className="absolute inset-0 border-4 border-teal-500 rounded-full animate-ping opacity-20"></div>
             </div>
             <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">
              {language.code === 'Hindi' ? 'नमस्ते! मैं आपका एआई डॉक्टर हूं' : "Hi! I'm your AI Doctor"}
             </h3>
             <p className="text-sm font-bold text-gray-400 mt-2 max-w-xs mb-10">
              {language.code === 'Hindi' 
                ? 'अपने लक्षणों का वर्णन करें या शुरू करने के लिए नीचे दी गई सामान्य समस्याओं में से एक चुनें।' 
                : 'Describe your symptoms or select a common concern below to begin.'}
             </p>
             
             <div className="flex flex-wrap justify-center gap-3 max-w-md">
                {getChips().map(chip => (
                  <button 
                    key={chip}
                    onClick={() => handleSendMessage(chip)}
                    className="px-5 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-black uppercase tracking-widest text-teal-600 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
             </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both`}>
            <div className={`max-w-[85%] md:max-w-[75%] p-6 md:p-8 rounded-[2.5rem] text-sm md:text-base whitespace-pre-wrap relative group shadow-sm transition-all ${msg.sender === Sender.USER ? 'bg-teal-600 text-white rounded-tr-none font-bold' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-2 border-gray-50 dark:border-gray-800 rounded-tl-none'}`}>
              <MessageRenderer text={msg.text} isBot={msg.sender === Sender.BOT} />
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${msg.sender === Sender.USER ? 'text-teal-100' : 'text-gray-400'}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                {msg.sender === Sender.BOT && (
                  <button 
                    onClick={() => playVoice(msg.id, msg.text)} 
                    className={`p-2 rounded-xl transition-all flex items-center gap-2 ${isSpeaking === msg.id ? 'bg-teal-600 text-white shadow-lg animate-pulse' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-teal-600'}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest">{isSpeaking === msg.id ? 'AI Speaking' : 'Listen'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-[2rem] rounded-tl-none shadow-sm border-2 border-teal-50 dark:border-teal-900/20 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
              </div>
              <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-[0.2em] ml-2">Clinical AI Thinking</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 md:m-6 md:rounded-[3rem] md:shadow-2xl md:border-2">
        <div className="flex items-end space-x-3">
          <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyDown={handleKeyPress} 
            placeholder={language.code === 'Hindi' ? 'हिंदी में बोलें या टाइप करें...' : `Speak or type in ${language.native}...`} 
            className="flex-1 bg-gray-50 dark:bg-gray-800 border-0 rounded-[2rem] px-6 py-5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700 transition-all resize-none max-h-32 font-bold" 
            rows={1} 
          />
          <button 
            onClick={() => handleSendMessage()} 
            disabled={isLoading || !inputText.trim()} 
            className={`p-6 rounded-[2rem] transition-all transform active:scale-95 ${isLoading || !inputText.trim() ? 'bg-gray-100 text-gray-300' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xl shadow-teal-100'}`}
          >
            <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomChat;
