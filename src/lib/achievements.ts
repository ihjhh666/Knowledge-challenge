import { Trophy, Medal, Crown, Star, Target, Zap, Clock, Users, Flame, Swords, Shield, Award, Sparkles, Ghost, Rocket, Heart, Diamond, BookOpen } from 'lucide-react';
import React from 'react';

export type Rarity = 'common' | 'medium' | 'rare' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  icon: React.ElementType;
  targetMax: number;
  condition: (stats: PlayerStats) => boolean;
  getProgress: (stats: PlayerStats) => number;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  winStreak: number;
  maxWinStreak: number;
  totalGoals: number;
  friendsCount: number;
  playTimeMinutes: number;
  sentencesCorrect: number;
  reachedFirstPlace: boolean;
  totalXp?: number;
  playerId?: string;
  playerName?: string;
  shortId?: string;
  correctAnswers?: number;
  wrongAnswers?: number;
  tfRoundsPlayed?: number;
  tfCorrectAnswers?: number;
  tfBestStreak?: number;
  tfHighScore?: number;
  proverbsCorrect?: number;
  proverbsBestStreak?: number;
  proverbsRoundsPlayed?: number;
  logosCorrect?: number;
  logosBestStreak?: number;
  logosRoundsPlayed?: number;
  sortRoundsPlayed?: number;
  sortCorrectAnswers?: number;
  sortBestStreak?: number;
  sortHighScore?: number;
}

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalGoals: 0,
  friendsCount: 0,
  playTimeMinutes: 0,
  sentencesCorrect: 0,
  reachedFirstPlace: false,
};

