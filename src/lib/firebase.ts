import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, doc, setDoc, updateDoc, getDoc, deleteDoc, onSnapshot, collection, query, where, orderBy, limit, increment, getCountFromServer } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';

const cleanValue = (val: string | undefined) => {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

const getFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('custom_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        console.log("Firebase config loaded from custom_firebase_config");
        return {
          apiKey: cleanValue(parsed.apiKey),
          authDomain: cleanValue(parsed.authDomain),
          projectId: cleanValue(parsed.projectId),
          storageBucket: cleanValue(parsed.storageBucket),
          messagingSenderId: cleanValue(parsed.messagingSenderId),
          appId: cleanValue(parsed.appId),
          firestoreDatabaseId: cleanValue(parsed.firestoreDatabaseId) || 'ai-studio-312513b5-9b52-4eac-b060-23f7c26e6de6'
        };
      }
    }
  } catch (e) {
    console.error("Error parsing custom firebase config", e);
  }
  
  // Try applet config first
  if (appletConfig && appletConfig.projectId && appletConfig.apiKey) {
    console.log("Firebase config loaded from firebase-applet-config.json");
    return appletConfig;
  }

  console.log("Firebase config loaded from env variables");
  return {
    apiKey: cleanValue(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanValue(import.meta.env.VITE_FIREBASE_APP_ID),
    firestoreDatabaseId: cleanValue(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID) || 'ai-studio-312513b5-9b52-4eac-b060-23f7c26e6de6'
  };
};

const firebaseConfig = getFirebaseConfig();

const isFirebaseConfigured = !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

if (!isFirebaseConfigured) {
   console.warn("Firebase is NOT configured! Missing projectId or apiKey.", firebaseConfig);
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId) : null;
export const auth = app ? getAuth(app) : null;
export { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User };

export interface PublicRoom {
  roomId: string;
  hostName: string;
  category: string;
  gameMode?: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king' | 'chicken';
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished' | 'revealing';
  createdAt: number;
  lastActiveAt?: number;
  roomVisibility: 'public' | 'private' | 'link' | 'password';
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  shortId?: string;
  avatarUrl?: string;
  gamesPlayed: number;
  wins: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalPoints: number;
  successRate: number;
  categoryCounts: Record<string, number>;
  mostPlayedCategory: string;
  lastUpdated: number;
  totalXp?: number;
  // Fishing Stats
  fishingGamesPlayed?: number;
  fishingWins?: number;
  fishingHighestScore?: number;
  fishingTotalFish?: number;
  fishingTotalPoints?: number;
  // Penalty Stats
  penaltyGamesPlayed?: number;
  penaltyWins?: number;
  penaltyGoals?: number;
  penaltySaves?: number;
  penaltyWinStreak?: number;
  // Hockey Stats
  hockeyGamesPlayed?: number;
  hockeyWins?: number;
  hockeyLosses?: number;
  hockeyGoalsScored?: number;
  hockeyGoalsConceded?: number;
  hockeyWinStreak?: number;
  currentHockeyWinStreak?: number;
  // True/False Stats
  tfRoundsPlayed?: number;
  tfCorrectAnswers?: number;
  tfWrongAnswers?: number;
  tfBestStreak?: number;
  tfHighScore?: number;
  // Sorting Stats
  sortRoundsPlayed?: number;
  sortCorrectAnswers?: number;
  sortBestStreak?: number;
  sortHighScore?: number;
  unlockedAchievements?: { id: string; date: number }[];
  createdAt?: number;
}

import { updateStats as doUpdateAchStats, getPlayerStats as getAchStats } from './achievements';
import { calculateEarnedXp } from './level';

export const notifyAchievements = async (playerId: string, isWin: boolean, goals: number = 0) => {
  try {
    const current = getAchStats();
    let newStreak = isWin ? current.winStreak + 1 : 0;
    
    // Check if reaching first place - a bit heavy to do here, but we can evaluate it if we want.
    // For now we omit checking first place strictly here.

    let addedXp = calculateEarnedXp(isWin, goals);

    const newUnlocked = doUpdateAchStats({
      gamesPlayed: current.gamesPlayed + 1,
      wins: current.wins + (isWin ? 1 : 0),
      totalGoals: current.totalGoals + goals,
      winStreak: newStreak,
      totalXp: (current.totalXp || 0) + addedXp
    });

    if (newUnlocked && newUnlocked.length > 0) {
      window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: newUnlocked }));
      addedXp += newUnlocked.length * 100; // Bonus XP for achievements
      
      // Update local storage again with bonus XP
      doUpdateAchStats({ totalXp: (current.totalXp || 0) + addedXp });
    }

    if (playerId && db) {
      const docRef = doc(db, 'users', playerId);
      try {
        await setDoc(docRef, { totalXp: increment(addedXp) }, { merge: true });
        
        if (newUnlocked && newUnlocked.length > 0) {
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            const existing = data.unlockedAchievements || [];
            const achievementsToAdd = newUnlocked.map(a => ({ id: a.id, date: Date.now() }));
            await setDoc(docRef, { unlockedAchievements: [...existing, ...achievementsToAdd] }, { merge: true });
          }
        }
      } catch(e) {
        console.error("Failed to save achievements to Firestore", e);
      }
    }
  } catch (err) {
    console.error('Failed to notify achievements', err);
  }
};

