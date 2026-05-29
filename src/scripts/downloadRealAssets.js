import fs from 'fs';
import path from 'path';
import https from 'https';

const REAL_IMAGES = {
  football: {
    'messi': 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
    'ronaldo': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
    'neymar': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg',
    'mbappe': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/2022_FIFA_World_Cup_France_4%E2%80%931_Australia_-_%287%29_%28cropped%29.jpg',
    'haaland': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Erling_Haaland_2023_%28cropped%29.jpg'
  },
  movies: {
    'titanic': 'https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png',
    'avatar': 'https://upload.wikimedia.org/wikipedia/en/b/b0/Avatar-Teaser-Poster.jpg',
    'joker': 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg',
    'batman': 'https://upload.wikimedia.org/wikipedia/en/f/f9/TheBatman-MainPoster.png',
    'inception': 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg'
  }
};

const base = path.join(process.cwd(), 'public');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
         resolve(); // skip silently
         return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => resolve());
    }).on('error', () => resolve());
  });
}

async function run() {
  for (const [cat, items] of Object.entries(REAL_IMAGES)) {
    const dir = path.join(base, cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    for (const [id, url] of Object.entries(items)) {
      const ext = url.split('.').pop();
      const dest = path.join(dir, `${id}.${ext}`);
      await download(url, dest);
      console.log(`Downloaded ${id}.${ext}`);
    }
  }
}

run();
