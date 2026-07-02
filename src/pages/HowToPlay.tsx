import React from 'react';
import { motion } from 'motion/react';
import { PlayCircle, UserPlus, LogIn, Swords, Users, Globe, TrendingUp, Sparkles, Brain, Compass, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowToPlay() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "البداية والحسابات",
      steps: [
        {
          icon: <UserPlus className="w-8 h-8 text-blue-400" />,
          title: 'إنشاء الحساب',
          desc: 'اضغط على زر "التسجيل" في الصفحة الرئيسية. أدخل بريدك الإلكتروني وكلمة مرور قوية، ثم قم بتأكيد بريدك الإلكتروني لفتح جميع ميزات اللعبة وحفظ تقدمك في السحابة بأمان.',
          color: 'blue'
        },
        {
          icon: <LogIn className="w-8 h-8 text-emerald-400" />,
          title: 'تسجيل الدخول',
          desc: 'بعد تأكيد الحساب، قم بتسجيل الدخول لبدء حفظ تقدمك ومستواك والنقاط التي تجمعها في كل جولة. تسجيل الدخول يتيح لك الوصول للملف الشخصي وتعديل بياناتك.',
          color: 'emerald'
        }
      ]
    },
    {
      title: "اللعب الجماعي والغرف",
      steps: [
        {
          icon: <Users className="w-8 h-8 text-fuchsia-400" />,
          title: 'إنشاء الغرف الخاصة',
          desc: 'من قائمة "الغرف"، اختر إنشاء غرفة جديدة. يمكنك تحديد طور اللعب، ونسخ رابط الغرفة الفريد وإرساله لأصدقائك عبر الواتساب أو غيره للانضمام إليك فوراً.',
          color: 'fuchsia'
        },
        {
          icon: <Globe className="w-8 h-8 text-indigo-400" />,
          title: 'الانضمام للغرف العامة',
          desc: 'إذا كنت تفضل اللعب مع أشخاص جدد، يمكنك استعراض قائمة الغرف العامة المتاحة والانضمام لأي غرفة لم تكتمل بعد، لتبدأ التحدي مع لاعبين من مختلف الدول.',
          color: 'indigo'
        },
        {
          icon: <PlayCircle className="w-8 h-8 text-amber-400" />,
          title: 'ميكانيكية اللعب',
          desc: 'عند بدء الجولة، سيظهر السؤال لجميع اللاعبين في نفس الوقت. يجب عليك قراءة السؤال واختيار الإجابة الصحيحة بأسرع وقت ممكن، لأن السرعة تمنحك نقاطاً أعلى!',
          color: 'amber'
        }
      ]
    },
    {
      title: "التقدم والمكافآت",
      steps: [
        {
          icon: <TrendingUp className="w-8 h-8 text-rose-400" />,
          title: 'كسب XP ورفع المستوى',
          desc: 'كل إجابة صحيحة تمنحك نقاط خبرة (XP). الفوز بالمركز الأول يمنحك مضاعفاً لهذه النقاط. عندما تمتلئ شريط الخبرة، سترتقي للمستوى التالي وتحصل على إنجازات مرئية.',
          color: 'rose'
        },
        {
          icon: <Swords className="w-8 h-8 text-yellow-400" />,
          title: 'لوحة المتصدرين',
          desc: 'تنافس للوصول إلى قمة لوحة المتصدرين (Leaderboard). يتم ترتيب اللاعبين بناءً على مجموع نقاطهم التراكمي، مما يضمن أن الأكثر نشاطاً وخبرة سيكونون في المقدمة.',
          color: 'yellow'
        }
      ]
    },
    {
      title: "ميزات الذكاء الاصطناعي",
      steps: [
        {
          icon: <Brain className="w-8 h-8 text-cyan-400" />,
          title: 'اللعب ضد الذكاء الاصطناعي',
          desc: 'في قسم الأطوار الفردية، يمكنك تحدي شخصيات (Bots) مدعومة بالذكاء الاصطناعي ذات مستويات صعوبة متفاوتة، لتتدرب قبل مواجهة اللاعبين الحقيقيين.',
          color: 'cyan'
        },
        {
          icon: <Compass className="w-8 h-8 text-violet-400" />,
          title: 'استخدام المرشد الذكي',
          desc: 'في حال واجهت سؤالاً صعباً جداً في بعض الأطوار الفردية، يمكنك الاستعانة بالمرشد الذكي للحصول على تلميح أو حذف إجابتين خاطئتين، لكن هذا سيقلل من النقاط المكتسبة.',
          color: 'violet'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" dir="rtl">
      {/* Hero */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-900 to-blue-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.2)] mb-8"
          >
            <Sparkles className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-l from-emerald-400 to-blue-400 text-transparent bg-clip-text font-heading"
          >
            الدليل الشامل: كيفية اللعب
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            خطوة بخطوة، تعلم كيف تستفيد من جميع مميزات المنصة وتتصدر قوائم الترتيب.
          </motion.p>
        </div>
      </div>

      {/* Structured Guide */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-24">
        
        {/* Visual Header Graphic */}
        <div className="w-full max-w-4xl mx-auto bg-slate-900/40 rounded-3xl border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10 md:w-1/2 space-y-4 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold font-heading text-slate-200">الواجهة الرئيسية</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              تم تصميم الواجهة لتكون سهلة الاستخدام ومريحة للعين. من شريط التنقل العلوي يمكنك الوصول بسرعة للغرف، لوحة المتصدرين، والملف الشخصي.
            </p>
          </div>
          <div className="relative z-10 w-full md:w-1/3">
             {/* Abstract UI representation SVG */}
            <svg viewBox="0 0 200 150" className="w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
               <rect x="10" y="10" width="180" height="130" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="2"/>
               <rect x="20" y="20" width="160" height="20" rx="4" fill="#1e293b"/>
               <circle cx="165" cy="30" r="5" fill="#3b82f6"/>
               <circle cx="145" cy="30" r="5" fill="#10b981"/>
               <rect x="20" y="55" width="75" height="70" rx="6" fill="#1e293b"/>
               <rect x="105" y="55" width="75" height="30" rx="6" fill="#1e293b"/>
               <rect x="105" y="95" width="75" height="30" rx="6" fill="#1e293b"/>
            </svg>
          </div>
        </div>

        {sections.map((section, secIdx) => (
          <div key={secIdx} className="space-y-8">
            <h2 className="text-3xl font-black text-white border-r-4 border-emerald-500 pr-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 hover:bg-slate-800/80 transition-all group relative overflow-hidden h-full flex flex-col"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${step.color}-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-${step.color}-500/20 transition-all`}></div>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className={`p-4 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-${step.color}-500/50 shadow-inner transition-colors`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 relative z-10 text-slate-200 group-hover:text-white transition-colors">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed relative z-10 text-lg flex-grow">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 mt-24 text-center relative z-10">
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(5,150,105,0.4)] transition-all active:scale-95 flex items-center gap-3 mx-auto"
        >
          ابدأ اللعب الآن <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
