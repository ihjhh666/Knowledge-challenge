import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, onSnapshot, collection, query, where, orderBy, limit, increment } from 'firebase/firestore';
import * as config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  firestoreDatabaseId: config.firestoreDatabaseId
};

const isFirebaseConfigured = !!firebaseConfig.projectId;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null;

export interface PublicRoom {
  roomId: string;
  hostName: string;
  category: string;
  gameMode?: 'quiz' | 'fishing';
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
  gamesPlayed: number;
  wins: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalPoints: number;
  successRate: number;
  categoryCounts: Record<string, number>;
  mostPlayedCategory: string;
  lastUpdated: number;
  // Fishing Stats
  fishingGamesPlayed?: number;
  fishingWins?: number;
  fishingHighestScore?: number;
  fishingTotalFish?: number;
  fishingTotalPoints?: number;
}

export const createPublicRoom = async (roomData: PublicRoom) => {
  if (!db) return;
  console.log("Saving room to Firestore 'rooms' collection:", roomData.roomId);
  try {
    const roomRef = doc(db, 'rooms', roomData.roomId);
    await setDoc(roomRef, { ...roomData, lastActiveAt: Date.now() });
    console.log("Successfully saved room to Firestore:", roomData.roomId);
  } catch (err) {
    console.error("Firebase Create Room Error:", err);
  }
};

export const updatePublicRoom = async (roomId: string, updates: Partial<PublicRoom>) => {
  if (!db) return;
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const snapshot = await getDoc(roomRef);
    if (snapshot.exists()) {
       await setDoc(roomRef, { ...snapshot.data(), ...updates, lastActiveAt: Date.now() }, { merge: true });
    }
  } catch (err) {
    console.error("Firebase Update Room Error:", err);
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

export const subscribeToPublicRooms = (callback: (rooms: PublicRoom[]) => void) => {
  if (!db) {
    callback([]);
    return () => {};
  }
  console.log("Subscribing to Firestore 'rooms' collection...");
  const roomsRef = collection(db, 'rooms');
  // Subscribe to all rooms, filter locally like before (or we can use query)
  const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
    const rooms: PublicRoom[] = [];
    snapshot.forEach(doc => {
      rooms.push({ ...doc.data(), roomId: doc.id } as PublicRoom);
    });
    console.log("Firestore onSnapshot received", rooms.length, "total rooms.");
    
    // Clean up old or empty rooms
    const now = Date.now();
    const validRooms = rooms.filter(r => {
      // Room is considered dead if:
      // 1. It is marked as finished
      // 2. Play count is 0 or less
      // 3. It hasn't been active for 10 minutes, or it's older than 8 hours
      const inactiveMs = now - (r.lastActiveAt || r.createdAt);
      const isDead = r.status === 'finished' 
        || r.playerCount <= 0 
        || (now - r.createdAt) > 8 * 60 * 60 * 1000
        || inactiveMs > 10 * 60 * 1000;
      
      if (isDead) {
        // Aggressively delete dead rooms to keep Firestore clean (idempotent operation)
        deletePublicRoom(r.roomId);
        return false;
      }
      return true;
    });
    
    console.log("After local filter, sending", validRooms.length, "valid rooms to UI.");
    callback(validRooms);
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
      await setDoc(playerRef, newStats);
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
      await setDoc(playerRef, newStats);
    }
  } catch(err) {
    console.error('Error updating fishing stats:', err);
  }
};

export const getLeaderboard = async (sortBy: 'wins' | 'totalPoints' | 'successRate' = 'totalPoints') => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'users'),
      orderBy(sortBy, 'desc'),
      limit(50)
    );
    // Since Firebase sometimes complains about lacking composite index, if we don't do compound queries, single field orderby works!
    // But we need to use getDocs. 
    const { getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(q);
    const results: PlayerStats[] = [];
    snapshot.forEach(docSnap => {
      results.push(docSnap.data() as PlayerStats);
    });
    return results;
  } catch (err) {
    console.error('Error getting leaderboard:', err);
    return [];
  }
};

export const updateOnlinePresence = async (playerId: string) => {
  if (!db) return;
  try {
    const heartRef = doc(db, 'online_players', playerId);
    await setDoc(heartRef, { lastActive: Date.now() }, { merge: true });
  } catch (err) {
    console.error('Error updating online presence:', err);
  }
};

export const subscribeToOnlineCount = (callback: (count: number) => void) => {
  if (!db) return () => {};
  const activeRef = collection(db, 'online_players');
  // Simple listener that fetches all docs in online_players
  // and filters locally. It's OK for our scale. For large scale, we should use a backend job.
  const unsubscribe = onSnapshot(activeRef, (snapshot) => {
    const now = Date.now();
    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      // Considered online if active in the last 15 seconds
      if (data.lastActive && (now - data.lastActive) < 15000) {
        count++;
      }
    });
    callback(count);
  });
  return unsubscribe;
};

