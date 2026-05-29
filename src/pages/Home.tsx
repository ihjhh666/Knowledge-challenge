import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { useGame } from '../components/GameContext';
import { Users, Plus, KeyRound, Gamepad2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { createRoom, state } = useGame();
  const [username, setUsername] = useState('');
  const [hasName, setHasName] = useState(false);
  const [joinId, setJoinId] = useState('');

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

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 2) {
      storage.setPlayerName(username.trim());
      setHasName(true);
    }
  };

  const handleCreateRoom = () => {
    createRoom();
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim().toUpperCase().startsWith('ROOM-')) {
      navigate(`/room/${joinId.trim().toUpperCase()}`);
    } else {
      alert("الرجاء إدخال رمز صحيح مثل ROOM-1234");
    }
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
          className="text-sm border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
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
            className="w-full bg-white text-blue-900 font-bold py-4 rounded-xl hover:bg-blue-50 transition-transform active:scale-95"
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
            <p className="text-indigo-100 mb-6 text-sm">أنشئ غرفة وقم بدعوة أصدقائك للعب معاً عبر رابط مباشر.</p>
            <button 
              onClick={handleCreateRoom}
              className="w-full bg-white text-indigo-900 font-bold py-4 rounded-xl hover:bg-indigo-50 transition-transform active:scale-95"
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
            <h2 className="text-2xl font-bold font-heading mb-2">دخول غرفة</h2>
            <p className="text-slate-400 mb-6 text-sm">انضم إلى غرفة صديقك باستخدام رمز الغرفة.</p>
          </div>
          <form onSubmit={handleJoinRoom} className="space-y-4 w-full">
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              placeholder="مثال: ROOM-1234"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center font-mono font-bold tracking-widest focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none uppercase"
            />
            <button 
              type="submit"
              disabled={!joinId}
              className="w-full bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-transform active:scale-95"
            >
              انضمام
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
