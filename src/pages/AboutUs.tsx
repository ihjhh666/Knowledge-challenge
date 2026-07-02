import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Info, Target, Zap, Globe2, Lightbulb, Heart, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  const sections = [
    {
      icon: <Target className="w-8 h-8 text-blue-400" />,
      title: 'فكرة اللعبة ومهمتنا',
      desc: 'انطلقت فكرة "تحدي المعرفة" من الحاجة الملحة لوجود منصة عربية تدمج بين الترفيه والمتعة، وبين إثراء العقل بالمعلومات القيمة. نحن نؤمن بأن الألعاب يمكن أن تكون أداة قوية للتعليم وتوسيع المدارك. مهمتنا هي خلق بيئة تنافسية صحية تتيح للشباب العربي تحدي بعضهم البعض واختبار سرعة بديهتهم وحصيلتهم الثقافية في مجالات متنوعة تشمل العلوم، التاريخ، الرياضة، والفنون.',
      color: 'blue'
    },
    {
      icon: <Globe2 className="w-8 h-8 text-emerald-400" />,
      title: 'لماذا تم تطوير المنصة؟',
      desc: 'لاحظنا ندرة الألعاب المعرفية والتثقيفية العربية التي تقدم تجربة لعب تفاعلية وحقيقية متعددة اللاعبين. الغالبية العظمى من الألعاب إما أن تكون مستوردة وغير متوافقة مع الثقافة العربية، أو تفتقر إلى الجودة التقنية. لذا، قمنا ببناء هذه المنصة لسد هذه الفجوة وتقديم منتج رقمي عربي يليق بتطلعات المستخدمين، مع التركيز الصارم على جودة الأداء، دقة المعلومات، وسلاسة الاستخدام على كافة الأجهزة الذكية.',
      color: 'emerald'
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      title: 'القيمة التعليمية والأهداف',
      desc: 'هدفنا الأساسي هو نشر المعرفة بأسلوب عصري لا يبعث على الملل، وتحفيز التعلم المستمر من خلال اللعب (Gamification). نحن نسعى لبناء أكبر مجتمع للاعبين العرب المهتمين بالثقافة والتحدي الذهني، وتوفير بيئة آمنة وخالية من المحتوى السلبي، تركز على الارتقاء بمستوى الفرد الفكري، وتنمية مهارات التفكير النقدي وسرعة اتخاذ القرار.',
      color: 'amber'
    },
    {
      icon: <Heart className="w-8 h-8 text-fuchsia-400" />,
      title: 'هوية عربية أصيلة',
      desc: 'تم تصميم وتطوير "تحدي المعرفة" بأيادٍ وعقول عربية بالكامل. ابتداءً من واجهة المستخدم المصممة خصيصاً لتدعم اللغة العربية بشكل مثالي، مروراً بالهوية البصرية، وصولاً إلى محتوى الأسئلة الذي تم إعداده ومراجعته بدقة ليناسب هويتنا، ثقافتنا، وتاريخنا العربي العريق، مع الانفتاح الواعي على الثقافات والعلوم العالمية.',
      color: 'fuchsia'
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-indigo-400" />,
      title: 'تطور مستمر وتقنيات حديثة',
      desc: 'في عصر التكنولوجيا المتسارع، نحن لا نتوقف أبداً. المنصة تعتمد على أحدث تقنيات الويب والذكاء الاصطناعي لتقديم تجربة لعب سلسة وعادلة. المنصة في حالة تحديث مستمر؛ حيث نقوم شهرياً بإضافة أطوار لعب جديدة، وتغذية قاعدة البيانات بآلاف الأسئلة الموثقة والمراجعة بدقة، وتحسين خوارزميات الذكاء الاصطناعي لتقديم تجربة مخصصة لكل مستخدم.',
      color: 'indigo'
    },
    {
      icon: <Rocket className="w-8 h-8 text-rose-400" />,
      title: 'الرؤية المستقبلية',
      desc: 'نطمح لأن تصبح منصة "تحدي المعرفة" الوجهة الأولى والتطبيق المفضل في كل هاتف ذكي عربي للترفيه الهادف والتعليم التفاعلي. خططنا المستقبلية تتضمن إطلاق بطولات إقليمية كبرى، تطوير نظام عشائر وفرق (Clans) لتعزيز روح العمل الجماعي، وإطلاق أطوار لعب مبتكرة تدمج بين الواقع المعزز والتعليم، لنغير بذلك المفهوم التقليدي للألعاب الثقافية.',
      color: 'rose'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24" dir="rtl">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-emerald-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-8"
          >
            <Info className="w-12 h-12 text-blue-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-l from-blue-400 to-emerald-400 text-transparent bg-clip-text font-heading"
          >
            عن منصة تحدي المعرفة
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            تعرف على القصة وراء المنصة، ورؤيتنا لمستقبل الألعاب المعرفية في الوطن العربي.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 hover:bg-slate-800/80 transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${section.color}-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-${section.color}-500/20 transition-all`}></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 relative z-10">
                <div className={`p-4 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-${section.color}-500/50 shadow-inner transition-colors shrink-0`}>
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-200 group-hover:text-white transition-colors">{section.title}</h2>
              </div>
              
              <p className="text-slate-400 leading-relaxed relative z-10 text-lg">
                {section.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 mt-24 text-center relative z-10">
        <Link
          to="/"
          className="inline-flex bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 items-center gap-3 mx-auto"
        >
          العودة للصفحة الرئيسية <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
