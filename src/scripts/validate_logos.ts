import { LOGOS_DATA } from '../lib/logosData';

async function validate() {
  let valid = 0;
  let broken = 0;
  const brokenNames = [];

  const BATCH_SIZE = 20;
  for (let i = 0; i < LOGOS_DATA.length; i += BATCH_SIZE) {
    const batch = LOGOS_DATA.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (logo) => {
      try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${logo.url.split('/').pop()}.svg`, { method: 'HEAD' });
        if (res.ok) {
          valid++;
        } else {
          const resGet = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${logo.url.split('/').pop()}.svg`);
          if (resGet.ok) {
            valid++;
          } else {
            broken++;
            brokenNames.push(`${logo.name} (${logo.url}) (Status: ${resGet.status})`);
          }
        }
      } catch (e) {
        broken++;
        brokenNames.push(`${logo.name} (${logo.url}) (Error: ${e.message})`);
      }
    }));
  }

  console.log(`--- Logo Validation Report ---`);
  console.log(`Total Logos: ${LOGOS_DATA.length}`);
  console.log(`Valid: ${valid}`);
  console.log(`Broken: ${broken}`);
  console.log(`--- Broken Logos ---`);
  brokenNames.forEach(n => console.log(n));
}

validate();
