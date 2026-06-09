import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { CheckCircle, Loader2 } from 'lucide-react';

export const UsernamePrompt = () => {
  const { needsUsernamePrompt, completeProfile, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authLoading || !needsUsernamePrompt) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) {
      setError('يجب ألا يقل الاسم عن حرفين');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await completeProfile(username.trim());
    } catch (err: any) {
      setError('فشل حفظ اسم المستخدم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-heading text-white mb-2">أهلاً بك!</h2>
          <p className="text-slate-400 text-sm">اختر اسم مستخدم للبدء باللعب، لن يتم تغييره لاحقاً.</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-sm font-bold mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="اسم المستخدم"
            className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-4 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-right text-white"
            maxLength={20}
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> متابعة</>}
          </button>
        </form>
      </div>
    </div>
  );
};
