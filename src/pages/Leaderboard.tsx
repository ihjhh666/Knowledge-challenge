import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trophy, Medal, Star, Target } from 'lucide-react';
import { getLeaderboard, PlayerStats } from '../lib/firebase';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState<'wins' | 'totalPoints' | 'successRate'>('totalPoints');

  useEffect(() => {
    setLoading(true);
    getLeaderboard(sortMethod).then(data => {
      setLeaders(data);
      setLoading(false);
    });
  }, [sortMethod]);

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
          <h1 className="text-3xl font-bold font-heading flex items-center gap-2 text-amber-400">
            <Trophy className="w-8 h-8" />
            لوحة المتصدرين
          </h1>
          <p className="text-slate-400 mt-1">أفضل اللاعبين في تحدي المعرفة</p>
        </div>
      </header>

      <div className="flex gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl w-fit">
        <SortButton active={sortMethod === 'totalPoints'} onClick={() => setSortMethod('totalPoints')} icon={Star} label="النقاط" />
        <SortButton active={sortMethod === 'wins'} onClick={() => setSortMethod('wins')} icon={Medal} label="الانتصارات" />
        <SortButton active={sortMethod === 'successRate'} onClick={() => setSortMethod('successRate')} icon={Target} label="نسبة النجاح" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">لا توجد بيانات حالياً</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {leaders.map((player, idx) => (
              <div 
                key={player.playerId} 
                className={`flex gap-4 items-center p-4 hover:bg-slate-800/50 transition-colors ${idx < 3 ? 'bg-slate-800/30' : ''}`}
              >
                <div className={`w-10 h-10 shrink-0 font-bold font-mono rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-amber-500 text-amber-950 text-xl' : idx === 1 ? 'bg-slate-300 text-slate-900 text-lg' : idx === 2 ? 'bg-amber-700 text-amber-100 text-lg' : 'bg-slate-800 text-slate-400'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate text-lg">{player.playerName}</div>
                  <div className="flex gap-4 text-sm text-slate-400 mt-1">
                    <span>نقاط: <span className="font-mono text-indigo-400 font-bold">{player.totalPoints.toLocaleString()}</span></span>
                    <span>انتصارات: <span className="font-mono text-emerald-400 font-bold">{player.wins}</span></span>
                    <span>نجاح: <span className="font-mono text-sky-400 font-bold">{player.successRate}%</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SortButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
