import fs from 'fs';

const datasets = [
  {
    id: 'geo_population',
    category: 'geography',
    title: 'الدول حسب عدد السكان',
    question: 'رتب الدول من الأكثر إلى الأقل سكاناً:',
    order: 'desc',
    formatValue: 'مليون نسمة',
    items: [
      { name: 'الصين', value: 1425 },
      { name: 'الهند', value: 1428 },
      { name: 'الولايات المتحدة', value: 339 },
      { name: 'إندونيسيا', value: 277 },
      { name: 'باكستان', value: 240 },
      { name: 'نيجيريا', value: 223 },
      { name: 'البرازيل', value: 216 },
      { name: 'بنغلاديش', value: 172 },
      { name: 'روسيا', value: 144 },
      { name: 'المكسيك', value: 128 },
      { name: 'اليابان', value: 123 },
      { name: 'مصر', value: 112 },
      { name: 'الفلبين', value: 117 },
      { name: 'إثيوبيا', value: 126 },
      { name: 'فيتنام', value: 98 },
      { name: 'إيران', value: 89 },
      { name: 'تركيا', value: 85 },
      { name: 'ألمانيا', value: 83 },
      { name: 'المملكة المتحدة', value: 67 },
      { name: 'فرنسا', value: 68 },
      { name: 'إيطاليا', value: 58 },
      { name: 'السعودية', value: 36 },
      { name: 'كندا', value: 38 },
      { name: 'إسبانيا', value: 47 }
    ]
  },
  {
    id: 'geo_area',
    category: 'geography',
    title: 'الدول حسب المساحة',
    question: 'رتب الدول من الأكبر مساحة إلى الأصغر:',
    order: 'desc',
    formatValue: 'مليون كم²',
    items: [
      { name: 'روسيا', value: 17.09 },
      { name: 'كندا', value: 9.98 },
      { name: 'الصين', value: 9.59 },
      { name: 'الولايات المتحدة', value: 9.83 },
      { name: 'البرازيل', value: 8.51 },
      { name: 'أستراليا', value: 7.69 },
      { name: 'الهند', value: 3.28 },
      { name: 'الأرجنتين', value: 2.78 },
      { name: 'كازاخستان', value: 2.72 },
      { name: 'الجزائر', value: 2.38 },
      { name: 'الكونغو', value: 2.34 },
      { name: 'السعودية', value: 2.14 },
      { name: 'المكسيك', value: 1.96 },
      { name: 'إندونيسيا', value: 1.9 },
      { name: 'السودان', value: 1.88 },
      { name: 'ليبيا', value: 1.75 },
      { name: 'إيران', value: 1.64 },
      { name: 'منغوليا', value: 1.56 },
      { name: 'بيرو', value: 1.28 }
    ]
  },
  {
    id: 'space_planets_radius',
    category: 'space',
    title: 'الكواكب حسب الحجم (القطر)',
    question: 'رتب الكواكب من الأكبر إلى الأصغر حجماً:',
    order: 'desc',
    formatValue: 'ألف كم',
    items: [
      { name: 'المشتري', value: 139.8 },
      { name: 'زحل', value: 116.4 },
      { name: 'أورانوس', value: 50.7 },
      { name: 'نبتون', value: 49.2 },
      { name: 'الأرض', value: 12.7 },
      { name: 'الزهرة', value: 12.1 },
      { name: 'المريخ', value: 6.7 },
      { name: 'عطارد', value: 4.8 }
    ]
  },
  {
    id: 'space_distance',
    category: 'space',
    title: 'الكواكب حسب البعد عن الشمس',
    question: 'رتب الكواكب من الأبعد إلى الأقرب عن الشمس:',
    order: 'desc',
    formatValue: 'مليون كم',
    items: [
      { name: 'نبتون', value: 4495 },
      { name: 'أورانوس', value: 2871 },
      { name: 'زحل', value: 1433 },
      { name: 'المشتري', value: 778 },
      { name: 'المريخ', value: 227 },
      { name: 'الأرض', value: 149 },
      { name: 'الزهرة', value: 108 },
      { name: 'عطارد', value: 57 }
    ]
  },
  {
    id: 'animals_weight',
    category: 'animals',
    title: 'الحيوانات حسب الوزن',
    question: 'رتب الحيوانات من الأثقل إلى الأخف وزناً:',
    order: 'desc',
    formatValue: 'كجم',
    items: [
      { name: 'الحوت الأزرق', value: 150000 },
      { name: 'فيل الأدغال الإفريقي', value: 6000 },
      { name: 'وحيد القرن الأبيض', value: 2300 },
      { name: 'فرس النهر', value: 1500 },
      { name: 'الزرافة', value: 1200 },
      { name: 'الدب القطبي', value: 450 },
      { name: 'الأسد الإفريقي', value: 190 },
      { name: 'الغوريلا', value: 160 },
      { name: 'النمر', value: 130 },
      { name: 'الذئب', value: 45 },
      { name: 'الكلب (متوسط)', value: 25 },
      { name: 'الثعلب', value: 8 },
      { name: 'القط', value: 4 },
      { name: 'الأرنب', value: 2 }
    ]
  },
  {
    id: 'animals_speed',
    category: 'animals',
    title: 'الحيوانات حسب السرعة بساپ',
    question: 'رتب الحيوانات من الأسرع إلى الأبطأ:',
    order: 'desc',
    formatValue: 'كم/س',
    items: [
      { name: 'صقر الشاهين', value: 389 },
      { name: 'الفهد', value: 120 },
      { name: 'الظباء الشائكة', value: 88 },
      { name: 'الأسد', value: 80 },
      { name: 'الحصان', value: 70 },
      { name: 'النعامة', value: 70 },
      { name: 'الكلب السلوقي', value: 72 },
      { name: 'الكانغر', value: 71 },
      { name: 'الفيل', value: 40 },
      { name: 'الإنسان (يوسين بولت)', value: 44 },
      { name: 'الزرافة', value: 50 },
      { name: 'الدب الرمادي', value: 56 },
      { name: 'القط المنزلي', value: 48 },
      { name: 'العنكبوت', value: 1.9 },
      { name: 'السلحفاة العملاقة', value: 0.3 },
      { name: 'الحلزون', value: 0.04 }
    ]
  },
  {
    id: 'history_civilizations',
    category: 'history',
    title: 'الحضارات القديمة',
    question: 'رتب الحضارات من الأقدم إلى الأحدث نشأة:',
    order: 'asc', // For dates BC, the smaller the number (if negative), or we just use normal values and say earliest to latest start year. 
    formatValue: 'ق.م',
    items: [
      { name: 'الحضارة السومرية', value: 4500 },
      { name: 'الحضارة المصرية القديمة', value: 3100 },
      { name: 'حضارة وادي السند', value: 2500 },
      { name: 'الحضارة الصينية (شانغ)', value: 1600 },
      { name: 'الحضارة الإغريقية', value: 800 },
      { name: 'الإمبراطورية الرومانية', value: 27 },
      { name: 'الحضارة البابلية (الحديثة)', value: 626 }
    ]
  },
  {
    id: 'sports_world_cup',
    category: 'sports',
    title: 'كأس العالم',
    question: 'رتب المنتخبات حسب عدد بطولات كأس العالم:',
    order: 'desc',
    formatValue: 'بطولة',
    items: [
      { name: 'البرازيل', value: 5 },
      { name: 'ألمانيا', value: 4 },
      { name: 'إيطاليا', value: 4 },
      { name: 'الأرجنتين', value: 3 },
      { name: 'فرنسا', value: 2 },
      { name: 'الأوروغواي', value: 2 },
      { name: 'إنجلترا', value: 1 },
      { name: 'إسبانيا', value: 1 }
    ]
  },
  {
    id: 'sports_champions',
    category: 'sports',
    title: 'دوري أبطال أوروبا',
    question: 'رتب الأندية حسب عدد دوري أبطال أوروبا:',
    order: 'desc',
    formatValue: 'بطولة',
    items: [
      { name: 'ريال مدريد', value: 15 },
      { name: 'ميلان', value: 7 },
      { name: 'بايرن ميونخ', value: 6 },
      { name: 'ليفربول', value: 6 },
      { name: 'برشلونة', value: 5 },
      { name: 'أياكس', value: 4 },
      { name: 'مانشستر يونايتد', value: 3 },
      { name: 'إنتر ميلان', value: 3 },
      { name: 'تشيلسي', value: 2 },
      { name: 'نوتنغهام فورست', value: 2 },
      { name: 'يوفنتوس', value: 2 },
      { name: 'بنفيكا', value: 2 }
    ]
  },
  {
    id: 'movies_box_office',
    category: 'entertainment',
    title: 'شباك التذاكر',
    question: 'رتب الأفلام حسب إيرادات شباك التذاكر عالمياً:',
    order: 'desc',
    formatValue: 'مليار دولار',
    items: [
      { name: 'Avatar', value: 2.92 },
      { name: 'Avengers: Endgame', value: 2.79 },
      { name: 'Avatar: The Way of Water', value: 2.32 },
      { name: 'Titanic', value: 2.26 },
      { name: 'Star Wars: The Force Awakens', value: 2.07 },
      { name: 'Avengers: Infinity War', value: 2.05 },
      { name: 'Spider-Man: No Way Home', value: 1.92 },
      { name: 'Jurassic World', value: 1.67 },
      { name: 'The Lion King (2019)', value: 1.66 },
      { name: 'The Avengers', value: 1.52 },
      { name: 'Furious 7', value: 1.51 },
      { name: 'Top Gun: Maverick', value: 1.49 }
    ]
  },
  {
    id: 'economy_market_cap',
    category: 'economy',
    title: 'القيمة السوقية',
    question: 'رتب الشركات حسب القيمة السوقية:',
    order: 'desc',
    formatValue: 'تريليون دولار',
    items: [
      { name: 'مايكروسوفت', value: 3.2 },
      { name: 'أبل', value: 3.1 },
      { name: 'إنفيديا', value: 2.9 },
      { name: 'أرامكو السعودية', value: 1.8 },
      { name: 'ألفابت (جوجل)', value: 1.9 },
      { name: 'أمازون', value: 1.85 },
      { name: 'ميتا', value: 1.2 },
      { name: 'بيركشاير هاثاواي', value: 0.8 },
      { name: 'تيسلا', value: 0.6 }
    ]
  },
  {
    id: 'entertainment_anime',
    category: 'entertainment',
    title: 'حلقات الأنمي',
    question: 'رتب الأنمي حسب عدد الحلقات (الأكثر للأقل):',
    order: 'desc',
    formatValue: 'حلقة',
    items: [
      { name: 'Sazae-san', value: 7500 },
      { name: 'Nintama Rantaro', value: 2320 },
      { name: 'Ojarumaru', value: 1940 },
      { name: 'Doraemon (1979)', value: 1787 },
      { name: 'Chibi Maruko-chan', value: 1330 },
      { name: 'Detective Conan', value: 1100 },
      { name: 'Crayon Shin-chan', value: 1040 },
      { name: 'One Piece', value: 1090 },
      { name: 'Naruto (مع شيبودن)', value: 720 },
      { name: 'Bleach', value: 366 },
      { name: 'Dragon Ball (متعدد)', value: 639 },
      { name: 'Gintama', value: 367 },
      { name: 'Fairy Tail', value: 328 },
      { name: 'Hunter x Hunter (2011)', value: 148 }
    ]
  },
  {
    id: 'tech_founded',
    category: 'tech',
    title: 'تأسيس الشركات التقنية',
    question: 'رتب الشركات التقنية حسب تاريخ التأسيس (الأقدم أولاً):',
    order: 'asc',
    formatValue: 'م',
    items: [
      { name: 'IBM', value: 1911 },
      { name: 'HP', value: 1939 },
      { name: 'سوني', value: 1946 },
      { name: 'إنتل', value: 1968 },
      { name: 'مايكروسوفت', value: 1975 },
      { name: 'أبل', value: 1976 },
      { name: 'أمازون', value: 1994 },
      { name: 'نتفليكس', value: 1997 },
      { name: 'جوجل', value: 1998 },
      { name: 'ميتا (فيسبوك)', value: 2004 },
      { name: 'يوتيوب', value: 2005 },
      { name: 'تويتر', value: 2006 },
      { name: 'إنستغرام', value: 2010 },
      { name: 'سناب شات', value: 2011 },
      { name: 'تيك توك', value: 2016 }
    ]
  },
  {
    id: 'geo_mountains',
    category: 'geography',
    title: 'أطول الجبال',
    question: 'رتب الجبال من الأعلى إلى الأقل ارتفاعاً:',
    order: 'desc',
    formatValue: 'متر',
    items: [
      { name: 'إيفرست', value: 8848 },
      { name: 'كي 2', value: 8611 },
      { name: 'كانغشينجونغا', value: 8586 },
      { name: 'لوتسي', value: 8516 },
      { name: 'ماكالو', value: 8485 },
      { name: 'تشو أويو', value: 8188 },
      { name: 'كليمنجارو', value: 5895 },
      { name: 'مون بلان', value: 4808 },
      { name: 'أكونكاغوا', value: 6960 },
      { name: 'دينالي', value: 6190 }
    ]
  },
  {
    id: 'geo_rivers',
    category: 'geography',
    title: 'أطوال الأنهار',
    question: 'رتب الأنهار من الأطول إلى الأقصر:',
    order: 'desc',
    formatValue: 'كم',
    items: [
      { name: 'نهر النيل', value: 6650 },
      { name: 'نهر الأمازون', value: 6400 },
      { name: 'نهر يانغتسي', value: 6300 },
      { name: 'نهر المسيسيبي', value: 6275 },
      { name: 'نهر ينسي', value: 5539 },
      { name: 'النهر الأصفر', value: 5464 },
      { name: 'نهر أوب', value: 5410 },
      { name: 'نهر بارانا', value: 4880 },
      { name: 'نهر الكونغو', value: 4700 },
      { name: 'نهر ميخونغ', value: 4350 },
      { name: 'نهر المكنزي', value: 4241 }
    ]
  }
];

