import { ProverbData } from './proverbs/types';
import { IRAQI_PROVERBS } from './proverbs/iraqi';
import { EGYPTIAN_PROVERBS } from './proverbs/egyptian';
import { LEVANT_PROVERBS } from './proverbs/levant';
import { GULF_MAGHREB_PROVERBS } from './proverbs/gulf_maghreb';
import { FUSHA_PROVERBS } from './proverbs/fusha';
import { WISDOM_PROVERBS } from './proverbs/wisdom';

import { EGYPTIAN_PROVERBS_2 } from './proverbs/egyptian_2';
import { IRAQI_PROVERBS_2 } from './proverbs/iraqi_2';
import { LEVANT_PROVERBS_2 } from './proverbs/levant_2';
import { GULF_PROVERBS_2 } from './proverbs/gulf_2';
import { FUSHA_PROVERBS_2 } from './proverbs/fusha_2';
import { MEGA_PROVERBS_1 } from './proverbs/mega1';
import { MEGA_PROVERBS_2 } from './proverbs/mega2';
import { MEGA_PROVERBS_3 } from './proverbs/mega3';
import { MEGA_PROVERBS_4 } from './proverbs/mega4';
import { MEGA_PROVERBS_5 } from './proverbs/mega5';
import { MEGA_PROVERBS_6 } from './proverbs/mega6';
import { MEGA_PROVERBS_7 } from './proverbs/mega7';
import { MEGA_PROVERBS_8 } from './proverbs/mega8';
import { MEGA_PROVERBS_9 } from './proverbs/mega9';
import { MEGA_PROVERBS_10 } from './proverbs/mega10';
import { MEGA_PROVERBS_11 } from './proverbs/mega11';
import { MEGA_PROVERBS_12 } from './proverbs/mega12';
import { MEGA_PROVERBS_13 } from './proverbs/mega13';
import { MEGA_PROVERBS_14 } from './proverbs/mega14';
import { MEGA_PROVERBS_15 } from './proverbs/mega15';
import { MEGA_PROVERBS_16 } from './proverbs/mega16';

import { MEGA_IRAQI } from './proverbs/mega_iraqi';
import { MEGA_MAGHREB } from './proverbs/mega_maghreb';
import { MEGA_GULF } from './proverbs/mega_gulf';
import { MEGA_LEVANT } from './proverbs/mega_levant';
import { MEGA_POETRY } from './proverbs/mega_poetry';
import { MEGA_FUNNY } from './proverbs/mega_funny';
import { MEGA_ARABIC_HERITAGE } from './proverbs/mega_heritage';
import { MEGA_EGYPTIAN } from './proverbs/mega_egyptian';

