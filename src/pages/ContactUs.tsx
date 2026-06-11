import React from 'react';
import { ArrowRight, Mail, Youtube, Instagram } from 'lucide-react';
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
