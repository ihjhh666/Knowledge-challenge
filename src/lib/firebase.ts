import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
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
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  lastActiveAt?: number;
  roomVisibility: 'public' | 'private' | 'link' | 'password';
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

