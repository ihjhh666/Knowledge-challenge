import { getDocs, collection, query, writeBatch, doc } from 'firebase/firestore';
import { db } from './src/lib/firebase';

async function fixUnknownPlayers() {
  if (!db) {
    console.error("DB not initialized");
    return;
  }
  try {
    const usersSnapshot = await getDocs(query(collection(db, 'users')));
    
    let unknownCount = 0;
    let fixedCount = 0;
    
    const batch = writeBatch(db);
    let batchOps = 0;

    // Helper to process
    const processDocs = (snapshot) => {
      for (const d of snapshot.docs) {
        const data = d.data();
        if (data.playerName === 'لاعب مجهول' || data.playerName === 'Unknown') {
          unknownCount++;
          
          let newName = '';
          if (data.username && data.username !== 'لاعب مجهول' && data.username !== 'Unknown') {
            newName = data.username;
          }

          batch.update(d.ref, { playerName: newName });
          fixedCount++;
          batchOps++;
          console.log(`Fixing ${d.ref.path} ${d.id}: 'لاعب مجهول' -> '${newName}'`);
        }
      }
    };

    processDocs(usersSnapshot);
    
    console.log(`Snapshot lengths: Users: ${usersSnapshot.docs.length}`);
    
    if (batchOps > 0) {
        await batch.commit();
    }
    
    console.log(`\n=============================`);
    console.log(`Found ${unknownCount} players with 'لاعب مجهول' or missing name.`);
    console.log(`Fixed ${fixedCount} players by restoring their username.`);
    console.log(`Players remaining unknown (no valid username): ${unknownCount - fixedCount}`);
    console.log(`=============================\n`);

  } catch (err) {
    console.error("Error fixing database:", err);
  }
  process.exit(0);
}

fixUnknownPlayers();
