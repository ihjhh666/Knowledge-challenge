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
  },
  () => {
    const m = rnd(1, 50); const t = m * 60;
    return { text: `ثانية، كم دقيقة تعادل ${t}؟`, correctAnswer: `${m}`, wrongOptions: [`${m+10}`, `${Math.max(1, m-5)}`, `${m+5}`] };
  },
  () => {
    const base = rnd(2, 12); const exp = rnd(2, 3);
    return { text: `ما هو ناتج ${base} أس ${exp}؟`, correctAnswer: `${Math.pow(base, exp)}`, wrongOptions: [`${Math.pow(base, exp)+base}`, `${Math.pow(base, exp)-1}`, `${base*exp}`] };
  },
  () => {
    const n = rnd(5, 20); const sq = n * n;
    return { text: `ما هو الجذر التربيعي للعدد ${sq}؟`, correctAnswer: `${n}`, wrongOptions: [`${n+1}`, `${n-2}`, `${n+5}`] };
  },
  () => {
    const x = rnd(2, 15); const y = rnd(3, 10); const c = rnd(5, 50); const sum = (x * y) + c;
    return { text: `حل المعادلة: ${x}س + ${c} = ${sum}، س تساوي؟`, correctAnswer: `${y}`, wrongOptions: [`${y+1}`, `${y+2}`, `${Math.max(1, y-1)}`] };
  },
  () => {
    const per = rnd(10, 90); const val = rnd(100, 1000); const res = (per/100) * val;
    return { text: `كم يساوي ${per}٪ من ${val}؟`, correctAnswer: `${res}`, wrongOptions: [`${res+10}`, `${res-10}`, `${res+50}`] };
  }
];

// --- GENERAL KNOWLEDGE ---

const COUNTRIES = [
  { c: 'السعودية', cap: 'الرياض', curr: 'الريال', cont: 'آسيا' }, { c: 'مصر', cap: 'القاهرة', curr: 'الجنيه', cont: 'أفريقيا' },
  { c: 'اليابان', cap: 'طوكيو', curr: 'الين', cont: 'آسيا' }, { c: 'فرنسا', cap: 'باريس', curr: 'اليورو', cont: 'أوروبا' },
  { c: 'البرازيل', cap: 'برازيليا', curr: 'الريال', cont: 'أمريكا الجنوبية' }, { c: 'الصين', cap: 'بكين', curr: 'اليوان', cont: 'آسيا' },
  { c: 'الولايات المتحدة', cap: 'واشنطن', curr: 'الدولار', cont: 'أمريكا الشمالية' }, { c: 'بريطانيا', cap: 'لندن', curr: 'الجنيه الإسترليني', cont: 'أوروبا' },
  { c: 'روسيا', cap: 'موسكو', curr: 'الروبل', cont: 'آسيا/أوروبا' }, { c: 'إيطاليا', cap: 'روما', curr: 'اليورو', cont: 'أوروبا' },
  { c: 'ألمانيا', cap: 'برلين', curr: 'اليورو', cont: 'أوروبا' }, { c: 'إسبانيا', cap: 'مدريد', curr: 'اليورو', cont: 'أوروبا' },
  { c: 'كندا', cap: 'أوتاوا', curr: 'الدولار', cont: 'أمريكا الشمالية' }, { c: 'أستراليا', cap: 'كانبرا', curr: 'الدولار', cont: 'أستراليا' },
  { c: 'الهند', cap: 'نيودلهي', curr: 'الروبية', cont: 'آسيا' }, { c: 'المكسيك', cap: 'مكسيكو سيتي', curr: 'البيزو', cont: 'أمريكا الشمالية' },
  { c: 'الأرجنتين', cap: 'بوينس آيرس', curr: 'البيزو', cont: 'أمريكا الجنوبية' }, { c: 'تركيا', cap: 'أنقرة', curr: 'الليرة', cont: 'آسيا/أوروبا' },
  { c: 'كوريا الجنوبية', cap: 'سيول', curr: 'الوون', cont: 'آسيا' }, { c: 'إندونيسيا', cap: 'جاكرتا', curr: 'الروبية', cont: 'آسيا' },
  { c: 'العراق', cap: 'بغداد', curr: 'الدينار', cont: 'آسيا' }, { c: 'المغرب', cap: 'الرباط', curr: 'الدرهم', cont: 'أفريقيا' },
  { c: 'الجزائر', cap: 'الجزائر', curr: 'الدينار', cont: 'أفريقيا' }, { c: 'الإمارات', cap: 'أبو ظبي', curr: 'الدرهم', cont: 'آسيا' },
  { c: 'قطر', cap: 'الدوحة', curr: 'الريال', cont: 'آسيا' }, { c: 'الأردن', cap: 'عمان', curr: 'الدينار', cont: 'آسيا' },
  { c: 'الكويت', cap: 'الكويت', curr: 'الدينار', cont: 'آسيا' }, { c: 'تونس', cap: 'تونس', curr: 'الدينار', cont: 'أفريقيا' },
  { c: 'عمان', cap: 'مسقط', curr: 'الريال', cont: 'آسيا' }, { c: 'سوريا', cap: 'دمشق', curr: 'الليرة', cont: 'آسيا' },
  { c: 'اليمن', cap: 'صنعاء', curr: 'الريال', cont: 'آسيا' }, { c: 'فلسطين', cap: 'القدس', curr: 'الجنيه/الدينار', cont: 'آسيا' },
  { c: 'لبنان', cap: 'بيروت', curr: 'الليرة', cont: 'آسيا' }, { c: 'ليبيا', cap: 'طرابلس', curr: 'الدينار', cont: 'أفريقيا' },
  { c: 'السودان', cap: 'الخرطوم', curr: 'الجنيه', cont: 'أفريقيا' }, { c: 'جنوب أفريقيا', cap: 'بريتوريا', curr: 'الراند', cont: 'أفريقيا' },
  { c: 'الكاميرون', cap: 'ياوندي', curr: 'الفرنك', cont: 'أفريقيا' }, { c: 'نيجيريا', cap: 'أبوجا', curr: 'النايرا', cont: 'أفريقيا' },
  { c: 'السنغال', cap: 'داكار', curr: 'الفرنك', cont: 'أفريقيا' }, { c: 'فنزويلا', cap: 'كاراكاس', curr: 'البوليفار', cont: 'أمريكا الجنوبية' },
  { c: 'كولومبيا', cap: 'بوغوتا', curr: 'البيزو', cont: 'أمريكا الجنوبية' }, { c: 'بيرو', cap: 'ليما', curr: 'السول', cont: 'أمريكا الجنوبية' },
  { c: 'نيوزيلندا', cap: 'ولينغتون', curr: 'الدولار', cont: 'أستراليا' }, { c: 'سنغافورة', cap: 'سنغافورة', curr: 'الدولار', cont: 'آسيا' },
  { c: 'السويد', cap: 'ستوكهولم', curr: 'الكرونة', cont: 'أوروبا' }, { c: 'النرويج', cap: 'أوسلو', curr: 'الكرونة', cont: 'أوروبا' },
  { c: 'الدنمارك', cap: 'كوبنهاغن', curr: 'الكرونة', cont: 'أوروبا' }, { c: 'سويسرا', cap: 'بيرن', curr: 'الفرنك', cont: 'أوروبا' },
  { c: 'پولندا', cap: 'وارسو', curr: 'الزلوتي', cont: 'أوروبا' }, { c: 'هولندا', cap: 'أمستردام', curr: 'اليورو', cont: 'أوروبا' }
];

