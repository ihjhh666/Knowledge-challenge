import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Debug() {
  const [counts, setCounts] = useState({ rooms: 0, players: 0, leaderboard: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const [{ count: rooms }, { count: players }, { count: leaderboard }] = await Promise.all([
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('players').select('*', { count: 'exact', head: true }),
        supabase.from('leaderboard').select('*', { count: 'exact', head: true })
      ]);
      
      setCounts({
        rooms: rooms || 0,
        players: players || 0,
        leaderboard: leaderboard || 0
      });
    } catch (err) {
      console.error('Error fetching debug counts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl mt-12 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
              <Database className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">Debug & Database Health</h1>
          </div>
          <button 
            onClick={fetchCounts} 
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-center">
            <h2 className="text-slate-400 font-bold mb-2">Rooms</h2>
            <p className="text-4xl font-black text-indigo-400 font-mono">
              {loading ? '-' : counts.rooms}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-center">
            <h2 className="text-slate-400 font-bold mb-2">Players</h2>
            <p className="text-4xl font-black text-emerald-400 font-mono">
              {loading ? '-' : counts.players}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-center">
            <h2 className="text-slate-400 font-bold mb-2">Leaderboard</h2>
            <p className="text-4xl font-black text-amber-400 font-mono">
              {loading ? '-' : counts.leaderboard}
            </p>
          </div>
        </div>

        <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-bold text-sm">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