// Add generating script logic
let lines = [];
lines.push(`export type SortingCategory = 'geography' | 'space' | 'animals' | 'history' | 'sports' | 'economy' | 'entertainment' | 'tech';

export interface SortingItem {
  id: string;
  name: string;
  value: number;
}

export interface SortingDataset {
  id: string;
  category: SortingCategory;
  title: string;
  question: string;
  order: 'desc' | 'asc';
  formatValue: string;
  items: SortingItem[];
}

export const SORTING_DATASETS: SortingDataset[] = ${JSON.stringify(datasets, null, 2)};

export interface SortingQuestion {
  id: string; // e.g. "geo_population_الصين_الهند_الولايات المتحدة_إندونيسيا"
  category: SortingCategory;
  title: string;
  question: string;
  order: 'desc' | 'asc';
  formatValue: string;
  items: SortingItem[]; // The 4 items
}

export function generateSortingQuestion(seenQuestionIds: string[], lastCategory?: SortingCategory): SortingQuestion {
  const validDatasets = SORTING_DATASETS.filter(d => 
    !lastCategory || d.category !== lastCategory
  );
  const datasetPool = validDatasets.length > 0 ? validDatasets : SORTING_DATASETS;

  let attempts = 0;
  while (attempts < 100) {
    const dataset = datasetPool[Math.floor(Math.random() * datasetPool.length)];
    const shuffledItems = [...dataset.items].sort(() => 0.5 - Math.random());
    const selected = shuffledItems.slice(0, 4);

    const sortedSelected = [...selected].sort((a, b) => dataset.order === 'desc' ? b.value - a.value : a.value - b.value);
    const id = dataset.id + '_' + sortedSelected.map(i => i.name).join('_');

    if (!seenQuestionIds.includes(id)) {
      return {
        id,
        category: dataset.category,
        title: dataset.title,
        question: dataset.question,
        order: dataset.order,
        formatValue: dataset.formatValue,
        items: selected,
      };
    }
    attempts++;
  }
  
  const dataset = SORTING_DATASETS[Math.floor(Math.random() * SORTING_DATASETS.length)];
  const selected = [...dataset.items].sort(() => 0.5 - Math.random()).slice(0, 4);
  const sortedSelected = [...selected].sort((a, b) => dataset.order === 'desc' ? b.value - a.value : a.value - b.value);
  return {
    id: dataset.id + '_' + sortedSelected.map(i => i.name).join('_'),
    category: dataset.category,
    title: dataset.title,
    question: dataset.question,
    order: dataset.order,
    formatValue: dataset.formatValue,
    items: selected,
  };
}
`);

fs.writeFileSync('src/lib/sortingData.ts', lines.join('\n'));
console.log('Generating sortingData ok!');
