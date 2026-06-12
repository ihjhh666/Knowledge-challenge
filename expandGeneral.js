const fs = require('fs');
let content = fs.readFileSync('src/lib/massiveDynamic.ts', 'utf-8');

const newGeneral = `
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
    return { text: \`ما هي عاصمة \${item.c}؟\`, correctAnswer: item.cap, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = COUNTRIES[rnd(0, COUNTRIES.length-1)];
    const wrongs = COUNTRIES.filter(c => c.curr !== item.curr).map(c => c.curr);
    return { text: \`ما هي العملة الرسمية في \${item.c}؟\`, correctAnswer: item.curr, wrongOptions: [...new Set(wrongs)].sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = COUNTRIES[rnd(0, COUNTRIES.length-1)];
    const wrongs = COUNTRIES.filter(c => c.c !== item.c).map(c => c.c);
    return { text: \`مدينة \${item.cap} هي عاصمة أي دولة؟\`, correctAnswer: item.c, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = COUNTRIES[rnd(0, COUNTRIES.length-1)];
    const wrongs = ['آسيا', 'أفريقيا', 'أوروبا', 'أمريكا الشمالية', 'أمريكا الجنوبية', 'أستراليا'].filter(c => c !== item.cont);
    return { text: \`في أي قارة تقع دولة \${item.c}؟\`, correctAnswer: item.cont, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = INVENTORS[rnd(0, INVENTORS.length-1)];
    const wrongs = INVENTORS.filter(i => i.i !== item.i).map(i => i.i);
    return { text: \`من هو المخترع (أو العالم) المعروف بـ \${item.m}؟\`, correctAnswer: item.i, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = INVENTORS[rnd(0, INVENTORS.length-1)];
    const wrongs = INVENTORS.filter(i => i.m !== item.m).map(i => i.m);
    return { text: \`ما هو أبرز اختراع أو اكتشاف اقترن باسم \${item.i}؟\`, correctAnswer: item.m, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];
`;

content = content.replace(/const COUNTRIES = \[[\s\S]*?\];\s*const generalTemplates = \[[\s\S]*?\];/m, newGeneral);
fs.writeFileSync('src/lib/massiveDynamic.ts', content);
console.log("Updated GENERAL");
