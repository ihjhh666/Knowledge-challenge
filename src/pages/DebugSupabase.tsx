import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';

export default function DebugSupabase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    players: number;
    rooms: number;
    leaderboard: number;
    hasSchemaError: boolean;
    isConnected: boolean;
  } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    const data = await supabaseService.getTableStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-emerald-400">⚡</span> Supabase Debug
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              مرحلة التجهيز والانتقال - Phase 1 Migration
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-bold text-sm"
          >
            العودة للرئيسية
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold">جاري فحص الاتصال وقاعدة البيانات...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
              stats?.isConnected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className={`text-4xl ${stats?.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats?.isConnected ? '✅' : '❌'}
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${stats?.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats?.isConnected ? 'Supabase متصل بنجاح وجاهز' : 'خطأ في الاتصال أو الجداول غير موجودة (Schema Error)'}
                </h3>
                <p className="text-sm opacity-80">
                  {stats?.isConnected 
                    ? 'الجداول الثلاثة الأساسية موجودة ويمكن القراءة منها.'
                    : 'يرجى تشغيل كود SQL لإنشاء الجداول (موجود أدناه).'}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
                <span className="text-4xl mb-2">👥</span>
                <span className="text-slate-400 text-sm font-bold mb-1">جدول players</span>
                <span className="text-3xl font-black text-white">{stats?.players || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
                <span className="text-4xl mb-2">🏠</span>
                <span className="text-slate-400 text-sm font-bold mb-1">جدول rooms</span>
                <span className="text-3xl font-black text-white">{stats?.rooms || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
                <span className="text-4xl mb-2">🏆</span>
                <span className="text-slate-400 text-sm font-bold mb-1">جدول leaderboard</span>
                <span className="text-3xl font-black text-white">{stats?.leaderboard || 0}</span>
              </div>
            </div>

            {/* Error & SQL Section */}
            {stats?.hasSchemaError && (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-amber-400 text-lg mb-4 flex items-center gap-2">
                  <span>⚠️</span> لم يتم العثور على الجداول المطلوبة!
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  يرجى فتح <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Supabase SQL Editor</a> وتنفيذ الكود التالي لإنشاء البنية التحتية المطلوبة:
                </p>
                <div className="relative">
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-xs overflow-x-auto text-left" dir="ltr">
{`-- 1. Players Table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  host_name TEXT NOT NULL,
  category TEXT NOT NULL,
  game_mode TEXT NOT NULL,
  player_count INTEGER DEFAULT 1,
  max_players INTEGER DEFAULT 10,
  room_visibility TEXT DEFAULT 'public',
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                  </pre>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <button 
                onClick={fetchStats}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold"
              >
                تحديث البيانات 🔄
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