const INVENTORS = [
  { i: 'توماس إديسون', m: 'المصباح الكهربائي' }, { i: 'ألكسندر غراهام بيل', m: 'الهاتف' },
  { i: 'الأخوان رايت', m: 'الطائرة' }, { i: 'جولييلمو ماركوني', m: 'الراديو (المذياع)' },
  { i: 'كارل بنز', m: 'السيارة الحديثة' }, { i: 'تشارلز بابيج', m: 'الحاسوب الأول' },
  { i: 'يوهانس غوتنبرغ', m: 'آلة الطباعة' }, { i: 'ألبرت أينشتاين', m: 'النظرية النسبية' },
  { i: 'نيقولا تسلا', m: 'التيار المتردد' }, { i: 'إسحاق نيوتن', m: 'قانون الجاذبية' },
  { i: 'ماري كوري', m: 'النشاط الإشعاعي' }, { i: 'ابن الهيثم', m: 'علم البصريات والكاميرا' }
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
  },
  () => {
    const item = COUNTRIES[rnd(0, COUNTRIES.length-1)];
    const wrongs = ['آسيا', 'أفريقيا', 'أوروبا', 'أمريكا الشمالية', 'أمريكا الجنوبية', 'أستراليا'].filter(c => c !== item.cont);
    return { text: `في أي قارة تقع دولة ${item.c}؟`, correctAnswer: item.cont, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = INVENTORS[rnd(0, INVENTORS.length-1)];
    const wrongs = INVENTORS.filter(i => i.i !== item.i).map(i => i.i);
    return { text: `من هو المخترع (أو العالم) المعروف بـ ${item.m}؟`, correctAnswer: item.i, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = INVENTORS[rnd(0, INVENTORS.length-1)];
    const wrongs = INVENTORS.filter(i => i.m !== item.m).map(i => i.m);
    return { text: `ما هو أبرز اختراع أو اكتشاف اقترن باسم ${item.i}؟`, correctAnswer: item.m, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
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
  { sym: 'Si', name: 'السيليكون', num: 14 }, { sym: 'Al', name: 'الألمنيوم', num: 13 },
  { sym: 'Ne', name: 'النيون', num: 10 }, { sym: 'Ar', name: 'الأرجون', num: 18 },
  { sym: 'Ni', name: 'النيكل', num: 28 }, { sym: 'Co', name: 'الكوبالت', num: 27 },
  { sym: 'Pt', name: 'البلاتين', num: 78 }, { sym: 'Sn', name: 'القصدير', num: 50 },
  { sym: 'Br', name: 'البروم', num: 35 }, { sym: 'Kr', name: 'الكريبون', num: 36 },
  { sym: 'Li', name: 'الليثيوم', num: 3 }, { sym: 'Be', name: 'البريليوم', num: 4 },
  { sym: 'B', name: 'البورون', num: 5 }, { sym: 'F', name: 'الفلور', num: 9 },
  { sym: 'Sc', name: 'السكانديوم', num: 21 }, { sym: 'V', name: 'الفاناديوم', num: 23 },
  { sym: 'Cr', name: 'الكروم', num: 24 }, { sym: 'Mn', name: 'المنغنيز', num: 25 },
  { sym: 'Ga', name: 'الغاليوم', num: 31 }, { sym: 'Ge', name: 'الجرمانيوم', num: 32 },
  { sym: 'As', name: 'الزرنيخ', num: 33 }, { sym: 'Se', name: 'السيلينيوم', num: 34 },
  { sym: 'Rb', name: 'الروبيديوم', num: 37 }, { sym: 'Sr', name: 'السترونتيوم', num: 38 },
  { sym: 'Y', name: 'الإتريوم', num: 39 }, { sym: 'Zr', name: 'الزركونيوم', num: 40 },
  { sym: 'Nb', name: 'النيوبيوم', num: 41 }, { sym: 'Mo', name: 'الموليبدينوم', num: 42 },
  { sym: 'Ru', name: 'الروثينيوم', num: 44 }, { sym: 'Rh', name: 'الروديوم', num: 45 },
  { sym: 'Pd', name: 'البلاديوم', num: 46 }, { sym: 'Cd', name: 'الكادميوم', num: 48 },
  { sym: 'In', name: 'الإنديوم', num: 49 }, { sym: 'Sb', name: 'الأنتيمون', num: 51 },
  { sym: 'Te', name: 'التيلوريوم', num: 52 }, { sym: 'Xe', name: 'الزينون', num: 54 },
  { sym: 'Cs', name: 'السيزيوم', num: 55 }, { sym: 'Ba', name: 'الباريوم', num: 56 },
  { sym: 'W', name: 'التنجستن', num: 74 }, { sym: 'Os', name: 'الأوزميوم', num: 76 },
  { sym: 'Ir', name: 'الإيريديوم', num: 77 }, { sym: 'Tl', name: 'الثاليوم', num: 81 },
  { sym: 'Bi', name: 'البزموت', num: 83 }, { sym: 'Po', name: 'البولونيوم', num: 84 },
  { sym: 'Rn', name: 'الرادون', num: 86 }, { sym: 'Fr', name: 'الفرانسيوم', num: 87 },
  { sym: 'Ra', name: 'الراديوم', num: 88 }, { sym: 'Pu', name: 'البلوتونيوم', num: 94 }
];

const PLANETS = [
  { p: 'عطارد', type: 'صخري' }, { p: 'الزهرة', type: 'صخري' }, { p: 'الأرض', type: 'صخري' }, { p: 'المريخ', type: 'صخري' },
  { p: 'المشتري', type: 'غازي' }, { p: 'زحل', type: 'غازي' }, { p: 'أورانوس', type: 'جليدي' }, { p: 'نبتون', type: 'جليدي' }
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
  },
  () => {
    const item = ELEMENTS[rnd(0, ELEMENTS.length-1)];
    const wrongs = ELEMENTS.filter(e => e.name !== item.name).map(e => e.name);
    return { text: `أي عنصر يمتلك العدد الذري ${item.num}؟`, correctAnswer: item.name, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = PLANETS[rnd(0, PLANETS.length-1)];
    const wrongs = PLANETS.filter(p => p.p !== item.p).map(p => p.p);
    return { text: `أي من كواكب المجموعة الشمسية يعتبر كوكباً ${item.type}اً؟`, correctAnswer: item.p, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];

// --- FOOTBALL ---
const CLUBS = [
  { n: 'ريال مدريد', c: 'إسبانيا', cl: 15, led: 'كارلو أنشيلوتي', st: 'سانتياجو برنابيو' }, { n: 'برشلونة', c: 'إسبانيا', cl: 5, led: 'تشافي/فليك', st: 'كامب نو' },
  { n: 'أتلتيكو مدريد', c: 'إسبانيا', cl: 0, led: 'دييقو سيميوني', st: 'سيفيتاس ميتروبوليتانو' }, { n: 'فالنسيا', c: 'إسبانيا', cl: 0, led: 'روبن باراخا', st: 'ميستايا' },
  { n: 'إشبيلية', c: 'إسبانيا', cl: 0, led: 'كيكي سانشيز', st: 'رامون سانشيز بيزخوان' }, { n: 'فياريال', c: 'إسبانيا', cl: 0, led: 'مارسيلينو', st: 'لا سيراميكا' },
  { n: 'ميلان', c: 'إيطاليا', cl: 7, led: 'بيولي', st: 'سان سيرو' }, { n: 'يوفنتوس', c: 'إيطاليا', cl: 2, led: 'أليغري', st: 'أليانز ستاديوم' },
  { n: 'إنتر ميلان', c: 'إيطاليا', cl: 3, led: 'إنزاجي', st: 'جوزيبي مياتزا' }, { n: 'روما', c: 'إيطاليا', cl: 0, led: 'دي روسي', st: 'الأولمبيكو' },
  { n: 'نابولي', c: 'إيطاليا', cl: 0, led: 'سباليتي/غارسيا', st: 'دييغو مارادونا' }, { n: 'لاتسيو', c: 'إيطاليا', cl: 0, led: 'ساري', st: 'الأولمبيكو' },
  { n: 'بايرن ميونخ', c: 'ألمانيا', cl: 6, led: 'توماس توخيل', st: 'أليانز أرينا' }, { n: 'بروسيا دورتموند', c: 'ألمانيا', cl: 1, led: 'تيرزيتش', st: 'سيغنال إيدونا بارك' },
  { n: 'باير ليفركوزن', c: 'ألمانيا', cl: 0, led: 'تشابي ألونسو', st: 'باي أرينا' }, { n: 'لايبزيج', c: 'ألمانيا', cl: 0, led: 'روز', st: 'ريد بول أرينا' },
  { n: 'ليفربول', c: 'إنجلترا', cl: 6, led: 'يورغن كلوب', st: 'أنفيلد' }, { n: 'مانشستر يونايتد', c: 'إنجلترا', cl: 3, led: 'تين هاج', st: 'أولد ترافورد' },
  { n: 'تشيلسي', c: 'إنجلترا', cl: 2, led: 'بوتشيتينو', st: 'ستامفورد بريدج' }, { n: 'أرسنال', c: 'إنجلترا', cl: 0, led: 'أرتيتا', st: 'الإمارات' },
  { n: 'مانشستر سيتي', c: 'إنجلترا', cl: 1, led: 'جوارديولا', st: 'الاتحاد' }, { n: 'توتنهام', c: 'إنجلترا', cl: 0, led: 'بوستيكوجلو', st: 'توتنهام هوتسبير' },
  { n: 'أستون فيلا', c: 'إنجلترا', cl: 1, led: 'أوناي إيمري', st: 'فيلا بارك' }, { n: 'نيوكاسل يونايتد', c: 'إنجلترا', cl: 0, led: 'إيدي هاو', st: 'سانت جيمس بارك' },
  { n: 'أياكس', c: 'هولندا', cl: 4, led: 'داني بليند', st: 'يوهان كرويف أرينا' }, { n: 'آيندهوفن', c: 'هولندا', cl: 1, led: 'بوش', st: 'فيليبس' },
  { n: 'بورتو', c: 'البرتغال', cl: 2, led: 'كونسيساو', st: 'الدراغاو' }, { n: 'بنفيكا', c: 'البرتغال', cl: 2, led: 'شميت', st: 'النور' },
  { n: 'باريس سان جيرمان', c: 'فرنسا', cl: 0, led: 'لويس إنريكي', st: 'حديقة الأمراء' }, { n: 'ليون', c: 'فرنسا', cl: 0, led: 'غارسا', st: 'غروباما' }
];
const footballTemplates = [
  () => {
    const item = CLUBS[rnd(0, CLUBS.length-1)];
    const wrongs = ['إنجلترا', 'إسبانيا', 'إيطاليا', 'ألمانيا', 'فرنسا', 'البرتغال', 'هولندا', 'تركيا'].filter(c => c !== item.c);
    return { text: `في أي دولة يلعب نادي ${item.n}؟`, correctAnswer: item.c, wrongOptions: wrongs.slice(0,3) };
  },
  () => {
    const item = CLUBS[rnd(0, CLUBS.length-1)];
    return { text: `كم عدد ألقاب نادي ${item.n} في دوري أبطال أوروبا (حتى 2024 تقريباً)؟`, correctAnswer: `${item.cl}`, wrongOptions: [`${item.cl+1}`, `${item.cl+2}`, `${item.cl-1 || Math.max(1, item.cl+3)}`] };
  },
  () => {
    const item = CLUBS[rnd(0, CLUBS.length-1)];
    const wrongs = CLUBS.filter(c => c.n !== item.n).map(c => c.n);
    return { text: `أي من هذه الأندية يمتلك ${item.cl} ألقاب أبطال أوروبا وقادم من ${item.c}؟`, correctAnswer: item.n, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = CLUBS[rnd(0, CLUBS.length-1)];
    const wrongs = CLUBS.filter(c => c.st !== item.st).map(c => c.st);
    return { text: `ما هو اسم الملعب الرئيسي لنادي ${item.n}؟`, correctAnswer: item.st, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];

// --- MOVIES ---

const MOVIES = [
  { m: 'Inception', d: 'كريستوفر نولان', y: 2010, s: 'ليوناردو دي كابريو' }, { m: 'Titanic', d: 'جيمس كاميرون', y: 1997, s: 'ليوناردو دي كابريو' },
  { m: 'Avatar', d: 'جيمس كاميرون', y: 2009, s: 'سام ورذينجتن' }, { m: 'The Godfather', d: 'فرانسيس فورد كوبولا', y: 1972, s: 'مارلون براندو' },
  { m: 'Pulp Fiction', d: 'كوينتن تارانتينو', y: 1994, s: 'جون ترافولتا' }, { m: 'Interstellar', d: 'كريستوفر نولان', y: 2014, s: 'ماثيو ماكونهي' },
  { m: 'The Dark Knight', d: 'كريستوفر نولان', y: 2008, s: 'كريستيان بيل' }, { m: 'Forrest Gump', d: 'روبرت زيميكس', y: 1994, s: 'توم هانكس' },
  { m: 'The Matrix', d: 'الأخوات واشوسكي', y: 1999, s: 'كيانو ريفز' }, { m: 'Goodfellas', d: 'مارتن سكورسيزي', y: 1990, s: 'روبرت دي نيرو' },
  { m: "Schindler's List", d: 'ستيفن سبيلبرغ', y: 1993, s: 'ليام نيسون' }, { m: 'Fight Club', d: 'ديفيد فينشر', y: 1999, s: 'براد بيت' },
  { m: 'The Lord of the Rings: The Return of the King', d: 'بيتر جاكسون', y: 2003, s: 'إليجاه وود' },
  { m: 'Star Wars: Episode IV', d: 'جورج لوكاس', y: 1977, s: 'مارك هاميل' }, { m: 'Gladiator', d: 'ريدلي سكوت', y: 2000, s: 'راسل كرو' },
  { m: 'The Shawshank Redemption', d: 'فرانك دارابونت', y: 1994, s: 'تيم روبنز' }, { m: 'Jurassic Park', d: 'ستيفن سبيلبرغ', y: 1993, s: 'سام نيل' },
  { m: 'Inglourious Basterds', d: 'كوينتن تارانتينو', y: 2009, s: 'براد بيت' }, { m: 'Se7en', d: 'ديفيد فينشر', y: 1995, s: 'مورغان فريمان' },
  { m: 'The Lion King', d: 'روجر أليرس', y: 1994, s: 'ماثيو برودريك' }, { m: 'Back to the Future', d: 'روبرت زيميكس', y: 1985, s: 'مايكل جي فوكس' },
  { m: 'Joker', d: 'تود فيليبس', y: 2019, s: 'واكين فينكس' }, { m: 'Oppenheimer', d: 'كريستوفر نولان', y: 2023, s: 'كيليان مورفي' },
  { m: 'The Avengers', d: 'جوس ويدون', y: 2012, s: 'روبرت داوني جونيور' }, { m: 'Avengers: Endgame', d: 'الأخوان روسو', y: 2019, s: 'روبرت داوني جونيور' },
  { m: 'Spider-Man: No Way Home', d: 'جون واتس', y: 2021, s: 'توم هولاند' }, { m: 'Black Panther', d: 'رايان كوغلر', y: 2018, s: 'تشادويك بوزمان' },
  { m: 'Mad Max: Fury Road', d: 'جورج ميلر', y: 2015, s: 'توم هاردي' }, { m: 'Dune', d: 'دينيس فيلنوف', y: 2021, s: 'تيموثي شالاماي' },
  { m: 'Blade Runner 2049', d: 'دينيس فيلنوف', y: 2017, s: 'رايان غوسلينغ' }, { m: 'John Wick', d: 'تشاد ستاهيلسكي', y: 2014, s: 'كيانو ريفز' },
  { m: 'The Terminator', d: 'جيمس كاميرون', y: 1984, s: 'أرنولد شوارزنيجر' }, { m: 'Terminator 2: Judgment Day', d: 'جيمس كاميرون', y: 1991, s: 'أرنولد شوارزنيجر' },
  { m: 'Alien', d: 'ريدلي سكوت', y: 1979, s: 'سيغورني ويفر' }, { m: 'Die Hard', d: 'جون مكتيرنان', y: 1988, s: 'بروس ويليس' },
  { m: 'Indiana Jones: Raiders of the Lost Ark', d: 'ستيفن سبيلبرغ', y: 1981, s: 'هاريسون فورد' }, { m: 'Rocky', d: 'جون أفليدسن', y: 1976, s: 'سيلفستر ستالون' },
  { m: 'The Silence of the Lambs', d: 'جوناثان ديم', y: 1991, s: 'أنتوني هوبكنز' }, { m: 'Braveheart', d: 'ميل غيبسون', y: 1995, s: 'ميل غيبسون' },
  { m: 'Saving Private Ryan', d: 'ستيفن سبيلبرغ', y: 1998, s: 'توم هانكس' }
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
  },
  () => {
    const item = MOVIES[rnd(0, MOVIES.length-1)];
    const wrongs = [...new Set(MOVIES.filter(m => m.s !== item.s).map(m => m.s))];
    return { text: `من هو الممثل الذي أدى دور البطولة (أو من الأدوار الرئيسية) في فيلم ${item.m}؟`, correctAnswer: item.s, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];



const ANIMES = [
  { a: 'One Piece', p: 'لوفي', c: 'قراصنة', ep: '1000+' }, { a: 'Naruto', p: 'ناروتو', c: 'نينجا', ep: '720' },
  { a: 'Attack on Titan', p: 'إيرين', c: 'عمالقة', ep: '89' }, { a: 'Death Note', p: 'لايت', c: 'الغموض والتحقيق', ep: '37' },
  { a: 'Demon Slayer', p: 'تانجيرو', c: 'قتلة شياطين', ep: '50+' }, { a: 'Dragon Ball', p: 'غوكو', c: 'فنون قتالية', ep: '800+' },
  { a: 'Hunter x Hunter', p: 'غون', c: 'صيادين', ep: '148' }, { a: 'Bleach', p: 'إيتشيغو', c: 'شينيغامي', ep: '366+' },
  { a: 'My Hero Academia', p: 'ميدوريا', c: 'أبطال خارقين', ep: '130+' }, { a: 'Fullmetal Alchemist', p: 'إدوارد', c: 'خيمياء', ep: '64' },
  { a: 'Tokyo Ghoul', p: 'كانيكي', c: 'غيلان', ep: '48' }, { a: 'Sword Art Online', p: 'كيريتو', c: 'عالم افتراضي', ep: '90+' },
  { a: 'Jujutsu Kaisen', p: 'يوجي إيتادوري', c: 'سحر ولعنات', ep: '47' }, { a: 'Black Clover', p: 'أستا', c: 'سحر وفرسان', ep: '170' },
  { a: 'Fairy Tail', p: 'ناتسو', c: 'نقابات السحر', ep: '328' }, { a: 'Tokyo Revengers', p: 'تاكيميتشي', c: 'عصابات وسفر بالزمن', ep: '50+' },
  { a: 'Detective Conan', p: 'كونان', c: 'تحقيق وجرائم', ep: '1100+' }, { a: 'Gintama', p: 'جينتوكي', c: 'كوميديا وساموراي', ep: '367' },
  { a: 'One Punch Man', p: 'سايتاما', c: 'أبطال خارقين ومحاكاة ساخرة', ep: '24' }, { a: 'Steins;Gate', p: 'أوكابي', c: 'خيال علمي وسفر بالزمن', ep: '24' },
  { a: 'Code Geass', p: 'لولوش', c: 'آلات وحروب (ميكا)', ep: '50' }, { a: 'Haikyuu', p: 'هيناتا', c: 'رياضة (كرة طائرة)', ep: '85' },
  { a: 'Kuroko no Basket', p: 'كوروكو', c: 'رياضة (كرة سلة)', ep: '75' }, { a: 'JoJo\'s Bizarre Adventure', p: 'جوتارو', c: 'مغامرات وقوى خارقة', ep: '190+' },
  { a: 'Mob Psycho 100', p: 'موب', c: 'قوى نفسية', ep: '37' }, { a: 'Chainsaw Man', p: 'دينجي', c: 'شياطين وقتال', ep: '12' },
  { a: 'Spy x Family', p: 'لويد', c: 'جواسيس وكوميديا', ep: '25+' }, { a: 'Dr. Stone', p: 'سينكو', c: 'خيال علمي وابتكار', ep: '35+' },
  { a: 'Cyberpunk: Edgerunners', p: 'ديفيد', c: 'خيال علمي ومستقبل سايبربانك', ep: '10' }, { a: 'Neon Genesis Evangelion', p: 'شينجي', c: 'آلات وعمق نفسي', ep: '26' },
  { a: 'Cowboy Bebop', p: 'سبايك', c: 'فضاء وصائدي جوائز', ep: '26' }, { a: 'Vinland Saga', p: 'ثورفين', c: 'فايكنج وتاريخ', ep: '48' },
  { a: 'Erase', p: 'ساتورو', c: 'سفر بالزمن وتحقيق', ep: '12' }, { a: 'Psycho-Pass', p: 'أكاني', c: 'شرطة وخيال علمي', ep: '41' },
  { a: 'Re:Zero', p: 'سوبارو', c: 'عالم آخر وسفر بالزمن', ep: '50+' }, { a: 'No Game No Life', p: 'سورا', c: 'ألعاب وعالم آخر', ep: '12' },
  { a: 'Overlord', p: 'آينز', c: 'عالم افتراضي وسحر', ep: '52' }, { a: 'Tengen Toppa Gurren Lagann', p: 'سيمون', c: 'آلات ومغامرات فضائية', ep: '27' },
  { a: 'Clannad', p: 'تومويا', c: 'دراما ورومانسية', ep: '47' }, { a: 'Your Lie in April', p: 'كوسي', c: 'موسيقى ودراما', ep: '22' }
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
  },
  () => {
    const item = ANIMES.filter(a => !a.ep.includes('+'))[rnd(0, 10)];
    return { text: `كم تقريباً عدد حلقات الأنمي الأصلي ${item.a}؟`, correctAnswer: item.ep, wrongOptions: [`${parseInt(item.ep)+20}`, `${Math.max(12, parseInt(item.ep)-12)}`, `${parseInt(item.ep)+50}`] };
  }
];

// --- HISTORY ---

const EVENTS = [
  { e: 'الحرب العالمية الأولى', sy: 1914, ey: 1918, l: 'أوروبا' }, { e: 'الحرب العالمية الثانية', sy: 1939, ey: 1945, l: 'أوروبا والعالم' },
  { e: 'سقوط الأندلس', sy: 1492, ey: 1492, l: 'شبه الجزيرة الأيبيرية' }, { e: 'فتح القسطنطينية', sy: 1453, ey: 1453, l: 'آسيا الصغرى/أوروبا' },
  { e: 'الثورة الفرنسية', sy: 1789, ey: 1799, l: 'فرنسا' }, { e: 'الثورة الروسية', sy: 1917, ey: 1923, l: 'روسيا' },
  { e: 'اكتشاف أمريكا', sy: 1492, ey: 1492, l: 'أمريكا الشمالية' }, { e: 'بداية الحرب الباردة', sy: 1947, ey: 1991, l: 'العالم' },
  { e: 'توحيد المملكة العربية السعودية', sy: 1932, ey: 1932, l: 'شبه الجزيرة العربية' }, { e: 'سقوط الاتحاد السوفيتي', sy: 1991, ey: 1991, l: 'روسيا وأوروبا الشرقية' },
  { e: 'هبوط الإنسان على القمر', sy: 1969, ey: 1969, l: 'الفضاء' }, { e: 'تأسيس الأمم المتحدة', sy: 1945, ey: 1945, l: 'الولايات المتحدة (المقر)' },
  { e: 'معركة حطين', sy: 1187, ey: 1187, l: 'فلسطين' }, { e: 'معركة عين جالوت', sy: 1260, ey: 1260, l: 'فلسطين' },
  { e: 'حملة نابليون على مصر', sy: 1798, ey: 1801, l: 'مصر' }, { e: 'الحرب الأهلية الأمريكية', sy: 1861, ey: 1865, l: 'الولايات المتحدة' },
  { e: 'سقوط جدار برلين', sy: 1989, ey: 1989, l: 'ألمانيا' }, { e: 'معركة واترلو', sy: 1815, ey: 1815, l: 'بلجيكا' },
  { e: 'سقوط الإمبراطورية الرومانية الغربية', sy: 476, ey: 476, l: 'إيطاليا / أوروبا' }, { e: 'بدء الثورة الصناعية', sy: 1760, ey: 1840, l: 'بريطانيا' },
  { e: 'معركة اليرموك', sy: 636, ey: 636, l: 'بلاد الشام' }, { e: 'معركة القادسية', sy: 636, ey: 636, l: 'العراق' },
  { e: 'بداية الخلافة العباسية', sy: 750, ey: 750, l: 'العراق / العالم الإسلامي' }, { e: 'معركة ملاذكرد', sy: 1071, ey: 1071, l: 'آسيا الصغرى' },
  { e: 'سقوط بغداد على يد المغول', sy: 1258, ey: 1258, l: 'العراق' }, { e: 'بداية الدولة العثمانية', sy: 1299, ey: 1299, l: 'الأناضول' },
  { e: 'تفكك الدولة العثمانية', sy: 1922, ey: 1922, l: 'تركيا' }, { e: 'بدء الحرب الأهلية الإسبانية', sy: 1936, ey: 1939, l: 'إسبانيا' },
  { e: 'إعلان استقلال الولايات المتحدة', sy: 1776, ey: 1776, l: 'أمريكا الشمالية' }, { e: 'ثورة العشرين', sy: 1920, ey: 1920, l: 'العراق' },
  { e: 'حرب الاستقلال الجزائرية', sy: 1954, ey: 1962, l: 'الجزائر' }, { e: 'الغزو العراقي للكويت', sy: 1990, ey: 1991, l: 'الكويت' },
  { e: 'حادثة 11 سبتمبر', sy: 2001, ey: 2001, l: 'الولايات المتحدة' }
];

const LEADERS = [
  { l: 'صلاح الدين الأيوبي', title: 'محرر القدس', c: 'الدولة الأيوبية' },
  { l: 'نور الدين زنكي', title: 'السلطان العادل', c: 'الدولة الزنكية' },
  { l: 'قطز', title: 'قاهر المغول', c: 'المماليك' },
  { l: 'هارون الرشيد', title: 'الخليفة العباسي', c: 'الدولة العباسية' },
  { l: 'الظاهر بيبرس', title: 'رابع سلاطين المماليك', c: 'المماليك' },
  { l: 'عمر بن عبد العزيز', title: 'خامس الخلفاء الراشدين', c: 'الدولة الأموية' },
  { l: 'نابليون بونابرت', title: 'إمبراطور فرنسا', c: 'فرنسا' },
  { l: 'الاسكندر الأكبر', title: 'ملك مقدونيا العظيم', c: 'مقدونيا' }
];

const historyTemplates = [
  () => {
    const item = EVENTS[rnd(0, EVENTS.length-1)];
    return { text: `في أي عام بدأت (أو وقعت) أحداث ${item.e}؟`, correctAnswer: `${item.sy}`, wrongOptions: [`${item.sy+10}`, `${item.sy-5}`, `${item.sy+2}`] };
  },
  () => {
    const items = EVENTS.filter(e => e.sy !== e.ey);
    const item = items[rnd(0, items.length-1)];
    return { text: `متى انتهت ${item.e}؟`, correctAnswer: `${item.ey}`, wrongOptions: [`${item.ey+3}`, `${item.ey-2}`, `${item.ey+5}`] };
  },
  () => {
    const item = EVENTS[rnd(0, EVENTS.length-1)];
    const wrongs = ['آسيا', 'أفريقيا', 'أوروبا', 'أمريكا الشمالية', 'أمريكا الجنوبية', 'أستراليا', 'الشرق الأوسط', 'روسيا'].filter(l => l !== item.l);
    return { text: `ما هي المنطقة الجغرافية الرئيسية التي ارتبطت بها ${item.e}؟`, correctAnswer: `${item.l}`, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = LEADERS[rnd(0, LEADERS.length-1)];
    const wrongs = LEADERS.filter(l => l.l !== item.l).map(l => l.l);
    return { text: `من هو القائد أو الشخصية التاريخية المعروفة بـ "${item.title}" وارتبط اسمه بـ ${item.c}؟`, correctAnswer: item.l, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];

// --- ISLAMIC ---

const ISLAMIC = [
  { s: 'البقرة', a: 286, m: 'مدنية', l: 1 }, { s: 'آل عمران', a: 200, m: 'مدنية', l: 3 }, { s: 'النساء', a: 176, m: 'مدنية', l: 4 }, { s: 'الكوثر', a: 3, m: 'مكية', l: 108 },
  { s: 'الفاتحة', a: 7, m: 'مكية', l: 1 }, { s: 'المائدة', a: 120, m: 'مدنية', l: 5 }, { s: 'الأنفال', a: 75, m: 'مدنية', l: 8 }, { s: 'الإخلاص', a: 4, m: 'مكية', l: 112 },
  { s: 'الفلق', a: 5, m: 'مكية', l: 113 }, { s: 'الناس', a: 6, m: 'مكية', l: 114 }, { s: 'الرحمن', a: 78, m: 'مدنية', l: 55 }, { s: 'الكهف', a: 110, m: 'مكية', l: 18 },
  { s: 'يوسف', a: 111, m: 'مكية', l: 12 }, { s: 'يس', a: 83, m: 'مكية', l: 36 }, { s: 'الملك', a: 30, m: 'مكية', l: 67 }, { s: 'الواقعة', a: 96, m: 'مكية', l: 56 },
  { s: 'مريم', a: 98, m: 'مكية', l: 19 }, { s: 'طه', a: 135, m: 'مكية', l: 20 }, { s: 'النور', a: 64, m: 'مدنية', l: 24 }, { s: 'النمل', a: 93, m: 'مكية', l: 27 },
  { s: 'القصص', a: 88, m: 'مكية', l: 28 }, { s: 'لقمان', a: 34, m: 'مكية', l: 31 }, { s: 'السجدة', a: 30, m: 'مكية', l: 32 }, { s: 'الدخان', a: 59, m: 'مكية', l: 44 },
  { s: 'الحجرات', a: 18, m: 'مدنية', l: 49 }, { s: 'التوبة', a: 129, m: 'مدنية', l: 9 }, { s: 'إبراهيم', a: 52, m: 'مكية', l: 14 }, { s: 'الأنبياء', a: 112, m: 'مكية', l: 21 },
  { s: 'الفرقان', a: 77, m: 'مكية', l: 25 }, { s: 'الروم', a: 60, m: 'مكية', l: 30 }, { s: 'الزمر', a: 75, m: 'مكية', l: 39 }, { s: 'غافر', a: 85, m: 'مكية', l: 40 },
  { s: 'فصلت', a: 54, m: 'مكية', l: 41 }, { s: 'الشورى', a: 53, m: 'مكية', l: 42 }, { s: 'الزخرف', a: 89, m: 'مكية', l: 43 }, { s: 'الجاثية', a: 37, m: 'مكية', l: 45 },
  { s: 'الأحقاف', a: 35, m: 'مكية', l: 46 }, { s: 'محمد', a: 38, m: 'مدنية', l: 47 }, { s: 'الفتح', a: 29, m: 'مدنية', l: 48 }, { s: 'ق', a: 45, m: 'مكية', l: 50 },
  { s: 'الذاريات', a: 60, m: 'مكية', l: 51 }, { s: 'الطور', a: 49, m: 'مكية', l: 52 }, { s: 'النجم', a: 62, m: 'مكية', l: 53 }, { s: 'القمر', a: 55, m: 'مكية', l: 54 }
];

const PROPHETS = [
  { p: 'محمد', title: 'خاتم الأنبياء' }, { p: 'إبراهيم', title: 'خليل الله' }, { p: 'موسى', title: 'كليم الله' }, { p: 'عيسى', title: 'روح الله' },
  { p: 'يونس', title: 'ذا النون' }, { p: 'إسماعيل', title: 'الذبيح' }
];

const COMPANIONS = [
  { c: 'أبو بكر الصديق', title: 'أول الخلفاء الراشدين' }, { c: 'عمر بن الخطاب', title: 'الفاروق' }, { c: 'عثمان بن عفان', title: 'ذو النورين' }, 
  { c: 'علي بن أبي طالب', title: 'أبو الحسن' }, { c: 'خالد بن الوليد', title: 'سيف الله المسلول' }, { c: 'حمزة بن عبد المطلب', title: 'أسد الله' },
  { c: 'بلال بن رباح', title: 'مؤذن الرسول' }, { c: 'أبو هريرة', title: 'راوية الإسلام' }
];


const islamicTemplates = [
  () => {
    const item = ISLAMIC[rnd(0, ISLAMIC.length-1)];
    return { text: `كم عدد آيات سورة ${item.s}؟`, correctAnswer: `${item.a}`, wrongOptions: [`${item.a+5}`, `${item.a-2}`, `${item.a+10}`] };
  },
  () => {
    const pillars = ['شهادة أن لا إله إلا الله', 'إقامة الصلاة', 'إيتاء الزكاة', 'صوم رمضان', 'حج البيت'];
    const p = pillars[rnd(0, pillars.length-1)];
    const wrongs = ['بر الوالدين', 'الجهاد', 'طلب العلم', 'قراءة القرآن', 'صلة الرحم'].sort(()=>0.5-Math.random());
    return { text: `أي من التالي يعتبر من أركان الإسلام الخمسة؟`, correctAnswer: p, wrongOptions: wrongs.slice(0,3) };
  },
  () => {
    const item = ISLAMIC[rnd(0, ISLAMIC.length-1)];
    const w1 = item.m === 'مكية' ? 'مدنية' : 'مكية';
    return { text: `هل سورة ${item.s} مكية أم مدنية؟`, correctAnswer: item.m, wrongOptions: [w1, 'حبشية', 'بيت المقدس'] };
  },
  () => {
    const prayers = [{ n: 'الفجر', r: 2 }, { n: 'الظهر', r: 4 }, { n: 'العصر', r: 4 }, { n: 'المغرب', r: 3 }, { n: 'العشاء', r: 4 }];
    const pr = prayers[rnd(0, prayers.length-1)];
    return { text: `كم عدد ركعات صلاة ${pr.n} المفروضة؟`, correctAnswer: `${pr.r}`, wrongOptions: [`${pr.r+1}`, `${pr.r+2}`, `${pr.r-1 || 5}`] };
  },
  () => {
    const p = PROPHETS[rnd(0, PROPHETS.length-1)];
    const wrongs = PROPHETS.filter(x => x.title !== p.title).map(x => x.p);
    return { text: `من هو النبي الذي يلقب بـ "${p.title}"؟`, correctAnswer: p.p, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const c = COMPANIONS[rnd(0, COMPANIONS.length-1)];
    const wrongs = COMPANIONS.filter(x => x.c !== c.c).map(x => x.c);
    return { text: `من هو الصحابي الذي يلقب بـ "${c.title}"؟`, correctAnswer: c.c, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
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
