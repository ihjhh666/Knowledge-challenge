const fs = require('fs');
let content = fs.readFileSync('src/lib/massiveDynamic.ts', 'utf-8');

const newIslamic = `
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
`;

const newIslamicTemplates = `
const islamicTemplates = [
  () => {
    const item = ISLAMIC[rnd(0, ISLAMIC.length-1)];
    return { text: \`كم عدد آيات سورة \${item.s}؟\`, correctAnswer: \`\${item.a}\`, wrongOptions: [\`\${item.a+5}\`, \`\${item.a-2}\`, \`\${item.a+10}\`] };
  },
  () => {
    const pillars = ['شهادة أن لا إله إلا الله', 'إقامة الصلاة', 'إيتاء الزكاة', 'صوم رمضان', 'حج البيت'];
    const p = pillars[rnd(0, pillars.length-1)];
    const wrongs = ['بر الوالدين', 'الجهاد', 'طلب العلم', 'قراءة القرآن', 'صلة الرحم'].sort(()=>0.5-Math.random());
    return { text: \`أي من التالي يعتبر من أركان الإسلام الخمسة؟\`, correctAnswer: p, wrongOptions: wrongs.slice(0,3) };
  },
  () => {
    const item = ISLAMIC[rnd(0, ISLAMIC.length-1)];
    const w1 = item.m === 'مكية' ? 'مدنية' : 'مكية';
    return { text: \`هل سورة \${item.s} مكية أم مدنية؟\`, correctAnswer: item.m, wrongOptions: [w1, 'حبشية', 'بيت المقدس'] };
  },
  () => {
    const prayers = [{ n: 'الفجر', r: 2 }, { n: 'الظهر', r: 4 }, { n: 'العصر', r: 4 }, { n: 'المغرب', r: 3 }, { n: 'العشاء', r: 4 }];
    const pr = prayers[rnd(0, prayers.length-1)];
    return { text: \`كم عدد ركعات صلاة \${pr.n} المفروضة؟\`, correctAnswer: \`\${pr.r}\`, wrongOptions: [\`\${pr.r+1}\`, \`\${pr.r+2}\`, \`\${pr.r-1 || 5}\`] };
  },
  () => {
    const p = PROPHETS[rnd(0, PROPHETS.length-1)];
    const wrongs = PROPHETS.filter(x => x.title !== p.title).map(x => x.p);
    return { text: \`من هو النبي الذي يلقب بـ "\${p.title}"؟\`, correctAnswer: p.p, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const c = COMPANIONS[rnd(0, COMPANIONS.length-1)];
    const wrongs = COMPANIONS.filter(x => x.c !== c.c).map(x => x.c);
    return { text: \`من هو الصحابي الذي يلقب بـ "\${c.title}"؟\`, correctAnswer: c.c, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];
`;

content = content.replace(/const ISLAMIC = \[[\s\S]*?\];/, newIslamic);
content = content.replace(/const islamicTemplates = \[[\s\S]*?\];/, newIslamicTemplates);

fs.writeFileSync('src/lib/massiveDynamic.ts', content);
console.log("Updated ISLAMIC");
