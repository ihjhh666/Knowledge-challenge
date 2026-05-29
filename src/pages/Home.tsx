import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { useGame } from '../components/GameContext';
import { Users, Plus, KeyRound, Gamepad2, Brain, Trophy, BookOpen, FlaskConical, Film, PlayCircle, Globe, ChevronRight } from 'lucide-react';
import { subscribeToPublicRooms, PublicRoom, updatePublicRoom } from '../lib/firebase';

const CATEGORIES = [
  { id: '🧠 معلومات عامة', name: 'معلومات عامة', icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { id: '⚽ كرة قدم', name: 'كرة قدم', icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: '📜 تاريخ', name: 'تاريخ', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { id: '🔬 علوم', name: 'علوم', icon: FlaskConical, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { id: '🎬 أفلام', name: 'أفلام', icon: Film, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  { id: '🎌 أنمي', name: 'أنمي', icon: PlayCircle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
];

export default function Home() {
  const navigate = useNavigate();
  const { createRoom, state, joinRoom } = useGame();
  const [username, setUsername] = useState('');
  const [hasName, setHasName] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);

  useEffect(() => {
    const savedName = storage.getPlayerName();
    if (savedName) {
      setUsername(savedName);
      setHasName(true);
    }
  }, []);

  useEffect(() => {
    if (state?.roomId) {
      navigate(`/room/${state.roomId}`);
    }
  }, [state?.roomId, navigate]);

  useEffect(() => {
    const unsubscribe = subscribeToPublicRooms((rooms) => {
      setPublicRooms(rooms || []);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 2) {
      storage.setPlayerName(username.trim());
      setHasName(true);
    }
  };

  const handleCreateRoomWithCat = (categoryId: string) => {
    createRoom(categoryId);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim().toUpperCase().startsWith('ROOM-')) {
      navigate(`/room/${joinId.trim().toUpperCase()}`);
    } else {
      alert("الرجاء إدخال رمز صحيح مثل ROOM-1234");
    }
  };

  const handleJoinPublicRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  if (!hasName) {
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
          
          <form onSubmit={handleSaveName} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم اللاعب"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              required
              minLength={2}
              maxLength={20}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showCategorySelect) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto p-6 md:p-12">
        <button 
          onClick={() => setShowCategorySelect(false)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
          رجوع
        </button>
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold font-heading text-white mb-2">اختر تصنيف الغرفة</h2>
          <p className="text-slate-400">ستكون الأسئلة في الغرفة مخصصة لهذا التصنيف فقط</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCreateRoomWithCat(cat.id)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <div className={`${cat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <cat.icon className={`w-8 h-8 ${cat.color}`} />
              </div>
              <span className="font-bold text-slate-200 text-lg">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-6 md:p-12 space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading bg-gradient-to-l from-indigo-400 to-purple-400 text-transparent bg-clip-text">
            تحدي المعرفة
          </h1>
          <p className="text-slate-400 mt-2">مرحباً {username}!</p>
        </div>
        <button 
          onClick={() => { setHasName(false); storage.clearPlayerName(); setUsername(''); }}
          className="text-sm border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border-dashed"
        >
          تغيير الاسم
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between min-h-[250px] transform hover:scale-[1.02] transition-transform">
          <div>
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-4">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2 text-white">لعب فردي</h2>
            <p className="text-blue-100 mb-6 text-sm">اختبر معلوماتك في مختلف الأقسام والتحديات والعب بمفردك.</p>
          </div>
          <button 
            onClick={() => navigate('/solo')}
            className="w-full bg-white text-blue-900 font-bold py-4 rounded-xl hover:bg-blue-50 transition-transform active:scale-95 shadow-lg"
          >
            العب الآن
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl shadow-indigo-900/20 relative overflow-hidden flex flex-col items-start justify-between min-h-[250px] transform hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          <div className="bg-white/20 p-4 rounded-2xl mb-4 relative z-10">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <div className="relative z-10 w-full mt-4">
            <h2 className="text-2xl font-bold font-heading mb-2 text-white">إنشاء غرفة جديدة</h2>
            <p className="text-indigo-100 mb-6 text-sm">العب مع أصدقائك أو افتح غرفة عامة وتعرف على أشخاص جدد.</p>
            <button 
              onClick={() => setShowCategorySelect(true)}
              className="w-full bg-white text-indigo-900 font-bold py-4 rounded-xl hover:bg-indigo-50 transition-transform active:scale-95 shadow-lg"
            >
              إنشاء الغرفة
            </button>
          </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl flex flex-col justify-between min-h-[250px] transform hover:scale-[1.02] transition-transform">
          <div>
            <div className="bg-slate-700 p-4 rounded-2xl w-fit mb-4">
              <KeyRound className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">دخول غرفة خاصة</h2>
            <p className="text-slate-400 mb-6 text-sm">انضم بواسطة رمز الغرفة (مثال: ROOM-1234).</p>
          </div>
          <form onSubmit={handleJoinRoom} className="space-y-4 w-full">
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              placeholder="ROOM-XXXX"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center font-mono font-bold tracking-widest focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none uppercase"
            />
            <button 
              type="submit"
              disabled={!joinId}
              className="w-full bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-lg"
            >
              انضمام
            </button>
          </form>
        </div>
      </div>

      <div className="mt-16 border-t border-slate-800 pt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-sky-500/20 rounded-2xl">
            <Globe className="w-6 h-6 text-sky-400" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">الغرف العامة</h2>
        </div>

        {publicRooms.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl">
            <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 text-lg">لا توجد غرف متاحة حالياً</p>
            <button
              onClick={() => setShowCategorySelect(true)}
              className="mt-4 text-indigo-400 hover:text-indigo-300 font-bold"
            >
              كُن أول من ينشئ غرفة!
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicRooms.map((room) => (
              <div key={room.roomId} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-slate-600 transition-colors">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg">
                      {room.roomId}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${room.status === 'playing' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {room.status === 'playing' ? 'بدأت اللعبة' : 'في الانتظار'}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{room.category}</h3>
                  <p className="text-slate-400 text-sm mt-1">المضيف: {room.hostName}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{room.playerCount} / 10</span>
                  </div>
                  <button
                    onClick={() => handleJoinPublicRoom(room.roomId)}
                    disabled={room.status === 'playing' || room.playerCount >= 10}
                    className="bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                  >
                    انضمام
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
