import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Gamepad2, Users, Target, ShieldAlert, Award, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameGuide() {
  const navigate = useNavigate();

  const modes = [
    {
      id: 'knowledge',
      title: 'تحدي المعرفة الأساسي',
      icon: <Gamepad2 className="w-8 h-8 text-indigo-400" />,
      color: 'indigo',
      goal: 'الإجابة على أكبر عدد من الأسئلة في مجالات متعددة لجمع النقاط والفوز.',
      description: 'الطور الكلاسيكي والأكثر شهرة في المنصة. يعتمد على سرعة البديهة وحصيلة المعلومات العامة لديك. الأسئلة تظهر لجميع اللاعبين في نفس الوقت، ومن يجيب أسرع يحصل على نقاط أكثر.',
      howToPlay: 'اختر الإجابة الصحيحة من بين 4 خيارات قبل انتهاء الوقت. إذا لم تختر إجابة سيتم اعتبارها خاطئة.',
      winCondition: 'الوصول إلى النقاط المحددة قبل الخصم أو إنهاء الوقت وأنت في المركز الأول.',
      players: '2 - 4 لاعبين',
      difficulty: 'متوسط',
      tips: 'ركز على السرعة! الإجابة السريعة تمنحك نقاطاً مضاعفة قد تقلب موازين المباراة في الثواني الأخيرة.',
      mistakes: 'التسرع في الإجابة دون قراءة الخيارات كاملة، مما يؤدي لاختيار إجابة تبدو صحيحة ولكنها غير دقيقة.',
      strategy: 'حاول الحفاظ على هدوئك. إذا لم تكن متأكداً من الإجابة، قم باستبعاد الخيارات الخاطئة الواضحة ثم خمن من الباقي.',
      features: ['تنوع هائل في الأسئلة', 'مكافآت يومية', 'دعم الذكاء الاصطناعي'],
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10 10" className="text-indigo-500/30 animate-[spin_20s_linear_infinite]" />
          <path d="M100 40 L160 160 L40 160 Z" fill="none" stroke="currentColor" strokeWidth="4" className="text-indigo-400" />
          <circle cx="100" cy="110" r="30" fill="currentColor" className="text-indigo-500/50" />
        </svg>
      )
    },
    {
      id: 'survival',
      title: 'طور البقاء (Survival)',
      icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
      color: 'red',
      goal: 'البقاء لآخر جولة دون فقدان جميع المحاولات (القلوب).',
      description: 'طور قاسي لا يرحم الأخطاء. كل لاعب يبدأ بعدد محدود من الأرواح. كل إجابة خاطئة تفقدك روحاً. آخر لاعب يصمد هو الفائز.',
      howToPlay: 'أجب بشكل صحيح لتجنب الإقصاء. الأسئلة تزداد صعوبة تدريجياً مع تقدم الجولات.',
      winCondition: 'أن تكون آخر لاعب متبقي أو الصمود حتى الجولة النهائية (إن وجدت).',
      players: 'حتى 10 لاعبين',
      difficulty: 'صعب جداً',
      tips: 'استخدم وسائل المساعدة بحذر، لا تضيعها في الجولات الأولى السهلة. احتفظ بها للجولات الحاسمة.',
      mistakes: 'استخدام المرشد الذكي في أسئلة سهلة، فتجد نفسك بدون مساعدة في المراحل المتقدمة الصعبة.',
      strategy: 'العب بحذر. في هذا الطور الدقة أهم من السرعة. خذ وقتك كاملاً لقراءة السؤال طالما أنك ضمن الوقت المسموح.',
      features: ['أدرينالين عالي', 'عقوبات صارمة', 'مكافآت ضخمة للفائز'],
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]">
          <polygon points="100,20 180,180 20,180" fill="none" stroke="currentColor" strokeWidth="4" className="text-red-500/30 animate-pulse" />
          <circle cx="100" cy="120" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-red-400" />
          <path d="M80 120 L120 120 M100 100 L100 140" stroke="currentColor" strokeWidth="4" className="text-red-300" />
        </svg>
      )
    },
    {
      id: 'jump',
      title: 'القفزة الأخيرة (Jump Solo)',
      icon: <Target className="w-8 h-8 text-fuchsia-400" />,
      color: 'fuchsia',
      goal: 'القفز فوق الذراع الدوارة وتجنب الاصطدام بها لأطول فترة ممكنة.',
      description: 'لعبة مصغرة مدمجة لكسر الروتين! تعتمد بالكامل على رد الفعل (Reflexes) وتوقيت القفز. لا أسئلة هنا، فقط المهارة وسرعة الاستجابة.',
      howToPlay: 'اضغط على زر القفز (أو المس الشاشة) لتفادي الذراع الدوارة. الذراع تزيد سرعتها وتغير اتجاهها فجأة.',
      winCondition: 'لا يوجد فوز نهائي، الهدف هو البقاء أطول فترة وتسجيل أعلى رقم قياسي في السيرفر.',
      players: 'لاعب واحد (طور فردي)',
      difficulty: 'تزداد صعوبة مع الوقت',
      tips: 'راقب سرعة الذراع وحافظ على هدوئك. ركز نظرك على نقطة المنتصف لتتوقع حركة الذراع.',
      mistakes: 'القفز المبكر أو القفز المتتالي بدون توقيت، مما يجعلك تهبط مباشرة على الذراع.',
      strategy: 'حاول الدخول في "حالة التدفق" (Flow State). استمع لإيقاع حركة الذراع واجعل قفزاتك متناغمة معها.',
      features: ['فيزياء واقعية', 'منظور 2.5D', 'منافسة أرقام قياسية'],
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(192,38,211,0.5)]">
          <ellipse cx="100" cy="100" rx="80" ry="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-fuchsia-500/30" />
          <line x1="100" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-fuchsia-400 origin-[100px_100px] animate-[spin_3s_linear_infinite]" />
          <circle cx="100" cy="60" r="15" fill="currentColor" className="text-fuchsia-300 animate-bounce" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" dir="rtl">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-purple-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)] mb-8"
          >
            <BookOpen className="w-12 h-12 text-indigo-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-l from-indigo-400 via-purple-400 to-fuchsia-400 text-transparent bg-clip-text font-heading"
          >
            دليل الأطوار الشامل
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            اكتشف جميع أطوار اللعب المتاحة في تحدي المعرفة. تعرف على القواعد، الأهداف، وأفضل الاستراتيجيات لتحقيق الفوز.
          </motion.p>
        </div>
      </div>

      {/* Modes List */}
      <div className="max-w-5xl mx-auto px-6 space-y-24 relative z-10">
        {modes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
            {/* SVG Visual */}
            <div className={`col-span-1 md:col-span-5 h-[300px] bg-slate-900/50 rounded-3xl border border-slate-800 p-8 relative overflow-hidden flex items-center justify-center ${index % 2 === 1 ? 'md:order-last' : ''}`}>
              <div className={`absolute inset-0 bg-${mode.color}-500/5 blur-3xl`}></div>
              <div className="relative z-10 w-full h-full max-w-[200px] max-h-[200px]">
                {mode.svg}
              </div>
            </div>

            {/* Content */}
            <div className="col-span-1 md:col-span-7 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 bg-${mode.color}-500/10 rounded-xl border border-${mode.color}-500/20`}>
                  {mode.icon}
                </div>
                <h2 className="text-3xl font-bold font-heading">{mode.title}</h2>
              </div>
              
              <p className="text-slate-200 text-xl font-medium">{mode.goal}</p>
              <p className="text-slate-400 leading-relaxed">{mode.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-sm block mb-1">طريقة اللعب</span>
                  <span className="text-slate-200 font-medium">{mode.howToPlay}</span>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-sm block mb-1">شرط الفوز</span>
                  <span className="text-slate-200 font-medium">{mode.winCondition}</span>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-slate-500 text-sm block">عدد اللاعبين</span>
                    <span className="text-slate-200 font-medium">{mode.players}</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-slate-500 text-sm block">الصعوبة</span>
                    <span className="text-slate-200 font-medium">{mode.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`bg-${mode.color}-900/10 border border-${mode.color}-500/20 p-5 rounded-2xl relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-2 h-full bg-${mode.color}-500`}></div>
                  <h4 className={`font-bold text-${mode.color}-300 mb-2 flex items-center gap-2`}>
                    <Award className="w-5 h-5" />
                    نصيحة للمحترفين
                  </h4>
                  <p className={`text-${mode.color}-100/70 text-sm leading-relaxed`}>{mode.tips}</p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl">
                  <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    أخطاء شائعة
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{mode.mistakes}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-2">استراتيجية الفوز:</h4>
                <p className="text-slate-400 leading-relaxed">{mode.strategy}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-3 block">المميزات الرئيسية:</h4>
                <div className="flex flex-wrap gap-2">
                  {mode.features.map((feature, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-800 rounded-full text-sm font-medium text-slate-300 border border-slate-700">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to action */}
      <div className="max-w-4xl mx-auto px-6 mt-32 text-center relative z-10">
        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 p-10 rounded-3xl border border-slate-700 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">هل أنت مستعد للتحدي؟</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">اختر الطور الذي يناسبك وابدأ في تحطيم الأرقام القياسية وتحدي أصدقائك الآن!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center gap-3 mx-auto"
          >
            العودة للرئيسية <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
