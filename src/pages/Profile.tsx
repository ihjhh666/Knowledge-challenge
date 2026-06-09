import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Trophy, Star, Target, CheckCircle, XCircle, Gamepad2, BrainCircuit, Users, Copy, Upload, Trash2, LogIn } from 'lucide-react';
import { db, PlayerStats, subscribeToFriends, updateUserProfile } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { storage } from '../lib/storage';
import { ACHIEVEMENTS } from '../lib/achievements';
import { useAuth } from '../components/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playerId = storage.getPlayerId();
  const [avatar, setAvatar] = useState(storage.getPlayerAvatar());

  const isGuest = user?.user_metadata?.account_type === 'guest';

  useEffect(() => {
    const fetchStats = async () => {
      if (!db || !playerId || isGuest) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', (playerId as string));
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setStats(snap.data() as PlayerStats);
        }
      } catch(err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [playerId, isGuest]);

  // ... (keeping other useEffects but they won't render if isGuest returns early, see below)
  useEffect(() => {
      if (!playerId || isGuest) return;
      const unsub = subscribeToFriends(playerId, (friends) => {
          setFriendCount(friends.length);
      });
      return unsub;
  }, [playerId, isGuest]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(playerId);
    alert('تم نسخ المعرف بنجاح!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       alert('الرجاء اختيار صورة صالحة');
       return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
             const canvas = document.createElement('canvas');
             const MAX_SIZE = 256;
             let width = img.width;
             let height = img.height;

             if (width > height) {
                 if (width > MAX_SIZE) {
                     height *= MAX_SIZE / width;
                     width = MAX_SIZE;
                 }
             } else {
                 if (height > MAX_SIZE) {
                     width *= MAX_SIZE / height;
                     height = MAX_SIZE;
                 }
             }

             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 ctx.drawImage(img, 0, 0, width, height);
                 const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                 setAvatar(dataUrl);
                 storage.setPlayerAvatar(dataUrl);
                 if (stats) setStats({ ...stats, avatarUrl: dataUrl });
                 await updateUserProfile(playerId, { avatarUrl: dataUrl });
             }
             setIsUploading(false);
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = async () => {
     setIsUploading(true);
     const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${playerId}`;
     setAvatar(defaultAvatar);
     storage.setPlayerAvatar(defaultAvatar);
     if (stats) setStats({ ...stats, avatarUrl: defaultAvatar });
     await updateUserProfile(playerId, { avatarUrl: defaultAvatar });
     setIsUploading(false);
  };

  if (isGuest) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 space-y-8" dir="rtl">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-2 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold font-heading text-indigo-400">الملف الشخصي</h1>
        </header>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <User className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-3">خاصية غير متاحة للزوار</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">قم بإنشاء حساب دائم لحفظ تقدمك، تغيير صورتك الشخصية، وتتبع إحصائياتك وإنجازاتك.</p>
          <button 
            onClick={async () => {
              await logout();
              navigate('/register');
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <LogIn className="w-5 h-5" /> إنشاء حساب دائم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 space-y-8" dir="rtl">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-2 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-2 text-indigo-400">
            <User className="w-7 h-7" />
            الملف الشخصي
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : !stats ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <Gamepad2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">لا توجد إحصائيات حتى الآن</h2>
          <p className="text-slate-400">العب بعض المباريات حتى تظهر إحصائياتك هنا!</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6">
             <div className="flex flex-col items-center gap-4 shrink-0">
               <div className="relative">
                 <img src={stats.avatarUrl || avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${playerId}`} className={`w-28 h-28 rounded-3xl bg-slate-950 object-cover border-2 border-slate-800 ${isUploading ? 'opacity-50' : ''}`} alt="Avatar" />
                 {isUploading && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                   </div>
                 )}
               </div>
               
               <div className="flex gap-2">
                 <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handleImageUpload}
                 />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isUploading}
                   className="text-xs bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white px-3 py-2 rounded-lg transition-colors border border-indigo-500/30 flex items-center gap-1.5"
                 >
                     <Upload className="w-3.5 h-3.5" />
                     {(stats.avatarUrl || avatar) && !(stats.avatarUrl || avatar).includes('dicebear') ? 'تغيير الصورة' : 'رفع صورة'}
                 </button>
                 {(stats.avatarUrl || avatar) && !(stats.avatarUrl || avatar).includes('dicebear') && (
                   <button 
                     onClick={handleDeleteAvatar}
                     disabled={isUploading}
                     className="text-xs bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white px-3 py-2 rounded-lg transition-colors border border-rose-500/30 flex items-center gap-1.5"
                     title="حذف الصورة"
                   >
                       <Trash2 className="w-3.5 h-3.5" />
                   </button>
                 )}
               </div>
             </div>
            <div className="flex-1 text-center md:text-right space-y-3 w-full">
              <h2 className="text-3xl font-bold font-heading text-white">{stats.playerName}</h2>
              <div className="flex flex-col md:flex-row items-center gap-3">
                 <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
                    <span className="text-slate-400 text-sm">المعرف:</span>
                    <span className="font-mono font-bold tracking-widest text-indigo-400">{playerId}</span>
                 </div>
                 <button 
                   onClick={copyToClipboard}
                   className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-colors border border-slate-700"
                   title="نسخ المعرف"
                 >
                    <Copy className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard icon={Gamepad2} label="إجمالي المباريات" value={stats.gamesPlayed || 0} color="text-blue-400" bg="bg-blue-500/20" />
            <StatCard icon={Trophy} label="الانتصارات" value={stats.wins || 0} color="text-emerald-400" bg="bg-emerald-500/20" />
            <StatCard icon={Users} label="الأصدقاء" value={friendCount || 0} color="text-indigo-400" bg="bg-indigo-500/20" />
            <StatCard icon={Star} label="إجمالي النقاط" value={(stats.totalPoints || 0).toLocaleString()} color="text-amber-400" bg="bg-amber-500/20" />
            <StatCard icon={Target} label="نسبة النجاح" value={`${stats.successRate || 0}%`} color="text-sky-400" bg="bg-sky-500/20" />
            <StatCard icon={CheckCircle} label="إجابات صحيحة" value={stats.correctAnswers || 0} color="text-emerald-500" bg="bg-emerald-500/10" />
            <StatCard icon={XCircle} label="إجابات خاطئة" value={stats.wrongAnswers || 0} color="text-rose-500" bg="bg-rose-500/10" />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-2xl font-bold font-heading text-indigo-400 flex items-center gap-2">🏆 الإنجازات</h3>
               <button onClick={() => navigate('/achievements')} className="text-sm text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors">عرض الكل</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-3">
                     <Trophy className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">الإنجازات المفتوحة</p>
                  <p className="font-bold text-2xl text-white">{stats.unlockedAchievements?.length || 0}</p>
               </div>
               
               <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-3xl shadow-[0_0_20px_rgba(245,158,11,0.05)] flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-3">
                     <Star className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">الأسطورية</p>
                  <p className="font-bold text-2xl text-amber-400">
                     {stats.unlockedAchievements?.filter(a => ACHIEVEMENTS.find(ach => ach.id === a.id)?.rarity === 'legendary').length || 0}
                  </p>
               </div>
               
               <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-3">
                     <Target className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">نسبة الإكمال</p>
                  <p className="font-bold text-2xl text-white">{Math.round(((stats.unlockedAchievements?.length || 0) / ACHIEVEMENTS.length) * 100)}%</p>
               </div>
            </div>
          </div>

          {(stats.fishingGamesPlayed || 0) > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-bold font-heading text-sky-400 mb-4 flex items-center gap-2">🎣 إحصائيات صيد السمك</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard icon={Gamepad2} label="مباريات الصيد" value={stats.fishingGamesPlayed || 0} color="text-blue-400" bg="bg-blue-500/20" />
                <StatCard icon={Trophy} label="مرات الفوز" value={stats.fishingWins || 0} color="text-emerald-400" bg="bg-emerald-500/20" />
                <StatCard icon={Star} label="إجمالي النقاط" value={(stats.fishingTotalPoints || 0).toLocaleString()} color="text-amber-400" bg="bg-amber-500/20" />
                <StatCard icon={Target} label="أعلى نتيجة" value={(stats.fishingHighestScore || 0).toLocaleString()} color="text-sky-400" bg="bg-sky-500/20" />
                <StatCard icon={CheckCircle} label="إجمالي الأسماك" value={stats.fishingTotalFish || 0} color="text-purple-400" bg="bg-purple-500/20" colSpan="col-span-2 md:col-span-1 lg:col-span-2" />
              </div>
            </div>
          )}

          {(stats.penaltyGamesPlayed || 0) > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-bold font-heading text-green-400 mb-4 flex items-center gap-2">⚽ إحصائيات ركلات الجزاء</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard icon={Gamepad2} label="إجمالي المباريات" value={stats.penaltyGamesPlayed || 0} color="text-blue-400" bg="bg-blue-500/20" />
                <StatCard icon={Trophy} label="مرات الفوز" value={stats.penaltyWins || 0} color="text-emerald-400" bg="bg-emerald-500/20" />
                <StatCard icon={Target} label="أهداف مسجلة" value={stats.penaltyGoals || 0} color="text-emerald-500" bg="bg-emerald-500/20" />
                <StatCard icon={CheckCircle} label="تصديات ناجحة" value={stats.penaltySaves || 0} color="text-amber-400" bg="bg-amber-500/20" />
                <StatCard icon={Star} label="أعلى سلسلة انتصارات" value={stats.penaltyWinStreak || 0} color="text-purple-400" bg="bg-purple-500/20" />
              </div>
            </div>
          )}

          {(stats.hockeyGamesPlayed || 0) > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-bold font-heading text-rose-400 mb-4 flex items-center gap-2">🏒 إحصائيات الهوكي</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard icon={Gamepad2} label="إجمالي المباريات" value={stats.hockeyGamesPlayed || 0} color="text-blue-400" bg="bg-blue-500/20" />
                <StatCard icon={Trophy} label="مرات الفوز" value={stats.hockeyWins || 0} color="text-emerald-400" bg="bg-emerald-500/20" />
                <StatCard icon={XCircle} label="مرات الخسارة" value={stats.hockeyLosses || 0} color="text-rose-400" bg="bg-rose-500/20" />
                <StatCard icon={Target} label="أهداف لك" value={stats.hockeyGoalsScored || 0} color="text-emerald-500" bg="bg-emerald-500/20" />
                <StatCard icon={CheckCircle} label="أهداف عليك" value={stats.hockeyGoalsConceded || 0} color="text-rose-500" bg="bg-rose-500/20" />
                <StatCard icon={Star} label="أعلى سلسلة انتصارات" value={stats.hockeyWinStreak || 0} color="text-purple-400" bg="bg-purple-500/20" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, colSpan = "" }: { icon: any, label: string, value: string | number, color: string, bg: string, colSpan?: string }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl ${colSpan}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-bold">{label}</p>
        <p className="text-2xl font-bold font-mono text-white mt-1">{value}</p>
      </div>
    </div>
  );
}
