import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ArrowRight, ArrowLeft, RefreshCw, Share2, Sparkles, User, Activity, Shield, Target, Users, Lightbulb, Briefcase, Zap, CheckCircle2, History } from 'lucide-react';
import { personalityQuestions, PersonalityQuestion } from '../data/personalityQuestions';
import { audio } from '../lib/audio';
import confetti from 'canvas-confetti';

type GameState = 'intro' | 'playing' | 'analyzing' | 'result';

interface ReportData {
  mainType: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  thinkingStyle: string;
  socialStyle: string;
  decisionStyle: string;
  workEnvironment: string;
  studyType: string;
  advice: string;
  othersView: string;
  similarPersonalities: { name: string, desc: string }[];
  traits: Record<string, number>;
}

const TRAIT_NAMES: Record<string, string> = {
  logical: 'التفكير المنطقي',
  social: 'الذكاء الاجتماعي',
  leader: 'القيادة',
  adaptive: 'المرونة والتكيف',
  emotional: 'الذكاء العاطفي',
  planner: 'التخطيط الاستراتيجي',
  adventurer: 'روح المغامرة',
  calm: 'الهدوء والاتزان',
  creative: 'الإبداع والابتكار',
  ambition: 'الطموح العالي',
  confidence: 'الثقة بالنفس',
  risk: 'المخاطرة المحسوبة',
  teamwork: 'العمل الجماعي',
  independence: 'الاستقلالية',
  discipline: 'الانضباط الذاتي',
  observer: 'قوة الملاحظة',
  reactive: 'سرعة البديهة'
};

