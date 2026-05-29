import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للصفحة الرئيسية</span>
        </Link>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
            <Info className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">من نحن</h1>
          </div>
        </div>

        <div className="space-y-12 bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-800/50 leading-loose text-lg text-slate-300">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">مرحباً بك في تحدي المعرفة</h2>
            <p className="mb-4">
              تحدي المعرفة هي منصة ألعاب تفاعلية عربية تهدف إلى إثراء المحتوى المعرفي بطريقة ممتعة وتنافسية، حيث يمكن للأصدقاء التجمع في غرف افتراضية واختبار معلوماتهم العامة.
            </p>
            <p>
              بدأنا هذا المشروع بشغف تقديم تجربة ترفيهية وتعليمية خفيفة تناسب كافة الأعمار، وتسلط الضوء على المعرفة العامة بطريقة لا تخلو من روح الحماس والتحدي.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">رؤيتنا</h2>
            <p>
              نسعى لأن نكون الوجهة الأولى للألعاب المعرفية على مستوى العالم العربي، وتوفير بيئة نظيفة وآمنة ومسلية تشجع المستخدين على التعلم واكتشاف ما هو جديد بشكل يومي.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">فريقنا</h2>
            <p>
              يدار الموقع من قبل شغوفين بالتقنية وصناعة الألعاب. نعمل باستمرار على تطوير المنصة وإضافة أسئلة جديدة وتوسيع نطاق التحديات المتاحة لنضمن لكم وقتاً ممتعاً.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
