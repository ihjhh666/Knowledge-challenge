export interface ProverbData {
  text: string;
  completions: { correct: string; wrong: string[] };
  situation?: { text: string; wrongProverbs: string[] };
  type: 'proverb' | 'wisdom' | 'saying';
  difficulty: 0 | 1 | 2; // 0=easy, 1=medium, 2=hard
}

export const PROVERBS_DB: ProverbData[] = [
  // العراقي
  { text: "الما يلوح العنب يكول", completions: { correct: "حامض", wrong: ["أخضر", "حلو", "يابس"] }, type: 'proverb', difficulty: 0 },
  { text: "الطيور على أشكالها", completions: { correct: "تقع", wrong: ["تطير", "تأكل", "تمشي"] }, type: 'proverb', difficulty: 0 },
  { text: "اللي ما يعرف الصقر", completions: { correct: "يشويه", wrong: ["يصيده", "يربيه", "يلعبه"] }, type: 'proverb', difficulty: 0 },
  { text: "أعط الخباز خبزه ولو أكل", completions: { correct: "نصفه", wrong: ["كله", "ربعه", "ثلثه"] }, type: 'proverb', difficulty: 0 },
  { text: "اللي استحوا", completions: { correct: "ماتوا", wrong: ["هربوا", "ناموا", "خسروا"] }, type: 'proverb', difficulty: 0 },
  { text: "أشم ولا", completions: { correct: "أذوق", wrong: ["أكل", "أشرب", "أرى"] }, type: 'proverb', difficulty: 1 },
  { text: "يا غريب كون", completions: { correct: "أديب", wrong: ["حاضر", "كريم", "شجاع"] }, type: 'proverb', difficulty: 0 },
  { text: "إذا حبيبك عسل لا تلحسه", completions: { correct: "كله", wrong: ["نصفه", "قطرة", "قليلاً"] }, type: 'proverb', difficulty: 0 },
  { text: "عمر الشقي", completions: { correct: "بقي", wrong: ["قصير", "طويل", "فان"] }, type: 'proverb', difficulty: 1 },
  { text: "الباب اللي يجيك منه الريح سده و", completions: { correct: "استريح", wrong: ["اقفله", "ابعد", "نام"] }, type: 'proverb', difficulty: 0 },
  { text: "السكوت علامة", completions: { correct: "الرضا", wrong: ["الغضب", "الخوف", "الحزن"] }, type: 'wisdom', difficulty: 0 },
  { text: "من جد وجد ومن زرع", completions: { correct: "حصد", wrong: ["أكل", "جمع", "نجح"] }, type: 'wisdom', difficulty: 0 },
  { text: "عذر أقبح من", completions: { correct: "ذنب", wrong: ["فعل", "خطأ", "كذبة"] }, type: 'wisdom', difficulty: 1 },
  { text: "لا يلدغ المؤمن من جحر", completions: { correct: "مرتين", wrong: ["أبداً", "ثلاثاً", "مباشرة"] }, type: 'wisdom', difficulty: 0 },
  { text: "العتب على", completions: { correct: "النظر", wrong: ["السمع", "القلب", "الفهم"] }, type: 'proverb', difficulty: 0 },
  { text: "فرخ البط", completions: { correct: "عوام", wrong: ["طائر", "جميل", "أبيض"] }, type: 'proverb', difficulty: 1 },
  { text: "عصفور في اليد خير من عشرة على", completions: { correct: "الشجرة", wrong: ["السقف", "الغصن", "الجدار"] }, type: 'proverb', difficulty: 0 },
  { text: "مصائب قوم عند قوم", completions: { correct: "فوائد", wrong: ["أحزان", "أخبار", "أفراح"] }, type: 'wisdom', difficulty: 1 },
  { text: "الغايب حجته", completions: { correct: "معاه", wrong: ["خلفه", "عنده", "ناقصة"] }, type: 'proverb', difficulty: 0 },
  { text: "من طلب العلا سهر", completions: { correct: "الليالي", wrong: ["النهار", "طويلاً", "الفجر"] }, type: 'wisdom', difficulty: 0 },
  { text: "تاج المروءة", completions: { correct: "التواضع", wrong: ["العلم", "المال", "النسب"] }, type: 'wisdom', difficulty: 2 },
  { text: "آفة المرء", completions: { correct: "حفظه", wrong: ["عقله", "ماله", "كسله"] }, type: 'wisdom', difficulty: 2, situation: { text: "يقال لمن ينسى ما يحفظ", wrongProverbs: ["الوقت كالسيف", "من جد وجد"] } },
  { text: "جنت على نفسها", completions: { correct: "براقش", wrong: ["نملة", "قطة", "مملكة"] }, type: 'saying', difficulty: 2, situation: { text: "يضرب لمن يجلب الأذى لنفسه ولأهله", wrongProverbs: ["القرد في عين أمه غزال", "وافق شن طبقة"] } },
  { text: "من حفر حفرة لأخيه", completions: { correct: "وقع فيها", wrong: ["ردمها", "نجا منها", "قفز فوقها"] }, type: 'proverb', difficulty: 0 },
  { text: "تجري الرياح بما لا تشتهي", completions: { correct: "السفن", wrong: ["الأمواج", "الأسماك", "الطيور"] }, type: 'proverb', difficulty: 1 },
  { text: "نام مظلوماً ولا تنم", completions: { correct: "ظالماً", wrong: ["جائعاً", "باكياً", "خائفاً"] }, type: 'proverb', difficulty: 1 },
  { text: "إذا كان الكلام من فضة فالسكوت من", completions: { correct: "ذهب", wrong: ["نحاس", "ألماس", "حديد"] }, type: 'proverb', difficulty: 0 },
  { text: "عصفور في اليد خير من عشرة على", completions: { correct: "الشجرة", wrong: ["السقف", "الغصن", "الجدار"] }, type: 'proverb', difficulty: 0 },
  { text: "رب أخ لك لم تلده", completions: { correct: "أمك", wrong: ["زوجتك", "أختك", "خالتك"] }, type: 'proverb', difficulty: 1 },
  
  // حكم ومقولات
  { text: "العقل السليم في الجسم", completions: { correct: "السليم", wrong: ["القوي", "النشيط", "الكبير"] }, type: 'wisdom', difficulty: 0 },
  { text: "الوقت كالسيف إن لم تقطعه", completions: { correct: "قطعك", wrong: ["كسرك", "رحل", "ضرك"] }, type: 'wisdom', difficulty: 0 },
  { text: "الصبر مفتاح", completions: { correct: "الفرج", wrong: ["النجاح", "الكسب", "الحياة"] }, type: 'wisdom', difficulty: 0 },
  { text: "مصائب قوم عند قوم", completions: { correct: "فوائد", wrong: ["أحزان", "أخبار", "أفراح"] }, type: 'wisdom', difficulty: 1 },
  { text: "درهم وقاية خير من قنطار", completions: { correct: "علاج", wrong: ["دواء", "ذهب", "مرض"] }, type: 'wisdom', difficulty: 0 },
  { text: "رضا الناس غاية لا", completions: { correct: "تدرك", wrong: ["تفهم", "تصل", "تعرف"] }, type: 'wisdom', difficulty: 1 },
  { text: "فاقد الشيء لا", completions: { correct: "يعطيه", wrong: ["يقدره", "يكسبه", "يملكه"] }, type: 'wisdom', difficulty: 0 },
  { text: "الحاجة أم", completions: { correct: "الاختراع", wrong: ["الصناعة", "التفكير", "الابداع"] }, type: 'wisdom', difficulty: 1 },
  
  // أمثال شعبية / متوسطة
  { text: "رجعت حليمة لعادتها", completions: { correct: "القديمة", wrong: ["السيئة", "الجديدة", "الطيبة"] }, type: 'proverb', difficulty: 1 },
  { text: "القرد في عين أمه", completions: { correct: "غزال", wrong: ["أسد", "جميل", "بطل"] }, type: 'proverb', difficulty: 0 },
  { text: "الباب اللي يجيك منه الريح سده و", completions: { correct: "استريح", wrong: ["اقفله", "ابعد", "نام"] }, type: 'proverb', difficulty: 0 },
  { text: "طبخ المطبوخ لا", completions: { correct: "يبوخ", wrong: ["ينفع", "يفسد", "يؤكل"] }, type: 'proverb', difficulty: 2 },
  { text: "أول الرقص", completions: { correct: "حنجلة", wrong: ["خطوة", "فرح", "موسيقى"] }, type: 'proverb', difficulty: 2 },
  { text: "ابن الوز", completions: { correct: "عوام", wrong: ["طائر", "غطاس", "سريع"] }, type: 'proverb', difficulty: 1 },
  { text: "يخلق من الشبه", completions: { correct: "أربعين", wrong: ["عشرين", "الكثير", "مائة"] }, type: 'proverb', difficulty: 0 },
  { text: "حبل الكذب", completions: { correct: "قصير", wrong: ["مقطوع", "طويل", "ضعيف"] }, type: 'proverb', difficulty: 0 },
  
  // مواقف
  { text: "جنت على نفسها", completions: { correct: "براقش", wrong: ["نملة", "قطة", "مملكة"] }, type: 'saying', difficulty: 2, situation: { text: "يضرب لمن يجلب الأذى لنفسه", wrongProverbs: ["القرد في عين أمه غزال", "الوقت كالسيف", "من جد وجد"] } },
  { text: "عاد بخفي", completions: { correct: "حنين", wrong: ["صالح", "طارق", "سعيد"] }, type: 'saying', difficulty: 1, situation: { text: "يضرب لمن يفشل في مهمته ويعود خائباً", wrongProverbs: ["عاد منتصراً", "صام وأفطر على بصلة", "جاء يكحلها أعماها"] } },
  { text: "وافق شن", completions: { correct: "طبقة", wrong: ["عقبة", "قطعة", "حفرة"] }, type: 'proverb', difficulty: 2, situation: { text: "يضرب لمن يتوافقان في الطبع والسلوك بشكل عجيب", wrongProverbs: ["الطيور على أشكالها تقع", "كل فتاة بأبيها معجبة", "رب صدفة خير من ألف ميعاد"] } },
  { text: "رب رمية من غير", completions: { correct: "رام", wrong: ["قوس", "سهم", "قصد"] }, type: 'wisdom', difficulty: 2 },
  { text: "جزاء", completions: { correct: "سنمار", wrong: ["الظالم", "الخائن", "العاصي"] }, type: 'saying', difficulty: 2, situation: { text: "يضرب لمن يُقابل الإحسان بالإساءة", wrongProverbs: ["جزاء الإحسان بالإحسان", "كما تدين تدان", "على نفسها جنت براقش"] } },
  { text: "أبطأ من", completions: { correct: "سلحفاة", wrong: ["نملة", "حلزون", "قنفذ"] }, type: 'proverb', difficulty: 1 },
  
  // تشكيلة إضافية
  { text: "أكل عليه الدهر و", completions: { correct: "شرب", wrong: ["نام", "مات", "ارتاح"] }, type: 'saying', difficulty: 1 },
  { text: "باتت والرب", completions: { correct: "كفيلها", wrong: ["معها", "حاميها", "حافظها"] }, type: 'proverb', difficulty: 2 },
  { text: "الغريق يتعلق بـ", completions: { correct: "قشة", wrong: ["حبل", "لوح", "شجرة"] }, type: 'proverb', difficulty: 1 },
  { text: "كل فتاة بأبيها", completions: { correct: "معجبة", wrong: ["مشتتة", "مغرمة", "سعيدة"] }, type: 'proverb', difficulty: 1 },
  { text: "البعيد عن العين بعيد عن", completions: { correct: "القلب", wrong: ["الذاكرة", "الفكر", "البال"] }, type: 'proverb', difficulty: 0 },
  { text: "الغاية تبرر", completions: { correct: "الوسيلة", wrong: ["العمل", "الطريقة", "النتيجة"] }, type: 'wisdom', difficulty: 1 },
  { text: "في التأني السلامة وفي العجلة", completions: { correct: "الندامة", wrong: ["الخسارة", "السقوط", "الخطأ"] }, type: 'wisdom', difficulty: 0 },
  { text: "كما تدين", completions: { correct: "تدان", wrong: ["تفعل", "تحصد", "تأخذ"] }, type: 'wisdom', difficulty: 0 },
  { text: "يد واحدة لا", completions: { correct: "تصفق", wrong: ["تعمل", "تبني", "تكتب"] }, type: 'proverb', difficulty: 0 },
  { text: "الصديق وقت", completions: { correct: "الضيق", wrong: ["الحاجة", "السعة", "الفرح"] }, type: 'proverb', difficulty: 0 },
];

