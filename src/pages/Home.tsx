import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { useGame } from '../components/GameContext';
import { useAuth } from '../components/AuthContext';
import { Users, Plus, KeyRound, Gamepad2, Brain, Trophy, BookOpen, FlaskConical, Film, PlayCircle, Globe, ChevronRight, Lock, Link as LinkIcon, Medal, UserRound, Waves, Goal, LayoutGrid, Settings, Bell, Crown, Newspaper, HelpCircle, Shield, Edit3, ListOrdered } from 'lucide-react';
import { subscribeToFriends } from '../lib/firebase';
import { supabaseService } from '../services/supabaseService';
import { RoomVisibility, PublicRoom } from '../lib/types';
import { FriendsSidebar } from '../components/FriendsSidebar';
import { supabase } from '../lib/supabase';
import { GameCard, GameCardTheme } from '../components/GameCard';

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
  const { createRoom, state, joinRoom } = useGame();
  const { user, loading: authLoading, loginAsGuest, logout } = useAuth();
  const [username, setUsername] = useState(storage.getPlayerName() || '');
  const [guestName, setGuestName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [createConfig, setCreateConfig] = useState({
    category: ROOM_CATEGORIES[0].id,
    type: 'public' as RoomVisibility,
    password: '',
    maxPlayers: 10,
    gameMode: 'quiz' as 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken',
    hockeySubMode: '1v1' as '1v1' | '2v2'
  });
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [roomStats, setRoomStats] = useState<{ fetched: number, filtered: number, lastRoomId?: string, rawRooms?: any[] }>({ fetched: 0, filtered: 0 });
  const [joinError, setJoinError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [passwordPromptRoomId, setPasswordPromptRoomId] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [showFriends, setShowFriends] = useState(false);
  const [pendingFriendsCount, setPendingFriendsCount] = useState(0);

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
    if (state?.roomId) {
      navigate(`/room/${state.roomId}`);
    }
  }, [state?.roomId, navigate]);

  useEffect(() => {
    // Run cleanup immediately on mount and then every minute
    supabaseService.cleanupStaleRooms();
    const cleanupInterval = setInterval(() => {
      supabaseService.cleanupStaleRooms();
    }, 60000);

    const unsubscribeRooms = supabaseService.subscribeToRooms((rooms) => {
      // Map SupabaseRoom to PublicRoom for UI compatibility
      const mappedRooms = rooms.map(r => ({
        roomId: r.id,
        hostName: r.host_name,
        category: r.category,
        gameMode: r.game_mode as any,
        playerCount: r.player_count,
        maxPlayers: r.max_players,
        status: r.status as any,
        createdAt: new Date(r.created_at).getTime(),
        lastActiveAt: new Date(r.last_active_at).getTime(),
        roomVisibility: r.room_visibility as any
      }));
      setPublicRooms(mappedRooms);
      setRoomStats({ fetched: mappedRooms.length, filtered: mappedRooms.length });
    });
    const unsubscribeOnline = supabaseService.subscribeToOnlineCount((count) => {
      console.log("ONLINE_COUNT_DISPLAY:", count);
      setOnlineCount(count);
    });
    return () => {
      clearInterval(cleanupInterval);
      unsubscribeRooms();
      unsubscribeOnline();
    };
  }, []);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim().length >= 2) {
      setLoginError('');
      setIsLoggingIn(true);
      try {
        await loginAsGuest(guestName.trim());
      } catch (err: any) {
        setLoginError('فشل الدخول كزائر: ' + err.message);
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    let computedGameMode = createConfig.gameMode;
    if (computedGameMode === 'quiz') {
      if (createConfig.category === '🏆 من الأشهر؟') computedGameMode = 'famous';
      else if (createConfig.category === '🧩 خمن الإيموجي') computedGameMode = 'emoji';
      else if (createConfig.category === '🏷️ خمن الشعار') computedGameMode = 'logos';
      else if (createConfig.category === '📝 أكمل المثل') computedGameMode = 'proverbs';
      else if (createConfig.category === '📏 رتب الأشياء') computedGameMode = 'sort';
    }
    createRoom(createConfig.gameMode === 'fishing' ? '🎣 صيد السمك' : createConfig.category, createConfig.type, createConfig.password, createConfig.maxPlayers, computedGameMode, createConfig.hockeySubMode);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    const roomId = joinId.trim().toUpperCase();
    if (roomId.startsWith('ROOM-')) {
      setJoiningRoomId(roomId);
      joinRoom(roomId, joinPassword, (err) => {
        setJoiningRoomId(null);
        setJoinError(err);
      });
    } else {
      alert("الرجاء إدخال رمز صحيح مثل ROOM-1234");
    }
  };

  const handleJoinPublicRoom = (room: PublicRoom) => {
    setJoinError('');
    if (room.roomVisibility === 'password' && !passwordPromptRoomId) {
      setPasswordPromptRoomId(room.roomId);
      return;
    }
    setJoiningRoomId(room.roomId);
    joinRoom(room.roomId, joinPassword, (err) => {
      setJoiningRoomId(null);
      if (err.includes('كلمة المرور') || err.includes('Password')) {
        setPasswordPromptRoomId(room.roomId);
        setJoinError(err);
      } else {
        setJoinError(err);
      }
    });
  };

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

  if (showCreateModal) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto p-4 md:p-12">
        <button 
          onClick={() => setShowCreateModal(false)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
          رجوع
        </button>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-heading text-white mb-2">إنشاء غرفة جديدة</h2>
          <p className="text-slate-400">اختر تفاصيل الغرفة الخاصة بك</p>
        </div>
        
        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
            <div>
              <label className="block text-slate-400 mb-3 font-bold">نمط اللعب</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <GameCard compact className={createConfig.gameMode === 'quiz' ? 'ring-2 ring-indigo-500' : 'opacity-80'} card={{ id: 'quiz', title: 'تحدي المعرفة', icon: <Brain className="w-6 h-6" />, themeStyle: 'quiz', primaryColor: 'from-indigo-600 to-indigo-900', glowColor: '#4f46e5', onClick: () => setCreateConfig({...createConfig, gameMode: 'quiz', maxPlayers: 10}) }} />
                <GameCard compact className={createConfig.gameMode === 'fishing' ? 'ring-2 ring-sky-500' : 'opacity-80'} card={{ id: 'fishing', title: 'صيد السمك', icon: '🎣', themeStyle: 'fishing', primaryColor: 'from-cyan-600 to-blue-900', glowColor: '#0ea5e9', onClick: () => setCreateConfig({...createConfig, gameMode: 'fishing', maxPlayers: 10}) }} />
                <GameCard compact className={createConfig.gameMode === 'penalty' ? 'ring-2 ring-emerald-500' : 'opacity-80'} card={{ id: 'penalty', title: 'ركلات الجزاء', icon: '⚽', themeStyle: 'penalty', primaryColor: 'from-emerald-600 to-teal-900', glowColor: '#10b981', onClick: () => setCreateConfig({...createConfig, gameMode: 'penalty', maxPlayers: 2}) }} />
                <GameCard compact className={createConfig.gameMode === 'domino' ? 'ring-2 ring-violet-500' : 'opacity-80'} card={{ id: 'domino', title: 'الدومينو', icon: '🎲', themeStyle: 'domino', primaryColor: 'from-neutral-700 to-stone-900', glowColor: '#8b5cf6', onClick: () => setCreateConfig({...createConfig, gameMode: 'domino', maxPlayers: 2}) }} />
                <GameCard compact className={createConfig.gameMode === 'hockey' ? 'ring-2 ring-blue-500' : 'opacity-80'} card={{ id: 'hockey', title: 'الهوكي', icon: '🏒', themeStyle: 'hockey', primaryColor: 'from-sky-500 to-blue-900', glowColor: '#3b82f6', onClick: () => setCreateConfig({...createConfig, gameMode: 'hockey', maxPlayers: 2}) }} />
                <GameCard compact className={createConfig.gameMode === 'king' ? 'ring-2 ring-amber-500' : 'opacity-80'} card={{ id: 'king', title: 'التاج', icon: '👑', themeStyle: 'king', primaryColor: 'from-purple-700 to-amber-700', glowColor: '#f59e0b', onClick: () => setCreateConfig({...createConfig, gameMode: 'king', maxPlayers: 4}) }} />
                <GameCard compact className={createConfig.gameMode === 'chicken' ? 'ring-2 ring-lime-500' : 'opacity-80'} card={{ id: 'chicken', title: 'سباق الدجاج', icon: '🐔', themeStyle: 'chicken', primaryColor: 'from-orange-500 to-yellow-600', glowColor: '#84cc16', onClick: () => setCreateConfig({...createConfig, gameMode: 'chicken', maxPlayers: 6}) }} />
              </div>
            </div>

            {createConfig.gameMode === 'quiz' && (
              <div>
                <label className="block text-slate-400 mb-3 font-bold">تصنيف الغرفة</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ROOM_CATEGORIES.map((cat) => (
                    <GameCard 
                      key={cat.id} 
                      compact 
                      className={createConfig.category === cat.id ? 'ring-2 ring-indigo-500' : 'opacity-80'} 
                      card={{ 
                        id: cat.id, 
                        title: cat.name, 
                        icon: cat.icon, 
                        themeStyle: cat.themeStyle, 
                        primaryColor: cat.primaryColor, 
                        glowColor: cat.glowColor, 
                        onClick: () => setCreateConfig({...createConfig, category: cat.id}) 
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {createConfig.gameMode === 'hockey' && (
              <div>
                <label className="block text-slate-400 mb-3 font-bold">نوع الطور</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateConfig({...createConfig, hockeySubMode: '1v1', maxPlayers: 2})}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.hockeySubMode === '1v1' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    <div className="text-2xl">👤</div>
                    <span className="text-sm font-bold text-slate-200">1 ضد 1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateConfig({...createConfig, hockeySubMode: '2v2', maxPlayers: 4})}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.hockeySubMode === '2v2' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    <div className="text-2xl">👥</div>
                    <span className="text-sm font-bold text-slate-200">2 ضد 2</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-3 font-bold">نوع الغرفة</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'public', name: 'عامة', icon: Globe, desc: 'تظهر للجميع' },
                  { id: 'password', name: 'بكلمة مرور', icon: Lock, desc: 'تظهر ومقفلة' },
                  { id: 'private', name: 'خاصة', icon: KeyRound, desc: 'مخفية - بالكود' },
                  { id: 'link', name: 'رابط فقط', icon: LinkIcon, desc: 'مخفية - بالرابط' },
                ].map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setCreateConfig({...createConfig, type: type.id as RoomVisibility, password: ''})}
                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all text-right ${createConfig.type === type.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    <type.icon className={`w-5 h-5 shrink-0 ${createConfig.type === type.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-200">{type.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{type.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {createConfig.type === 'password' && (
               <div>
                 <label className="block text-slate-400 mb-3 font-bold">كلمة المرور</label>
                 <input 
                   type="text"
                   value={createConfig.password}
                   onChange={(e) => setCreateConfig({...createConfig, password: e.target.value})}
                   placeholder="أدخل كلمة المرور..."
                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-left"
                   required
                 />
               </div>
            )}

            <div>
              <label className="block text-slate-400 mb-3 font-bold">الحد الأقصى للاعبين</label>
              <input 
                type="number"
                min="2"
                max={createConfig.gameMode === 'penalty' || createConfig.gameMode === 'domino' || createConfig.gameMode === 'hockey' ? "2" : createConfig.gameMode === 'king' ? "4" : createConfig.gameMode === 'chicken' ? "6" : "20"}
                disabled={createConfig.gameMode === 'penalty' || createConfig.gameMode === 'domino' || createConfig.gameMode === 'hockey' || createConfig.gameMode === 'king' || createConfig.gameMode === 'chicken'}
                value={createConfig.maxPlayers}
                onChange={(e) => setCreateConfig({...createConfig, maxPlayers: parseInt(e.target.value) || 2})}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            تأكيد وإنشاء الغرفة
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-6 md:p-12 space-y-12">
      <FriendsSidebar isOpen={showFriends} onClose={() => setShowFriends(false)} />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading bg-gradient-to-l from-indigo-400 to-purple-400 text-transparent bg-clip-text">
            متعة التحدي
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-slate-400">
               مرحباً {username}!
               {user?.user_metadata?.account_type === 'guest' && (
                 <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-md mr-2 border border-slate-700">زائر</span>
               )}
            </p>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
              <span className="text-sm">🟢</span>
              المتصلون الآن: {onlineCount}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowFriends(true)}
            className="relative flex items-center justify-center gap-2 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 rounded-xl transition-colors text-indigo-400"
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
            to="/achievements"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors text-purple-400 font-bold"
          >
            <Trophy className="w-5 h-5" />
            الإنجازات
          </Link>
          <Link
            to="/leaderboard"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors text-amber-400"
          >
            <Medal className="w-5 h-5" />
            المتصدرين
          </Link>
          <Link
            to="/profile"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors text-sky-400"
          >
            <UserRound className="w-5 h-5" />
            ملفي
          </Link>
          <Link
            to="/updates"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors text-emerald-400"
          >
            <Newspaper className="w-5 h-5" />
            التحديثات
          </Link>
          <Link
            to="/settings"
            className="flex items-center justify-center p-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300"
            title="الإعدادات العامة"
          >
             <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* 1. قسم ألعاب الأسئلة */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-2xl shadow-lg border border-indigo-500/20">
            <Brain className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">قسم ألعاب الأسئلة</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <GameCard
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

          {SOLO_CATEGORIES.map(cat => (
            <GameCard
              key={cat.id}
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
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-12 hidden md:block"></div>

      {/* 2. قسم الألعاب */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-2xl shadow-lg border border-emerald-500/20">
            <Gamepad2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">قسم الألعاب</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <GameCard
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
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-12 hidden md:block"></div>

      {/* 3. قسم الغرف واللعب الجماعي */}
      <section className="space-y-8 bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500/20 rounded-2xl shadow-lg border border-orange-500/20">
            <Users className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">الغرف (اللعب الجماعي)</h2>
        </div>
        
        {/* إنشاء غرفة جديدة */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 h-auto transform transition-transform hover:shadow-indigo-500/20 border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 text-right md:w-2/3">
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-5 backdrop-blur-sm border border-white/10 shadow-lg">
              <Plus className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <h3 className="text-3xl font-bold font-heading mb-3 text-white drop-shadow-sm">إنشاء غرفة جديدة</h3>
            <p className="text-indigo-100 mb-0 text-lg md:text-xl font-medium max-w-lg leading-relaxed">اجمع أصدقاءك في غرفة خاصة، أو افتح غرفة عامة وتعرف على أشخاص جدد وعش أجواء التحدي.</p>
          </div>
          <div className="relative z-10 w-full md:w-1/3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-white text-indigo-900 font-bold py-5 rounded-2xl hover:bg-slate-100 hover:shadow-xl transition-all duration-300 active:scale-95 shadow-lg text-lg flex justify-center items-center gap-3 border border-slate-200"
            >
              <Plus className="w-6 h-6" />
              قم بإنشاء غرفتك الآن
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* الغرف العامة */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-sky-400" />
              <h3 className="text-xl font-bold font-heading text-white">الغرف العامة المتاحة</h3>
            </div>
            
            {publicRooms.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/80 border border-slate-800 border-dashed rounded-3xl shadow-inner">
                <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 text-lg">لا يوجد غرف متاحة حالياً</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 px-4 py-2 rounded-xl transition-colors"
                >
                  كُن أول من ينشئ غرفة!
                </button>
              </div>
            ) : (
              <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {publicRooms.map((room, idx) => (
                  <div key={room.roomId || `room-${idx}`} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-500 transition-colors relative shadow-lg">
                    {room.roomVisibility === 'password' && (
                      <div className="absolute top-4 left-4 text-amber-400 p-1.5 bg-amber-500/10 rounded-lg">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1.5 rounded-lg shadow-inner">
                          {room.roomId}
                        </span>
                        <span className={`text-xs px-2.5 py-1.5 rounded-lg font-bold shadow-sm ${room.status === 'playing' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                          {room.status === 'playing' ? 'بدأت اللعبة' : 'في الانتظار'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-lg pr-8">
                        {room.gameMode === 'fishing' ? '🎣 صيد السمك' : room.gameMode === 'penalty' ? '⚽ ركلات الجزاء' : room.gameMode === 'domino' ? '🎲 الدومينو' : room.gameMode === 'hockey' ? '🏒 الهوكي' : room.gameMode === 'king' ? '👑 طور الملك' : room.gameMode === 'chicken' ? '🐔 سباق الدجاج' : room.category}
                      </h4>
                      <p className="text-slate-400 text-sm mt-1">المضيف: <span className="text-slate-300">{room.hostName}</span></p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-0 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800 px-3 py-1.5 rounded-lg">
                        <Users className="w-4 h-4 text-sky-400" />
                        <span className="font-bold">{room.playerCount} / {room.maxPlayers || 10}</span>
                      </div>
                      {passwordPromptRoomId === room.roomId ? (
                        <div className="flex gap-2">
                           <input 
                             type="password" 
                             placeholder="كلمة المرور"
                             className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                             value={joinPassword}
                             onChange={(e) => setJoinPassword(e.target.value)}
                           />
                           <button
                             onClick={() => handleJoinPublicRoom(room)}
                             disabled={joiningRoomId === room.roomId}
                             className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                           >
                             {joiningRoomId === room.roomId ? (
                               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             ) : 'دخول'}
                           </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoinPublicRoom(room)}
                          disabled={room.status === 'playing' || room.playerCount >= (room.maxPlayers || 10) || joiningRoomId === room.roomId}
                          className="bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                          {joiningRoomId === room.roomId ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              جارِ
                            </>
                          ) : 'انضمام'}
                        </button>
                      )}
                    </div>
                    {joinError && passwordPromptRoomId === room.roomId && (
                      <div className="text-red-400 text-xs mt-3 text-center bg-red-400/10 p-2 rounded-lg">{joinError}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* انضمام لغرفة خاصة */}
          <div className="flex flex-col gap-6 w-full h-full">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-xl flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 shadow-inner">
                  <KeyRound className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading mb-1 text-white">دخول غرفة خاصة</h3>
                  <p className="text-slate-400 text-sm">ادخل الرمز (ROOM-1234)</p>
                </div>
              </div>
              <form onSubmit={handleJoinRoom} className="space-y-4 w-full mt-2">
                {joinError && <div className="text-red-400 text-sm font-bold bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-center">{joinError}</div>}
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                    placeholder="ROOM-XXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-center font-mono font-bold tracking-widest text-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none uppercase shadow-inner transition-colors"
                  />
                  <input 
                     type="password"
                     value={joinPassword}
                     onChange={(e) => setJoinPassword(e.target.value)}
                     placeholder="كلمة المرور (إن وجدت)"
                     className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-center text-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner transition-colors font-mono"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!joinId || joiningRoomId === joinId.trim().toUpperCase()}
                  className="w-full bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 text-lg mt-2"
                >
                  {joiningRoomId === joinId.trim().toUpperCase() ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جارِ الانضمام...
                    </>
                  ) : 'انضمام سريع للغرفة'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-12 hidden md:block"></div>

      {/* 4. قسم الشرح وكيفية اللعب */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/20 rounded-2xl shadow-lg border border-pink-500/20 text-2xl">
            🎮
          </div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">كيف تلعب؟</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* فكرة اللعبة */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-pink-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-start shadow-xl hover:-translate-y-1">
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                   🎯
                </div>
                <h3 className="text-xl font-bold font-heading text-white">فكرة اللعبة</h3>
             </div>
             <p className="text-slate-400 text-sm leading-relaxed mb-0">
               "تحدي المعرفة" هي لعبة مسابقات أسئلة عربية تتيح لك اختبار معلوماتك والتنافس مع أصدقائك أو لاعبين آخرين في غرف ممتعة ومثيرة.
             </p>
          </div>

          {/* طريقة اللعب */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-start shadow-xl hover:-translate-y-1">
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                   🕹️
                </div>
                <h3 className="text-xl font-bold font-heading text-white">طريقة اللعب</h3>
             </div>
             <ul className="text-slate-400 text-sm leading-relaxed space-y-2">
               <li className="flex items-start gap-2">
                 <span className="text-cyan-400 font-bold">1-</span>
                 <span>اختر القسم أو اللعبة التي تريدها.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-cyan-400 font-bold">2-</span>
                 <span>أنشئ غرفة خاصة وادعُ أصدقاءك أو انضم متاح.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-cyan-400 font-bold">3-</span>
                 <span>أجب عن الأسئلة قبل انتهاء الوقت المخصص.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-cyan-400 font-bold">4-</span>
                 <span>اجمع النقاط وحاول الوصول إلى المركز الأول!</span>
               </li>
             </ul>
          </div>

          {/* المميزات */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-start shadow-xl hover:-translate-y-1">
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                   🏆
                </div>
                <h3 className="text-xl font-bold font-heading text-white">المميزات</h3>
             </div>
             <ul className="text-slate-400 text-sm leading-relaxed space-y-2">
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                 آلاف الأسئلة المتنوعة والمحدثة.
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                 منافسة مباشرة ولحظية مع الأصدقاء.
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                 لوحة وتصنيف لأفضل اللاعبين.
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                 أطوار لعب مختلفة (مسابقات، صيد، دومينو والمزيد).
               </li>
             </ul>
          </div>
        </div>

        {/* لماذا تلعب */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
           <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex flex-shrink-0 items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20 z-10">
             📌
           </div>
           <div className="text-center md:text-right z-10">
             <h3 className="text-xl font-bold font-heading text-white mb-2">لماذا تلعب تحدي المعرفة؟</h3>
             <p className="text-slate-300 text-sm md:text-base leading-relaxed">
               لأنها اللعبة الوحيدة التي تجمع بين <strong>التعلم، المتعة، والمنافسة</strong> في تجربة عربية سلسة ومصممة بأعلى معايير الجودة لتناسب الجميع.
             </p>
           </div>
        </div>
      </section>
    </div>
  );
}
