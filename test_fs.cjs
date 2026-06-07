const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, getDocs, collection } = require('firebase/firestore');

const configStr = fs.readFileSync('./firebase-applet-config.json', 'utf-8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // default DB

async function main() {
   try {
     const snap = await getDocs(collection(db, 'rooms'));
     console.log(`(default) database rooms count: ${snap.size}`);
     snap.forEach(doc => {
        console.log(`- ${doc.id}:`, doc.data());
     });
   } catch (e) {
     console.error("Error reading default db:", e);
   }
   
   try {
     const db2 = getFirestore(app, "ai-studio-312513b5-9b52-4eac-b060-23f7c26e6de6");
     const snap2 = await getDocs(collection(db2, 'rooms'));
     console.log(`custom database rooms count: ${snap2.size}`);
     snap2.forEach(doc => {
        console.log(`- ${doc.id}:`, doc.data());
     });
   } catch (e) {
     console.error("Error reading custom db:", e);
   }
   process.exit(0);
}

main();
