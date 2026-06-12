import * as fs from 'fs';

const existing = fs.readFileSync('src/lib/tfData.ts', 'utf-8');

let newMath = `\n// Generated Math Questions for massive expansion\nconst rawMathData = \`\n`;

for(let i=2; i<=12; i++) {
  for(let j=2; j<=12; j++) {
    const correct = i * j;
    newMath += `easy|هل حاصل ضرب ${i} في ${j} هو ${correct}؟|true\n`;
    const wrong = correct + Math.floor(Math.random() * 5 + 1);
    newMath += `medium|هل حاصل ضرب ${i} في ${j} هو ${wrong}؟|false\n`;
  }
}

for(let i=11; i<=30; i++) {
  const correct = i * i;
  newMath += `medium|هل مربع العدد ${i} هو ${correct}؟|true\n`;
  const wrong = correct - Math.floor(Math.random() * 10 + 1);
  newMath += `hard|هل مربع العدد ${i} هو ${wrong}؟|false\n`;
}

newMath += `\`;\n`;

// Insert the newMath right before `export const tfQuestions`
const updated = existing.replace('export const tfQuestions: TFQuestion[] = [', newMath + '\nexport const tfQuestions: TFQuestion[] = [\n  ...parseRawData(rawMathData),');

fs.writeFileSync('src/lib/tfData.ts', updated);