// الاحتفاظ بالنواة الأساسية
const BASE_DB: ProverbData[] = [
  { text: "الطيور على أشكالها", completions: { correct: "تقع", wrong: ["تطير", "تأكل", "تمشي"] }, type: 'proverb', difficulty: 0 },
  { text: "أعط الخباز خبزه ولو أكل", completions: { correct: "نصفه", wrong: ["كله", "ربعه", "ثلثه"] }, type: 'proverb', difficulty: 0 },
  { text: "السكوت علامة", completions: { correct: "الرضا", wrong: ["الغضب", "الخوف", "الحزن"] }, type: 'wisdom', difficulty: 0 },
  { text: "من جد وجد، ومن زرع", completions: { correct: "حصد", wrong: ["أكل", "جمع", "نجح"] }, type: 'wisdom', difficulty: 0 },
  { text: "العتب على", completions: { correct: "النظر", wrong: ["السمع", "القلب", "الفهم"] }, type: 'proverb', difficulty: 0 },
  { text: "من طلب العلا سهر", completions: { correct: "الليالي", wrong: ["النهار", "طويلاً", "الفجر"] }, type: 'wisdom', difficulty: 0 },
  { text: "تاج المروءة", completions: { correct: "التواضع", wrong: ["العلم", "المال", "النسب"] }, type: 'wisdom', difficulty: 2 },
  { text: "آفة العلم", completions: { correct: "النسيان", wrong: ["الغرور", "الكبر", "التكبر"] }, type: 'wisdom', difficulty: 2, situation: { text: "يقال لمن ينسى ما يحفظ", wrongProverbs: ["الوقت كالسيف", "من جد وجد", "مصائب قوم عند قوم"] } },
  { text: "تجري الرياح بما لا تشتهي", completions: { correct: "السفن", wrong: ["الأمواج", "الأسماك", "الطيور"] }, type: 'proverb', difficulty: 1 },
  { text: "إذا كان الكلام من فضة فالسكوت من", completions: { correct: "ذهب", wrong: ["نحاس", "ألماس", "حديد"] }, type: 'proverb', difficulty: 0 },
  { text: "الوقت كالسيف إن لم تقطعه", completions: { correct: "قطعك", wrong: ["كسرك", "رحل", "ضرك"] }, type: 'wisdom', difficulty: 0 },
  { text: "الصبر مفتاح", completions: { correct: "الفرج", wrong: ["النجاح", "الكسب", "الحياة"] }, type: 'wisdom', difficulty: 0 },
  { text: "درهم وقاية خير من قنطار", completions: { correct: "علاج", wrong: ["دواء", "ذهب", "مرض"] }, type: 'wisdom', difficulty: 0 },
  { text: "الحاجة أم", completions: { correct: "الاختراع", wrong: ["الصناعة", "التفكير", "الإبداع"] }, type: 'wisdom', difficulty: 1 },
  { text: "عادت حليمة لعادتها", completions: { correct: "القديمة", wrong: ["السيئة", "الجديدة", "الطيبة"] }, type: 'proverb', difficulty: 1 },
  { text: "طبخ المطبوخ لا", completions: { correct: "يبوخ", wrong: ["ينفع", "يفسد", "يؤكل"] }, type: 'proverb', difficulty: 2 },
  { text: "أول الرقص", completions: { correct: "حنجلة", wrong: ["خطوة", "فرح", "موسيقى"] }, type: 'proverb', difficulty: 2 },
  { text: "حبل الكذب", completions: { correct: "قصير", wrong: ["مقطوع", "طويل", "ضعيف"] }, type: 'proverb', difficulty: 0 },
  { text: "أبطأ من", completions: { correct: "سلحفاة", wrong: ["نملة", "حلزون", "قنفذ"] }, type: 'proverb', difficulty: 1 },
  { text: "البعيد عن العين بعيد عن", completions: { correct: "القلب", wrong: ["الذاكرة", "الفكر", "البال"] }, type: 'proverb', difficulty: 0 },
  { text: "الغاية تبرر", completions: { correct: "الوسيلة", wrong: ["العمل", "الطريقة", "النتيجة"] }, type: 'wisdom', difficulty: 1 },
  { text: "في التأني السلامة وفي العجلة", completions: { correct: "الندامة", wrong: ["الخسارة", "السقوط", "الخطأ"] }, type: 'wisdom', difficulty: 0 },
  { text: "يد واحدة لا", completions: { correct: "تصفق", wrong: ["تعمل", "تبني", "تكتب"] }, type: 'proverb', difficulty: 0 },
  { text: "الصديق وقت", completions: { correct: "الضيق", wrong: ["الحاجة", "السعة", "الفرح"] }, type: 'proverb', difficulty: 0 }
];

