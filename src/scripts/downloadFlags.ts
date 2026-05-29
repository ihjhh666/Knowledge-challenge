import fs from 'fs';
import path from 'path';
import https from 'https';

// We import the same data used in the game to guarantee all flags are downloaded.
import { DYNAMIC_COUNTRIES } from '../lib/dynamicSets';

const dir = path.join(process.cwd(), 'public', 'flags');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download(url: string, dest: string) {
  return new Promise<void>((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
         reject(new Error(`Status: ${res.statusCode}`));
         return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => resolve());
    }).on('error', reject);
  });
}

async function main() {
  for (const c of DYNAMIC_COUNTRIES) {
    try {
      await download(`https://flagcdn.com/w320/${c.code.toLowerCase()}.png`, path.join(dir, `${c.code.toLowerCase()}.png`));
      console.log(`Downloaded ${c.name} flag`);
    } catch (e) {
      console.log(`Failed ${c.code}: ${e}`);
    }
  }
}
main();
