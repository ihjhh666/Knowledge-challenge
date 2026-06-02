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
import Chat from './Chat';
import { LogOut, Users, Lock, UserPlus, Settings } from 'lucide-react';
import { FriendsSidebar } from '../components/FriendsSidebar';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state, joinRoom, leaveRoom, isHost } = useGame();
  const { user, loginWithGoogle, loginAsGuest } = useAuth();
  
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
  
  const handleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
       console.error("Login detail error:", error);
       if (error.code === 'auth/popup-closed-by-user') {
          setLoginError('تم إلغاء تسجيل الدخول.');
       } else if (error.code === 'auth/unauthorized-domain') {
          setLoginError('نطاق اللعبة غير مصرح به. يجب إضافة هذا الرابط إلى إعدادات Firebase Authentication.');
       } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
           setLoginError('المتصفح يمنع النافذة المنبثقة. يرجى فتح اللعبة في تبويبة جديدة (New Tab) والمحاولة مجدداً.');
       } else if (error.code === 'auth/internal-error' && error.message?.includes('API key not valid')) {
           setLoginError('مفتاح API غير صالح. تأكد من إعدادات Firebase.');
       } else if (error.message === "لم يتم تهيئة Firebase بنجاح. يرجى مراجعة إعدادات Firebase Setup وتعبئة جميع الحقول.") {
           setLoginError(error.message);
       } else {
          setLoginError(`خطأ: ${error.code || 'غير محدد'} - ${error.message || 'يرجى التأكد من إضافة نطاق الموقع في Firebase (Authorized domains).'}`);
       }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim().length >= 2) {
      await loginAsGuest(guestName.trim());
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold font-heading">تحدي المعرفة</h1>
            <p className="text-slate-400 text-sm mt-2">عليك تسجيل الدخول للانضمام إلى الغرفة ({roomId})</p>
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

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">أو</span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 border border-slate-200 disabled:opacity-70"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoggingIn ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول عبر Google'}
            </button>
            <div className="pt-4 text-center">
              <Link to="/firebase-setup" className="text-sm text-slate-500 hover:text-indigo-400 font-medium underline flex items-center justify-center gap-1">
                 <Settings className="w-4 h-4" /> 
                 إعدادات Firebase (صاحب الموقع)
              </Link>
            </div>
          </div>
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
      <FriendsSidebar isOpen={showFriends} onClose={() => setShowFriends(false)} />
      
      <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-white">تحدي المعرفة</h1>
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
          {state.status !== 'waiting' && state.gameMode !== 'fishing' && state.gameMode !== 'penalty' && state.gameMode !== 'domino' && state.gameMode !== 'hockey' && <PlayingField />}
          {state.status !== 'waiting' && state.gameMode === 'fishing' && <FishingRoom />}
          {state.status !== 'waiting' && state.gameMode === 'penalty' && <PenaltyRoom />}
          {state.status !== 'waiting' && state.gameMode === 'domino' && <DominoRoom />}
          {state.status !== 'waiting' && state.gameMode === 'hockey' && !state.hockeyState?.is2v2 && <HockeyRoom />}
          {state.status !== 'waiting' && state.gameMode === 'hockey' && state.hockeyState?.is2v2 && <Hockey2v2Room />}
        </div>
        
        <div className="h-[500px] lg:h-[calc(100vh-160px)] lg:sticky lg:top-8 flex flex-col">
          <Chat />
        </div>
      </div>
    </div>
  );
}