export const updatePenaltyStats = async (
  playerId: string,
  playerName: string,
  isWin: boolean,
  goals: number,
  saves: number
) => {
  notifyAchievements(playerId, isWin, goals);
  if (!db) return;
  try {
    const playerRef = doc(db, 'users', playerId);
    const snap = await getDoc(playerRef);

    if (snap.exists()) {
      const data = snap.data() as PlayerStats;
      const streak = isWin ? (data.penaltyWinStreak || 0) + 1 : 0;
      const currentHighestStreak = data.penaltyWinStreak || 0;
      
      const newStats: Partial<PlayerStats> = {
        playerName,
        penaltyGamesPlayed: (data.penaltyGamesPlayed || 0) + 1,
        penaltyWins: (data.penaltyWins || 0) + (isWin ? 1 : 0),
        penaltyGoals: (data.penaltyGoals || 0) + goals,
        penaltySaves: (data.penaltySaves || 0) + saves,
        penaltyWinStreak: Math.max(streak, currentHighestStreak), // actually this just keeps the highest streak
        lastUpdated: Date.now()
      };
      
      // Real win streak logic: we need to track CURRENT and HIGHEST if we actually wanna display it properly.
      // But adding `currentPenaltyWinStreak` to the db schema inside here is fine
      await updateDoc(playerRef, {
        ...newStats,
        currentPenaltyWinStreak: isWin ? (data['currentPenaltyWinStreak' as keyof PlayerStats] as number || 0) + 1 : 0,
        penaltyWinStreak: Math.max(isWin ? ((data['currentPenaltyWinStreak' as keyof PlayerStats] as number || 0) + 1) : 0, data.penaltyWinStreak || 0)
      });
    } else {
      const newStats: PlayerStats = {
        playerId,
        playerName,
        gamesPlayed: 0,
        wins: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalPoints: 0,
        successRate: 0,
        categoryCounts: {},
        mostPlayedCategory: '',
        lastUpdated: Date.now(),
        penaltyGamesPlayed: 1,
        penaltyWins: isWin ? 1 : 0,
        penaltyGoals: goals,
        penaltySaves: saves,
        penaltyWinStreak: isWin ? 1 : 0
      };
      await setDoc(playerRef, { ...newStats, currentPenaltyWinStreak: isWin ? 1 : 0 }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating penalty stats:', error);
  }
};

export const createPublicRoom = async (roomData: PublicRoom) => {
  console.log("=== CREATE PUBLIC ROOM ATTEMPT ===");
  console.log("Room ID:", roomData.roomId);
  console.log("Game Mode:", roomData.gameMode);
  console.log("Status:", roomData.status);
  console.log("Visibility:", roomData.roomVisibility);
  
  if (!db) {
     console.error("❌ CREATE FAILED: db object is null. Firebase not initialized properly.");
     return;
  }
  
  try {
    const roomRef = doc(db, 'rooms', roomData.roomId);
    await setDoc(roomRef, { ...roomData, lastActiveAt: Date.now() });
    console.log("✅ CREATE SUCCESS: Document written to Firebase!");
    console.log("Full path: rooms/" + roomData.roomId);
  } catch (err) {
    console.error("❌ CREATE FAILED (Firebase Error):", err);
  }
};

export const updatePublicRoom = async (roomId: string, updates: Partial<PublicRoom>) => {
  if (!db) return;
  console.log(`=== UPDATE PUBLIC ROOM ATTEMPT: ${roomId} ===`, updates);
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const snapshot = await getDoc(roomRef);
    if (snapshot.exists()) {
       await setDoc(roomRef, { ...snapshot.data(), ...updates, lastActiveAt: Date.now() }, { merge: true });
       console.log(`✅ UPDATE SUCCESS: ${roomId}`);
    } else {
       console.warn(`⚠️ UPDATE SKIPPED: Room ${roomId} not found in Firebase`);
    }
  } catch (err) {
    console.error(`❌ UPDATE FAILED: ${roomId}`, err);
  }
};

export const deletePublicRoom = async (roomId: string) => {
  if (!db) return;
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await deleteDoc(roomRef);
  } catch (err) {
    console.error("Firebase Delete Room Error:", err);
  }
};

