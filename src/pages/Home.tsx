import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { useGame } from '../components/GameContext';
import { useAuth } from '../components/AuthContext';
import { Users, Plus, KeyRound, Gamepad2, Brain, Trophy, BookOpen, FlaskConical, Film, PlayCircle, Globe, ChevronRight, Lock, Link as LinkIcon, Medal, UserRound, Waves, Goal, LayoutGrid, Settings, Bell, Crown, Newspaper, HelpCircle, Shield, Edit3, ListOrdered, ChevronDown, Snowflake } from 'lucide-react';
import { subscribeToFriends } from '../lib/firebase';
import { supabaseService } from '../services/supabaseService';
import { RoomVisibility, PublicRoom } from '../lib/types';
import { FriendsSidebar } from '../components/FriendsSidebar';
import { supabase } from '../lib/supabase';
import { GameCard, GameCardTheme } from '../components/GameCard';
import { motion, AnimatePresence } from 'framer-motion';

import { CATEGORIES as SOLO_CATEGORIES } from './SoloPlay';

const ROOM_CATEGORIES = [
  { id: '🧠 معلومات عامة', name: 'معلومات عامة', icon: <Brain className="w-5 h-5"/>, themeStyle: 'quiz', primaryColor: 'from-indigo-600 to-indigo-900', glowColor: '#6366f1' },
  { id: '⚽ كرة قدم', name: 'كرة قدم', icon: '⚽', themeStyle: 'football', primaryColor: 'from-emerald-600 to-green-900', glowColor: '#10b981' },
  { id: '📜 تاريخ', name: 'تاريخ', icon: <BookOpen className="w-5 h-5"/>, themeStyle: 'history', primaryColor: 'from-amber-700 to-stone-900', glowColor: '#d97706' },
  { id: '🔬 علوم', name: 'علوم', icon: <FlaskConical className="w-5 h-5"/>, themeStyle: 'science', primaryColor: 'from-teal-600 to-cyan-900', glowColor: '#0d9488' },
  { id: '🎬 أفلام', name: 'أفلام', icon: <Film className="w-5 h-5"/>, themeStyle: 'movies', primaryColor: 'from-rose-600 to-red-900', glowColor: '#e11d48' },
  { id: '🎌 أنمي', name: 'أنمي', icon: '🎌', themeStyle: 'anime', primaryColor: 'from-red-500 to-orange-800', glowColor: '#ef4444' },
  { id: '🧮 رياضيات', name: 'رياضيات', icon: <BookOpen className="w-5 h-5"/>, themeStyle: 'math', primaryColor: 'from-blue-600 to-indigo-900', glowColor: '#2563eb' },
  { id: '🏆 من الأشهر؟', name: 'من الأشهر؟', icon: '🏆', themeStyle: 'famous', primaryColor: 'from-rose-950 to-amber-900', glowColor: '#d97706' },
  { id: '🧩 خمن الإيموجي', name: 'خمن الإيموجي', icon: '🧩', themeStyle: 'emoji', primaryColor: 'from-fuchsia-600 to-purple-900', glowColor: '#d946ef' },
  { id: '🏷️ خمن الشعار', name: 'خمن الشعار', icon: '🏷️', themeStyle: 'logos', primaryColor: 'from-slate-700 to-zinc-900', glowColor: '#64748b' },
  { id: '📝 أكمل المثل', name: 'أكمل المثل', icon: '🏺', themeStyle: 'proverbs', primaryColor: 'from-amber-700 to-amber-900', glowColor: '#d97706' },
  { id: '📏 رتب الأشياء', name: 'رتب الأشياء', icon: '📊', themeStyle: 'sort', primaryColor: 'from-teal-600 to-emerald-800', glowColor: '#0d9488' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState(storage.getPlayerName() || '');
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [showFriends, setShowFriends] = useState(false);
  const [pendingFriendsCount, setPendingFriendsCount] = useState(0);

  // Folders state
  const [openSection, setOpenSection] = useState<'quiz' | 'other' | null>('quiz');

  useEffect(() => {
    if (user) {
      setUsername(storage.getPlayerName() || user?.user_metadata?.username || user?.user_metadata?.full_name || 'لاعب جوجل');
    }
  }, [user]);

  useEffect(() => {
     if (user) {
       const u = subscribeToFriends(storage.getPlayerId(), (f, p) => {
          setPendingFriendsCount(p.length);
       });
       return u;
     }
  }, [user]);

  useEffect(() => {
    const unsubscribeOnline = supabaseService.subscribeToOnlineCount((count) => {
      setOnlineCount(count);
    });
    return () => {
      unsubscribeOnline();
    };
  }, []);

  if (authLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
       </div>
     );
  }

  if (!user) {
    return null; // Will be redirected by ProtectedRoute
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4 md:p-12 pb-24 space-y-10">
      <FriendsSidebar isOpen={showFriends} onClose={() => setShowFriends(false)} />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading bg-gradient-to-l from-indigo-400 to-purple-400 text-transparent bg-clip-text">
            تحدي المعرفة
          </h1>
          <div className="flex items-center gap-2 mt-2">
             <p className="text-slate-300 font-medium">
                مرحباً {username}!
                {user?.user_metadata?.account_type === 'guest' && (
                  <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full mx-2 border border-slate-700">زائر</span>
                )}
             </p>
             <span className="text-slate-600">•</span>
             <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full shadow-sm">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               المتصلون: {onlineCount}
             </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowFriends(true)}
            className="relative flex items-center justify-center gap-2 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-95 px-4 py-2.5 rounded-2xl transition-all text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            title="الأصدقاء"
          >
            <Users className="w-5 h-5" />
            {pendingFriendsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] items-center justify-center text-white font-bold">{pendingFriendsCount}</span>
              </span>
            )}
          </button>
          
          <Link
            to="/updates"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 px-4 py-2.5 rounded-2xl transition-all text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Newspaper className="w-5 h-5" />
            التحديثات
          </Link>
          <Link
            to="/settings"
            className="flex items-center justify-center p-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-2xl transition-all text-slate-300 hover:text-white shadow-lg"
            title="الإعدادات العامة"
          >
             <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Sections */}
      <div className="space-y-6">
      
        {/* 1. ألعاب الأسئلة */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300">
          <button 
            onClick={() => setOpenSection(openSection === 'quiz' ? null : 'quiz')}
            className={`w-full flex items-center justify-between p-6 transition-colors ${openSection === 'quiz' ? 'bg-indigo-500/10 border-b border-indigo-500/20' : 'hover:bg-slate-800/60'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-lg transition-colors ${openSection === 'quiz' ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-indigo-400'}`}>
                <Brain className="w-7 h-7" />
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold font-heading text-white tracking-wide">ألعاب الأسئلة</h2>
                <p className="text-sm text-slate-400 mt-0.5">اختبر معلوماتك في مجالات مختلفة</p>
              </div>
            </div>
            <div className={`p-2 rounded-full transition-all duration-300 bg-slate-800 ${openSection === 'quiz' ? 'rotate-180 text-white' : 'text-slate-400'}`}>
               <ChevronDown className="w-5 h-5" />
            </div>
          </button>
          
          <AnimatePresence>
            {openSection === 'quiz' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <GameCard
                    index={0}
                    card={{
                      id: 'survival',
                      title: 'طور البقاء',
                      icon: '🔥',
                      themeStyle: 'survival',
                      primaryColor: 'from-orange-600 to-red-900',
                      glowColor: '#ea580c',
                      onClick: () => navigate('/survival')
                    }}
                  />

                  {SOLO_CATEGORIES.map((cat, idx) => (
                    <GameCard
                      key={cat.id}
                      index={idx + 1}
                      card={{
                        id: cat.id,
                        title: cat.name,
                        icon: cat.icon,
                        themeStyle: cat.themeStyle,
                        primaryColor: cat.color,
                        glowColor: cat.glowColor,
                        onClick: () => navigate('/solo', { state: { categoryId: cat.id } })
                      }}
                    />
                  ))}
                  
                  <GameCard
                    index={SOLO_CATEGORIES.length + 1}
                    card={{
                      id: 'famous',
                      title: 'من الأشهر؟',
                      icon: '🏆',
                      themeStyle: 'famous',
                      primaryColor: 'from-amber-600 to-amber-900',
                      glowColor: '#d97706',
                      onClick: () => navigate('/famous-solo')
                    }}
                  />
                  
                  <GameCard
                    index={SOLO_CATEGORIES.length + 2}
                    card={{
                      id: 'truefalse',
                      title: 'صح أم خطأ',
                      icon: '✅',
                      themeStyle: 'truefalse',
                      primaryColor: 'from-emerald-600 to-emerald-900',
                      glowColor: '#10b981',
                      onClick: () => navigate('/true-false')
                    }}
                  />
                  
                  <GameCard
                    index={SOLO_CATEGORIES.length + 3}
                    card={{
                      id: 'emoji',
                      title: 'خمن الإيموجي',
                      icon: '🧩',
                      themeStyle: 'emoji',
                      primaryColor: 'from-fuchsia-600 to-purple-900',
                      glowColor: '#d946ef',
                      onClick: () => navigate('/emoji-guess')
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. الألعاب الأخرى */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300">
          <button 
            onClick={() => setOpenSection(openSection === 'other' ? null : 'other')}
            className={`w-full flex items-center justify-between p-6 transition-colors ${openSection === 'other' ? 'bg-emerald-500/10 border-b border-emerald-500/20' : 'hover:bg-slate-800/60'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-lg transition-colors ${openSection === 'other' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-emerald-400'}`}>
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold font-heading text-white tracking-wide">الألعاب الأخرى</h2>
                <p className="text-sm text-slate-400 mt-0.5">ألعاب سريعة وتحديات متنوعة</p>
              </div>
            </div>
            <div className={`p-2 rounded-full transition-all duration-300 bg-slate-800 ${openSection === 'other' ? 'rotate-180 text-white' : 'text-slate-400'}`}>
               <ChevronDown className="w-5 h-5" />
            </div>
          </button>
          
          <AnimatePresence>
            {openSection === 'other' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <GameCard
                    index={0}
                    card={{
                      id: 'fishing',
                      title: 'صيد السمك',
                      subtitle: 'اصطد أسماكاً نادرة واجمع النقاط',
                      icon: <Waves className="w-8 h-8" />,
                      themeStyle: 'fishing',
                      primaryColor: 'from-cyan-600 to-blue-900',
                      glowColor: '#0ea5e9',
                      onClick: () => navigate('/fishing')
                    }}
                  />
                  
                  <GameCard
                    index={1}
                    card={{
                      id: 'penalty',
                      title: 'ركلات الجزاء',
                      subtitle: 'تحدَّ الحارس وسدد الركلات',
                      icon: <Goal className="w-8 h-8" />,
                      themeStyle: 'penalty',
                      primaryColor: 'from-emerald-600 to-teal-900',
                      glowColor: '#10b981',
                      onClick: () => navigate('/penalty')
                    }}
                  />
                  
                  <GameCard
                    index={2}
                    card={{
                      id: 'domino',
                      title: 'الدومينو',
                      subtitle: 'العب لعبة الدومينو الكلاسيكية',
                      icon: <LayoutGrid className="w-8 h-8" />,
                      themeStyle: 'domino',
                      primaryColor: 'from-neutral-700 to-stone-900',
                      glowColor: '#8b5cf6',
                      onClick: () => navigate('/domino')
                    }}
                  />

                  <GameCard
                    index={3}
                    card={{
                      id: 'hockey',
                      title: 'الهوكي',
                      subtitle: 'لعبة الهوكي الفردية ضد الذكاء الاصطناعي',
                      icon: '🏒',
                      themeStyle: 'hockey',
                      primaryColor: 'from-sky-500 to-blue-900',
                      glowColor: '#3b82f6',
                      onClick: () => navigate('/hockey-solo?mode=1v1')
                    }}
                  />

                  <GameCard
                    index={4}
                    card={{
                      id: 'king',
                      title: 'طور الملك',
                      subtitle: 'التقط التاج الذهبي وحافظ عليه',
                      icon: <Crown className="w-8 h-8" />,
                      themeStyle: 'king',
                      primaryColor: 'from-purple-700 to-amber-700',
                      glowColor: '#f59e0b',
                      onClick: () => navigate('/king-mode')
                    }}
                  />

                  <GameCard
                    index={5}
                    card={{
                      id: 'chicken',
                      title: 'جمع الدجاج',
                      subtitle: 'اجمع الدجاج وأعده إلى حظيرتك',
                      icon: '🐔',
                      themeStyle: 'chicken',
                      primaryColor: 'from-orange-500 to-yellow-600',
                      glowColor: '#84cc16',
                      onClick: () => navigate('/chicken-solo')
                    }}
                  />
                  
                  <GameCard
                    index={6}
                    card={{
                      id: 'ice',
                      title: 'الجليد المنزلق',
                      subtitle: 'تزلج فوق الجليد ولا تسقط!',
                      icon: '🐧',
                      themeStyle: 'ice', 
                      primaryColor: 'from-cyan-400 to-blue-600',
                      glowColor: '#06b6d4',
                      onClick: () => navigate('/ice-slide')
                    }}
                  />
                  
                  <GameCard
                    index={7}
                    card={{
                      id: 'jump',
                      title: 'القفزة الأخيرة',
                      subtitle: 'تجاوز الذراع الدوارة وابقى للنهاية!',
                      icon: '🌀',
                      themeStyle: 'jump', 
                      primaryColor: 'from-fuchsia-600 to-purple-900',
                      glowColor: '#c026d3',
                      onClick: () => navigate('/jump-survival')
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
    </div>
  );
}
