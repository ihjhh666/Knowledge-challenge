import React from 'react';
import { ArrowRight, Book } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للصفحة الرئيسية</span>
        </Link>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
            <Book className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">شروط الاستخدام</h1>
            <p className="text-slate-400 mt-2">تاريخ آخر تحديث: {new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        <div className="space-y-12 bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-800/50 leading-loose text-lg text-slate-300">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">1. القبول بالشروط</h2>
            <p>
              باستخدامك لموقع "تحدي المعرفة"، فإنك توافق على الالتزام بشروط الاستخدام هذه وكافة القوانين واللوائح المعمول بها. إذا كنت غير موافق على جزء من هذه الشروط، يرجى التوقف عن استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">2. استخدام المنصة</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>الموقع مخصص للعب والتسلية وإثراء المعرفة فقط.</li>
              <li>يمنع استخدام الموقع في أي غرض غير قانوني أو ضار.</li>
              <li>يجب احترام اللاعبين الآخرين وتجنب أي لغة مسيئة في المحادثات أو الأسماء المستعارة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">3. الإعلانات والروابط الخارجية</h2>
            <p>
              يحتوي الموقع على إعلانات مقدمة من أطراف ثالثة (مثل Google AdSense). نحن غير مسؤولين عن محتوى الإعلانات أو المواقع التي توجه إليها هذه الإعلانات.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">4. حقوق الملكية</h2>
            <p>
              جميع حقوق الملكية الفكرية لتصميم الموقع وكود البرمجة محفوظة لفريق تطوير تحدي المعرفة. يمنع نسخ أو إعادة إنتاج أي جزء من الموقع بدون إذن مسبق.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">5. إخلاء المسؤولية</h2>
            <p>
              يتم توفير الموقع "كما هو" بدون أي ضمانات. نحن لا نضمن أن الخدمة ستكون خالية من الأخطاء أو التوقفات. لن نكون مسؤولين عن أي أضرار قد تنشأ عن استخدامك للمنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">6. التعديلات</h2>
            <p>
              يحتفظ فريق الموقع بالحق في تعديل هذه الشروط في أي وقت. سنقوم بتحديث تاريخ التعديل أعلى هذه الصفحة، ويعتبر استخدامك المستمر للمنصة موافقة منك على الشروط الجديدة.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
