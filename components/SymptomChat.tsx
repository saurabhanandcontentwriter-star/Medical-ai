
import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender } from '../types';
import { sendMessageToGemini, generateSpeech, decodeAudioData } from '../services/geminiService';

const SymptomChat: React.FC = () => {
  const [voiceLanguage, setVoiceLanguage] = useState<'English' | 'Hindi'>('English');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm MedAssist. I can help you understand symptoms or explain medical concepts. How can I help you today?",
      sender: Sender.BOT,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If language changes, add a helper message from bot if conversation hasn't started
  useEffect(() => {
    if (messages.length === 1) {
      const welcome = voiceLanguage === 'Hindi' 
        ? "नमस्ते! मैं मेडअसिस्ट हूँ। मैं लक्षणों को समझने या चिकित्सा अवधारणाओं को समझाने में आपकी मदद कर सकता हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?"
        : "Hello! I'm MedAssist. I can help you understand symptoms or explain medical concepts. How can I help you today?";
      setMessages([{ ...messages[0], text: welcome }]);
    }
  }, [voiceLanguage]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Add language requirement to the prompt
      const languagePrompt = voiceLanguage === 'Hindi' 
        ? `[RESPOND IN HINDI LANGUAGE ONLY]: ${userMsg.text}`
        : userMsg.text;

      const responseText = await sendMessageToGemini(messages, languagePrompt);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: Sender.BOT,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const playVoice = async (id: string, text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(id);

    try {
      const audioData = await generateSpeech(text, voiceLanguage);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50 dark:bg-gray-900 max-h-[calc(100vh-80px)] md:max-h-screen">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:bg-transparent md:border-none md:pt-6 md:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            {voiceLanguage === 'Hindi' ? 'लक्षण जांचक' : 'Symptom Checker'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI-powered analysis.</p>
        </div>
        
        {/* Language Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-[1rem] shadow-inner border border-gray-200 dark:border-gray-600">
           <button 
             onClick={() => setVoiceLanguage('English')}
             className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${voiceLanguage === 'English' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-400'}`}
           >English</button>
           <button 
             onClick={() => setVoiceLanguage('Hindi')}
             className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${voiceLanguage === 'Hindi' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-400'}`}
           >हिंदी</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 md:pb-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] p-4 rounded-[1.5rem] text-sm md:text-base leading-relaxed whitespace-pre-wrap relative group shadow-sm ${
                msg.sender === Sender.USER
                  ? 'bg-teal-600 text-white rounded-tr-none font-medium'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
              }`}
            >
              {msg.text}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                <div className={`text-[9px] font-black uppercase tracking-widest ${msg.sender === Sender.USER ? 'text-teal-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {msg.sender === Sender.BOT && (
                  <button 
                    onClick={() => playVoice(msg.id, msg.text)}
                    disabled={!!isSpeaking}
                    className={`p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors flex items-center gap-1.5 ${isSpeaking === msg.id ? 'text-teal-500 animate-pulse' : 'text-gray-400'}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest">{isSpeaking === msg.id ? 'Playing' : 'Listen'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 md:m-4 md:rounded-[2rem] md:shadow-xl md:border">
        <div className="flex items-end space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={voiceLanguage === 'Hindi' ? "अपने लक्षणों का वर्णन करें..." : "Describe your symptoms..."}
            className="flex-1 bg-gray-50 dark:bg-gray-700 border-0 rounded-2xl px-5 py-4 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-600 transition-all resize-none max-h-32 font-medium"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className={`p-4 rounded-2xl flex-shrink-0 transition-all transform active:scale-95 ${
              isLoading || !inputText.trim()
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-none'
            }`}
          >
            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomChat;
