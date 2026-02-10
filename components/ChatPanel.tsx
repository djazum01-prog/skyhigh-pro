
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Shield } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: number;
  isSystem?: boolean;
  level: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'Viper_Zero', text: 'Just hit a 5x! Let\'s gooo!', time: Date.now() - 60000, level: 24 },
  { id: '2', user: 'SkyHigh_Admin', text: 'Welcome pilots. Maintain altitude.', time: Date.now() - 30000, isSystem: true, level: 99 },
];

const SIMULATED_PHRASES = [
  "Feeling a big flight coming up...",
  "Anyone else waiting for 10x?",
  "Casher at 2x is the way to play it safe.",
  "That last crash was brutal!",
  "Big bets in the lobby tonight.",
  "SkyHigh Pro is the best tactical sim.",
  "Watch the g-force on this one.",
  "Ejecting early, not taking chances."
];

const USERS = ["Alpha_One", "Mach_10", "CloudRacer", "AceHigh", "DeltaForce", "SonicBoom"];

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          user: USERS[Math.floor(Math.random() * USERS.length)],
          text: SIMULATED_PHRASES[Math.floor(Math.random() * SIMULATED_PHRASES.length)],
          time: Date.now(),
          level: Math.floor(Math.random() * 40) + 1
        };
        setMessages(prev => [...prev.slice(-49), newMessage]);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      user: 'You_Pilot',
      text: inputText,
      time: Date.now(),
      level: 12
    };
    setMessages(prev => [...prev.slice(-49), msg]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-[#14171b]/40 rounded-[2rem] border border-gray-800/60 overflow-hidden shadow-2xl animate-in fade-in duration-500">
      <div className="p-4 border-b border-gray-800/60 flex justify-between items-center bg-[#0b0e11]/50">
        <div className="flex items-center gap-3">
          <MessageSquare size={16} className="text-rose-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tactical Comms Lobby</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
          <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
          <span className="text-[8px] text-green-500 font-black uppercase tracking-tighter">842 Active</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 animate-in slide-in-from-bottom-2 ${msg.isSystem ? 'justify-center' : ''}`}>
            {!msg.isSystem && (
              <div className="w-8 h-8 rounded-xl bg-[#1c2127] border border-gray-800 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-gray-500">{msg.user[0]}</span>
              </div>
            )}
            <div className={`flex flex-col ${msg.isSystem ? 'items-center text-center max-w-[80%]' : 'max-w-[85%]'}`}>
              {!msg.isSystem && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-white italic">{msg.user}</span>
                  <span className="text-[7px] font-black text-indigo-400 bg-indigo-500/10 px-1 rounded">LVL {msg.level}</span>
                </div>
              )}
              <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-medium ${
                msg.isSystem ? 'bg-indigo-600/10 text-indigo-300 italic border border-indigo-500/20' : 'bg-[#1c2127] text-gray-300 border border-white/5'
              }`}>
                {msg.isSystem && <Shield size={10} className="inline mr-2 text-indigo-400" />}
                {msg.text}
              </div>
              <span className="text-[7px] text-gray-600 mt-1 uppercase font-bold">
                {new Date(msg.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#0b0e11]/80 border-t border-gray-800/60">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Broadcast to pilots..."
            className="flex-1 bg-[#1c2127] border border-gray-800 rounded-2xl px-4 py-2 text-xs text-white outline-none focus:border-rose-500 transition-all"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-rose-600 hover:bg-rose-500 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