export const subscribeToPublicRooms = (callback: (rooms: PublicRoom[], stats?: { fetched: number, filtered: number, lastRoomId?: string, rawRooms?: PublicRoom[] }) => void) => {
  if (!db) {
    callback([], { fetched: 0, filtered: 0 });
    return () => {};
  }
  console.log("Subscribing to Firestore 'rooms' collection...");
  const roomsRef = collection(db, 'rooms');
  const q = query(roomsRef, orderBy('lastActiveAt', 'desc'), limit(50));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const rooms: PublicRoom[] = [];
    snapshot.forEach(doc => {
      rooms.push({ ...doc.data(), roomId: doc.id } as PublicRoom);
    });
    console.log(`=== ROOM SCAN: Fetched ${rooms.length} raw rooms ===`);
    
    // Sort descending by creation/activity so the newest is first
    rooms.sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0));
    
    const validRooms = rooms.filter(r => {
      const isDead = r.status === 'finished' || r.playerCount <= 0 || r.status === 'playing';
      const isFull = r.playerCount >= (r.maxPlayers || 10);
      
      const now = Date.now();
      const isActive = r.lastActiveAt ? (now - r.lastActiveAt < 1000 * 60 * 15) : true; // 15 mins
      
      if (isDead) {
        console.log(`Filtering out ${r.roomId}: isDead=true (status=${r.status}, players=${r.playerCount})`);
      } else if (isFull) {
        console.log(`Filtering out ${r.roomId}: isFull=true (${r.playerCount}/${r.maxPlayers})`);
      } else if (!isActive) {
        console.log(`Filtering out ${r.roomId}: isActive=false`);
      } else if (r.roomVisibility === 'private') {
         console.log(`Filtering out ${r.roomId}: visibility is private`);
         return false; // added check for private just in case
      }
      
      // Also cleanup dead rooms from DB if very old
      if (!isActive && r.lastActiveAt && (now - r.lastActiveAt > 1000 * 60 * 60)) {
         deletePublicRoom(r.roomId);
      }
      
      const isValid = !isDead && !isFull && isActive && r.roomVisibility !== 'private';
      if (isValid) {
         console.log(`✅ Accepted room ${r.roomId}: mode=${r.gameMode}, status=${r.status}, players=${r.playerCount}/${r.maxPlayers}`);
      }
      return isValid;
    });
    
    console.log(`=== ROOM SCAN: Sending ${validRooms.length} valid rooms to UI ===`);
    callback(validRooms, { fetched: rooms.length, filtered: validRooms.length, lastRoomId: rooms[0]?.roomId, rawRooms: rooms });
  }, (err) => {
    console.error("Firebase Subscribe Error:", err);
  });
  
  return () => unsubscribe();
};

export const updatePlayerStats = async (
  playerId: string,
  playerName: string,
  isWin: boolean,
  correct: number,
  wrong: number,
  points: number,
  category: string
) => {
  notifyAchievements(playerId, isWin, points);
  if (!db) return;
  try {
    const playerRef = doc(db, 'users', playerId);
    const snap = await getDoc(playerRef);
    
    if (snap.exists()) {
      const data = snap.data() as PlayerStats;
      const newCategoryCounts = { ...data.categoryCounts };
      newCategoryCounts[category] = (newCategoryCounts[category] || 0) + 1;
      
      let mostPlayedCategory = '';
      let maxCount = 0;
      for (const [cat, count] of Object.entries(newCategoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostPlayedCategory = cat;
        }
      }

      const totalCorrect = (data.correctAnswers || 0) + correct;
      const totalWrong = (data.wrongAnswers || 0) + wrong;
      const totalQuestions = totalCorrect + totalWrong;
      const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      await setDoc(playerRef, {
        playerName,
        gamesPlayed: (data.gamesPlayed || 0) + 1,
        wins: (data.wins || 0) + (isWin ? 1 : 0),
        correctAnswers: totalCorrect,
        wrongAnswers: totalWrong,
        totalPoints: (data.totalPoints || 0) + points,
        categoryCounts: newCategoryCounts,
        mostPlayedCategory,
        successRate,
        ...(category === 'sentence_order' ? { sentencesCorrect: increment(correct) } : {}),
        lastUpdated: Date.now()
      }, { merge: true });
    } else {
      const successRate = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
      const newStats: PlayerStats = {
        playerId,
        playerName,
        gamesPlayed: 1,
        wins: isWin ? 1 : 0,
        correctAnswers: correct,
        wrongAnswers: wrong,
        totalPoints: points,
        successRate,
        categoryCounts: { [category]: 1 },
        mostPlayedCategory: category,
        lastUpdated: Date.now()
      };
      await setDoc(playerRef, newStats, { merge: true });
    }
  } catch(err) {
    console.error('Error updating player stats:', err);
  }
};

