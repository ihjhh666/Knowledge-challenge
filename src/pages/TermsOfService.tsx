import React from 'react';
import { ArrowRight, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24" dir="rtl">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/20 via-slate-900 to-orange-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-3xl border border-rose-500/20 shadow-[0_0_30px_rgba(225,29,72,0.2)] mb-8"
          >
            <Book className="w-12 h-12 text-rose-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-l from-rose-400 to-orange-400 text-transparent bg-clip-text font-heading"
          >
            شروط الاستخدام
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
        
        <div className="space-y-12 bg-slate-900/60 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-800 leading-relaxed text-lg text-slate-300">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">1</span>
              قبول الشروط
            </h2>
            <p>
              باستخدامك لمنصة "تحدي المعرفة" (سواء كزائر أو كلاعب مسجل)، فإنك تقر بقراءتك وفهمك وموافقتك الكاملة على الالتزام بشروط الاستخدام هذه، بالإضافة إلى كافة القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك التوقف فوراً عن استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">2</span>
              إنشاء الحسابات والأمان
            </h2>
            <ul className="list-disc list-inside space-y-3">
              <li>أنت مسؤول بالكامل عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك.</li>
              <li>يُحظر إنشاء حسابات متعددة بغرض التلاعب بنظام النقاط، أو الانضمام للغرف لإفساد تجربة اللاعبين الآخرين.</li>
              <li>يجب أن تكون المعلومات التي تقدمها عند التسجيل دقيقة (مثل البريد الإلكتروني لاستعادة الحساب).</li>
              <li>يحق لإدارة الموقع إيقاف أو حظر أي حساب يتبين أنه يخالف هذه الشروط دون سابق إنذار.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">3</span>
              قواعد السلوك واللعب النظيف
            </h2>
            <p className="mb-3">تم إنشاء "تحدي المعرفة" لتوفير بيئة تنافسية ثقافية صحية. بناءً على ذلك، يُمنع منعاً باتاً:</p>
            <ul className="list-disc list-inside space-y-3">
              <li>استخدام أسماء مستعارة مسيئة، خادشة للحياء، أو تحمل طابعاً عنصرياً أو سياسياً متطرفاً.</li>
              <li>التلفظ بألفاظ نابية أو الإساءة للاعبين الآخرين داخل غرف اللعب المشتركة.</li>
              <li>استخدام أي برمجيات خارجية (Bots) أو ثغرات تقنية بهدف الغش وتعديل النقاط (XP) أو الأرصدة.</li>
              <li>محاولة الهندسة العكسية للموقع أو شن هجمات حجب الخدمة (DDoS).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">4</span>
              المحتوى وحقوق الملكية
            </h2>
            <p className="mb-3">
              جميع حقوق الملكية الفكرية المرتبطة بتصميم الموقع، الشعار، الأكواد البرمجية، واجهة المستخدم، وقاعدة بيانات الأسئلة هي ملكية حصرية لفريق تطوير "تحدي المعرفة".
            </p>
            <ul className="list-disc list-inside space-y-3">
              <li>لا يُسمح بنسخ، تعديل، أو إعادة نشر أي جزء من الموقع التجاري دون إذن كتابي مسبق.</li>
              <li>الأسئلة التي يساهم بها المستخدمون (إن وجدت مستقبلاً) تمنح المنصة حق استخدامها وتعديلها مجاناً.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">5</span>
              الإعلانات والروابط الخارجية
            </h2>
            <p>
              قد يحتوي الموقع على إعلانات مدعومة من جهات خارجية (مثل Google AdSense) وروابط لمواقع أخرى. نحن لا نتحكم في محتوى تلك المواقع ولا نتحمل أي مسؤولية عن محتواها، أو سياسات الخصوصية الخاصة بها، أو أي خسارة قد تنجم عن استخدامك لها. تفاعلك مع هذه الإعلانات يكون على مسؤوليتك الشخصية.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">6</span>
              إخلاء المسؤولية
            </h2>
            <p>
              يتم توفير خدمات المنصة "كما هي" وبحالتها الراهنة، دون أي ضمانات صريحة أو ضمنية. نحن لا نضمن أن الخدمة ستكون مستمرة دون انقطاع، أو خالية من الأخطاء التقنية، أو أن جميع الأسئلة المطروحة دقيقة بنسبة 100%. لن تكون المنصة أو مطوروها مسؤولين عن أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدام الخدمة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">7</span>
              التعديلات على الشروط
            </h2>
            <p>
              يحتفظ فريق التطوير بالحق الكامل في تعديل، تحديث، أو تغيير شروط الاستخدام في أي وقت يراه مناسباً. تسري التعديلات فور نشرها على هذه الصفحة. استمرارك في استخدام الموقع بعد نشر التعديلات يمثل موافقة صريحة منك عليها.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