// دمج كل الأمثال
export const RAW_DB = [
  ...BASE_DB,
  ...IRAQI_PROVERBS,
  ...EGYPTIAN_PROVERBS,
  ...LEVANT_PROVERBS,
  ...GULF_MAGHREB_PROVERBS,
  ...FUSHA_PROVERBS,
  ...WISDOM_PROVERBS,
  ...EGYPTIAN_PROVERBS_2,
  ...IRAQI_PROVERBS_2,
  ...LEVANT_PROVERBS_2,
  ...GULF_PROVERBS_2,
  ...FUSHA_PROVERBS_2,
  ...MEGA_PROVERBS_1,
  ...MEGA_PROVERBS_2,
  ...MEGA_PROVERBS_3,
  ...MEGA_PROVERBS_4,
  ...MEGA_PROVERBS_5,
  ...MEGA_PROVERBS_6,
  ...MEGA_PROVERBS_7,
  ...MEGA_PROVERBS_8,
  ...MEGA_PROVERBS_9,
  ...MEGA_PROVERBS_10,
  ...MEGA_PROVERBS_11,
  ...MEGA_PROVERBS_12,
  ...MEGA_PROVERBS_13,
  ...MEGA_PROVERBS_14,
  ...MEGA_PROVERBS_15,
  ...MEGA_PROVERBS_16,
  ...MEGA_IRAQI,
  ...MEGA_MAGHREB,
  ...MEGA_GULF,
  ...MEGA_LEVANT,
  ...MEGA_POETRY,
  ...MEGA_FUNNY,
  ...MEGA_ARABIC_HERITAGE,
  ...MEGA_EGYPTIAN
];

// فلترة التكرار بشكل حازم
const seen = new Set<string>();
export const PROVERBS_DB: ProverbData[] = [];

for (const p of RAW_DB) {
  // توحيد الحروف للبحث عن التكرار
  const normalized = p.text.trim().toLowerCase()
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[يى]/g, 'ي');
    
  if (!seen.has(normalized)) {
    seen.add(normalized);
    PROVERBS_DB.push(p);
  }
}

export function generateProverbQuestions(count: number = 20) {
  const generated: any[] = [];
  const styles = ['complete_last', 'find_situation', 'find_proverb'];
  
  const pool = [...PROVERBS_DB].sort(() => 0.5 - Math.random());
  
  let attempts = 0;
  let lastCategory = '';
  
  while(generated.length < count && attempts < 5000) {
    const item = pool[attempts % pool.length];
    
    // منع تكرار نفس الفئة بشكل متتالي
    if (item.type === lastCategory && attempts > 0 && attempts % pool.length !== 0) {
        attempts++;
        continue;
    }

    const style = styles[Math.floor(Math.random() * styles.length)];
    attempts++;

    // النمط الأول: أكمل الكلمة
    if (style === 'complete_last') {
        const textStr = item.text + " ...";
        const options = [item.completions.correct, ...item.completions.wrong].sort(() => 0.5 - Math.random());
        generated.push({
            type: 'complete_last',
            text: textStr,
            options,
            correctAnswer: item.completions.correct,
            difficulty: item.difficulty,
            category: item.type
        });
        lastCategory = item.type;
    }
    // النمط الثاني: ابحث عن الموقف
    else if (style === 'find_situation' && item.situation) {
        const textStr = 'ما هو المثل المناسب للموقف التالي: "' + item.situation.text + '"؟';
        const fullProverb = item.text + " " + item.completions.correct;
        const options = [fullProverb, ...item.situation.wrongProverbs].sort(() => 0.5 - Math.random());
        generated.push({
            type: 'find_situation',
            text: textStr,
            options,
            correctAnswer: fullProverb,
            difficulty: item.difficulty,
            category: item.type
        });
        lastCategory = item.type;
    }
    // النمط الثالث: اختيار المثل الصحيح
    else if (style === 'find_proverb') {
        const textStr = "أي من هذه الأمثال / الحكم هو الصحيح؟";
        const fullProverb = item.text + " " + item.completions.correct;
        const wrongProverbs = item.completions.wrong.map((w: string) => item.text + " " + w);
        const options = [fullProverb, ...wrongProverbs].slice(0, 4).sort(() => 0.5 - Math.random());
        
        generated.push({
            type: 'find_proverb',
            text: textStr,
            options,
            correctAnswer: fullProverb,
            difficulty: item.difficulty,
            category: item.type
        });
        lastCategory = item.type;
    }
  }

  // Unique questions only
  const uniqueQs = generated.filter((v, i, a) => a.findIndex(t => (t.text === v.text)) === i);
  return uniqueQs.slice(0, count);
}

export type { ProverbData };
