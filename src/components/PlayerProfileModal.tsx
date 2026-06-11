import React, { useEffect, useState } from 'react';
import { db, PlayerStats, subscribeToFriends, respondToFriendRequest, deleteFriend, sendFriendRequest } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { X, User, Trophy, Star, Target, CheckCircle, XCircle, Gamepad2, Users, UserPlus, FileArchive, UserCheck, Clock } from 'lucide-react';
import { ACHIEVEMENTS, Rarity } from '../lib/achievements';
import { storage } from '../lib/storage';
import { calculateLevel } from '../lib/level';

interface Props {
  targetPlayerId: string;
  onClose: () => void;
}

export function PlayerProfileModal({ targetPlayerId, onClose }: Props) {
  const myPlayerId = storage.getPlayerId();
  const myPlayerName = storage.getPlayerName();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [myFriends, setMyFriends] = useState<any[]>([]);
  const [myPending, setMyPending] = useState<any[]>([]);
  
  const isMe = targetPlayerId === myPlayerId;

  useEffect(() => {
    const fetchStats = async () => {
      if (!db || !targetPlayerId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', targetPlayerId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setStats(snap.data() as PlayerStats);
        }
      } catch(err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [targetPlayerId]);

  useEffect(() => {
     if (!myPlayerId || isMe) return;
     const unsub = subscribeToFriends(myPlayerId, (friends, pending) => {
         setMyFriends(friends);
         setMyPending(pending);
     });
     return unsub;
  }, [myPlayerId, isMe]);

  const sendRequest = () => {
      if (myPlayerId) {
          sendFriendRequest(myPlayerId, myPlayerName, targetPlayerId);
      }
  };

  const cancelRequest = () => {
      const req = myPending.find(r => r.toId === targetPlayerId);
      if (req) deleteFriend(req.id);
  };

  const unfriend = () => {
      const req = myFriends.find(f => f.friendId === targetPlayerId);
      if (req) deleteFriend(req.id);
  };

  const isFriend = myFriends.some(f => f.friendId === targetPlayerId);
  const isPendingSent = myPending.some(r => r.toId === targetPlayerId && r.fromId === myPlayerId);
  const isPendingReceived = myPending.some(r => r.fromId === targetPlayerId && r.toId === myPlayerId);

  const getRarityConfig = (rarity: Rarity) => {
    switch (rarity) {
      case 'common': return { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-400', label: 'عادية' };
      case 'medium': return { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400', label: 'متوسطة' };
      case 'rare': return { bg: 'bg-purple-900/40', border: 'border-purple-500/60', text: 'text-purple-400', label: 'نادرة' };
      case 'legendary': return { bg: 'bg-amber-900/50', border: 'border-amber-400', text: 'text-amber-400', label: 'أسطورية', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' };
    }
  };

  const unlockedIds = stats?.unlockedAchievements?.map(a => a.id) || [];
  const legendaryCount = unlockedIds.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.rarity === 'legendary').length;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose} dir="rtl">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-24 bg-gradient-to-r from-indigo-900 to-slate-900 border-b border-slate-800 shrink-0">
           <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>
        
        {loading ? (
           <div className="p-12 flex justify-center h-full items-center">
             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
           </div>
        ) : !stats ? (
           <div className="p-12 text-center text-slate-400 h-full flex flex-col justify-center items-center">
             <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-700">
                <User className="w-10 h-10 text-slate-500" />
             </div>
             <h3 className="text-xl font-bold font-heading text-white mb-2">اللاعب غير موجود</h3>
             <p className="text-sm text-slate-500">عذراً، لم نتمكن من العثور على بيانات هذا اللاعب. قد يكون الحساب محذوفاً أو المعرف غير صحيح.</p>
           </div>
        ) : (
           <div className="px-6 pb-6 pt-0 relative flex flex-col flex-1 overflow-y-auto">
              <div className="flex justify-between items-start">
                 <div className="relative -mt-12 mb-4">
                   <img src={stats.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${stats.shortId || targetPlayerId}`} className="w-24 h-24 rounded-2xl border-4 border-slate-900 bg-slate-900 object-cover" />
                 </div>
                 {!isMe && (
                    <div className="mt-4">
                       {isFriend ? (
                          <button onClick={unfriend} className="flex flex-col items-center gap-1 text-emerald-400 hover:text-emerald-500 transition-colors text-xs font-bold">
                             <div className="bg-emerald-500/20 p-2 rounded-xl"><UserCheck className="w-5 h-5" /></div>
                             صديق
                          </button>
                       ) : isPendingSent ? (
                          <button onClick={cancelRequest} className="flex flex-col items-center gap-1 text-amber-400 hover:text-amber-500 transition-colors text-xs font-bold">
                             <div className="bg-amber-500/20 p-2 rounded-xl"><Clock className="w-5 h-5" /></div>
                             تم إرسال الطلب
                          </button>
                       ) : isPendingReceived ? (
                          <button onClick={() => {
                             const req = myPending.find(r => r.fromId === targetPlayerId && r.toId === myPlayerId);
                             if (req) respondToFriendRequest(req.id, true);
                          }} className="flex flex-col items-center gap-1 text-sky-400 hover:text-sky-500 transition-colors text-xs font-bold">
                             <div className="bg-sky-500/20 p-2 rounded-xl"><UserPlus className="w-5 h-5" /></div>
                             قبول الطلب
                          </button>
                       ) : (
                          <button onClick={sendRequest} className="flex flex-col items-center gap-1 text-indigo-400 hover:text-indigo-500 transition-colors text-xs font-bold">
                             <div className="bg-indigo-500/20 p-2 rounded-xl"><UserPlus className="w-5 h-5" /></div>
                             إرسال طلب صداقة
                          </button>
                       )}
                    </div>
                 )}
              </div>

              <div>
                 <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    {stats.playerName}
                     {(() => {
                        const { level } = calculateLevel(stats.totalXp || 0);
                        const isHighLevel = level >= 10;
                        return (
                           <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold border ${isHighLevel ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
                              Lvl {level}
                           </span>
                        );
                     })()}
                 </h2>
                 <p className="text-slate-500 font-mono text-xs flex items-center gap-2 mt-1">
                   <span className="bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-400 font-bold tracking-widest">{stats.shortId || targetPlayerId.substring(0,8)}</span>
                 </p>
                 <div className="flex items-center gap-4 mt-3 border-t border-slate-800/50 pt-3 w-max">
                   {stats.createdAt && (
                      <p className="text-slate-400 text-[10px] sm:text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> انضم في {new Date(stats.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                   )}
                   {stats.lastUpdated && (
                      <p className="text-slate-400 text-[10px] sm:text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> آخر نشاط: {new Date(stats.lastUpdated).toLocaleDateString('ar-EG')}
                      </p>
                   )}
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-6">
                 <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-center">
                    <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 mb-0.5">الانتصارات</p>
                    <p className="font-bold text-slate-200">{stats.wins || 0}</p>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-center">
                    <Gamepad2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 mb-0.5">المباريات</p>
                    <p className="font-bold text-slate-200">{stats.gamesPlayed || 0}</p>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-center flex flex-col justify-center">
                    <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 mb-0.5">نسبة الفوز</p>
                    <p className="font-bold text-slate-200">{stats.gamesPlayed ? Math.round(((stats.wins || 0) / stats.gamesPlayed) * 100) : 0}%</p>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-center">
                    <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 mb-0.5">نقاط المعرفة</p>
                    <p className="font-bold text-slate-200">{(stats.totalPoints || 0).toLocaleString()}</p>
                 </div>
              </div>

              <div className="mt-8">
                 <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-indigo-400" /> الإنجازات المفتوحة</span>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-300 font-mono">{unlockedIds.length} / {ACHIEVEMENTS.length}</span>
                 </h3>
                 
                 {unlockedIds.length > 0 ? (
                    <div className="space-y-3">
                       {ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).slice(0, 5).map(ach => {
                          const conf = getRarityConfig(ach.rarity);
                          const acDate = stats.unlockedAchievements?.find(a => a.id === ach.id)?.date;
                          return (
                             <div key={ach.id} className={`flex items-center gap-4 p-3 rounded-2xl border ${conf.bg} ${conf.border} ${conf.glow || ''} relative overflow-hidden`}>
                               {ach.rarity === 'legendary' && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                               )}
                               <div className="p-2 bg-white/10 rounded-xl shrink-0">
                                 <ach.icon className={`w-6 h-6 ${conf.text}`} />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-sm flex items-center justify-between">
                                     {ach.title}
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full bg-slate-900/50 ${conf.text}`}>{conf.label}</span>
                                  </h4>
                                  <p className="text-xs text-slate-300 opacity-90 truncate mt-0.5">{ach.description}</p>
                                  {acDate && <p className="text-[10px] text-slate-400 mt-1 opacity-70 border-t border-slate-700/50 pt-1 w-max">تم الفتح: {new Date(acDate).toLocaleDateString()}</p>}
                               </div>
                             </div>
                          );
                       })}
                       {unlockedIds.length > 5 && (
                          <div className="text-center pt-2">
                             <p className="text-xs text-slate-500">و {unlockedIds.length - 5} إنجازات أخرى</p>
                          </div>
                       )}
                    </div>
                 ) : (
                    <div className="text-center p-6 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                       <p className="text-slate-500 text-sm">لم يفتح أي إنجازات بعد</p>
                    </div>
                 )}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
