import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للصفحة الرئيسية</span>
        </Link>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">سياسة الخصوصية</h1>
            <p className="text-slate-400 mt-2">تاريخ آخر تحديث: {new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        <div className="space-y-12 bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-800/50 leading-loose text-lg">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">1. مقدمة</h2>
            <p className="text-slate-300">
              مرحباً بك في لعبة "تحدي المعرفة". نحن نأخذ خصوصيتك على محمل الجد، ونهدف من خلال هذه الوثيقة إلى توضيح كيفية تعاملنا مع بياناتك أثناء استخدامك للموقع واللعبة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">2. المعلومات التي نجمعها</h2>
            <p className="text-slate-300 mb-2">نقوم بجمع المعلومات التالية لتحسين تجربتك:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>الأسماء المستعارة:</strong> الاسم الذي تختاره للعب داخل الغرف (لا يتطلب هوية حقيقية).</li>
              <li><strong>بيانات اللعب:</strong> النقاط، الإجابات، والنتائج بهدف إدارة التحدي بين اللاعبين وعرض لوحة الصدارة.</li>
              <li><strong>البيانات التقنية:</strong> مثل نوع المتصفح والجهاز، ومزود خدمة الإنترنت (ISP)، للمساعدة في تحسين أداء الموقع وحل المشاكل التقنية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">3. الإعلانات (Google AdSense)</h2>
            <p className="text-slate-300 mb-3">
              نحن نستخدم خدمة Google AdSense لعرض الإعلانات على موقعنا. قد تقوم جوجل أو شركاؤها باستخدام ملفات تعريف الارتباط (Cookies) لتقديم إعلانات مخصصة بناءً على زياراتك السابقة لهذا الموقع أو لمواقع أخرى على الإنترنت.
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>يستخدم Google ملفات تعريف ارتباط (Cookies) الإعلانات لتمكينه وشركائه من عرض الإعلانات للمستخدمين بناءً على زياراتهم.</li>
              <li>يمكنك تعطيل استخدام ملفات تعريف الارتباط المخصصة للإعلانات من خلال زيارة التفضيلات الإعلانية الخاصة بحسابك في गूगल (Google Ads Settings).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">4. مشاركة البيانات</h2>
            <p className="text-slate-300">
              نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحدود اللازمة لتشغيل الموقع (مثل مزودي خدمات الاستضافة وتوصيل المحتوى السحابي)، أو للامتثال للقوانين المعمول بها.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">5. حماية البيانات</h2>
            <p className="text-slate-300">
              نتخذ إجراءات أمنية لحماية بياناتك من الوصول غير المصرح به أو التعديل أو التدمير. بالرغم من ذلك، تذكر أنه لا توجد وسيلة نقل عبر الإنترنت أو وسيلة تخزين إلكترونية آمنة بنسبة 100%.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">6. التغييرات على سياسة الخصوصية</h2>
            <p className="text-slate-300">
              قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بنشر أي تغييرات على هذه الصفحة، لذا ننصحك بمراجعتها بشكل دوري. استمرارك في استخدام الموقع بعد التعديلات يعني موافقتك عليها.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2">7. اتصل بنا</h2>
            <p className="text-slate-300">
              إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك التواصل معنا عبر البريد الإلكتروني للموقع.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
