import fs from 'fs';
import path from 'path';

export function buildMegaFile(filename: string, list: string[], type: string = 'proverb', difficulty: number = 0) {
  const content = `import { ProverbData } from './types';\nexport const ${filename.toUpperCase().replace('.TS', '')}: ProverbData[] = [\n` + 
  list.map(item => {
    const [text, correct, w1, w2, w3] = item.split('|');
    return `  { text: "${text}", completions: { correct: "${correct}", wrong: ["${w1||'لا شيء'}","${w2||'أحد'}","${w3||'الناس'}"] }, type: '${type}', difficulty: ${difficulty} }`;
  }).join(',\n') + '\n];';
  
  fs.writeFileSync(path.join(__dirname, 'src/lib/proverbs', filename), content);
}
