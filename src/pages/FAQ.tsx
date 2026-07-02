import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircleQuestion, ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "عام",
      q: 'هل اللعبة مجانية؟',
      a: 'نعم، تحدي المعرفة مجانية تماماً. يمكنك اللعب، إنشاء الغرف، والتنافس مع أصدقائك بدون أي رسوم. نحن نعتمد على الإعلانات لتغطية تكاليف الخوادم والتطوير.'
    },
    {
      category: "عام",
      q: 'هل تحتاج إلى حساب للعب؟',
      a: 'يمكنك تجربة بعض الأطوار الفردية كزائر بدون حساب، ولكن لكي يتم حفظ تقدمك، مستواك، الإنجازات التي تحققها، والقدرة على اللعب أونلاين مع الآخرين، يجب عليك إنشاء حساب.'
    },
    {
      category: "عام",
      q: 'هل تعمل اللعبة على الهاتف؟ وهل أحتاج لتحميل تطبيق؟',
      a: 'تحدي المعرفة هي منصة ويب (Web App) تعمل مباشرة من المتصفح دون الحاجة لتحميل أي تطبيق. وهي مصممة لتكون متوافقة تماماً (Responsive) وتعمل بسلاسة على جميع الهواتف، الأجهزة اللوحية، وأجهزة الكمبيوتر.'
    },
    {
      category: "اللعب الجماعي",
      q: 'كيف يعمل اللعب الجماعي؟',
      a: 'اللعب الجماعي هو أساس اللعبة. يمكنك إنشاء "غرف خاصة" ومشاركة رابطها مع أصدقائك للدخول معاً، أو الانضمام للغرف العامة للعب والتنافس مع لاعبين من مختلف أنحاء العالم بشكل مباشر (Real-time).'
    },
    {
      category: "الذكاء الاصطناعي",
      q: 'كيف يعمل الذكاء الاصطناعي في اللعبة؟',
      a: 'نستخدم تقنيات الذكاء الاصطناعي لتوليد أسئلة متنوعة ومتجددة باستمرار لتجنب التكرار. بالإضافة إلى وجود شخصيات ذكاء اصطناعي يمكنك التحدث معها أو اللعب ضدها في الأطوار الفردية، و"مرشد ذكي" لمساعدتك في فهم قواعد اللعبة.'
    },
    {
      category: "التقدم والحساب",
      q: 'كيف أرفع مستواي وكيف أجمع الـ XP؟',
      a: 'من خلال اللعب والإجابة الصحيحة والسريعة على الأسئلة تكسب نقاط خبرة (XP). الفوز بالمباريات الجماعية ضد لاعبين آخرين يمنحك أكبر قدر من النقاط، مما يساعدك على رفع مستواك وتصدر الترتيب العالمي.'
    },
    {
      category: "التقدم والحساب",
      q: 'كيف يعمل نظام لوحة المتصدرين (Leaderboard)؟',
      a: 'لوحة المتصدرين تعرض أفضل اللاعبين بناءً على مجموع نقاط الخبرة (XP) التي جمعوها. يتم تحديث اللوحة بشكل دوري لتحفيز المنافسة المستمرة بين اللاعبين.'
    },
    {
      category: "الأمان والخصوصية",
      q: 'هل يوجد حفظ للإحصائيات وبياناتي؟',
      a: 'نعم، يتم حفظ جميع إحصائياتك بأمان في قاعدة البيانات السحابية، ويشمل ذلك نسبة الفوز، عدد المباريات، الإنجازات، والأرقام القياسية. لمعرفة المزيد، يمكنك مراجعة "سياسة الخصوصية".'
    },
    {
      category: "الأمان والخصوصية",
      q: 'كيف يمكنني الإبلاغ عن لاعب مسيء أو مشكلة في المحتوى؟',
      a: 'إذا واجهت لاعباً يستخدم ألفاظاً غير لائقة، أو وجدت سؤالاً يحتوي على معلومات خاطئة، يرجى التواصل معنا فوراً عبر صفحة "اتصل بنا" مع تزويدنا بالتفاصيل، وسيقوم فريقنا باتخاذ الإجراء اللازم.'
    },
    {
      category: "التقدم والحساب",
      q: 'كيف أغير اسمي أو صورتي؟ وهل يمكنني حذف حسابي؟',
      a: 'يمكنك تغيير اسمك وصورتك من خلال الدخول إلى "الملف الشخصي" والضغط على أيقونة التعديل. وإذا رغبت في حذف حسابك وبياناتك نهائياً، يمكنك مراسلتنا من البريد المسجل به الحساب لإجراء ذلك.'
    },
    {
      category: "عام",
      q: 'هل يمكنني اللعب بدون اتصال بالإنترنت (Offline)؟',
      a: 'تحدي المعرفة تتطلب اتصالاً بالإنترنت للوصول إلى قاعدة الأسئلة المتجددة، حفظ التقدم، ومزامنة اللعب الجماعي مع الخوادم.'
    },
    {
      category: "المستقبل",
      q: 'هل ستضيفون ميزات مثل نظام العشائر (Clans) أو أطوار جديدة؟',
      a: 'نعم! نحن نعمل باستمرار على تطوير المنصة، وهناك خطط قريبة لإضافة نظام الأصدقاء، نظام العشائر (Clans)، وأطوار لعب مبتكرة تعتمد على الذكاء الاصطناعي.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" dir="rtl">
      {/* Hero */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-fuchsia-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)] mb-8"
          >
            <MessageCircleQuestion className="w-12 h-12 text-purple-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-l from-purple-400 to-fuchsia-400 text-transparent bg-clip-text font-heading"
          >
            الأسئلة الشائعة
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            كل ما تحتاج لمعرفته حول منصة تحدي المعرفة. إجابات سريعة وواضحة على أكثر الأسئلة شيوعاً.
          </motion.p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors"
            >
              <button
                className="w-full px-6 py-5 text-right flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full w-fit">
                    {faq.category}
                  </span>
                  <span className="text-lg font-bold text-slate-200">{faq.q}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50 mt-2 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 mt-20 text-center relative z-10">
        <p className="text-slate-400 mb-6">لم تجد إجابة لسؤالك؟</p>
        <button
          onClick={() => navigate('/contact')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-3 mx-auto"
        >
          تواصل معنا <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