export const updateFishingStats = async (
  playerId: string,
  playerName: string,
  isWin: boolean,
  score: number,
  fishCaught: number
) => {
  notifyAchievements(playerId, isWin, 0);
  if (!db) return;
  try {
    const playerRef = doc(db, 'users', playerId);
    const snap = await getDoc(playerRef);
    
    if (snap.exists()) {
      const data = snap.data() as PlayerStats;
      await setDoc(playerRef, {
        fishingGamesPlayed: (data.fishingGamesPlayed || 0) + 1,
        fishingWins: (data.fishingWins || 0) + (isWin ? 1 : 0),
        fishingHighestScore: Math.max(data.fishingHighestScore || 0, score),
        fishingTotalFish: (data.fishingTotalFish || 0) + fishCaught,
        fishingTotalPoints: (data.fishingTotalPoints || 0) + score,
        lastUpdated: Date.now()
      }, { merge: true });
    } else {
      const newStats: PlayerStats = {
        playerId,
        playerName,
        gamesPlayed: 0,
        wins: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalPoints: 0,
        successRate: 0,
        categoryCounts: {},
        mostPlayedCategory: '',
        fishingGamesPlayed: 1,
        fishingWins: isWin ? 1 : 0,
        fishingHighestScore: score,
        fishingTotalFish: fishCaught,
        fishingTotalPoints: score,
        lastUpdated: Date.now()
      };
      await setDoc(playerRef, newStats, { merge: true });
    }
  } catch(err) {
    console.error('Error updating fishing stats:', err);
  }
};

export const updateHockeyStats = async (
  playerId: string,
  playerName: string,
  isWin: boolean,
  goalsScored: number,
  goalsConceded: number,
  pointsAwarded: number
) => {
  notifyAchievements(playerId, isWin, goalsScored);
  if (!db) return;
  try {
    const playerRef = doc(db, 'users', playerId);
    const snap = await getDoc(playerRef);
    
    const category = '🏒 هوكي';
    
    if (snap.exists()) {
      const data = snap.data() as PlayerStats;
      const currentStreak = isWin ? ((data.currentHockeyWinStreak || 0) + 1) : 0;
      const maxStreak = Math.max(currentStreak, data.hockeyWinStreak || 0);
      
      const newCategoryCounts = { ...data.categoryCounts };
      newCategoryCounts[category] = (newCategoryCounts[category] || 0) + 1;
      
      let mostPlayedCategory = '';
      let maxCount = 0;
      for (const [cat, count] of Object.entries(newCategoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostPlayedCategory = cat;
        }
      }

      await setDoc(playerRef, {
        hockeyGamesPlayed: (data.hockeyGamesPlayed || 0) + 1,
        hockeyWins: (data.hockeyWins || 0) + (isWin ? 1 : 0),
        hockeyLosses: (data.hockeyLosses || 0) + (isWin ? 0 : 1),
        hockeyGoalsScored: (data.hockeyGoalsScored || 0) + goalsScored,
        hockeyGoalsConceded: (data.hockeyGoalsConceded || 0) + goalsConceded,
        hockeyWinStreak: maxStreak,
        currentHockeyWinStreak: currentStreak,

        gamesPlayed: (data.gamesPlayed || 0) + 1,
        wins: (data.wins || 0) + (isWin ? 1 : 0),
        totalPoints: (data.totalPoints || 0) + pointsAwarded,
        categoryCounts: newCategoryCounts,
        mostPlayedCategory,
        lastUpdated: Date.now()
      }, { merge: true });
    } else {
      const newStats: PlayerStats = {
        playerId,
        playerName,
        gamesPlayed: 1,
        wins: isWin ? 1 : 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalPoints: pointsAwarded,
        successRate: 0,
        categoryCounts: { [category]: 1 },
        mostPlayedCategory: category,
        
        hockeyGamesPlayed: 1,
        hockeyWins: isWin ? 1 : 0,
        hockeyLosses: isWin ? 0 : 1,
        hockeyGoalsScored: goalsScored,
        hockeyGoalsConceded: goalsConceded,
        hockeyWinStreak: isWin ? 1 : 0,
        currentHockeyWinStreak: isWin ? 1 : 0,
        
        lastUpdated: Date.now()
      };
      await setDoc(playerRef, newStats, { merge: true });
    }
  } catch(err) {
    console.error('Error updating hockey stats:', err);
  }
};

