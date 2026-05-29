import React from 'react';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import { Check, Clock, Users, Play, Copy } from 'lucide-react';
import Chat from './Chat';

export default function Lobby() {
  const { state, toggleReady, playerId, isHost, startGame } = useGame();

  if (!state) return null;

  const players: RoomPlayer[] = Object.values(state.players);
  const allReady = players.every(p => p.isReady);

  const copyRoomId = () => {
    navigator.clipboard.writeText(state.roomId);
    alert('تم نسخ الرمز!');
  };

  const copyInviteLink = () => {
    // Generate full URL
    const url = `${window.location.origin}${window.location.pathname}#/room/${state.roomId}`;
    navigator.clipboard.writeText(url);
    alert('تم نسخ رابط الدعوة! أرسله لأصدقائك');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold font-heading text-slate-200">اللاعبين في الغرفة</h2>
            {state.category && (
               <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md text-xs font-bold border border-indigo-500/30">
                 {state.category}
               </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">{players.length} / 10 لاعبين</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-3">
            <span className="font-mono text-emerald-400 font-bold tracking-widest text-sm sm:text-base">{state.roomId}</span>
            <button onClick={copyRoomId} title="نسخ الرمز" className="text-slate-400 hover:text-white transition-colors">
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <button onClick={copyInviteLink} className="w-full sm:w-auto bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-4 py-2 rounded-xl border border-indigo-500/30 font-bold transition-colors">
             نسخ الرابط
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {players.map((p) => {
          const isMe = p.id === playerId;
          return (
            <div key={p.id} className={`p-4 rounded-2xl border ${isMe ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800 border-slate-700'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">{p.username} {isMe && <span className="text-indigo-400 text-xs ml-2">(أنت)</span>}</p>
                  <p className="text-xs text-slate-400">{p.isHost ? 'المضيف' : 'لاعب'}</p>
                </div>
              </div>
              <div>
                {p.isReady ? (
                  <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl">
                    <Check className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleReady}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 ${
            state.players[playerId]?.isReady 
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {state.players[playerId]?.isReady ? 'إلغاء الاستعداد' : 'أنا مستعد!'}
        </button>

        {isHost && (
          <button
            onClick={startGame}
            disabled={!allReady || players.length < 2}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
          >
            <Play className="w-5 h-5" />
            ابدأ اللعب
          </button>
        )}
      </div>
    </div>
  );
}
