import React from 'react';
import { ArrowRight, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactUs() {
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
              نرحب دائماً باقتراحاتكم، ملاحظاتكم، أو أي إبلاغات عن أخطاء فنية في اللعبة. نحن هنا لضمان تقديم أفضل تجربة ممكنة.
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">البريد الإلكتروني</p>
                <p className="text-white font-mono" dir="ltr">support@quizchallenge.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                 <p className="text-sm text-slate-500 font-semibold mb-1">تواصل آخر</p>
                 <p className="text-white">قريباً على شبكات التواصل...</p>
              </div>
            </div>
            
          </div>

          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800/50">
            <h2 className="text-2xl font-bold text-white mb-6">أرسل لنا رسالة</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("تم الاستلام، شكراً لتواصلك!"); }}>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">الاسم</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">البريد الإلكتروني</label>
                <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none" dir="ltr" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">الرسالة</label>
                <textarea rows={4} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none" required></textarea>
              </div>
              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                إرسال
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
