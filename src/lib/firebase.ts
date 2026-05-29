import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, off, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || (import.meta.env.VITE_FIREBASE_PROJECT_ID ? `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` : undefined),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!firebaseConfig.projectId;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getDatabase(app) : null;

export interface PublicRoom {
  roomId: string;
  hostName: string;
  category: string;
  playerCount: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

export const createPublicRoom = async (roomData: PublicRoom) => {
  if (!db) return;
  try {
    const roomRef = ref(db, `rooms/${roomData.roomId}`);
    await set(roomRef, roomData);
  } catch (err) {
    console.error("Firebase Create Room Error:", err);
  }
};

export const updatePublicRoom = async (roomId: string, updates: Partial<PublicRoom>) => {
  if (!db) return;
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
       await set(roomRef, { ...snapshot.val(), ...updates });
    }
  } catch (err) {
    console.error("Firebase Update Room Error:", err);
  }
};

export const deletePublicRoom = async (roomId: string) => {
  if (!db) return;
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    await remove(roomRef);
  } catch (err) {
    console.error("Firebase Delete Room Error:", err);
  }
};

export const subscribeToPublicRooms = (callback: (rooms: PublicRoom[]) => void) => {
  if (!db) {
    callback([]);
    return () => {};
  }
  const roomsRef = ref(db, 'rooms');
  onValue(roomsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const rooms: PublicRoom[] = Object.values(data);
      // Clean up old or empty rooms (optional, clean older than 24h)
      const now = Date.now();
      const validRooms = rooms.filter(r => (now - r.createdAt) < 24 * 60 * 60 * 1000);
      callback(validRooms);
    } else {
      callback([]);
    }
  }, (err) => {
    console.error("Firebase Subscribe Error:", err);
  });
  
  return () => off(roomsRef);
};