/**
 * دالة لتوليد آلاف الأسئلة من النواة الأساسية
 * عن طريق تغيير النمط (حذف الكلمة الأخيرة، أو اختيار المثل المناسب، الخ)
 */
export function generateProverbQuestions(count: number = 20) {
  const generated: any[] = [];
  const styles = ['complete_last', 'find_situation', 'find_proverb'];
  
  // سنقوم بالمرور بشكل عشوائي وبناء الأسئلة
  const pool = [...PROVERBS_DB].sort(() => 0.5 - Math.random());
  
  let attempts = 0;
  while(generated.length < count && attempts < 1000) {
    const item = pool[attempts % pool.length];
    const style = styles[Math.floor(Math.random() * styles.length)];
    attempts++;

    // النمط الأول: أكمل الكلمة (كما هو واضح)
    if (style === 'complete_last') {
        const textStr = `${item.text} ...`;
        const options = [item.completions.correct, ...item.completions.wrong].sort(() => 0.5 - Math.random());
        generated.push({
            type: 'complete_last',
            text: textStr,
            options,
            correctAnswer: item.completions.correct,
            difficulty: item.difficulty,
            category: item.type
        });
    }
    // النمط الثاني: ابحث عن الموقف
    else if (style === 'find_situation' && item.situation) {
        const textStr = `ما هو المثل المناسب للموقف التالي: "${item.situation.text}"؟`;
        const fullProverb = `${item.text} ${item.completions.correct}`;
        const options = [fullProverb, ...item.situation.wrongProverbs].sort(() => 0.5 - Math.random());
        generated.push({
            type: 'find_situation',
            text: textStr,
            options,
            correctAnswer: fullProverb,
            difficulty: item.difficulty,
            category: item.type
        });
    }
    // النمط الثالث: اختيار المثل الصحيح من بين أمثال محرفة
    else if (style === 'find_proverb') {
        const textStr = `أي من هذه الأمثال / الحكم هو الصحيح؟`;
        const fullProverb = `${item.text} ${item.completions.correct}`;
        const wrongProverbs = item.completions.wrong.map(w => `${item.text} ${w}`);
        const options = [fullProverb, ...wrongProverbs].slice(0, 4).sort(() => 0.5 - Math.random());
        
        // Ensure exact 4 options logic
        generated.push({
            type: 'find_proverb',
            text: textStr,
            options,
            correctAnswer: fullProverb,
            difficulty: item.difficulty,
            category: item.type
        });
    }
  }

  // Remove exact duplicates
  const uniqueQs = generated.filter((v, i, a) => a.findIndex(t => (t.text === v.text)) === i);
  return uniqueQs.slice(0, count);
}
