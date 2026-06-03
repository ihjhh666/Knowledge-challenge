import React, { useState, useEffect } from 'react';
import { ACHIEVEMENTS, getUnlockedAchievements, getPlayerStats, Rarity, Achievement } from '../lib/achievements';
import { Trophy, ChevronRight, Lock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Achievements() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [stats, setStats] = useState(getPlayerStats());
  const [filter, setFilter] = useState<Rarity | 'all'>('all');

  useEffect(() => {
    setUnlockedIds(getUnlockedAchievements());
    setStats(getPlayerStats());
    
    const handleUpdate = () => {
       setUnlockedIds(getUnlockedAchievements());
       setStats(getPlayerStats());
    };
    window.addEventListener('achievement_unlocked', handleUpdate);
    return () => window.removeEventListener('achievement_unlocked', handleUpdate);
  }, []);

  const getRarityConfig = (rarity: Rarity) => {
    switch (rarity) {
      case 'common': return { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-400', label: 'عادية' };
      case 'medium': return { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400', label: 'متوسطة' };
      case 'rare': return { bg: 'bg-purple-900/40', border: 'border-purple-500/60', text: 'text-purple-400', label: 'نادرة' };
      case 'legendary': return { bg: 'bg-amber-900/50', border: 'border-amber-400', text: 'text-amber-400', label: 'أسطورية', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]' };
    }
  };

  const filteredAchievements = ACHIEVEMENTS.filter(a => filter === 'all' || a.rarity === filter);

  const totalLegendary = ACHIEVEMENTS.filter(a => a.rarity === 'legendary').length;
  const unlockedLegendary = unlockedIds.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.rarity === 'legendary').length;

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-20">
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
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === r ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
               {r === 'all' ? 'الكل' : getRarityConfig(r).label}
            </button>
         ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filteredAchievements.map(ach => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const conf = getRarityConfig(ach.rarity);
            const rawProgress = ach.getProgress(stats);
            const progress = Math.min(rawProgress, ach.targetMax);
            const pct = Math.round((progress / ach.targetMax) * 100);

            return (
               <div key={ach.id} className={`relative p-5 rounded-2xl border transition-all ${isUnlocked ? `${conf.bg} ${conf.border} ${conf.glow || ''}` : 'bg-slate-900 border-slate-800 opacity-80'} overflow-hidden flex flex-col justify-between group`}>
                  {isUnlocked && ach.rarity === 'legendary' && (
                     <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/5 via-transparent to-amber-200/10 mix-blend-overlay pointer-events-none"></div>
                  )}

                  <div className="flex items-start gap-4 z-10 relative">
                     <div className={`p-3 rounded-xl shrink-0 ${isUnlocked ? 'bg-white/10' : 'bg-slate-800'} ${isUnlocked && ach.rarity === 'legendary' ? 'animate-pulse shadow-inner' : ''}`}>
                        {isUnlocked ? <ach.icon className={`w-8 h-8 ${conf.text}`} /> : <Lock className="w-8 h-8 text-slate-600" />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{ach.title}</h3>
                           {!isUnlocked && <span className="text-[10px] bg-slate-800 px-2 rounded-full text-slate-500">{conf.label}</span>}
                        </div>
                        <p className={`text-sm ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>{ach.description}</p>
                     </div>
                  </div>

                  {!isUnlocked && (
                     <div className="mt-4 pt-4 border-t border-slate-800/50 relative z-10">
                        <div className="flex justify-between text-xs mb-2">
                           <span className="text-slate-500">التقدم</span>
                           <span className="text-slate-400 font-mono">{progress} / {ach.targetMax}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                           <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${pct}%` }}></div>
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
