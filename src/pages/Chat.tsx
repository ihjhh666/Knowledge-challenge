import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../components/GameContext';
import { Send } from 'lucide-react';

export default function Chat() {
  const { state, sendMessage, playerId } = useGame();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text.trim());
      setText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {state?.messages.map((msg) => {
          const isMe = msg.senderId === playerId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
              <span className="text-xs text-slate-500 mb-1">{isMe ? 'أنت' : msg.senderName}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 text-sm focus:border-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
