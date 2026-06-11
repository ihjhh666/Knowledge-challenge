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
  { c: 'روسيا', cap: 'موسكو', curr: 'الروبل' }, { c: 'إيطاليا', cap: 'روما', curr: 'اليورو' },
  { c: 'ألمانيا', cap: 'برلين', curr: 'اليورو' }, { c: 'إسبانيا', cap: 'مدريد', curr: 'اليورو' },
  { c: 'كندا', cap: 'أوتاوا', curr: 'الدولار' }, { c: 'أستراليا', cap: 'كانبرا', curr: 'الدولار' },
  { c: 'الهند', cap: 'نيودلهي', curr: 'الروبية' }, { c: 'المكسيك', cap: 'مكسيكو سيتي', curr: 'البيزو' },
  { c: 'الأرجنتين', cap: 'بوينس آيرس', curr: 'البيزو' }, { c: 'تركيا', cap: 'أنقرة', curr: 'الليرة' },
  { c: 'كوريا الجنوبية', cap: 'سيول', curr: 'الوون' }, { c: 'إندونيسيا', cap: 'جاكرتا', curr: 'الروبية' },
  { c: 'العراق', cap: 'بغداد', curr: 'الدينار' }, { c: 'المغرب', cap: 'الرباط', curr: 'الدرهم' },
  { c: 'الجزائر', cap: 'الجزائر', curr: 'الدينار' }, { c: 'الإمارات', cap: 'أبو ظبي', curr: 'الدرهم' },
  { c: 'قطر', cap: 'الدوحة', curr: 'الريال' }, { c: 'الأردن', cap: 'عمان', curr: 'الدينار' },
  { c: 'الكويت', cap: 'الكويت', curr: 'الدينار' }, { c: 'تونس', cap: 'تونس', curr: 'الدينار' },
  { c: 'عمان', cap: 'مسقط', curr: 'الريال' }, { c: 'سوريا', cap: 'دمشق', curr: 'الليرة' }
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
  { sym: 'Na', name: 'الصوديوم', num: 11 }, { sym: 'Au', name: 'الذهب', num: 79 },
  { sym: 'Ag', name: 'الفضة', num: 47 }, { sym: 'Cu', name: 'النحاس', num: 29 },
  { sym: 'Cl', name: 'الكلور', num: 17 }, { sym: 'Ca', name: 'الكالسيوم', num: 20 },
  { sym: 'K', name: 'البوتاسيوم', num: 19 }, { sym: 'Mg', name: 'المغنيسيوم', num: 12 },
  { sym: 'P', name: 'الفوسفور', num: 15 }, { sym: 'S', name: 'الكبريت', num: 16 },
  { sym: 'Zn', name: 'الزنك', num: 30 }, { sym: 'I', name: 'اليود', num: 53 },
  { sym: 'Pb', name: 'الرصاص', num: 82 }, { sym: 'Hg', name: 'الزئبق', num: 80 },
  { sym: 'U', name: 'اليورانيوم', num: 92 }, { sym: 'Ti', name: 'التيتانيوم', num: 22 },
  { sym: 'Si', name: 'السيليكون', num: 14 }, { sym: 'Al', name: 'الألمنيوم', num: 13 }
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
  { n: 'أتلتيكو مدريد', c: 'إسبانيا', cl: 0 }, { n: 'فالنسيا', c: 'إسبانيا', cl: 0 },
  { n: 'إشبيلية', c: 'إسبانيا', cl: 0 }, { n: 'فياريال', c: 'إسبانيا', cl: 0 },
  { n: 'أتلتيك بيلباو', c: 'إسبانيا', cl: 0 }, { n: 'ريال سوسيداد', c: 'إسبانيا', cl: 0 },
  { n: 'ميلان', c: 'إيطاليا', cl: 7 }, { n: 'يوفنتوس', c: 'إيطاليا', cl: 2 },
  { n: 'إنتر ميلان', c: 'إيطاليا', cl: 3 }, { n: 'روما', c: 'إيطاليا', cl: 0 },
  { n: 'نابولي', c: 'إيطاليا', cl: 0 }, { n: 'لاتسيو', c: 'إيطاليا', cl: 0 },
  { n: 'فيورنتينا', c: 'إيطاليا', cl: 0 }, { n: 'أتالانتا', c: 'إيطاليا', cl: 0 },
  { n: 'بايرن ميونخ', c: 'ألمانيا', cl: 6 }, { n: 'بروسيا دورتموند', c: 'ألمانيا', cl: 1 },
  { n: 'باير ليفركوزن', c: 'ألمانيا', cl: 0 }, { n: 'لايبزيج', c: 'ألمانيا', cl: 0 },
  { n: 'شالكه', c: 'ألمانيا', cl: 0 }, { n: 'آينتراخت فرانكفورت', c: 'ألمانيا', cl: 0 },
  { n: 'ليفربول', c: 'إنجلترا', cl: 6 }, { n: 'مانشستر يونايتد', c: 'إنجلترا', cl: 3 },
  { n: 'تشيلسي', c: 'إنجلترا', cl: 2 }, { n: 'أرسنال', c: 'إنجلترا', cl: 0 },
  { n: 'مانشستر سيتي', c: 'إنجلترا', cl: 1 }, { n: 'توتنهام', c: 'إنجلترا', cl: 0 },
  { n: 'أستون فيلا', c: 'إنجلترا', cl: 1 }, { n: 'نوتنغهام فورست', c: 'إنجلترا', cl: 2 },
  { n: 'نيوكاسل يونايتد', c: 'إنجلترا', cl: 0 }, { n: 'إيفرتون', c: 'إنجلترا', cl: 0 },
  { n: 'وست هام يونايتد', c: 'إنجلترا', cl: 0 }, { n: 'ليستر سيتي', c: 'إنجلترا', cl: 0 },
  { n: 'أياكس', c: 'هولندا', cl: 4 }, { n: 'آيندهوفن', c: 'هولندا', cl: 1 },
  { n: 'فينورد', c: 'هولندا', cl: 1 }, { n: 'بورتو', c: 'البرتغال', cl: 2 },
  { n: 'بنفيكا', c: 'البرتغال', cl: 2 }, { n: 'سبورتينغ لشبونة', c: 'البرتغال', cl: 0 },
  { n: 'مارسيليا', c: 'فرنسا', cl: 1 }, { n: 'باريس سان جيرمان', c: 'فرنسا', cl: 0 },
  { n: 'ليون', c: 'فرنسا', cl: 0 }, { n: 'موناكو', c: 'فرنسا', cl: 0 },
  { n: 'ليل', c: 'فرنسا', cl: 0 }, { n: 'النجم الأحمر', c: 'صربيا', cl: 1 }, 
  { n: 'ستيوا بوخارست', c: 'رومانيا', cl: 1 }, { n: 'سيلتيك', c: 'إسكتلندا', cl: 1 },
  { n: 'رينجرز', c: 'إسكتلندا', cl: 0 }, { n: 'غلطة سراي', c: 'تركيا', cl: 0 },
  { n: 'فنربخشة', c: 'تركيا', cl: 0 }, { n: 'بشيكتاش', c: 'تركيا', cl: 0 },
  { n: 'أندرلخت', c: 'بلجيكا', cl: 0 }, { n: 'كلوب بروج', c: 'بلجيكا', cl: 0 },
  { n: 'أولمبياكوس', c: 'اليونان', cl: 0 }, { n: 'باناثينايكوس', c: 'اليونان', cl: 0 }
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
  { m: 'Pulp Fiction', d: 'كوينتن تارانتينو', y: 1994 }, { m: 'Interstellar', d: 'كريستوفر نولان', y: 2014 },
  { m: 'The Dark Knight', d: 'كريستوفر نولان', y: 2008 }, { m: 'Forrest Gump', d: 'روبرت زيميكس', y: 1994 },
  { m: 'The Matrix', d: 'الأخوات واشوسكي', y: 1999 }, { m: 'Goodfellas', d: 'مارتن سكورسيزي', y: 1990 },
  { m: "Schindler's List", d: 'ستيفن سبيلبرغ', y: 1993 }, { m: 'Fight Club', d: 'ديفيد فينشر', y: 1999 },
  { m: 'The Lord of the Rings: The Return of the King', d: 'بيتر جاكسون', y: 2003 },
  { m: 'Star Wars: Episode IV', d: 'جورج لوكاس', y: 1977 }, { m: 'Gladiator', d: 'ريدلي سكوت', y: 2000 },
  { m: 'The Shawshank Redemption', d: 'فرانك دارابونت', y: 1994 }, { m: 'Jurassic Park', d: 'ستيفن سبيلبرغ', y: 1993 },
  { m: 'Inglourious Basterds', d: 'كوينتن تارانتينو', y: 2009 }, { m: 'Se7en', d: 'ديفيد فينشر', y: 1995 }
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
  { a: 'Attack on Titan', p: 'إيرين', c: 'عمالقة' }, { a: 'Death Note', p: 'لايت', c: 'الغموض والتحقيق' },
  { a: 'Demon Slayer', p: 'تانجيرو', c: 'قتلة شياطين' }, { a: 'Dragon Ball', p: 'غوكو', c: 'فنون قتالية' },
  { a: 'Hunter x Hunter', p: 'غون', c: 'صيادين' }, { a: 'Bleach', p: 'إيتشيغو', c: 'شينيغامي (حاصدي أرواح)' },
  { a: 'My Hero Academia', p: 'ميدوريا', c: 'أبطال خارقين' }, { a: 'Fullmetal Alchemist', p: 'إدوارد', c: 'خيمياء' },
  { a: 'Tokyo Ghoul', p: 'كانيكي', c: 'غيلان' }, { a: 'Sword Art Online', p: 'كيريتو', c: 'عالم افتراضي' },
  { a: 'Jujutsu Kaisen', p: 'يوجي إيتادوري', c: 'لعنات وسحر' }, { a: 'Black Clover', p: 'أستا', c: 'سحر وفرسان' },
  { a: 'Fairy Tail', p: 'ناتسو', c: 'نقابات السحر' }, { a: 'Tokyo Revengers', p: 'تاكيميتشي', c: 'عصابات وسفر بالزمن' }
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
  { e: 'سقوط الأندلس', sy: 1492, ey: 1492 }, { e: 'فتح القسطنطينية', sy: 1453, ey: 1453 },
  { e: 'الثورة الفرنسية', sy: 1789, ey: 1799 }, { e: 'الثورة الروسية', sy: 1917, ey: 1923 },
  { e: 'اكتشاف أمريكا', sy: 1492, ey: 1492 }, { e: 'بداية الحرب الباردة', sy: 1947, ey: 1991 },
  { e: 'توحيد المملكة العربية السعودية', sy: 1932, ey: 1932 }, { e: 'نهاية الحرب الباردة وسقوط الاتحاد السوفيتي', sy: 1991, ey: 1991 },
  { e: 'هبوط الإنسان على القمر', sy: 1969, ey: 1969 }, { e: 'تأسيس الأمم المتحدة', sy: 1945, ey: 1945 },
  { e: 'معركة حطين', sy: 1187, ey: 1187 }, { e: 'معركة عين جالوت', sy: 1260, ey: 1260 },
  { e: 'حملة نابليون على مصر', sy: 1798, ey: 1801 }
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
  { s: 'البقرة', a: 286 }, { s: 'آل عمران', a: 200 }, { s: 'النساء', a: 176 }, { s: 'الكوثر', a: 3 },
  { s: 'الفاتحة', a: 7 }, { s: 'المائدة', a: 120 }, { s: 'الأنفال', a: 75 }, { s: 'الإخلاص', a: 4 },
  { s: 'الفلق', a: 5 }, { s: 'الناس', a: 6 }, { s: 'الرحمن', a: 78 }, { s: 'الكهف', a: 110 },
  { s: 'يوسف', a: 111 }, { s: 'يس', a: 83 }, { s: 'الملك', a: 30 }, { s: 'الواقعة', a: 96 }
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
