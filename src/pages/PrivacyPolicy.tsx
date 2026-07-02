import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SEO } from '../components/SEO';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24" dir="rtl">
      <SEO 
        title="سياسة الخصوصية" 
        description="تعرف على سياسة الخصوصية لمنصة تحدي المعرفة وكيفية حمايتنا لبياناتك ومعلوماتك الشخصية."
        url="/privacy"
      />
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-slate-900 to-emerald-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-teal-500/10 rounded-3xl border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.2)] mb-8"
          >
            <ShieldCheck className="w-12 h-12 text-teal-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-l from-teal-400 to-emerald-400 text-transparent bg-clip-text font-heading"
          >
            سياسة الخصوصية
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            تاريخ آخر تحديث: {new Date().toISOString().split('T')[0]}
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-full hover:bg-slate-800">
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium">العودة للصفحة الرئيسية</span>
        </Link>
        
        <div className="space-y-12 bg-slate-900/60 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-800 leading-relaxed text-lg">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">1</span>
              مقدمة
            </h2>
            <p className="text-slate-300">
              مرحباً بك في منصة "تحدي المعرفة". نحن نأخذ خصوصيتك على محمل الجد، ونلتزم بحماية بياناتك الشخصية. تهدف وثيقة سياسة الخصوصية هذه إلى توضيح كيفية جمعنا، استخدامنا، وحمايتنا لبياناتك أثناء استخدامك للموقع والتفاعل مع أطوار اللعبة المختلفة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">2</span>
              المعلومات التي نجمعها
            </h2>
            <p className="text-slate-300 mb-4">نقوم بجمع نوعين من المعلومات لضمان تقديم تجربة لعب مميزة ومستقرة:</p>
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-white font-bold mb-2">أ. معلومات تزودنا بها مباشرة:</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li><strong>بيانات الحساب:</strong> البريد الإلكتروني وكلمة المرور (مشفرة) عند التسجيل.</li>
                  <li><strong>الملف الشخصي:</strong> الاسم المستعار الذي تختاره للعب والصورة الرمزية.</li>
                  <li><strong>المراسلات:</strong> أي رسائل أو استفسارات ترسلها لنا عبر نموذج الاتصال.</li>
                </ul>
              </div>
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-white font-bold mb-2">ب. معلومات تُجمع تلقائياً:</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li><strong>بيانات اللعب:</strong> النقاط (XP)، الإحصائيات، تقدمك في المستويات، وتاريخ المباريات.</li>
                  <li><strong>البيانات التقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل، ومعلومات الجهاز المستخدم لضمان التوافقية وإصلاح الأخطاء.</li>
                  <li><strong>بيانات الاستخدام:</strong> تفاعلك مع واجهة المستخدم والصفحات التي تزورها لتحسين تجربة المستخدم.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">3</span>
              كيف نستخدم معلوماتك؟
            </h2>
            <p className="text-slate-300 mb-3">نستخدم البيانات التي نجمعها للأغراض التالية:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>إنشاء وإدارة حسابك وتوفير وصول آمن للمنصة.</li>
              <li>تشغيل أطوار اللعب الجماعي وتحديث قوائم المتصدرين في الوقت الفعلي.</li>
              <li>تحسين خوارزميات الذكاء الاصطناعي وتقديم تجربة لعب مخصصة.</li>
              <li>تحليل أداء الموقع وإصلاح المشاكل التقنية.</li>
              <li>التواصل معك للرد على استفساراتك أو إعلامك بالتحديثات الهامة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">4</span>
              الإعلانات (Google AdSense) وملفات تعريف الارتباط (Cookies)
            </h2>
            <p className="text-slate-300 mb-3">
              لدعم مجانية المنصة، نستخدم خدمات إعلانية مثل Google AdSense، والتي تستخدم ملفات تعريف الارتباط (Cookies):
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-3">
              <li>يستخدم محرّكو البحث وجهات خارجية مثل Google ملفات تعريف الارتباط لعرض إعلانات ذات صلة بناءً على زياراتك السابقة لموقعنا أو مواقع أخرى.</li>
              <li>تتيح ملفات تعريف ارتباط الإعلانات لشركة Google وشركائها عرض إعلانات مخصصة لك.</li>
              <li>يمكنك في أي وقت إيقاف استخدام ملفات تعريف الارتباط للإعلانات المخصصة عبر زيارة <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">إعدادات الإعلانات (Google Ad Settings)</a>.</li>
              <li>نحن نستخدم أيضاً ملفات تعريف ارتباط أساسية ضرورية لعمل الموقع (مثل حفظ حالة تسجيل الدخول).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">5</span>
              مشاركة البيانات مع أطراف ثالثة
            </h2>
            <p className="text-slate-300">
              نحن نلتزم بعدم بيع أو تأجير بياناتك الشخصية. لا تتم مشاركة بياناتك إلا مع:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li><strong>مزودي الخدمات:</strong> مثل خدمات الاستضافة (Cloud Providers) وقواعد البيانات (Firebase/Supabase) التي تساعدنا في تشغيل الموقع.</li>
              <li><strong>الامتثال للقانون:</strong> إذا طُلب منا ذلك بموجب إجراء قانوني أو استجابة لطلب رسمي من جهة حكومية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">6</span>
              حماية البيانات والأمان
            </h2>
            <p className="text-slate-300">
              نحن نستخدم بروتوكولات تشفير وتدابير أمنية متقدمة لحماية بياناتك من الوصول غير المصرح به. على الرغم من ذلك، لا يمكن ضمان أمان أي نقل للبيانات عبر الإنترنت بنسبة 100%. مسؤولية الحفاظ على سرية كلمة المرور الخاصة بك تقع على عاتقك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">7</span>
              حقوق المستخدم
            </h2>
            <p className="text-slate-300">
              يحق لك في أي وقت:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
              <li>الوصول إلى بياناتك الشخصية وتعديلها عبر صفحة الملف الشخصي.</li>
              <li>طلب حذف حسابك وكافة البيانات المرتبطة به بشكل نهائي.</li>
              <li>سحب موافقتك على استخدام بعض البيانات (قد يؤثر ذلك على قدرتك على استخدام بعض ميزات اللعبة).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm">8</span>
              اتصل بنا
            </h2>
            <p className="text-slate-300">
              إذا كان لديك أي أسئلة، استفسارات، أو مخاوف بشأن سياسة الخصوصية هذه أو كيفية تعاملنا مع بياناتك، يرجى التواصل معنا عبر <Link to="/contact" className="text-teal-400 hover:underline">صفحة اتصل بنا</Link> أو عبر البريد الإلكتروني: <span dir="ltr" className="font-mono text-slate-400">almhbwbswfy342@gmail.com</span>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
