import React, { useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { subscribeToGameInvites, deleteGameInvite } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, X } from 'lucide-react';
import { useGame } from './GameContext';

export function GameInvitesListener() {
  const [invites, setInvites] = useState<any[]>([]);
  const playerId = storage.getPlayerId();
  const navigate = useNavigate();
  const { state } = useGame(); // To avoid joining if we are already in the same room

  useEffect(() => {
    if (!playerId) return;
    const unsub = subscribeToGameInvites(playerId, (invs) => {
      // filter out invites to the room we are already in
      const filtered = invs.filter(i => i.roomData?.roomId !== state?.roomId);
      setInvites(filtered);
    });
    return unsub;
  }, [playerId, state?.roomId]);

  if (invites.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 space-y-3 flex flex-col items-start" style={{ direction: 'rtl' }}>
      {invites.map(inv => (
        <div key={inv.id} className="bg-slate-900 border border-indigo-500/50 shadow-2xl p-4 rounded-2xl w-72 transform animate-in slide-in-from-top-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-indigo-400">
               <Gamepad2 className="w-5 h-5" />
               <span className="font-bold text-sm">دعوة للعب</span>
            </div>
            <button 
              onClick={() => deleteGameInvite(inv.id)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-slate-300">
             يدعوك <span className="font-bold text-indigo-400">{inv.fromName}</span> للانضمام إلى الغرفة:
             <div className="mt-1 font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded inline-block text-xs">
                {inv.roomData?.roomId}
             </div>
          </div>
          <div className="flex gap-2 mt-2">
             <button 
               onClick={() => {
                 deleteGameInvite(inv.id);
                 navigate(`/room/${inv.roomData.roomId}`);
               }}
               className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-lg text-sm transition-colors"
             >
               قبول
             </button>
             <button 
               onClick={() => deleteGameInvite(inv.id)}
               className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold py-1.5 rounded-lg text-sm transition-colors"
             >
               تجاهل
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}