import { getPlayerStats } from './achievements';

   export const syncLocalStatsToFirebase = async (playerId: string, playerName: string) => {
  if (!db) return;
  try {
    const playerRef = doc(db, 'users', playerId);
    const snap = await getDoc(playerRef);
    
    const localStats = getPlayerStats();
    
    if (snap.exists()) {
       const data = snap.data();
       let needsUpdate = false;
       const updateData: any = {};
       
       if (!data.shortId) {
          updateData.shortId = String(Math.floor(1000000 + Math.random() * 9000000));
          needsUpdate = true;
       }

       // True Bi-Directional Merge
       const mergedStats: any = { ...localStats };

       const keysToMerge = ['gamesPlayed', 'wins', 'totalGoals', 'winStreak', 'maxWinStreak', 'totalXp', 'sentencesCorrect', 'playTimeMinutes'] as const;

       // 1. We consider data.totalGoals as a fallback to penalty+hockey
       const fbTotalGoals = data.totalGoals || ((data.penaltyGoals || 0) + (data.hockeyGoalsScored || 0));
       const fbMaxWinStreak = data.maxWinStreak || Math.max(data.penaltyWinStreak || 0, data.hockeyWinStreak || 0);

       const firebaseValues: any = {
           gamesPlayed: data.gamesPlayed || 0,
           wins: data.wins || 0,
           totalGoals: fbTotalGoals,
           winStreak: data.penaltyWinStreak || data.hockeyWinStreak || data.winStreak || 0,
           maxWinStreak: fbMaxWinStreak,
           totalXp: data.totalXp || 0,
           sentencesCorrect: data.sentencesCorrect || 0,
           playTimeMinutes: data.playTimeMinutes || 0
       };

       for (const key of keysToMerge) {
           const localVal = localStats[key] || 0;
           const fbVal = firebaseValues[key] || 0;

           if (localVal > fbVal) {
               // Local is newer
               updateData[key] = localVal;
               mergedStats[key] = localVal;
               needsUpdate = true;
           } else if (fbVal > localVal) {
               // Firebase is newer
               mergedStats[key] = fbVal;
           }
       }

       // Ensure name matches if doing updates
       if (needsUpdate) {
           updateData.playerName = playerName;
           updateData.lastUpdated = Date.now();
           await setDoc(playerRef, updateData, { merge: true });
           console.log("Synced local stats UP to Firebase successfully.");
       }

       // Always save the best merged representation downward
       const { savePlayerStats } = await import('./achievements');
       savePlayerStats(mergedStats);
       
       // Sync unlocked achievements down
       if (data.unlockedAchievements) {
           const currentLocalUnl = JSON.parse(localStorage.getItem('know_unlocked_achievements') || '[]');
           const fbUnlIds = data.unlockedAchievements.map((a: any) => a.id);
           const mergedAch = Array.from(new Set([...currentLocalUnl, ...fbUnlIds]));
           localStorage.setItem('know_unlocked_achievements', JSON.stringify(mergedAch));
           
           // Notify UI listeners safely
           if (mergedAch.length > currentLocalUnl.length) {
               window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: [] }));
           }
       }
    } else {
       if (!localStats) return;
       const newStats: PlayerStats = {
         playerId,
         shortId: String(Math.floor(1000000 + Math.random() * 9000000)),
         playerName,
         gamesPlayed: localStats.gamesPlayed || 0,
         wins: localStats.wins || 0,
         correctAnswers: (localStats.wins || 0) * 5, 
         wrongAnswers: 0,
         totalPoints: ((localStats.wins || 0) * 10) + (((localStats.gamesPlayed || 0) - (localStats.wins || 0)) * 2),
         categoryCounts: {},
         mostPlayedCategory: 'عام',
         successRate: 50,
         lastUpdated: Date.now(),
         createdAt: Date.now()
       };
       await setDoc(playerRef, newStats, { merge: true });
       console.log("Created Firebase profile from local stats.");
    }
  } catch (err) {
    console.error("Error syncing local stats to Firebase:", err);
  }
};

