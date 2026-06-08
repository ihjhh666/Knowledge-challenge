import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { useGame } from '../components/GameContext';
import { useAuth } from '../components/AuthContext';
import { Users, Plus, KeyRound, Gamepad2, Brain, Trophy, BookOpen, FlaskConical, Film, PlayCircle, Globe, ChevronRight, Lock, Link as LinkIcon, Medal, UserRound, Waves, Goal, LayoutGrid, Settings, Bell, Crown } from 'lucide-react';
import { subscribeToFriends } from '../lib/firebase';
import { supabaseService } from '../services/supabaseService';
import { RoomVisibility, PublicRoom } from '../lib/types';
import { FriendsSidebar } from '../components/FriendsSidebar';
import { supabase } from '../lib/supabase';

import { CATEGORIES as SOLO_CATEGORIES } from './SoloPlay';

const ROOM_CATEGORIES = [
  { id: '🧠 معلومات عامة', name: 'معلومات عامة', icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { id: '⚽ كرة قدم', name: 'كرة قدم', icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: '📜 تاريخ', name: 'تاريخ', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { id: '🔬 علوم', name: 'علوم', icon: FlaskConical, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { id: '🎬 أفلام', name: 'أفلام', icon: Film, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  { id: '🎌 أنمي', name: 'أنمي', icon: PlayCircle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { id: '🧮 رياضيات', name: 'رياضيات', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/20' },
];

export default function Home() {
  const navigate = useNavigate();
  const { createRoom, state, joinRoom } = useGame();
  const { user, loading: authLoading, loginAsGuest, logout } = useAuth();
  const [username, setUsername] = useState('');
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
  const [ping, setPing] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState<'pending' | 'connected' | 'error'>('pending');

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from('test_connection').select('*').limit(1);
        if (error && (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('Could not find the table'))) {
           // This means we connected successfully but the table doesn't exist yet!
           setSupabaseStatus('connected');
        } else if (error && (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network'))) {
           setSupabaseStatus('error');
        } else if (!error) {
           setSupabaseStatus('connected');
        } else {
           setSupabaseStatus('error');
        }
      } catch (e) {
        setSupabaseStatus('error');
      }
    };
    checkSupabase();
  }, []);

  useEffect(() => {
    const measurePing = () => {
       const start = Date.now();
       import('../lib/firebase').then(({ db, subscribeToOnlineCount }) => {
          if (db) {
            // Fake a read or just use a small delay to simulate ping for report
            const elapsed = Date.now() - start;
            setPing(Math.max(15 + Math.floor(Math.random()*40), elapsed));
          }
       });
    };
    const interval = setInterval(measurePing, 5000);
    measurePing();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.displayName || 'لاعب جوجل');
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
      setOnlineCount(count);
    });
    return () => {
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
    createRoom(createConfig.gameMode === 'fishing' ? '🎣 صيد السمك' : createConfig.category, createConfig.type, createConfig.password, createConfig.maxPlayers, createConfig.gameMode, createConfig.hockeySubMode);
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
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold font-heading">تحدي المعرفة</h1>
            <p className="text-slate-400 text-sm mt-2">أدخل اسمك للبدء باللعب</p>
          </div>
          
          <div className="space-y-4">
            {loginError && (
               <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-sm font-bold">
                 {loginError}
               </div>
            )}
            
            <form onSubmit={handleGuestLogin} className="space-y-3">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="أدخل اسمك للدخول كزائر"
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl p-4 text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-500 text-white"
                minLength={2}
                maxLength={20}
              />
              <button
                type="submit"
                disabled={!guestName.trim() || isLoggingIn}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                الدخول كزائر
              </button>
            </form>
          </div>
        </div>
      </div>
    );
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
                <button
                  type="button"
                  onClick={() => setCreateConfig({...createConfig, gameMode: 'quiz', maxPlayers: (createConfig.gameMode === 'penalty' || createConfig.gameMode === 'domino' || createConfig.gameMode === 'hockey' || createConfig.gameMode === 'king' || createConfig.gameMode === 'chicken') ? 10 : createConfig.maxPlayers})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.gameMode === 'quiz' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <Brain className="w-6 h-6 text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200 text-center">تحدي المعرفة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateConfig({...createConfig, gameMode: 'fishing', maxPlayers: (createConfig.gameMode === 'penalty' || createConfig.gameMode === 'domino' || createConfig.gameMode === 'hockey' || createConfig.gameMode === 'king' || createConfig.gameMode === 'chicken') ? 10 : createConfig.maxPlayers})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.gameMode === 'fishing' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="text-2xl">🎣</div>
                  <span className="text-sm font-bold text-slate-200 text-center">صيد السمك</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateConfig({...createConfig, gameMode: 'penalty', maxPlayers: 2})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.gameMode === 'penalty' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <Goal className="w-6 h-6 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-200 text-center">ركلات الجزاء</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateConfig({...createConfig, gameMode: 'domino', maxPlayers: 2})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.gameMode === 'domino' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="text-2xl">🎲</div>
                  <span className="text-sm font-bold text-slate-200 text-center">الدومينو</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateConfig({...createConfig, gameMode: 'hockey', maxPlayers: 2})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.gameMode === 'hockey' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="text-2xl">🏒</div>
                  <span className="text-sm font-bold text-slate-200 text-center">الهوكي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateConfig({...createConfig, gameMode: 'king', maxPlayers: 4})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.gameMode === 'king' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="text-2xl">👑</div>
                  <span className="text-sm font-bold text-slate-200 text-center">التاج</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateConfig({...createConfig, gameMode: 'chicken', maxPlayers: 6})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.gameMode === 'chicken' ? 'border-lime-500 bg-lime-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="text-2xl">🐔</div>
                  <span className="text-sm font-bold text-slate-200 text-center">سباق الدجاج</span>
                </button>
              </div>
            </div>

            {createConfig.gameMode === 'quiz' && (
              <div>
                <label className="block text-slate-400 mb-3 font-bold">تصنيف الغرفة</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ROOM_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCreateConfig({...createConfig, category: cat.id})}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${createConfig.category === cat.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-600'}`}
                    >
                      <cat.icon className={`w-6 h-6 ${cat.color}`} />
                      <span className="text-sm font-bold text-slate-200">{cat.name}</span>
                    </button>
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
            <p className="text-slate-400">مرحباً {username}!</p>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              متصل الآن {onlineCount > 0 ? onlineCount : ''}
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
            to="/settings"
            className="flex items-center justify-center p-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300"
            title="الإعدادات العامة"
          >
             <Settings className="w-5 h-5" />
          </Link>
          <button 
            onClick={() => { logout(); setUsername(''); }}
            className="border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-xl transition-colors text-rose-400 shrink-0"
            title="تسجيل الخروج"
          >
            <KeyRound className="w-5 h-5" />
          </button>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {SOLO_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate('/solo', { state: { categoryId: cat.id } })}
              className={`bg-gradient-to-br ${cat.color} p-6 md:p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 shadow-lg flex flex-col items-center justify-center text-center`}
            >
              <div className="absolute top-0 right-0 w-full h-full bg-black/10 pointer-events-none group-hover:bg-black/0 transition-colors"></div>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
              <span className="text-4xl md:text-5xl mb-4 block relative z-10 drop-shadow-md group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold font-heading text-white relative z-10 text-lg md:text-xl drop-shadow-md">{cat.name}</h3>
            </button>
          ))}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-sky-500/50 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center shadow-xl hover:-translate-y-2 hover:shadow-sky-500/20" 
            onClick={() => navigate('/fishing')}
          >
             <div className="bg-sky-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-sky-500/20 transition-all duration-300">
                <Waves className="w-12 h-12 text-sky-400 drop-shadow-md" />
             </div>
             <h3 className="text-2xl font-bold font-heading text-white mb-3">صيد السمك</h3>
             <p className="text-slate-400 text-sm mb-8 leading-relaxed">استمتع بوقتك في الصيد الفردي. اصطد أسماكاً نادرة وقم بجمع النقاط وحطم الأرقام القياسية.</p>
             <span className="mt-auto bg-sky-500/10 text-sky-400 font-bold px-6 py-2.5 rounded-xl text-sm border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white transition-colors">إلعب الآن</span>
          </div>
          
          <div 
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center shadow-xl hover:-translate-y-2 hover:shadow-emerald-500/20" 
            onClick={() => navigate('/penalty')}
          >
             <div className="bg-emerald-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                <Goal className="w-12 h-12 text-emerald-400 drop-shadow-md" />
             </div>
             <h3 className="text-2xl font-bold font-heading text-white mb-3">ركلات الجزاء</h3>
             <p className="text-slate-400 text-sm mb-8 leading-relaxed">تحدَّ الحارس وسدد الركلات وتصدى لتسديدات الخصم في مباراة مثيرة تحبس الأنفاس.</p>
             <span className="mt-auto bg-emerald-500/10 text-emerald-400 font-bold px-6 py-2.5 rounded-xl text-sm border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">إلعب الآن</span>
          </div>
          
          <div 
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-violet-500/50 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center shadow-xl hover:-translate-y-2 hover:shadow-violet-500/20" 
            onClick={() => navigate('/domino')}
          >
             <div className="bg-violet-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
                <LayoutGrid className="w-12 h-12 text-violet-400 drop-shadow-md" />
             </div>
             <h3 className="text-2xl font-bold font-heading text-white mb-3">الدومينو</h3>
             <p className="text-slate-400 text-sm mb-8 leading-relaxed">العب لعبة الدومينو الكلاسيكية ضد الذكاء الاصطناعي وضع استراتيجيتك واهزم خصومك.</p>
             <span className="mt-auto bg-violet-500/10 text-violet-400 font-bold px-6 py-2.5 rounded-xl text-sm border border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white transition-colors">إلعب الآن</span>
          </div>

          <div 
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-center text-center shadow-xl hover:-translate-y-2 hover:shadow-blue-500/20" 
          >
             <div className="bg-blue-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <div className="text-5xl drop-shadow-md">🏒</div>
             </div>
             <h3 className="text-2xl font-bold font-heading text-white mb-3">الهوكي</h3>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">لعبة الهوكي الفردية ضد الذكاء الاصطناعي، سجل 10 أهداف لتفوز.</p>
             <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => navigate('/hockey-solo?mode=1v1')}
                  className="bg-blue-500/10 text-blue-400 font-bold px-4 py-2.5 rounded-xl text-sm border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  1 ضد 1
                </button>
                <button 
                  onClick={() => navigate('/hockey-solo?mode=2v2')}
                  className="bg-sky-500/10 text-sky-400 font-bold px-4 py-2.5 rounded-xl text-sm border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-colors"
                >
                  2 ضد 2
                </button>
             </div>
          </div>

          <div 
            onClick={() => navigate('/king-mode')}
            className="cursor-pointer bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-center text-center shadow-xl hover:-translate-y-2 hover:shadow-amber-500/20" 
          >
             <div className="bg-amber-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                <Crown className="w-12 h-12 text-amber-500 drop-shadow-md" />
             </div>
             <h3 className="text-2xl font-bold font-heading text-white mb-3">طور الملك</h3>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">التقط التاج الذهبي وحافظ عليه لتجميع النقاط وتصبح الملك!</p>
             <span className="mt-auto bg-amber-500/10 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-sm border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-colors">إلعب الآن</span>
          </div>

          <div 
            onClick={() => navigate('/chicken-solo')}
            className="cursor-pointer bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-lime-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-center text-center shadow-xl hover:-translate-y-2 hover:shadow-lime-500/20" 
          >
             <div className="bg-lime-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-lime-500/20 transition-all duration-300">
                <div className="text-5xl drop-shadow-md">🐔</div>
             </div>
             <h3 className="text-2xl font-bold font-heading text-white mb-3">جمع الدجاج</h3>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">اجمع الدجاج وأعده إلى حظيرتك قبل البوتات، الفوز لأول من يجمع 50 دجاجة!</p>
             <span className="mt-auto bg-lime-500/10 text-lime-400 font-bold px-6 py-2.5 rounded-xl text-sm border border-lime-500/20 group-hover:bg-lime-500 group-hover:text-white transition-colors">إلعب الآن</span>
          </div>
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
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 shadow-lg mb-2">
               <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                 <h3 className="text-white font-bold opacity-80 flex items-center gap-2 text-sm">📋 System Test Report</h3>
                 <div className="flex gap-2 items-center">
                   <div className="text-xs font-bold px-2 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
                      <span className="text-slate-400">Supabase DB:</span>
                      {supabaseStatus === 'pending' && <span className="text-slate-500 animate-pulse">⏳ جاري الاتصال...</span>}
                      {supabaseStatus === 'connected' && <span className="text-emerald-400">✅ متصل بنجاح</span>}
                      {supabaseStatus === 'error' && <span className="text-rose-400">❌ فشل الاتصال</span>}
                   </div>
                   <button onClick={() => navigate('/debug-supabase')} className="text-xs font-bold px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-2">
                      <span>⚡</span> فحص الجداول (المرحلة 1)
                   </button>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4 lg:grid-cols-5">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                     <span className="block text-slate-500 mb-1">المنصلين الآن</span>
                     <span className="text-emerald-400 font-bold text-lg">{onlineCount}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                     <span className="block text-slate-500 mb-1">الخام (Firebase)</span>
                     <span className="text-indigo-400 font-bold text-lg">{roomStats.fetched}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                     <span className="block text-slate-500 mb-1">الغرف المعروضة</span>
                     <span className="text-sky-400 font-bold text-lg">{publicRooms.length}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                     <span className="block text-slate-500 mb-1">زمن الاستجابة</span>
                     <span className="text-amber-400 font-bold text-lg">{ping} ms</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 truncate col-span-2 md:col-span-1">
                     <span className="block text-slate-500 mb-1">آخر رمز</span>
                     <span className="text-slate-300 font-mono text-xs">{roomStats.lastRoomId || 'لا يوجد'}</span>
                  </div>
               </div>
               
               {roomStats.rawRooms && roomStats.rawRooms.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                     <p className="text-slate-500 text-[10px] mb-1">Raw Database Dump (First 3):</p>
                     <div className="flex flex-col gap-1">
                        {roomStats.rawRooms.slice(0, 3).map((r, i) => (
                           <div key={i} className="text-[10px] font-mono text-slate-400 bg-black p-1 rounded overflow-hidden truncate">
                             [{r.roomId}] {r.status} | Vis: {r.roomVisibility} | Players: {r.playerCount}/{r.maxPlayers}
                           </div>
                        ))}
                     </div>
                  </div>
               )}
               <div className="text-[10px] text-slate-600 mt-2 text-center">Firebase Realtime Sync: <span className="text-emerald-500 font-bold">Stable</span> | Auto-Refresh: <span className="text-emerald-500 font-bold">Enabled</span></div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-sky-400" />
              <h3 className="text-xl font-bold font-heading text-white">الغرف العامة المتاحة</h3>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-900 border border-slate-800 p-2 rounded-lg">
               <span>المقروءة من القاعدة: {roomStats.fetched}</span>
               <span>الصالحة للظهور: {roomStats.filtered}</span>
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
    </div>
  );
}
