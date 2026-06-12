const fs = require('fs');
let content = fs.readFileSync('src/lib/massiveDynamic.ts', 'utf-8');

const newScience = `
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
    return { text: \`ما هو الرمز الكيميائي لعنصر \${item.name}؟\`, correctAnswer: item.sym, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = ELEMENTS[rnd(0, ELEMENTS.length-1)];
    const wrongs = ELEMENTS.filter(e => e.name !== item.name).map(e => e.name);
    return { text: \`ما هو العنصر الذي يرمز له بـ \${item.sym}؟\`, correctAnswer: item.name, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = ELEMENTS[rnd(0, ELEMENTS.length-1)];
    return { text: \`كم يبلغ العدد الذري لعنصر \${item.name}؟\`, correctAnswer: \`\${item.num}\`, wrongOptions: [\`\${item.num+1}\`, \`\${item.num+5}\`, \`\${item.num-1 || 2}\`] };
  },
  () => {
    const item = ELEMENTS[rnd(0, ELEMENTS.length-1)];
    const wrongs = ELEMENTS.filter(e => e.name !== item.name).map(e => e.name);
    return { text: \`أي عنصر يمتلك العدد الذري \${item.num}؟\`, correctAnswer: item.name, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = PLANETS[rnd(0, PLANETS.length-1)];
    const wrongs = PLANETS.filter(p => p.p !== item.p).map(p => p.p);
    return { text: \`أي من كواكب المجموعة الشمسية يعتبر كوكباً \${item.type}اً؟\`, correctAnswer: item.p, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];
`;

content = content.replace(/const ELEMENTS = \[[\s\S]*?\];\s*const scienceTemplates = \[[\s\S]*?\];/m, newScience);
fs.writeFileSync('src/lib/massiveDynamic.ts', content);
console.log("Updated SCIENCE");
