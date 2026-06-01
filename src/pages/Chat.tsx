import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../components/GameContext';
import { Send } from 'lucide-react';

export default function Chat() {
  const { state, sendMessage, playerId } = useGame();
  const [text, setText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add a slight delay to ensure DOM updates before scrolling
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [state?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text.trim());
      setText('');
    }
  };

  const isMuted = state?.players[playerId]?.isMuted;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h3 className="font-bold text-slate-200">الدردشة <span className="text-slate-400 text-xs mr-2">({state?.messages.length} رسالة)</span></h3>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-h-0">
        {state?.messages.map((msg) => {
          const isMe = msg.senderId === playerId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
              <span className="text-xs text-slate-500 mb-1 px-1">{isMe ? 'أنت' : msg.senderName}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm md:text-base shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
      
      <form onSubmit={handleSend} className="p-3 md:p-4 bg-slate-950/50 border-t border-slate-800 flex gap-2 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isMuted ? "تم كتمك من قبل المالك" : "اكتب رسالة..."}
          disabled={isMuted}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm focus:border-indigo-500 outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isMuted}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 md:px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
