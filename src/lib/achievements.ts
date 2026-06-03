import { Trophy, Medal, Crown, Star, Target, Zap, Clock, Users, Flame } from 'lucide-react';
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
  reachedFirstPlace: boolean;
}

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalGoals: 0,
  friendsCount: 0,
  playTimeMinutes: 0,
  reachedFirstPlace: false,
};

export const ACHIEVEMENTS: Achievement[] = [
  // العادية (Common)
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
    id: 'first_goal',
    title: 'أول هدف',
    description: 'سجل هدفك الأول',
    rarity: 'common',
    icon: Target,
    targetMax: 1,
    condition: (s) => s.totalGoals >= 1,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'play_10_games',
    title: 'مبتدئ ساحات اللعب',
    description: 'العب 10 مباريات',
    rarity: 'common',
    icon: Star,
    targetMax: 10,
    condition: (s) => s.gamesPlayed >= 10,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'first_friend',
    title: 'الصديق الوفي',
    description: 'أضف أول صديق لك',
    rarity: 'common',
    icon: Users,
    targetMax: 1,
    condition: (s) => s.friendsCount >= 1,
    getProgress: (s) => s.friendsCount,
  },

  // المتوسطة (Medium)
  {
    id: 'win_streak_5',
    title: 'سلسلة انتصارات',
    description: 'فز في 5 مباريات متتالية',
    rarity: 'medium',
    icon: Flame,
    targetMax: 5,
    condition: (s) => s.maxWinStreak >= 5,
    getProgress: (s) => s.maxWinStreak,
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
    title: 'هداف متمرس',
    description: 'سجل 100 هدف',
    rarity: 'medium',
    icon: Target,
    targetMax: 100,
    condition: (s) => s.totalGoals >= 100,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'win_20_matches',
    title: 'المنتصر',
    description: 'فز في 20 مباراة',
    rarity: 'medium',
    icon: Trophy,
    targetMax: 20,
    condition: (s) => s.wins >= 20,
    getProgress: (s) => s.wins,
  },

  // النادرة (Rare)
  {
    id: 'win_streak_20',
    title: 'لا يُقهر',
    description: 'فز في 20 مباراة متتالية',
    rarity: 'rare',
    icon: Flame,
    targetMax: 20,
    condition: (s) => s.maxWinStreak >= 20,
    getProgress: (s) => s.maxWinStreak,
  },
  {
    id: 'score_500_goals',
    title: 'القناص',
    description: 'سجل 500 هدف',
    rarity: 'rare',
    icon: Zap,
    targetMax: 500,
    condition: (s) => s.totalGoals >= 500,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'play_50_hours',
    title: 'مخضرم',
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
    description: 'امتلك 25 صديقاً',
    rarity: 'rare',
    icon: Users,
    targetMax: 25,
    condition: (s) => s.friendsCount >= 25,
    getProgress: (s) => s.friendsCount,
  },

  // الأسطورية (Legendary)
  {
    id: 'win_streak_50',
    title: 'أسطورة الانتصارات',
    description: 'فز في 50 مباراة متتالية',
    rarity: 'legendary',
    icon: Crown,
    targetMax: 50,
    condition: (s) => s.maxWinStreak >= 50,
    getProgress: (s) => s.maxWinStreak,
  },
  {
    id: 'score_1000_goals',
    title: 'ماكينة أهداف',
    description: 'سجل 1000 هدف',
    rarity: 'legendary',
    icon: Target,
    targetMax: 1000,
    condition: (s) => s.totalGoals >= 1000,
    getProgress: (s) => s.totalGoals,
  },
  {
    id: 'play_500_games',
    title: 'مدمن تحديات',
    description: 'العب 500 مباراة',
    rarity: 'legendary',
    icon: Medal,
    targetMax: 500,
    condition: (s) => s.gamesPlayed >= 500,
    getProgress: (s) => s.gamesPlayed,
  },
  {
    id: 'first_place',
    title: 'ملك اللعبة',
    description: 'الوصول للمركز الأول في المتصدرين',
    rarity: 'legendary',
    icon: Crown,
    targetMax: 1,
    condition: (s) => s.reachedFirstPlace,
    getProgress: (s) => s.reachedFirstPlace ? 1 : 0,
  },
  {
    id: 'play_100_hours',
    title: 'عايش في اللعبة',
    description: 'العب لمدة 100 ساعة',
    rarity: 'legendary',
    icon: Clock,
    targetMax: 100 * 60,
    condition: (s) => s.playTimeMinutes >= 100 * 60,
    getProgress: (s) => s.playTimeMinutes,
  },
  {
    id: 'friends_50',
    title: 'زعيم السيرفر',
    description: 'امتلك 50 صديقاً',
    rarity: 'legendary',
    icon: Users,
    targetMax: 50,
    condition: (s) => s.friendsCount >= 50,
    getProgress: (s) => s.friendsCount,
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

function savePlayerStats(stats: PlayerStats) {
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