export const subscribeToLeaderboard = (sortBy: 'wins' | 'totalPoints' | 'successRate' | 'tfCorrectAnswers' | 'tfHighScore' = 'totalPoints', callback: (players: PlayerStats[], stats?: { fetched: number }) => void) => {
  if (!db) {
    callback([], { fetched: 0 });
    return () => {};
  }
  
  console.log('[Leaderboard] Subscribing to leaderboard for sortBy:', sortBy);
  
  // Use orderBy and limit(50) to make it super fast. Single-field indexes are auto-created by Firestore.
  const q = query(collection(db, 'users'), orderBy(sortBy, 'desc'), limit(50));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const results: PlayerStats[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as PlayerStats;
      data.playerId = docSnap.id;
      if (!data.playerName || data.playerName.trim() === 'لاعب مجهول') {
         data.playerName = ''; // Leave it empty so components fall back correctly
      }
      // Ensure local sorting is robust against missing fields, though query should handle it
      results.push(data);
    });
    
    // Sort locally just in case (e.g. if some fields had NaN)
    results.sort((a, b) => {
      const valA = Number.isNaN(a[sortBy]) ? 0 : (a[sortBy] || 0);
      const valB = Number.isNaN(b[sortBy]) ? 0 : (b[sortBy] || 0);
      return (valB as number) - (valA as number);
    });
    
    callback(results, { fetched: snapshot.size });
  }, (err) => {
    console.error('[Leaderboard] Subscribe Error:', err);
  });
  
  return () => unsubscribe();
};

export const updateOnlinePresence = async (playerId: string) => {
  if (!db) return;
  try {
    const heartRef = doc(db, 'online_players', playerId);
    // Use Date.now() but rely on precise disconnect events as well
    await setDoc(heartRef, { lastActive: Date.now() }, { merge: true });
  } catch (err) {
    console.error('Error updating online presence:', err);
  }
};

export const removeOnlinePresence = async (playerId: string) => {
  if (!db) return;
  try {
    const heartRef = doc(db, 'online_players', playerId);
    await deleteDoc(heartRef); // Remove immediately on tab close
  } catch (err) {
    console.error('Error removing online presence:', err);
  }
};

export const subscribeToOnlineCount = (callback: (count: number) => void) => {
  if (!db) return () => {};
  
  const fetchCount = async () => {
    try {
      const activeRef = collection(db, 'online_players');
      // Count players active within the last 60 seconds
      const q = query(activeRef, where('lastActive', '>=', Date.now() - 60000));
      const snapshot = await getCountFromServer(q);
      callback(snapshot.data().count);
    } catch (err) {
      console.warn('Could not fetch online count', err);
    }
  };

  // Fetch immediately
  fetchCount();
  
  // Then poll every 30 seconds
  const interval = setInterval(fetchCount, 30000);
  
  return () => clearInterval(interval);
};

// ------------------------------------------------------------------
// Settings & Profile System
// ------------------------------------------------------------------
export const migrateUserData = async (oldId: string, newId: string) => {
  if (!db) return;
  try {
    const { getDoc, setDoc, deleteDoc } = await import('firebase/firestore');
    // migrate users collection
    const userRef = doc(db, 'users', oldId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
       const data = snap.data();
       data.playerId = newId;
       await setDoc(doc(db, 'users', newId), data);
       await deleteDoc(userRef);
    }
    
    // migrate online_players collection
    const onlineRef = doc(db, 'online_players', oldId);
    const onlineSnap = await getDoc(onlineRef);
    if (onlineSnap.exists()) {
       await setDoc(doc(db, 'online_players', newId), onlineSnap.data());
       await deleteDoc(onlineRef);
    }
    
    console.log('Migration completed from', oldId, 'to', newId);
  } catch(e) {
    console.error('Migration failed:', e);
  }
};

