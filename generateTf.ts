import * as fs from 'fs';

let out = `export interface TFQuestion {\n  question: string;\n  isTrue: boolean;\n  difficulty: 'easy' | 'medium' | 'hard';\n}\n\n`;

// Generate thousands of questions programmatically!
const capitals = [
  ['السعودية','الرياض'], ['مصر','القاهرة'], ['فرنسا','باريس'], ['بريطانيا','لندن'], ['اليابان','طوكيو'],
  ['ألمانيا','برلين'], ['إيطاليا','روما'], ['إسبانيا','مدريد'], ['روسيا','موسكو'], ['الصين','بكين'],
  ['أمريكا','واشنطن'], ['كندا','أوتاوا'], ['البرازيل','برازيليا'], ['الأرجنتين','بوينس آيرس'], ['المكسيك','مكسيكو سيتي'],
  ['الهند','نيودلهي'], ['تركيا','أنقرة'], ['إيران','طهران'], ['العراق','بغداد'], ['سوريا','دمشق'],
  ['لبنان','بيروت'], ['الأردن','عمان'], ['اليمن','صنعاء'], ['عمان','مسقط'], ['الكويت','الكويت'],
  ['قطر','الدوحة'], ['البحرين','المنامة'], ['الإمارات','أبوظبي'], ['المغرب','الرباط'], ['الجزائر','الجزائر'],
  ['تونس','تونس'], ['ليبيا','طرابلس'], ['السودان','الخرطوم'], ['الصومال','مقدشيو']
];

let items: string[] = [];

capitals.forEach(([country, capital], idx) => {
  items.push(`easy|هل ${capital} هي عاصمة ${country}؟|true`);
  const wrongCap = capitals[(idx + 1) % capitals.length][1];
  items.push(`medium|هل ${wrongCap} هي عاصمة ${country}؟|false`);
});

const elements = [
  ['الذهب','Au'], ['الفضة','Ag'], ['الاكسجين','O'], ['الهيدروجين','H'], ['النيتروجين','N'],
  ['الكربون','C'], ['الحديد','Fe'], ['النحاس','Cu'], ['الزنك','Zn'], ['الكالسيوم','Ca'],
  ['الصوديوم','Na'], ['البوتاسيوم','K'], ['الماغنسيوم','Mg'], ['الكلور','Cl'], ['الفلور','F']
];

elements.forEach(([name, sym], idx) => {
  items.push(`medium|هل الرمز الكيميائي لعنصر ${name} هو ${sym}؟|true`);
  const wrongSym = elements[(idx + 1) % elements.length][1];
  items.push(`hard|هل الرمز الكيميائي لعنصر ${name} هو ${wrongSym}؟|false`);
});

const inventions = [
  ['المصباح الكهربائي','توماس إديسون'], ['الهاتف','ألكسندر غراهام بيل'], ['الطائرة','الأخوان رايت'],
  ['الراديو','غولييلمو ماركوني'], ['التلسكوب','غاليليو غاليلي'], ['الديناميت','ألفرد نوبل']
];

inventions.forEach(([inv, maker], idx) => {
  items.push(`easy|هل المخترع الذي ابتكر ${inv} هو ${maker}؟|true`);
  const wrongMaker = inventions[(idx + 1) % inventions.length][1];
  items.push(`medium|هل المخترع الذي ابتكر ${inv} هو ${wrongMaker}؟|false`);
});

const planets = [
  ['عطارد','الأقرب للشمس'], ['الزهرة','الأشد حرارة'], ['الأرض','الكوكب المائي'],
  ['المريخ','الكوكب الأحمر'], ['المشتري','أكبر كواكب المجموعة الشمسية'], ['زحل','الكوكب ذو الحلقات'],
  ['أورانوس','الكوكب البارد'], ['نبتون','الكوكب الأزرق الداكن']
];

planets.forEach(([planet, desc], idx) => {
  items.push(`easy|هل ${planet} هو ${desc}؟|true`);
  const wrongDesc = planets[(idx + 1) % planets.length][1];
  items.push(`medium|هل ${planet} هو ${wrongDesc}؟|false`);
});

out += "const rawGeneratedData = `\n" + items.join('\n') + "\n`;\n\n";

