import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Checking DB users...");
  const snap = await getDocs(collection(db, "users"));
  const users = snap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log("Total users:", users.length);
  console.log("Users:", users);
}

test().catch(console.error);

