import React, { useState, useEffect } from 'react';
import { ACHIEVEMENTS, getUnlockedAchievements, getPlayerStats, Rarity, syncFirebaseAchievementsToLocal } from '../lib/achievements';
import { Trophy, ChevronRight, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { storage } from '../lib/storage';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Achievements() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [stats, setStats] = useState(getPlayerStats());
  const [filter, setFilter] = useState<Rarity | 'all'>('all');
  const [fbAchievements, setFbAchievements] = useState<{ id: string; date: number }[]>([]);

  const isGuest = user?.user_metadata?.account_type === 'guest';
  const playerId = storage.getPlayerId();

  useEffect(() => {
    if (isGuest) return;
    setUnlockedIds(getUnlockedAchievements());
    setStats(getPlayerStats());
    
    // Fetch from Firebase for dates
    const fetchFbData = async () => {
      if (db && playerId) {
        try {
           const snap = await getDoc(doc(db, 'users', playerId));
           if (snap.exists() && snap.data().unlockedAchievements) {
              setFbAchievements(snap.data().unlockedAchievements);
              syncFirebaseAchievementsToLocal(snap.data().unlockedAchievements);
           }
        } catch (e) { console.error(e); }
      }
    };
    fetchFbData();
    
    const handleUpdate = () => {
       setUnlockedIds(getUnlockedAchievements());
       setStats(getPlayerStats());
       fetchFbData();
    };
    window.addEventListener('achievement_unlocked', handleUpdate);
    return () => window.removeEventListener('achievement_unlocked', handleUpdate);
  }, [isGuest, playerId]);

  if (isGuest) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 space-y-8" dir="rtl">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-2 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold font-heading text-amber-400">الإنجازات</h1>
        </header>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-3">خاصية غير متاحة للزوار</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">قم بإنشاء حساب دائم لحفظ تقدمك وفتح الإنجازات وجمع الجوائز والترقيات.</p>
          <button 
            onClick={async () => {
              await logout();
              navigate('/register');
            }}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <LogIn className="w-5 h-5" /> إنشاء حساب دائم
          </button>
        </div>
      </div>
    );
  }

  const getRarityConfig = (rarity: Rarity) => {
    switch (rarity) {
      case 'common': return { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-400', label: 'عادية' };
      case 'medium': return { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400', label: 'متوسطة' };
      case 'rare': return { bg: 'bg-purple-900/50', border: 'border-purple-400', text: 'text-purple-300', label: 'نادرة', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' };
      case 'legendary': return { bg: 'bg-amber-900/60', border: 'border-amber-400', text: 'text-amber-400', label: 'أسطورية', glow: 'shadow-[0_0_25px_rgba(251,191,36,0.5)]' };
    }
  };

  const filteredAchievements = ACHIEVEMENTS.filter(a => filter === 'all' || a.rarity === filter);

  const totalLegendary = ACHIEVEMENTS.filter(a => a.rarity === 'legendary').length;
  const unlockedLegendary = unlockedIds.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.rarity === 'legendary').length;

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition">
              <ChevronRight className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-white flex items-center gap-3">
                 <Trophy className="w-8 h-8 text-amber-400" />
                 الإنجازات
              </h1>
              <p className="text-slate-400 mt-1">تتبع مسيرتك وافتح الجوائز المميزة</p>
            </div>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl flex-1 md:flex-none text-center">
              <div className="text-xs text-slate-400 mb-1">نسبة الإكمال</div>
              <div className="text-xl font-bold text-white">{Math.round((unlockedIds.length / ACHIEVEMENTS.length) * 100)}%</div>
            </div>
            <div className="bg-amber-900/30 border border-amber-500/30 p-3 rounded-2xl flex-1 md:flex-none text-center">
               <div className="text-xs text-amber-500/70 mb-1">الأسطورية</div>
               <div className="text-xl font-bold text-amber-400">{unlockedLegendary} / {totalLegendary}</div>
            </div>
         </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
         {(['all', 'common', 'medium', 'rare', 'legendary'] as const).map(r => (
            <button 
              key={r}
              onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === r ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
               {r === 'all' ? 'الكل' : getRarityConfig(r).label}
            </button>
         ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
         {filteredAchievements.map(ach => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const conf = getRarityConfig(ach.rarity);
            const rawProgress = ach.getProgress(stats);
            const progress = Math.min(rawProgress, ach.targetMax);
            const pct = Math.round((progress / ach.targetMax) * 100);
            
            const fbData = fbAchievements.find(f => f.id === ach.id);
            const unlockDate = fbData ? new Date(fbData.date).toLocaleDateString('ar-SA') : null;

            return (
               <div key={ach.id} className={`relative p-5 rounded-2xl border transition-all duration-300 ${isUnlocked ? `${conf.bg} ${conf.border} ${conf.glow || ''} hover:scale-[1.02]` : 'bg-slate-900 border-slate-800 opacity-70'} overflow-hidden flex flex-col justify-between group`}>
                  {isUnlocked && ach.rarity === 'legendary' && (
                     <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-transparent to-amber-200/20 mix-blend-overlay pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                     </>
                  )}
                  {isUnlocked && ach.rarity === 'rare' && (
                     <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/10 via-transparent to-purple-200/10 mix-blend-overlay pointer-events-none"></div>
                  )}

                  <div className="flex items-start gap-4 z-10 relative">
                     <div className={`p-3.5 rounded-xl shrink-0 ${isUnlocked ? 'bg-white/10' : 'bg-slate-800'} ${isUnlocked && ach.rarity === 'legendary' ? 'shadow-[0_0_15px_rgba(251,191,36,0.6)]' : ''}`}>
                        {isUnlocked ? <ach.icon className={`w-8 h-8 ${conf.text} ${ach.rarity === 'legendary' ? 'drop-shadow-md animate-pulse' : ''}`} /> : <Lock className="w-8 h-8 text-slate-600" />}
                     </div>
                     <div className="flex-1 w-full relative">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className={`font-bold text-lg leading-tight ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{ach.title}</h3>
                           {!isUnlocked && <span className="text-[10px] bg-slate-800 px-2 rounded-full text-slate-500 shrink-0">{conf.label}</span>}
                        </div>
                        <p className={`text-sm leading-snug mt-1.5 ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>{ach.description}</p>
                     </div>
                  </div>

                  {!isUnlocked ? (
                     <div className="mt-5 pt-4 border-t border-slate-800/50 relative z-10">
                        <div className="flex justify-between text-xs mb-2">
                           <span className="text-slate-500">التقدم</span>
                           <span className="text-slate-400 font-mono">{progress} / {ach.targetMax}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                           <div className="h-full bg-indigo-500 transition-all duration-1000 relative" style={{ width: `${pct}%` }}>
                              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20"></div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
                        <div className="flex justify-between items-center">
                           <span className={`text-xs font-bold px-2 py-1 rounded-md ${isUnlocked ? (ach.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300' : ach.rarity === 'rare' ? 'bg-purple-500/20 text-purple-300' : ach.rarity === 'medium' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300') : ''}`}>
                             {conf.label}
                           </span>
                           {unlockDate && <span className="text-[10px] text-white/50">{unlockDate}</span>}
                        </div>
                     </div>
                  )}
               </div>
            );
         })}
      </div>
    </div>
  );
}
