export function calculateLevel(totalXp: number): { level: number, currentLevelXp: number, nextLevelXp: number, progress: number } {
  let level = 1;
  let remainingXp = totalXp || 0;
  let nextLevelRequired = 100;
  
  while (remainingXp >= nextLevelRequired) {
    remainingXp -= nextLevelRequired;
    level++;
    nextLevelRequired = 100 + (level * 50); // Lvl 3 = 150, Lvl 4 = 200, etc.
  }

  return {
    level,
    currentLevelXp: remainingXp,
    nextLevelXp: nextLevelRequired,
    progress: Math.min(100, Math.round((remainingXp / nextLevelRequired) * 100))
  };
}

export function calculateEarnedXp(isWin: boolean, points: number = 0): number {
  let xp = 10; // Base XP for finishing a match
  if (isWin) {
    xp += 40; // Win bonus
  }
  xp += Math.max(0, points); // 1 XP per point/goal 
  return xp;
}
