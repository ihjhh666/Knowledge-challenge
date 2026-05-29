import fs from 'fs';
import path from 'path';
import * as icons from 'simple-icons';

const BRANDS = [
  { id: 'apple', icon: 'siApple' },
  { id: 'google', icon: 'siGoogle' },
  { id: 'microsoft', icon: 'siMicrosoft' },
  { id: 'amazon', icon: 'siAmazon' },
  { id: 'tesla', icon: 'siTesla' },
  { id: 'spotify', icon: 'siSpotify' },
  { id: 'netflix', icon: 'siNetflix' },
  { id: 'pepsi', icon: 'siPepsi' },
  { id: 'cocacola', icon: 'siCocacola' },
  { id: 'bmw', icon: 'siBmw' },
  { id: 'mercedes', icon: 'siMercedes' },
  { id: 'toyota', icon: 'siToyota' }
];

const dir = path.join(process.cwd(), 'public', 'logos');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

for (const brand of BRANDS) {
  const icon = (icons as any)[brand.icon];
  if (icon) {
    const dest = path.join(dir, `${brand.id}.svg`);
    // Create an SVG with color filling
    let svgStr = icon.svg;
    // Replace <svg> with colored SVG
    svgStr = svgStr.replace('<svg ', `<svg fill="#${icon.hex}" `);
    fs.writeFileSync(dest, svgStr);
    console.log(`Generated ${brand.id}.svg`);
  } else {
    console.log(`Icon not found: ${brand.icon}`);
  }
}