export const ACHIEVEMENTS: Achievement[] = [
  // --- صح أو خطأ (True/False) ---
  {
    id: 'tf_first_correct',
    title: 'أول الغيث',
    description: 'أجب إجابة صحيحة واحدة في طور صح أو خطأ',
    rarity: 'common',
    icon: Target,
    targetMax: 1,
    condition: (s) => (s.tfCorrectAnswers || 0) >= 1,
    getProgress: (s) => s.tfCorrectAnswers || 0,
  },
  {
    id: 'tf_10_correct',
    title: 'باحث عن الحقيقة',
    description: 'أجب عن 10 أسئلة بشكل صحيح',
    rarity: 'common',
    icon: Sparkles,
    targetMax: 10,
    condition: (s) => (s.tfCorrectAnswers || 0) >= 10,
    getProgress: (s) => s.tfCorrectAnswers || 0,
  },
  {
    id: 'tf_50_correct',
    title: 'موسوعة متنقلة',
    description: 'أجب عن 50 سؤال بشكل صحيح',
    rarity: 'common',
    icon: Star,
    targetMax: 50,
    condition: (s) => (s.tfCorrectAnswers || 0) >= 50,
    getProgress: (s) => s.tfCorrectAnswers || 0,
  },
  {
    id: 'tf_streak_5',
    title: 'سلسلة البداية',
    description: 'حقق سلسلة 5 إجابات صحيحة متتالية',
    rarity: 'common',
    icon: Flame,
    targetMax: 5,
    condition: (s) => (s.tfBestStreak || 0) >= 5,
    getProgress: (s) => Math.min(s.tfBestStreak || 0, 5),
  },
  {
    id: 'tf_100_correct',
    title: 'عالم شامل',
    description: 'أجب عن 100 سؤال بشكل صحيح',
    rarity: 'medium',
    icon: Award,
    targetMax: 100,
    condition: (s) => (s.tfCorrectAnswers || 0) >= 100,
    getProgress: (s) => s.tfCorrectAnswers || 0,
  },
  {
    id: 'tf_streak_15',
    title: 'لا أخطئ أبداً',
    description: 'حقق سلسلة 15 إجابة صحيحة متتالية',
    rarity: 'medium',
    icon: Flame,
    targetMax: 15,
    condition: (s) => (s.tfBestStreak || 0) >= 15,
    getProgress: (s) => Math.min(s.tfBestStreak || 0, 15),
  },
  {
    id: 'tf_20_rounds',
    title: 'محب التحدي',
    description: 'إلعب 20 جولة في طور صح أو خطأ',
    rarity: 'medium',
    icon: Clock,
    targetMax: 20,
    condition: (s) => (s.tfRoundsPlayed || 0) >= 20,
    getProgress: (s) => s.tfRoundsPlayed || 0,
  },
  {
    id: 'tf_250_correct',
    title: 'عقل مدبر',
    description: 'أجب عن 250 سؤال بشكل صحيح',
    rarity: 'rare',
    icon: Crown,
    targetMax: 250,
    condition: (s) => (s.tfCorrectAnswers || 0) >= 250,
    getProgress: (s) => s.tfCorrectAnswers || 0,
  },
  {
    id: 'tf_streak_30',
    title: 'ذاكرة حديدية',
    description: 'حقق سلسلة 30 إجابة صحيحة متتالية',
    rarity: 'rare',
    icon: Zap,
    targetMax: 30,
    condition: (s) => (s.tfBestStreak || 0) >= 30,
    getProgress: (s) => Math.min(s.tfBestStreak || 0, 30),
  },
  {
    id: 'tf_500_correct',
    title: 'الأسطورة الحية',
    description: 'أجب عن 500 سؤال بشكل صحيح',
    rarity: 'legendary',
    icon: Diamond,
    targetMax: 500,
    condition: (s) => (s.tfCorrectAnswers || 0) >= 500,
    getProgress: (s) => s.tfCorrectAnswers || 0,
  },
  {
    id: 'tf_streak_50',
    title: 'لا يمكن إيقافي',
    description: 'حقق سلسلة 50 إجابة صحيحة متتالية',
    rarity: 'legendary',
    icon: Rocket,
    targetMax: 50,
    condition: (s) => (s.tfBestStreak || 0) >= 50,
    getProgress: (s) => Math.min(s.tfBestStreak || 0, 50),
  },
  {
    id: 'tf_100_rounds',
    title: 'جنون المعرفة',
    description: 'إلعب 100 جولة في طور صح أو خطأ',
    rarity: 'legendary',
    icon: Trophy,
    targetMax: 100,
    condition: (s) => (s.tfRoundsPlayed || 0) >= 100,
    getProgress: (s) => s.tfRoundsPlayed || 0,
  },
  // --- العادية (Common) ---
  {
    id: 'first_win',
    title: 'أول فوز',
    description: 'حقق أول فوز لك في أي طور',
    rarity: 'common',
    icon: Trophy,
    targetMax: 1,
    condition: (s) => s.wins >= 1,
    getProgress: (s) => s.wins,
  },
  {
    id: 'win_5_games',
    title: 'خطوة واثقة',
    description: 'فز في 5 مباريات',
    rarity: 'common',
    icon: Star,
    targetMax: 5,
    condition: (s) => s.wins >= 5,
    getProgress: (s) => s.wins,
  },
  {
    id: 'first_goal',
    title: 'أول إجابة',
    description: 'سجل نقطتك الأولى في المباراة',
    rarity: 'common',
    icon: Target,
    targetMax: 1,
    condition: (s) => s.totalGoals >= 1,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'score_50_goals',
    title: 'مشارك نشط',
    description: 'اربح 50 نقطة/إجابة',
    rarity: 'common',
    icon: Zap,
    targetMax: 50,
    condition: (s) => s.totalGoals >= 50,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'play_5_games',
    title: 'بداية الرحلة',
    description: 'العب 5 مباريات',
    rarity: 'common',
    icon: Rocket,
    targetMax: 5,
    condition: (s) => s.gamesPlayed >= 5,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'play_10_games',
    title: 'مبتدئ المعارك',
    description: 'العب 10 مباريات',
    rarity: 'common',
    icon: Swords,
    targetMax: 10,
    condition: (s) => s.gamesPlayed >= 10,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'first_friend',
    title: 'الصديق الوفي',
    description: 'أضف أول صديق لك',
    rarity: 'common',
    icon: Heart,
    targetMax: 1,
    condition: (s) => s.friendsCount >= 1,
    getProgress: (s) => s.friendsCount,
  },

  // --- المتوسطة (Medium) ---
  {
    id: 'win_streak_3',
    title: 'الشرارة الأولى',
    description: 'فز في 3 مباريات متتالية',
    rarity: 'medium',
    icon: Flame,
    targetMax: 3,
    condition: (s) => s.maxWinStreak >= 3,
    getProgress: (s) => s.maxWinStreak,
  },
  {
    id: 'win_streak_5',
    title: 'على نار حامية',
    description: 'فز في 5 مباريات متتالية',
    rarity: 'medium',
    icon: Flame,
    targetMax: 5,
    condition: (s) => s.maxWinStreak >= 5,
    getProgress: (s) => s.maxWinStreak,
  },
  {
    id: 'win_20_matches',
    title: 'المنتصر الدائم',
    description: 'فز في 20 مباراة',
    rarity: 'medium',
    icon: Trophy,
    targetMax: 20,
    condition: (s) => s.wins >= 20,
    getProgress: (s) => s.wins,
  },
  {
    id: 'play_50_games',
    title: 'لاعب منتظم',
    description: 'العب 50 مباراة',
    rarity: 'medium',
    icon: Shield,
    targetMax: 50,
    condition: (s) => s.gamesPlayed >= 50,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'play_100_games',
    title: 'مواظب',
    description: 'العب 100 مباراة',
    rarity: 'medium',
    icon: Medal,
    targetMax: 100,
    condition: (s) => s.gamesPlayed >= 100,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'score_100_goals',
    title: 'قناص النقاط',
    description: 'اربح 100 نقطة',
    rarity: 'medium',
    icon: Target,
    targetMax: 100,
    condition: (s) => s.totalGoals >= 100,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'score_250_goals',
    title: 'جامع المعرفة',
    description: 'اربح 250 نقطة',
    rarity: 'medium',
    icon: Award,
    targetMax: 250,
    condition: (s) => s.totalGoals >= 250,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'friends_10',
    title: 'اجتماعي',
    description: 'اجمع 10 أصدقاء',
    rarity: 'medium',
    icon: Users,
    targetMax: 10,
    condition: (s) => s.friendsCount >= 10,
    getProgress: (s) => s.friendsCount,
  },

  // --- النادرة (Rare) ---
  {
    id: 'win_streak_10',
    title: 'توهج الانتصارات',
    description: 'فز في 10 مباريات متتالية',
    rarity: 'rare',
    icon: Flame,
    targetMax: 10,
    condition: (s) => s.maxWinStreak >= 10,
    getProgress: (s) => s.maxWinStreak,
  },
  {
    id: 'win_streak_20',
    title: 'لا يُقهر',
    description: 'فز في 20 مباراة متتالية',
    rarity: 'rare',
    icon: Ghost,
    targetMax: 20,
    condition: (s) => s.maxWinStreak >= 20,
    getProgress: (s) => s.maxWinStreak,
  },
  {
    id: 'win_100_matches',
    title: 'قاهر الخصوم',
    description: 'فز في 100 مباراة',
    rarity: 'rare',
    icon: Crown,
    targetMax: 100,
    condition: (s) => s.wins >= 100,
    getProgress: (s) => s.wins,
  },
  {
    id: 'score_500_goals',
    title: 'حاصد النقاط',
    description: 'احصل على 500 نقطة',
    rarity: 'rare',
    icon: Sparkles,
    targetMax: 500,
    condition: (s) => s.totalGoals >= 500,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'play_200_games',
    title: 'شبح الساحات',
    description: 'العب 200 مباراة',
    rarity: 'rare',
    icon: Swords,
    targetMax: 200,
    condition: (s) => s.gamesPlayed >= 200,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'play_50_hours',
    title: 'مخضرم الوقت',
    description: 'العب لمدة 50 ساعة',
    rarity: 'rare',
    icon: Clock,
    targetMax: 50 * 60, // in minutes
    condition: (s) => s.playTimeMinutes >= 50 * 60,
    getProgress: (s) => s.playTimeMinutes,
  },
  {
    id: 'friends_25',
    title: 'شخصية محبوبة',
    description: 'اجمع 25 صديقاً',
    rarity: 'rare',
    icon: Users,
    targetMax: 25,
    condition: (s) => s.friendsCount >= 25,
    getProgress: (s) => s.friendsCount,
  },

  // --- الأسطورية (Legendary) ---
  {
    id: 'win_streak_50',
    title: 'نصف إله الانتصارات',
    description: 'فز في 50 مباراة متتالية',
    rarity: 'legendary',
    icon: Diamond,
    targetMax: 50,
    condition: (s) => s.maxWinStreak >= 50,
    getProgress: (s) => s.maxWinStreak,
  },
  {
    id: 'win_500_matches',
    title: 'الإمبراطور الأعظم',
    description: 'فز في 500 مباراة',
    rarity: 'legendary',
    icon: Crown,
    targetMax: 500,
    condition: (s) => s.wins >= 500,
    getProgress: (s) => s.wins,
  },
  {
    id: 'score_1000_goals',
    title: 'الأسطورة الحية',
    description: 'اجمع 1000 نقطة',
    rarity: 'legendary',
    icon: Sparkles,
    targetMax: 1000,
    condition: (s) => s.totalGoals >= 1000,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'play_500_games',
    title: 'المحارب الأبدي',
    description: 'العب 500 مباراة',
    rarity: 'legendary',
    icon: Shield,
    targetMax: 500,
    condition: (s) => s.gamesPlayed >= 500,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'first_place',
    title: 'زعيم الكون',
    description: 'الوصول للمركز الأول في المتصدرين',
    rarity: 'legendary',
    icon: Diamond,
    targetMax: 1,
    condition: (s) => s.reachedFirstPlace,
    getProgress: (s) => s.reachedFirstPlace ? 1 : 0,
  },
  {
    id: 'play_100_hours',
    title: 'المختار',
    description: 'العب لمدة 100 ساعة',
    rarity: 'legendary',
    icon: Clock,
    targetMax: 100 * 60,
    condition: (s) => s.playTimeMinutes >= 100 * 60,
    getProgress: (s) => s.playTimeMinutes,
  },
  {
    id: 'friends_50',
    title: 'أيقونة المجتمع',
    description: 'اجمع 50 صديقاً حقيقياً',
    rarity: 'legendary',
    icon: Users,
    targetMax: 50,
    condition: (s) => s.friendsCount >= 50,
    getProgress: (s) => s.friendsCount,
  },
  {
    id: 'first_sentence',
    title: 'كاتب مبتدئ',
    description: 'أكمل أول جملة صحيحة في رتب الجملة',
    rarity: 'common',
    icon: Star,
    targetMax: 1,
    condition: (s) => (s.sentencesCorrect || 0) >= 1,
    getProgress: (s) => s.sentencesCorrect || 0,
  },
  {
    id: 'sentences_50',
    title: 'بليغ',
    description: 'رتب 50 جملة صحيحة',
    rarity: 'rare',
    icon: Flame,
    targetMax: 50,
    condition: (s) => (s.sentencesCorrect || 0) >= 50,
    getProgress: (s) => s.sentencesCorrect || 0,
  },
  {
    id: 'sentences_200',
    title: 'سيبويه',
    description: 'رتب 200 جملة صحيحة',
    rarity: 'legendary',
    icon: Zap,
    targetMax: 200,
    condition: (s) => (s.sentencesCorrect || 0) >= 200,
    getProgress: (s) => s.sentencesCorrect || 0,
  },
  {
    id: 'sentences_1000',
    title: 'سيد الحروف',
    description: 'رتب 1000 جملة صحيحة',
    rarity: 'legendary',
    icon: Crown,
    targetMax: 1000,
    condition: (s) => (s.sentencesCorrect || 0) >= 1000,
    getProgress: (s) => s.sentencesCorrect || 0,
  },
  // --- ترتيب (Sorting) ---
  {
    id: 'sort_starter',
    title: 'مرتب مبتدئ',
    description: 'أكمل 10 جولات في طور الترتيب',
    rarity: 'common',
    icon: Target,
    targetMax: 10,
    condition: (s) => (s.sortRoundsPlayed || 0) >= 10,
    getProgress: (s) => s.sortRoundsPlayed || 0,
  },
  {
    id: 'sort_expert',
    title: 'خبير التصنيف',
    description: 'أكمل 50 جولة في طور الترتيب',
    rarity: 'medium',
    icon: Star,
    targetMax: 50,
    condition: (s) => (s.sortRoundsPlayed || 0) >= 50,
    getProgress: (s) => s.sortRoundsPlayed || 0,
  },
  {
    id: 'sort_master',
    title: 'سيد الترتيب',
    description: 'أكمل 100 جولة في طور الترتيب',
    rarity: 'rare',
    icon: Crown,
    targetMax: 100,
    condition: (s) => (s.sortRoundsPlayed || 0) >= 100,
    getProgress: (s) => s.sortRoundsPlayed || 0,
  },
  {
    id: 'sort_legend',
    title: 'أسطورة الترتيب',
    description: 'أجب 1000 إجابة صحيحة في الترتيب',
    rarity: 'legendary',
    icon: Flame,
    targetMax: 1000,
    condition: (s) => (s.sortCorrectAnswers || 0) >= 1000,
    getProgress: (s) => s.sortCorrectAnswers || 0,
  },
  {
    id: 'sort_king',
    title: 'سيد السلسلة',
    description: 'حقق سلسلة 10 إجابات صحيحة في الترتيب',
    rarity: 'legendary',
    icon: Zap,
    targetMax: 10,
    condition: (s) => (s.sortBestStreak || 0) >= 10,
    getProgress: (s) => Math.min(s.sortBestStreak || 0, 10),
  },

  // --- أكمل المثل (Proverbs) ---
  {
    id: 'proverbs_25',
    title: 'ابن البلد',
    description: 'أكمل 25 مثلاً صحيحاً',
    rarity: 'common',
    icon: Star,
    targetMax: 25,
    condition: (s) => (s.proverbsCorrect || 0) >= 25,
    getProgress: (s) => s.proverbsCorrect || 0,
  },
  {
    id: 'proverbs_100',
    title: 'حافظ الأمثال',
    description: 'أكمل 100 مثل صحيح',
    rarity: 'medium',
    icon: BookOpen,
    targetMax: 100,
    condition: (s) => (s.proverbsCorrect || 0) >= 100,
    getProgress: (s) => s.proverbsCorrect || 0,
  },
  {
    id: 'proverbs_250',
    title: 'حكيم القرية',
    description: 'أكمل 250 مثل صحيح',
    rarity: 'rare',
    icon: Flame,
    targetMax: 250,
    condition: (s) => (s.proverbsCorrect || 0) >= 250,
    getProgress: (s) => s.proverbsCorrect || 0,
  },
  {
    id: 'proverbs_500',
    title: 'شيخ الأمثال',
    description: 'أكمل 500 مثل صحيح',
    rarity: 'legendary',
    icon: Crown,
    targetMax: 500,
    condition: (s) => (s.proverbsCorrect || 0) >= 500,
    getProgress: (s) => s.proverbsCorrect || 0,
  },
  {
    id: 'proverbs_1000',
    title: 'موسوعة الحكم',
    description: 'أكمل 1000 مثل وحكمة صحيحة',
    rarity: 'legendary',
    icon: Diamond,
    targetMax: 1000,
    condition: (s) => (s.proverbsCorrect || 0) >= 1000,
    getProgress: (s) => s.proverbsCorrect || 0,
  },
  {
    id: 'proverbs_streak_20',
    title: 'سلسلة الحكمة',
    description: 'حقق 20 إجابة صحيحة متتالية',
    rarity: 'rare',
    icon: Flame,
    targetMax: 20,
    condition: (s) => (s.proverbsBestStreak || 0) >= 20,
    getProgress: (s) => Math.min(s.proverbsBestStreak || 0, 20),
  },

  // --- خمن الشعار (Logo Game) ---
  {
    id: 'logos_50',
    title: 'مبتدئ الشعارات',
    description: 'أجب على 50 شعار بشكل صحيح',
    rarity: 'common',
    icon: Trophy,
    targetMax: 50,
    condition: (s) => (s.logosCorrect || 0) >= 50,
    getProgress: (s) => s.logosCorrect || 0,
  },
  {
    id: 'logos_250',
    title: 'خبير الشعارات',
    description: 'أجب على 250 شعار بشكل صحيح',
    rarity: 'rare',
    icon: Star,
    targetMax: 250,
    condition: (s) => (s.logosCorrect || 0) >= 250,
    getProgress: (s) => s.logosCorrect || 0,
  },
  {
    id: 'logos_1000',
    title: 'أسطورة الشعارات',
    description: 'أجب على 1000 شعار بشكل صحيح',
    rarity: 'legendary',
    icon: Diamond,
    targetMax: 1000,
    condition: (s) => (s.logosCorrect || 0) >= 1000,
    getProgress: (s) => s.logosCorrect || 0,
  },
];

