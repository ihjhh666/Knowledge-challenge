import React, { useEffect, useState } from 'react';
import { Achievement, getPlayerStats, updateStats } from '../lib/achievements';
import { AchievementToast } from './AchievementToast';

export function AchievementSystem() {
  const [activeToasts, setActiveToasts] = useState<Achievement[]>([]);

  useEffect(() => {
    // Listen for custom events triggered across the app
    const handleAchievementUnlock = (e: CustomEvent<Achievement[]>) => {
      const newAchievements = e.detail;
      if (newAchievements && newAchievements.length > 0) {
        setActiveToasts(prev => [...prev, ...newAchievements]);
      }
    };

    window.addEventListener('achievement_unlocked' as any, handleAchievementUnlock);

    // Track playtime (every minute, update stats)
    const playTimer = setInterval(() => {
      const currentStats = getPlayerStats();
      const newUnlocked = updateStats({ playTimeMinutes: currentStats.playTimeMinutes + 1 });
      if (newUnlocked && newUnlocked.length > 0) {
        window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: newUnlocked }));
      }
    }, 60000); // 1 minute

    return () => {
      window.removeEventListener('achievement_unlocked' as any, handleAchievementUnlock);
      clearInterval(playTimer);
    };
  }, []);

  const removeToast = (idToRemove: string) => {
    setActiveToasts(prev => prev.filter(a => a.id !== idToRemove));
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse justify-end gap-3 pointer-events-none">
        {activeToasts.map(ach => (
          <div key={ach.id} className="pointer-events-auto">
            <AchievementToast 
              achievement={ach} 
              onClose={() => removeToast(ach.id)} 
            />
          </div>
        ))}
      </div>
    </>
  );
}

// Helper to update stats anywhere in the app and dispatch event if needed
export function triggerStatUpdate(stats: Partial<import('../lib/achievements').PlayerStats>) {
  const newUnlocked = updateStats(stats);
  if (newUnlocked && newUnlocked.length > 0) {
    window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: newUnlocked }));
  }
}
