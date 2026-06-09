import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Key, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Handle unconfirmed email
      if (data.session === null && data.user) {
         setError('يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.');
         setLoading(false);
         return;
      }

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-indigo-500/20">
            <LogIn className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">تسجيل الدخول</h1>
          <p className="text-slate-400 text-sm mt-2">مرحباً بعودتك إلى تحدي المعرفة</p>
        </div>
        
        <div className="space-y-4">
          {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-sm font-bold">
               {error}
             </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 p-4 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-4 pr-12 pl-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-left text-white"
                required
                dir="ltr"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 right-0 p-4 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-4 pr-12 pl-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-left text-white tracking-widest font-mono"
                required
                dir="ltr"
              />
            </div>
            
            <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium block">
               نسيت كلمة المرور؟
            </Link>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> المتابعة</>}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-indigo-400 font-bold hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
