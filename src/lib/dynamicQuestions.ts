import { GENERAL_KNOWLEDGE as OLD_GEN, FOOTBALL as OLD_FB, HISTORY as OLD_HIST, SCIENCE as OLD_SCI, MOVIES as OLD_MOV, ANIME as OLD_ANI, ISLAMIC as OLD_ISL } from './questionData';

const getRandomWrongAnswers = (correct: string, pool: string[], count=3) => {
  const filtered = pool.filter(p => p !== correct);
  return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
};

// --- General Knowledge: Generating Capitals, Currencies, and Countries ---
const GEO = [
  ['السعودية', 'الرياض', 'الريال'], ['مصر', 'القاهرة', 'الجنيه'], ['الإمارات', 'أبوظبي', 'الدرهم'], 
  ['قطر', 'الدوحة', 'الريال'], ['فرنسا', 'باريس', 'اليورو'], ['اليابان', 'طوكيو', 'الين'], 
  ['ألمانيا', 'برلين', 'اليورو'], ['إيطاليا', 'روما', 'اليورو'], ['إسبانيا', 'مدريد', 'اليورو'], 
  ['بريطانيا', 'لندن', 'الجنيه الإسترليني'], ['الولايات المتحدة', 'واشنطن', 'الدولار'], 
  ['الصين', 'بكين', 'اليوان'], ['روسيا', 'موسكو', 'الروبل'], ['البرازيل', 'برازيليا', 'الريال'], 
  ['كندا', 'أوتاوا', 'الدولار الكندي'], ['أستراليا', 'كانبرا', 'الدولار الأسترالي'], 
  ['تركيا', 'أنقرة', 'الليرة'], ['الجزائر', 'الجزائر', 'الدينار'], ['المغرب', 'الرباط', 'الدرهم'], 
  ['تونس', 'تونس', 'الدينار'], ['الكويت', 'الكويت', 'الدينار'], ['عمان', 'مسقط', 'الريال'],
  ['الأردن', 'عمان', 'الدينار'], ['سوريا', 'دمشق', 'الليرة'], ['لبنان', 'بيروت', 'الليرة'],
  ['العراق', 'بغداد', 'الدينار'], ['ليبيا', 'طرابلس', 'الدينار'], ['السودان', 'الخرطوم', 'الجنيه'],
  ['البحرين', 'المنامة', 'الدينار'], ['اليمن', 'صنعاء', 'الريال'], ['الصومال', 'مقدیشو', 'الشلن'],
  ['المكسيك', 'مكسيكو سيتي', 'البيزو'], ['الأرجنتين', 'بوينس آيرس', 'البيزو'], ['الهند', 'نيودلهي', 'الروبية'],
  ['إندونيسيا', 'جاكرتا', 'الروبية'], ['ماليزيا', 'كوالالمبور', 'الرينغيت'], ['كوريا الجنوبية', 'سول', 'الوون'],
  ['النرويج', 'أوسلو', 'الكرونة'], ['السويد', 'ستوكهولم', 'الكرونة'], ['سويسرا', 'بيرن', 'الفرنك السويسري'],
  ['اليونان', 'أثينا', 'اليورو'], ['البرتغال', 'لشبونة', 'اليورو'], ['هولندا', 'أمستردام', 'اليورو'],
  ['بلجيكا', 'بروكسل', 'اليورو'], ['آيسلندا', 'ريكيافيك', 'الكرونة'], ['كوستاريكا', 'سان خوسيه', 'الكولون'],
  ['كوبا', 'هافانا', 'البيزو'], ['جنوب أفريقيا', 'بريتوريا', 'الراند'], ['نيجيريا', 'أبوجا', 'النايرا'],
  ['كينيا', 'نيروبي', 'الشلن'], ['فنزويلا', 'كاراكاس', 'البوليفار'], ['بيرو', 'ليما', 'السول']
];
const ALL_CAPS = GEO.map(g => g[1]);
const ALL_CURR = [...new Set(GEO.map(g => g[2]))];

const mapGeo = GEO.map(g => ({
  text: `ما هي عاصمة ${g[0]}؟`,
  correctAnswer: g[1],
  wrongOptions: getRandomWrongAnswers(g[1], ALL_CAPS, 3)
})).concat(GEO.map(g => ({
  text: `ما هي العملة الرسمية في ${g[0]}؟`,
  correctAnswer: g[2],
  wrongOptions: getRandomWrongAnswers(g[2], ALL_CURR, 3)
})));

// --- Football: Winners, Hosts, Matches ---
const WC_DATA = [
  ['2022', 'الأرجنتين', 'قطر'], ['2018', 'فرنسا', 'روسيا'], ['2014', 'ألمانيا', 'البرازيل'],
  ['2010', 'إسبانيا', 'جنوب أفريقيا'], ['2006', 'إيطاليا', 'ألمانيا'], ['2002', 'البرازيل', 'اليابان وكوريا'],
  ['1998', 'فرنسا', 'فرنسا'], ['1994', 'البرازيل', 'الولايات المتحدة'], ['1990', 'ألمانيا الغربية', 'إيطاليا'],
  ['1986', 'الأرجنتين', 'المكسيك'], ['1982', 'إيطاليا', 'إسبانيا'], ['1978', 'الأرجنتين', 'الأرجنتين']
];
const ALL_NATIONS = ['الأرجنتين', 'فرنسا', 'ألمانيا', 'إسبانيا', 'إيطاليا', 'البرازيل', 'إنجلترا', 'هولندا', 'كرواتيا', 'البرتغال', 'الأوروغواي', 'المكسيك', 'بلجيكا', 'اليابان', 'المغرب', 'السنغال'];

