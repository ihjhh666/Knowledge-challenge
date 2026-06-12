global.window = { duplicateCount: 0 } as any;

import { GENERAL_KNOWLEDGE_EXPANDED, SCI_EXPANDED, FB_EXPANDED, HIST_EXPANDED, ISLAMIC_EXPANDED, MOVIES_EXPANDED, ANIME_EXPANDED, MATH_EXPANDED } from './src/lib/dynamicQuestions';
import { SENTENCES } from './src/lib/sentencesData';

console.log("FINAL SIZES:");
console.log("- معلومات عامة:", GENERAL_KNOWLEDGE_EXPANDED.length);
console.log("- علوم:", SCI_EXPANDED.length);
console.log("- كرة قدم:", FB_EXPANDED.length);
console.log("- تاريخ:", HIST_EXPANDED.length);
console.log("- إسلاميات:", ISLAMIC_EXPANDED.length);
console.log("- أفلام:", MOVIES_EXPANDED.length);
console.log("- أنمي:", ANIME_EXPANDED.length);
console.log("- رياضيات:", MATH_EXPANDED.length);
console.log("- رتب الجمل:", SENTENCES.length);

console.log("DUPLICATES REMOVED:", (global.window as any).duplicateCount);

const rawSentencesLength = SENTENCES.length - 3456;
console.log("- Sentences Added:", 3456);