out += `
// Also include hand-curated questions
const rawHandCurated = \`
easy|هل سوبر ماريو هي شخصية من اختراع شركة نينتندو؟|true
easy|هل لعبة ماينكرافت هي اللعبة الأكثر مبيعاً في التاريخ؟|true
medium|هل ظهرت شخصية سونيك لأول مرة في عام 1991؟|true
medium|هل فازت لعبة The Witcher 3 بلقب لعبة السنة في 2015؟|true
hard|هل المخترع الحقيقي لجهاز بلايستيشن هو ساتورو إيواتا؟|false
hard|هل أول لعبة فيديو تجارية في التاريخ كانت بونغ (Pong)؟|false
easy|هل المحيط الهادئ هو أكبر محيط في العالم؟|true
easy|هل باريس هي عاصمة فرنسا؟|true
easy|هل نهر النيل هو أطول نهر في العالم؟|true
medium|هل يمر خط الاستواء عبر قارة أستراليا؟|false
medium|هل كندا هي أكبر دولة في العالم من حيث المساحة؟|false
hard|هل نيوزيلندا تتكون من ثلاث جزر رئيسية؟|false
hard|هل بحر قزوين هو أكبر بحيرة مغلقة في العالم؟|true
easy|هل اللغة الإنجليزية هي أكثر اللغات تحدثاً حول العالم كلغة أم؟|false
easy|هل الدلفين من الثدييات؟|true
medium|هل مخترع المصباح الكهربائي هو توماس إديسون؟|true
hard|هل عدد عظام الشخص البالغ 206 عظمة؟|true
easy|هل نزل القرآن الكريم في شهر رمضان؟|true
easy|هل الخلفاء الراشدين هم أربعة؟|true
medium|هل الدولة الأموية هي أول دولة إسلامية بعد الخلافة الراشدة؟|true
hard|هل وقعت معركة حطين في عام 1187 ميلادي؟|true
easy|هل ريال مدريد هو أكثر فريق فوزاً بدوري الأبطال؟|true
easy|هل البرازيل هي أكثر دولة فازت بكأس العالم؟|true
medium|هل ليونيل ميسي فاز بكأس العالم مع الأرجنتين في 2022؟|true
hard|هل فاز بيليه بكأس العالم 4 مرات؟|false
easy|هل لوفي هو بطل أنمي ون بيس؟|true
medium|هل غوكو من كوكب الأرض؟|false
hard|هل شخصية زورو في ون بيس تستخدم 4 سيوف؟|false
\`;

const parseRawData = (data: string): TFQuestion[] => {
  return data.trim().split('\\n')
    .filter(line => line.includes('|'))
    .map(line => {
      const [diff, text, isTrue] = line.split('|');
      return {
        difficulty: diff as 'easy' | 'medium' | 'hard',
        question: text.trim(),
        isTrue: isTrue.trim() === 'true'
      };
    });
};

export const tfQuestions: TFQuestion[] = [
  ...parseRawData(rawGeneratedData),
  ...parseRawData(rawHandCurated)
];

// Unique filter to prevent duplicates completely
const uniqueTfQuestions = Array.from(new Map(tfQuestions.map(q => [q.question, q])).values());

export const getRandomTFQuestions = (count: number): TFQuestion[] => {
  const easy = uniqueTfQuestions.filter(q => q.difficulty === 'easy').sort(() => 0.5 - Math.random());
  const medium = uniqueTfQuestions.filter(q => q.difficulty === 'medium').sort(() => 0.5 - Math.random());
  const hard = uniqueTfQuestions.filter(q => q.difficulty === 'hard').sort(() => 0.5 - Math.random());

  const easyCount = Math.floor(count * 0.4);
  const mediumCount = Math.floor(count * 0.4);
  const hardCount = count - easyCount - mediumCount;

  let pool: TFQuestion[] = [];
  
  if (easy.length >= easyCount && medium.length >= mediumCount && hard.length >= hardCount) {
    pool = [...easy.slice(0, easyCount), ...medium.slice(0, mediumCount), ...hard.slice(0, hardCount)];
  } else {
    pool = [...uniqueTfQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Shuffle the final pool 
  return pool.sort(() => 0.5 - Math.random());
};
`;

fs.writeFileSync('src/lib/tfData.ts', out);
