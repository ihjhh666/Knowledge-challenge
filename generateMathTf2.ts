import * as fs from 'fs';

const existing = fs.readFileSync('src/lib/tfData.ts', 'utf-8');

let newMath = `\n// Generated Extra Math Questions for massive expansion\nconst rawExtraMathData = \`\n`;

for(let i=15; i<=60; i++) {
  for(let j=15; j<=60; j++) {
    const correct = i + j;
    newMath += `easy|هل حاصل جمع ${i} زائد ${j} هو ${correct}؟|true\n`;
    const wrong = correct + Math.floor(Math.random() * 5 + 1);
    newMath += `medium|هل حاصل جمع ${i} زائد ${j} هو ${wrong}؟|false\n`;
    
    // adding some more to hit thousands
    const subC = i - j;
    newMath += `medium|هل حاصل طرح ${j} من ${i} هو ${subC}؟|true\n`;
  }
}

newMath += `\`;\n`;

// Insert the newMath right before `export const tfQuestions`
const updated = existing.replace('export const tfQuestions: TFQuestion[] = [', newMath + '\nexport const tfQuestions: TFQuestion[] = [\n  ...parseRawData(rawExtraMathData),');

fs.writeFileSync('src/lib/tfData.ts', updated);
