import fs from 'fs';
import path from 'path';

function createSvg(text: string, color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="100%" height="100%" fill="${color}" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="white">${text}</text>
  </svg>`;
}

const ASSETS = {
  football: [
    { id: 'messi', title: 'Messi', color: '#10b981' },
    { id: 'ronaldo', title: 'Ronaldo', color: '#ef4444' },
    { id: 'neymar', title: 'Neymar', color: '#f59e0b' },
    { id: 'mbappe', title: 'Mbappe', color: '#3b82f6' },
    { id: 'haaland', title: 'Haaland', color: '#8b5cf6' }
  ],
  anime: [
    { id: 'naruto', title: 'Naruto', color: '#f97316' },
    { id: 'goku', title: 'Goku', color: '#ef4444' },
    { id: 'luffy', title: 'Luffy', color: '#eab308' },
    { id: 'levi', title: 'Levi', color: '#64748b' },
    { id: 'zoro', title: 'Zoro', color: '#22c55e' }
  ],
  movies: [
    { id: 'titanic', title: 'Titanic', color: '#0ea5e9' },
    { id: 'avatar', title: 'Avatar', color: '#3b82f6' },
    { id: 'joker', title: 'Joker', color: '#10b981' },
    { id: 'batman', title: 'Batman', color: '#1e293b' },
    { id: 'inception', title: 'Inception', color: '#64748b' }
  ]
};

const base = path.join(process.cwd(), 'public');

for (const [category, items] of Object.entries(ASSETS)) {
  const dir = path.join(base, category);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const item of items) {
    fs.writeFileSync(path.join(dir, `${item.id}.svg`), createSvg(item.title, item.color));
    console.log(`Generated /public/${category}/${item.id}.svg`);
  }
}
