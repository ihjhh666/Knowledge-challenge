export interface EmojiItem {
  id: string;
  category: string;
  emojis: string;
  answer: string;
}

export const emojiDatabase: EmojiItem[] = [
  // ألعاب
  { id: '1', category: 'ألعاب', emojis: '⛏️🧱🧟‍♂️', answer: 'ماين كرافت' },
  { id: '2', category: 'ألعاب', emojis: '🚗🔫💰', answer: 'جي تي أي' },
  { id: '3', category: 'ألعاب', emojis: '🪂🔫🍳', answer: 'ببجي' },
  { id: '4', category: 'ألعاب', emojis: '🍄🐢⭐', answer: 'سوبر ماريو' },
  { id: '5', category: 'ألعاب', emojis: '⚽🚗🏎️', answer: 'روكيت ليغ' },
  { id: '6', category: 'ألعاب', emojis: '👻💊🍒', answer: 'باك مان' },
  { id: '7', category: 'ألعاب', emojis: '🔥🔫🪂', answer: 'فري فاير' },
  { id: '8', category: 'ألعاب', emojis: '🤠🐎🔫', answer: 'ريد ديد ريدمبشن' },
  { id: '9', category: 'ألعاب', emojis: '⚔️🛡️🐉', answer: 'سكايرم' },
  { id: '10', category: 'ألعاب', emojis: '🪓👦❄️', answer: 'غود أوف وور' },
  { id: '10b', category: 'ألعاب', emojis: '⚽🥅🎮', answer: 'فيفا' },
  { id: '11b', category: 'ألعاب', emojis: '🧱📉🧩', answer: 'تتريس' },

  // مشاهير
  { id: '11', category: 'مشاهير', emojis: '🎤🚶‍♂️🌕', answer: 'مايكل جاكسون' },
  { id: '12', category: 'مشاهير', emojis: '💡🍎👨‍💻', answer: 'ستيف جوبز' },
  { id: '13', category: 'مشاهير', emojis: '🚀🚗🐦', answer: 'إيلون ماسك' },
  { id: '14', category: 'مشاهير', emojis: '🥊🦋🐝', answer: 'محمد علي كلاي' },
  { id: '15', category: 'مشاهير', emojis: '💻🪟🤓', answer: 'بيل غيتس' },
  { id: '16', category: 'مشاهير', emojis: '⚛️👅📸', answer: 'ألبرت أينشتاين' },
  { id: '17', category: 'مشاهير', emojis: '👑🎤🎸', answer: 'إلفيس بريسلي' },
  { id: '18', category: 'مشاهير', emojis: '🕷️🕸️👨', answer: 'توم هولاند' },

  // كرة القدم
  { id: '20', category: 'كرة القدم', emojis: '🇵🇹⚽7️⃣', answer: 'كريستيانو رونالدو' },
  { id: '21', category: 'كرة القدم', emojis: '🇦🇷⚽🐐', answer: 'ليونيل ميسي' },
  { id: '22', category: 'كرة القدم', emojis: '🇧🇷⚽🕺', answer: 'نيمار' },
  { id: '23', category: 'كرة القدم', emojis: '🇪🇬⚽👑', answer: 'محمد صلاح' },
  { id: '24', category: 'كرة القدم', emojis: '🇫🇷🐢⚽', answer: 'كيليان مبابي' },
  { id: '25', category: 'كرة القدم', emojis: '🇳🇴🤖⚽', answer: 'إيرلينج هالاند' },
  { id: '26', category: 'كرة القدم', emojis: '🇵🇱⚽🥅', answer: 'ليفاندوفسكي' },
  { id: '27', category: 'كرة القدم', emojis: '🇫🇷⚽🪄', answer: 'زين الدين زيدان' },
  { id: '28', category: 'كرة القدم', emojis: '🇦🇷🔟⚽', answer: 'دييغو مارادونا' },
  { id: '29', category: 'كرة القدم', emojis: '🇧🇷👑⚽', answer: 'بيليه' },

  // شركات
  { id: '30', category: 'شركات', emojis: '🍎📱💻', answer: 'آبل' },
  { id: '31', category: 'شركات', emojis: '🪟💻☁️', answer: 'مايكروسوفت' },
  { id: '32', category: 'شركات', emojis: '🔍🌐📧', answer: 'جوجل' },
  { id: '33', category: 'شركات', emojis: '🛒📦🚚', answer: 'أمازون' },
  { id: '34', category: 'شركات', emojis: '⚡🚗🔋', answer: 'تسلا' },
  { id: '35', category: 'شركات', emojis: '👟✔️🏃‍♂️', answer: 'نايكي' },
  { id: '36', category: 'شركات', emojis: '🎥🏰🐭', answer: 'ديزني' },
  { id: '37', category: 'شركات', emojis: '☕🧜‍♀️🟢', answer: 'ستاربكس' },
  { id: '38', category: 'شركات', emojis: '🍔🍟🤡', answer: 'ماكدونالدز' },
  { id: '39', category: 'شركات', emojis: '🚗🇯🇵🔴', answer: 'تويوتا' },

  // تطبيقات
  { id: '40', category: 'تطبيقات', emojis: '📘👥👍', answer: 'فيسبوك' },
  { id: '41', category: 'تطبيقات', emojis: '📸❤️📱', answer: 'إنستجرام' },
  { id: '42', category: 'تطبيقات', emojis: '💬📞🟢', answer: 'واتساب' },
  { id: '43', category: 'تطبيقات', emojis: '🐦💬🔄', answer: 'تويتر' },
  { id: '44', category: 'تطبيقات', emojis: '👻📸🕑', answer: 'سناب شات' },
  { id: '45', category: 'تطبيقات', emojis: '🎵🕺📱', answer: 'تيك توك' },
  { id: '46', category: 'تطبيقات', emojis: '▶️📹📺', answer: 'يوتيوب' },
  { id: '47', category: 'تطبيقات', emojis: '✈️💬🔵', answer: 'تيليجرام' },
  { id: '48', category: 'تطبيقات', emojis: '🎧🎶🟢', answer: 'سبوتيفاي' },
  { id: '49', category: 'تطبيقات', emojis: '🍿🎥🔴', answer: 'نتفليكس' },

  // أفلام
  { id: '50', category: 'أفلام', emojis: '🚢🧊💔', answer: 'تيتانيك' },
  { id: '51', category: 'أفلام', emojis: '🦁👑🌅', answer: 'الأسد الملك' },
  { id: '52', category: 'أفلام', emojis: '🧙‍♂️👓⚡', answer: 'هاري بوتر' },
  { id: '53', category: 'أفلام', emojis: '🕸️🕷️🏙️', answer: 'سبايدرمان' },
  { id: '54', category: 'أفلام', emojis: '🦇🚗🌃', answer: 'باتمان' },
  { id: '55', category: 'أفلام', emojis: '🦕🦖🚙', answer: 'الحديقة الجوراسية' },
  { id: '56', category: 'أفلام', emojis: '🌌⚔️🤖', answer: 'حرب النجوم' },
  { id: '57', category: 'أفلام', emojis: '🏴‍☠️🚢☠️', answer: 'قراصنة الكاريبي' },
  { id: '58', category: 'أفلام', emojis: '🤡🎈☂️', answer: 'إت (It)' },
  { id: '59', category: 'أفلام', emojis: '🤵🔫🚗', answer: 'جيمس بوند' },

  // أنمي
  { id: '60', category: 'أنمي', emojis: '⚔️🧱🧟‍♂️', answer: 'هجوم العمالقة' },
  { id: '61', category: 'أنمي', emojis: '📓🍎✍️', answer: 'مذكرة الموت' },
  { id: '62', category: 'أنمي', emojis: '🏴‍☠️👒🍖', answer: 'ون بيس' },
  { id: '63', category: 'أنمي', emojis: '🍥🦊🥷', answer: 'ناروتو' },
  { id: '64', category: 'أنمي', emojis: '🐉🔮🟠', answer: 'دراغون بول' },
  { id: '65', category: 'أنمي', emojis: '🗡️👹⚔️', answer: 'قاتل الشياطين' },
  { id: '66', category: 'أنمي', emojis: '👊🧑‍🦲🦸‍♂️', answer: 'ون بانش مان' },
  { id: '67', category: 'أنمي', emojis: '🦸‍♂️🏫💥', answer: 'أكاديمية بطلي' },
  { id: '68', category: 'أنمي', emojis: '⚡🐭🔴', answer: 'بوكيمون' },
  { id: '69', category: 'أنمي', emojis: '🦾🧑‍🦰錬', answer: 'الكيميائي المعدني الكامل' },

  // دول
  { id: '70', category: 'دول', emojis: '🗽🇺🇸🦅', answer: 'الولايات المتحدة' },
  { id: '71', category: 'دول', emojis: '🗼🥐🥖', answer: 'فرنسا' },
  { id: '72', category: 'دول', emojis: '🍕🍝👢', answer: 'إيطاليا' },
  { id: '73', category: 'دول', emojis: '⛩️🍣🗻', answer: 'اليابان' },
  { id: '74', category: 'دول', emojis: '🐼🧱🐉', answer: 'الصين' },
  { id: '75', category: 'دول', emojis: '🐫🌴🇸🇦', answer: 'السعودية' },
  { id: '76', category: 'دول', emojis: '🔺🐪🇪🇬', answer: 'مصر' },
  { id: '77', category: 'دول', emojis: '🦘🐨🏜️', answer: 'أستراليا' },
  { id: '78', category: 'دول', emojis: '☕💃🇧🇷', answer: 'البرازيل' },
  { id: '79', category: 'دول', emojis: '🌶️🌮🌵', answer: 'المكسيك' },
  { id: '70b', category: 'دول', emojis: '🕰️🌧️🚌', answer: 'بريطانيا' },

  // مدن
  { id: '80', category: 'مدن', emojis: '🗼🎨🥐', answer: 'باريس' },
  { id: '81', category: 'مدن', emojis: '🗽🍎🚕', answer: 'نيويورك' },
  { id: '82', category: 'مدن', emojis: '🕰️🎡☔', answer: 'لندن' },
  { id: '83', category: 'مدن', emojis: '🐪🏢🌴', answer: 'الرياض' },
  { id: '84', category: 'مدن', emojis: '🔺🏙️🇪🇬', answer: 'القاهرة' },
  { id: '85', category: 'مدن', emojis: '🍣⛩️🗼', answer: 'طوكيو' },
  { id: '86', category: 'مدن', emojis: '🕋🕌📿', answer: 'مكة المكرمة' },
  { id: '87', category: 'مدن', emojis: '🏢🌴🚗', answer: 'دبي' },
  { id: '88', category: 'مدن', emojis: '🕌🌙🇹🇷', answer: 'إسطنبول' },
  { id: '89', category: 'مدن', emojis: '🎭🛶🇮🇹', answer: 'البندقية' },

  // علوم
  { id: '90', category: 'علوم', emojis: '🍎⬇️👨‍🔬', answer: 'الجاذبية' },
  { id: '91', category: 'علوم', emojis: '🌍☀️🪐', answer: 'المجموعة الشمسية' },
  { id: '92', category: 'علوم', emojis: '🔬🦠🧬', answer: 'البيولوجيا' },
  { id: '93', category: 'علوم', emojis: '🚀🛸🌕', answer: 'الفضاء' },
  { id: '94', category: 'علوم', emojis: '⚡💡🔌', answer: 'الكهرباء' },
  { id: '95', category: 'علوم', emojis: '🌡️🔥❄️', answer: 'الديناميكا الحرارية' },
  { id: '96', category: 'علوم', emojis: '🦴💀⛏️', answer: 'علم الحفريات' },
  { id: '97', category: 'علوم', emojis: '🧪⚗️🫧', answer: 'الكيمياء' },
  { id: '98', category: 'علوم', emojis: '⛈️🌪️🌧️', answer: 'الطقس' },
  { id: '99', category: 'علوم', emojis: '🧠🫀👁️', answer: 'علم التشريح' },

  // أطعمة
  { id: '100', category: 'أطعمة', emojis: '🍕🍅🧀', answer: 'بيتزا' },
  { id: '101', category: 'أطعمة', emojis: '🍔🍟🥤', answer: 'وجبة سريعة' },
  { id: '102', category: 'أطعمة', emojis: '🍣🍚🐟', answer: 'سوشي' },
  { id: '103', category: 'أطعمة', emojis: '🌮🇲🇽🌶️', answer: 'تاكو' },
  { id: '104', category: 'أطعمة', emojis: '🍝🇮🇹🍅', answer: 'معكرونة' },
  { id: '105', category: 'أطعمة', emojis: '🥩🔥🔪', answer: 'ستيك' },
  { id: '106', category: 'أطعمة', emojis: '🍩🍫☕', answer: 'دونات' },
  { id: '107', category: 'أطعمة', emojis: '🥞🍁🥞', answer: 'بان كيك' },
  { id: '108', category: 'أطعمة', emojis: '🥗🍅🥒', answer: 'سلطة' },
  { id: '109', category: 'أطعمة', emojis: '🥐☕🇫🇷', answer: 'كرواسون' },

  // مشروبات
  { id: '110', category: 'مشروبات', emojis: '☕☕🍩', answer: 'قهوة' },
  { id: '111', category: 'مشروبات', emojis: '🫖🌿🇬🇧', answer: 'شاي' },
  { id: '112', category: 'مشروبات', emojis: '🥤🔴🧊', answer: 'كولا' },
  { id: '113', category: 'مشروبات', emojis: '🥛🐄🍪', answer: 'حليب' },
  { id: '114', category: 'مشروبات', emojis: '🧃🍎🍊', answer: 'عصير' },
  { id: '115', category: 'مشروبات', emojis: '💧🚰🧊', answer: 'ماء' },
  { id: '116', category: 'مشروبات', emojis: '🥤🍋🧊', answer: 'ليمونادة' },
  { id: '117', category: 'مشروبات', emojis: '🥤🟢🧊', answer: 'سفن أب' },
];