const LOCAL_KEY_STATS = 'know_player_stats';
const LOCAL_KEY_UNLOCKED = 'know_unlocked_achievements';

export function getPlayerStats(): PlayerStats {
  const data = localStorage.getItem(LOCAL_KEY_STATS);
  if (data) {
    try {
      return { ...DEFAULT_STATS, ...JSON.parse(data) };
    } catch {}
  }
  return DEFAULT_STATS;
}

export function savePlayerStats(stats: PlayerStats) {
  localStorage.setItem(LOCAL_KEY_STATS, JSON.stringify(stats));
}

export function getUnlockedAchievements(): string[] {
  const data = localStorage.getItem(LOCAL_KEY_UNLOCKED);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {}
  }
  return [];
}

function saveUnlockedAchievements(ids: string[]) {
  localStorage.setItem(LOCAL_KEY_UNLOCKED, JSON.stringify(ids));
}

export function syncFirebaseAchievementsToLocal(fbAchievements: { id: string }[]) {
  const current = getUnlockedAchievements();
  let changed = false;
  fbAchievements.forEach(fba => {
    if (!current.includes(fba.id)) {
      current.push(fba.id);
      changed = true;
    }
  });
  if (changed) {
    saveUnlockedAchievements(current);
    // Let listeners update
    window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: [] }));
  }
}

// Update stats, then check for newly unlocked achievements
export function updateStats(partialStats: Partial<PlayerStats>): Achievement[] | null {
  const current = getPlayerStats();
  const updated = { ...current, ...partialStats };

  // Sync some stats that require increments or max logic
  if (partialStats.winStreak !== undefined && partialStats.winStreak > current.maxWinStreak) {
    updated.maxWinStreak = partialStats.winStreak;
  }
  
  savePlayerStats(updated);

  const unlockedIds = getUnlockedAchievements();
  const newUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach(ach => {
    if (!unlockedIds.includes(ach.id) && ach.condition(updated)) {
      newUnlocked.push(ach);
      unlockedIds.push(ach.id);
    }
  });

  if (newUnlocked.length > 0) {
    saveUnlockedAchievements(unlockedIds);
    return newUnlocked;
  }
  return null;
}

export function evaluateAllAchievements(): Achievement[] | null {
  return updateStats({});
}
