import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User as UserIcon, LogIn, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('--- Register Attempt ---');
      console.log(`Email value: "${email}" (Length: ${email.length})`);
      console.log('Char codes:', email.split('').map(c => c.charCodeAt(0)).join(', '));
      
      // Manual simple validation to print rejection reason if any
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
         console.warn("Custom Validation Failed! Email doesn't match standard regex. Reason: Contains spaces, missing @, or invalid domain.");
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: name,
            account_type: 'registered'
          }
        }
      });

      if (signUpError) throw signUpError;

      // Also create record in players table if we have an ID
      if (data.user) {
        const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`;
        // Best effort insert in case they didn't get inserted yet
        const { error: insertError } = await supabase.from('players').insert({
          id: data.user.id,
          username: name,
          avatar_url: defaultAvatar,
          is_online: true,
          last_active_at: new Date().toISOString()
        }).select().single();
        if (insertError) console.error(insertError);
      }

      // Handle unconfirmed email scenario (requires user to check their email)
      if (data.user && data.session === null) {
        setSuccess('تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.');
        setName('');
        setEmail('');
        setPassword('');
      } else if (data.session) {
        // Logged in immediately
        navigate('/', { replace: true });
      } else {
        setSuccess('تم التسجيل بنجاح! يرجى مراجعة بريدك الإلكتروني.');
      }
    } catch (err: any) {
      if (err.message.includes('User already registered')) {
        setError('هذا البريد الإلكتروني مسجل مسبقاً.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-emerald-500/20">
            <UserIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">إنشاء حساب</h1>
          <p className="text-slate-400 text-sm mt-2">انضم إلى مجتمع التحدي</p>
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
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 p-4 flex items-center pointer-events-none text-slate-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-4 pr-12 pl-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-right text-white"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 p-4 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  console.log(`[Email Input] Value changed: "${e.target.value}"`, 'Char codes:', e.target.value.split('').map(c => c.charCodeAt(0)).join(', '));
                  setEmail(e.target.value);
                }}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-4 pr-12 pl-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-left text-white"
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
                placeholder="كلمة المرور (6 أحرف على الأقل)"
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl py-4 pr-12 pl-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-left text-white tracking-widest font-mono"
                required
                minLength={6}
                dir="ltr"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email || !password || !name}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserIcon className="w-5 h-5" /> إنشاء الحساب</>}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-emerald-400 font-bold hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