export const updateTFStats = async (playerId: string, correct: number, wrong: number, streak: number, score: number) => {
  if (!db) return;
  try {
    const userRef = doc(db, 'users', playerId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const currentStats = userSnap.data() as Partial<PlayerStats>;
    
    // Add XP globally
    let addedXp = score * 10;
    
    // Check achievements
    const achStats = getAchStats();
    const newUnlocked = doUpdateAchStats({
      tfRoundsPlayed: (achStats.tfRoundsPlayed || 0) + 1,
      tfCorrectAnswers: (achStats.tfCorrectAnswers || 0) + correct,
      tfBestStreak: Math.max(achStats.tfBestStreak || 0, streak),
      tfHighScore: Math.max(achStats.tfHighScore || 0, score),
      totalXp: (achStats.totalXp || 0) + addedXp
    });
    
    if (newUnlocked && newUnlocked.length > 0) {
      window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: newUnlocked }));
      addedXp += newUnlocked.length * 100;
      doUpdateAchStats({ totalXp: (achStats.totalXp || 0) + addedXp });
      
      const existing = currentStats.unlockedAchievements || [];
      const toApp = newUnlocked.map(a => ({ id: a.id, date: Date.now() }));
      await updateDoc(userRef, { unlockedAchievements: [...existing, ...toApp] });
    }

    const newStats: Partial<PlayerStats> = {
      tfRoundsPlayed: (currentStats.tfRoundsPlayed || 0) + 1,
      tfCorrectAnswers: (currentStats.tfCorrectAnswers || 0) + correct,
      tfWrongAnswers: (currentStats.tfWrongAnswers || 0) + wrong,
      tfBestStreak: Math.max(currentStats.tfBestStreak || 0, streak),
      tfHighScore: Math.max(currentStats.tfHighScore || 0, score),
      totalPoints: (currentStats.totalPoints || 0) + score, // Reward global points
      totalXp: increment(addedXp) as any
    };

    await updateDoc(userRef, newStats);
  } catch (err) {
    console.error('Error updating player TF stats:', err);
  }
};

export const updateUserProfile = async (playerId: string, profileData: { username?: string; playerName?: string; avatarUrl?: string; playerId?: string }) => {

  if (!db) return;
  try {
    const userRef = doc(db, 'users', playerId);
    
    const updatePayload: any = { lastActive: Date.now() };
    if (profileData.playerName) updatePayload.playerName = profileData.playerName;
    if (profileData.username) updatePayload.playerName = profileData.username; // fallback mapping
    if (profileData.avatarUrl) updatePayload.avatarUrl = profileData.avatarUrl;

    await setDoc(userRef, updatePayload, { merge: true });
  } catch (err) {
    console.error('Error updating profile:', err);
  }
};

export const searchUserById = async (playerId: string): Promise<any> => {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', playerId);
    const snap = await (await import('firebase/firestore')).getDoc(docRef);
    if (snap.exists()) {
       return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.error('Error searching user by ID:', err);
    return null;
  }
};

// ------------------------------------------------------------------
// Friends System
// ------------------------------------------------------------------

export const sendFriendRequest = async (fromId: string, fromName: string, toId: string): Promise<{ success: boolean; code: string; message: string }> => {
  console.log('[Friends] SEND_FRIEND_REQUEST_STARTED: from', fromId, 'to', toId);
  if (!db) {
    console.error('[Friends] SEND_FRIEND_REQUEST_ERROR: db not connected');
    return { success: false, code: 'db_error', message: 'قاعدة البيانات غير متصلة' };
  }
  try {
    // Prevent self-request
    if (fromId === toId) {
      console.warn('[Friends] SEND_FRIEND_REQUEST_ERROR: self request');
      return { success: false, code: 'self_request', message: 'لا يمكن إرسال طلب لنفسك' };
    }

    // Check if already friends or if request already exists in either direction
    const q1 = query(collection(db, 'friend_requests'), where('fromId', '==', fromId), where('toId', '==', toId));
    const q2 = query(collection(db, 'friend_requests'), where('fromId', '==', toId), where('toId', '==', fromId));
    const { getDocs } = await import('firebase/firestore');
    const [docs1, docs2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    if (!docs1.empty) {
        const data = docs1.docs[0].data();
        if (data.status === 'accepted') {
          console.warn('[Friends] SEND_FRIEND_REQUEST_ERROR: already friends');
          return { success: false, code: 'already_friends', message: '👥 هذا اللاعب موجود بالفعل ضمن أصدقائك' };
        }
        console.warn('[Friends] SEND_FRIEND_REQUEST_ERROR: already sent');
        return { success: false, code: 'already_sent', message: '⚠️ تم إرسال طلب سابقاً' };
    }
    if (!docs2.empty) {
        const data = docs2.docs[0].data();
        if (data.status === 'accepted') {
          console.warn('[Friends] SEND_FRIEND_REQUEST_ERROR: already friends');
          return { success: false, code: 'already_friends', message: '👥 هذا اللاعب موجود بالفعل ضمن أصدقائك' };
        }
        // The other person already sent a request to you! Maybe we accept it automatically or tell them they have a pending request.
        console.warn('[Friends] SEND_FRIEND_REQUEST_ERROR: pending receive');
        return { success: false, code: 'pending_receive', message: '⚠️ لديك طلب صداقة معلق من هذا اللاعب' };
    }

    const reqId = `${fromId}_${toId}`;
    const reqRef = doc(db, 'friend_requests', reqId);
    await setDoc(reqRef, {
      fromId,
      fromName: fromName || '',
      toId,
      status: 'pending',
      createdAt: Date.now()
    });
    
    console.log('[Friends] SEND_FRIEND_REQUEST_SUCCESS');
    return { success: true, code: 'sent', message: '✅ تم إرسال طلب الصداقة بنجاح' };
  } catch (err) {
    console.error('[Friends] SEND_FRIEND_REQUEST_ERROR:', err);
    return { success: false, code: 'error', message: 'حدث خطأ غير متوقع' };
  }
};

export const respondToFriendRequest = async (reqId: string, accept: boolean) => {
  if (!db) return;
  try {
    if (accept) {
      await updateDoc(doc(db, 'friend_requests', reqId), { status: 'accepted' });
    } else {
      await deleteDoc(doc(db, 'friend_requests', reqId));
    }
  } catch (err) {
    console.error('Error responding to friend request:', err);
  }
};

export const deleteFriend = async (friendshipReqId: string) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'friend_requests', friendshipReqId));
  } catch (err) {
    console.error('Error deleting friend:', err);
  }
};

