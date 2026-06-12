import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Newspaper, Rocket, Zap, Wrench, Star } from 'lucide-react';
import { UPDATES_HISTORY, UPCOMING_UPDATE } from '../lib/updatesData';

export default function Updates() {
  const navigate = useNavigate();

  useEffect(() => {
    // SEO enhancements
    document.title = 'آخر التحديثات | مدونة اللعبة';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'تابع آخر التحديثات والإضافات للعبة. اكتشف الأطوار الجديدة، أقسام الأسئلة، والإصلاحات المستمرة لتجربة لعب مثالية.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'تابع آخر التحديثات والإضافات للعبة. اكتشف الأطوار الجديدة، أقسام الأسئلة، والإصلاحات المستمرة لتجربة لعب مثالية.';
      document.head.appendChild(meta);
    }
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'improvement': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'fix': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'content': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'feature': return 'ميزة جديدة';
      case 'improvement': return 'تحسين';
      case 'fix': return 'إصلاح';
      case 'content': return 'محتوى جديد';
      default: return 'تحديث';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] relative overflow-hidden" dir="rtl">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <header className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate('/')}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30">
                <Newspaper className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-3xl font-bold font-heading text-white">آخر التحديثات</h1>
               <p className="text-slate-400 mt-1 text-sm md:text-base">استكشف السجل الكامل لتطوير اللعبة وميزات القادمة</p>
             </div>
          </div>
        </header>

        {/* Upcoming Update Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute -left-12 -top-12 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
               <div className="shrink-0 flex justify-center">
                  <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/40 animate-pulse">
                     <Rocket className="w-10 h-10 text-white" />
                  </div>
               </div>
               <div className="flex-1 text-center md:text-right">
                 <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold mb-3">
                   التحديث القادم - {UPCOMING_UPDATE.version}
                 </div>
                 <h2 className="text-2xl font-bold font-heading text-white mb-3 flex items-center justify-center md:justify-start gap-2">
                    {UPCOMING_UPDATE.title}
                 </h2>
                 <p className="text-indigo-100/80 leading-relaxed mb-4 text-sm md:text-base">
                    {UPCOMING_UPDATE.description}
                 </p>
                 <ul className="grid sm:grid-cols-2 gap-3">
                   {UPCOMING_UPDATE.features.map((feature, i) => (
                     <li key={i} className="flex items-center gap-2 text-slate-300 text-sm bg-black/20 p-2.5 rounded-lg border border-white/5">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{feature}</span>
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        </section>

        {/* Updates History */}
        <section>
          <div className="flex items-center gap-3 mb-8">
             <Star className="w-6 h-6 text-amber-400" />
             <h2 className="text-xl font-bold font-heading text-white">سجل التحديثات السابق</h2>
          </div>

          <div className="space-y-6">
            {UPDATES_HISTORY.map((update, index) => (
               <article key={update.id} className="relative pl-4 md:pl-0">
                  {/* Timeline Line */}
                  {index !== UPDATES_HISTORY.length - 1 && (
                     <div className="absolute right-8 top-16 w-0.5 h-[calc(100%+1.5rem)] bg-slate-800 hidden md:block"></div>
                  )}

                  <div className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 relative z-10 md:mr-16">
                     {/* Timeline Dot/Icon (Desktop) */}
                     <div className="absolute -right-20 top-6 w-12 h-12 bg-slate-800 border-2 border-slate-700 rounded-full hidden md:flex items-center justify-center text-2xl shadow-lg z-20">
                       {update.icon}
                     </div>

                     <div className="flex justify-between items-start md:hidden mb-2">
                       <span className="text-3xl">{update.icon}</span>
                       <span className="text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
                          {update.date}
                       </span>
                     </div>

                     <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                           <h3 className="text-lg md:text-xl font-bold text-white font-heading">
                              {update.title}
                           </h3>
                           <div className="hidden md:flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
                                 {update.date}
                              </span>
                           </div>
                        </div>

                        <p className="text-slate-400 leading-relaxed text-sm md:text-base mb-4">
                           {update.description}
                        </p>

                        <div className="flex items-center gap-2">
                           <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getTypeStyle(update.type)}`}>
                             {getTypeName(update.type)}
                           </span>
                           <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-800">
                             تحديث {update.version}
                           </span>
                        </div>
                     </div>
                  </div>
               </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
