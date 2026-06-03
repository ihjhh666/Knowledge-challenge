import React, { useState } from 'react';
import { useGame } from '../components/GameContext';
import { RoomPlayer } from '../lib/types';
import { storage } from '../lib/storage';
import { Check, Clock, Users, Play, Copy, Hand, MicOff, Mic, UserMinus, Settings, Crown } from 'lucide-react';

const CATEGORIES = [
  '🧠 معلومات عامة',
  '⚽ كرة قدم',
  '📜 تاريخ',
  '🔬 علوم',
  '🎬 أفلام',
  '🎌 أنمي',
  '🧮 رياضيات',
];

export default function Lobby() {
      const { state, toggleReady, playerId, isHost, startGame, kickPlayer, mutePlayer, changeCategory, changeGameMode, transferHost, sendHockeyEvent } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  if (!state) return null;

  const players: RoomPlayer[] = Object.values(state.players);
  const allReady = players.every(p => p.isReady);

  const copyRoomId = () => {
    navigator.clipboard.writeText(state.roomId);
    alert('تم نسخ الرمز!');
  };

  const copyInviteLink = () => {
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
                 {state.gameMode === 'fishing' ? '🎣 صيد السمك' : state.gameMode === 'domino' ? '🎲 الدومينو' : state.category}
               </span>
            )}
            {state.gameMode === 'fishing' && (
               <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-500/30">
                 صيد جماعي
               </span>
            )}
            {isHost && (
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="ml-2 bg-slate-700 hover:bg-slate-600 p-1.5 rounded-lg transition-colors text-slate-300"
                title="إعدادات الغرفة"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm">{players.length} / {state.maxPlayers || 10} لاعبين</p>
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

      {isHost && showSettings && (
        <div className="bg-slate-800/80 border border-indigo-500/30 p-6 rounded-3xl animate-fade-in space-y-4">
          <h3 className="text-slate-200 font-bold mb-2">إعدادات الغرفة المباشرة</h3>
          
          <div>
            <label className="block text-slate-400 text-sm mb-2">نوع اللعبة</label>
            <select 
              value={state.gameMode === 'hockey' && state.hockeyState?.is2v2 ? 'hockey-2v2' : state.gameMode || 'quiz'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'hockey-2v2') {
                   changeGameMode('hockey');
                   sendHockeyEvent({ type: 'CHANGE_HOCKEY_MODE', is2v2: true });
                } else if (val === 'hockey') {
                   changeGameMode('hockey');
                   sendHockeyEvent({ type: 'CHANGE_HOCKEY_MODE', is2v2: false });
                } else {
                   changeGameMode(val as any);
                }
              }}
              className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none"
            >
              <option value="quiz">🧠 تحدي المعرفة</option>
              <option value="fishing">🎣 صيد السمك</option>
              <option value="penalty">⚽ ركلات الجزاء</option>
              <option value="domino">🎲 الدومينو (1 ضد 1)</option>
              <option value="hockey">🏒 الهوكي (1 ضد 1)</option>
              <option value="hockey-2v2">🏒 الهوكي (2 ضد 2)</option>
            </select>
          </div>

          {(state.gameMode === 'quiz' || !state.gameMode) && (
            <div>
              <label className="block text-slate-400 text-sm mb-2">تغيير التصنيف</label>
              <select 
                value={state.category}
                onChange={(e) => changeCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {state.gameMode === 'hockey' && state.hockeyState?.is2v2 ? (
        <div className="grid md:grid-cols-2 gap-6">
           <div className="bg-blue-900/10 border border-blue-500/30 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">الفريق الأزرق</h3>
              <div className="space-y-3">
                 {[0, 1].map(i => {
                    const id = state.hockeyState?.team1?.[i];
                    const p = id ? state.players[id] : null;
                    if (p) {
                       return (
                         <div key={p.id} className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => window.dispatchEvent(new CustomEvent('open_player_profile', { detail: p.id }))}>
                               <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                  {p.avatarUrl || p.id ? (
                                     <img src={p.id === playerId ? storage.getPlayerAvatar() : (p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}`)} className="w-full h-full object-cover" />
                                  ) : (
                                     <Users className="w-5 h-5 text-blue-300" />
                                  )}
                               </div>
                               <div>
                                  <p className="font-bold text-blue-100">{p.username} {p.id === playerId && '(أنت)'}</p>
                                  <p className="text-xs text-blue-400">{p.id.startsWith('bot-') ? 'الجهاز' : 'لاعب'}</p>
                               </div>
                            </div>
                            {isHost && p.id.startsWith('bot-') && (
                                <button onClick={() => sendHockeyEvent({ type: 'REMOVE_BOT', botId: p.id })} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg"><UserMinus className="w-4 h-4"/></button>
                            )}
                         </div>
                       );
                    } else {
                       return (
                         <div key={`empty-1-${i}`} className="bg-slate-800/50 border border-slate-700 border-dashed p-3 rounded-2xl flex items-center justify-between min-h-[66px]">
                            <span className="text-slate-500 font-bold">مكان فارغ</span>
                            <div className="flex gap-2">
                               {!state.hockeyState?.team1?.includes(playerId) && (
                                   <button onClick={() => sendHockeyEvent({ type: 'ASSIGN_TEAM', team: 'team1', pId: playerId })} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold">
                                       {state.hockeyState?.team2?.includes(playerId) ? 'تغيير الفريق' : 'انضمام'}
                                   </button>
                               )}
                               {isHost && <button onClick={() => sendHockeyEvent({ type: 'ADD_BOT', team: 'team1' })} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg font-bold">+ بوت</button>}
                            </div>
                         </div>
                       );
                    }
                 })}
              </div>
           </div>
           
           <div className="bg-rose-900/10 border border-rose-500/30 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-rose-400 mb-4 text-center">الفريق الأحمر</h3>
              <div className="space-y-3">
                 {[0, 1].map(i => {
                    const id = state.hockeyState?.team2?.[i];
                    const p = id ? state.players[id] : null;
                    if (p) {
                       return (
                         <div key={p.id} className="bg-rose-900/30 border border-rose-500/50 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => window.dispatchEvent(new CustomEvent('open_player_profile', { detail: p.id }))}>
                               <div className="w-10 h-10 bg-rose-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                  {p.avatarUrl || p.id ? (
                                     <img src={p.id === playerId ? storage.getPlayerAvatar() : (p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}`)} className="w-full h-full object-cover" />
                                  ) : (
                                     <Users className="w-5 h-5 text-rose-300" />
                                  )}
                               </div>
                               <div>
                                  <p className="font-bold text-rose-100">{p.username} {p.id === playerId && '(أنت)'}</p>
                                  <p className="text-xs text-rose-400">{p.id.startsWith('bot-') ? 'الجهاز' : 'لاعب'}</p>
                               </div>
                            </div>
                            {isHost && p.id.startsWith('bot-') && (
                                <button onClick={() => sendHockeyEvent({ type: 'REMOVE_BOT', botId: p.id })} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg"><UserMinus className="w-4 h-4"/></button>
                            )}
                         </div>
                       );
                    } else {
                       return (
                         <div key={`empty-2-${i}`} className="bg-slate-800/50 border border-slate-700 border-dashed p-3 rounded-2xl flex items-center justify-between min-h-[66px]">
                            <span className="text-slate-500 font-bold">مكان فارغ</span>
                            <div className="flex gap-2">
                               {!state.hockeyState?.team2?.includes(playerId) && (
                                   <button onClick={() => sendHockeyEvent({ type: 'ASSIGN_TEAM', team: 'team2', pId: playerId })} className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg font-bold">
                                       {state.hockeyState?.team1?.includes(playerId) ? 'تغيير الفريق' : 'انضمام'}
                                   </button>
                               )}
                               {isHost && <button onClick={() => sendHockeyEvent({ type: 'ADD_BOT', team: 'team2' })} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg font-bold">+ بوت</button>}
                            </div>
                         </div>
                       );
                    }
                 })}
              </div>
           </div>
           
           <div className="col-span-full mb-4">
              <h3 className="text-slate-400 font-bold mb-2">لاعبين لم ينضموا بعد:</h3>
              <div className="flex flex-wrap gap-2">
                 {players.filter(p => !state.hockeyState?.team1?.includes(p.id) && !state.hockeyState?.team2?.includes(p.id) && !p.id.startsWith('bot-')).map(p => (
                    <div key={p.id} className="bg-slate-800 px-3 py-1 rounded-full text-slate-300 text-sm">{p.username}</div>
                 ))}
                 {players.filter(p => !state.hockeyState?.team1?.includes(p.id) && !state.hockeyState?.team2?.includes(p.id) && !p.id.startsWith('bot-')).length === 0 && (
                    <span className="text-slate-500 text-sm">لا يوجد</span>
                 )}
              </div>
           </div>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 gap-4">
        {players.map((p) => {
          const isMe = p.id === playerId;
          const playerAvatar = isMe ? storage.getPlayerAvatar() : p.avatarUrl;
          return (
            <div key={p.id} className={`p-4 rounded-2xl border ${isMe ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800 border-slate-700'} flex items-center justify-between group`}>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => window.dispatchEvent(new CustomEvent('open_player_profile', { detail: p.id }))}>
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center relative shrink-0">
                  {playerAvatar || p.userId ? (
                     <img src={playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId || p.id}`} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                     <Users className="w-5 h-5 text-slate-400" />
                  )}
                  {p.isMuted && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white border-2 border-slate-800 rounded-full p-0.5">
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-200 flex items-center gap-2">
                    {p.username} 
                    {isMe && <span className="text-indigo-400 text-xs">(أنت)</span>}
                  </p>
                  <p className="text-xs text-slate-400">{p.isHost ? 'المضيف' : 'لاعب'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isHost && !isMe && (
                  <div className="flex items-center gap-2 mr-2">
                    <button 
                      onClick={() => transferHost(p.id)}
                      className="p-2 border border-slate-600 rounded-lg text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"
                      title="ترقية إلى مضيف"
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => mutePlayer(p.id, !p.isMuted)}
                      className="p-2 border border-slate-600 rounded-lg text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
                      title={p.isMuted ? "إلغاء الكتم" : "كتم من الدردشة"}
                    >
                      {p.isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => kickPlayer(p.id)}
                      className="p-2 border border-slate-600 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
                      title="طرد اللاعب"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
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
      )}

      <div className="flex gap-4">
        <button
          onClick={toggleReady}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 ${
            state.players[playerId]?.isReady 
              ? 'bg-amber-600 hover:bg-amber-700 text-white border-b-4 border-amber-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800'
          }`}
        >
          {state.players[playerId]?.isReady ? 'إلغاء الاستعداد' : 'أنا مستعد!'}
        </button>

        {isHost && (
          <button
            onClick={startGame}
            disabled={!allReady || (state.gameMode === 'hockey' && state.hockeyState?.is2v2 ? (state.hockeyState.team1?.length !== 2 || state.hockeyState.team2?.length !== 2) : (players.length < 2 || (state.gameMode === 'domino' && players.length !== 2) || (state.gameMode === 'penalty' && players.length !== 2)))}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:border-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 border-b-4 border-indigo-800 disabled:cursor-not-allowed disabled:border-b-0"
          >
            <Play className="w-5 h-5" />
            ابدأ اللعب
          </button>
        )}
      </div>
    </div>
  );
}