const mapFb = WC_DATA.map(w => ({
  text: `أين أقيمت بطولة كأس العالم عام ${w[0]}؟`,
  correctAnswer: w[2],
  wrongOptions: getRandomWrongAnswers(w[2], ['فرنسا','البرازيل','جنوب أفريقيا','ألمانيا','روسيا','قطر','الولايات المتحدة','إسبانيا','إيطاليا','المكسيك'], 3)
})).concat(WC_DATA.map(w => ({
  text: `من هو المنتخب الفائز بكأس العالم عام ${w[0]}؟`,
  correctAnswer: w[1],
  wrongOptions: getRandomWrongAnswers(w[1], ALL_NATIONS, 3)
})));

const UCL_WINNERS = [
  ['2023', 'مانشستر سيتي'], ['2022', 'ريال مدريد'], ['2021', 'تشيلسي'], ['2020', 'بايرن ميونخ'],
  ['2019', 'ليفربول'], ['2018', 'ريال مدريد'], ['2017', 'ريال مدريد'], ['2016', 'ريال مدريد'],
  ['2015', 'برشلونة'], ['2014', 'ريال مدريد'], ['2013', 'بايرن ميونخ'], ['2012', 'تشيلسي'],
  ['2011', 'برشلونة'], ['2010', 'إنتر ميلان'], ['2009', 'برشلونة'], ['2008', 'مانشستر يونايتد']
];
const UCL_CLUBS = ['مانشستر سيتي', 'ريال مدريد', 'تشيلسي', 'بايرن ميونخ', 'ليفربول', 'برشلونة', 'إنتر ميلان', 'مانشستر يونايتد', 'يوفنتوس', 'أتلتيكو مدريد', 'باريس سان جيرمان', 'ميلان'];
const mapUcl = UCL_WINNERS.map(u => ({
  text: `من هو النادي الفائز بدوري أبطال أوروبا عام ${u[0]}؟`,
  correctAnswer: u[1],
  wrongOptions: getRandomWrongAnswers(u[1], UCL_CLUBS, 3)
}));

// --- Science: Math, Planets, Biology ---
const MATH_QUESTIONS: any[] = [];
for (let i = 2; i <= 15; i++) {
  for (let j = 2; j <= 12; j++) {
    const ans = i * j;
    MATH_QUESTIONS.push({
      text: `ما ناتج ضرب ${i} × ${j}؟`,
      correctAnswer: ans.toString(),
      wrongOptions: [(ans + i).toString(), (ans - j).toString(), (ans + 10).toString()]
    });
  }
}
for (let i = 11; i <= 50; i++) {
  const ans = i * 2;
  MATH_QUESTIONS.push({
    text: `ما هو ضعف العدد ${i}؟`,
    correctAnswer: ans.toString(),
    wrongOptions: [(ans + 2).toString(), (ans - 2).toString(), (ans + 10).toString()]
  });
}

// --- History: Dates and Events ---
const HISTORY_EVENTS = [
  ['1914', 'بدء الحرب العالمية الأولى'], ['1918', 'انتهاء الحرب العالمية الأولى'],
  ['1939', 'بدء الحرب العالمية الثانية'], ['1945', 'انتهاء الحرب العالمية الثانية'],
  ['1969', 'أول هبوط على القمر'], ['1789', 'الث الثورة الفرنسية'],
  ['1989', 'سقوط جدار برلين'], ['1492', 'اكتشاف أمريكا'], 
  ['1912', 'غرق التايتانيك'], ['1991', 'تفكك الاتحاد السوفيتي']
];
const ALL_EVENTS = HISTORY_EVENTS.map(h => h[1]);
const mapHistory = HISTORY_EVENTS.map(h => ({
  text: `في أي عام حدث التالي: ${h[1]}؟`,
  correctAnswer: h[0],
  wrongOptions: getRandomWrongAnswers(h[0], ['1914','1918','1939','1945','1969','1789','1989','1492','1912','1991','2001','1900'], 3)
})).concat(HISTORY_EVENTS.map(h => ({
  text: `ما الحدث التاريخي البارز الذي حدث في عام ${h[0]}؟`,
  correctAnswer: h[1],
  wrongOptions: getRandomWrongAnswers(h[1], ALL_EVENTS, 3)
})));