export default function AiPersonality() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('intro');
  const [questions, setQuestions] = useState<PersonalityQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [report, setReport] = useState<ReportData | null>(null);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  
  const [traits, setTraits] = useState<Record<string, number>>({});

  useEffect(() => {
    initGame();
    checkSavedResult();
  }, []);

  const checkSavedResult = () => {
    const saved = localStorage.getItem('aiPersonalityResult');
    if (saved) {
      setHasSavedResult(true);
    }
  };

  const loadSavedResult = () => {
    const saved = localStorage.getItem('aiPersonalityResult');
    if (saved) {
      audio.click();
      const parsed = JSON.parse(saved);
      setReport(parsed);
      setTraits(parsed.traits || {});
      setGameState('result');
    }
  };

  const initGame = () => {
    // Select 25 random questions out of 150
    const shuffled = [...personalityQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 25));
    
    // Reset traits based on full list
    const initialTraits: Record<string, number> = {};
    Object.keys(TRAIT_NAMES).forEach(k => initialTraits[k] = 0);
    setTraits(initialTraits);
  };

  const startGame = () => {
    audio.click();
    setGameState('playing');
    setCurrentIndex(0);
    setAnswers({});
  };

  const handleAnswer = (optionIdx: number) => {
    audio.click();
    
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIdx
    }));

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      finishQuiz({ ...answers, [currentIndex]: optionIdx });
    }
  };

  const finishQuiz = (finalAnswers: Record<number, number>) => {
    setGameState('analyzing');
    audio.click();
    
    const newTraits = { ...traits };
    Object.keys(newTraits).forEach(k => newTraits[k] = 0);
    
    Object.entries(finalAnswers).forEach(([qIdxStr, optIdx]) => {
      const q = questions[parseInt(qIdxStr)];
      const optionTraits = q.options[optIdx].traits;
      
      Object.entries(optionTraits).forEach(([trait, weight]) => {
        if (newTraits[trait] !== undefined) {
          newTraits[trait] += weight as number;
        }
      });
    });
    
    setTraits(newTraits);

    setTimeout(() => {
       generateAdvancedReport(newTraits);
       setGameState('result');
       confetti({
         particleCount: 150,
         spread: 80,
         origin: { y: 0.6 },
         colors: ['#818cf8', '#c084fc', '#f472b6']
       });
       audio.win();
    }, 4000);
  };

  const generateAdvancedReport = (t: Record<string, number>) => {
    // Ensure positive scores for sorting
    const adjustedTraits = { ...t };
    Object.keys(adjustedTraits).forEach(k => {
      if (adjustedTraits[k] < 0) adjustedTraits[k] = 0;
    });

    const sorted = Object.entries(adjustedTraits).sort((a,b) => b[1] - a[1]);
    const top1 = sorted[0][0];
    const top2 = sorted[1][0];
    const top3 = sorted[2][0];
    
    // Weaknesses from the bottom
    const bottomTraits = sorted.filter(item => item[1] <= Math.max(...sorted.map(s=>s[1])) * 0.2);
    const bottom1 = bottomTraits.length > 0 ? bottomTraits[bottomTraits.length - 1][0] : sorted[sorted.length - 1][0];
    const bottom2 = bottomTraits.length > 1 ? bottomTraits[bottomTraits.length - 2][0] : sorted[sorted.length - 2][0];
    const bottom3 = bottomTraits.length > 2 ? bottomTraits[bottomTraits.length - 3][0] : sorted[sorted.length - 3][0];

    let mainType = '';
    let desc = '';
    let thinkingStyle = '';
    let socialStyle = '';
    let decisionStyle = '';
    let workEnv = '';
    let studyType = '';
    let advice = '';
    let othersView = '';
    let similar: {name: string, desc: string}[] = [];

    // Advanced Logic for archetypes
    if (top1 === 'logical' && top2 === 'planner') {
      mainType = 'المفكر الاستراتيجي';
      desc = 'أنت تمتلك عقلاً تحليلياً قوياً وقدرة على رؤية الصورة الكبيرة والتخطيط للمستقبل بدقة وعناية. لا تدع العواطف تسيطر على قراراتك وتفضل دائماً الاعتماد على الحقائق والأرقام. شخصيتك مبنية على النظام والمنطق، مما يجعلك شخصاً يعتمد عليه في وقت الأزمات لإيجاد الحلول المعقدة.';
      thinkingStyle = 'منهجي ومنطقي، يقوم بتفكيك المشاكل المعقدة إلى أجزاء صغيرة يسهل التعامل معها.';
      socialStyle = 'تفضل النقاشات العميقة والهادفة وتتجنب الأحاديث السطحية والمجاملات المفرطة.';
      decisionStyle = 'مبنية على تحليل شامل للمخاطر والمكاسب، ولا تميل للاندفاع العاطفي.';
      workEnv = 'بيئة منظمة ومستقرة تقدر الكفاءة وتوفر مساحة للتركيز المستقل.';
      studyType = 'الهندسة، علوم الحاسب، الاقتصاد، الرياضيات، أو إدارة الأعمال.';
      advice = 'حاول أن تكون أكثر مرونة مع التغييرات المفاجئة واسمح لنفسك ببعض العفوية والمغامرة أحياناً.';
      othersView = 'يراك الآخرون كشخص عقلاني وموثوق، وغالباً ما يلجؤون إليك للحصول على نصيحة عملية ومنطقية.';
      similar = [
        { name: 'المخطط', desc: 'يشاركك حب التنظيم والنظرة المستقبلية' },
        { name: 'المحلل', desc: 'يشاركك دقة الملاحظة والتفكير المبني على البيانات' }
      ];
    } else if (top1 === 'creative' || top2 === 'creative') {
      mainType = 'المبدع الحر';
      desc = 'شخصيتك تتميز بخيال واسع وقدرة فريدة على ابتكار أفكار خارج الصندوق. أنت لا تحب القيود والروتين، وتفضل دائماً استكشاف آفاق جديدة. عقلك يعمل بطريقة شبكية تربط الأشياء التي قد تبدو متباعدة، مما يمنحك ميزة تنافسية في حل المشاكل بطرق مبتكرة وتقديم رؤية فنية مميزة.';
      thinkingStyle = 'عشوائي ومنطلق، يربط الأفكار ببعضها البعض بطرق غير تقليدية.';
      socialStyle = 'شخصية جذابة ومثيرة للاهتمام، تحب التحدث عن الأفكار والمشاريع المستقبلية.';
      decisionStyle = 'تعتمد على الحدس والإلهام اللحظي أكثر من التحليل الرقمي البحت.';
      workEnv = 'بيئة مرنة وحرة تشجع على الابتكار ولا تفرض قيوداً صارمة على طريقة العمل.';
      studyType = 'الفنون، التصميم، التسويق، الإعلام، أو ريادة الأعمال.';
      advice = 'تحتاج إلى تطوير مهارة الانضباط الذاتي لتنفيذ أفكارك الرائعة وتحويلها إلى واقع ملموس.';
      othersView = 'يراك الآخرون كشخص ملهم ومختلف، يضيف لمسة من التجديد في أي مكان يتواجد فيه.';
      similar = [
        { name: 'المستكشف', desc: 'يشاركك حب الجديد والهروب من الروتين' },
        { name: 'الفنان', desc: 'يشاركك النظرة الجمالية والعمق الداخلي' }
      ];
    } else if (top1 === 'leader' || top2 === 'leader') {
      mainType = 'القائد المؤثر';
      desc = 'أنت شخص ولد ليقود. تتمتع بثقة عالية بالنفس وقدرة على توجيه الآخرين نحو هدف مشترك. تتحمل المسؤولية في أصعب الأوقات ولا تتهرب من اتخاذ القرارات الصعبة. شخصيتك تجمع بين الحزم والقدرة على تحفيز الفريق، مما يجعلك نقطة ارتكاز في أي بيئة تتواجد فيها.';
      thinkingStyle = 'عملي وموجه نحو الأهداف، يبحث عن أسرع وأفضل طريق لإنجاز المهمة.';
      socialStyle = 'كاريزمي ومؤثر، تستطيع إقناع الآخرين بآرائك بسهولة وتبني علاقات قوية.';
      decisionStyle = 'حاسمة وسريعة، وتتحمل المسؤولية كاملة عن النتائج مهما كانت.';
      workEnv = 'بيئة ديناميكية وتنافسية تتيح لك حرية التوجيه واتخاذ القرارات وإدارة الفرق.';
      studyType = 'إدارة الأعمال، الحقوق، العلوم السياسية، أو الإدارة العامة.';
      advice = 'تذكر دائماً أن تستمع بصدق لآراء من هم حولك، فالقيادة الحقيقية تبدأ بالاستماع الفعال.';
      othersView = 'يراك الناس كشخص قوي وموثوق، يمثل صمام الأمان والبوصلة التي توجههم في المواقف الصعبة.';
      similar = [
        { name: 'المنافس', desc: 'يشاركك الدافع القوي للفوز وتحقيق الأهداف' },
        { name: 'الملهم', desc: 'يشاركك القدرة على تحريك الناس للتصرف' }
      ];
    } else if (top1 === 'social' || top2 === 'social') {
      mainType = 'الداعم الاجتماعي';
      desc = 'أنت شخصية ودودة ومحبة للناس، تستمد طاقتك من التفاعل مع الآخرين. تمتاز بذكاء عاطفي عالٍ يجعلك قادراً على فهم مشاعر من حولك والتعاطف معهم. أنت الغراء الذي يربط المجموعة ببعضها، وتفضل دائماً نشر السلام والانسجام في محيطك بدلاً من الدخول في صراعات غير مبررة.';
      thinkingStyle = 'متعاطف وموجه نحو الإنسان، يضع مشاعر واحتياجات الآخرين في الحسبان دائماً.';
      socialStyle = 'منفتح، دافئ، وداعم. تمتلك شبكة علاقات واسعة وتعتبر صديقاً مخلصاً للجميع.';
      decisionStyle = 'تأخذ بعين الاعتبار تأثير القرار على الأشخاص، وتميل للتوافق والحلول الوسطى.';
      workEnv = 'بيئة عمل تعاونية وودية، تعتمد على التفاعل البشري المباشر والعمل ضمن فريق.';
      studyType = 'علم النفس، الموارد البشرية، العلاقات العامة، أو الخدمة الاجتماعية.';
      advice = 'لا تنسَ تخصيص وقت لنفسك، ولا تجعل تلبية احتياجات الآخرين تأتي على حساب راحتك وطموحك الشخصي.';
      othersView = 'ينظر إليك الآخرون كملاذ آمن وصديق مخلص يمكن الاعتماد عليه لتقديم الدعم المعنوي متى احتاجوه.';
      similar = [
        { name: 'المستشار', desc: 'يشاركك القدرة على الاستماع وتقديم الدعم العاطفي' },
        { name: 'المحفز', desc: 'يشاركك الروح الإيجابية وحب العمل الجماعي' }
      ];
    } else if (top1 === 'adventurer' || top2 === 'adventurer') {
      mainType = 'المغامر الشجاع';
      desc = 'لا تكتفي بالحياة الروتينية والمألوفة. قلبك ينبض بالتحدي واكتشاف المجهول، سواء كان ذلك في السفر، الأفكار الجديدة، أو المغامرات العملية. لا تخشى المخاطرة بل تعتبرها جزءاً ممتعاً من الحياة، وتجيد التكيف مع البيئات الصعبة والمتغيرة بفضل شجاعتك المستمرة.';
      thinkingStyle = 'سريع التكيف ومندفع أحياناً، يفضل التجربة الحية على التخطيط النظري الطويل.';
      socialStyle = 'عفوي وجريء، يجذب الناس بحكاياته وتجاربه، ولا يحب العلاقات المقيدة.';
      decisionStyle = 'تعتمد على الحماس واستغلال الفرص الفورية حتى وإن كانت محفوفة بالمخاطر.';
      workEnv = 'بيئة متغيرة لا تعتمد على الروتين المكتبي، مثل العمل الميداني أو المشاريع الحرة المتنوعة.';
      studyType = 'السياحة والاستكشاف، الصحافة الميدانية، الرياضة، أو ريادة الأعمال الجريئة.';
      advice = 'بعض التخطيط قبل القفز في المجهول سيوفر عليك الكثير من التعب دون أن يفقدك متعة المغامرة.';
      othersView = 'يراك الآخرون كشخص لا يمكن التنبؤ به ولكنه مفعم بالحياة، يبعث الحماس في من حوله.';
      similar = [
        { name: 'المكتشف', desc: 'يشاركك الفضول للتعرف على عوالم جديدة' },
        { name: 'الجريء', desc: 'يشاركك عدم الخوف من التغييرات والمخاطرات' }
      ];
    } else {
      mainType = 'المتوازن الحكيم';
      desc = 'تتمتع بشخصية نادرة تمزج بين عدة صفات بشكل متوازن. أنت قادر على التأقلم مع مختلف الظروف وتغيير أسلوبك حسب ما يقتضيه الموقف. لا تميل للتطرف في قراراتك، بل تبحث دائماً عن الحل الوسط المعتدل الذي يجمع بين المنطق والعاطفة، مما يمنحك حكمة ورؤية شاملة للأمور.';
      thinkingStyle = 'شامل ومتأنٍ، يدرس جميع الجوانب قبل الوصول إلى استنتاج أو إصدار أحكام.';
      socialStyle = 'تستطيع الانسجام مع جميع أنواع الشخصيات، وتفضل العلاقات المتوازنة والمستقرة.';
      decisionStyle = 'معتدلة ومبنية على الموازنة بين العقل والقلب، مع مراعاة الظروف المحيطة وتأثيرها.';
      workEnv = 'بيئة عمل متوازنة تدمج بين العمل الجماعي والمهام المستقلة بمرونة وانسجام.';
      studyType = 'مجالات واسعة مثل التعليم، الإدارة الشاملة، أو العلوم الإنسانية التطبيقية.';
      advice = 'توازنك هو نقطة قوتك، ولكن لا تتردد في اتخاذ موقف حازم وواضح عندما يتطلب الأمر الحسم.';
      othersView = 'يراك من حولك كشخص هادئ ورزين، يمتلك حكمة وقدرة على احتواء المشاكل المعقدة ببساطة.';
      similar = [
        { name: 'الدبلوماسي', desc: 'يشاركك مهارة التوفيق بين الآراء المختلفة وإحلال السلام' },
        { name: 'الواقعي', desc: 'يشاركك النظرة المتزنة للأمور دون مبالغة أو تهويل' }
      ];
    }

    const reportData: ReportData = {
      mainType,
      description: desc,
      strengths: [TRAIT_NAMES[top1] || top1, TRAIT_NAMES[top2] || top2, TRAIT_NAMES[top3] || top3],
      weaknesses: [TRAIT_NAMES[bottom1] || bottom1, TRAIT_NAMES[bottom2] || bottom2, TRAIT_NAMES[bottom3] || bottom3],
      thinkingStyle,
      socialStyle,
      decisionStyle,
      workEnvironment: workEnv,
      studyType,
      advice,
      othersView,
      similarPersonalities: similar,
      traits: adjustedTraits
    };

    setReport(reportData);
    
    // Save to local storage
    localStorage.setItem('aiPersonalityResult', JSON.stringify(reportData));
    setHasSavedResult(true);
  };

  const restart = () => {
    audio.click();
    initGame();
    setGameState('intro');
  };

  const getPercentage = (val: number) => {
    // Advanced math since 25 questions, each weight can be up to 2
    // Max practical points for a single trait ~ 15-20. 
    // We normalize to a realistic bell curve curve max of 20
    return Math.min(100, Math.max(10, Math.round((val / 20) * 100))); 
  };

  const sortedTraits = Object.entries(traits)
    .sort((a,b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden" dir="rtl">
      {/* Background Ambience */}
      <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 relative z-20 flex items-center justify-between backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50 sticky top-0">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold font-heading">اعرف شخصيتك</h1>
        </div>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-4xl min-h-[calc(100vh-100px)] flex flex-col">
        <AnimatePresence mode="wait">
          
          {gameState === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-10"
            >
              <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-2xl absolute inset-0 animate-pulse" />
                <div className="w-32 h-32 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center relative z-10 shadow-2xl">
                  <Brain className="w-16 h-16 text-indigo-400" />
                </div>
              </div>
              
              <div className="space-y-6 max-w-2xl mx-auto">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2">
                  اكتشف من أنت حقاً
                </h2>
                <p className="text-slate-300 text-xl leading-relaxed">
                  خض تجربة تحليل شخصية احترافية مدعومة بالذكاء الاصطناعي. عبر {questions.length} سؤالاً دقيقاً، سنقوم بتحليل صفاتك، قدراتك، ونمط تفكيرك لنقدم لك تقريراً مفصلاً لم تره من قبل.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-medium text-slate-300 flex items-center gap-2 border border-slate-700">
                    <Zap className="w-4 h-4 text-yellow-400" /> تقرير مفصل
                  </span>
                  <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-medium text-slate-300 flex items-center gap-2 border border-slate-700">
                    <Target className="w-4 h-4 text-emerald-400" /> دقة عالية
                  </span>
                  <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-medium text-slate-300 flex items-center gap-2 border border-slate-700">
                    <Shield className="w-4 h-4 text-rose-400" /> تحليل شامل
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md mx-auto">
                <button
                  onClick={startGame}
                  className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-xl shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  ابدأ الاختبار
                  <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                </button>
                
                {hasSavedResult && (
                  <button
                    onClick={loadSavedResult}
                    className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-xl border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-3 text-slate-300"
                  >
                    النتيجة السابقة
                    <History className="w-6 h-6" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && questions.length > 0 && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-4"
            >
              <div className="mb-10 space-y-4">
                <div className="flex justify-between text-sm text-slate-400 font-medium">
                  <span className="bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">السؤال {currentIndex + 1} من {questions.length}</span>
                  <span className="bg-indigo-900/50 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/30">{Math.round(((currentIndex) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm"
                  >
                    <div className="text-indigo-400 text-sm font-bold mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4" /> 
                      {questions[currentIndex].category}
                    </div>
                    <h3 className="text-3xl font-bold leading-relaxed text-white">
                      {questions[currentIndex].text}
                    </h3>
                  </motion.div>
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-4">
                  {questions[currentIndex].options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(30, 41, 59, 0.8)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(idx)}
                      className={`p-6 rounded-2xl text-xl font-medium transition-all text-right
                        ${answers[currentIndex] === idx 
                          ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.4)] text-white' 
                          : 'bg-slate-900 border-slate-700 text-slate-200'
                        } border-2 backdrop-blur-sm flex items-center gap-4`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                         ${answers[currentIndex] === idx ? 'bg-white text-indigo-600' : 'bg-slate-800 text-slate-400'}`}>
                         {idx + 1}
                      </div>
                      {opt.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative">
                <div className="w-48 h-48 border-4 border-slate-800 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="w-48 h-48 border-4 border-indigo-500 rounded-full animate-[spin_2s_linear_infinite_reverse] absolute inset-0 border-t-transparent border-b-transparent" />
                <div className="w-32 h-32 border-4 border-purple-500 rounded-full animate-[spin_4s_linear_infinite] absolute top-8 left-8 border-l-transparent border-r-transparent" />
                <Brain className="w-20 h-20 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse">
                  جاري بناء التقرير الاحترافي...
                </h2>
                <p className="text-slate-400 text-lg">يتم الآن معالجة إجاباتك وربطها بالأنماط السلوكية المعقدة</p>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && report && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 pb-20 mt-4"
            >
              <div className="space-y-8 max-w-4xl mx-auto">
                
                {/* Hero Profile */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-8 rounded-[2rem] border border-indigo-500/30 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                  <div className="absolute -top-24 -right-24 opacity-10">
                    <Brain className="w-64 h-64" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center text-center md:text-right">
                    <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-indigo-400 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] shrink-0">
                      <User className="w-16 h-16 text-indigo-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="inline-block px-4 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-300 font-bold text-sm tracking-wide">
                        نمط الشخصية الأساسي
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-md">
                        {report.mainType}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-slate-950/40 rounded-2xl border border-slate-700/50 relative z-10">
                    <p className="text-slate-200 text-xl leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Grid 2 Cols for Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">أبرز نقاط القوة</h3>
                    </div>
                    <ul className="space-y-4">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-center gap-3 text-lg text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-rose-500/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent" />
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
                        <Activity className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">نقاط تحتاج للتطوير</h3>
                    </div>
                    <ul className="space-y-4">
                      {report.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-center gap-3 text-lg text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mr-1.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Analytical Breakdown */}
                <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <Target className="w-7 h-7 text-indigo-400" />
                    التحليل السلوكي المفصل
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h4 className="text-indigo-400 font-bold flex items-center gap-2">
                        <Brain className="w-5 h-5" /> طريقة التفكير
                      </h4>
                      <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        {report.thinkingStyle}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                        <Users className="w-5 h-5" /> التعامل مع الناس
                      </h4>
                      <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        {report.socialStyle}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-amber-400 font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5" /> اتخاذ القرارات
                      </h4>
                      <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        {report.decisionStyle}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-blue-400 font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> بيئة العمل المثالية
                      </h4>
                      <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        {report.workEnvironment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Others View & Advice */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-indigo-900/20 p-6 rounded-3xl border border-indigo-500/20">
                    <h4 className="text-indigo-300 font-bold flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5" /> كيف يراك الآخرون؟
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-lg">
                      {report.othersView}
                    </p>
                  </div>
                  
                  <div className="bg-purple-900/20 p-6 rounded-3xl border border-purple-500/20">
                    <h4 className="text-purple-300 font-bold flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5" /> نصيحة لتطوير شخصيتك
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-lg">
                      {report.advice}
                    </p>
                  </div>
                </div>

                {/* Traits Bars */}
                <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                     <Activity className="w-7 h-7 text-emerald-400" />
                     المؤشرات الدقيقة
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                    {sortedTraits.slice(0, 8).map(([key, val], i) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-slate-200">{TRAIT_NAMES[key] || key}</span>
                          <span className="text-indigo-400 font-bold">{getPercentage(val)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getPercentage(val)}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Personalities */}
                <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <User className="w-7 h-7 text-pink-400" />
                    شخصيات مشابهة لك
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {report.similarPersonalities.map((sp, i) => (
                      <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <h4 className="font-bold text-white text-lg mb-1">{sp.name}</h4>
                        <p className="text-slate-400 text-sm">{sp.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={restart}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] text-lg"
                  >
                    <RefreshCw className="w-6 h-6" />
                    إعادة الاختبار
                  </button>
                  <button
                    onClick={() => {
                       if (navigator.share) {
                          navigator.share({
                             title: 'تحليل شخصيتي بالذكاء الاصطناعي',
                             text: `لقد حللت شخصيتي وظهرت النتيجة: ${report.mainType}! جرب اللعبة الآن.`
                          });
                       } else {
                          alert('تم نسخ النتيجة!');
                       }
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-colors text-lg"
                  >
                    <Share2 className="w-6 h-6" />
                    مشاركة النتيجة
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
