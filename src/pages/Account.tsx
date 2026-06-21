import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { storage } from '../lib/storage';
import { User, LogOut, Settings as SettingsIcon, Trophy, Star } from 'lucide-react';
import { calculateLevel } from '../lib/level';
import { getPlayerStats } from '../lib/achievements';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState({ level: 1, currentLevelXp: 0, nextLevelXp: 1000, progress: 0 });
  const [rank, setRank] = useState('مبتدئ');

  useEffect(() => {
    const xp = getPlayerStats().totalXp || 0;
    const levelInfo = calculateLevel(xp);
    setLevel(levelInfo);
    
    // Quick rank calculation
    let r = 'مبتدئ';
    if (levelInfo.level > 5) r = 'هاوي';
    if (levelInfo.level > 10) r = 'محترف';
    if (levelInfo.level > 20) r = 'خبير';
    if (levelInfo.level > 50) r = 'أسطورة';
    setRank(r);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4 md:p-12 pb-32 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-heading text-white">الحساب</h2>
        <p className="text-slate-400 mt-2">إدارة حسابك وإعدادات اللعبة</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
           <img 
              src={storage.getPlayerAvatar() || `https://api.dicebear.com/7.x/bottts/svg?seed=${storage.getPlayerId()}`} 
              className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 object-cover" 
              alt="avatar"
           />
           <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white font-bold font-mono px-2 py-1 rounded-lg text-xs shadow-lg">
             Lv.{level.level}
           </div>
        </div>
        <div className="flex-1 text-center sm:text-right w-full">
           <h3 className="text-2xl font-bold text-white mb-1">{storage.getPlayerName() || 'لاعب مجهول'}</h3>
           <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 mb-4">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm tracking-wide">{rank}</span>
           </div>
           
           <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
             <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${level.progress}%` }}></div>
           </div>
           <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
             <span>{level.currentLevelXp} XP</span>
             <span>{level.nextLevelXp} XP</span>
           </div>
        </div>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="relative overflow-hidden flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] active:scale-95 transition-all text-right group shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/5 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 bg-indigo-500/10 p-3.5 rounded-2xl group-hover:bg-indigo-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
            <User className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">الملف الشخصي</h3>
            <p className="text-sm text-slate-400">تعديل الصورة والاسم والإحصائيات</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/achievements')}
          className="relative overflow-hidden flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-95 transition-all text-right group shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 bg-amber-500/10 p-3.5 rounded-2xl group-hover:bg-amber-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">الإنجازات</h3>
            <p className="text-sm text-slate-400">عرض الأوسمة والمهام المكتملة</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="relative overflow-hidden flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl hover:border-slate-400/50 hover:shadow-[0_0_20px_rgba(148,163,184,0.15)] active:scale-95 transition-all text-right group shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600/0 via-slate-600/5 to-slate-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 bg-slate-800 p-3.5 rounded-2xl group-hover:bg-slate-700 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(148,163,184,0.3)] transition-all">
            <SettingsIcon className="w-6 h-6 text-slate-300" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-slate-200 transition-colors">الإعدادات</h3>
            <p className="text-sm text-slate-400">الصوت، الموسيقى والمظهر</p>
          </div>
        </button>

        {user?.user_metadata?.account_type !== 'guest' && (
          <button
            onClick={handleLogout}
            className="relative overflow-hidden flex items-center gap-4 bg-slate-900 border border-rose-500/20 p-4 rounded-3xl hover:bg-rose-500 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] active:scale-95 transition-all text-right mt-4 group shadow-lg"
          >
            <div className="relative z-10 bg-rose-500/10 p-3.5 rounded-2xl group-hover:bg-white/20 group-hover:-translate-x-1 transition-all">
              <LogOut className="w-6 h-6 text-rose-400 group-hover:text-white" />
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="text-lg font-bold text-rose-400 mb-1 group-hover:text-white transition-colors">تسجيل الخروج</h3>
              <p className="text-sm text-rose-400/60 group-hover:text-white/80 transition-colors">تسجيل الخروج من الحساب الحالي</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