export interface EmojiQuestion {
  id: string;
  category: string;
  emojis: string;
  options: string[];
  correct: string;
}

export function generateEmojiOptionQuestions(count: number, usedIds: Set<string>): EmojiQuestion[] {
  // Filter out used IDs
  let available = emojiDatabase.filter(item => !usedIds.has(item.id));
  
  if (available.length < count) {
    usedIds.clear(); // Reset if we run out
    available = emojiDatabase;
  }

  // Shuffle available
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const selected = available.slice(0, count);

  return selected.map(item => {
    // Generate 3 wrong options from the same category ideally, or other categories
    let sameCategory = emojiDatabase.filter(e => e.category === item.category && e.id !== item.id);
    let otherCategory = emojiDatabase.filter(e => e.category !== item.category);

    const wrongOptions: string[] = [];
    
    // Try to get at least 2 from the same category
    for (let i = 0; i < 2 && sameCategory.length > i; i++) {
       const j = Math.floor(Math.random() * sameCategory.length);
       wrongOptions.push(sameCategory[j].answer);
       sameCategory.splice(j, 1);
    }

    // Fill the rest with others
    while (wrongOptions.length < 3) {
       const list = sameCategory.length > 0 ? sameCategory : otherCategory;
       const j = Math.floor(Math.random() * list.length);
       if (!wrongOptions.includes(list[j].answer)) {
           wrongOptions.push(list[j].answer);
       }
       list.splice(j, 1);
    }

    const options = [item.answer, ...wrongOptions];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      id: item.id,
      category: item.category,
      emojis: item.emojis,
      options,
      correct: item.answer
    };
  });
}
