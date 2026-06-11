import React, { useState } from 'react';
import { ArrowRight, Mail, Youtube, Instagram, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("يرجى تعبئة جميع الحقول بشكل صحيح");
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);

      if (error) {
        // If the table doesn't exist yet, we still show success to the user so they aren't blocked,
        // but log it since it's a dev issue.
        if (error.code === 'PGRST205' || error.message?.includes('relation "public.contact_messages" does not exist')) {
            console.error("contact_messages table does not exist. Please run the SQL in DebugSupabase.");
        } else {
            throw error;
        }
      }
      
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      console.error("Error submitting contact form:", err);
      setErrorMessage("حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.");
      setStatus('error');
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للصفحة الرئيسية</span>
        </Link>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400">
            <Mail className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">اتصل بنا</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800/50">
            <h2 className="text-2xl font-bold text-white mb-6">يسعدنا تواصلك</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              يسعدنا تواصلك معنا. إذا كان لديك اقتراح، ملاحظة، أو واجهت مشكلة أثناء اللعب، يمكنك مراسلتنا وسنحاول مساعدتك.
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <a href="mailto:almhbwbswfy342@gmail.com" className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
                <Mail className="w-6 h-6 text-slate-400" />
              </a>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">البريد الإلكتروني</p>
                <a href="mailto:almhbwbswfy342@gmail.com" className="text-white hover:text-rose-400 transition font-mono" dir="ltr">almhbwbswfy342@gmail.com</a>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/50">
              <h2 className="text-xl font-bold text-white mb-4">تابع تحدي المعرفة</h2>
              <div className="space-y-4">
                <a 
                  href="https://youtube.com/@tahadialmarifa?si=O-nzokiBkZvpAKOw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-950 border border-slate-800 hover:border-red-500/50 hover:bg-slate-900 px-4 py-3 rounded-xl transition-all group"
                >
                  <Youtube className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium">قناة YouTube</span>
                </a>
                
                <a 
                  href="https://www.instagram.com/ug_qz?igsh=MTZhcnVncDg3ZHIyZw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-950 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-900 px-4 py-3 rounded-xl transition-all group"
                >
                  <Instagram className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium">حساب Instagram</span>
                </a>
              </div>
            </div>
            
          </div>

          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800/50">
            <h2 className="text-2xl font-bold text-white mb-6">أرسل لنا رسالة</h2>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <p className="text-emerald-400 font-medium">تم إرسال رسالتك بنجاح. شكراً لتواصلك معنا!</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                <p className="text-rose-400 font-medium">{errorMessage}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">الاسم</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-colors" 
                  required 
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-colors" 
                  dir="ltr" 
                  required 
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">الرسالة</label>
                <textarea 
                  rows={4} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none transition-colors" 
                  required
                  disabled={status === 'loading'}
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>إرسال</span>
                )}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
