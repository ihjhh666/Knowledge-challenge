import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGame } from '../components/GameContext';
import { useAuth } from '../components/AuthContext';
import Lobby from './Lobby';
import PlayingField from './PlayingField';
import FishingRoom from './FishingRoom';
import PenaltyRoom from './PenaltyRoom';
import DominoRoom from './DominoRoom';
import HockeyRoom from './HockeyRoom';
import Hockey2v2Room from './Hockey2v2Room';
import KingModeRoom from './KingModeRoom';
import ChickenRoom from './ChickenRoom';
import Chat from './Chat';
import { LogOut, Users, Lock, UserPlus, Settings } from 'lucide-react';
import { FriendsSidebar } from '../components/FriendsSidebar';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state, joinRoom, leaveRoom, isHost } = useGame();
  const { user, loginAsGuest } = useAuth();
  
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [guestName, setGuestName] = useState('');
  
  const joiningRef = useRef(false);
  const leavingRef = useRef(false);

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

    if (user && !state && !isHost && !joiningRef.current && !needsPassword && !errorStr && !leavingRef.current) {
      attemptJoin();
    }
  }, [roomId, state, isHost, navigate, user, needsPassword, errorStr]);

  const handleLeave = () => {
    leavingRef.current = true;
    leaveRoom();
    navigate('/');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attemptJoin(joinPassword);
  };

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

  if (!user) {
    return null; // Will be redirected by ProtectedRoute
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
      <FriendsSidebar isOpen={showFriends} onClose={() => setShowFriends(false)} />
      
      <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-white">
            {state.gameMode === 'chicken' ? 'Chicken Rush Online' :
             state.gameMode === 'fishing' ? '🎣 صيد السمك' :
             state.gameMode === 'penalty' ? '⚽ ركلات الجزاء' :
             state.gameMode === 'domino' ? '🎲 الدومينو' :
             state.gameMode === 'hockey' ? '🏒 الهوكي' :
             state.gameMode === 'king' ? '👑 طور الملك' : '🧠 تحدي المعرفة'}
          </h1>
          <span className="px-3 py-1 bg-slate-800 text-xs text-slate-400 rounded-lg hidden sm:block">
            {state.status === 'waiting' ? 'في الانتظار' : 'جاري اللعب'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFriends(true)}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">دعوة صديق</span>
          </button>
          <button
            onClick={handleLeave}
            className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج من الغرفة</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-3 gap-8 pb-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {state.status === 'waiting' && <Lobby />}
          {state.status !== 'waiting' && state.gameMode !== 'fishing' && state.gameMode !== 'penalty' && state.gameMode !== 'domino' && state.gameMode !== 'hockey' && state.gameMode !== 'king' && state.gameMode !== 'chicken' && <PlayingField />}
          {state.status !== 'waiting' && state.gameMode === 'fishing' && <FishingRoom />}
          {state.status !== 'waiting' && state.gameMode === 'penalty' && <PenaltyRoom />}
          {state.status !== 'waiting' && state.gameMode === 'domino' && <DominoRoom />}
          {state.status !== 'waiting' && state.gameMode === 'hockey' && !state.hockeyState?.is2v2 && <HockeyRoom />}
          {state.status !== 'waiting' && state.gameMode === 'hockey' && state.hockeyState?.is2v2 && <Hockey2v2Room />}
          {state.status !== 'waiting' && state.gameMode === 'king' && <KingModeRoom />}
          {state.status !== 'waiting' && state.gameMode === 'chicken' && <ChickenRoom />}
        </div>
        
        <div className="h-[500px] lg:h-[calc(100vh-160px)] lg:sticky lg:top-8 flex flex-col">
          <Chat />
        </div>
      </div>
    </div>
  );
}
