import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, getDoc, deleteDoc, onSnapshot, collection, query, where, orderBy, limit, increment } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

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
          appId: cleanValue(parsed.appId)
        };
      }
    }
  } catch (e) {
    console.error("Error parsing custom firebase config", e);
  }
  
  console.log("Firebase config loaded from env variables");
  return {
    apiKey: cleanValue(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanValue(import.meta.env.VITE_FIREBASE_APP_ID)
  };
};

const firebaseConfig = getFirebaseConfig();

const isFirebaseConfigured = !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

if (!isFirebaseConfigured) {
   console.warn("Firebase is NOT configured! Missing projectId or apiKey.", firebaseConfig);
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User };

export interface PublicRoom {
  roomId: string;
  hostName: string;
  category: string;
  gameMode?: 'quiz' | 'fishing' | 'penalty' | 'domino' | 'hockey' | 'king';
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
  unlockedAchievements?: { id: string; date: number }[];
  createdAt?: number;
}

import { updateStats as doUpdateAchStats, getPlayerStats as getAchStats } from './achievements';

const notifyAchievements = async (playerId: string, isWin: boolean, goals: number = 0) => {
  try {
    const current = getAchStats();
    let newStreak = isWin ? current.winStreak + 1 : 0;
    
    // Check if reaching first place - a bit heavy to do here, but we can evaluate it if we want.
    // For now we omit checking first place strictly here.

    const newUnlocked = doUpdateAchStats({
      gamesPlayed: current.gamesPlayed + 1,
      wins: current.wins + (isWin ? 1 : 0),
      totalGoals: current.totalGoals + goals,
      winStreak: newStreak
    });

    if (newUnlocked && newUnlocked.length > 0) {
      window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: newUnlocked }));
      if (playerId && db) {
        const docRef = doc(db, 'users', playerId);
        const achievementsToAdd = newUnlocked.map(a => ({ id: a.id, date: Date.now() }));
        try {
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            const existing = data.unlockedAchievements || [];
            await setDoc(docRef, { unlockedAchievements: [...existing, ...achievementsToAdd] }, { merge: true });
          }
        } catch(e) {
          console.error("Failed to save achievements to Firestore", e);
        }
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
  const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
    const rooms: PublicRoom[] = [];
    snapshot.forEach(doc => {
      rooms.push({ ...doc.data(), roomId: doc.id } as PublicRoom);
    });
    console.log("Firestore onSnapshot received", rooms.length, "total rooms.");
    
    const validRooms = rooms.filter(r => {
      const isDead = r.status === 'finished' || r.playerCount <= 0 || r.status === 'playing';
      const isFull = r.playerCount >= r.maxPlayers;
      
      // Hide rooms that are finished, playing, empty, or full.
      return !isDead && !isFull;
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
  notifyAchievements(playerId, isWin, 0);
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

export const getLeaderboard = async (sortBy: 'wins' | 'totalPoints' | 'successRate' = 'totalPoints') => {
  if (!db) return [];
  try {
    console.log('[Leaderboard] Fetching leaderboard for sortBy:', sortBy);
    
    // Fetch all users to avoid Firestore's behavior of omitting documents that lack the sort field
    const q = query(collection(db, 'users'));
    const { getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(q);
    
    const results: PlayerStats[] = [];
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as PlayerStats;
      data.playerId = docSnap.id; // Force ID to match document
      results.push(data);
    });
    
    // Default the value of the missing fields to 0 and sort locally
    results.sort((a, b) => {
      const valA = a[sortBy] || 0;
      const valB = b[sortBy] || 0;
      return (valB as number) - (valA as number);
    });
    
    // Return top 50 valid players
    const top50 = results.filter(p => !!p.playerName).slice(0, 50);
    
    console.log(`[Leaderboard] Successfully fetched and sorted ${results.length} players using sortBy ${sortBy}. Returning top ${top50.length}.`);
    return top50;
  } catch (err) {
    console.error('[Leaderboard] Error getting leaderboard:', err);
    return [];
  }
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
  const activeRef = collection(db, 'online_players');
  const unsubscribe = onSnapshot(activeRef, (snapshot) => {
    const now = Date.now();
    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      // Increased threshold to 60 seconds to tolerate clock skew and network delays
      if (data.lastActive && (now - data.lastActive) < 60000) {
        count++;
      }
    });
    callback(count);
  });
  return unsubscribe;
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

export const updateUserProfile = async (playerId: string, profileData: { username?: string; avatarUrl?: string; playerId?: string }) => {

  if (!db) return;
  try {
    const userRef = doc(db, 'users', playerId);
    await setDoc(userRef, { ...profileData, lastActive: Date.now() }, { merge: true });
  } catch (err) {
    console.error('Error updating profile:', err);
  }
};

export const searchUserById = async (playerId: string) => {
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

export const sendFriendRequest = async (fromId: string, fromName: string, toId: string) => {
  if (!db) return;
  try {
    // Prevent self-request
    if (fromId === toId) return;

    // Check if already friends or if request already exists
    const q = query(collection(db, 'friend_requests'), where('fromId', '==', fromId), where('toId', '==', toId));
    const docs = await (await import('firebase/firestore')).getDocs(q);
    if (!docs.empty) return; // already sent

    const reqId = `${fromId}_${toId}`;
    const reqRef = doc(db, 'friend_requests', reqId);
    await setDoc(reqRef, {
      fromId,
      fromName,
      toId,
      status: 'pending',
      createdAt: Date.now()
    });
  } catch (err) {
    console.error('Error sending friend request:', err);
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

