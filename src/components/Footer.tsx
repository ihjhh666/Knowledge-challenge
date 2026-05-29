import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full mt-auto bg-slate-950 border-t border-slate-800 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="text-center md:text-right">
          <h2 className="text-xl font-bold font-heading text-white mb-2">تحدي المعرفة</h2>
          <p className="text-slate-500 text-sm">منصة الألعاب المعرفية الأولى في العالم العربي.</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
          <Link to="/about" className="hover:text-white transition-colors">من نحن</Link>
          <Link to="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
          <Link to="/contact" className="hover:text-white transition-colors">اتصل بنا</Link>
        </nav>

        <div className="text-slate-600 text-sm">
           © {new Date().getFullYear()} تحدي المعرفة. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