// --- Movies: Actors to Movies ---
const ACTORS_MOVIES = [
  ['توم هانكس', 'Forrest Gump'], ['ليوناردو دي كابريو', 'Inception'], ['كريستيان بيل', 'The Dark Knight'],
  ['كيانو ريفز', 'The Matrix'], ['براد بيت', 'Fight Club'], ['مارلون براندو', 'The Godfather'],
  ['روبرت داوني جونيور', 'Iron Man'], ['هيو جاكمان', 'Logan'], ['هيث ليدجر', 'The Dark Knight'],
  ['ماثيو ماكونهي', 'Interstellar'], ['خواكين فينيكس', 'Joker'], ['جوني ديب', 'Pirates of the Caribbean'],
  ['توم كروز', 'Mission Impossible'], ['سيلفستر ستالون', 'Rocky'], ['ألباتشينو', 'Scarface'],
  ['ويل سميث', 'I Am Legend'], ['دانيل رادكليف', 'Harry Potter'], ['إيجا وود', 'The Lord of the Rings']
];
const ALL_MOVIES = ACTORS_MOVIES.map(a => a[1]);
const ALL_ACTORS = ACTORS_MOVIES.map(a => a[0]);
const mapMovies = ACTORS_MOVIES.map(a => ({
  text: `أي من هؤلاء الممثلين شارك ببطولة فيلم ${a[1]}؟`,
  correctAnswer: a[0],
  wrongOptions: getRandomWrongAnswers(a[0], ALL_ACTORS, 3)
})).concat(ACTORS_MOVIES.map(a => ({
  text: `ما هو الفيلم الشهير الذي قام ببطولته ${a[0]}؟`,
  correctAnswer: a[1],
  wrongOptions: getRandomWrongAnswers(a[1], ALL_MOVIES, 3)
})));

// --- Anime: Anime to Powers/Villains ---
const ANIME_TRIVIA = [
  ['ناروتو', 'الشارينغان', 'ساسكي', 'مادارا'],
  ['ون بيس', 'الهاكي', 'زورو', 'كايدو'],
  ['هجوم العمالقة', 'العملاق المهاجم', 'إيرين', 'زيك'],
  ['دراغون بول', 'سوبر ساياجين', 'غوكو', 'فريزا'],
  ['بليتش', 'البانكاي', 'إيتشيغو', 'أيزن'],
  ['قاتل الشياطين', 'تنفس الماء', 'تانجيرو', 'موزان'],
  ['هنتر x هنتر', 'النين', 'غون', 'ميريوم'],
  ['جوجوتسو كايسن', 'مجال التوسع', 'غوجو', 'سوكونا']
];
const ALL_ANIME_POWERS = ANIME_TRIVIA.map(a => a[1]);
const ALL_ANIME_PROTAGS = ANIME_TRIVIA.map(a => a[2]);
const ALL_ANIME_VILLAINS = ANIME_TRIVIA.map(a => a[3]);

const mapAnime: any[] = [];
ANIME_TRIVIA.forEach(a => {
  mapAnime.push({ text: `في أي أنمي تستخدم قوة '${a[1]}'؟`, correctAnswer: a[0], wrongOptions: getRandomWrongAnswers(a[0], ['ناروتو','ون بيس','هجوم العمالقة','دراغون بول','بليتش','قاتل الشياطين','هنتر x هنتر','جوجوتسو كايسن'], 3) });
  mapAnime.push({ text: `من هو البطل الرئيسي الذي يستخدم '${a[1]}'؟`, correctAnswer: a[2], wrongOptions: getRandomWrongAnswers(a[2], ALL_ANIME_PROTAGS, 3) });
  mapAnime.push({ text: `من هو الشرير الخصم لـ '${a[2]}'؟`, correctAnswer: a[3], wrongOptions: getRandomWrongAnswers(a[3], ALL_ANIME_VILLAINS, 3) });
});


// Islamic expanded automatically
const ISLAMIC_SURAHS = [
  ['البقرة', 'أطول سورة'], ['الكوثر', 'أقصر سورة'], ['الفاتحة', 'أم الكتاب'], 
  ['الإخلاص', 'تعدل ثلث القرآن'], ['الملك', 'المانعة من عذاب القبر'],
  ['الرحمن', 'عروس القرآن'], ['يس', 'قلب القرآن'], ['الكهف', 'نور بين الجمعتين']
];
const mapIslamic = ISLAMIC_SURAHS.map(i => ({
  text: `ما هي السورة التي توصف بأنها ${i[1]}؟`,
  correctAnswer: i[0],
  wrongOptions: getRandomWrongAnswers(i[0], ['البقرة','الكوثر','الفاتحة','الإخلاص','الملك','الرحمن','يس','الكهف','النساء','المائدة'], 3)
}));

// Exports!
export const GENERAL_KNOWLEDGE_EXPANDED = [...OLD_GEN, ...mapGeo];
export const SCI_EXPANDED = [...OLD_SCI, ...MATH_QUESTIONS];
export const FB_EXPANDED = [...OLD_FB, ...mapFb, ...mapUcl];
export const HIST_EXPANDED = [...OLD_HIST, ...mapHistory];
export const ISLAMIC_EXPANDED = [...OLD_ISL, ...mapIslamic];
export const MOVIES_EXPANDED = [...OLD_MOV, ...mapMovies];
export const ANIME_EXPANDED = [...OLD_ANI, ...mapAnime];
