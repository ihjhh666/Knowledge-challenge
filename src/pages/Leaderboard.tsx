import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trophy, Medal, Star, Target } from 'lucide-react';
import { syncLocalStatsToFirebase, PlayerStats, subscribeToLeaderboard as subscribeToLeaderboardFirebase } from '../lib/firebase';
import { supabaseService } from '../services/supabaseService';
import { storage } from '../lib/storage';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState<'wins' | 'totalPoints' | 'successRate'>('totalPoints');
  const [dbStats, setDbStats] = useState({ fetched: 0 });

  const myPlayerId = storage.getPlayerId();
  const myPlayerName = storage.getPlayerName() || 'لاعب مجهول';
  const myAvatar = storage.getPlayerAvatar();

  useEffect(() => {
    setLoading(true);
    let unsubscribe: (() => void) | undefined;
    
    // Sync local stats to firebase first (legacy)
    syncLocalStatsToFirebase(myPlayerId, myPlayerName).finally(() => {
        unsubscribe = subscribeToLeaderboardFirebase(sortMethod, (data: PlayerStats[]) => {
          setLeaders(data);
          setDbStats({ fetched: data.length });
          setLoading(false);
        });
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sortMethod, myPlayerId, myPlayerName]);

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-heading flex items-center gap-2 text-amber-400">
            <Trophy className="w-8 h-8" />
            لوحة المتصدرين
          </h1>
          <p className="text-slate-400 mt-1">أفضل اللاعبين في المنصة</p>
        </div>
        
        {/* Debug Info */}
        <div className="hidden sm:flex flex-col text-xs text-slate-500 bg-slate-900 border border-slate-800 p-2 rounded-lg text-right min-w-[120px]">
           <span>السجلات المقروءة: {dbStats.fetched}</span>
           <span>أخر تحديث: {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      <div className="flex gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl w-fit">
        <SortButton active={sortMethod === 'totalPoints'} onClick={() => setSortMethod('totalPoints')} icon={Star} label="النقاط" />
        <SortButton active={sortMethod === 'wins'} onClick={() => setSortMethod('wins')} icon={Medal} label="الانتصارات" />
        <SortButton active={sortMethod === 'successRate'} onClick={() => setSortMethod('successRate')} icon={Target} label="نسبة الفوز / الإجابات" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">لا توجد بيانات حالياً</div>
        ) : (
          <div className="divide-y divide-slate-800/0 p-2">
            {/* نظام تشخيص مؤقت: Diagnostics */}
            <div className="p-4 bg-slate-950 text-emerald-400 text-xs font-mono border-b border-slate-800">
                [Diagnostics] اللاعبون في قاعدة البيانات: تم تحميل {leaders.length} سجل بنجاح.
            </div>
            {leaders.map((player, idx) => {
              const winRate = player.gamesPlayed > 0 ? Math.round((player.wins / player.gamesPlayed) * 100) : 0;
              const playerAvatar = player.playerId === myPlayerId ? (myAvatar || player.avatarUrl) : player.avatarUrl;
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              
              return (
              <div 
                key={player.playerId || `rank-${idx}`} 
                className={`relative group flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center p-4 mx-2 my-2 rounded-2xl transition-all duration-300 ${
                  isFirst ? 'bg-gradient-to-r from-amber-900/30 to-amber-950/30 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:-translate-y-1 hover:border-amber-400 z-10' : 
                  isSecond ? 'bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-slate-300/30 hover:-translate-y-0.5 hover:border-slate-300/50' : 
                  isThird ? 'bg-gradient-to-r from-amber-950/40 to-slate-900/40 border border-amber-700/30 hover:-translate-y-0.5 hover:border-amber-700/50' : 
                  'bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800/80'
                }`}
              >
                {/* Visual Effects */}
                {isFirst && (
                  <>
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[bg-position_2s_linear_infinite]" />
                    </div>
                    {/* Golden halo glow */}
                    <div className="absolute -inset-1 rounded-[20px] opacity-20 pointer-events-none bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 blur-md group-hover:opacity-40 transition-opacity duration-700" />
                  </>
                )}
                {isSecond && (
                  <div className="absolute -inset-0.5 rounded-[18px] opacity-10 pointer-events-none bg-gradient-to-r from-slate-300 via-white to-slate-400 blur-sm group-hover:opacity-20 transition-opacity duration-700" />
                )}

                <div 
                  className="flex items-center gap-3 w-full sm:w-auto flex-1 cursor-pointer hover:opacity-80 transition-opacity relative z-10"
                  onClick={() => window.dispatchEvent(new CustomEvent('open_player_profile', { detail: player.playerId }))}
                >
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 shrink-0 font-bold font-mono rounded-xl flex items-center justify-center relative ${
                    isFirst ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-amber-950 text-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                    isSecond ? 'bg-gradient-to-br from-slate-100 to-slate-400 text-slate-800 text-lg shadow-[0_0_10px_rgba(203,213,225,0.3)]' : 
                    isThird ? 'bg-gradient-to-br from-amber-600 to-amber-900 text-amber-100 text-lg shadow-[0_0_10px_rgba(180,83,9,0.3)]' : 
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {isFirst ? <span className="drop-shadow-sm text-2xl">👑</span> : 
                     isSecond ? <span className="drop-shadow-sm text-xl">🥈</span> : 
                     isThird ? <span className="drop-shadow-sm text-xl">🥉</span> : 
                     idx + 1}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img src={playerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.playerId}`} className={`w-11 h-11 rounded-full object-cover shrink-0 border-2 ${isFirst ? 'border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : isSecond ? 'border-slate-300' : isThird ? 'border-amber-700' : 'border-slate-700'}`} alt="avatar" />
                  </div>

                  {/* Player Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className={`font-bold truncate text-base sm:text-lg transition-colors ${
                      isFirst ? 'text-amber-400 font-extrabold tracking-wide drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 
                      isSecond ? 'text-slate-200' : 
                      isThird ? 'text-amber-600' : 
                      'text-slate-100 group-hover:text-indigo-400'
                    }`} title={player.playerName || 'لاعب مجهول'}>
                      {player.playerName || 'لاعب مجهول'}
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm text-slate-400 w-full sm:w-auto relative z-10 justify-between sm:justify-end">
                  <div className="bg-slate-950/50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg flex flex-col sm:block">
                    <span className="sm:hidden block text-[10px] text-slate-500 mb-0.5">النقاط</span>
                    <span className="sm:inline-block sm:mr-1 font-mono text-indigo-400 font-bold text-base sm:text-sm">{player.totalPoints?.toLocaleString() || 0}</span>
                  </div>
                  <div className="bg-slate-950/50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg flex flex-col sm:block">
                    <span className="sm:hidden block text-[10px] text-slate-500 mb-0.5">الانتصارات</span>
                    <span className="sm:inline-block sm:mr-1 font-mono text-emerald-400 font-bold text-base sm:text-sm">{player.wins || 0}</span>
                  </div>
                  <div className="bg-slate-950/50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg flex flex-col sm:block">
                    <span className="sm:hidden block text-[10px] text-slate-500 mb-0.5">مباريات</span>
                    <span className="sm:inline-block sm:mr-1 font-mono text-slate-300 font-bold text-base sm:text-sm">{player.gamesPlayed || 0}</span>
                  </div>
                  <div className="bg-slate-950/50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg flex flex-col sm:block">
                    <span className="sm:hidden block text-[10px] text-slate-500 mb-0.5">نسبة الفوز</span>
                    <span className="sm:inline-block sm:mr-1 font-mono text-amber-400 font-bold text-base sm:text-sm">{winRate}%</span>
                  </div>
                  <div className="bg-slate-950/50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg flex flex-col sm:block min-w-[70px]">
                    <span className="sm:hidden block text-[10px] text-slate-500 mb-0.5">الإجابات</span>
                    <span className="sm:inline-block sm:mr-1 font-mono text-sky-400 font-bold text-base sm:text-sm">{player.successRate || 0}%</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}

function SortButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
