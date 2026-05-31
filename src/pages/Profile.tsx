import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Trophy, Star, Target, CheckCircle, XCircle, Gamepad2, BrainCircuit } from 'lucide-react';
import { db, PlayerStats } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { storage } from '../lib/storage';

export default function Profile() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const playerId = storage.getPlayerId();
      if (!db || !playerId) {
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
  }, []);

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-2 text-indigo-400">
            <User className="w-8 h-8" />
            الملف الشخصي
          </h1>
          <p className="text-slate-400 mt-1">إحصائياتك وأداؤك في تحدي المعرفة</p>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full flex justify-center items-center font-bold text-4xl shrink-0">
              {stats.playerName.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold font-heading text-white">{stats.playerName}</h2>
              <p className="text-slate-400 font-mono mt-1 text-sm">المعرف: {stats.playerId.slice(0, 8)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard icon={Gamepad2} label="إجمالي المباريات" value={stats.gamesPlayed} color="text-blue-400" bg="bg-blue-500/20" />
            <StatCard icon={Trophy} label="الانتصارات" value={stats.wins} color="text-emerald-400" bg="bg-emerald-500/20" />
            <StatCard icon={Star} label="إجمالي النقاط" value={stats.totalPoints.toLocaleString()} color="text-amber-400" bg="bg-amber-500/20" />
            <StatCard icon={Target} label="نسبة النجاح" value={`${stats.successRate}%`} color="text-sky-400" bg="bg-sky-500/20" />
            <StatCard icon={CheckCircle} label="إجابات صحيحة" value={stats.correctAnswers} color="text-emerald-500" bg="bg-emerald-500/10" />
            <StatCard icon={XCircle} label="إجابات خاطئة" value={stats.wrongAnswers} color="text-rose-500" bg="bg-rose-500/10" />
            <StatCard icon={BrainCircuit} label="التصنيف المفضل" value={stats.mostPlayedCategory} color="text-purple-400" bg="bg-purple-500/20" colSpan="col-span-2" />
          </div>
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
