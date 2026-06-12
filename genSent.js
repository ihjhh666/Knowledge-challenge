const fs = require('fs');

const subjects = [
  'الأسد', 'النسر', 'العلم', 'العمل', 'القطار', 'الكتاب', 'الكمبيوتر', 'الصبر',
  'البحر', 'الجبل', 'الشمس', 'القمر', 'النهر', 'الطائر', 'الطبيب', 'المهندس',
  'الفلاح', 'النجاح', 'الصدق', 'التسامح', 'الرياضة', 'السفر', 'التعاون', 'الوقت',
  'الورد', 'الصديق', 'الربيع', 'الخريف', 'الصيف', 'الشتاء', 'المطر', 'السحاب'
];

const verbs = [
  'يعتبر', 'يساهم', 'يعزز', 'يزيد', 'يقوي', 'يبني',
  'يجعل', 'يعطي', 'يساعد', 'يقود', 'يدعم', 'يمنح'
];

const verbs_f = [
  'تعتبر', 'تساهم', 'تعزز', 'تزيد', 'تقوي', 'تبني',
  'تجعل', 'تعطي', 'تساعد', 'تقود', 'تدعم', 'تمنح'
];

function isFeminine(word) {
  const f_words = ['الشمس', 'الرياضة', 'الورد']; // approx
  return f_words.includes(word) || word.endsWith('ة');
}

const objects = [
  'تطور العقل', 'تقدم المجتمع', 'نجاح الأفراد', 'بناء الحضارات', 'رقي التفكير',
  'تحقيق الأهداف', 'نهضة الأمم', 'السلام الداخلي', 'السعادة الحقيقية', 'القوة البدنية',
  'صحة الجسد', 'نمو الاقتصاد'
];

const prepositions = [
  'بشكل ملحوظ', 'دائما', 'بشكل مستمر', 'في كل الأوقات', 'عبر العصور', 'منذ القدم',
  'بشكل كبير', 'على الدوام', 'للأفضل'
];

const sentences = new Set();

for (let s of subjects) {
  for (let o of objects) {
    for (let p of prepositions) {
      const v = isFeminine(s) ? verbs_f[Math.floor(Math.random() * verbs_f.length)] : verbs[Math.floor(Math.random() * verbs.length)];
      sentences.add(`${v} ${s} في ${o} ${p}`);
    }
  }
}

const lines = Array.from(sentences).map(s => `  "${s}",`);

const fileContent = `export const BULK_SENTENCES = [\n${lines.join('\n')}\n];\n`;
fs.writeFileSync('src/lib/massive/bulkSentences.ts', fileContent);
console.log('Generated ' + sentences.size + ' sentences');
