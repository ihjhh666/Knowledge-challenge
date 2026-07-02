import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie_consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-slate-900 border-t border-slate-700 p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom" dir="rtl">
      <div className="text-slate-300 text-sm md:text-base leading-relaxed text-center md:text-right max-w-4xl">
        <p>
          نحن نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على موقعنا، تخصيص المحتوى والإعلانات، وتوفير ميزات وسائل التواصل الاجتماعي، وتحليل حركة الزيارات. 
          بمواصلة تصفح الموقع، فإنك توافق على استخدامنا لملفات تعريف الارتباط. لمعرفة المزيد، يرجى قراءة <Link to="/privacy" className="text-indigo-400 hover:underline font-semibold">سياسة الخصوصية</Link>.
        </p>
      </div>
      <div className="shrink-0 flex gap-3">
        <button 
          onClick={handleAccept}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg active:scale-95"
        >
          أوافق
        </button>
      </div>
    </div>
  );
}
