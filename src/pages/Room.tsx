import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../components/GameContext';
import Lobby from './Lobby';
import PlayingField from './PlayingField';
import FishingRoom from './FishingRoom';
import Chat from './Chat';
import { LogOut, Users, Lock } from 'lucide-react';
import { storage } from '../lib/storage';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state, joinRoom, leaveRoom, isHost } = useGame();
  
  const [hasName, setHasName] = useState(!!storage.getPlayerName());
  const [username, setUsername] = useState('');
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const joiningRef = React.useRef(false);
  const leavingRef = React.useRef(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 2) {
      storage.setPlayerName(username.trim());
      setHasName(true);
    }
  };

  const attemptJoin = (password?: string) => {
    if (!roomId || leavingRef.current) return;
    joiningRef.current = true;
    setErrorStr(null);
    joinRoom(roomId, password, (err) => {
       setErrorStr(err);
       if (err.includes('مرور') || err.includes('Password')) {
         setNeedsPassword(true);
       }
       joiningRef.current = false;
    });
  };

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    if (hasName && !state && !isHost && !joiningRef.current && !needsPassword && !errorStr && !leavingRef.current) {
      attemptJoin();
    }
  }, [roomId, state, isHost, navigate, hasName, needsPassword, errorStr]);

  const handleLeave = () => {
    leavingRef.current = true;
    leaveRoom();
    navigate('/');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attemptJoin(joinPassword);
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
            <p className="text-slate-400 text-sm mt-2">عليك إدخال اسمك للانضمام إلى الغرفة ({roomId})</p>
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
              دخول الغرفة
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="text-center space-y-6 max-w-sm w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          {!errorStr && !needsPassword ? (
            <>
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg font-bold font-heading">جاري الاتصال بالغرفة...</p>
            </>
          ) : needsPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="bg-amber-500/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold font-heading text-white">الغرفة محمية بكلمة مرور</h2>
              {errorStr && <p className="text-red-400 text-sm font-bold">{errorStr}</p>}
              <input
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                دخول الغرفة
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 mt-2 text-sm"
              >
                رجوع
              </button>
            </form>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold font-heading text-red-400">{errorStr}</h2>
              <p className="text-slate-400 text-sm">لم يتم العثور على الغرفة أو تم إغلاقها، يرجى التأكد من الرمز.</p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                العودة للرئيسية
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 md:p-8 space-y-8 flex flex-col">
      <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-white">تحدي المعرفة</h1>
          <span className="px-3 py-1 bg-slate-800 text-xs text-slate-400 rounded-lg hidden sm:block">
            {state.status === 'waiting' ? 'في الانتظار' : 'جاري اللعب'}
          </span>
        </div>
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">خروج من الغرفة</span>
        </button>
      </header>

      <div className="flex-1 grid lg:grid-cols-3 gap-8 pb-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {state.status === 'waiting' && <Lobby />}
          {state.status !== 'waiting' && state.gameMode !== 'fishing' && <PlayingField />}
          {state.status !== 'waiting' && state.gameMode === 'fishing' && <FishingRoom />}
        </div>
        
        <div className="h-[500px] lg:h-[calc(100vh-160px)] lg:sticky lg:top-8 flex flex-col">
          <Chat />
        </div>
      </div>
    </div>
  );
}
