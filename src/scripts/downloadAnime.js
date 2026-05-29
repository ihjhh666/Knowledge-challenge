import fs from 'fs';
import path from 'path';
import https from 'https';

const ANIME = {
  'naruto': 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  'goku': 'https://upload.wikimedia.org/wikipedia/en/c/c8/Goku_in_Dragon_Ball_Super.png',
  'luffy': 'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Art%29.jpg',
  'levi': 'https://upload.wikimedia.org/wikipedia/en/c/c2/Levi_Ackerman_Anime.png',
  'zoro': 'https://upload.wikimedia.org/wikipedia/en/a/a4/Roronoa_Zoro.jpg'
};

const dir = path.join(process.cwd(), 'public', 'anime');

function download(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) { return resolve(); }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => resolve());
    }).on('error', () => resolve());
  });
}

async function run() {
  for (const [id, url] of Object.entries(ANIME)) {
    const ext = url.split('.').pop();
    const dest = path.join(dir, `${id}.${ext}`);
    await download(url, dest);
    console.log(`Downloaded anime ${id}.${ext}`);
  }
}
run();
