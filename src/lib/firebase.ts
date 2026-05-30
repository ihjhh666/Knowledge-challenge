import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!firebaseConfig.projectId;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;

export interface PublicRoom {
  roomId: string;
  hostName: string;
  category: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  roomVisibility: 'public' | 'private' | 'link' | 'password';
}

export const createPublicRoom = async (roomData: PublicRoom) => {
  if (!db) return;
  try {
    const roomRef = doc(db, 'rooms', roomData.roomId);
    await setDoc(roomRef, roomData);
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
       await setDoc(roomRef, { ...snapshot.data(), ...updates }, { merge: true });
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
  const roomsRef = collection(db, 'rooms');
  // Subscribe to all rooms, filter locally like before (or we can use query)
  const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
    const rooms: PublicRoom[] = [];
    snapshot.forEach(doc => {
      rooms.push(doc.data() as PublicRoom);
    });
    
    // Clean up old or empty rooms (older than 24h)
    const now = Date.now();
    const validRooms = rooms.filter(r => (now - r.createdAt) < 24 * 60 * 60 * 1000 && r.status !== 'finished');
    callback(validRooms);
  }, (err) => {
    console.error("Firebase Subscribe Error:", err);
  });
  
  return () => unsubscribe();
};

