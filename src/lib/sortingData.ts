export type SortingCategory = 'geography' | 'space' | 'animals' | 'history' | 'sports' | 'economy' | 'entertainment' | 'tech' | 'cars' | 'games';

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

export const SORTING_DATASETS: (Omit<SortingDataset, 'items'> & { items: Omit<SortingItem, 'id'>[] })[] = [
  {
    id: 'geo_population',
    category: 'geography',
    title: 'الدول حسب عدد السكان',
    question: 'رتب الدول من الأكثر إلى الأقل سكاناً:',
    order: 'desc',
    formatValue: 'مليون نسمة',
    items: [
      { name: 'الصين', value: 1425 }, { name: 'الهند', value: 1428 }, { name: 'الولايات المتحدة', value: 339 }, { name: 'إندونيسيا', value: 277 },
      { name: 'باكستان', value: 240 }, { name: 'نيجيريا', value: 223 }, { name: 'البرازيل', value: 216 }, { name: 'بنغلاديش', value: 172 },
      { name: 'روسيا', value: 144 }, { name: 'المكسيك', value: 128 }, { name: 'اليابان', value: 123 }, { name: 'مصر', value: 112 },
      { name: 'الفلبين', value: 117 }, { name: 'إثيوبيا', value: 126 }, { name: 'فيتنام', value: 98 }, { name: 'إيران', value: 89 },
      { name: 'تركيا', value: 85 }, { name: 'ألمانيا', value: 83 }, { name: 'المملكة المتحدة', value: 67 }, { name: 'فرنسا', value: 68 },
      { name: 'إيطاليا', value: 58 }, { name: 'السعودية', value: 36 }, { name: 'كندا', value: 38 }, { name: 'إسبانيا', value: 47 },
      { name: 'الأرجنتين', value: 46 }, { name: 'الجزائر', value: 45 }, { name: 'المغرب', value: 37 }, { name: 'العراق', value: 43 }
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
      { name: 'روسيا', value: 17.09 }, { name: 'كندا', value: 9.98 }, { name: 'الصين', value: 9.59 }, { name: 'الولايات المتحدة', value: 9.83 },
      { name: 'البرازيل', value: 8.51 }, { name: 'أستراليا', value: 7.69 }, { name: 'الهند', value: 3.28 }, { name: 'الأرجنتين', value: 2.78 },
      { name: 'كازاخستان', value: 2.72 }, { name: 'الجزائر', value: 2.38 }, { name: 'الكونغو الديمقراطية', value: 2.34 }, { name: 'السعودية', value: 2.14 },
      { name: 'المكسيك', value: 1.96 }, { name: 'إندونيسيا', value: 1.9 }, { name: 'السودان', value: 1.88 }, { name: 'ليبيا', value: 1.75 },
      { name: 'إيران', value: 1.64 }, { name: 'منغوليا', value: 1.56 }, { name: 'بيرو', value: 1.28 }, { name: 'تشاد', value: 1.28 }
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
      { name: 'نهر النيل', value: 6650 }, { name: 'نهر الأمازون', value: 6400 }, { name: 'نهر يانغتسي', value: 6300 }, { name: 'نهر المسيسيبي', value: 6275 },
      { name: 'نهر ينسي', value: 5539 }, { name: 'النهر الأصفر', value: 5464 }, { name: 'نهر أوب', value: 5410 }, { name: 'نهر بارانا', value: 4880 },
      { name: 'نهر الكونغو', value: 4700 }, { name: 'نهر ميخونغ', value: 4350 }, { name: 'نهر المكنزي', value: 4241 }, { name: 'نهر النيجر', value: 4180 },
      { name: 'نهر الفرات', value: 2800 }, { name: 'نهر السند', value: 3180 }, { name: 'نهر الدانوب', value: 2860 }, { name: 'نهر دجلة', value: 1900 }
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
      { name: 'إيفرست', value: 8848 }, { name: 'كي 2', value: 8611 }, { name: 'كانغشينجونغا', value: 8586 }, { name: 'لوتسي', value: 8516 },
      { name: 'ماكالو', value: 8485 }, { name: 'تشو أويو', value: 8188 }, { name: 'دهاولاغيري', value: 8167 }, { name: 'كليمنجارو', value: 5895 },
      { name: 'مون بلان', value: 4808 }, { name: 'أكونكاغوا', value: 6960 }, { name: 'دينالي (ماكينلي)', value: 6190 }, { name: 'طوبقال', value: 4167 }
    ]
  },
  {
    id: 'space_planets_radius',
    category: 'space',
    title: 'أحجام الكواكب',
    question: 'رتب الكواكب والأقمار من الأكبر إلى الأصغر حجماً:',
    order: 'desc',
    formatValue: 'ألف كم',
    items: [
      { name: 'المشتري', value: 139.8 }, { name: 'زحل', value: 116.4 }, { name: 'أورانوس', value: 50.7 }, { name: 'نبتون', value: 49.2 },
      { name: 'الأرض', value: 12.7 }, { name: 'الزهرة', value: 12.1 }, { name: 'المريخ', value: 6.7 }, { name: 'عطارد', value: 4.8 },
      { name: 'القمر (قمر الأرض)', value: 3.4 }, { name: 'غانيميد (قمر المشتري)', value: 5.2 }, { name: 'تيتان (قمر زحل)', value: 5.1 }, { name: 'كاليستو (قمر المشتري)', value: 4.8 },
      { name: 'أوروبا (قمر المشتري)', value: 3.1 }, { name: 'بلوتو', value: 2.37 }
    ]
  },
  {
    id: 'space_distance',
    category: 'space',
    title: 'البعد عن الشمس',
    question: 'رتب الكواكب من الأبعد إلى الأقرب عن الشمس:',
    order: 'desc',
    formatValue: 'مليون كم',
    items: [
      { name: 'نبتون', value: 4495 }, { name: 'أورانوس', value: 2871 }, { name: 'زحل', value: 1433 }, { name: 'المشتري', value: 778 },
      { name: 'سيريس الكوكب القزم', value: 413 }, { name: 'المريخ', value: 227 }, { name: 'الأرض', value: 149 }, { name: 'الزهرة', value: 108 },
      { name: 'عطارد', value: 57 }, { name: 'بلوتو', value: 5906 }, { name: 'إريس', value: 10125 }
    ]
  },
  {
    id: 'animals_weight',
    category: 'animals',
    title: 'أوزان الحيوانات',
    question: 'رتب الحيوانات من الأثقل إلى الأخف وزناً:',
    order: 'desc',
    formatValue: 'كجم',
    items: [
      { name: 'الحوت الأزرق', value: 150000 }, { name: 'فيل الأدغال الإفريقي', value: 6000 }, { name: 'وحيد القرن الأبيض', value: 2300 }, { name: 'فرس النهر', value: 1500 },
      { name: 'ثور البيسون', value: 900 }, { name: 'الدب القطبي', value: 450 }, { name: 'الزرافة', value: 1200 }, { name: 'النمر السيبيري', value: 300 },
      { name: 'الأسد', value: 190 }, { name: 'الغوريلا الجبلية', value: 160 }, { name: 'الفهد', value: 72 }, { name: 'النعامة', value: 100 },
      { name: 'الذئب الرمادي', value: 45 }, { name: 'كلب الهاسكي', value: 27 }, { name: 'النسر الذهبي', value: 6.5 }, { name: 'الثعلب الأحمر', value: 8 },
      { name: 'القط المنزلي', value: 4.5 }, { name: 'البطريق الإمبراطوري', value: 30 }
    ]
  },
  {
    id: 'animals_speed',
    category: 'animals',
    title: 'سرعات الحيوانات',
    question: 'رتب الحيوانات من الأسرع إلى الأبطأ (السرعة القصوى):',
    order: 'desc',
    formatValue: 'كم/س',
    items: [
      { name: 'صقر الشاهين', value: 389 }, { name: 'العقاب الذهبي', value: 320 }, { name: 'الفهد', value: 120 }, { name: 'سمكة الشراع', value: 110 },
      { name: 'الظباء الشائكة', value: 88 }, { name: 'الأسد', value: 80 }, { name: 'الحصان', value: 70 }, { name: 'الكلب السلوقي', value: 72 },
      { name: 'الكانغر', value: 71 }, { name: 'النعامة', value: 70 }, { name: 'الثعلب الأحمر', value: 50 }, { name: 'الفيل', value: 40 },
      { name: 'الإنسان (يوسين بولت)', value: 44.7 }, { name: 'الدب الرمادي', value: 56 }, { name: 'القط المنزلي', value: 48 }, { name: 'العنكبوت', value: 1.9 },
      { name: 'سلحفاة الغالاباغوس', value: 0.3 }, { name: 'الحلزون', value: 0.04 }, { name: 'حيوان الكسلان', value: 0.27 }
    ]
  },
  {
    id: 'history_civilizations',
    category: 'history',
    title: 'نشأة الحضارات',
    question: 'رتب الحضارات من الأقدم إلى الأحدث نشأة:',
    order: 'desc',
    formatValue: 'ق.م',
    items: [
      { name: 'الحضارة السومرية', value: 4500 }, { name: 'الحضارة المصرية القديمة', value: 3100 }, { name: 'حضارة وادي السند', value: 2500 },
      { name: 'الحضارة المينوية', value: 2000 }, { name: 'الحضارة البابلية (القديمة)', value: 1894 }, { name: 'الحضارة الصينية (شانغ)', value: 1600 },
      { name: 'حضارة الأولمك', value: 1200 }, { name: 'مملكة كوش', value: 1070 }, { name: 'حضارة المايا', value: 2000 },
      { name: 'الحضارة الإغريقية', value: 800 }, { name: 'الإمبراطورية الأليمانية (الفارسية)', value: 550 }, { name: 'الإمبراطورية الرومانية', value: 27 },
      { name: 'إمبراطورية الإنكا', value: 1438 } // This is AD, but we can treat as negative for sorting if we wanted, let's keep it safe with BC positive
    ]
  },
  {
    id: 'history_empires_size',
    category: 'history',
    title: 'مساحة الإمبراطوريات',
    question: 'رتب الإمبراطوريات من الأكبر إلى الأصغر مساحة (في أوجها):',
    order: 'desc',
    formatValue: 'مليون كم²',
    items: [
      { name: 'الإمبراطورية البريطانية', value: 35.5 }, { name: 'الإمبراطورية المغولية', value: 24.0 }, { name: 'الإمبراطورية الروسية', value: 22.8 },
      { name: 'سلالة تشينغ (الصين)', value: 14.7 }, { name: 'الإمبراطورية الإسبانية', value: 13.7 }, { name: 'الخلافة الأموية', value: 11.1 },
      { name: 'الإمبراطورية الفرنسية الاستعمارية', value: 11.5 }, { name: 'الخلافة العباسية', value: 11.1 }, { name: 'إمبراطورية البرازيل', value: 8.3 },
      { name: 'الإمبراطورية الرومانية', value: 5.0 }, { name: 'إمبراطورية الإسكندر الأكبر', value: 5.2 }, { name: 'الإمبراطورية العثمانية', value: 5.2 }
    ]
  },
  {
    id: 'sports_world_cup',
    category: 'sports',
    title: 'بطولات كأس العالم',
    question: 'رتب المنتخبات حسب عدد بطولات كأس العالم للمنتخبات للرجال:',
    order: 'desc',
    formatValue: 'بطولة',
    items: [
      { name: 'البرازيل', value: 5 }, { name: 'ألمانيا', value: 4 }, { name: 'إيطاليا', value: 4 }, { name: 'الأرجنتين', value: 3 },
      { name: 'فرنسا', value: 2 }, { name: 'الأوروغواي', value: 2 }, { name: 'إنجلترا', value: 1 }, { name: 'إسبانيا', value: 1 }
    ]
  },
  {
    id: 'sports_champions',
    category: 'sports',
    title: 'بطولات دوري أبطال أوروبا',
    question: 'رتب الأندية حسب عدد بطولات دوري أبطال أوروبا:',
    order: 'desc',
    formatValue: 'بطولة',
    items: [
      { name: 'ريال مدريد', value: 15 }, { name: 'ميلان', value: 7 }, { name: 'بايرن ميونخ', value: 6 }, { name: 'ليفربول', value: 6 },
      { name: 'برشلونة', value: 5 }, { name: 'أياكس', value: 4 }, { name: 'مانشستر يونايتد', value: 3 }, { name: 'إنتر ميلان', value: 3 },
      { name: 'تشيلسي', value: 2 }, { name: 'نوتنغهام فورست', value: 2 }, { name: 'يوفنتوس', value: 2 }, { name: 'بنفيكا', value: 2 }, { name: 'بورتو', value: 2 }
    ]
  },
  {
    id: 'sports_goals',
    category: 'sports',
    title: 'أهداف كرة القدم التاريخية',
    question: 'رتب اللاعبين حسب عدد الأهداف الرسمية في مسيرتهم (تقريبياً):',
    order: 'desc',
    formatValue: 'هدف',
    items: [
      { name: 'كريستيانو رونالدو', value: 890 }, { name: 'ليونيل ميسي', value: 835 }, { name: 'بيليه', value: 762 }, { name: 'روماريو', value: 755 },
      { name: 'فيرينتس بوشكاش', value: 724 }, { name: 'جيرد مولر', value: 735 }, { name: 'جوزيف بيكان', value: 805 }, { name: 'روبرت ليفاندوفسكي', value: 650 },
      { name: 'زلاتان إبراهيموفيتش', value: 573 }
    ]
  },
  {
    id: 'movies_box_office',
    category: 'entertainment',
    title: 'إيرادات الأفلام',
    question: 'رتب الأفلام حسب إيرادات شباك التذاكر عالمياً:',
    order: 'desc',
    formatValue: 'مليار دولار',
    items: [
      { name: 'Avatar', value: 2.92 }, { name: 'Avengers: Endgame', value: 2.79 }, { name: 'Avatar: The Way of Water', value: 2.32 },
      { name: 'Titanic', value: 2.26 }, { name: 'Star Wars: The Force Awakens', value: 2.07 }, { name: 'Avengers: Infinity War', value: 2.05 },
      { name: 'Spider-Man: No Way Home', value: 1.92 }, { name: 'Jurassic World', value: 1.67 }, { name: 'The Lion King (2019)', value: 1.66 },
      { name: 'The Avengers', value: 1.52 }, { name: 'Furious 7', value: 1.51 }, { name: 'Top Gun: Maverick', value: 1.49 },
      { name: 'Frozen II', value: 1.45 }, { name: 'Barbie', value: 1.44 }, { name: 'Black Panther', value: 1.34 }, { name: 'Harry Potter 8', value: 1.34 }
    ]
  },
  {
    id: 'economy_market_cap',
    category: 'economy',
    title: 'القيمة السوقية',
    question: 'رتب الشركات حسب القيمة السوقية (تقديري 2024):',
    order: 'desc',
    formatValue: 'تريليون دولار',
    items: [
      { name: 'مايكروسوفت', value: 3.1 }, { name: 'أبل', value: 2.9 }, { name: 'إنفيديا', value: 2.8 }, { name: 'ألفابت (جوجل)', value: 1.9 },
      { name: 'أمازون', value: 1.85 }, { name: 'أرامكو السعودية', value: 1.8 }, { name: 'ميتا', value: 1.2 }, { name: 'بيركشاير هاثاواي', value: 0.8 },
      { name: 'تيسلا', value: 0.6 }, { name: 'تي إس إم سي (TSMC)', value: 0.7 }, { name: 'تينسنت', value: 0.4 }, { name: 'فيزا', value: 0.5 }
    ]
  },
  {
    id: 'entertainment_anime',
    category: 'entertainment',
    title: 'حلقات الأنمي',
    question: 'رتب الأنمي حسب عدد الحلقات الكلي تقريباً (الأكثر للأقل):',
    order: 'desc',
    formatValue: 'حلقة',
    items: [
      { name: 'Sazae-san', value: 7500 }, { name: 'Doraemon', value: 1787 }, { name: 'Chibi Maruko-chan', value: 1330 }, { name: 'Detective Conan', value: 1100 },
      { name: 'One Piece', value: 1090 }, { name: 'Crayon Shin-chan', value: 1040 }, { name: 'Naruto (الكامل)', value: 720 }, { name: 'Dragon Ball (متعدد)', value: 639 },
      { name: 'Gintama', value: 367 }, { name: 'Bleach', value: 366 }, { name: 'Fairy Tail', value: 328 }, { name: 'Hunter x Hunter', value: 148 },
      { name: 'Black Clover', value: 170 }, { name: 'Attack on Titan', value: 89 }, { name: 'Fullmetal Alchemist: B', value: 64 }, { name: 'Death Note', value: 37 }
    ]
  },
  {
    id: 'tech_founded',
    category: 'tech',
    title: 'تأسيس شركات التقنية',
    question: 'رتب الشركات التقنية حسب تاريخ التأسيس (الأقدم أولاً):',
    order: 'asc', // ascending means lowest year is considered first (correct)
    formatValue: 'م',
    items: [
      { name: 'نينتندو', value: 1889 }, { name: 'IBM', value: 1911 }, { name: 'سامسونج', value: 1938 }, { name: 'HP', value: 1939 },
      { name: 'سوني', value: 1946 }, { name: 'إنتل', value: 1968 }, { name: 'AMD', value: 1969 }, { name: 'مايكروسوفت', value: 1975 },
      { name: 'أبل', value: 1976 }, { name: 'أوراكل', value: 1977 }, { name: 'سيسكو', value: 1984 }, { name: 'أمازون', value: 1994 },
      { name: 'جوجل', value: 1998 }, { name: 'نتفليكس', value: 1997 }, { name: 'ميتا (فيسبوك)', value: 2004 }, { name: 'تويتر', value: 2006 },
      { name: 'واتساب', value: 2009 }, { name: 'إنستغرام', value: 2010 }, { name: 'سناب شات', value: 2011 }, { name: 'أوبن إيه آي (OpenAI)', value: 2015 }
    ]
  },
  {
    id: 'games_sales',
    category: 'games',
    title: 'مبيعات الألعاب التاريخية',
    question: 'رتب الألعاب والإصدارات حسب عدد النسخ المباعة تاريخياً:',
    order: 'desc',
    formatValue: 'مليون نسخة',
    items: [
      { name: 'Minecraft', value: 300 }, { name: 'Grand Theft Auto V', value: 195 }, { name: 'Tetris (EA)', value: 100 }, { name: 'Wii Sports', value: 82 },
      { name: 'PUBG: Battlegrounds', value: 75 }, { name: 'Mario Kart 8 / Deluxe', value: 69 }, { name: 'Red Dead Redemption 2', value: 61 },
      { name: 'Super Mario Bros.', value: 58 }, { name: 'Overwatch', value: 50 }, { name: 'The Witcher 3', value: 50 }, { name: 'Animal Crossing: NH', value: 44 },
      { name: 'Pac-Man', value: 42 }, { name: 'Terraria', value: 44 }, { name: 'Super Mario World', value: 20 }, { name: 'Cyberpunk 2077', value: 25 }
    ]
  },
  {
    id: 'games_consoles',
    category: 'games',
    title: 'مبيعات أجهزة الكونسول',
    question: 'رتب أجهزة الألعاب المنزلية والمحمولة حسب إجمالي المبيعات:',
    order: 'desc',
    formatValue: 'مليون وحدة',
    items: [
      { name: 'PlayStation 2', value: 155 }, { name: 'Nintendo DS', value: 154 }, { name: 'Nintendo Switch', value: 139 }, { name: 'Game Boy/Color', value: 118 },
      { name: 'PlayStation 4', value: 117 }, { name: 'PlayStation 1', value: 102 }, { name: 'Wii', value: 101 }, { name: 'PlayStation 3', value: 87 },
      { name: 'Xbox 360', value: 84 }, { name: 'Game Boy Advance', value: 81 }, { name: 'PSP', value: 80 }, { name: 'Nintendo 3DS', value: 75 },
      { name: 'NES', value: 61 }, { name: 'SNES', value: 49 }, { name: 'Xbox One', value: 58 }, { name: 'Sega Genesis', value: 30 }
    ]
  },
  {
    id: 'cars_speed',
    category: 'cars',
    title: 'سرعات السيارات الخارقة',
    question: 'رتب السيارات حسب سرعتها القصوى المسجلة (أو المزعومة):',
    order: 'desc',
    formatValue: 'كم/س',
    items: [
      { name: 'بوغاتي بولايد', value: 500 }, { name: 'بوغاتي تشيرون سوبر سبورت', value: 490 }, { name: 'إس إس سي تواتارا', value: 474 },
      { name: 'كوينيجسيج أجيرا آر إس', value: 447 }, { name: 'هينيسي فينوم جي تي', value: 435 }, { name: 'بوغاتي فيرون سوبر سبورت', value: 431 },
      { name: 'ريماك نيفيرا', value: 412 }, { name: 'مكلارين سبيدتيل', value: 402 }, { name: 'أستون مارتن فالكيري', value: 402 },
      { name: 'مكلارين إف 1', value: 386 }, { name: 'باغاني هويرا', value: 383 }, { name: 'لامبورغيني أفينتادور SVJ', value: 350 },
      { name: 'فيراري لافيراري', value: 349 }, { name: 'بورش 918 سبايدر', value: 345 }, { name: 'نيسان GT-R Nismo', value: 315 },
      { name: 'فورد موستانج شيلبي GT500', value: 290 }, { name: 'شيفروليه كورفيت C8', value: 312 }, { name: 'لامبورغيني هوراكان', value: 325 }
    ]
  },
  {
    id: 'cars_production_year',
    category: 'cars',
    title: 'تاريخ إطلاق طرازات السيارات',
    question: 'رتب الطرازات والأجيال الأيقونية حسب عام إطلاقها لأول مرة:',
    order: 'asc',
    formatValue: 'م',
    items: [
      { name: 'فورد موديل تي', value: 1908 }, { name: 'فولكسفاجن بيتل', value: 1938 }, { name: 'جيب ويليز', value: 1941 }, { name: 'لاند روفر سيريز 1', value: 1948 },
      { name: 'شيفروليه كورفيت السي 1', value: 1953 }, { name: 'تويوتا لاند كروزر (J40)', value: 1960 }, { name: 'فورد موستانج', value: 1964 },
      { name: 'بورش 911', value: 1964 }, { name: 'تويوتا كورولا', value: 1966 }, { name: 'لادا نيفا', value: 1977 }, { name: 'مرسيدس-بنز الفئة جي', value: 1979 },
      { name: 'فيراري F40', value: 1987 }, { name: 'مكلارين F1', value: 1992 }, { name: 'أودي R8', value: 2006 }, { name: 'نيسان GTR-R35', value: 2007 },
      { name: 'تيسلا موديل إس', value: 2012 }
    ]
  }
];

