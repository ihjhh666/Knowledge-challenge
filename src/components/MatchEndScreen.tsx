import React from 'react';
import { Trophy, RefreshCw, Layers, Home, CheckCircle2 } from 'lucide-react';
import { RoomPlayer } from '../lib/types';
import { useGame } from './GameContext';

interface MatchEndScreenProps {
  winner?: RoomPlayer;
  sortedPlayers?: RoomPlayer[]; // Made optional
  messageTitle?: string;
  messageSubtitle?: string;
  children?: React.ReactNode;
}

export function MatchEndScreen({ winner, sortedPlayers, messageTitle, messageSubtitle, children }: MatchEndScreenProps) {
  const { isHost, requestRematch, returnToLobby, leaveRoom, state, playerId } = useGame();
  
  const hasRequestedRematch = state?.rematchApprovals?.includes(playerId);
  const othersRequested = (state?.rematchApprovals?.length || 0) - (hasRequestedRematch ? 1 : 0);

  return (
    <div className="bg-slate-800 p-8 md:p-12 rounded-3xl border border-slate-700 text-center max-w-2xl mx-auto space-y-8 animate-fade-in relative z-10 w-full mb-12">
      <div className="bg-emerald-500/10 w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
        <Trophy className="w-16 h-16 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
          {messageTitle || 'اللعبة انتهت!'}
        </h2>
        <p className="text-xl text-slate-300">
          {messageSubtitle || (winner && (
            <>الفائز هو <span className="font-bold text-white">{winner.username}</span> برصيد {winner.score} نقطة</>
          ))}
        </p>
      </div>

      {children ? children : (
        sortedPlayers && (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedPlayers.map((p, i) => {
              const playerAvatar = p.id === playerId ? (localStorage.getItem('know_player_avatar') || p.avatarUrl) : p.avatarUrl;
              return (
              <div key={p.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>#{i + 1}</span>
                  <img src={playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId || p.id}`} className="w-10 h-10 rounded-xl bg-slate-950 object-cover shrink-0" alt="avatar" />
                  <span className="font-bold text-lg">{p.username}</span>
                </div>
                <span className="text-indigo-400 font-bold">{p.score} نقطة</span>
              </div>
            )})}
          </div>
        )
      )}

      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex flex-col gap-4">
         <button 
           onClick={requestRematch}
           disabled={hasRequestedRematch}
           className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-xl transition-all"
         >
           {hasRequestedRematch ? (
             <><CheckCircle2 className="w-5 h-5" /> في انتظار باقي اللاعبين ({state?.rematchApprovals?.length} / {Object.keys(state?.players || {}).length})</>
           ) : (
             <><RefreshCw className="w-5 h-5" /> لعب مجدداً {othersRequested > 0 && `(طلب من ${othersRequested} لاعب)`}</>
           )}
         </button>
         <div className="grid grid-cols-2 gap-4">
           {isHost && (
             <button 
               onClick={returnToLobby}
               className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
             >
               <Layers className="w-5 h-5" /> تغيير الطور
             </button>
           )}
           <button 
             onClick={leaveRoom}
             className={`flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl transition-all ${!isHost ? 'col-span-2' : ''}`}
           >
             <Home className="w-5 h-5" /> العودة للرئيسية
           </button>
         </div>
         {!isHost && (
            <p className="text-xs text-slate-400 mt-2">ملاحظة: المضيف فقط يمكنه تغيير الطور.</p>
         )}
      </div>
    </div>
  );
}
