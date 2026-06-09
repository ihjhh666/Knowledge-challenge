import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Loader2, ArrowRight, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/reset-password',
      });

      if (resetError) throw resetError;

      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-indigo-500/20">
            <KeyRound className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">نسيت كلمة المرور</h1>
          <p className="text-slate-400 text-sm mt-2">أدخل بريدك الإلكتروني لإرسال الرابط</p>
        </div>
        
        <div className="space-y-4">
          {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-sm font-bold">
               {error}
             </div>
          )}
          
          {success && (
             <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-center text-sm font-bold">
               {success}
             </div>
          )}
          
          <form onSubmit={handleReset} className="space-y-4">
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
            
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال الرابط'}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <Link to="/login" className="text-slate-400 font-bold hover:text-white transition-colors flex justify-center items-center gap-2">
              <ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
