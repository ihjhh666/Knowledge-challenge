import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Mail, Info, Hexagon, BookOpen, MessageCircleQuestion, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-auto bg-slate-900 border-t border-slate-800 pt-16 pb-24 md:pb-8 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-center md:items-start text-center md:text-right">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Hexagon className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />
              </div>
              <h2 className="text-3xl font-bold font-heading bg-gradient-to-l from-indigo-400 to-purple-400 text-transparent bg-clip-text">تحدي المعرفة</h2>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              منصة الألعاب المعرفية الأولى في العالم العربي. العب، تعلم، وتحدى أصدقاءك في مجموعة متنوعة من الألعاب الممتعة والمسلية.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            
            <Link to="/guide" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-fuchsia-400 group-hover:bg-fuchsia-400/10 group-hover:border-fuchsia-400/30 transition-all duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-fuchsia-400 transition-colors">دليل الأطوار</span>
            </Link>

            <Link to="/how-to-play" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 group-hover:border-emerald-400/30 transition-all duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">كيفية اللعب</span>
            </Link>

            <Link to="/faq" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-400/10 group-hover:border-purple-400/30 transition-all duration-300">
                <MessageCircleQuestion className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-purple-400 transition-colors">الأسئلة الشائعة</span>
            </Link>

            <Link to="/about" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 group-hover:border-amber-400/30 transition-all duration-300">
                <Info className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-amber-400 transition-colors">عن المنصة</span>
            </Link>

            <Link to="/encyclopedia" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-400/10 group-hover:border-blue-400/30 transition-all duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors">موسوعة المعرفة</span>
            </Link>

            <Link to="/contact" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-400/10 group-hover:border-blue-400/30 transition-all duration-300">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors">اتصل بنا</span>
            </Link>

            <Link to="/privacy" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:bg-teal-400/10 group-hover:border-teal-400/30 transition-all duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-teal-400 transition-colors">سياسة الخصوصية</span>
            </Link>

            <Link to="/terms" className="group flex flex-col items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-rose-400 group-hover:bg-rose-400/10 group-hover:border-rose-400/30 transition-all duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-rose-400 transition-colors">شروط الاستخدام</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
            <span>© {new Date().getFullYear()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span>تحدي المعرفة</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            الأنظمة تعمل بكفاءة
          </div>
        </div>
      </div>
    </footer>
  );
}