export interface SortingQuestion {
  id: string;
  category: SortingCategory;
  title: string;
  question: string;
  order: 'desc' | 'asc';
  formatValue: string;
  items: SortingItem[];
}

export function generateSortingQuestion(
  seenQuestionIds: string[], 
  seenItemNames: string[], // Added for item-level dedup
  lastCategory?: SortingCategory,
  lastOrderType?: 'desc' | 'asc'
): SortingQuestion {
  // First, find datasets that match our strict rules
  const validDatasets = SORTING_DATASETS.filter(d => 
    (d.category !== lastCategory) && (d.order !== lastOrderType)
  );
  
  // If rules are too strict, loosen the order rule
  let datasetPool = validDatasets.length > 0 ? validDatasets : SORTING_DATASETS.filter(d => d.category !== lastCategory);
  
  // If still nothing, use all
  if (datasetPool.length === 0) datasetPool = SORTING_DATASETS;

  let attempts = 0;
  while (attempts < 500) {
    const rawDataset = datasetPool[Math.floor(Math.random() * datasetPool.length)];
    
    // Attempt to pick items that haven't been seen recently
    const shuffledItems = [...rawDataset.items]
        .map(i => ({ ...i, id: `item_${i.name}` }))
        .sort(() => 0.5 - Math.random());
        
    // Prefer unseen items
    const unseenItems = shuffledItems.filter(i => !seenItemNames.includes(i.name));
    const seenItems = shuffledItems.filter(i => seenItemNames.includes(i.name));
    
    let candidateItems = [...unseenItems];
    if (candidateItems.length < 4) {
      // Need 4 items, backfill with seen ones
      candidateItems = [...candidateItems, ...seenItems].slice(0, 4);
    } else {
      candidateItems = candidateItems.slice(0, 4);
    }
    
    // But they still need to be 4 unique visible random items
    // Shuffle the 4 candidate items
    const selected = [...candidateItems].sort(() => 0.5 - Math.random());

    // Calculate correct sorted order
    const sortedSelected = [...selected].sort((a, b) => rawDataset.order === 'desc' ? b.value - a.value : a.value - b.value);
    
    // Make sure we haven't seen this exact exact question before
    const qid = rawDataset.id + '_' + sortedSelected.map(i => i.name).join('_');

    if (!seenQuestionIds.includes(qid)) {
      return {
        id: qid,
        category: rawDataset.category,
        title: rawDataset.title,
        question: rawDataset.question,
        order: rawDataset.order,
        formatValue: rawDataset.formatValue,
        items: selected,
      };
    }
    attempts++;
  }
  
  // Fallback
  const rawDataset = SORTING_DATASETS[Math.floor(Math.random() * SORTING_DATASETS.length)];
  const selected = [...rawDataset.items].map(i => ({ ...i, id: `item_${i.name}` })).sort(() => 0.5 - Math.random()).slice(0, 4);
  const sortedSelected = [...selected].sort((a, b) => rawDataset.order === 'desc' ? b.value - a.value : a.value - b.value);
  return {
    id: rawDataset.id + '_' + sortedSelected.map(i => i.name).join('_'),
    category: rawDataset.category,
    title: rawDataset.title,
    question: rawDataset.question,
    order: rawDataset.order,
    formatValue: rawDataset.formatValue,
    items: selected,
  };
}
