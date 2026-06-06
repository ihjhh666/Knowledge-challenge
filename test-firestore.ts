import 'dotenv/config';
import { db, getLeaderboard } from './src/lib/firebase';

async function test() {
  const lb = await getLeaderboard('wins');
  console.log(lb);
}
test();
