import { RawQuestion } from './megaUtils';

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateTemplated(templates: Array<() => RawQuestion>, count: number): RawQuestion[] {
  const qs: RawQuestion[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  
  while (qs.length < count && attempts < count * 20) {
    attempts++;
    const template = templates[rnd(0, templates.length - 1)];
    const q = template();
    if (!seen.has(q.text)) {
      seen.add(q.text);
      qs.push(q);
    }
  }
  return qs;
}

// --- MATH (New Category) ---
const mathTemplates = [
  () => {
    const a = rnd(10, 500); const b = rnd(10, 500);
    return { text: `ما هو ناتج جمع ${a} + ${b}؟`, correctAnswer: `${a+b}`, wrongOptions: [`${a+b+10}`, `${Math.max(1, a+b-5)}`, `${a+b+1}`] };
  },
  () => {
    const a = rnd(50, 900); const b = rnd(10, a - 1);
    return { text: `ما هو ناتج طرح ${a} - ${b}؟`, correctAnswer: `${a-b}`, wrongOptions: [`${a-b+10}`, `${a-b-10}`, `${a-b+1}`] };
  },
  () => {
    const a = rnd(10, 200); const b = rnd(2, 20);
    return { text: `كم يساوي حاصل ضرب ${a} × ${b}؟`, correctAnswer: `${a*b}`, wrongOptions: [`${a*b+a}`, `${a*b-b}`, `${a*b+20}`] };
  },
  () => {
    const b = rnd(2, 20); const res = rnd(5, 100); const a = res * b;
    return { text: `ما هو ناتج قسمة ${a} ÷ ${b}؟`, correctAnswer: `${res}`, wrongOptions: [`${res+1}`, `${Math.max(1, res-2)}`, `${res+5}`] };
  },
  () => {
    const a = rnd(15, 300);
    return { text: `كم عدد الأيام في ${a} أسبوعاً؟`, correctAnswer: `${a*7}`, wrongOptions: [`${a*7+7}`, `${a*7-1}`, `${a*7+1}`] };
  },
  () => {
    const a = rnd(10, 150);
    return { text: `كم عدد الأشهر في ${a} سنة؟`, correctAnswer: `${a*12}`, wrongOptions: [`${a*12+12}`, `${a*10}`, `${a*12-1}`] };
  },
  () => {
    const h = rnd(2, 72);
    return { text: `كم دقيقة توجد في ${h} ساعات؟`, correctAnswer: `${h*60}`, wrongOptions: [`${h*60+30}`, `${h*60-15}`, `${h*60+60}`] };
  }
];

// --- GENERAL KNOWLEDGE ---
const COUNTRIES = [
  { c: 'السعودية', cap: 'الرياض', curr: 'الريال' }, { c: 'مصر', cap: 'القاهرة', curr: 'الجنيه' },
  { c: 'اليابان', cap: 'طوكيو', curr: 'الين' }, { c: 'فرنسا', cap: 'باريس', curr: 'اليورو' },
  { c: 'البرازيل', cap: 'برازيليا', curr: 'الريال' }, { c: 'الصين', cap: 'بكين', curr: 'اليوان' },
  { c: 'الولايات المتحدة', cap: 'واشنطن', curr: 'الدولار' }, { c: 'بريطانيا', cap: 'لندن', curr: 'الجنيه الإسترليني' },
  { c: 'روسيا', cap: 'موسكو', curr: 'الروبل' }, { c: 'إيطاليا', cap: 'روما', curr: 'اليورو' }
];
const generalTemplates = [
  () => {
    const item = COUNTRIES[rnd(0, COUNTRIES.length-1)];
    const wrongs = COUNTRIES.filter(c => c.cap !== item.cap).map(c => c.cap);
    return { text: `ما هي عاصمة ${item.c}؟`, correctAnswer: item.cap, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = COUNTRIES[rnd(0, COUNTRIES.length-1)];
    const wrongs = COUNTRIES.filter(c => c.curr !== item.curr).map(c => c.curr);
    return { text: `ما هي العملة الرسمية في ${item.c}؟`, correctAnswer: item.curr, wrongOptions: [...new Set(wrongs)].sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = COUNTRIES[rnd(0, COUNTRIES.length-1)];
    const wrongs = COUNTRIES.filter(c => c.c !== item.c).map(c => c.c);
    return { text: `مدينة ${item.cap} هي عاصمة أي دولة؟`, correctAnswer: item.c, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];

// --- SCIENCE ---
const ELEMENTS = [
  { sym: 'O', name: 'الأكسجين', num: 8 }, { sym: 'H', name: 'الهيدروجين', num: 1 },
  { sym: 'N', name: 'النيتروجين', num: 7 }, { sym: 'C', name: 'الكربون', num: 6 },
  { sym: 'Fe', name: 'الحديد', num: 26 }, { sym: 'He', name: 'الهيليوم', num: 2 },
  { sym: 'Na', name: 'الصوديوم', num: 11 }, { sym: 'Au', name: 'الذهب', num: 79 }
];
const scienceTemplates = [
  () => {
    const item = ELEMENTS[rnd(0, ELEMENTS.length-1)];
    const wrongs = ELEMENTS.filter(e => e.sym !== item.sym).map(e => e.sym);
    return { text: `ما هو الرمز الكيميائي لعنصر ${item.name}؟`, correctAnswer: item.sym, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = ELEMENTS[rnd(0, ELEMENTS.length-1)];
    const wrongs = ELEMENTS.filter(e => e.name !== item.name).map(e => e.name);
    return { text: `ما هو العنصر الذي يرمز له بـ ${item.sym}؟`, correctAnswer: item.name, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = ELEMENTS[rnd(0, ELEMENTS.length-1)];
    return { text: `كم يبلغ العدد الذري لعنصر ${item.name}؟`, correctAnswer: `${item.num}`, wrongOptions: [`${item.num+1}`, `${item.num+5}`, `${item.num-1 || 2}`] };
  }
];

// --- FOOTBALL ---
const CLUBS = [
  { n: 'ريال مدريد', c: 'إسبانيا', cl: 15 }, { n: 'برشلونة', c: 'إسبانيا', cl: 5 },
  { n: 'ميلان', c: 'إيطاليا', cl: 7 }, { n: 'بايرن ميونخ', c: 'ألمانيا', cl: 6 },
  { n: 'ليفربول', c: 'إنجلترا', cl: 6 }, { n: 'مانشستر يونايتد', c: 'إنجلترا', cl: 3 }
];
const footballTemplates = [
  () => {
    const item = CLUBS[rnd(0, CLUBS.length-1)];
    const wrongs = ['إنجلترا', 'إسبانيا', 'إيطاليا', 'ألمانيا', 'فرنسا'].filter(c => c !== item.c);
    return { text: `في أي دولة يلعب نادي ${item.n}؟`, correctAnswer: item.c, wrongOptions: wrongs.slice(0,3) };
  },
  () => {
    const item = CLUBS[rnd(0, CLUBS.length-1)];
    return { text: `كم عدد ألقاب نادي ${item.n} في دوري أبطال أوروبا (تقريباً / حتى 2024)؟`, correctAnswer: `${item.cl}`, wrongOptions: [`${item.cl+1}`, `${item.cl+2}`, `${item.cl-1 || 0}`] };
  },
  () => {
    const item = CLUBS[rnd(0, CLUBS.length-1)];
    const wrongs = CLUBS.filter(c => c.n !== item.n).map(c => c.n);
    return { text: `أي من هذه الأندية يمتلك ${item.cl} ألقاب في دوري أبطال أوروبا وقادم من ${item.c}؟`, correctAnswer: item.n, wrongOptions: wrongs.slice(0,3) };
  }
];

// --- MOVIES ---
const MOVIES = [
  { m: 'Inception', d: 'كريستوفر نولان', y: 2010 }, { m: 'Titanic', d: 'جيمس كاميرون', y: 1997 },
  { m: 'Avatar', d: 'جيمس كاميرون', y: 2009 }, { m: 'The Godfather', d: 'فرانسيس فورد كوبولا', y: 1972 },
  { m: 'Pulp Fiction', d: 'كوينتن تارانتينو', y: 1994 }, { m: 'Interstellar', d: 'كريستوفر نولان', y: 2014 }
];
const moviesTemplates = [
  () => {
    const item = MOVIES[rnd(0, MOVIES.length-1)];
    const wrongs = [...new Set(MOVIES.filter(m => m.d !== item.d).map(m => m.d))];
    return { text: `من هو مخرج فيلم ${item.m}؟`, correctAnswer: item.d, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = MOVIES[rnd(0, MOVIES.length-1)];
    return { text: `في أي عام صدر فيلم ${item.m}؟`, correctAnswer: `${item.y}`, wrongOptions: [`${item.y+1}`, `${item.y-2}`, `${item.y+5}`] };
  }
];

// --- ANIME ---
const ANIMES = [
  { a: 'One Piece', p: 'لوفي', c: 'قراصنة' }, { a: 'Naruto', p: 'ناروتو', c: 'نينجا' },
  { a: 'Attack on Titan', p: 'إيرين', c: 'عمالقة' }, { a: 'Death Note', p: 'لايت', c: 'ذكاء وتحقيق' },
  { a: 'Demon Slayer', p: 'تانجيرو', c: 'قتلة شياطين' }, { a: 'Dragon Ball', p: 'غوكو', c: 'فنون قتالية' }
];
const animeTemplates = [
  () => {
    const item = ANIMES[rnd(0, ANIMES.length-1)];
    const wrongs = ANIMES.filter(a => a.p !== item.p).map(a => a.p);
    return { text: `من هو بطل أنمي ${item.a}؟`, correctAnswer: item.p, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = ANIMES[rnd(0, ANIMES.length-1)];
    const wrongs = ANIMES.filter(a => a.c !== item.c).map(a => a.c);
    return { text: `ما هو التصنيف الأساسي لعالم أنمي ${item.a}؟`, correctAnswer: item.c, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];

// --- HISTORY ---
const EVENTS = [
  { e: 'الحرب العالمية الأولى', sy: 1914, ey: 1918 }, { e: 'الحرب العالمية الثانية', sy: 1939, ey: 1945 },
  { e: 'سقوط الأندلس', sy: 1492, ey: 1492 }, { e: 'فتح القسطنطينية', sy: 1453, ey: 1453 }
];
const historyTemplates = [
  () => {
    const item = EVENTS[rnd(0, EVENTS.length-1)];
    return { text: `في أي عام بدأت ${item.e}؟`, correctAnswer: `${item.sy}`, wrongOptions: [`${item.sy+10}`, `${item.sy-5}`, `${item.sy+2}`] };
  },
  () => {
    const item = EVENTS.filter(e => e.sy !== e.ey)[rnd(0, 1)]; // WW1 or WW2
    return { text: `متى انتهت ${item.e}؟`, correctAnswer: `${item.ey}`, wrongOptions: [`${item.ey+3}`, `${item.ey-2}`, `${item.ey+5}`] };
  }
];

// --- ISLAMIC ---
const ISLAMIC = [
  { s: 'البقرة', a: 286 }, { s: 'آل عمران', a: 200 }, { s: 'النساء', a: 176 }, { s: 'الكوثر', a: 3 }
];
const islamicTemplates = [
  () => {
    const item = ISLAMIC[rnd(0, ISLAMIC.length-1)];
    return { text: `كم عدد آيات سورة ${item.s}؟`, correctAnswer: `${item.a}`, wrongOptions: [`${item.a+5}`, `${item.a-2}`, `${item.a+10}`] };
  },
  () => {
    const pillars = ['شهادة أن لا إله إلا الله', 'إقامة الصلاة', 'إيتاء الزكاة', 'صوم رمضان', 'حج البيت'];
    const p = pillars[rnd(0, pillars.length-1)];
    const wrongs = ['بر الوالدين', 'الجهاد', 'طلب العلم', 'قراءة القرآن'].sort(()=>0.5-Math.random());
    return { text: `أي من التالي يعتبر من أركان الإسلام الخمسة؟`, correctAnswer: p, wrongOptions: wrongs.slice(0,3) };
  }
];

// Exports
export function getDynamicMath(count: number): RawQuestion[] {
  return generateTemplated(mathTemplates, count);
}
export function getDynamicGeneral(count: number): RawQuestion[] {
  return generateTemplated(generalTemplates, count);
}
export function getDynamicScience(count: number): RawQuestion[] {
  return generateTemplated(scienceTemplates, count);
}
export function getDynamicFootball(count: number): RawQuestion[] {
  return generateTemplated(footballTemplates, count);
}
export function getDynamicMovies(count: number): RawQuestion[] {
  return generateTemplated(moviesTemplates, count);
}
export function getDynamicAnime(count: number): RawQuestion[] {
  return generateTemplated(animeTemplates, count);
}
export function getDynamicHistory(count: number): RawQuestion[] {
  return generateTemplated(historyTemplates, count);
}
export function getDynamicIslamic(count: number): RawQuestion[] {
  return generateTemplated(islamicTemplates, count);
}
