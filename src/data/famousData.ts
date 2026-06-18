export interface FamousEntity {
  name: string;
  value: number; // Important for comparison
  emoji?: string;
  image?: string;
}

export interface FamousCategory {
  id: string;
  name: string;
  question: string;
  unit: string;
  entities: FamousEntity[];
}

export const famousCategories: FamousCategory[] = [
  {
    id: 'football',
    name: 'كرة القدم',
    question: 'أيهما أكثر متابعة على إنستجرام؟',
    unit: 'مليون متابع',
    entities: [
      { name: 'كريستيانو رونالدو', value: 620, emoji: '🇵🇹' },
      { name: 'ليونيل ميسي', value: 500, emoji: '🇦🇷' },
      { name: 'نيمار', value: 220, emoji: '🇧🇷' },
      { name: 'كيليان مبابي', value: 112, emoji: '🇫🇷' },
      { name: 'كريم بنزيما', value: 78, emoji: '🇫🇷' },
      { name: 'محمد صلاح', value: 63, emoji: '🇪🇬' },
      { name: 'مارسيلو', value: 65, emoji: '🇧🇷' },
      { name: 'زلاتان إبراهيموفيتش', value: 64, emoji: '🇸🇪' },
      { name: 'بول بوغبا', value: 61, emoji: '🇫🇷' },
      { name: 'سيرجيو راموس', value: 62, emoji: '🇪🇸' },
      { name: 'فينيسيوس جونيور', value: 45, emoji: '🇧🇷' },
      { name: 'إيرلينج هالاند', value: 38, emoji: '🇳🇴' },
      { name: 'روبرت ليفاندوفسكي', value: 35, emoji: '🇵🇱' },
      { name: 'أنطوان جريزمان', value: 40, emoji: '🇫🇷' },
      { name: 'كيفين دي بروين', value: 25, emoji: '🇧🇪' },
    ]
  },
  {
    id: 'games',
    name: 'الألعاب',
    question: 'أيهما أكثر مبيعاً/تحميلاً عالمياً؟',
    unit: 'مليون نسخة/تحميل',
    entities: [
      { name: 'Minecraft', value: 300, emoji: '⛏️' },
      { name: 'GTA V', value: 195, emoji: '🚗' },
      { name: 'Tetris', value: 170, emoji: '🧱' },
      { name: 'PUBG', value: 75, emoji: '🪂' },
      { name: 'Free Fire', value: 150, emoji: '🔥' },
      { name: 'Super Mario Bros', value: 58, emoji: '🍄' },
      { name: 'Mario Kart 8', value: 60, emoji: '🏎️' },
      { name: 'Red Dead Redemption 2', value: 57, emoji: '🤠' },
      { name: 'Overwatch', value: 50, emoji: '🔫' },
      { name: 'The Witcher 3', value: 50, emoji: '🐺' },
      { name: 'Terraria', value: 44, emoji: '🌳' },
      { name: 'Animal Crossing: NH', value: 43, emoji: '🦝' },
      { name: 'Cyberpunk 2077', value: 25, emoji: '🤖' },
      { name: 'Elden Ring', value: 23, emoji: '💍' },
      { name: 'Stardew Valley', value: 30, emoji: '🌾' },
    ]
  },
  {
    id: 'apps',
    name: 'التطبيقات',
    question: 'أيهما يمتلك مستخدمين نشطين شهرياً أكثر؟',
    unit: 'مليار مستخدم',
    entities: [
      { name: 'Facebook', value: 3.0, emoji: '📘' },
      { name: 'YouTube', value: 2.5, emoji: '▶️' },
      { name: 'WhatsApp', value: 2.7, emoji: '💬' },
      { name: 'Instagram', value: 2.0, emoji: '📸' },
      { name: 'TikTok', value: 1.5, emoji: '🎵' },
      { name: 'WeChat', value: 1.3, emoji: '🟢' },
      { name: 'Messenger', value: 0.9, emoji: '⚡' },
      { name: 'Telegram', value: 0.8, emoji: '✈️' },
      { name: 'Snapchat', value: 0.7, emoji: '👻' },
      { name: 'X / Twitter', value: 0.5, emoji: '🐦' },
      { name: 'Pinterest', value: 0.4, emoji: '📌' },
      { name: 'Reddit', value: 0.4, emoji: '🤖' },
      { name: 'Discord', value: 0.3, emoji: '🎮' },
      { name: 'Spotify', value: 0.6, emoji: '🎧' },
      { name: 'Netflix', value: 0.25, emoji: '🍿' },
    ]
  },
  {
    id: 'companies',
    name: 'الشركات',
    question: 'أيهما أكبر قيمة سوقية؟',
    unit: 'تريليون دولار',
    entities: [
      { name: 'Apple', value: 3.0, emoji: '🍎' },
      { name: 'Microsoft', value: 2.9, emoji: '🪟' },
      { name: 'Saudi Aramco', value: 2.0, emoji: '🛢️' },
      { name: 'Alphabet / Google', value: 1.7, emoji: '🔍' },
      { name: 'Amazon', value: 1.5, emoji: '📦' },
      { name: 'NVIDIA', value: 1.8, emoji: '🖥️' },
      { name: 'Meta (Facebook)', value: 0.9, emoji: '♾️' },
      { name: 'Tesla', value: 0.6, emoji: '⚡' },
      { name: 'Samsung', value: 0.4, emoji: '📱' },
      { name: 'Tencent', value: 0.3, emoji: '🐧' },
      { name: 'Coca-Cola', value: 0.25, emoji: '🥤' },
      { name: 'PepsiCo', value: 0.23, emoji: '🥤' },
      { name: 'Toyota', value: 0.26, emoji: '🚗' },
      { name: 'Nike', value: 0.16, emoji: '👟' },
      { name: 'Disney', value: 0.17, emoji: '🏰' },
    ]
  },
  {
    id: 'movies',
    name: 'الأفلام',
    question: 'أيهما حصد إيرادات أكثر في شباك التذاكر؟',
    unit: 'مليار دولار',
    entities: [
      { name: 'Avatar', value: 2.92, emoji: '🔵' },
      { name: 'Avengers: Endgame', value: 2.79, emoji: '🦸‍♂️' },
      { name: 'Avatar: The Way of Water', value: 2.32, emoji: '💧' },
      { name: 'Titanic', value: 2.25, emoji: '🚢' },
      { name: 'Star Wars: The Force Awakens', value: 2.06, emoji: '⚔️' },
      { name: 'Spider-Man: No Way Home', value: 1.92, emoji: '🕷️' },
      { name: 'Avengers: Infinity War', value: 1.85, emoji: '🧤' },
      { name: 'Jurassic World', value: 1.67, emoji: '🦖' },
      { name: 'The Lion King (2019)', value: 1.66, emoji: '🦁' },
      { name: 'The Avengers', value: 1.51, emoji: '🛡️' },
      { name: 'Furious 7', value: 1.51, emoji: '🏎️' },
      { name: 'Top Gun: Maverick', value: 1.49, emoji: '✈️' },
      { name: 'Frozen II', value: 1.45, emoji: '❄️' },
      { name: 'Barbie', value: 1.44, emoji: '🎀' },
      { name: 'Black Panther', value: 1.34, emoji: '🐆' },
    ]
  },
  {
    id: 'anime',
    name: 'الأنمي',
    question: 'أيهما أكثر شعبية (حسب MAL)؟',
    unit: 'مليون عضو',
    entities: [
      { name: 'Attack on Titan', value: 3.7, emoji: '⚔️' },
      { name: 'Death Note', value: 3.6, emoji: '📓' },
      { name: 'Fullmetal Alchemist: B', value: 3.1, emoji: '🦾' },
      { name: 'One Punch Man', value: 3.0, emoji: '👊' },
      { name: 'Sword Art Online', value: 2.9, emoji: '⚔️' },
      { name: 'My Hero Academia', value: 2.8, emoji: '🦸‍♂️' },
      { name: 'Demon Slayer', value: 2.7, emoji: '🗡️' },
      { name: 'Naruto', value: 2.6, emoji: '🍥' },
      { name: 'Tokyo Ghoul', value: 2.6, emoji: '🧟' },
      { name: 'Hunter x Hunter', value: 2.5, emoji: '🎣' },
      { name: 'Steins;Gate', value: 2.4, emoji: '⏱️' },
      { name: 'Your Name (Kimi no Na wa)', value: 2.5, emoji: '☄️' },
      { name: 'Jujutsu Kaisen', value: 2.3, emoji: '🤌' },
      { name: 'One Piece', value: 2.2, emoji: '🏴‍☠️' },
      { name: 'Bleach', value: 1.8, emoji: '🗡️' },
    ]
  },
  {
    id: 'countries',
    name: 'الدول',
    question: 'أيهما أكبر من حيث تعداد السكان؟',
    unit: 'مليون نسمة',
    entities: [
      { name: 'الهند', value: 1428, emoji: '🇮🇳' },
      { name: 'الصين', value: 1425, emoji: '🇨🇳' },
      { name: 'الولايات المتحدة', value: 339, emoji: '🇺🇸' },
      { name: 'إندونيسيا', value: 277, emoji: '🇮🇩' },
      { name: 'باكستان', value: 240, emoji: '🇵🇰' },
      { name: 'نيجيريا', value: 223, emoji: '🇳🇬' },
      { name: 'البرازيل', value: 216, emoji: '🇧🇷' },
      { name: 'بنغلاديش', value: 172, emoji: '🇧🇩' },
      { name: 'روسيا', value: 144, emoji: '🇷🇺' },
      { name: 'المكسيك', value: 128, emoji: '🇲🇽' },
      { name: 'اليابان', value: 123, emoji: '🇯🇵' },
      { name: 'مصر', value: 112, emoji: '🇪🇬' },
      { name: 'تركيا', value: 85, emoji: '🇹🇷' },
      { name: 'ألمانيا', value: 83, emoji: '🇩🇪' },
      { name: 'السعودية', value: 36, emoji: '🇸🇦' },
    ]
  },
  {
    id: 'history',
    name: 'التاريخ والمعالم',
    question: 'أيهما أقدم؟ (تاريخ البناء تقريباً)',
    unit: 'سنة مضت (تقريباً)',
    entities: [
      { name: 'أهرامات الجيزة', value: 4500, emoji: '🔺' },
      { name: 'ستونهنج', value: 5000, emoji: '🪨' },
      { name: 'سور الصين العظيم', value: 2200, emoji: '🧱' },
      { name: 'مدرج الكولوسيوم', value: 1940, emoji: '🏟️' },
      { name: 'ماتشو بيتشو', value: 570, emoji: '⛰️' },
      { name: 'تاج محل', value: 370, emoji: '🕌' },
      { name: 'برج إيفل', value: 135, emoji: '🗼' },
      { name: 'تمثال الحرية', value: 138, emoji: '🗽' },
      { name: 'الكعبة المشرفة (البناء الحديث)', value: 1390, emoji: '🕋' },
      { name: 'ساعة بيغ بن', value: 165, emoji: '🕰️' },
    ]
  },
  {
    id: 'science',
    name: 'العلوم',
    question: 'أيهما أبعد عن الشمس؟',
    unit: 'مليون كم',
    entities: [
      { name: 'عطارد', value: 58, emoji: '🪐' },
      { name: 'الزهرة', value: 108, emoji: '🪐' },
      { name: 'الأرض', value: 150, emoji: '🌍' },
      { name: 'المريخ', value: 228, emoji: '🪐' },
      { name: 'المشتري', value: 778, emoji: '🪐' },
      { name: 'زحل', value: 1427, emoji: '🪐' },
      { name: 'أورانوس', value: 2870, emoji: '🪐' },
      { name: 'نبتون', value: 4497, emoji: '🪐' },
      { name: 'بلوتو', value: 5900, emoji: '🪐' },
    ]
  },
  {
    id: 'cars',
    name: 'السيارات',
    question: 'أيهما أسرع؟ (السرعة القصوى)',
    unit: 'كم/ساعة',
    entities: [
      { name: 'Bugatti Chiron Supersport', value: 490, emoji: '🏎️' },
      { name: 'SSC Tuatara', value: 455, emoji: '🏎️' },
      { name: 'Koenigsegg Agera RS', value: 447, emoji: '🏎️' },
      { name: 'Hennessey Venom GT', value: 435, emoji: '🏎️' },
      { name: 'Bugatti Veyron Super Sport', value: 431, emoji: '🏎️' },
      { name: 'McLaren Speedtail', value: 402, emoji: '🏎️' },
      { name: 'Lamborghini Aventador', value: 350, emoji: '🏎️' },
      { name: 'Ferrari LaFerrari', value: 349, emoji: '🏎️' },
      { name: 'Porsche 918 Spyder', value: 345, emoji: '🏎️' },
      { name: 'Aston Martin Valkyrie', value: 400, emoji: '🏎️' },
      { name: 'Pagani Huayra', value: 383, emoji: '🏎️' },
      { name: 'McLaren P1', value: 350, emoji: '🏎️' },
    ]
  },
  {
    id: 'area',
    name: 'المساحة',
    question: 'أيهما أكبر مساحة؟',
    unit: 'مليون كم مربع',
    entities: [
      { name: 'روسيا', value: 17.09, emoji: '🇷🇺' },
      { name: 'كندا', value: 9.98, emoji: '🇨🇦' },
      { name: 'الصين', value: 9.59, emoji: '🇨🇳' },
      { name: 'الولايات المتحدة', value: 9.52, emoji: '🇺🇸' },
      { name: 'البرازيل', value: 8.51, emoji: '🇧🇷' },
      { name: 'أستراليا', value: 7.69, emoji: '🇦🇺' },
      { name: 'الهند', value: 3.28, emoji: '🇮🇳' },
      { name: 'الأرجنتين', value: 2.78, emoji: '🇦🇷' },
      { name: 'كازاخستان', value: 2.72, emoji: '🇰🇿' },
      { name: 'الجزائر', value: 2.38, emoji: '🇩🇿' },
      { name: 'السعودية', value: 2.14, emoji: '🇸🇦' },
    ]
  },
  {
    id: 'length',
    name: 'الأطوال',
    question: 'أيهما أطول؟',
    unit: 'متر',
    entities: [
      { name: 'برج خليفة', value: 828, emoji: '🏢' },
      { name: 'برج شنغهاي', value: 632, emoji: '🏢' },
      { name: 'برج مكة (البيت)', value: 601, emoji: '🕋' },
      { name: 'برج إيفل', value: 330, emoji: '🗼' },
      { name: 'تمثال الحرية', value: 93, emoji: '🗽' },
      { name: 'أهرامات الجيزة', value: 146, emoji: '🔺' },
      { name: 'ساعة بيغ بن', value: 96, emoji: '🕰️' },
      { name: 'جبل إيفرست', value: 8848, emoji: '⛰️' },
      { name: 'جبل كلمنجارو', value: 5895, emoji: '⛰️' },
      { name: 'نهر النيل (طول/كم)', value: 6650, emoji: '🌊' },
      { name: 'نهر الأمازون (طول/كم)', value: 6400, emoji: '🌊' },
    ]
  }
];

