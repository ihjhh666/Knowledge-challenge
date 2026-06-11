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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('--- تتبع عملية تسجيل الدخول بواسطة Google ---');
      const currentOrigin = window.location.origin;
      console.log('سيتم التحويل إلى:', currentOrigin);
      console.warn(`
[تشخيص المشكلة النهائي]
عند التسجيل بالإيميل: لا يحدث أي انتقال (Redirect) من الصفحة، فتظل في اللعبة الصحيحة.
عند التسجيل بـ Google: نرسل الرابط الحالي (${currentOrigin}) إلى Supabase.
لكن بما أن الرابط الحالي غير مسجل في قائمة "Redirect URLs" داخل إعدادات Supabase، 
فإن Supabase تتجاهل الرابط الحالي وتقوم بالتحويل الإجباري إلى الـ Site URL الافتراضي وهو:
https://knowledge-challenge.vercel.app

وهذا الرابط الأخير يستضيف النسخة الإنجليزية القديمة من التطبيق (كما ظهر في الصورة)، 
وليس النسخة العربية الحالية!
لذلك تظهر لك واجهة التطبيق القديم وليس اللعبة العربية الحالية.
`);

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentOrigin // نمرر الدومين الفعلي للتطبيق لكي لا يعود إلى localhost
        }
      });
      
      if (signInError) throw signInError;
      
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError('فشل تسجيل الدخول بواسطة Google: ' + err.message);
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const guestName = `لاعب${randomNum}`;

      const { data, error: signInError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username: guestName,
            account_type: 'guest'
          }
        }
      });

      if (signInError) throw signInError;

      if (data.user) {
        console.log('GUEST_LOGIN_STARTED');
        const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`;
        try {
          await supabase.from('players').insert({
            id: data.user.id,
            username: guestName,
            is_online: true,
            last_active_at: new Date().toISOString()
          });
          console.log('GUEST_PLAYER_CREATED');
        } catch (e) {
          console.error(e);
        }
        console.log('GUEST_LOGIN_SUCCESS');
      }

      navigate('/', { replace: true });
    } catch (err: any) {
      setError('فشل الدخول كزائر: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20 flex flex-col items-center">
        
        {/* قسم تسجيل الدخول */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl z-10 relative">
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
  
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 border border-gray-200 shadow-sm mt-4"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              تسجيل الدخول بواسطة Google
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-700/50"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">أو</span>
              <div className="flex-grow border-t border-slate-700/50"></div>
            </div>
            
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 border border-slate-700"
            >
              الدخول كزائر
            </button>
            
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

        <div className="h-px w-full max-w-lg bg-gradient-to-r from-transparent via-slate-700 to-transparent my-16"></div>

        {/* 4. قسم الشرح وكيفية اللعب */}
        <section className="space-y-6 w-full max-w-5xl">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="p-3 bg-pink-500/20 rounded-2xl shadow-lg border border-pink-500/20 text-2xl">
              🎮
            </div>
            <h2 className="text-4xl font-bold font-heading text-white tracking-wide">كيف تلعب؟</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* فكرة اللعبة */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-pink-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-start shadow-xl hover:-translate-y-1">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-pink-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                     🎯
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">فكرة اللعبة</h3>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed mb-0">
                 "تحدي المعرفة" هي لعبة مسابقات أسئلة عربية تتيح لك اختبار معلوماتك والتنافس مع أصدقائك أو لاعبين آخرين في غرف ممتعة ومثيرة.
               </p>
            </div>

            {/* طريقة اللعب */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-start shadow-xl hover:-translate-y-1">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                     🕹️
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">طريقة اللعب</h3>
               </div>
               <ul className="text-slate-400 text-sm leading-relaxed space-y-2">
                 <li className="flex items-start gap-2">
                   <span className="text-cyan-400 font-bold">1-</span>
                   <span>اختر القسم أو اللعبة التي تريدها.</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="text-cyan-400 font-bold">2-</span>
                   <span>أنشئ غرفة خاصة وادعُ أصدقاءك أو انضم متاح.</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="text-cyan-400 font-bold">3-</span>
                   <span>أجب عن الأسئلة قبل انتهاء الوقت المخصص.</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="text-cyan-400 font-bold">4-</span>
                   <span>اجمع النقاط وحاول الوصول إلى المركز الأول!</span>
                 </li>
               </ul>
            </div>

            {/* المميزات */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-300 group flex flex-col items-start shadow-xl hover:-translate-y-1">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                     🏆
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">المميزات</h3>
               </div>
               <ul className="text-slate-400 text-sm leading-relaxed space-y-3">
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                   آلاف الأسئلة المتنوعة والمحدثة.
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                   منافسة مباشرة ولحظية مع الأصدقاء.
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                   لوحة وتصنيف لأفضل اللاعبين.
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                   أطوار لعب (مسابقات، صيد، دومينو، وهوكي).
                 </li>
               </ul>
            </div>
          </div>

          {/* لماذا تلعب */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden group mt-4">
             <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
             <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex flex-shrink-0 items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20 z-10">
               📌
             </div>
             <div className="text-center md:text-right z-10 w-full">
               <h3 className="text-2xl font-bold font-heading text-white mb-2">لماذا تلعب تحدي المعرفة؟</h3>
               <p className="text-slate-300 text-base leading-relaxed">
                 لأنها اللعبة الوحيدة التي تجمع بين <strong>التعلم، المتعة، والمنافسة</strong> في تجربة عربية سلسة ومصممة بأعلى معايير الجودة لتناسب الجميع ولتكون إضافة قيمة لمعرفتك!
               </p>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