export const subscribeToFriends = (playerId: string, callback: (friends: any[], pendingRequests: any[]) => void) => {
  if (!db) return () => {};
  
  // Listen to requests where this user is sender or receiver
  // Note: For complex queries we might need index, but OR queries or multiple listeners are easier without manual indexing.
  const fromQ = query(collection(db, 'friend_requests'), where('fromId', '==', playerId));
  const toQ = query(collection(db, 'friend_requests'), where('toId', '==', playerId));
  
  let docsMap = new Map<string, any>();
  const updateLists = () => {
    const list = Array.from(docsMap.values());
    const pending = list.filter(r => r.toId === playerId && r.status === 'pending');
    const friends = list.filter(r => r.status === 'accepted').map(r => {
      // transform to friend object
      const friendId = r.fromId === playerId ? r.toId : r.fromId;
      return { ...r, friendId };
    });
    
    // Update local achievement proxy for friend counts
    try {
      const newUnlocked = doUpdateAchStats({ friendsCount: friends.length });
      if (newUnlocked && newUnlocked.length > 0) {
        window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: newUnlocked }));
      }
    } catch(e) {}
    
    callback(friends, pending);
  };

  const unsubFrom = onSnapshot(fromQ, (snap) => {
    snap.docChanges().forEach(change => {
      if (change.type === 'removed') docsMap.delete(change.doc.id);
      else docsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
    });
    updateLists();
  });

  const unsubTo = onSnapshot(toQ, (snap) => {
    snap.docChanges().forEach(change => {
      if (change.type === 'removed') docsMap.delete(change.doc.id);
      else docsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
    });
    updateLists();
  });

  return () => { unsubFrom(); unsubTo(); };
};

// ------------------------------------------------------------------
// Invites System
// ------------------------------------------------------------------

export const sendGameInvite = async (fromId: string, fromName: string, toId: string, roomData: any) => {
  if (!db) return;
  try {
    const inviteId = `${fromId}_${Date.now()}`;
    await setDoc(doc(db, 'game_invites', inviteId), {
      fromId,
      fromName,
      toId,
      roomData,
      createdAt: Date.now()
    });
    // Auto delete invite after 60 seconds
    setTimeout(async () => {
      try { await deleteDoc(doc(db, 'game_invites', inviteId)); } catch (e) {}
    }, 60000);
  } catch (err) {
    console.error('Error sending game invite:', err);
  }
};

export const subscribeToGameInvites = (playerId: string, callback: (invites: any[]) => void) => {
  if (!db) return () => {};
  
  const q = query(
    collection(db, 'game_invites'),
    where('toId', '==', playerId)
  );

  return onSnapshot(q, (snap) => {
    const now = Date.now();
    const invites: any[] = [];
    snap.forEach(doc => {
      const data = doc.data();
      if ((now - data.createdAt) < 60000) {
        invites.push({ id: doc.id, ...data });
      } else {
        // Cleanup old invites on read just in case setTimeout missed it
        deleteDoc(doc.ref).catch(()=>{});
      }
    });
    callback(invites);
  });
};

export const deleteGameInvite = async (inviteId: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, 'game_invites', inviteId));
    } catch(err) {
        console.error('Error deleting game invite', err);
    }
};