export interface FamousQuestion {
  id: string; // Unique identifier for the question (e.g., 'A_B')
  category: string;
  question: string;
  unit: string;
  optionA: FamousEntity;
  optionB: FamousEntity;
  correct: 'A' | 'B';
  difficulty: 'easy' | 'medium' | 'hard' | 'rare';
}

export function generateFamousQuestions(answeredIds: Set<string> = new Set()): FamousQuestion[] {
  let questions: FamousQuestion[] = [];
  
  for (const category of famousCategories) {
    const list = category.entities;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const valA = list[i].value;
        const valB = list[j].value;
        
        // Only if values are strictly different
        if (valA !== valB) {
            const max = Math.max(valA, valB);
            const min = Math.min(valA, valB);
            const diffRatio = (max - min) / max; // 0 to 1

            let difficulty: 'easy' | 'medium' | 'hard' | 'rare';
            if (diffRatio > 0.5) difficulty = 'easy';
            else if (diffRatio > 0.2) difficulty = 'medium';
            else if (diffRatio > 0.05) difficulty = 'hard';
            else difficulty = 'rare';

            // Create unique ID regardless of order
            const qId = `${category.id}_${list[i].name}_${list[j].name}`;

            if (!answeredIds.has(qId)) {
              // Randomize position A and B
              const swap = Math.random() > 0.5;
              const optA = swap ? list[j] : list[i];
              const optB = swap ? list[i] : list[j];
              
              questions.push({
                id: qId,
                category: category.name,
                question: category.question,
                unit: category.unit,
                optionA: optA,
                optionB: optB,
                correct: optA.value > optB.value ? 'A' : 'B',
                difficulty
              });
            }
        }
      }
    }
  }

  if (questions.length === 0) {
    // If all exhausted, clear and regenerate
    answeredIds.clear();
    return generateFamousQuestions(answeredIds);
  }

  // Shuffle all first
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  // Sort them so that easy questions come first to provide a progressive difficulty curve
  questions.sort((a, b) => {
    const dOrder = { 'easy': 0, 'medium': 1, 'hard': 2, 'rare': 3 };
    return dOrder[a.difficulty] - dOrder[b.difficulty];
  });

  return questions;
}
